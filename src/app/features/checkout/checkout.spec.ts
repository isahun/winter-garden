import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

describe('Integració: POST /api/payment-intent', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it("Given una comanda de 45€, When es crea el PaymentIntent, Then s'envia { amount: 4500 } al servidor", () => {
    http.post('/api/payment-intent', { amount: 45 * 100 }).subscribe();

    const req = httpMock.expectOne('/api/payment-intent');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.amount).toBe(4500);

    req.flush({ clientSecret: 'pi_test_abc123_secret_xyz' });
  });

  it('Given un import de 0€, When el servidor retorna 400, Then el frontend rep un error', () => {
    let errorStatus = 0;

    http.post('/api/payment-intent', { amount: 0 }).subscribe({
      error: (err) => (errorStatus = err.status),
    });

    const req = httpMock.expectOne('/api/payment-intent');
    req.flush({ error: 'Import invàlid' }, { status: 400, statusText: 'Bad Request' });

    expect(errorStatus).toBe(400);
  });
});
