import { randomUUID } from 'node:crypto';
import env from '@/config';

interface ProfileEnvelope {
	success: boolean;
	data: { friendIds?: string[] } | string;
}

/**
 * Fetch an author's friend ids from the profile service over HTTP.
 * Cross-service DB reads are forbidden, so this is the only way newsletter learns friendships.
 *
 * Profile's requestHeaderHandler requires the standard identity headers, so we send them
 * acting as the `newsletter` service on behalf of the author.
 */
export async function getFriendIds(authorId: string): Promise<string[]> {
	const url = `${env.PROFILE_SERVICE_URL}/api/v1/profile/${authorId}`;

	const response = await fetch(url, {
		method: 'GET',
		headers: {
			'x-user-id': authorId,
			'x-service-name': 'newsletter',
			'x-request-id': randomUUID(),
		},
	});

	if (!response.ok) {
		throw new Error(`Profile service responded with ${response.status} for author ${authorId}`);
	}

	const body = (await response.json()) as ProfileEnvelope;

	if (!body.success || typeof body.data === 'string') {
		throw new Error(`Failed to resolve friends for author ${authorId}`);
	}

	return body.data.friendIds ?? [];
}
