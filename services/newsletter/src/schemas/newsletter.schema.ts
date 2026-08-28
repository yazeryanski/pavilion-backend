import z from 'zod';

/**
 * Query params for GET /newsletter.
 * `cursor` is a postId taken from the previous page's response.
 */
export const getNewsletterSchema = z.object({
	limit: z.number().min(1).max(100).default(10),
	cursor: z.string().optional(),
});
