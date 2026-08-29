import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

// Headers the gateway alone is allowed to set. A client that sends them is either confused or
// trying to impersonate someone, so they are dropped before anything else looks at the request.
const GATEWAY_OWNED_HEADERS = ['x-user-id', 'x-service-name', 'x-gateway-secret'] as const;

declare global {
	namespace Express {
		interface Request {
			// Resolved by requireAuth; absent on the public routes.
			userId?: string;
			requestId: string;
		}
	}
}

/*
	Establishes the per-request context the rest of the gateway relies on.

	Stripping the gateway-owned headers is the whole point of the service: downstream services
	trust `x-user-id` without question, so if a client could smuggle one through the proxy it
	could act as any user. `proxyReq` sets these itself on the way out.
*/
export default function requestContext(req: Request, _res: Response, next: NextFunction) {
	// Honour an upstream-assigned id so a request stays traceable across the whole stack.
	const incomingRequestId = req.headers['x-request-id'];
	req.requestId = (Array.isArray(incomingRequestId) ? incomingRequestId[0] : incomingRequestId) || randomUUID();

	for (const header of GATEWAY_OWNED_HEADERS) {
		delete req.headers[header];
	}

	next();
}
