import { getNewsletterController } from '@/controllers/get.controller';
import express from 'express';

const newsletterRouter = express.Router();

// Returns the requesting user's newsletter (posts authored by their friends), cursor-paginated.
newsletterRouter.get('/newsletter', getNewsletterController);

export default newsletterRouter;
