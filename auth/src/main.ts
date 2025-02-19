import express from 'express';

import env from 'config';
import redis from './connections/redisClient';

import logger from '@utils/logger';

import responseHandler from '@middlewares/responseHandler.middleware';
import { httpLogger } from '@middlewares/httpLogger';

import router from '@routes/index';

const app = express();

// Middlewares
app.use(express.json());
app.use(httpLogger);
app.use(responseHandler);

// Routes
app.use('/api/', router);

// Server
(async () => {
	try {
		// Run server once Redis is connected
		await redis.ping();

		app.listen(env.NODE_PORT, () => {
			logger.info(`Server is running on port ${env.NODE_PORT}`);
		});
	} catch (err) {
		logger.error('Failed to run the server', err);
		process.exit(1);
	}
})();
