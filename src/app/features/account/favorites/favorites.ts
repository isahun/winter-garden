import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { FavoritesService } from '../../../core/services/favorites.service';
import { Product } from '../../../core/models';

@Component({
  selector: 'app-favorites',
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './favorites.html',
  styleUrl: './favorites.css',
})
export class Favorites implements OnInit {
  private favoritesService = inject(FavoritesService);

  products = signal<Product[]>([]);

  async ngOnInit() {
    this.products.set(await this.favoritesService.getFavorites());
  }

  async removeFavorite(product: Product) {
    await this.favoritesService.toggleFavorite(product);
    this.products.update((list) => list.filter((currentProduct) => currentProduct.id !== product.id));
  }
}
