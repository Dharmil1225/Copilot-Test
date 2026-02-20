import { Request, Response, NextFunction } from 'express';
import { validate, ValidationError } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';

function extractErrors(errors: ValidationError[]): string[] {
  const messages: string[] = [];
  for (const error of errors) {
    if (error.constraints) {
      messages.push(...Object.values(error.constraints));
    }
    if (error.children && error.children.length > 0) {
      messages.push(...extractErrors(error.children));
    }
  }
  return messages;
}

export function validateBody<T extends object>(DtoClass: new () => T) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const instance = plainToInstance(DtoClass, req.body);
    const errors = await validate(instance, {
      whitelist: true,
      forbidNonWhitelisted: true,
      stopAtFirstError: false,
    });

    if (errors.length > 0) {
      const errorMessages = extractErrors(errors);
      logger.warn('Validation failed', 'ValidationMiddleware', {
        endpoint: `${req.method} ${req.originalUrl}`,
        errors: errorMessages,
      });
      next(AppError.validationError(errorMessages.join('; ')));
      return;
    }

    // Sanitize: replace body with the validated & transformed instance
    req.body = instance;
    next();
  };
}

export function validateQuery<T extends object>(DtoClass: new () => T) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const instance = plainToInstance(DtoClass, req.query);
    const errors = await validate(instance, {
      whitelist: true,
      forbidNonWhitelisted: false,
      stopAtFirstError: false,
    });

    if (errors.length > 0) {
      const errorMessages = extractErrors(errors);
      logger.warn('Query validation failed', 'ValidationMiddleware', {
        endpoint: `${req.method} ${req.originalUrl}`,
        errors: errorMessages,
      });
      next(AppError.validationError(errorMessages.join('; ')));
      return;
    }

    req.query = instance as any;
    next();
  };
}
