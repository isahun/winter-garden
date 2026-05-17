export interface Profile {
  id: string;
  role: 'user' | 'admin';
  name: string | null;
  avatar_url: string | null;
  created_at: string;
}
