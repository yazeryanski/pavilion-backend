import { cleanEnv, port, str } from 'envalid';
import 'dotenv/config';

const env = cleanEnv(process.env, {
	NODE_PORT: port({ devDefault: 3000 }),
	NODE_ENV: str({ choices: ['development', 'production', 'test'], devDefault: 'development' }),

	DATABASE_URL: str(),

	// Shared with the API gateway; see gatewayOnly.middleware. Only enforced in production,
	// hence the devDefault.
	GATEWAY_SECRET: str({ devDefault: 'dev-gateway-secret' }),
});

export const DEFAULT_USER_NAME = 'Anonymous';

export default env;
