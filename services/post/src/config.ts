import { cleanEnv, port, str } from 'envalid';
import 'dotenv/config';

const env = cleanEnv(process.env, {
	// Server Configuration
	NODE_PORT: port({ devDefault: 3000 }),
	NODE_ENV: str({ choices: ['development', 'production', 'test'], devDefault: 'development' }),

	// Database Configuration
	DATABASE_URL: str(),

	// S3 Configuration
	S3_ENDPOINT: str({ devDefault: 'https://s3.amazonaws.com' }),
	S3_REGION: str({ devDefault: 'us-east-1' }),
	S3_ACCESS_KEY_ID: str(),
	S3_SECRET_ACCESS: str(),
	S3_BUCKET_NAME: str(),
});

export default env;
