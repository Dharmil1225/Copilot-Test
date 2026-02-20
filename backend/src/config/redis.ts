import Redis from 'ioredis';
import { logger } from '../utils/logger';

const redis = new Redis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: Number(process.env.REDIS_PORT) || 6379,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
});

redis.on('connect', () => {
  logger.info('Connected successfully', 'Redis');
});

redis.on('error', (err) => {
  logger.error('Connection error', 'Redis', { detail: err.message });
});

export default redis;
