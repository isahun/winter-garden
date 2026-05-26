import { Injectable, inject } from '@angular/core';
import { SupabaseService } from '../supabase.service';
import { Product } from '../models';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private supabase = inject(SupabaseService).client;

  async getAllProducts() {
    return this.supabase
      .from('products')
      .select('*, categories!category_id(name,slug)')
      .order('created_at', { ascending: false });
  }

  async getProductById(id: number) {
    return this.supabase
      .from('products')
      .select('*, categories!category_id(name,slug)')
      .eq('id', id)
      .single<Product>();
  }

  async createProduct(product: Partial<Product>) {
    return this.supabase.from('products').insert(product).select().single<Product>();
  }

  async updateProduct(id: number, product: Partial<Product>) {
    return this.supabase.from('products').update(product).eq('id', id).select().single<Product>();
  }

  async deleteProduct(id: number) {
    return this.supabase.from('products').delete().eq('id', id);
  }

  async getCategories() {
    return this.supabase.from('categories').select('*').order('name');
  }

  async getRelatedProducts(categoryId: number, excludeId: number) {
    return this.supabase
      .from('products')
      .select('*, categories!category_id(name,slug)')
      .eq('category_id', categoryId)
      .neq('id', excludeId)
      .limit(3);
  }
}
