import z from 'zod';

export const contentSchema = z.string().max(500).nonempty();

export const postIdSchema = z.uuidv4().nonempty();

export const postUpdateSchema = z.object({
	content: contentSchema,
	id: postIdSchema,
});

export const postsByUserSchema = z.object({
  userId: z.string().nonempty(),
  limit: z.number().min(1).max(100).default(10),
  cursor: z.uuidv4().optional(),
});