import express from 'express';
import authRouter from './auth.routes';
import healthRouter from './health.routes';

const v1Router = express.Router();

v1Router.use(healthRouter);
v1Router.use(authRouter);

export default v1Router;
