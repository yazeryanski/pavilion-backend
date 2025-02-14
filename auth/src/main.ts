import express from 'express';

import responseHandler from '@middlewares/responseHandler.middleware';
import { httpLogger } from '@middlewares/httpLogger';

import healthRouter from '@routes/common.routes';

import getPort from '@utils/getPort';
import logger from '@utils/logger';

const app = express();
const port = getPort();

// Middlewares
app.use(express.json());
app.use(httpLogger);
app.use(responseHandler);

// Routes
app.use(healthRouter);

app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
});