import { AppError } from './AppError';
import { TaskStatus } from '../models/task';

const VALID_STATUSES: TaskStatus[] = ['pending', 'in-progress', 'completed'];

export const validateCreateTask = (body: Record<string, unknown>): { title: string; description?: string } => {
  const { title, description } = body;

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    throw AppError.validationError('Title is required and must be a non-empty string');
  }

  if (title.trim().length > 255) {
    throw AppError.validationError('Title must not exceed 255 characters');
  }

  if (description !== undefined && typeof description !== 'string') {
    throw AppError.validationError('Description must be a string');
  }

  if (typeof description === 'string' && description.trim().length > 1000) {
    throw AppError.validationError('Description must not exceed 1000 characters');
  }

  return {
    title: title.trim(),
    description: typeof description === 'string' ? description.trim() : undefined,
  };
};

export const validateUpdateTask = (body: Record<string, unknown>): { title?: string; description?: string; status?: TaskStatus } => {
  const { title, description, status } = body;
  const result: { title?: string; description?: string; status?: TaskStatus } = {};

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim().length === 0) {
      throw AppError.validationError('Title, if provided, must be a non-empty string');
    }
    if (title.trim().length > 255) {
      throw AppError.validationError('Title must not exceed 255 characters');
    }
    result.title = title.trim();
  }

  if (description !== undefined) {
    if (typeof description !== 'string') {
      throw AppError.validationError('Description, if provided, must be a string');
    }
    if (description.trim().length > 1000) {
      throw AppError.validationError('Description must not exceed 1000 characters');
    }
    result.description = description.trim();
  }

  if (status !== undefined) {
    if (!VALID_STATUSES.includes(status as TaskStatus)) {
      throw AppError.validationError(
        `Status must be one of: ${VALID_STATUSES.join(', ')}`
      );
    }
    result.status = status as TaskStatus;
  }

  return result;
};

export const validatePagination = (query: Record<string, unknown>): { page: number; limit: number } => {
  let page = Number(query.page) || 1;
  let limit = Number(query.limit) || 10;

  if (page < 1) page = 1;
  if (limit < 1) limit = 1;
  if (limit > 100) limit = 100;

  return { page, limit };
};
