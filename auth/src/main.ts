import express from 'express';
import healthRouter from '@routes/common.routes';
import getPort from '@utils/getPort';

const app = express();
const port = getPort();

app.use(express.json());
app.use(healthRouter);

app.listen(port, () => {
  //TODO: use logger
  console.log(`Server is running on port ${port}`);
});