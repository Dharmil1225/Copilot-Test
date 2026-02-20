import { Request, Response, NextFunction } from 'express';
import { AppError, ErrorCode } from '../utils/AppError';
import { logger } from '../utils/logger';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    logger.error(err.message, 'ErrorHandler', {
      statusCode: err.statusCode,
      errorCode: err.errorCode,
      path: req.path,
      method: req.method,
    });

    res.status(err.statusCode).json({
      error: {
        message: err.message,
        errorCode: err.errorCode,
        statusCode: err.statusCode,
      },
    });
    return;
  }

  // Unexpected errors — never expose internal details
  logger.error(err.message, 'ErrorHandler', {
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });

  res.status(500).json({
    error: {
      message: 'Internal Server Error',
      errorCode: ErrorCode.INTERNAL_ERROR,
      statusCode: 500,
    },
  });
};
