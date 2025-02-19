import Redis from 'ioredis';
import 'dotenv/config';
import logger from '@utils/logger';
import env from 'config';

const redis = new Redis({
	host: env.REDIS_HOST,
	port: env.REDIS_PORT,
	password: env.REDIS_PASSWORD,
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
