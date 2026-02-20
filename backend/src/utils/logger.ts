import winston from 'winston';

const { combine, timestamp, printf, colorize, errors } = winston.format;

const logFormat = printf(({ level, message, timestamp, context, meta, ...rest }) => {
  const ctx = context ? `[${context}]` : '';
  const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
  const restStr = Object.keys(rest).length > 0 ? ` ${JSON.stringify(rest)}` : '';
  return `${timestamp} ${level} ${ctx} ${message}${metaStr}${restStr}`;
});

const winstonLogger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
    logFormat
  ),
  defaultMeta: {},
  transports: [
    new winston.transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
        logFormat
      ),
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5 * 1024 * 1024, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
    }),
  ],
});

export const logger = {
  info: (message: string, context?: string, meta?: Record<string, unknown>) =>
    winstonLogger.info(message, { context, meta }),
  warn: (message: string, context?: string, meta?: Record<string, unknown>) =>
    winstonLogger.warn(message, { context, meta }),
  error: (message: string, context?: string, meta?: Record<string, unknown>) =>
    winstonLogger.error(message, { context, meta }),
  debug: (message: string, context?: string, meta?: Record<string, unknown>) =>
    winstonLogger.debug(message, { context, meta }),
};

export { winstonLogger };
