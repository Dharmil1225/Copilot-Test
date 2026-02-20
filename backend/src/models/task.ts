import redis from '../config/redis';

export type TaskStatus = 'pending' | 'in-progress' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskDTO {
  title: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: string;
}

export interface UpdateTaskDTO {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
}

const TASK_PREFIX = 'task:';
const TASK_INDEX = 'tasks:index';

const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
};

export const TaskRepository = {
  async getAll(): Promise<Task[]> {
    const ids = await redis.smembers(TASK_INDEX);
    if (ids.length === 0) return [];

    const pipeline = redis.pipeline();
    for (const id of ids) {
      pipeline.get(`${TASK_PREFIX}${id}`);
    }
    const results = await pipeline.exec();
    if (!results) return [];

    const tasks: Task[] = [];
    for (const [err, val] of results) {
      if (!err && typeof val === 'string') {
        tasks.push(JSON.parse(val));
      }
    }
    return tasks;
  },

  async getById(id: string): Promise<Task | null> {
    const data = await redis.get(`${TASK_PREFIX}${id}`);
    if (!data) return null;
    return JSON.parse(data);
  },

  async create(payload: CreateTaskDTO): Promise<Task> {
    const now = new Date().toISOString();
    const task: Task = {
      id: generateId(),
      title: payload.title,
      description: payload.description,
      status: 'pending',
      priority: payload.priority || 'medium',
      dueDate: payload.dueDate,
      createdAt: now,
      updatedAt: now,
    };

    await redis.set(`${TASK_PREFIX}${task.id}`, JSON.stringify(task));
    await redis.sadd(TASK_INDEX, task.id);
    return task;
  },

  async update(id: string, payload: UpdateTaskDTO): Promise<Task | null> {
    const existing = await this.getById(id);
    if (!existing) return null;

    if (payload.title !== undefined) existing.title = payload.title;
    if (payload.description !== undefined) existing.description = payload.description;
    if (payload.status !== undefined) existing.status = payload.status;
    if (payload.priority !== undefined) existing.priority = payload.priority;
    if (payload.dueDate !== undefined) existing.dueDate = payload.dueDate;
    existing.updatedAt = new Date().toISOString();

    await redis.set(`${TASK_PREFIX}${id}`, JSON.stringify(existing));
    return existing;
  },

  async delete(id: string): Promise<boolean> {
    const removed = await redis.del(`${TASK_PREFIX}${id}`);
    if (removed === 0) return false;
    await redis.srem(TASK_INDEX, id);
    return true;
  },

  async deleteAll(): Promise<number> {
    const ids = await redis.smembers(TASK_INDEX);
    if (ids.length === 0) return 0;

    const pipeline = redis.pipeline();
    for (const id of ids) {
      pipeline.del(`${TASK_PREFIX}${id}`);
    }
    pipeline.del(TASK_INDEX);
    await pipeline.exec();

    return ids.length;
  },
};
