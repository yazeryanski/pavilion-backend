import express from 'express';

import errorHandler from '@middlewares/errorHandler.middleware';
import { httpLogger } from '@middlewares/httpLogger.middleware';
import requestContext from '@middlewares/requestContext.middleware';
import responseHandler from '@middlewares/responseHandler.middleware';

import registerProxyRoutes from '@proxy/routes';
import router from '@routes/index';

import env from '@/config';

import logger from '@utils/logger';

const app = express();

/*
	Deliberately no express.json(): a request body that has already been consumed cannot be
	streamed to an upstream, which would break post's multipart image upload. The gateway
	never reads a body — it only forwards one.

	Deliberately no requestHeaderHandler either: the gateway issues the identity headers, it
	does not consume them (same reason auth omits it).
*/

// Middlewares
app.use(responseHandler);
app.use(requestContext);
app.use(httpLogger);

// Routes — the gateway's own endpoints (health)
app.use('/api/', router);

// Reverse proxy to the downstream services. Registered after the gateway's own routes so
// /api/v1/health is answered here rather than forwarded, and it ends in a catch-all 404.
registerProxyRoutes(app);

// Error Handler - Must be the last middleware
app.use(errorHandler as express.ErrorRequestHandler);

// Server
(async () => {
	try {
		// Unlike the other services the gateway owns no datastore, so there is nothing to await
		// before listening. Upstreams that are down surface per-request as a 502.
		app.listen(env.NODE_PORT, () => {
			logger.info(`Server is running on port ${env.NODE_PORT}`);
		});
	} catch (err) {
		logger.error('Failed to run the server', err);
		process.exit(1);
	}
})();
