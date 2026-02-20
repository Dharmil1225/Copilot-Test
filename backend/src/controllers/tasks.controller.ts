// filepath: src/controllers/tasks.controller.ts

import { Request, Response, NextFunction } from 'express';
import { taskService } from '../services/task.service';
import { logger } from '../utils/logger';
import { CreateTaskRequestDto, UpdateTaskRequestDto, ListTasksQueryDto } from '../dtos/task.dto';

export const getTasks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const query = req.query as unknown as ListTasksQueryDto;

    logger.info('Listing tasks — parsing query parameters', 'TaskController.getTasks', {
      endpoint: 'GET /api/v1/tasks',
      query: req.query as Record<string, unknown>,
    });

    const page = Number(query.page) || 1;
    const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);

    const filters = {
      status: query.status,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    };

    logger.debug('Fetching tasks from service', 'TaskController.getTasks', {
      endpoint: 'GET /api/v1/tasks',
      page,
      limit,
      filters,
    });

    const result = await taskService.getAll(page, limit, filters);

    logger.info('Tasks listed successfully', 'TaskController.getTasks', {
      endpoint: 'GET /api/v1/tasks',
      total: result.pagination.total,
      returned: result.data.length,
    });

    res.status(200).json(result);
  } catch (err) {
    logger.error('Failed to list tasks', 'TaskController.getTasks', {
      endpoint: 'GET /api/v1/tasks',
      error: (err as Error).message,
    });
    next(err);
  }
};

export const getTaskById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    logger.info('Fetching task by ID', 'TaskController.getTaskById', {
      endpoint: `GET /api/v1/tasks/${id}`,
      taskId: id,
    });

    const task = await taskService.getById(id);

    logger.info('Task retrieved successfully', 'TaskController.getTaskById', {
      endpoint: `GET /api/v1/tasks/${id}`,
      taskId: id,
    });

    res.status(200).json({ data: task });
  } catch (err) {
    logger.error('Failed to retrieve task', 'TaskController.getTaskById', {
      endpoint: `GET /api/v1/tasks/${req.params.id}`,
      taskId: req.params.id,
      error: (err as Error).message,
    });
    next(err);
  }
};

export const createTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const payload = req.body as CreateTaskRequestDto;

    logger.info('Creating new task — payload validated', 'TaskController.createTask', {
      endpoint: 'POST /api/v1/tasks',
      title: payload.title,
      priority: payload.priority || 'medium',
      hasDescription: !!payload.description,
      hasDueDate: !!payload.dueDate,
    });

    const task = await taskService.create({
      title: payload.title,
      description: payload.description,
      priority: payload.priority,
      dueDate: payload.dueDate,
    });

    logger.info('Task created successfully', 'TaskController.createTask', {
      endpoint: 'POST /api/v1/tasks',
      taskId: task.id,
    });

    res.status(201).json({ data: task });
  } catch (err) {
    logger.error('Failed to create task', 'TaskController.createTask', {
      endpoint: 'POST /api/v1/tasks',
      error: (err as Error).message,
    });
    next(err);
  }
};

export const updateTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const payload = req.body as UpdateTaskRequestDto;

    logger.info('Updating task — payload validated', 'TaskController.updateTask', {
      endpoint: `PUT /api/v1/tasks/${id}`,
      taskId: id,
      fieldsUpdated: Object.keys(payload),
    });

    const task = await taskService.update(id, {
      title: payload.title,
      description: payload.description,
      status: payload.status,
      priority: payload.priority,
      dueDate: payload.dueDate,
    });

    logger.info('Task updated successfully', 'TaskController.updateTask', {
      endpoint: `PUT /api/v1/tasks/${id}`,
      taskId: id,
    });

    res.status(200).json({ data: task });
  } catch (err) {
    logger.error('Failed to update task', 'TaskController.updateTask', {
      endpoint: `PUT /api/v1/tasks/${req.params.id}`,
      taskId: req.params.id,
      error: (err as Error).message,
    });
    next(err);
  }
};

export const deleteTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    logger.info('Deleting task', 'TaskController.deleteTask', {
      endpoint: `DELETE /api/v1/tasks/${id}`,
      taskId: id,
    });

    await taskService.delete(id);

    logger.info('Task deleted successfully', 'TaskController.deleteTask', {
      endpoint: `DELETE /api/v1/tasks/${id}`,
      taskId: id,
    });

    res.status(204).send();
  } catch (err) {
    logger.error('Failed to delete task', 'TaskController.deleteTask', {
      endpoint: `DELETE /api/v1/tasks/${req.params.id}`,
      taskId: req.params.id,
      error: (err as Error).message,
    });
    next(err);
  }
};

export const deleteAllTasks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    logger.info('Deleting all tasks', 'TaskController.deleteAllTasks', {
      endpoint: 'DELETE /api/v1/tasks',
    });

    const deletedCount = await taskService.deleteAll();

    logger.info('All tasks deleted successfully', 'TaskController.deleteAllTasks', {
      endpoint: 'DELETE /api/v1/tasks',
      deletedCount,
    });

    res.status(200).json({
      data: {
        message: `Successfully deleted ${deletedCount} task(s)`,
        deletedCount,
      },
    });
  } catch (err) {
    logger.error('Failed to delete all tasks', 'TaskController.deleteAllTasks', {
      endpoint: 'DELETE /api/v1/tasks',
      error: (err as Error).message,
    });
    next(err);
  }
};
