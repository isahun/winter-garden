import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CurrencyPipe, NgTemplateOutlet } from '@angular/common';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models';
import { FavoritesService } from '../../../core/services/favorites.service';
import { AuthService } from '../../../core/auth/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { ShopFiltersService } from '../../../core/services/shop-filters.service';

@Component({
  selector: 'app-shop',
  imports: [RouterLink, CurrencyPipe, NgTemplateOutlet],
  templateUrl: './shop.html',
  providers: [ShopFiltersService],
})
export class Shop implements OnInit {
  private productService = inject(ProductService);
  private router = inject(Router);
  favorites = inject(FavoritesService);
  auth = inject(AuthService);
  cart = inject(CartService);
  filters = inject(ShopFiltersService);

  products = signal<Product[]>([]);
  addedIds = signal<Set<number>>(new Set());

  filteredProducts = computed(() => {
    const searchTerm = this.filters.search().toLowerCase();
    const categories = this.filters.selectedCategories();
    const price = this.filters.selectedPriceRange();
    const sizes = this.filters.selectedSizes();

    return this.products().filter(product => {
      const matchSearch = product.name.toLowerCase().includes(searchTerm);
      const matchCat = categories.length === 0 || categories.includes(product.categories?.slug ?? '');
      const matchPrice =
        !price ||
        (price === 'under25' && product.price <= 25) ||
        (price === '25to50' && product.price > 25 && product.price <= 50) ||
        (price === 'over50' && product.price > 50);
      const matchSize = sizes.length === 0 || sizes.includes(product.size ?? '');
      return matchSearch && matchCat && matchPrice && matchSize;
    });
  });

  paginatedProducts = computed(() => {
    const start = (this.filters.currentPage() - 1) * this.filters.PAGE_SIZE;
    return this.filteredProducts().slice(start, start + this.filters.PAGE_SIZE);
  });

  totalPages = computed(() => Math.ceil(this.filteredProducts().length / this.filters.PAGE_SIZE));

  addToCart(product: Product, event: MouseEvent) {
    event.stopPropagation();
    this.cart.addToCart(product);
    this.addedIds.update(s => new Set([...s, product.id]));
    setTimeout(() => {
      this.addedIds.update(s => { const n = new Set(s); n.delete(product.id); return n; });
    }, 1500);
  }

  navigateToProduct(productId: number) {
    this.router.navigate(['/shop', productId]);
  }

  navigateToCreate() {
    this.router.navigate(['/admin/products'], { state: { autoCreate: true } });
  }

  navigateToEdit(productId: number) {
    this.router.navigate(['/shop', productId], { state: { autoEdit: true } });
  }

  async archiveProduct(productId: number) {
    if (!confirm('Arxivar aquest producte? Deixarà de ser visible al catàleg.')) return;
    const { error } = await this.productService.archiveProduct(productId);
    if (error) { alert('Error en arxivar el producte.'); return; }
    this.products.update(ps => ps.filter(p => p.id !== productId));
  }

  async ngOnInit() {
    const { data } = await this.productService.getAllProducts();
    this.products.set(data ?? []);
    if (this.auth.isLoggedIn()) await this.favorites.loadFavorites();
  }
}
