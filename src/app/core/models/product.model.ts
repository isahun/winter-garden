import { Category } from './category.model';

export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  category_id: number | null;
  images: string[];
  size: string | null;
  created_at: string;
  categories?: Category;
  featured?: boolean;
}
