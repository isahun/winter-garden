import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SupabaseService } from '../../../core/supabase.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Order } from '../../../core/models';
@Component({
  selector: 'app-account-orders',
  imports: [CurrencyPipe, DatePipe, RouterLink],
  templateUrl: './orders.html',
  styleUrl: './orders.css',
})
export class AccountOrders implements OnInit {
  private supabase = inject(SupabaseService).client;
  private auth = inject(AuthService);

  orders = signal<Order[]>([]);

  async ngOnInit() {
    const { data } = await this.supabase
    .from('orders')
    .select('*, order_items(*, products(name, images))')
    .eq('user_id', this.auth.user()!.id)
    .order('created_at', { ascending: false });

  this.orders.set(data ?? []);
  }
}
