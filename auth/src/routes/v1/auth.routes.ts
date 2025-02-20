import express from 'express';

import validateCredentials from '@middlewares/validateCredentials.middleware';
import validateRefreshToken from '@middlewares/validateRefreshToken.middleware';

import loginController from '@controllers/login.controller';
import logoutController from '@controllers/logout.controller';
import refreshController from '@controllers/refresh.controller';
import registerController from '@controllers/register.controller';

const authRouter = express.Router();

authRouter.post('/login', validateCredentials, loginController);
authRouter.post('/register', validateCredentials, registerController);
authRouter.post('/refresh', validateRefreshToken, refreshController);
authRouter.post('/logout', validateRefreshToken, logoutController);

export default authRouter;
