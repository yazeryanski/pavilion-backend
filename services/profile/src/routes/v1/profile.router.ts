import addFriendController from '@/controllers/addFriend.controller';
import createProfileController from '@/controllers/createProfile.controller';
import getProfileController from '@/controllers/getProfile.controller';
import removeFriendController from '@/controllers/removeFriend.controller';
import updateProfileController from '@/controllers/updateProfile.controller';
import express from 'express';

const profileRouter = express.Router();

profileRouter.get('/:userId', getProfileController);
profileRouter.post('/', createProfileController);
profileRouter.put('/:userId', updateProfileController);

// Friends
profileRouter.post('/:userId/friends', addFriendController);
profileRouter.delete('/:userId/friends/:friendId', removeFriendController);

export default profileRouter;
