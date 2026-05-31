import { Injectable, computed, signal } from '@angular/core';

@Injectable()
export class ShopFiltersService {
  readonly PAGE_SIZE = 9;

  readonly search = signal('');
  readonly selectedCategories = signal<string[]>([]);
  readonly selectedPriceRange = signal('');
  readonly selectedSizes = signal<string[]>([]);
  readonly currentPage = signal(1);
  readonly filtersOpen = signal(false);

  readonly activeFiltersCount = computed(
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
      current.includes(slug) ? current.filter(s => s !== slug) : [...current, slug],
    );
    this.currentPage.set(1);
  }

  toggleSize(size: string) {
    const current = this.selectedSizes();
    this.selectedSizes.set(
      current.includes(size) ? current.filter(s => s !== size) : [...current, size],
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
}
