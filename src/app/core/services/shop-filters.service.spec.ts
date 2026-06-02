import { TestBed } from '@angular/core/testing';
import { ShopFiltersService } from './shop-filters.service';

describe('ShopFiltersService', () => {
  let service: ShopFiltersService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ShopFiltersService] });
    service = TestBed.inject(ShopFiltersService);
  });

  it('Given estat inicial, Then no hi ha filtres actius i la pàgina és 1', () => {
    expect(service.activeFiltersCount()).toBe(0);
    expect(service.currentPage()).toBe(1);
  });

  it('Given toggleCategory, When s\'aplica un slug, Then s\'afegeix i es reinicia la pàgina', () => {
    service.currentPage.set(3);
    service.toggleCategory('jardins-fets');
    expect(service.selectedCategories()).toContain('jardins-fets');
    expect(service.currentPage()).toBe(1);
  });

  it('Given toggleCategory dues vegades amb el mateix slug, Then el slug s elimina', () => {
    service.toggleCategory('jardins-fets');
    service.toggleCategory('jardins-fets');
    expect(service.selectedCategories()).not.toContain('jardins-fets');
  });

  it('Given setPriceRange, When s\'estableix un rang, Then activeFiltersCount augmenta en 1', () => {
    service.setPriceRange('under25');
    expect(service.activeFiltersCount()).toBe(1);
    expect(service.currentPage()).toBe(1);
  });

  it('Given toggleSize, When s\'afegeix una mida, Then s\'inclou a selectedSizes', () => {
    service.toggleSize('S');
    expect(service.selectedSizes()).toContain('S');
  });

  it('Given múltiples filtres actius, When clearFilters, Then activeFiltersCount és 0 i la pàgina torna a 1', () => {
    service.toggleCategory('jardins-fets');
    service.setPriceRange('under25');
    service.toggleSize('S');
    service.currentPage.set(2);
    service.clearFilters();
    expect(service.activeFiltersCount()).toBe(0);
    expect(service.currentPage()).toBe(1);
  });

  it('Given setSearch, When s\'escriu un terme, Then la pàgina es reinicia', () => {
    service.currentPage.set(2);
    service.setSearch('monstera');
    expect(service.search()).toBe('monstera');
    expect(service.currentPage()).toBe(1);
  });
});
