import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { vi } from 'vitest';
import { AuthService } from './auth.service';
import { SupabaseService } from '../supabase.service';
import { CartService } from '../services/cart.service';

describe('AuthService', () => {
  let service: AuthService;
  let signInSpy: ReturnType<typeof vi.fn>;
  let signOutSpy: ReturnType<typeof vi.fn>;
  let clearCartSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    signInSpy = vi.fn().mockResolvedValue({ data: { session: null, user: null }, error: null });
    signOutSpy = vi.fn().mockResolvedValue({ error: null });
    clearCartSpy = vi.fn();

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        {
          provide: SupabaseService,
          useValue: {
            client: {
              auth: {
                getSession: () => Promise.resolve({ data: { session: null } }),
                onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
                signInWithPassword: signInSpy,
                signOut: signOutSpy,
              },
              from: () => ({
                select: () => ({
                  eq: () => ({
                    single: () => Promise.resolve({ data: { role: 'user' }, error: null }),
                  }),
                }),
              }),
            },
          },
        },
        { provide: Router, useValue: { navigate: vi.fn() } },
        { provide: CartService, useValue: { clearCart: clearCartSpy } },
      ],
    });
    service = TestBed.inject(AuthService);
  });

  it('Given cap sessió activa, When es comprova isLoggedIn, Then retorna false', async () => {
    await service.ready;
    expect(service.isLoggedIn()).toBe(false);
  });

  it('Given rol user per defecte, When es comprova isAdmin, Then retorna false', async () => {
    await service.ready;
    expect(service.isAdmin()).toBe(false);
  });

  it('Given credencials vàlides, When es fa login, Then crida signInWithPassword amb email i password', async () => {
    await service.login('usuari@test.com', 'password123');
    expect(signInSpy).toHaveBeenCalledWith({ email: 'usuari@test.com', password: 'password123' });
  });

  it('Given usuari loguejat, When es fa logout, Then crida signOut i clearCart', async () => {
    await service.logout();
    expect(signOutSpy).toHaveBeenCalled();
    expect(clearCartSpy).toHaveBeenCalled();
  });
});
