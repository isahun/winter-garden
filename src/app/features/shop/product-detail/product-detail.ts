import { Component, OnInit, inject, signal, input, numberAttribute } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { Product } from '../../../core/models';
import { FavoritesService } from '../../../core/services/favorites.service';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-product-detail',
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css',
})
export class ProductDetail implements OnInit {
  id = input.required({ transform: numberAttribute });

  private productService = inject(ProductService);
  private cart = inject(CartService);
  favorites = inject(FavoritesService);
  auth = inject(AuthService);

  product = signal<Product | null>(null);
  added = signal(false);
  related = signal<Product[]>([]);
  lightboxOpen = signal(false);

  async ngOnInit() {
    const { data } = await this.productService.getProductById(this.id());
    this.product.set(data);
    if (data?.category_id) {
      const { data: rel } = await this.productService.getRelatedProducts(data.category_id, data.id);
      this.related.set(rel ?? []);
    }
    if (this.auth.isLoggedIn()) await this.favorites.loadFavorites();
  }

  addProductToCart() {
    if (!this.product()) return;
    this.cart.addToCart(this.product()!);
    this.added.set(true);
    setTimeout(() => this.added.set(false), 2000);
  }
}
