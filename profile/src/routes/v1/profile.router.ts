import createProfileController from '@/controllers/createProfile.controller';
import getProfileController from '@/controllers/getProfile.controller';
import express from 'express';

const profileRouter = express.Router();

profileRouter.get('/:userId', getProfileController);
profileRouter.post('/', createProfileController);

export default profileRouter;
