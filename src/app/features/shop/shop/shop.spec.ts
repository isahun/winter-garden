import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { Shop } from './shop';
import { ProductService } from '../../../core/services/product.service';
import { FavoritesService } from '../../../core/services/favorites.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Product } from '../../../core/models';

const mockProducts: Product[] = [
  {
    id: 1,
    name: 'Jardí Howl',
    price: 20,
    stock: 5,
    description: null,
    category_id: 1,
    images: [],
    size: 'S',
    created_at: '',
    categories: { id: 1, name: 'Jardins', slug: 'jardins-fets' },
  },
  {
    id: 2,
    name: 'Jardí Mori',
    price: 35,
    stock: 3,
    description: null,
    category_id: 1,
    images: [],
    size: 'M',
    created_at: '',
    categories: { id: 1, name: 'Jardins', slug: 'jardins-fets' },
  },
  {
    id: 3,
    name: 'Molsa natural',
    price: 12,
    stock: 50,
    description: null,
    category_id: 2,
    images: [],
    size: null,
    created_at: '',
    categories: { id: 2, name: 'Elements', slug: 'elements-solts' },
  },
  {
    id: 4,
    name: 'Copa de vidre',
    price: 60,
    stock: 10,
    description: null,
    category_id: 3,
    images: [],
    size: 'L',
    created_at: '',
    categories: { id: 3, name: 'Terraris', slug: 'terraris' },
  },
];

describe('Shop - filteredProducts (computed)', () => {
  let component: Shop;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Shop],
      providers: [
        provideRouter([]),
        {
          provide: ProductService,
          useValue: { getAllProducts: async () => ({ data: mockProducts }) },
        },
        {
          provide: FavoritesService,
          useValue: {
            loadFavorites: async () => {},
            isFavorite: () => signal(false),
            toggleFavorite: () => {},
          },
        },
        { provide: AuthService, useValue: { isLoggedIn: signal(false), isAdmin: signal(false) } },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(Shop);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('Given cap filtre actiu, When es carrega el catàleg, Then es mostren tots els productes', () => {
    expect(component.filteredProducts().length).toBe(4);
  });

  it('Given filtre categoria "jardins-fets", When s\'aplica, Then només apareixen jardins', () => {
    component.toggleCategory('jardins-fets');
    const result = component.filteredProducts();
    expect(result.length).toBe(2);
    expect(result.every((p) => p.categories?.slug === 'jardins-fets')).toBe(true);
  });

  it('Given filtre preu "under25", When s\'aplica, Then tots els productes costen ≤25€', () => {
    component.setPriceRange('under25');
    expect(component.filteredProducts().every((p) => p.price <= 25)).toBe(true);
  });

  it('Given filtre mida "S", When s\'aplica, Then només apareixen productes de mida S', () => {
    component.toggleSize('S');
    expect(component.filteredProducts().every((p) => p.size === 'S')).toBe(true);
  });

  it('Given cerca "howl", When s\'escriu al cercador, Then apareix 1 producte amb aquell nom', () => {
    component.setSearch('howl');
    expect(component.filteredProducts().length).toBe(1);
    expect(component.filteredProducts()[0].name).toBe('Jardí Howl');
  });

  it('Given filtres actius, When es crida clearFilters, Then es mostren tots els productes i activeFiltersCount és 0', () => {
    component.toggleCategory('jardins-fets');
    component.setPriceRange('under25');
    component.clearFilters();
    expect(component.filteredProducts().length).toBe(4);
    expect(component.activeFiltersCount()).toBe(0);
  });

  it('Given filtres categoria "jardins-fets" i preu "under25", When s\'apliquen, Then només apareix el jardí barat', () => {
    component.toggleCategory('jardins-fets');
    component.setPriceRange('under25');
    expect(component.filteredProducts().length).toBe(1);
    expect(component.filteredProducts()[0].name).toBe('Jardí Howl');
  });
});
