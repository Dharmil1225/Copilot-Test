// filepath: src/routes/tasks.routes.ts

import { Router } from 'express';
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  deleteAllTasks,
} from '../controllers/tasks.controller';
import { validateBody, validateQuery } from '../middleware/validateRequest';
import {
  CreateTaskRequestDto,
  UpdateTaskRequestDto,
  ListTasksQueryDto,
} from '../dtos/task.dto';

const router = Router();

// GET /v1/tasks - list all tasks (with pagination, filtering, sorting)
router.get('/tasks', validateQuery(ListTasksQueryDto), getTasks);

// GET /v1/tasks/:id - get a single task
router.get('/tasks/:id', getTaskById);

// POST /v1/tasks - create a new task
router.post('/tasks', validateBody(CreateTaskRequestDto), createTask);

// PUT /v1/tasks/:id - update a task (partial)
router.put('/tasks/:id', validateBody(UpdateTaskRequestDto), updateTask);

// DELETE /v1/tasks - delete all tasks
router.delete('/tasks', deleteAllTasks);

// DELETE /v1/tasks/:id - delete a task
router.delete('/tasks/:id', deleteTask);

export default router;
