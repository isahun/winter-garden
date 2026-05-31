import { Injectable, inject } from '@angular/core';
import { SupabaseService } from '../supabase.service';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private supabase = inject(SupabaseService).client;

  async getOrderStats() {
    return this.supabase.from('orders').select('id, total, status, created_at');
  }

  async getTopProducts() {
    return this.supabase
      .from('orders')
      .select('status, order_items(quantity, products(name))')
      .neq('status', 'cancelled');
  }

  async getActiveProductsCount() {
    return this.supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .gt('stock', 0);
  }
}
