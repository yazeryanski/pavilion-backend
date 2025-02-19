import validateCredentials from '@middlewares/validateCredentials.middleware';
import { loginController, registerController } from 'controllers/auth.controller';
import express from 'express';

const authRouter = express.Router();

authRouter.post('/login', validateCredentials, loginController)
authRouter.post('/register', validateCredentials, registerController)

export default authRouter;