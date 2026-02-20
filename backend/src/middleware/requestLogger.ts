import morgan, { StreamOptions } from 'morgan';
import { winstonLogger } from '../utils/logger';
import { Request, Response } from 'express';

const stream: StreamOptions = {
  write: (message: string) => {
    winstonLogger.info(message.trim(), { context: 'HTTP' });
  },
};

// Custom Morgan token for execution time
morgan.token('execution-time', (_req: Request, res: Response) => {
  const startTime = (res as any).__startTime;
  if (!startTime) return '0';
  const diff = process.hrtime(startTime);
  const timeMs = (diff[0] * 1e3 + diff[1] / 1e6).toFixed(2);
  return timeMs;
});

// Middleware to capture start time on the response object
export const captureStartTime = (_req: Request, res: Response, next: Function) => {
  (res as any).__startTime = process.hrtime();
  next();
};

// Format: [METHOD] /endpoint - Execution time: Xms
export const requestLogger = morgan(
  '[:method] :url - Execution time: :execution-time ms | Status: :status',
  {
    stream,
  }
);
