import { Component, OnInit, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { SupabaseService } from '../../../core/supabase.service';
import { AuthService } from '../../../core/auth/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { PaymentService } from '../../../core/services/payment.service';
import { Order } from '../../../core/models';

@Component({
  selector: 'app-account-orders',
  imports: [CurrencyPipe, DatePipe, RouterLink],
  templateUrl: './orders.html',
})
export class AccountOrders implements OnInit {
  private supabase = inject(SupabaseService).client;
  private auth = inject(AuthService);
  private cart = inject(CartService);
  private payment = inject(PaymentService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  orders = signal<Order[]>([]);
  paymentSuccess = signal(false);

  async ngOnInit() {
    if (!this.isBrowser) return;
    await this.auth.ready;

    const { payment_intent_client_secret, redirect_status } = this.route.snapshot.queryParams;

    if (payment_intent_client_secret && redirect_status === 'succeeded') {
      await this.handlePaymentReturn(payment_intent_client_secret);
      this.router.navigate([], { queryParams: {}, replaceUrl: true });
    }

    await this.loadOrders();
  }

  private async handlePaymentReturn(clientSecret: string) {
    const paymentIntent = await this.payment.retrievePaymentIntent(clientSecret);
    if (paymentIntent?.status !== 'succeeded') return;

    const cartItems = this.cart.items();
    const { data: order } = await this.supabase
      .from('orders')
      .insert({
        user_id: this.auth.user()?.id,
        total: paymentIntent.amount / 100,
        status: 'pending',
      })
      .select('id')
      .single();

    if (order && cartItems.length > 0) {
      await this.supabase.from('order_items').insert(
        cartItems.map((item) => ({
          order_id: order.id,
          product_id: item.product.id,
          quantity: item.quantity,
          unit_price: item.product.price,
        })),
      );
    }

    this.cart.clearCart();
    this.paymentSuccess.set(true);
  }

  private async loadOrders() {
    const { data } = await this.supabase
      .from('orders')
      .select('*, order_items(*, products(name, images))')
      .eq('user_id', this.auth.user()!.id)
      .order('created_at', { ascending: false });
    this.orders.set(data ?? []);
  }
}
