import env from '@/config';
import logger from '@utils/logger';
import * as amqp from 'amqplib';

type Connection = Awaited<ReturnType<typeof amqp.connect>>;

let connection: Connection | null = null;
let channel: amqp.Channel | null = null;

/**
 * Establish the RabbitMQ connection + channel. Throws if the broker is unreachable so the
 * service refuses to start without its message broker (mirrors the DB-connect gating).
 */
export async function connectRabbitMQ(): Promise<amqp.Channel> {
	connection = await amqp.connect(env.RABBITMQ_URL);
	channel = await connection.createChannel();

	connection.on('error', (err) => logger.error(`RabbitMQ connection error: ${err}`));
	connection.on('close', () => logger.warn('RabbitMQ connection closed'));

	logger.info('Connected to RabbitMQ');

	return channel;
}

export function getChannel(): amqp.Channel {
	if (!channel) {
		throw new Error('RabbitMQ channel is not initialized');
	}

	return channel;
}
