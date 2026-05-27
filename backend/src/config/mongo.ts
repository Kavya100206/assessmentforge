import mongoose from 'mongoose';
import { env } from './env';

let connecting: Promise<typeof mongoose> | null = null;

export async function connectMongo(): Promise<typeof mongoose> {
  if (mongoose.connection.readyState === 1) return mongoose;
  if (!connecting) {
    connecting = mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 10_000,
    });
  }
  const conn = await connecting;
  console.log('[mongo] connected');
  return conn;
}

export function mongoStatus(): 'connected' | 'disconnected' {
  return mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
}
