import type { NextFunction, Request, Response } from 'express';

// Extend Express Response type to include custom methods
declare global {
	namespace Express {
		interface Response {
			success: <T = any>(data?: T) => Response;
			error: (message: string, statusCode?: number) => Response;
		}
	}
}

const getResponseBody = <T = any>(success: boolean, data: T) => {
	return { success, data };
};

export default function responseHandler(_req: Request, res: Response, next: NextFunction) {
	res.success = <T = any>(data: T) => {
		return res.json(getResponseBody(true, data));
	};

	res.error = (message, statusCode = 400) => {
		return res.status(statusCode).json(getResponseBody(false, message));
	};

	next();
}
