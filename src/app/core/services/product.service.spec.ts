import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { ProductService } from './product.service';
import { SupabaseService } from '../supabase.service';
import { Product } from '../models';

const mockProduct: Product = {
  id: 1, name: 'Jardí Test', price: 45, stock: 10,
  description: null, category_id: 1, images: [], size: null, created_at: '',
};

const makeChain = (data: any) => {
  const chain: any = {};
  ['select', 'eq', 'neq', 'order', 'limit'].forEach(m => (chain[m] = () => chain));
  chain.insert = () => chain;
  chain.update = () => chain;
  chain.delete = () => chain;
  chain.single = () => Promise.resolve({ data, error: null });
  chain.then = (res: any) => Promise.resolve({ data, error: null }).then(res);
  return chain;
};

describe('ProductService', () => {
  let service: ProductService;
  let fromSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fromSpy = vi.fn().mockImplementation(() => makeChain([mockProduct]));

    TestBed.configureTestingModule({
      providers: [
        ProductService,
        { provide: SupabaseService, useValue: { client: { from: fromSpy } } },
      ],
    });
    service = TestBed.inject(ProductService);
  });

  it('Given productes a la BBDD, When es crida getAllProducts, Then consulta la taula products', async () => {
    await service.getAllProducts();
    expect(fromSpy).toHaveBeenCalledWith('products');
  });

  it('Given un producte amb id 1, When es crida getProductById(1), Then retorna el producte', async () => {
    fromSpy.mockImplementation(() => makeChain(mockProduct));
    const { data } = await service.getProductById(1);
    expect(data).toEqual(mockProduct);
  });

  it('Given dades vàlides, When es crida createProduct, Then consulta la taula products', async () => {
    await service.createProduct({ name: 'Nou', price: 25, stock: 5 });
    expect(fromSpy).toHaveBeenCalledWith('products');
  });
});
