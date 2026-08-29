import logger from '@utils/logger';
import type { NextFunction, Request, Response } from 'express';

export function httpLogger(req: Request, res: Response, next: NextFunction) {
	const { method, url, ip, requestId } = req;

	res.on('finish', () => {
		const { statusCode } = res;
		// userId is read at finish time: requireAuth resolves it after this middleware runs.
		logger.info(`${method} ${url} | user-ID: ${req.userId} | request-ID: ${requestId} - ${statusCode} [${ip}]`);
	});

	next();
}
