import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Full error:', err);  // ← add this line
  logger.error('Unhandled error', err);
  res.status(500).json({ error: 'Internal server error' });
};