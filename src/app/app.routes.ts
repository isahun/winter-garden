import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { adminGuard } from './core/auth/admin.guard';

export const routes: Routes = [
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login').then((module) => module.Login),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/auth/register/register').then((module) => module.Register),
      },
    ],
  },
  {
    path: '',
    loadComponent: () =>
      import('./shared/components/layout/layout').then((module) => module.Layout),
    children: [
      {
        path: '',
        loadComponent: () => import('./features/home/home').then((module) => module.Home),
      },
      {
        path: 'shop',
        loadComponent: () => import('./features/shop/shop/shop').then((module) => module.Shop),
      },
      {
        path: 'shop/:id',
        loadComponent: () =>
          import('./features/shop/product-detail/product-detail').then(
            (module) => module.ProductDetail,
          ),
      },
      {
        path: 'cart',
        loadComponent: () => import('./features/cart/cart').then((module) => module.Cart),
      },
      {
        path: 'checkout',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/checkout/checkout').then((module) => module.Checkout),
      },
      {
        path: 'events',
        loadComponent: () => import('./features/events/events').then((module) => module.Events),
      },
      {
        path: 'stores',
        loadComponent: () => import('./features/stores/stores').then((module) => module.Stores),
      },
      {
        path: 'account',
        canActivate: [authGuard],
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/account/account/account').then((module) => module.Account),
          },
          {
            path: 'orders',
            loadComponent: () =>
              import('./features/account/orders/orders').then((module) => module.Orders),
          },
          {
            path: 'favorites',
            loadComponent: () =>
              import('./features/account/favorites/favorites').then((module) => module.Favorites),
          },
        ],
      },
      {
        path: 'admin',
        canActivate: [authGuard, adminGuard],
        children: [
          {
            path: 'dashboard',
            loadComponent: () =>
              import('./features/admin/dashboard/dashboard').then((module) => module.Dashboard),
          },
          {
            path: 'products',
            loadComponent: () =>
              import('./features/admin/products/products').then((module) => module.Products),
          },
          {
            path: 'orders',
            loadComponent: () =>
              import('./features/admin/orders/orders').then((module) => module.Orders),
          },
          {
            path: 'events',
            loadComponent: () =>
              import('./features/admin/events/admin-events').then((module) => module.AdminEvents),
          },
        ],
      },
    ],
  },

  { path: '**', redirectTo: '' },
];
