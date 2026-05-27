import dotenv from 'dotenv';

dotenv.config();

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined || value === '') {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 8000),
  mongoUri: required('MONGODB_URI', 'mongodb://localhost:27017/vedaai'),
  redisUrl: required('REDIS_URL', 'redis://localhost:6379'),
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:3000',
  groqApiKey: process.env.GROQ_API_KEY ?? '',
  groqModel: process.env.GROQ_MODEL ?? 'llama-3.3-70b-versatile',
  openaiApiKey: process.env.OPENAI_API_KEY ?? '',
  uploadsDir: process.env.UPLOADS_DIR ?? 'uploads',
  startWorker: (process.env.START_WORKER ?? 'true').toLowerCase() !== 'false',
};
