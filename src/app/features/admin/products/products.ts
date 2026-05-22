import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { Product, Category } from '../../../core/models';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-products',
  imports: [FormsModule, RouterLink],
  templateUrl: './products.html',
})
export class Products implements OnInit {
  private productService = inject(ProductService);

  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  editing = signal<Partial<Product> | null>(null);
  isNew = signal(false);
  uploading = signal(false);

  async ngOnInit() {
    const { data } = await this.productService.getAllProducts();
    this.products.set(data ?? []);
    const { data: cats } = await this.productService.getCategories();
    this.categories.set(cats ?? []);
  }

  createProductAdmin() {
    this.editing.set({ name: '', price: 0, stock: 0, description: '', images: [] });
    this.isNew.set(true);
  }

  openEditAdmin(product: Product) {
    this.editing.set({ ...product });
    this.isNew.set(false);
  }

  cancelEditAdmin() {
    this.editing.set(null);
  }

  async uploadImage(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.uploading.set(true);
    const form = new FormData();
    form.append('file', file);
    form.append('upload_preset', environment.cloudinaryUploadPreset);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${environment.cloudinaryCloudName}/image/upload`, {
      method: 'POST',
      body: form,
    });
    const json = await res.json();
    const url = (json.secure_url as string).replace(
      '/upload/',
      '/upload/w_800,h_800,c_pad,b_white,f_auto,q_auto/',
    );
    this.editing.update((p) => (p ? { ...p, images: [url] } : p));
    this.uploading.set(false);
  }

    removeImage() {
    this.editing.update(p => (p ? { ...p, images: [] } : p));
  }

  async saveProductAdmin() {
    const data = this.editing();
    if (!data) return;
    const { categories, created_at, ...payload } = data as Product;
    if (this.isNew()) {
      await this.productService.createProduct(payload);
    } else {
      await this.productService.updateProduct(payload.id!, payload);
    }
    this.editing.set(null);
    await this.ngOnInit();
  }

  async deleteProductAdmin(id: number) {
    if (!confirm('Segur que vols eliminar aquest producte?')) return;
    await this.productService.deleteProduct(id);
    await this.ngOnInit();
  }
}
