import type { Request, Response } from 'express';
import z from 'zod';

import { postIdSchema, postsByUserSchema } from '@/schemas/post.schema';

import prisma from '@/utils/prisma';
import asyncHandler from '@utils/asyncHandler';

import type { Post } from '@/types/post.types';

export const getPostController = asyncHandler(async (req: Request, res: Response) => {
  const { success, data: postId, error } = postIdSchema.safeParse(req.params.postId);

  // if no content and no image - error
  if (!success) {
    res.error(`Invalid content - ${z.prettifyError(error)}`, 400);
    return;
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post) {
    res.error('Post not found', 404);
    return;
  }

  res.success<Post>(post);
});


/**
 * Get posts by user with pagination
 * Cursor is a post id (uuid v4)
 */
export const getPostsByUserController = asyncHandler(async (req: Request, res: Response) => {
  const input = {
    userId: req.params.userId,
    limit: req.query.limit ? Number(req.query.limit) : undefined,
    cursor: req.query.cursor as string | undefined,
  }

  const { success, data, error } = postsByUserSchema.safeParse(input);

  if (!success) {
    res.error(`Invalid request - ${z.prettifyError(error)}`, 400);
    return;
  }

  const posts = await prisma.post.findMany({
    where: { authorId: data.userId },
    take: data.limit + 1, // hack to check if there's a next page
    cursor: data.cursor ? { id: data.cursor } : undefined,
    orderBy: { createdAt: 'desc' },
  });

  const hasNextPage = posts.length > data.limit;
  let newCursor = null;

  if (hasNextPage) {
    newCursor = posts[posts.length - 1].id;
    posts.pop(); // remove the extra post
  }

  res.success<{
    posts: Post[];
    cursor: string | null;
  }>({
    posts,
    cursor: newCursor,
  });
});