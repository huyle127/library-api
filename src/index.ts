import app from './app';
import { env } from './config/env';

app.listen(env.PORT, () => {
  console.log(`Library API running at http://localhost:${env.PORT}`);
});
