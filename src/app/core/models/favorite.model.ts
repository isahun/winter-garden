import { Product } from "./product.model";

export interface Favorite {
  id: number;
  user_id: string;
  product_id: number;
  created_at: string;
  products?: Product;
}
