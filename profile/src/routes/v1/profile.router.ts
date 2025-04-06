import createProfileController from '@/controllers/createProfile.controller';
import getProfileController from '@/controllers/getProfile.controller';
import updateProfileController from '@/controllers/updateProfile.controller';
import express from 'express';

const profileRouter = express.Router();

profileRouter.get('/:userId', getProfileController);
profileRouter.post('/', createProfileController);
profileRouter.put('/:userId', updateProfileController);

export default profileRouter;
