import express from 'express';
import healthRouter from '@routes/common.routes';
import getPort from '@utils/getPort';
import responseHandler from '@middlewares/responseHandler.middleware';

const app = express();
const port = getPort();

// Middlewares
app.use(express.json());
app.use(responseHandler);

// Routes
app.use(healthRouter);

app.listen(port, () => {
  //TODO: use logger
  console.log(`Server is running on port ${port}`);
});