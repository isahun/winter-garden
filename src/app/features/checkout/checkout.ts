import { loadStripe } from '@stripe/stripe-js';
import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/auth/auth.service';
import { SupabaseService } from '../../core/supabase.service';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-checkout',
  imports: [CurrencyPipe],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout implements OnInit {
  private http = inject(HttpClient);
  private cart = inject(CartService);
  private auth = inject(AuthService);
  private supabase = inject(SupabaseService).client;
  private router = inject(Router);

  total = this.cart.total;
  loading = signal(false);
  error = signal('');

  async pay() {
    this.loading.set(true);
    this.error.set('');

    try {
      const { clientSecret } = await firstValueFrom(
        this.http.post<{ clientSecret: string }>('/api/payment-intent', {
          amount: Math.round(this.total() * 100),
        }),
      );

      const stripe = await loadStripe(environment.stripeKey);
      const result = await stripe!.confirmPayment({
        clientSecret,
        confirmParams: { return_url: `${window.location.origin}/account/orders` },
      });

      if (result.error) {
        this.error.set(result.error.message ?? 'Error desconegut');
        return;
      }

      await this.supabase.from('orders').insert({
        user_id: this.auth.user()?.id,
        total: this.total(),
        status: 'pending',
      });

      this.cart.clearCart();
    } catch {
      this.error.set('Error en processar el pagament');
    } finally {
      this.loading.set(false);
    }
  }

  ngOnInit(): void {
    if (this.cart.items().length === 0) this.router.navigate(['/cart']);
  }
}
