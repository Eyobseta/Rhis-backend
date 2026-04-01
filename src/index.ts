import app from './app';
import { env } from './config/env';
import { logger } from './utils/logger';

const start = async () => {
  try {
    app.listen(env.PORT, () => {
      logger.info(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
    });
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
};


start();