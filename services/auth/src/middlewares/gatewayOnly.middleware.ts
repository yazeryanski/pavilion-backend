import env from '@/config';
import type { NextFunction, Request, Response } from 'express';

/*
	Admits only traffic that arrived through the API gateway.

	The gateway is the single public entry point: it terminates the client's access token and
	injects the identity headers this service trusts. A request that reaches here without the
	shared secret skipped that check, so nothing it claims about itself is worth anything.

	Enforced in production only. Under `docker compose up` the services keep their published
	ports and stay directly callable, which is how they are debugged locally.

	/api/v1/health stays open in every environment: the compose healthcheck probes it from
	inside the container, and it discloses nothing.
*/
export default function gatewayOnly(req: Request, res: Response, next: NextFunction) {
	if (env.NODE_ENV !== 'production' || req.path === '/api/v1/health') {
		next();
		return;
	}

	if (req.headers['x-gateway-secret'] !== env.GATEWAY_SECRET) {
		res.error('Forbidden', 403);
		return;
	}

	next();
}
