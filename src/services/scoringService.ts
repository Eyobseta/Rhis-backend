export interface ScoreInput {
  mood: number;
  conflictLevel: number;
  communicationQuality: number;
}

export function computeHealthScore(input: ScoreInput): number {
  // Normalize inputs to 0-1 scale (1-5 -> 0-1)
  const moodNorm = (input.mood - 1) / 4;
  const commNorm = (input.communicationQuality - 1) / 4;
  const conflictNorm = (input.conflictLevel - 1) / 4;

  // Score = (mood*0.4 + comm*0.4 - conflict*0.2) scaled to 0-100
  let raw = moodNorm * 0.4 + commNorm * 0.4 - conflictNorm * 0.2;
  // raw ranges from -0.2 to 0.8, shift to 0-1
  let normalized = (raw + 0.2) / 1.0;
  normalized = Math.min(1, Math.max(0, normalized));
  return Math.round(normalized * 100);
}

export function calculateTrend(historicalScores: number[]): 'up' | 'down' | 'stable' {
  if (historicalScores.length < 2) return 'stable';
  const last = historicalScores[historicalScores.length - 1];
  const prev = historicalScores[historicalScores.length - 2];
  const diff = last - prev;
  if (diff > 5) return 'up';
  if (diff < -5) return 'down';
  return 'stable';
}