import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { pool } from '../config/database';
import { logger } from '../utils/logger';

export const createCheckIn = async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const { mood, conflictLevel, communicationQuality } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO check_ins (user_id, mood, conflict_level, communication_quality) VALUES ($1, $2, $3, $4) RETURNING id, created_at`,
      [userId, mood, conflictLevel, communicationQuality]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    logger.error('Create checkin error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getHistory = async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  try {
    const result = await pool.query(
      `SELECT id, mood, conflict_level, communication_quality, created_at FROM check_ins WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    res.json(result.rows.map(row => ({
      id: row.id,
      mood: row.mood,
      conflictLevel: row.conflict_level,
      communicationQuality: row.communication_quality,
      createdAt: row.created_at,
    })));
  } catch (error) {
    logger.error('Get history error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};