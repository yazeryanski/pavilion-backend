import logger from '@utils/logger';
import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

export default function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
	logger.error(err); // Log error for debugging

	if (err instanceof z.ZodError) {
		res.error(`Validation error / Message: ${err.errors.map((e) => e.message).join()}`, 422);
		return;
	}
	// Fallback for unexpected errors
	res.error('Internal server error', 500);
}
