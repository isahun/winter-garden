export interface Workshop {
  id: number;
  title: string;
  description: string | null;
  date: string;
  location: string | null;
  capacity: number;
  image_url: string | null;
  created_by: string | null;
  created_at: string;
  price: number | null;
  difficulty: 'Principiant' | 'Regular' | 'Expert' | null;
  store_id: number | null;
}

export interface WorkshopSignup {
  id: number;
  workshop_id: number;
  user_id: string;
  created_at: string;
}
