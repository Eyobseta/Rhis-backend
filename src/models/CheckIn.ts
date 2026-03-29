export interface CheckIn {
  id: string;
  user_id: string;
  mood: number;
  conflict_level: number;
  communication_quality: number;
  created_at: Date;
}