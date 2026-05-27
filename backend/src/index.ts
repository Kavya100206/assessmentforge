import express, { Request, Response } from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import { env } from './config/env';
import { connectMongo, mongoStatus } from './config/mongo';
import { getRedis, redisStatus } from './config/redis';
import { getGenerationQueue } from './queues/generationQueue';
import { initSocketIO } from './sockets/io';
import assignmentsRouter from './routes/assignments';
import { startGenerationWorker } from './workers/generationWorker';

async function main() {
  const app = express();

  app.use(
    cors({
      origin: env.frontendUrl,
      credentials: true,
    })
  );
  app.use(express.json({ limit: '10mb' }));

  // static uploads
  const uploadsRoot = path.resolve(process.cwd(), env.uploadsDir);
  if (!fs.existsSync(uploadsRoot)) fs.mkdirSync(uploadsRoot, { recursive: true });
  app.use('/uploads', express.static(uploadsRoot));

  app.get('/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      mongo: mongoStatus(),
      redis: redisStatus(),
    });
  });

  app.use('/api/assignments', assignmentsRouter);

  const server = http.createServer(app);
  initSocketIO(server);

  getRedis();
  getGenerationQueue();
  connectMongo().catch((err) => {
    console.error('[mongo] connection failed:', err.message);
  });

  if (env.startWorker) {
    startGenerationWorker();
  }

  server.listen(env.port, () => {
    console.log(`[server] listening on http://localhost:${env.port}`);
    console.log(`[server] CORS allowed origin: ${env.frontendUrl}`);
  });
}

main().catch((err) => {
  console.error('[fatal]', err);
  process.exit(1);
});
