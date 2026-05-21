import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models';

@Component({
  selector: 'app-products',
  imports: [FormsModule],
  templateUrl: './products.html',
})
export class Products implements OnInit {
  private productService = inject(ProductService);

  products = signal<Product[]>([]);
  editing = signal<Partial<Product> | null>(null);
  isNew = signal(false);

  async ngOnInit() {
    const { data } = await this.productService.getAllProducts();
    this.products.set(data ?? []);
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

  async saveProductAdmin() {
    const data = this.editing();
    if (!data) return;
    if (this.isNew()) {
      await this.productService.createProduct(data);
    } else {
      await this.productService.updateProduct(data.id!, data);
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
