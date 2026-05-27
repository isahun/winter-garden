import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { loadStripe, Stripe, StripeElements, PaymentIntent } from '@stripe/stripe-js';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private stripe: Stripe | null = null;
  private elements: StripeElements | null = null;

  private async getStripe(): Promise<Stripe | null> {
    if (!this.isBrowser) return null;
    if (!this.stripe) this.stripe = await loadStripe(environment.stripeKey);
    return this.stripe;
  }

  async mount(clientSecret: string, elementId: string): Promise<void> {
    const stripe = await this.getStripe();
    if (!stripe) return;

    this.elements = stripe.elements({ clientSecret });
    const paymentElement = this.elements.create('payment');

    return new Promise((resolve) => {
      paymentElement.on('ready', () => resolve());
      paymentElement.mount(elementId);
    });
  }

  async confirm(returnUrl: string): Promise<string | undefined> {
    if (!this.stripe || !this.elements) return 'Formulari de pagament no inicialitzat';

    const { error } = await this.stripe.confirmPayment({
      elements: this.elements,
      confirmParams: { return_url: returnUrl },
    });

    return error?.message;
  }

  async retrievePaymentIntent(clientSecret: string): Promise<PaymentIntent | null> {
    const stripe = await this.getStripe();
    if (!stripe) return null;

    const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret);
    return paymentIntent ?? null;
  }
}
