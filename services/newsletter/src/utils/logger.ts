import { createLogger, format, transports } from 'winston';

const logger = createLogger({
	level: 'info', // Log level: "error", "warn", "info", "http", "debug"
	format: format.combine(
		format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
		format.printf(({ timestamp, level, message }) => `[${timestamp}] ${level.toUpperCase()}: ${message}`),
	),
	transports: [
		new transports.Console(),
		new transports.File({ filename: 'logs/error.log', level: 'error' }), // Save errors to file
		new transports.File({ filename: 'logs/combined.log' }), // Save all logs to file
	],
});

export default logger;
