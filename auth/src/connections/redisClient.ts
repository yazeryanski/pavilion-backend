import Redis from 'ioredis';
import "dotenv/config";
import logger from '@utils/logger';

const port = Number.parseInt(process.env.REDIS_PORT || '6379');
const host = process.env.REDIS_HOST || '127.0.0.1';
const password = process.env.REDIS_PASSWORD || undefined;

const redis = new Redis({
  host,
  port,
  password,
  retryStrategy: (times) => {
    if (times > 20) {
      logger.error('Redis connection lost. Exiting application...');
      process.exit(1);
    }
    return Math.min(times * 50, 2000);
  }, 
});

redis.on('connect', () => logger.info('Connected to Redis'));
redis.on('error', (err) => logger.error('Redis error:', err));

export default redis;