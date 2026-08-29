import env, { SERVICE_NAME } from '@/config';
import logger from '@utils/logger';
import type { Request, Response } from 'express';
import { type Filter, createProxyMiddleware } from 'http-proxy-middleware';

type ServiceProxyOptions = {
	/** Which request paths this proxy claims. A plain string matches by prefix. */
	pathFilter: Filter<Request>;
	target: string;
	pathRewrite?: Record<string, string>;
};

/*
	Builds the reverse proxy for one downstream service.

	Every proxy is mounted at the app root and selects its traffic with `pathFilter` rather than
	an Express mount path: http-proxy-middleware forwards `req.url`, and Express strips the
	mount prefix from it, so `app.use('/api/v1/post', proxy)` would reach post with the prefix
	missing.

	The response is streamed straight back. The upstream's { success, data } envelope is already
	the public contract, so there is nothing to rewrite on the way out.
*/
export default function createServiceProxy({ pathFilter, target, pathRewrite }: ServiceProxyOptions) {
	return createProxyMiddleware<Request, Response>({
		pathFilter,
		target,
		changeOrigin: false,
		pathRewrite,
		on: {
			proxyReq: (proxyReq, req) => {
				// The identity contract every downstream service reads via requestHeaderHandler.
				// requestContext already deleted any client-supplied copies of these.
				proxyReq.setHeader('x-service-name', SERVICE_NAME);
				proxyReq.setHeader('x-request-id', req.requestId);
				proxyReq.setHeader('x-gateway-secret', env.GATEWAY_SECRET);

				// Absent on the auth passthrough, which runs without requireAuth.
				if (req.userId) {
					proxyReq.setHeader('x-user-id', req.userId);
				}
			},
			error: (err, req, res) => {
				logger.error(`Proxy error: ${req.method} ${req.url} -> ${target} (${err.message})`);

				// On an upgraded/aborted connection `res` is a raw socket, and the client may
				// already have been answered — neither case can take an error envelope.
				if ('headersSent' in res && !res.headersSent) {
					(res as Response).error('Upstream service unavailable', 502);
				}
			},
		},
	});
}
