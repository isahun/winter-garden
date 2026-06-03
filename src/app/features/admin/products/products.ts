import { Component, OnInit, inject, computed, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { ImageService } from '../../../core/services/image.service';
import { Product, Category } from '../../../core/models';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';

@Component({
  selector: 'app-products',
  imports: [FormsModule, RouterLink],
  templateUrl: './products.html',
})
export class Products implements OnInit {
  private productService = inject(ProductService);
  private imageService = inject(ImageService);
  private confirmDialog = inject(ConfirmDialogService);

  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  editing = signal<Partial<Product> | null>(null);
  isNew = signal(false);
  uploading = signal(false);
  uploadError = signal('');
  categoryFilter = signal<number | null>(null);
  stockFilter = signal<string>('');
  sortBy = signal<'name' | 'price' | 'stock'>('name');
  sortDir = signal<'asc' | 'desc'>('asc');

  filtered = computed(() => {
    const items = this.products().filter((p) => {
      const categoryOk = !this.categoryFilter() || p.category_id === this.categoryFilter();
      const stockOk =
        !this.stockFilter() ||
        (this.stockFilter() === 'instock' && p.stock > 0) ||
        (this.stockFilter() === 'outofstock' && p.stock === 0);
      return categoryOk && stockOk;
    });
    const dir = this.sortDir() === 'asc' ? 1 : -1;
    return [...items].sort((a, b) => {
      if (this.sortBy() === 'price') return (a.price - b.price) * dir;
      if (this.sortBy() === 'stock') return (a.stock - b.stock) * dir;
      return a.name.localeCompare(b.name) * dir;
    });
  });

  private readonly platformId = inject(PLATFORM_ID);

  async ngOnInit() {
    const { data } = await this.productService.getAllProductsAdmin();
    this.products.set(data ?? []);
    const { data: cats } = await this.productService.getCategories();
    this.categories.set(cats ?? []);
    if (isPlatformBrowser(this.platformId) && history.state?.['autoCreate']) {
      this.createProductAdmin();
    }
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
    this.uploadError.set('');
    try {
      const url = await this.imageService.uploadToCloudinary(file);
      this.editing.update((product) => {
        if (!product) return product;
        const images = [...(product.images ?? [])];
        images[index] = url;
        return { ...product, images };
      });
    } catch {
      this.uploadError.set('Error pujant la imatge. Comprova la connexió i torna-ho a intentar.');
    } finally {
      this.uploading.set(false);
    }
  }

  removeImage(index: number) {
    this.editing.update((product) => {
      if (!product) return product;
      const images = [...(product.images ?? [])];
      images.splice(index, 1);
      return { ...product, images };
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

  async archiveProductAdmin(id: number) {
    const ok = await this.confirmDialog.confirm('Arxivar aquest producte? Deixarà de ser visible al catàleg.');
    if (!ok) return;
    await this.productService.archiveProduct(id);
    await this.ngOnInit();
  }

  async restoreProductAdmin(id: number) {
    await this.productService.restoreProduct(id);
    await this.ngOnInit();
  }

  async deleteProductAdmin(id: number) {
    const ok = await this.confirmDialog.confirm('Eliminar definitivament? Aquesta acció NO es pot desfer.', { danger: true, confirmLabel: 'Eliminar' });
    if (!ok) return;
    const { error } = await this.productService.deleteProduct(id);
    if (error?.code === '23503') {
      await this.confirmDialog.alert("No es pot eliminar: té comandes associades. Arxiva'l en comptes.");
      return;
    }
    await this.ngOnInit();
  }

  sort(col: 'name' | 'price' | 'stock') {
    if (this.sortBy() === col) this.sortDir.update((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      this.sortBy.set(col);
      this.sortDir.set('asc');
    }
  }
}
