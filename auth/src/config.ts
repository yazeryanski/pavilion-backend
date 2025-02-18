import { cleanEnv, str, port } from 'envalid';
import "dotenv/config";

const env = cleanEnv(process.env, {
  NODE_PORT: port({ devDefault: 3000 }),
  NODE_ENV: str({ choices: ['development', 'production', 'test'], devDefault: 'development' }),

  REDIS_HOST: str({ devDefault: '127.0.0.1' }),
  REDIS_PORT: port({ devDefault: 6379 }),
  REDIS_PASSWORD: str({ devDefault: undefined }),
});

export default env;