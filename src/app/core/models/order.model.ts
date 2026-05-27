import { Product } from './product.model';

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  products?: Product;
}

export interface Order {
  id: number;
  user_id: string;
  status: 'pending' | 'shipped' | 'completed' | 'cancelled';
  total: number;
  created_at: string;
  order_items?: OrderItem[];
  profiles?: { email: string | null };
}
