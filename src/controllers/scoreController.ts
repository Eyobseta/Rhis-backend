import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { pool } from '../config/database';
import { computeHealthScore, calculateTrend } from '../services/scoringService';
import { generateAdvice } from '../services/adviceService';
import { logger } from '../utils/logger';

export const getScore = async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  try {
    // Get latest check-in
    const latest = await pool.query(
      `SELECT mood, conflict_level, communication_quality FROM check_ins WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );
    if (latest.rows.length === 0) {
      res.json({ healthScore: null, trend: 'stable', message: 'No check-ins yet' });
      return;
    }
    const { mood, conflict_level, communication_quality } = latest.rows[0];
    const currentScore = computeHealthScore({
      mood,
      conflictLevel: conflict_level,
      communicationQuality: communication_quality,
    });
    // Get last 5 scores for trend
    const history = await pool.query(
      `SELECT mood, conflict_level, communication_quality FROM check_ins WHERE user_id = $1 ORDER BY created_at DESC LIMIT 6`,
      [userId]
    );
    const scores = history.rows.map(row => computeHealthScore({
      mood: row.mood,
      conflictLevel: row.conflict_level,
      communicationQuality: row.communication_quality,
    })).reverse();
    const trend = calculateTrend(scores);
    res.json({ healthScore: currentScore, trend });
  } catch (error) {
    logger.error('Get score error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAdvice = async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  try {
    const latest = await pool.query(
      `SELECT mood, conflict_level, communication_quality FROM check_ins WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );
    if (latest.rows.length === 0) {
      res.json({ message: 'Complete a check-in to get advice.', type: 'info' });
      return;
    }
    const { mood, conflict_level, communication_quality } = latest.rows[0];
    const score = computeHealthScore({
      mood,
      conflictLevel: conflict_level,
      communicationQuality: communication_quality,
    });
    const advice = generateAdvice(score);
    res.json(advice);
  } catch (error) {
    logger.error('Get advice error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};