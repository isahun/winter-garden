import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models';
import { FavoritesService } from '../../../core/services/favorites.service';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-shop',
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './shop.html',
})
export class Shop implements OnInit {
  private productService = inject(ProductService);
  favorites = inject(FavoritesService);
  auth = inject(AuthService);

  readonly PAGE_SIZE = 9;

  products = signal<Product[]>([]);
  search = signal('');
  selectedCategory = signal('');
  currentPage = signal(1);

  filteredProducts = computed(() => {
    const searchTerm = this.search().toLowerCase();
    return this.products().filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm) &&
        (!this.selectedCategory() || product.categories?.slug === this.selectedCategory()),
    );
  });

  paginatedProducts = computed(() => {
    const start = (this.currentPage() - 1) * this.PAGE_SIZE;
    return this.filteredProducts().slice(start, start + this.PAGE_SIZE);
  });

  totalPages = computed(() => Math.ceil(this.filteredProducts().length / this.PAGE_SIZE));

  setSearch(value: string) {
    this.search.set(value);
    this.currentPage.set(1);
  }

  setCategory(value: string) {
    this.selectedCategory.set(value);
    this.currentPage.set(1);
  }

  async ngOnInit() {
    const { data } = await this.productService.getAllProducts();
    this.products.set(data ?? []);
    if (this.auth.isLoggedIn()) await this.favorites.loadFavorites();
  }
}
