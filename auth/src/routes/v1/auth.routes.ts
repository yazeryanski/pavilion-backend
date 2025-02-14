import logger from '@utils/logger';
import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const authRouter = express.Router();

authRouter.post('/login', (req, res) => {
  logger.info(`Email: ${req.body.email}, Password: ${req.body.password}`);
  res.success({ token: uuidv4() });
})

export default authRouter;