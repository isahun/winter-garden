export type WorkshopDifficulty = 'Principiant' | 'Regular' | 'Expert';

export interface Workshop {
  id: number;
  title: string;
  description: string | null;
  date: string;
  location: string | null;
  capacity: number;
  price: number | null;
  difficulty: WorkshopDifficulty | null;
  image_url: string | null;
  created_by: string | null;
  created_at: string;
}

export interface WorkshopSignup {
  id: number;
  workshop_id: number;
  user_id: string;
  created_at: string;
}
