import { Component, inject, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, NgTemplateOutlet],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  auth = inject(AuthService);
  cart = inject(CartService);
  menuOpen = signal(false);
  panellOpen = signal(false);
}
