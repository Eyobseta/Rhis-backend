import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { pool } from '../config/database';
import { computeHealthScore, getStatus, detectSignals, generateInsight } from '../services/scoringService';
import { generateAdvice } from '../services/adviceService';
import { logger } from '../utils/logger';

export const getScore = async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  try {
    // Get the user's relationship ID (if any)
    const relRes = await pool.query(
      `SELECT r.id FROM relationships r WHERE r.user_one_id = $1 OR r.user_two_id = $1 LIMIT 1`,
      [userId]
    );
    if (relRes.rows.length === 0) {
      res.json({
        healthScore: null,
        status: null,
        insight: 'No relationship found. Create one first.',
        todayCheckIn: false,
        signals: null,
      });
      return;
    }
    const relationshipId = relRes.rows[0].id;

    // Get latest check-in (to know if today's check-in exists)
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const todayCheckinRes = await pool.query(
      `SELECT id FROM check_ins WHERE user_id = $1 AND relationship_id = $2 AND created_at >= $3`,
      [userId, relationshipId, today]
    );
    const todayCheckIn = todayCheckinRes.rows.length > 0;

    // Compute signals
    const signals = await detectSignals(relationshipId, userId);
    const insight = generateInsight(signals);

    // Compute health score from latest check-in (or average of last 7 days?)
    // For simplicity, use latest check-in (as before)
    const latest = await pool.query(
      `SELECT mood, conflict_level, communication_quality FROM check_ins 
       WHERE user_id = $1 AND relationship_id = $2 
       ORDER BY created_at DESC LIMIT 1`,
      [userId, relationshipId]
    );
    let healthScore: number | null = null;
    let status: string | null = null;
    if (latest.rows.length > 0) {
      const { mood, conflict_level, communication_quality } = latest.rows[0];
      healthScore = computeHealthScore({
        mood,
        conflictLevel: conflict_level,
        communicationQuality: communication_quality,
      });
      status = getStatus(healthScore);
    }

    res.json({
      healthScore,
      status,
      insight,
      todayCheckIn,
      signals,
    });
  } catch (error) {
    logger.error('Get score error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAdvice = async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  try {
    // Get relationship ID
    const relRes = await pool.query(
      `SELECT r.id FROM relationships r WHERE r.user_one_id = $1 OR r.user_two_id = $1 LIMIT 1`,
      [userId]
    );
    if (relRes.rows.length === 0) {
      res.json({ message: 'Create a relationship to get advice.', type: 'info' });
      return;
    }
    const relationshipId = relRes.rows[0].id;

    const signals = await detectSignals(relationshipId, userId);

    // Compute health score for advice
    const latest = await pool.query(
      `SELECT mood, conflict_level, communication_quality FROM check_ins 
       WHERE user_id = $1 AND relationship_id = $2 
       ORDER BY created_at DESC LIMIT 1`,
      [userId, relationshipId]
    );
    let healthScore = 0;
    if (latest.rows.length > 0) {
      const { mood, conflict_level, communication_quality } = latest.rows[0];
      healthScore = computeHealthScore({
        mood,
        conflictLevel: conflict_level,
        communicationQuality: communication_quality,
      });
    }

    const advice = generateAdvice(signals, healthScore);
    res.json(advice);
  } catch (error) {
    logger.error('Get advice error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};