import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { pool } from '../config/database';
import { logger } from '../utils/logger';

export const getRelationship = async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  try {
    const result = await pool.query(
      `SELECT r.id, r.user_one_id, r.user_two_id, r.created_at,
              u2.email as partner_email
       FROM relationships r
       LEFT JOIN users u2 ON r.user_two_id = u2.id
       WHERE r.user_one_id = $1 OR r.user_two_id = $1`,
      [userId]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'No relationship found' });
      return;
    }
    const rel = result.rows[0];
    const partnerEmail = rel.partner_email || null;
    res.json({
      id: rel.id,
      partnerEmail,
      createdAt: rel.created_at,
    });
  } catch (error) {
    logger.error('Get relationship error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createRelationship = async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;
  const { partnerEmail } = req.body;
  try {
    let partnerId = null;
    if (partnerEmail) {
      const partnerResult = await pool.query(`SELECT id FROM users WHERE email = $1`, [partnerEmail]);
      if (partnerResult.rows.length === 0) {
        res.status(404).json({ error: 'Partner email not found' });
        return;
      }
      partnerId = partnerResult.rows[0].id;
    }
    const result = await pool.query(
      `INSERT INTO relationships (user_one_id, user_two_id) VALUES ($1, $2) RETURNING id, created_at`,
      [userId, partnerId]
    );
    const rel = result.rows[0];
    res.status(201).json({
      id: rel.id,
      partnerEmail: partnerEmail || null,
      createdAt: rel.created_at,
    });
  } catch (error) {
    logger.error('Create relationship error', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};