import { io, Socket } from 'socket.io-client';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:8000';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (socket && socket.connected) return socket;
  if (socket) return socket; // connecting

  socket = io(WS_URL, {
    transports: ['websocket'],
    autoConnect: true,
  });

  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export interface GenerationProgress {
  assignmentId: string;
  stage: string;
  progress: number;
}

export interface GenerationComplete {
  assignmentId: string;
  output: unknown;
}

export interface GenerationError {
  assignmentId: string;
  error: string;
}
