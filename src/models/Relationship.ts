export interface Relationship {
  id: string;
  user_one_id: string;
  user_two_id: string | null;
  created_at: Date;
}