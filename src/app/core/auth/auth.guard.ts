import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  // Esperem que AuthService hagi llegit la sessió de Supabase abans de decidir l'accés
  // Sense aquest await, en recarregar la pàgina el guard veuria isLoggedIn()=false i redirigiria incorrectament
  await auth.ready;
  if (auth.isLoggedIn()) return true;
  // createUrlTree retorna un UrlTree — Angular entén que és una redirecció (no un boolean false)
  return router.createUrlTree(['/auth/login']);
};
