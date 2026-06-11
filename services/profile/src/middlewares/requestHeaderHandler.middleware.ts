import type { IncomingHttpHeaders } from 'node:http';
import type { NextFunction, Response } from 'express';

// Define the custom header names
type RequestCustomHeaders = 'x-user-id' | 'x-service-name' | 'x-request-id';

// Extend the Express Request type globally
declare global {
	namespace Express {
		interface Request {
			userId: string;
			serviceName: string;
			requestId: string;
		}

		interface Request {
			headers: IncomingHttpHeaders & Partial<Record<RequestCustomHeaders, string | string[]>>;
		}
	}
}

// Utility function to extract the header value
const extractHeaderValue = (headers: Express.Request['headers'], name: RequestCustomHeaders) => {
	// If the header is an array, take the first value, otherwise return the value directly
	return Array.isArray(headers[name]) ? headers[name][0] : headers[name];
};

// Middleware to add custom headers to the Request object
const requestHeaderHandler = (req: Express.Request, res: Response, next: NextFunction) => {
	// Extract header values and add them to the request object
	const userId = extractHeaderValue(req.headers, 'x-user-id');
	const serviceName = extractHeaderValue(req.headers, 'x-service-name');
	const requestId = extractHeaderValue(req.headers, 'x-request-id');

	if (!userId || !serviceName || !requestId) {
		res.error("Request's Custom headers are missing", 500);
		return;
	}

	req.userId = userId;
	req.serviceName = serviceName;
	req.requestId = requestId;

	// Call the next middleware or route handler
	next();
};

export default requestHeaderHandler;
