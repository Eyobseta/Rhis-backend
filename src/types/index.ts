export interface ScoreResponse {
  healthScore: number | null;
  status: string | null;
  insight: string;
  todayCheckIn: boolean;
  signals: {
    communicationTrend: 'up' | 'down' | 'stable';
    conflictCount: number;
    moodStability: 'stable' | 'unstable';
    active: boolean;
  } | null;
}

export interface AdviceResponse {
  message: string;
  type: 'info' | 'warning';
}

export interface RelationshipResponse {
  id: string;
  partner: {
    id: string;
    name: string;
    email: string;
  } | null;
  createdAt: string;
  daysTogether: number;
}