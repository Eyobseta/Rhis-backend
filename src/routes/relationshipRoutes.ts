import express from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { getRelationship, createRelationship } from '../controllers/relationshipController';
import { validate, relationshipSchema } from '../middleware/validation';

const router = express.Router();
router.use(authenticate);

router.get('/', getRelationship);
router.post('/', validate(relationshipSchema), createRelationship);

export default router;