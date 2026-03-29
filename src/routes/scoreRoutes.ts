import express from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { getScore, getAdvice } from '../controllers/scoreController';

const router = express.Router();
router.use(authenticate);

router.get('/', getScore);
router.get('/advice', getAdvice);

export default router;