import { Component, OnInit, inject, signal, input, numberAttribute } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { Product } from '../../../core/models';

@Component({
  selector: 'app-product-detail',
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css',
})
export class ProductDetail implements OnInit {
  id = input.required({ transform: numberAttribute });

  private productService = inject(ProductService);
  private cart = inject(CartService);

  product = signal<Product | null>(null);
  added = signal(false);

  async ngOnInit() {
    const { data } = await this.productService.getProductById(this.id());
    this.product.set(data);
  }

  addProductToCart() {
    if (!this.product()) return;
    this.cart.addToCart(this.product()!);
    this.added.set(true);
    setTimeout(() => this.added.set(false), 2000);
  }

}
