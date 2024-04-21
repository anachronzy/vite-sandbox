import { userRoute } from './user/index.js';
import { type Application } from 'express';

export const withApiRoutes = (app: Application) => {
  app.use(userRoute);

  return app;
};
