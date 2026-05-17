import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { SupabaseService } from '../supabase.service';
import { from, switchMap } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const supabase = inject(SupabaseService).client;
  return from(supabase.auth.getSession()).pipe(
    switchMap(({ data }) => {
      const token = data.session?.access_token;
      if (!token) return next(req);
      return next(
        req.clone({
          setHeaders: { Authorization: `Bearer ${token}` },
        }),
      );
    }),
  );
};
