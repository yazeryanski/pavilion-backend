import type { Request, Response } from 'express';
import z from 'zod';

import { postUpdateSchema } from '@/schemas/post.schema';

import prisma from '@/utils/prisma';
import asyncHandler from '@utils/asyncHandler';

import type { Post } from '@/types/post.types';

export const updatePostController = asyncHandler(async (req: Request, res: Response) => {
  const input = {
    content: req.body.content,
    id: req.params.postId,
  };

  const { success, data, error } = postUpdateSchema.safeParse(input);

  // if no content and no image - error
  if (!success) {
    res.error(`Invalid content - ${z.prettifyError(error)}`, 400);
    return;
  }

  const post = await prisma.post.update({
    where: { id: data.id, authorId: req.userId },
    data: {
      content: data.content,
    },
  });

  res.success<Post>(post);
});
