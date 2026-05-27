import IORedis, { Redis } from 'ioredis';
import { env } from './env';

let client: Redis | null = null;
let ready = false;

export function getRedis(): Redis {
  if (client) return client;

  client = new IORedis(env.redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    lazyConnect: false,
    retryStrategy: (times) => Math.min(times * 500, 10_000),
    reconnectOnError: () => false,
  });

  client.on('ready', () => {
    ready = true;
    console.log('[redis] connected');
  });
  let lastErrorAt = 0;
  client.on('error', (err) => {
    ready = false;
    const now = Date.now();
    if (now - lastErrorAt > 5_000) {
      console.error('[redis] error:', err.message);
      lastErrorAt = now;
    }
  });
  client.on('end', () => {
    ready = false;
  });

  return client;
}

export function redisStatus(): 'connected' | 'disconnected' {
  return ready ? 'connected' : 'disconnected';
}
