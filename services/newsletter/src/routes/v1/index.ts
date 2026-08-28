import express from 'express';
import healthRouter from './health.router';
import newsletterRouter from './newsletter.router';

const v1Router = express.Router();

v1Router.use(healthRouter);
v1Router.use(newsletterRouter);

export default v1Router;
