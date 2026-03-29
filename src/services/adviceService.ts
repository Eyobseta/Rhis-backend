export function generateAdvice(healthScore: number): { message: string; type: 'info' | 'warning' } {
  if (healthScore < 40) {
    return {
      message: '⚠️ Your relationship health is low. Consider open communication and seeking support.',
      type: 'warning',
    };
  } else if (healthScore < 70) {
    return {
      message: '📈 Your relationship has room for improvement. Try scheduling quality time together.',
      type: 'info',
    };
  } else {
    return {
      message: '❤️ Great job! Keep nurturing your relationship with regular check-ins.',
      type: 'info',
    };
  }
}