import env from '@/config';
import requireAuth from '@middlewares/requireAuth.middleware';
import createServiceProxy from '@proxy/createServiceProxy';
import type { Express } from 'express';

// Public prefixes that carry a user's identity and therefore need a valid access token.
const PROTECTED_PREFIXES = ['/api/v1/post', '/api/v1/profile', '/api/v1/newsletter'];

/*
	The gateway's routing table.

	Registration order matters: the /auth/verify block must precede the auth proxy, and the
	catch-all must come last.
*/
export default function registerProxyRoutes(app: Express) {
	// Token introspection is the gateway's own tool for authenticating clients — exposing it
	// would let anyone probe tokens. Blocked here because the auth rewrite below would
	// otherwise carry /api/v1/auth/verify straight through.
	app.all('/api/v1/auth/verify', (_req, res) => {
		res.error('Not found', 404);
	});

	app.use(PROTECTED_PREFIXES, requireAuth);

	// Auth is public — logging in cannot require being logged in. It mounts its routes flat
	// (/api/v1/login), so the /auth namespace the gateway exposes is rewritten away here.
	app.use(
		createServiceProxy({
			pathFilter: '/api/v1/auth',
			target: env.AUTH_SERVICE_URL,
			pathRewrite: { '^/api/v1/auth': '/api/v1' },
		}),
	);

	// The rest already share the gateway's public paths, so they pass through unrewritten.
	app.use(createServiceProxy({ pathFilter: '/api/v1/post', target: env.POST_SERVICE_URL }));
	app.use(createServiceProxy({ pathFilter: '/api/v1/profile', target: env.PROFILE_SERVICE_URL }));
	app.use(createServiceProxy({ pathFilter: '/api/v1/newsletter', target: env.NEWSLETTER_SERVICE_URL }));

	// Anything that matched no proxy is an unknown route; answer in the standard envelope
	// rather than letting Express emit its HTML 404 page.
	app.use((_req, res) => {
		res.error('Not found', 404);
	});
}
