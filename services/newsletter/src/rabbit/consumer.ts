import { getChannel } from '@/rabbit/connection';
import { getFriendIds } from '@/services/profileClient';
import { POST_EXCHANGE, POST_PUBLISHED_ROUTING_KEY, type PostPublishedEvent } from '@/types/events';
import type { NewsletterEntry } from '@/types/newsletter.types';
import prisma from '@/utils/prisma';
import type { Prisma } from '@prisma/client';
import logger from '@utils/logger';

const QUEUE = 'newsletter.post.published';

/**
 * Subscribe to `post.published` and fan each post out onto its author's friends' newsletters.
 */
export async function startNewsletterConsumer(): Promise<void> {
	const channel = getChannel();

	await channel.assertExchange(POST_EXCHANGE, 'topic', { durable: true });
	const { queue } = await channel.assertQueue(QUEUE, { durable: true });
	await channel.bindQueue(queue, POST_EXCHANGE, POST_PUBLISHED_ROUTING_KEY);

	await channel.consume(queue, async (msg) => {
		if (!msg) {
			return;
		}

		try {
			const event = parseEvent(msg.content);
			await handlePostPublished(event);
			channel.ack(msg);
		} catch (err) {
			logger.error(`Failed to process ${POST_PUBLISHED_ROUTING_KEY} message: ${err}`);
			// Drop the message (no requeue) to avoid poison-message loops.
			channel.nack(msg, false, false);
		}
	});

	logger.info(`Newsletter consumer listening on queue "${queue}"`);
}

function parseEvent(content: Buffer): PostPublishedEvent {
	const raw = JSON.parse(content.toString());

	if (typeof raw?.postId !== 'string' || typeof raw?.authorId !== 'string') {
		throw new Error('Invalid post.published payload');
	}

	return { postId: raw.postId, authorId: raw.authorId };
}

async function handlePostPublished(event: PostPublishedEvent): Promise<void> {
	const { postId, authorId } = event;

	const friendIds = await getFriendIds(authorId);

	if (friendIds.length === 0) {
		logger.info(`Author ${authorId} has no friends; nothing to fan out for post ${postId}`);
		return;
	}

	await Promise.all(friendIds.map((friendId) => prependToNewsletter(friendId, { postId, authorId })));

	logger.info(`Fanned out post ${postId} to ${friendIds.length} friend(s)`);
}

/**
 * Prepend an entry to a recipient's newsletter (newest first), de-duplicating by postId.
 * Uses a transaction because the JSON array is updated read-modify-write.
 */
async function prependToNewsletter(userId: string, entry: NewsletterEntry): Promise<void> {
	await prisma.$transaction(async (tx) => {
		const existing = await tx.newsletter.findUnique({ where: { userId } });
		const current = (existing?.posts as NewsletterEntry[] | undefined) ?? [];

		const deduped = current.filter((item) => item.postId !== entry.postId);
		const posts = [entry, ...deduped] as unknown as Prisma.InputJsonValue;

		await tx.newsletter.upsert({
			where: { userId },
			create: { userId, posts },
			update: { posts },
		});
	});
}
