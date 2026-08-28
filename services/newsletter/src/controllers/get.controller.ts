import type { Request, Response } from 'express';
import z from 'zod';

import { getNewsletterSchema } from '@/schemas/newsletter.schema';
import type { NewsletterEntry } from '@/types/newsletter.types';
import prisma from '@/utils/prisma';
import asyncHandler from '@utils/asyncHandler';

/**
 * Get the requesting user's newsletter with cursor-based pagination.
 * The feed is the `posts` JSON array (newest first); the cursor is a postId.
 */
export const getNewsletterController = asyncHandler(async (req: Request, res: Response) => {
	const input = {
		limit: req.query.limit ? Number(req.query.limit) : undefined,
		cursor: req.query.cursor as string | undefined,
	};

	const { success, data, error } = getNewsletterSchema.safeParse(input);

	if (!success) {
		res.error(`Invalid request - ${z.prettifyError(error)}`, 400);
		return;
	}

	const newsletter = await prisma.newsletter.findUnique({
		where: { userId: req.userId },
	});

	const entries = (newsletter?.posts as NewsletterEntry[] | undefined) ?? [];

	// Locate the slice start from the cursor (a postId). Newest-first order is kept on write.
	let startIndex = 0;
	if (data.cursor) {
		const cursorIndex = entries.findIndex((entry) => entry.postId === data.cursor);
		// Unknown cursor -> start from the beginning; otherwise continue right after it.
		startIndex = cursorIndex === -1 ? 0 : cursorIndex + 1;
	}

	// take limit + 1 to detect whether there's a next page
	const slice = entries.slice(startIndex, startIndex + data.limit + 1);

	const hasNextPage = slice.length > data.limit;
	let newCursor: string | null = null;

	if (hasNextPage) {
		slice.pop(); // remove the extra entry
		newCursor = slice[slice.length - 1].postId;
	}

	res.success<{ posts: NewsletterEntry[]; cursor: string | null }>({
		posts: slice,
		cursor: newCursor,
	});
});
