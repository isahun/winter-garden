import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { Router } from '@angular/router';
import { vi } from 'vitest';
import { FavoritesService } from './favorites.service';
import { SupabaseService } from '../supabase.service';
import { AuthService } from '../auth/auth.service';
import { Product } from '../models';

const mockProduct: Product = {
  id: 5, name: 'Jardí Mori', price: 82, stock: 6,
  description: null, category_id: 1, images: [], size: 'M', created_at: '',
};

describe('FavoritesService', () => {
  let service: FavoritesService;
  let navigateSpy: ReturnType<typeof vi.fn>;
  let isLoggedInSignal: ReturnType<typeof signal<boolean>>;
  let userSignal: ReturnType<typeof signal<any>>;
  let fromSpy: ReturnType<typeof vi.fn>;

  const makeChain = (data: any) => {
    const chain: any = {};
    ['select', 'eq', 'order'].forEach(m => (chain[m] = () => chain));
    chain.insert = () => Promise.resolve({ error: null });
    chain.delete = () => chain;
    chain.then = (res: any) => Promise.resolve({ data, error: null }).then(res);
    return chain;
  };

  beforeEach(() => {
    navigateSpy = vi.fn();
    isLoggedInSignal = signal(false);
    userSignal = signal<any>(null);
    fromSpy = vi.fn().mockImplementation(() => makeChain([]));

    TestBed.configureTestingModule({
      providers: [
        FavoritesService,
        {
          provide: AuthService,
          useValue: { isLoggedIn: isLoggedInSignal, user: userSignal },
        },
        { provide: SupabaseService, useValue: { client: { from: fromSpy } } },
        { provide: Router, useValue: { navigate: navigateSpy } },
      ],
    });
    service = TestBed.inject(FavoritesService);
  });

  it('Given cap favorit carregat, When es comprova isFavorite(5), Then retorna false', () => {
    expect(service.isFavorite(5)()).toBe(false);
  });

  it('Given favorits carregats amb id 5, When es comprova isFavorite(5), Then retorna true', async () => {
    userSignal.set({ id: 'user-123' });
    fromSpy.mockImplementation(() => makeChain([{ product_id: 5 }]));
    await service.loadFavorites();
    expect(service.isFavorite(5)()).toBe(true);
  });

  it('Given usuari no loguejat, When fa toggleFavorite, Then redirigeix a /auth/login', async () => {
    isLoggedInSignal.set(false);
    await service.toggleFavorite(mockProduct);
    expect(navigateSpy).toHaveBeenCalledWith(['/auth/login']);
  });

  it('Given usuari loguejat i producte no és favorit, When fa toggleFavorite, Then isFavorite(5) passa a true', async () => {
    isLoggedInSignal.set(true);
    userSignal.set({ id: 'user-123' });
    await service.toggleFavorite(mockProduct);
    expect(service.isFavorite(5)()).toBe(true);
  });
});
