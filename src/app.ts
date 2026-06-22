import express from 'express';
import routes from './routes';
import { notFound } from './middlewares/not-found';
import { errorHandler } from './middlewares/error-handler';

const app = express();

app.use(express.json());          // parse JSON body -> req.body
app.use('/', routes);             // group: /books /authors /categories
app.use(notFound);                // route lạ -> 404
app.use(errorHandler);            // CUỐI CÙNG: dịch mọi lỗi -> response

export default app;
