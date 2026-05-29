import { TestBed } from '@angular/core/testing';
import { PaymentService } from './payment.service';

describe('PaymentService', () => {
  let service: PaymentService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [PaymentService] });
    service = TestBed.inject(PaymentService);
  });

  it('Given mount no ha estat cridat, When es fa confirm, Then retorna missatge de formulari no inicialitzat', async () => {
    const result = await service.confirm('https://example.com/account/orders');
    expect(result).toBe('Formulari de pagament no inicialitzat');
  });
});
