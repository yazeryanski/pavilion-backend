import validateCredentials from '@middlewares/validateCredentials.middleware';
import { loginController } from 'controllers/login.controller';
import refreshController from 'controllers/refresh.controller';
import { registerController } from 'controllers/register.controller';
import express from 'express';

const authRouter = express.Router();

authRouter.post('/login', validateCredentials, loginController);
authRouter.post('/register', validateCredentials, registerController);
authRouter.post('/refresh', refreshController);

export default authRouter;
