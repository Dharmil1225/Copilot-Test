import 'reflect-metadata';
import express, { Application, Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import healthRoutes from './routes/health.routes';
import taskRoutes from './routes/tasks.routes';
import { errorHandler } from './middleware/errorHandler';
import { captureStartTime, requestLogger } from './middleware/requestLogger';
import { logger } from './utils/logger';

const app: Application = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging: capture start time + Morgan → Winston
app.use(captureStartTime);
app.use(requestLogger);

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      message: 'Too many requests, please try again later',
      errorCode: 'RATE_LIMIT_EXCEEDED',
      statusCode: 429,
    },
  },
});

app.use('/v1', apiLimiter);

// Routes
app.use('/', healthRoutes);
app.use('/api/v1', taskRoutes);

// 404 handler for unmatched routes
app.use((_req: Request, res: Response) => {
  logger.warn('Route not found', 'Router', {
    endpoint: `${_req.method} ${_req.originalUrl}`,
  });
  res.status(404).json({
    error: {
      message: 'Route not found',
      errorCode: 'NOT_FOUND',
      statusCode: 404,
    },
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;
