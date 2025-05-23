import express from 'express';

import errorHandler from '@middlewares/errorHandler.middleware';
import { httpLogger } from '@middlewares/httpLogger.middleware';
import responseHandler from '@middlewares/responseHandler.middleware';

import router from '@routes/index';

import env from '@/config';

import redis from '@/utils/redis';
import logger from '@utils/logger';
import prisma from './utils/prisma';

const app = express();

// Middlewares
app.use(express.json());
app.use(httpLogger);
app.use(responseHandler);

// Routes
app.use('/api/', router);

// Error Handler - Must be the last middleware
app.use(errorHandler as express.ErrorRequestHandler);

// Server
(async () => {
	try {
		// Run server once Redis & DB are connected
		await redis.ping();
		await prisma.$connect().then(() => logger.info('Connected to database'));

		app.listen(env.NODE_PORT, () => {
			logger.info(`Server is running on port ${env.NODE_PORT}`);
		});
	} catch (err) {
		logger.error('Failed to run the server', err);
		process.exit(1);
	}
})();
