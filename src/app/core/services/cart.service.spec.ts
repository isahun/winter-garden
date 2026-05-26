import { TestBed } from '@angular/core/testing';
import { CartService } from './cart.service';
import { Product } from '../models';

const mockProduct: Product = {
  id: 1,
  name: 'Jardí S',
  price: 45,
  stock: 10,
  description: null,
  category_id: null,
  images: [],
  size: null,
  created_at: '',
};

describe('CartService', () => {
  let service: CartService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(CartService);
  });

  it('Given carret buit, When afegeixo un producte, Then count és 1', () => {
    service.addToCart(mockProduct);
    expect(service.count()).toBe(1);
  });

  it("Given un producte ja al carret, When l'afegeixo de nou, Then la quantitat és 2 i hi ha 1 línia", () => {
    service.addToCart(mockProduct);
    service.addToCart(mockProduct);
    expect(service.items().length).toBe(1);
    expect(service.items()[0].quantity).toBe(2);
  });

  it("Given un producte al carret, When l'elimino, Then el carret queda buit", () => {
    service.addToCart(mockProduct);
    service.removeFromCart(mockProduct.id);
    expect(service.count()).toBe(0);
  });

  it("Given 2 unitats d'un producte de 45€, When consulto el total, Then és 90€", () => {
    service.addToCart(mockProduct);
    service.addToCart(mockProduct);
    expect(service.total()).toBe(90);
  });

  it('Given 3 unitats al carret, When actualitzo a 1, Then la quantitat és 1', () => {
    service.addToCart(mockProduct);
    service.addToCart(mockProduct);
    service.addToCart(mockProduct);
    service.updateQuantity(mockProduct.id, 1);
    expect(service.items()[0].quantity).toBe(1);
  });

  it("Given un producte al carret, When actualitzo a 0, Then s'elimina", () => {
    service.addToCart(mockProduct);
    service.updateQuantity(mockProduct.id, 0);
    expect(service.count()).toBe(0);
  });

  it('Given un carret amb productes, When faig clearCart, Then el carret és buit i count és 0', () => {
    service.addToCart(mockProduct);
    service.clearCart();
    expect(service.count()).toBe(0);
    expect(service.items().length).toBe(0);
  });

  it("Given productes al carret, When s'afegeix un producte, Then es desa a localStorage", () => {
    service.addToCart(mockProduct);
    TestBed.tick();
    const stored = localStorage.getItem('wg_cart');
    expect(stored).not.toBeNull();
    const items = JSON.parse(stored!);
    expect(items.length).toBe(1);
    expect(items[0].product.id).toBe(mockProduct.id);
  });
});
