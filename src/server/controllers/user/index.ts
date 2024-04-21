import { Router, Request, Response } from 'express';

export const userRoute: Router = Router();

userRoute.get('/api/user', (_req: Request, res: Response) => {
  res.json({ name: 'alex' });
});
