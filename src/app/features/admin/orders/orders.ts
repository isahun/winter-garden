import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../../core/supabase.service';
import { Order } from '../../../core/models';

@Component({
  selector: 'app-admin-orders',
  imports: [CurrencyPipe, DatePipe, FormsModule],
  templateUrl: './orders.html',
})
export class AdminOrders implements OnInit {
  private supabase = inject(SupabaseService).client;
  orders = signal<Order[]>([]);

  async ngOnInit() {
    const { data } = await this.supabase
      .from('orders')
      .select('*, order_items(*, products(name))')
      .order('created_at', { ascending: false });
    this.orders.set(data ?? []);
  }

  async updateStatusAdmin(id: number, status: string) {
    await this.supabase.from('orders').update({ status }).eq('id', id);
    await this.ngOnInit();
  }
}
