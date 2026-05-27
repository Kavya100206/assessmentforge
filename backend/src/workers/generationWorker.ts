import { Worker, Job } from 'bullmq';
import Groq from 'groq-sdk';
import fs from 'fs/promises';
import path from 'path';
import { env } from '../config/env';
import { getRedis } from '../config/redis';
import { GENERATION_QUEUE_NAME, GenerationJobData } from '../queues/generationQueue';
import { Assignment, AssignmentDoc, GeneratedOutput, Difficulty } from '../models/Assignment';
import { buildUserPrompt, SYSTEM_PROMPT } from '../prompts/questionPaper';
import { getIO } from '../sockets/io';

let worker: Worker<GenerationJobData> | null = null;

export function startGenerationWorker(): Worker<GenerationJobData> {
  if (worker) return worker;

  worker = new Worker<GenerationJobData>(
    GENERATION_QUEUE_NAME,
    async (job) => processJob(job),
    {
      connection: getRedis(),
      concurrency: 2,
    }
  );

  worker.on('failed', (job, err) => {
    const id = job?.data?.assignmentId;
    console.error(`[worker] job failed (${id ?? 'unknown'}):`, err.message);
    if (id) {
      emit(id, 'generation:error', { assignmentId: id, error: err.message });
      broadcast('assignment:updated', { id, status: 'failed' });
    }
  });

  worker.on('completed', (job) => {
    console.log(`[worker] job completed: ${job.data.assignmentId}`);
  });

  worker.on('error', (err) => {
    console.error('[worker] error:', err.message);
  });

  console.log('[worker] generation worker started');
  return worker;
}

async function processJob(job: Job<GenerationJobData>): Promise<void> {
  const { assignmentId } = job.data;
  console.log(`[worker] processing assignment ${assignmentId}`);

  emit(assignmentId, 'generation:progress', {
    assignmentId,
    stage: 'starting',
    progress: 5,
  });

  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) throw new Error(`assignment ${assignmentId} not found`);

  await assignment.updateOne({ status: 'processing' });

  emit(assignmentId, 'generation:progress', {
    assignmentId,
    stage: 'reading_source',
    progress: 15,
  });

  let sourceText: string | undefined;
  if (assignment.fileUrl) {
    sourceText = await safeReadSource(assignment.fileUrl);
  }

  emit(assignmentId, 'generation:progress', {
    assignmentId,
    stage: 'calling_llm',
    progress: 35,
  });

  let parsed: GeneratedOutput;
  try {
    parsed = await callLLM({ assignment, sourceText });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'LLM call failed';
    console.warn('[worker] first LLM attempt failed, retrying:', msg);
    emit(assignmentId, 'generation:progress', {
      assignmentId,
      stage: 'retrying_llm',
      progress: 50,
    });
    parsed = await callLLM({ assignment, sourceText });
  }

  emit(assignmentId, 'generation:progress', {
    assignmentId,
    stage: 'storing',
    progress: 85,
  });

  await Assignment.updateOne(
    { _id: assignmentId },
    { $set: { generatedOutput: parsed, status: 'completed' } }
  );

  emit(assignmentId, 'generation:complete', {
    assignmentId,
    output: parsed,
  });
  broadcast('assignment:updated', { id: assignmentId, status: 'completed' });
}

interface CallInput {
  assignment: AssignmentDoc;
  sourceText?: string;
}

async function callLLM({ assignment, sourceText }: CallInput): Promise<GeneratedOutput> {
  if (!env.groqApiKey) {
    throw new Error('GROQ_API_KEY is not set');
  }

  const groq = new Groq({ apiKey: env.groqApiKey });
  const userPrompt = buildUserPrompt({ assignment, sourceText });

  const completion = await groq.chat.completions.create({
    model: env.groqModel,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.4,
    response_format: { type: 'json_object' },
  });

  const raw = completion.choices[0]?.message?.content ?? '';
  return validateOutput(raw);
}

function validateOutput(raw: string): GeneratedOutput {
  let obj: unknown;
  try {
    obj = JSON.parse(raw);
  } catch {
    throw new Error('LLM response was not valid JSON');
  }
  if (typeof obj !== 'object' || obj === null) {
    throw new Error('LLM response was not an object');
  }
  const o = obj as Record<string, unknown>;

  const required: (keyof GeneratedOutput)[] = [
    'schoolName',
    'subject',
    'className',
    'timeAllowed',
    'maxMarks',
    'sections',
    'answerKey',
  ];
  for (const key of required) {
    if (!(key in o)) throw new Error(`LLM response missing field: ${key}`);
  }
  if (!Array.isArray(o.sections) || o.sections.length === 0) {
    throw new Error('LLM response: sections must be a non-empty array');
  }
  if (!Array.isArray(o.answerKey)) {
    throw new Error('LLM response: answerKey must be an array');
  }
  for (const [i, sec] of (o.sections as unknown[]).entries()) {
    if (typeof sec !== 'object' || sec === null) {
      throw new Error(`sections[${i}] not an object`);
    }
    const s = sec as Record<string, unknown>;
    if (!Array.isArray(s.questions)) {
      throw new Error(`sections[${i}].questions must be an array`);
    }
    for (const [j, q] of (s.questions as unknown[]).entries()) {
      const qq = q as Record<string, unknown>;
      const diff = qq.difficulty as Difficulty;
      if (diff !== 'Easy' && diff !== 'Moderate' && diff !== 'Challenging') {
        throw new Error(`sections[${i}].questions[${j}].difficulty invalid: ${String(diff)}`);
      }
    }
  }

  return obj as GeneratedOutput;
}

async function safeReadSource(fileUrl: string): Promise<string | undefined> {
  try {
    const filePath = path.join(
      process.cwd(),
      env.uploadsDir,
      path.basename(fileUrl)
    );
    const ext = path.extname(filePath).toLowerCase();
    const buf = await fs.readFile(filePath);

    if (ext === '.pdf') {
      const { PDFParse } = await import('pdf-parse');
      const parser = new PDFParse({ data: new Uint8Array(buf) });
      try {
        const result = await parser.getText();
        return result.text;
      } finally {
        await parser.destroy();
      }
    }
    if (ext === '.txt' || ext === '.md') {
      return buf.toString('utf-8');
    }
    // Unsupported (e.g. image) — skip extraction, LLM generates from title + instructions
    return undefined;
  } catch (err) {
    console.warn('[worker] could not read source file:', (err as Error).message);
    return undefined;
  }
}

function emit(assignmentId: string, event: string, payload: unknown) {
  try {
    getIO().to(assignmentId).emit(event, payload);
  } catch {
    // socket not initialized (worker running in standalone mode) — skip
  }
}

function broadcast(event: string, payload: unknown) {
  try {
    getIO().emit(event, payload);
  } catch {
    // socket not initialized — skip
  }
}

// Allow running standalone: `npm run worker`
if (require.main === module) {
  import('../config/mongo').then(({ connectMongo }) => {
    connectMongo().catch((err) => {
      console.error('[worker:standalone] mongo connect failed:', err.message);
      process.exit(1);
    });
  });
  startGenerationWorker();
}
