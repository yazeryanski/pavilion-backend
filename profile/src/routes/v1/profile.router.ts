import profileController from '@/controllers/getProfile.controller';
import express from 'express';

const profileRouter = express.Router();

profileRouter.get('/profile/:userId', profileController);

export default profileRouter;
