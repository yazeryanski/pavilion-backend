import express from 'express';
import healthRouter from './health.router';
import postRouter from './post.router';

const v1Router = express.Router();

v1Router.use(healthRouter);
v1Router.use(postRouter);

export default v1Router;
