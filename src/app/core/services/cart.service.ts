import { Injectable, computed, signal } from '@angular/core';
import { Product } from '../models';

export interface CartItem {
  product: Product;
  quantity: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private _items = signal<CartItem[]>([]);

  readonly items = this._items.asReadonly();
  readonly total = computed(() =>
    this._items().reduce((sum, item) => sum + item.product.price * item.quantity, 0),
  );
  readonly count = computed(() =>
    this._items().reduce((sum, item) => sum + item.quantity, 0),
  );

  addToCart(product: Product) {
    this._items.update(items => {
      const existingItem = items.find(item => item.product.id === product.id);
      if(existingItem) {
        return items.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item );
      }
      return [...items, { product, quantity: 1 }];
    });
  }

  removeFromCart(productId: number) {
    this._items.update(items => items.filter(item => item.product.id !== productId));
  }

  updateQuantity(productId: number, quantity: number) {
    if (quantity <= 0) { this.removeFromCart(productId); return; }
    this._items.update(items =>
      items.map(item => item.product.id === productId ? { ...item, quantity } : item)
    );
  }

  clearCart() { this._items.set([]); }
}
