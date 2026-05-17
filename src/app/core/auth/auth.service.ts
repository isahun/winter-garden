import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Session, User } from '@supabase/supabase-js';
import { SupabaseService } from '../supabase.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly supabase = inject(SupabaseService).client;
  private readonly router = inject(Router);

  private _session = signal<Session | null>(null);

  readonly user = computed(() => this._session()?.user ?? null);
  readonly isLoggedIn = computed(() => !!this._session());

  // Rol de l'usuari (ve del perfil a la BD, no del JWT)
  private _role = signal<'user' | 'admin' | null>(null);
  readonly isAdmin = computed(() => this._role() === 'admin');

  constructor() {
    // Recupera sessió activa en carregar l'app
    this.supabase.auth.getSession().then(({ data }) => {
      this._session.set(data.session);
      if (data.session) this.loadRole(data.session.user.id);
    });

    // Escolta canvis de sessió (login, logout, token refresh)
    this.supabase.auth.onAuthStateChange((_, session) => {
      this._session.set(session);
      if (session) this.loadRole(session.user.id);
      else this._role.set(null);
    });
  }

  private async loadRole(userId: string) {
    const { data } = await this.supabase.from('profiles').select('role').eq('id', userId).single();
    this._role.set(data?.role ?? 'user');
  }

  async register(email: string, password: string, name: string) {
    return this.supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
  }

  async login(email: string, password: string) {
    return this.supabase.auth.signInWithPassword({ email, password });
  }

  async logout() {
    await this.supabase.auth.signOut();
    this.router.navigate(['/']);
  }
}
