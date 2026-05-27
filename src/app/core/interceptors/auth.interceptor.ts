import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { SupabaseService } from '../supabase.service';
import { from, switchMap } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const supabase = inject(SupabaseService).client;
  // from() converteix la Promise de getSession() en Observable perquè l'interceptor ho requereix
  // switchMap() espera la sessió i llavors decideix si afegir la capçalera o passar la petició tal qual
  return from(supabase.auth.getSession()).pipe(
    switchMap(({ data }) => {
      const token = data.session?.access_token;
      if (!token) return next(req);
      // req.clone() és immutable: no modifiquem la petició original sinó que en creem una còpia amb el token
      return next(req.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      }));
    })
  );
};
