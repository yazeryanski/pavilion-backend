import exampleController from '@/controllers/example.controller';
import express from 'express';

const exampleRouter = express.Router();

exampleRouter.get('/example', exampleController);

export default exampleRouter;
