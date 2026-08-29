import { cleanEnv, port, str } from 'envalid';
import 'dotenv/config';

const env = cleanEnv(process.env, {
	// Server Configuration
	NODE_PORT: port({ devDefault: 3000 }),
	NODE_ENV: str({ choices: ['development', 'production', 'test'], devDefault: 'development' }),

	// Database Configuration
	DATABASE_URL: str(),

	// Shared with the API gateway; see gatewayOnly.middleware. Only enforced in production,
	// hence the devDefault.
	GATEWAY_SECRET: str({ devDefault: 'dev-gateway-secret' }),

	// S3 Configuration
	S3_ENDPOINT: str({ devDefault: 'https://s3.amazonaws.com' }),
	// Endpoint used to build the URLs handed back to clients. Defaults to S3_ENDPOINT and only
	// differs when the store is reached over a private network: in Docker the service talks to
	// `http://minio:9000`, but that host does not resolve for a browser on the host machine.
	S3_PUBLIC_ENDPOINT: str({ default: '' }),
	S3_REGION: str({ devDefault: 'us-east-1' }),
	S3_ACCESS_KEY_ID: str(),
	S3_SECRET_ACCESS: str(),
	S3_BUCKET_NAME: str(),
});

export default env;
