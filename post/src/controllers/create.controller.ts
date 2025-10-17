import type { Request, Response } from 'express';
import z from 'zod';

import { contentSchema } from '@/schemas/post.schema';

import prisma from '@/utils/prisma';
import { uploadObject } from '@/utils/s3';
import asyncHandler from '@utils/asyncHandler';

import type { Post } from '@/types/post.types';

interface CreatePostRequest extends Request {
  file?: Express.Multer.File;
  body: {
    content?: string;
  };
}

export const createPostController = asyncHandler(async (req: CreatePostRequest, res: Response) => {
  const { success, data: content, error } = contentSchema.safeParse(req.body.content);

  // if no content and no image - error
  if (!success && !req.file) {
    res.error(`Invalid content - ${z.prettifyError(error)}`, 400);
    return;
  }

  const imageUrl = req.file ? await uploadObject(req.file) : null;

  const post = await prisma.post.create({
    data: {
      content: content || null,
      imageUrl,
      authorId: req.userId,
    },
  });

  res.success<Post>(post);
});
