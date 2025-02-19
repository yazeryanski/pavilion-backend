import express from 'express';

const healthRouter = express.Router();

healthRouter.get('/health', (_req, res) => {
	res.success('Server is running');
});

export default healthRouter;
