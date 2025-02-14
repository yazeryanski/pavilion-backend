import express from 'express';

import responseHandler from '@middlewares/responseHandler.middleware';
import { httpLogger } from '@middlewares/httpLogger';

import getPort from '@utils/getPort';
import logger from '@utils/logger';

import router from '@routes/index';

const app = express();
const port = getPort();

// Middlewares
app.use(express.json());
app.use(httpLogger);
app.use(responseHandler);

// Routes
app.use('/api/', router);

app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
});