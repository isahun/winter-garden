import { Component, OnInit, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../../core/supabase.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Order } from '../../../core/models';

@Component({
  selector: 'app-admin-orders',
  imports: [CurrencyPipe, DatePipe, FormsModule],
  templateUrl: './orders.html',
})
export class AdminOrders implements OnInit {
  private supabase = inject(SupabaseService).client;
  private auth = inject(AuthService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  orders = signal<Order[]>([]);

  async ngOnInit() {
    if (!this.isBrowser) return;
    await this.auth.ready;
    const { data } = await this.supabase
      .from('orders')
      .select('*, profiles!user_id(email), order_items(*, products(name))')
      .order('created_at', { ascending: false });
    this.orders.set(data ?? []);
  }

  async updateStatusAdmin(id: number, status: string) {
    await this.supabase.from('orders').update({ status }).eq('id', id);
    await this.ngOnInit();
  }
}
