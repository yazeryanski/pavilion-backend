import logger from '@utils/logger';
import type { NextFunction, Request, Response } from 'express';

export function httpLogger(req: Request, res: Response, next: NextFunction) {
	const { method, url, ip, userId, requestId, serviceName } = req;

	res.on('finish', () => {
		const { statusCode } = res;
		logger.info(
			`${method} ${url} | user-ID: ${userId} | request-ID: ${requestId} | requestor-service: ${serviceName} - ${statusCode} [${ip}]`,
		);
	});

	next();
}
