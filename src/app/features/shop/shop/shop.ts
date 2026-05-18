import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { ProductService } from '../../../core/services/product.service';
import { Product } from '../../../core/models';

@Component({
  selector: 'app-shop',
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './shop.html',
})
export class Shop implements OnInit {
  private productService = inject(ProductService);

  products = signal<Product[]>([]);
  search = signal('');
  selectedCategory = signal('');

  filteredProducts = computed(() => {
    const searchTerm = this.search().toLowerCase();
    return this.products().filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm) &&
        (!this.selectedCategory() || product.categories?.slug === this.selectedCategory()),
    );
  });

  async ngOnInit() {
    const { data, error } = await this.productService.getAllProducts();
    if(error) console.error('Error carregant productes:', error);
    this.products.set(data ?? []);
  }
}
