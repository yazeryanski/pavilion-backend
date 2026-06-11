import type { Request, Response } from 'express';
import z from 'zod';

import { postIdSchema } from '@/schemas/post.schema';

import prisma from '@/utils/prisma';
import asyncHandler from '@utils/asyncHandler';

import type { Post } from '@/types/post.types';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

export const deletePostController = asyncHandler(async (req: Request, res: Response) => {
  const { success, data: postId, error } = postIdSchema.safeParse(req.params.postId);

  // if no content and no image - error
  if (!success) {
    res.error(`Invalid content - ${z.prettifyError(error)}`, 400);
    return;
  }

  try {
    const post = await prisma.post.delete({
      where: { id: postId, authorId: req.userId },
    });

    res.success<Post>(post);
    return;
  } catch (e: unknown) {
    if (e instanceof PrismaClientKnownRequestError && e.code === 'P2025') {
      res.error('Post not found or you do not have permission to delete this post', 404);
      return;
    }

    throw e;
  }
});
