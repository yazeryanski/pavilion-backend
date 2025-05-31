import express from 'express';
import healthRouter from './health.router';
import exampleRouter from './example.router';

const v1Router = express.Router();

v1Router.use(healthRouter);
v1Router.use(exampleRouter);

export default v1Router;
