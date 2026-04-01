import { pool } from '../config/database';

export interface ScoreInput {
  mood: number;
  conflictLevel: number;
  communicationQuality: number;
}

export function computeHealthScore(input: ScoreInput): number {
  // Normalize to 0-1 scale (1-5 -> 0-1)
  const moodNorm = (input.mood - 1) / 4;
  const commNorm = (input.communicationQuality - 1) / 4;
  const conflictNorm = (input.conflictLevel - 1) / 4;

  // Weighted formula: (mood * 0.4 + communication * 0.4 - conflict * 0.3) * 100
  let raw = moodNorm * 0.4 + commNorm * 0.4 - conflictNorm * 0.3;
  // raw ranges from -0.3 to 0.8, shift to 0-1
  let normalized = (raw + 0.3) / 1.1;
  normalized = Math.min(1, Math.max(0, normalized));
  return Math.round(normalized * 100);
}

export function getStatus(score: number): string {
  if (score >= 75) return 'good';
  if (score >= 50) return 'warning';
  return 'danger';
}

export interface Signals {
  communicationTrend: 'up' | 'down' | 'stable';
  conflictCount: number;
  moodStability: 'stable' | 'unstable';
  active: boolean; // true if last check-in within 3 days
}

export async function detectSignals(relationshipId: string, userId: string): Promise<Signals> {
  // Use last 7 days
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  // Get all check-ins for this user in the relationship in the last 7 days
  const result = await pool.query(
    `SELECT mood, conflict_level, communication_quality, created_at
     FROM check_ins
     WHERE relationship_id = $1 AND user_id = $2 AND created_at >= $3
     ORDER BY created_at ASC`,
    [relationshipId, userId, sevenDaysAgo]
  );
  const rows = result.rows;

  // 1. Communication trend: compare last 3 days vs previous 4 days
  const now = new Date();
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString();
  const recent = rows.filter(row => new Date(row.created_at) >= new Date(threeDaysAgo));
  const older = rows.filter(row => new Date(row.created_at) < new Date(threeDaysAgo));

  const recentAvgComm = recent.length ? recent.reduce((sum, r) => sum + r.communication_quality, 0) / recent.length : 0;
  const olderAvgComm = older.length ? older.reduce((sum, r) => sum + r.communication_quality, 0) / older.length : 0;

  let communicationTrend: 'up' | 'down' | 'stable' = 'stable';
  if (recentAvgComm > olderAvgComm) communicationTrend = 'up';
  else if (recentAvgComm < olderAvgComm) communicationTrend = 'down';

  // 2. Conflict count: conflict_level >= 4 in last 7 days
  const conflictCount = rows.filter(row => row.conflict_level >= 4).length;

  // 3. Mood stability: variance of mood over last 7 days
  let moodStability: 'stable' | 'unstable' = 'stable';
  if (rows.length >= 2) {
    const moods = rows.map(r => r.mood);
    const mean = moods.reduce((a, b) => a + b, 0) / moods.length;
    const variance = moods.reduce((sum, m) => sum + Math.pow(m - mean, 2), 0) / moods.length;
    if (variance > 0.5) moodStability = 'unstable';
  }

  // 4. Activity detection: last check-in > 3 days ago?
  const lastCheckin = rows.length ? new Date(rows[rows.length - 1].created_at) : null;
  const active = lastCheckin ? (now.getTime() - lastCheckin.getTime()) <= 3 * 24 * 60 * 60 * 1000 : false;

  return { communicationTrend, conflictCount, moodStability, active };
}

export function generateInsight(signals: Signals): string {
  if (signals.communicationTrend === 'down') return 'Communication dropped this week';
  if (signals.conflictCount >= 3) return 'High conflict detected';
  if (signals.moodStability === 'unstable') return 'Mood fluctuations observed';
  if (!signals.active) return 'No recent check-ins';
  return 'Your relationship is stable';
}