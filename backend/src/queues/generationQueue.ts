import { Queue, QueueEvents } from 'bullmq';
import { getRedis } from '../config/redis';

export const GENERATION_QUEUE_NAME = 'generation';

export interface GenerationJobData {
  assignmentId: string;
}

let queue: Queue<GenerationJobData> | null = null;
let queueEvents: QueueEvents | null = null;

export function getGenerationQueue(): Queue<GenerationJobData> {
  if (queue) return queue;
  queue = new Queue<GenerationJobData>(GENERATION_QUEUE_NAME, {
    connection: getRedis(),
    defaultJobOptions: {
      attempts: 2,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: 100,
      removeOnFail: 100,
    },
  });
  console.log('[bullmq] generation queue initialized');
  return queue;
}

export function getGenerationQueueEvents(): QueueEvents {
  if (queueEvents) return queueEvents;
  queueEvents = new QueueEvents(GENERATION_QUEUE_NAME, {
    connection: getRedis(),
  });
  return queueEvents;
}
