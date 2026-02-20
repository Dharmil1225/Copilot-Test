import 'reflect-metadata';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  MinLength,
  IsIn,
  IsNumberString,
  IsDateString,
  ValidateIf,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { TaskStatus, TaskPriority } from '../models/task';

// ─── Sanitization helpers ────────────────────────────────────────────────────

const trimTransform = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

const stripHtmlTransform = ({ value }: { value: unknown }) =>
  typeof value === 'string'
    ? value.replace(/<[^>]*>/g, '').trim()
    : value;

// ─── Custom validator: high priority → dueDate required & within 7 days ─────

@ValidatorConstraint({ name: 'highPriorityDueDate', async: false })
class HighPriorityDueDateConstraint implements ValidatorConstraintInterface {
  validate(_value: unknown, args: ValidationArguments): boolean {
    const obj = args.object as Record<string, unknown>;
    const priority = obj.priority;
    const dueDate = obj.dueDate;

    if (priority !== 'high') return true;

    // For high priority, dueDate must exist
    if (!dueDate || typeof dueDate !== 'string') return false;

    const due = new Date(dueDate);
    if (isNaN(due.getTime())) return false;

    const now = new Date();
    const maxDate = new Date();
    maxDate.setDate(now.getDate() + 7);

    return due >= now && due <= maxDate;
  }

  defaultMessage(_args: ValidationArguments): string {
    return 'High priority tasks must have a due date within the next 7 days';
  }
}

function IsHighPriorityDueDateValid(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: HighPriorityDueDateConstraint,
    });
  };
}

// ─── Create Task ─────────────────────────────────────────────────────────────

export class CreateTaskRequestDto {
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title is required and must not be empty' })
  @MinLength(1, { message: 'Title must be at least 1 character long' })
  @MaxLength(255, { message: 'Title must not exceed 255 characters' })
  @Transform(stripHtmlTransform)
  title!: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MaxLength(1000, { message: 'Description must not exceed 1000 characters' })
  @Transform(stripHtmlTransform)
  description?: string;

  @IsOptional()
  @IsIn(['low', 'medium', 'high'], {
    message: 'Priority must be one of: low, medium, high',
  })
  priority?: TaskPriority;

  @IsOptional()
  @IsDateString({}, { message: 'Due date must be a valid ISO 8601 date string (e.g. 2026-03-01T00:00:00.000Z)' })
  @IsHighPriorityDueDateValid({
    message: 'High priority tasks must have a due date within the next 7 days',
  })
  dueDate?: string;
}

export class CreateTaskResponseDto {
  data!: {
    id: string;
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate?: string;
    createdAt: string;
    updatedAt: string;
  };
}

// ─── Update Task ─────────────────────────────────────────────────────────────

export class UpdateTaskRequestDto {
  @IsOptional()
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title, if provided, must not be empty' })
  @MinLength(1, { message: 'Title must be at least 1 character long' })
  @MaxLength(255, { message: 'Title must not exceed 255 characters' })
  @Transform(stripHtmlTransform)
  title?: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MaxLength(1000, { message: 'Description must not exceed 1000 characters' })
  @Transform(stripHtmlTransform)
  description?: string;

  @IsOptional()
  @IsIn(['pending', 'in-progress', 'completed'], {
    message: 'Status must be one of: pending, in-progress, completed',
  })
  status?: TaskStatus;

  @IsOptional()
  @IsIn(['low', 'medium', 'high'], {
    message: 'Priority must be one of: low, medium, high',
  })
  priority?: TaskPriority;

  @IsOptional()
  @IsDateString({}, { message: 'Due date must be a valid ISO 8601 date string (e.g. 2026-03-01T00:00:00.000Z)' })
  @IsHighPriorityDueDateValid({
    message: 'High priority tasks must have a due date within the next 7 days',
  })
  dueDate?: string;
}

export class UpdateTaskResponseDto {
  data!: {
    id: string;
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate?: string;
    createdAt: string;
    updatedAt: string;
  };
}

// ─── Get Task By Id ──────────────────────────────────────────────────────────

export class GetTaskResponseDto {
  data!: {
    id: string;
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate?: string;
    createdAt: string;
    updatedAt: string;
  };
}

// ─── List Tasks (query params) ──────────────────────────────────────────────

export class ListTasksQueryDto {
  @IsOptional()
  @IsNumberString({}, { message: 'Page must be a number' })
  page?: string;

  @IsOptional()
  @IsNumberString({}, { message: 'Limit must be a number' })
  limit?: string;

  @IsOptional()
  @IsIn(['pending', 'in-progress', 'completed'], {
    message: 'Status filter must be one of: pending, in-progress, completed',
  })
  status?: TaskStatus;

  @IsOptional()
  @IsIn(['createdAt', 'updatedAt', 'title', 'dueDate'], {
    message: 'sortBy must be one of: createdAt, updatedAt, title, dueDate',
  })
  sortBy?: 'createdAt' | 'updatedAt' | 'title' | 'dueDate';

  @IsOptional()
  @IsIn(['asc', 'desc'], {
    message: 'sortOrder must be one of: asc, desc',
  })
  sortOrder?: 'asc' | 'desc';
}

export class ListTasksResponseDto {
  data!: {
    id: string;
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate?: string;
    createdAt: string;
    updatedAt: string;
  }[];

  pagination!: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ─── Delete Task ─────────────────────────────────────────────────────────────

// DELETE returns 204 No Content — no response body DTO needed
