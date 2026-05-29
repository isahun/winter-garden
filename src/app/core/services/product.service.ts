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
      .eq('archived', false)
      .order('created_at', { ascending: false });
  }

  async getAllProductsAdmin() {
    return this.supabase
      .from('products')
      .select('*, categories!category_id(name,slug)')
      .order('archived')
      .order('created_at', { ascending: false });
  }

  async archiveProduct(id: number) {
    return this.supabase.from('products').update({ archived: true }).eq('id', id);
  }

  async restoreProduct(id: number) {
    return this.supabase.from('products').update({ archived: false }).eq('id', id);
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
      .eq('archived', false)
      .neq('id', excludeId)
      .limit(3);
  }
}
