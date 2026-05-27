import type { Server as HttpServer } from 'http';
import { Server as IOServer } from 'socket.io';
import { env } from '../config/env';

let io: IOServer | null = null;

export function initSocketIO(httpServer: HttpServer): IOServer {
  if (io) return io;

  io = new IOServer(httpServer, {
    cors: {
      origin: env.frontendUrl,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log('[socket] connected:', socket.id);

    socket.on('join', (assignmentId: string) => {
      if (typeof assignmentId === 'string' && assignmentId.length > 0) {
        socket.join(assignmentId);
      }
    });

    socket.on('disconnect', () => {
      console.log('[socket] disconnected:', socket.id);
    });
  });

  console.log('[socket] server attached');
  return io;
}

export function getIO(): IOServer {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
}
