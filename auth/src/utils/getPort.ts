import { DEFAULT_PORT } from "config";
import "dotenv/config";
import logger from "./logger";

export default function getPort(): number {
  const port = process.env.PORT;

  if (!port) {
    logger.warn(`No port specified in .env file. Using default port ${DEFAULT_PORT}.`);
  }

  return port ? Number.parseInt(port, 10) : DEFAULT_PORT;
}