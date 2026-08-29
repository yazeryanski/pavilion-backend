import { url, cleanEnv, port, str } from 'envalid';
import 'dotenv/config';

const env = cleanEnv(process.env, {
	// Server Configuration
	NODE_PORT: port({ devDefault: 8080 }),
	NODE_ENV: str({ choices: ['development', 'production', 'test'], devDefault: 'development' }),

	// Shared secret proving to the downstream services that a request came through the gateway.
	// They only enforce it in production, hence the devDefault.
	GATEWAY_SECRET: str({ devDefault: 'dev-gateway-secret' }),

	// Upstreams. Under Docker these are the compose DNS names; the devDefaults are the host ports.
	AUTH_SERVICE_URL: url({ devDefault: 'http://localhost:3000' }),
	POST_SERVICE_URL: url({ devDefault: 'http://localhost:3001' }),
	PROFILE_SERVICE_URL: url({ devDefault: 'http://localhost:3002' }),
	NEWSLETTER_SERVICE_URL: url({ devDefault: 'http://localhost:3004' }),
});

// Identifies the gateway to the downstream services in the x-service-name header.
export const SERVICE_NAME = 'gateway';

export default env;
