import express from 'express';
import healthRouter from './health.router';
import profileRouter from './profile.router';

const v1Router = express.Router();

v1Router.use(healthRouter);
v1Router.use(profileRouter);

export default v1Router;
