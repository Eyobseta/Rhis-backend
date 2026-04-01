import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { pool } from '../config/database';
import { logger } from '../utils/logger';

export const createCheckIn = async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const { mood, conflictLevel, communicationQuality } = req.body;

  // Get the user's relationship ID
  const relRes = await pool.query(
    `SELECT r.id FROM relationships r WHERE r.user_one_id = $1 OR r.user_two_id = $1 LIMIT 1`,
    [userId]
  );
  if (relRes.rows.length === 0) {
    res.status(400).json({ error: 'No relationship found. Please create one first.' });
    return;
  }
  const relationshipId = relRes.rows[0].id;

  try {
    const result = await pool.query(
      `INSERT INTO check_ins (user_id, relationship_id, mood, conflict_level, communication_quality) 
       VALUES ($1, $2, $3, $4, $5) RETURNING id, created_at`,
      [userId, relationshipId, mood, conflictLevel, communicationQuality]
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
      `SELECT id, mood, conflict_level, communication_quality, created_at 
       FROM check_ins 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
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