import express from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { createCheckIn, getHistory } from '../controllers/checkinController';
import { validate, checkinSchema } from '../middleware/validation';

const router = express.Router();
router.use(authenticate);

router.post('/', validate(checkinSchema), createCheckIn);
router.get('/history', getHistory);

export default router;