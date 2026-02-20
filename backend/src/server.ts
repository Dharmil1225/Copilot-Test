import dotenv from 'dotenv';
// Load environment variables before anything else
dotenv.config();

import app from './app';
import redis from './config/redis';
import { logger } from './utils/logger';

const PORT = process.env.PORT || 5000;

// Connect to Redis, then start the server
redis.connect().then(() => {
  app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`, 'Server');
  });
}).catch((err) => {
  logger.error('Failed to connect to Redis', 'Server', { detail: err.message });
  process.exit(1);
});
