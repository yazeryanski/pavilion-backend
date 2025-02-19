/*
	Since error handler is handling only synchronous errors, 
	we need to wrap the async controllers & middlewares with **asyncHandler** to catch the asynchronous errors.
*/

import type { Request, Response, NextFunction } from 'express';

export default function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
	return (req: Request, res: Response, next: NextFunction) => {
		fn(req, res, next).catch(next);
	};
}
