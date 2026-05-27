import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Session } from '@supabase/supabase-js';
import { SupabaseService } from '../supabase.service';
import { Profile } from '../models';
import { CartService } from '../services/cart.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly supabase = inject(SupabaseService).client;
  private readonly router = inject(Router);
  private readonly cart = inject(CartService);

  private _session = signal<Session | null>(null);

  // computed deriva automàticament del signal — es recalcula quan _session canvia
  readonly user = computed(() => this._session()?.user ?? null);
  readonly isLoggedIn = computed(() => !!this._session());

  private _role = signal<'user' | 'admin' | null>(null);
  readonly isAdmin = computed(() => this._role() === 'admin');

  // Patró "deferred resolve": guardem la funció resolve fora de la Promise per cridar-la més tard
  // Els guards fan `await auth.ready` per no prendre decisions d'accés abans que Supabase respongui
  private _resolveReady!: () => void;
  readonly ready = new Promise<void>(resolve => (this._resolveReady = resolve));

  constructor() {
    // getSession llegeix la sessió guardada a localStorage (o cookie) — és la comprovació inicial en carregar
    this.supabase.auth.getSession().then(({ data }) => {
      this._session.set(data.session);
      if (data.session) this.loadRole(data.session.user.id);
      this._resolveReady(); // desbloqueja els guards que estaven esperant
    });

    // onAuthStateChange escolta canvis en temps real: login, logout, refresc de token, OAuth redirect
    this.supabase.auth.onAuthStateChange((_, session) => {
      this._session.set(session);
      if (session) this.loadRole(session.user.id);
      else this._role.set(null);
    });
  }

  private async loadRole(userId: string) {
    const { data } = await this.supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      // Pick<Profile, 'role'> restringeix el tipus retornat — TypeScript sap que data només té el camp role
      .single<Pick<Profile, 'role'>>();
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
    this.cart.clearCart();
    this.router.navigate(['/']);
  }

  async loginWithGoogle() {
    await this.supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
  }
}
