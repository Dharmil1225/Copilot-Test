import { TaskRepository, Task, CreateTaskDTO, UpdateTaskDTO, TaskStatus } from '../models/task';
import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface TaskFilters {
  status?: TaskStatus;
  sortBy?: 'createdAt' | 'updatedAt' | 'title' | 'dueDate';
  sortOrder?: 'asc' | 'desc';
}

export class TaskService {
  async getAll(
    page: number,
    limit: number,
    filters: TaskFilters
  ): Promise<PaginatedResult<Task>> {
    let tasks = await TaskRepository.getAll();

    // Filter by status
    if (filters.status) {
      tasks = tasks.filter((t) => t.status === filters.status);
    }

    // Sort
    const sortBy = filters.sortBy || 'createdAt';
    const sortOrder = filters.sortOrder || 'desc';
    tasks.sort((a, b) => {
      const valA = a[sortBy] ?? '';
      const valB = b[sortBy] ?? '';

      // Date-based sorting for dueDate, createdAt, updatedAt
      if (sortBy === 'dueDate' || sortBy === 'createdAt' || sortBy === 'updatedAt') {
        // Tasks without dueDate go to the end
        if (!valA && !valB) return 0;
        if (!valA) return 1;
        if (!valB) return -1;
        const dateA = new Date(valA).getTime();
        const dateB = new Date(valB).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      }

      const comparison = String(valA).localeCompare(String(valB));
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    const total = tasks.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const paginated = tasks.slice(start, start + limit);

    logger.info('Tasks retrieved', 'TaskService', { total, page, limit });

    return {
      data: paginated,
      pagination: { page, limit, total, totalPages },
    };
  }

  async getById(id: string): Promise<Task> {
    const task = await TaskRepository.getById(id);
    if (!task) {
      throw AppError.notFound(`Task with id '${id}' not found`);
    }

    logger.debug('Task retrieved', 'TaskService', { taskId: id });
    return task;
  }

  async create(payload: CreateTaskDTO): Promise<Task> {
    const task = await TaskRepository.create(payload);
    logger.info('Task created', 'TaskService', { taskId: task.id });
    return task;
  }

  async update(id: string, payload: UpdateTaskDTO): Promise<Task> {
    const updated = await TaskRepository.update(id, payload);
    if (!updated) {
      throw AppError.notFound(`Task with id '${id}' not found`);
    }

    logger.info('Task updated', 'TaskService', { taskId: id });
    return updated;
  }

  async delete(id: string): Promise<void> {
    const deleted = await TaskRepository.delete(id);
    if (!deleted) {
      throw AppError.notFound(`Task with id '${id}' not found`);
    }

    logger.info('Task deleted', 'TaskService', { taskId: id });
  }

  async deleteAll(): Promise<number> {
    const count = await TaskRepository.deleteAll();
    logger.info('All tasks deleted', 'TaskService', { deletedCount: count });
    return count;
  }
}

export const taskService = new TaskService();
