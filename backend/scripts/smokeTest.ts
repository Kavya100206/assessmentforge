/* eslint-disable no-console */
import { io as ioClient } from 'socket.io-client';

const API = process.env.API_URL ?? 'http://localhost:8000';

const events: { event: string; payload: unknown; t: number }[] = [];

async function main() {
  console.log(`[smoke] using API at ${API}`);

  // 1. health
  const health = await fetch(`${API}/health`).then((r) => r.json());
  console.log('[smoke] /health =', health);
  if (health.mongo !== 'connected' || health.redis !== 'connected') {
    throw new Error('mongo or redis not connected — fix backend/.env first');
  }

  // 2. open socket BEFORE POST so we don't miss early events
  const socket = ioClient(API, { transports: ['websocket'] });
  await new Promise<void>((resolve, reject) => {
    socket.once('connect', () => {
      console.log('[smoke] socket connected:', socket.id);
      resolve();
    });
    socket.once('connect_error', reject);
  });

  socket.onAny((event, payload) => {
    events.push({ event, payload, t: Date.now() });
    if (event === 'generation:progress') {
      const p = payload as { stage?: string; progress?: number };
      console.log(`[smoke] event: ${event} stage=${p.stage} progress=${p.progress}`);
    } else {
      console.log(`[smoke] event: ${event}`);
    }
  });

  // 3. POST
  const due = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const payload = {
    title: 'Photosynthesis — Class 10 Biology Practice Paper',
    dueDate: due,
    questionTypes: [
      { type: 'Multiple Choice Questions', count: 3, marks: 1 },
      { type: 'Short Answer Questions', count: 2, marks: 2 },
    ],
    additionalInfo: 'Topic: Photosynthesis. Class 10 CBSE. Keep questions concise.',
  };

  const created = await fetch(`${API}/api/assignments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).then((r) => r.json());

  if (!created.assignment?._id) {
    throw new Error('POST /api/assignments did not return assignment._id: ' + JSON.stringify(created));
  }
  const id: string = created.assignment._id;
  console.log(`[smoke] POST created assignment ${id}, status=${created.assignment.status}`);

  // 4. join the room AFTER we have the id
  socket.emit('join', id);

  // 5. wait for completion or error
  const result = await new Promise<{ ok: boolean; reason?: string }>((resolve) => {
    const timeout = setTimeout(() => {
      resolve({ ok: false, reason: 'timeout after 90s' });
    }, 90_000);

    socket.on('generation:complete', () => {
      clearTimeout(timeout);
      resolve({ ok: true });
    });
    socket.on('generation:error', (p: { error?: string }) => {
      clearTimeout(timeout);
      resolve({ ok: false, reason: p?.error ?? 'generation:error' });
    });
  });

  if (!result.ok) {
    console.error(`[smoke] FAILED: ${result.reason}`);
    console.error('[smoke] events captured:', events.map((e) => e.event));
    socket.close();
    process.exit(1);
  }

  // 6. verify stored
  const fetched = await fetch(`${API}/api/assignments/${id}`).then((r) => r.json());
  const a = fetched.assignment;
  console.log(`[smoke] stored status=${a.status}, hasOutput=${Boolean(a.generatedOutput)}`);
  if (a.status !== 'completed' || !a.generatedOutput) {
    throw new Error('assignment was not completed in Mongo');
  }
  const out = a.generatedOutput;
  console.log(
    `[smoke] output: subject=${out.subject} class=${out.className} sections=${out.sections.length} maxMarks=${out.maxMarks} answerKey=${out.answerKey.length}`
  );
  console.log(`[smoke] first question:`, out.sections[0]?.questions[0]);

  // 7. verify list endpoint
  const list = await fetch(`${API}/api/assignments`).then((r) => r.json());
  const inList = list.assignments?.find((x: { _id: string }) => x._id === id);
  console.log(`[smoke] GET /api/assignments returned ${list.assignments?.length} items, includes new one: ${Boolean(inList)}`);

  // 8. cleanup — delete it
  const del = await fetch(`${API}/api/assignments/${id}`, { method: 'DELETE' }).then((r) => r.json());
  console.log(`[smoke] DELETE /api/assignments/${id} =>`, del);

  // event summary
  const eventTypes = events.reduce<Record<string, number>>((acc, e) => {
    acc[e.event] = (acc[e.event] ?? 0) + 1;
    return acc;
  }, {});
  console.log('[smoke] event summary:', eventTypes);

  console.log('[smoke] ✅ ALL CHECKS PASSED');
  socket.close();
  process.exit(0);
}

main().catch((err) => {
  console.error('[smoke] error:', err);
  process.exit(1);
});
