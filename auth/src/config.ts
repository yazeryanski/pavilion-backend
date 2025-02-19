import { cleanEnv, str, port } from 'envalid';
import 'dotenv/config';

const env = cleanEnv(process.env, {
	NODE_PORT: port({ devDefault: 3000 }),
	NODE_ENV: str({ choices: ['development', 'production', 'test'], devDefault: 'development' }),

	ACCESS_TOKEN_SECRET: str({ devDefault: 'access_token_secret' }),
	REFRESH_TOKEN_SECRET: str({ devDefault: 'refresh_token_secret' }),

	DATABASE_URL: str(),

	REDIS_HOST: str({ devDefault: '127.0.0.1' }),
	REDIS_PORT: port({ devDefault: 6379 }),
	REDIS_PASSWORD: str({ devDefault: undefined }),
});

export const REFRESH_TOKEN_EXPIRATION = 60 * 60 * 24 * 7; // 7 days
export const ACCESS_TOKEN_EXPIRATION = 60 * 15; // 15 minutes

export default env;
