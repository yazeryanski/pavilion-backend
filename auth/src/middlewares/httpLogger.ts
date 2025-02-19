import type { Request, Response, NextFunction } from 'express';
import logger from '@utils/logger';

export function httpLogger(req: Request, res: Response, next: NextFunction) {
	const { method, url, ip } = req;

	res.on('finish', () => {
		const { statusCode } = res;
		logger.info(`${method} ${url} - ${statusCode} [${ip}]`);
	});

	next();
}
