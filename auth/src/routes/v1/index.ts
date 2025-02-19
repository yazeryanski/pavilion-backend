import express from 'express';
import healthRouter from './health.routes';
import authRouter from './auth.routes';

const v1Router = express.Router();

v1Router.use(healthRouter);
v1Router.use('/auth', authRouter);

export default v1Router;
