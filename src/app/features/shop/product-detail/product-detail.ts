import { Component, inject, signal, input, numberAttribute, effect, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { Product, Category } from '../../../core/models';
import { FavoritesService } from '../../../core/services/favorites.service';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-product-detail',
  imports: [CurrencyPipe, RouterLink, FormsModule],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css',
})
export class ProductDetail {
  id = input.required({ transform: numberAttribute });

  private productService = inject(ProductService);
  private cart = inject(CartService);
  private router = inject(Router);
  private readonly autoEdit = isPlatformBrowser(inject(PLATFORM_ID)) && history.state?.['autoEdit'] === true;
  favorites = inject(FavoritesService);
  auth = inject(AuthService);

  product = signal<Product | null>(null);
  added = signal(false);
  related = signal<Product[]>([]);
  lightboxOpen = signal(false);
  activeImage = signal(0);
  editingProduct = signal<Partial<Product> | null>(null);
  categories = signal<Category[]>([]);

  constructor() {
    effect(async () => {
      const id = this.id();
      const { data } = await this.productService.getProductById(id);
      this.product.set(data);
      this.related.set([]);
      this.activeImage.set(0);
      if (data?.category_id) {
        const { data: rel } = await this.productService.getRelatedProducts(data.category_id, data.id);
        this.related.set(rel ?? []);
      }
      if (this.auth.isLoggedIn()) await this.favorites.loadFavorites();
      if (this.autoEdit && this.auth.isAdmin()) await this.startEditing();
    });
  }

  addProductToCart() {
    if (!this.product()) return;
    this.cart.addToCart(this.product()!);
    this.added.set(true);
    setTimeout(() => this.added.set(false), 2000);
  }

  async startEditing() {
    if (this.categories().length === 0) {
      const { data } = await this.productService.getCategories();
      this.categories.set(data ?? []);
    }
    const p = this.product();
    if (p) this.editingProduct.set({ ...p });
  }

  cancelEditing() {
    this.editingProduct.set(null);
  }

  async saveEditing() {
    const p = this.editingProduct();
    if (!p?.id) return;
    const { categories, created_at, ...payload } = p as Product;
    const { data } = await this.productService.updateProduct(p.id, payload);
    if (data) this.product.set(data);
    this.editingProduct.set(null);
  }

  async archiveProduct() {
    if (!confirm('Arxivar aquest producte? Deixarà de ser visible al catàleg.')) return;
    const p = this.product();
    if (!p) return;
    const { error } = await this.productService.archiveProduct(p.id);
    if (error) { alert('Error en arxivar el producte.'); return; }
    this.router.navigate(['/shop']);
  }
}
