import express from 'express';
import healthRouter from './health.router';

const v1Router = express.Router();

v1Router.use(healthRouter);

export default v1Router;
