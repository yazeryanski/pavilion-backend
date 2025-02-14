import express from 'express';

const healthRouter = express.Router();

healthRouter.get('/health', (_req, res) => {
  res.send('OK');
});

export default healthRouter;