import { Injectable, inject, signal, computed, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { SupabaseService } from '../supabase.service';
import { AuthService } from '../auth/auth.service';
import { Product } from '../models';

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private supabase = inject(SupabaseService).client;
  private auth = inject(AuthService);
  private router = inject(Router);
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private _favoriteIds = signal<Set<number>>(new Set());
  readonly favoriteIds = this._favoriteIds.asReadonly();

  isFavorite = (productId: number) => computed(() => this._favoriteIds().has(productId));

  async loadFavorites() {
    const user = this.auth.user();
    if(!user) {
      this._favoriteIds.set(new Set());
      return;
    }

    const { data } = await this.supabase
    .from('favorites')
    .select('product_id')
    .eq('user_id', user.id);

  this._favoriteIds.set(new Set((data ?? []).map((favorite) => favorite.product_id)));
  }

  async toggleFavorite(product: Product) {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/auth/login']);
      return;
    }

    const userId = this.auth.user()!.id;
    const isFav = this._favoriteIds().has(product.id);

    if (isFav) {
      await this.supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', product.id);

    this._favoriteIds.update((set) => {
      const updatedSet = new Set(set);
      updatedSet.delete(product.id);
      return updatedSet;
    });
    } else {
      await this.supabase.from('favorites').insert({ user_id: userId, product_id: product.id });

      this._favoriteIds.update((set) => new Set([...set, product.id]));
    }
  }

  async getFavorites(): Promise<Product[]> {
    const user = this.auth.user();
    if (!user) return [];

    const { data } = await this.supabase
      .from('favorites')
      .select('products(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    return (data ?? []).map((favorite) => favorite.products as unknown as Product);
  }
}
