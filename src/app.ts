import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import authRoutes from './routes/authRoutes';
import relationshipRoutes from './routes/relationshipRoutes';
import checkinRoutes from './routes/checkinRoutes';
import scoreRoutes from './routes/scoreRoutes';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: env.NODE_ENV === 'production' ? process.env.CLIENT_ORIGIN : '*',
  credentials: true,
}));
app.set('trust proxy', 1); 
app.use(express.json());
app.use(cors({
  origin: '*', 
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  message: 'Too many requests, please try again later.',
});
app.use('/api', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/relationship', relationshipRoutes);
app.use('/api/checkin', checkinRoutes);
app.use('/api/score', scoreRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

export default app;