import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { ImageService } from '../../../core/services/image.service';
import { Product, Category } from '../../../core/models';

@Component({
  selector: 'app-products',
  imports: [FormsModule, RouterLink],
  templateUrl: './products.html',
})
export class Products implements OnInit {
  private productService = inject(ProductService);
  private imageService = inject(ImageService);

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

  async uploadImage(event: Event, index: number) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.uploading.set(true);
    const url = await this.imageService.uploadToCloudinary(file);
    this.editing.update((product) => {
      if (!product) return product;
      const images = [...(product.images ?? [])];
      images[index] = url;
      return { ...product, images };
    });
    this.uploading.set(false);
  }

  removeImage(index: number) {
    this.editing.update(p => {
      if (!p) return p;
      const images = [...(p.images ?? [])];
      images.splice(index, 1);
      return { ...p, images };
    });
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
