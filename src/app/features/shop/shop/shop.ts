import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CurrencyPipe, NgTemplateOutlet } from '@angular/common';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models';
import { FavoritesService } from '../../../core/services/favorites.service';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-shop',
  imports: [RouterLink, CurrencyPipe, NgTemplateOutlet],
  templateUrl: './shop.html',
})
export class Shop implements OnInit {
  private productService = inject(ProductService);
  private router = inject(Router);
  favorites = inject(FavoritesService);
  auth = inject(AuthService);

  readonly PAGE_SIZE = 9;

  products = signal<Product[]>([]);
  search = signal('');
  selectedCategories = signal<string[]>([]);
  selectedPriceRange = signal('');
  selectedSizes = signal<string[]>([]);
  filtersOpen = signal(false);
  currentPage = signal(1);

  filteredProducts = computed(() => {
    const searchTerm = this.search().toLowerCase();
    const categories = this.selectedCategories();
    const price = this.selectedPriceRange();
    const sizes = this.selectedSizes();

    return this.products().filter((product) => {
      const matchSearch = product.name.toLowerCase().includes(searchTerm);
      const matchCat =
        categories.length === 0 || categories.includes(product.categories?.slug ?? '');
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
    const start = (this.currentPage() - 1) * this.PAGE_SIZE;
    return this.filteredProducts().slice(start, start + this.PAGE_SIZE);
  });

  totalPages = computed(() => Math.ceil(this.filteredProducts().length / this.PAGE_SIZE));

  activeFiltersCount = computed(
    () =>
      this.selectedCategories().length +
      (this.selectedPriceRange() ? 1 : 0) +
      this.selectedSizes().length,
  );

  setSearch(value: string) {
    this.search.set(value);
    this.currentPage.set(1);
  }

  toggleCategory(slug: string) {
    const current = this.selectedCategories();
    this.selectedCategories.set(
      current.includes(slug) ? current.filter((s) => s !== slug) : [...current, slug],
    );
    this.currentPage.set(1);
  }

  toggleSize(size: string) {
    const current = this.selectedSizes();
    this.selectedSizes.set(
      current.includes(size) ? current.filter((s) => s !== size) : [...current, size],
    );
    this.currentPage.set(1);
  }

  setPriceRange(value: string) {
    this.selectedPriceRange.set(value);
    this.currentPage.set(1);
  }

  clearFilters() {
    this.selectedCategories.set([]);
    this.selectedPriceRange.set('');
    this.selectedSizes.set([]);
    this.currentPage.set(1);
  }

  navigateToEdit(productId: number, event: Event) {
    event.stopPropagation();
    this.router.navigate(['/shop', productId], { state: { autoEdit: true } });
  }

  async ngOnInit() {
    const { data } = await this.productService.getAllProducts();
    this.products.set(data ?? []);
    if (this.auth.isLoggedIn()) await this.favorites.loadFavorites();
  }
}
