import logger from '@utils/logger';
import type { Request, Response, NextFunction } from 'express';

export default function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
	logger.error(err); // Log error for debugging

	// Fallback for unexpected errors
	res.error('Internal server error', 500);
}
