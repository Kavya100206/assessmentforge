import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Assignment, QuestionTypeSpec } from '../models/Assignment';
import { getGenerationQueue } from '../queues/generationQueue';
import { env } from '../config/env';
import { getIO } from '../sockets/io';

const router = Router();

// --- file upload (multer, disk storage under uploads/) ---
const uploadsRoot = path.resolve(process.cwd(), env.uploadsDir);
if (!fs.existsSync(uploadsRoot)) fs.mkdirSync(uploadsRoot, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsRoot),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const safe = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    cb(null, safe);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

// --- helpers ---
function parseQuestionTypes(raw: unknown): QuestionTypeSpec[] {
  let arr: unknown = raw;
  if (typeof raw === 'string') {
    try {
      arr = JSON.parse(raw);
    } catch {
      throw new HttpError(400, 'questionTypes must be a JSON array');
    }
  }
  if (!Array.isArray(arr) || arr.length === 0) {
    throw new HttpError(400, 'questionTypes must be a non-empty array');
  }
  return arr.map((q, i): QuestionTypeSpec => {
    if (typeof q !== 'object' || q === null) {
      throw new HttpError(400, `questionTypes[${i}] must be an object`);
    }
    const { type, count, marks } = q as Record<string, unknown>;
    if (typeof type !== 'string' || !type.trim()) {
      throw new HttpError(400, `questionTypes[${i}].type is required`);
    }
    const c = Number(count);
    const m = Number(marks);
    if (!Number.isFinite(c) || c < 1) {
      throw new HttpError(400, `questionTypes[${i}].count must be >= 1`);
    }
    if (!Number.isFinite(m) || m < 0) {
      throw new HttpError(400, `questionTypes[${i}].marks must be >= 0`);
    }
    return { type: type.trim(), count: Math.floor(c), marks: Math.floor(m) };
  });
}

class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

// --- POST /api/assignments ---
router.post('/', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const { title, dueDate, additionalInfo } = req.body as Record<string, string | undefined>;
    if (!title?.trim()) throw new HttpError(400, 'title is required');
    if (!dueDate) throw new HttpError(400, 'dueDate is required');
    const due = new Date(dueDate);
    if (Number.isNaN(due.getTime())) throw new HttpError(400, 'dueDate is invalid');

    const questionTypes = parseQuestionTypes(req.body.questionTypes);

    const fileUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

    const assignment = await Assignment.create({
      title: title.trim(),
      dueDate: due,
      questionTypes,
      additionalInfo: additionalInfo?.trim() || '',
      fileUrl,
      status: 'pending',
    });

    await getGenerationQueue().add(
      'generate',
      { assignmentId: assignment._id.toString() },
      { jobId: assignment._id.toString() }
    );

    broadcast('assignment:updated', { id: assignment._id.toString(), status: assignment.status });

    res.status(201).json({ assignment });
  } catch (err) {
    handleError(err, res);
  }
});

// --- GET /api/assignments ---
// Returns the full document including `generatedOutput` so the dashboard can
// compute stats (questions/subjects/difficulty) without a second round-trip.
router.get('/', async (_req, res) => {
  try {
    const assignments = await Assignment.find()
      .sort({ createdAt: -1 })
      .lean();
    res.json({ assignments });
  } catch (err) {
    handleError(err, res);
  }
});

// --- GET /api/assignments/:id ---
router.get('/:id', async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id).lean();
    if (!assignment) throw new HttpError(404, 'assignment not found');
    res.json({ assignment });
  } catch (err) {
    handleError(err, res);
  }
});

// --- GET /api/assignments/:id/status ---
router.get('/:id/status', async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .select('status updatedAt')
      .lean();
    if (!assignment) throw new HttpError(404, 'assignment not found');
    res.json({ status: assignment.status, updatedAt: assignment.updatedAt });
  } catch (err) {
    handleError(err, res);
  }
});

// --- POST /api/assignments/:id/regenerate ---
router.post('/:id/regenerate', async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) throw new HttpError(404, 'assignment not found');

    assignment.status = 'pending';
    await assignment.save();

    const queue = getGenerationQueue();
    try {
      const existing = await queue.getJob(req.params.id);
      if (existing) await existing.remove();
    } catch {
      // ignore — old job may be in a state that disallows removal
    }
    await queue.add(
      'generate',
      { assignmentId: req.params.id },
      { jobId: req.params.id }
    );

    broadcast('assignment:updated', { id: req.params.id, status: 'pending' });

    res.json({ assignment });
  } catch (err) {
    handleError(err, res);
  }
});

// --- DELETE /api/assignments/:id ---
router.delete('/:id', async (req, res) => {
  try {
    const assignment = await Assignment.findByIdAndDelete(req.params.id).lean();
    if (!assignment) throw new HttpError(404, 'assignment not found');

    if (assignment.fileUrl) {
      const filePath = path.join(uploadsRoot, path.basename(assignment.fileUrl));
      fs.promises.unlink(filePath).catch(() => undefined);
    }

    // best-effort: remove the queued job if it hasn't run yet
    try {
      const job = await getGenerationQueue().getJob(req.params.id);
      if (job) await job.remove();
    } catch {
      // ignore
    }

    broadcast('assignment:updated', { id: req.params.id, status: 'deleted' });

    res.json({ ok: true });
  } catch (err) {
    handleError(err, res);
  }
});

function broadcast(event: string, payload: unknown) {
  try {
    getIO().emit(event, payload);
  } catch {
    // socket not initialized — skip
  }
}

function handleError(err: unknown, res: Response) {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message });
    return;
  }
  if (err instanceof Error && err.name === 'CastError') {
    res.status(400).json({ error: 'invalid id' });
    return;
  }
  console.error('[assignments] error:', err);
  res.status(500).json({ error: 'internal server error' });
}

export default router;
