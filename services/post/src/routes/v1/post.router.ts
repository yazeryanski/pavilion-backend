import { createPostController } from '@/controllers/create.controller';
import { deletePostController } from '@/controllers/delete.controller';
import { getPostController, getPostsByUserController } from '@/controllers/get.controller';
import { updatePostController } from '@/controllers/update.controller';
import uploadImage from '@/middlewares/upload.middleware';
import express from 'express';

const postRouter = express.Router();

// Create
postRouter.post('/post', uploadImage.single('image'), createPostController);

// Read
postRouter.get('/post/:postId', getPostController);
postRouter.get('/post/user/:userId', getPostsByUserController);

// Update
postRouter.put('/post/:postId', updatePostController);

// Delete
postRouter.delete('/post/:postId', deletePostController);

export default postRouter;
