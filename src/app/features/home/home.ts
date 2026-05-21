import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { ProductService } from '../../core/services/product.service';
import { Product } from '../../core/models';

@Component({
  selector: 'app-home',
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './home.html',
})
export class Home implements OnInit {
  private productService = inject(ProductService);
  featured = signal<Product[]>([]);

  async ngOnInit() {
    const { data } = await this.productService.getAllProducts();
    this.featured.set((data ?? []).slice(0, 3));
  }
}
