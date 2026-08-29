import { url, cleanEnv, port, str } from 'envalid';
import 'dotenv/config';

const env = cleanEnv(process.env, {
	// Server Configuration
	NODE_PORT: port({ devDefault: 3004 }),
	NODE_ENV: str({ choices: ['development', 'production', 'test'], devDefault: 'development' }),

	// Database Configuration
	DATABASE_URL: str(),

	// Shared with the API gateway; see gatewayOnly.middleware. Only enforced in production,
	// hence the devDefault.
	GATEWAY_SECRET: str({ devDefault: 'dev-gateway-secret' }),

	// RabbitMQ Configuration
	RABBITMQ_URL: str({ devDefault: 'amqp://guest:guest@localhost:5672' }),

	// Profile Service (used to resolve an author's friends for fan-out)
	PROFILE_SERVICE_URL: url({ devDefault: 'http://localhost:3002' }),
});

export default env;
