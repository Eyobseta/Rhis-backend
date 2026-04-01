import { Signals } from './scoringService';

export function generateAdvice(signals: Signals, healthScore: number): { message: string; type: 'info' | 'warning' } {
  // Priority: conflict > communication > mood > activity > healthy
  if (signals.conflictCount >= 3) {
    return {
      message: '⚠️ Frequent conflicts detected. Address issues early before escalation.',
      type: 'warning',
    };
  }
  if (signals.communicationTrend === 'down') {
    return {
      message: '💬 Communication is decreasing. Try initiating meaningful conversation.',
      type: 'warning',
    };
  }
  if (signals.moodStability === 'unstable') {
    return {
      message: '😟 Emotional satisfaction is low. Focus on quality time together.',
      type: 'warning',
    };
  }
  if (!signals.active) {
    return {
      message: '🔄 No recent interaction detected. Reconnect with your partner.',
      type: 'warning',
    };
  }
  if (healthScore >= 75) {
    return {
      message: '❤️ Your relationship is stable. Keep maintaining good communication.',
      type: 'info',
    };
  }
  return {
    message: '📈 Your relationship has room for improvement. Try scheduling quality time together.',
    type: 'info',
  };
}