import { Component, OnInit, AfterViewInit, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { CartService } from '../../core/services/cart.service';
import { PaymentService } from '../../core/services/payment.service';
import { Router } from '@angular/router';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-checkout',
  imports: [CurrencyPipe],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout implements OnInit, AfterViewInit {
  private http = inject(HttpClient);
  private cart = inject(CartService);
  private payment = inject(PaymentService);
  private router = inject(Router);

  total = this.cart.total;
  ready = signal(false);
  paying = signal(false);
  error = signal('');

  ngOnInit(): void {
    if (this.cart.items().length === 0) this.router.navigate(['/cart']);
  }

  async ngAfterViewInit() {
    try {
      const { clientSecret } = await firstValueFrom(
        this.http.post<{ clientSecret: string }>('/api/payment-intent', {
          amount: Math.round(this.total() * 100),
        }),
      );
      await this.payment.mount(clientSecret, '#payment-element');
      this.ready.set(true);
    } catch {
      this.error.set('Error carregant el formulari de pagament');
    }
  }

  async pay() {
    if (this.paying()) return;
    this.paying.set(true);
    this.error.set('');

    const errorMsg = await this.payment.confirm(`${window.location.origin}/account/orders`);
    if (errorMsg) {
      this.error.set(errorMsg);
      this.paying.set(false);
    }
  }
}
