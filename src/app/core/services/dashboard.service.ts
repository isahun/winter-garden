import { Injectable, inject } from '@angular/core';
import { SupabaseService } from '../supabase.service';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private supabase = inject(SupabaseService).client;

  async getOrderStats() {
    return this.supabase.from('orders').select('total, status, created_at');
  }

  async getActiveProductsCount() {
    return this.supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .gt('stock', 0);
  }
}
