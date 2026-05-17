# Secret Garden — Roadmap i Planificació


> Document de context del projecte. Actualitzar a mesura que avanci el desenvolupament.


---


## 1. Idea i context


**Secret Garden** és un e-commerce de jardins eterns (terrariums de plantes preservades). Ven:
- Jardins eterns fets, en diverses mides
- Elements solts per crear el teu propi jardí (terres, molses, pedres, figures...)
- Recipients de vidre per contenir el jardí


Projecte final de bootcamp (Sprint 6 — Advanced Angular II). Avaluat amb rúbrica professional que inclou funcionalitats, UX/UI, testing, backend, Git Flow i desplegament.


---


## 2. Stack tecnològic decidit


| Capa | Tecnologia | Motiu |
|---|---|---|
| Frontend | Angular 22 (ja creat) | Requisit del bootcamp |
| Backend / DB | Supabase (PostgreSQL) | Auth, Storage, Edge Functions, sense backend manual |
| Auth | Supabase Auth | Equivalent a Firebase, rols via RLS |
| Estils | SCSS + Tailwind (a decidir) | Mobile-first, atomic design |
| Mapa | Leaflet | Gratuït, sense API key, fàcil d'integrar |
| Gràfiques | Chart.js / ng2-charts | Requisit rúbrica |
| Calendari | FullCalendar | Requisit rúbrica |
| Pagament | Stripe | Via Supabase Edge Functions |
| IA | Claude API (Anthropic) | Chatbot assessor de jardins |
| Testing | Vitest + Gherkin | Ja configurat al projecte |
| Desplegament | Vercel o Netlify | Requisit rúbrica |
| Tasques | Linear | Alternativa a GitHub Projects, modern |


---


## 3. Rols d'usuari


| Rol | Accés |
|---|---|
| **Guest** | Navegar catàleg, veure productes, afegir al carret, comprar |
| **User** | Tot el que fa el guest + historial de comandes, registre a tallers |
| **Admin** | Tot + gestió de productes, comandes, esdeveniments, dashboard stats |


---


## 4. Èpiques i User Stories


### Èpica 1 — Catàleg de productes


| ID | User Story | Criteri d'acceptació |
|---|---|---|
| US-01 | Com a visitant, vull veure el catàleg de productes per explorar el que es ven | Llista de productes amb imatge, nom i preu |
| US-02 | Com a visitant, vull filtrar productes per categoria (jardí fet / elements / recipients) | Filtre funcional que actualitza la llista |
| US-03 | Com a visitant, vull cercar productes per paraula clau | Cercador en temps real |
| US-04 | Com a visitant, vull veure el detall d'un producte | Pàgina de detall amb descripció, preu, mida, imatges |
| US-05 | Com a visitant, vull veure productes relacionats a la pàgina de detall | Secció "també et pot interessar" |


### Èpica 2 — Carret i Checkout


| ID | User Story | Criteri d'acceptació |
|---|---|---|
| US-06 | Com a visitant, vull afegir productes al carret | El carret s'actualitza amb quantitat i preu total |
| US-07 | Com a visitant, vull modificar les quantitats del carret | Botons +/- i eliminació d'ítem |
| US-08 | Com a visitant, vull completar la compra amb Stripe | Formulari de pagament Stripe, confirmació per email |
| US-09 | Com a usuari loguejat, vull que es guardi el meu historial de comandes | Secció "Les meves comandes" al perfil |


### Èpica 3 — Autenticació i rols


| ID | User Story | Criteri d'acceptació |
|---|---|---|
| US-10 | Com a visitant, vull registrar-me amb email i contrasenya | Formulari de registre amb validació |
| US-11 | Com a usuari, vull iniciar sessió | Login amb feedback d'error clar |
| US-12 | Com a usuari, vull tancar sessió | Logout accessible des del nav |
| US-13 | Com a admin, vull accedir a l'àrea d'administració protegida | Guard de ruta que comprova el rol admin |


### Èpica 4 — Panell d'administració


| ID | User Story | Criteri d'acceptació |
|---|---|---|
| US-14 | Com a admin, vull veure les estadístiques de vendes (gràfiques) | Dashboard amb Chart.js: vendes per mes, productes més venuts, estats de comandes |
| US-15 | Com a admin, vull gestionar productes (CRUD) | Crear, editar, eliminar productes amb imatge |
| US-16 | Com a admin, vull gestionar comandes (CRUD) | Llistar comandes, canviar estat (pendent/enviat/completat) |
| US-17 | Com a admin, vull gestionar esdeveniments/tallers (CRUD) | Crear, editar, eliminar tallers amb data, lloc i aforament |


### Èpica 5 — Mapa (Leaflet)


| ID | User Story | Criteri d'acceptació |
|---|---|---|
| US-18 | Com a visitant, vull veure les botigues de Barcelona al mapa | Mapa Leaflet amb 2-3 marcadors a Barcelona |
| US-19 | Com a visitant, vull clicar un marcador i veure la info de la botiga | Popup amb nom, adreça, horari |
| US-20 | Com a admin, vull gestionar les botigues des del mapa | Afegir/editar/eliminar marcadors directament al mapa (Nivell 2 rúbrica) |


### Èpica 6 — Calendari (FullCalendar)


| ID | User Story | Criteri d'acceptació |
|---|---|---|
| US-21 | Com a visitant, vull veure els tallers programats al calendari | Vista mensual amb esdeveniments marcats |
| US-22 | Com a visitant, vull clicar un taller i veure'n els detalls | Modal o pàgina de detall del taller |
| US-23 | Com a usuari loguejat, vull apuntar-me a un taller | Botó de registre, confirmació, i el taller apareix al meu perfil |
| US-24 | Com a admin, vull crear/editar/eliminar tallers des del calendari | CRUD d'esdeveniments directament des del calendari (Nivell 2 rúbrica) |


### Èpica 7 — Chatbot IA (Claude API)


| ID | User Story | Criteri d'acceptació |
|---|---|---|
| US-25 | Com a visitant, vull preguntar al chatbot quin jardí s'adapta al meu espai | Widget flotant de chat, respostes contextualitzades als productes |
| US-26 | Com a visitant, vull que el chatbot em recomani productes concrets | El bot pot linkar a productes del catàleg |


### Èpica 8 — Testing


| ID | Escenari Gherkin | Notes |
|---|---|---|
| TEST-01 | Given un carret buit / When afegeixo un producte / Then el carret mostra 1 ítem | Test unitari del servei de carret |
| TEST-02 | Given un usuari no loguejat / When accedeix a /admin / Then redirigeix a /login | Test del guard |
| TEST-03 | Given un formulari de registre / When envio sense email / Then es mostra error de validació | Test del formulari |
| TEST-04 | Given un admin / When elimina un producte / Then desapareix del catàleg | Test integració |


---


## 5. Arquitectura Angular (estructura de carpetes)


```
src/
├── app/
│   ├── core/
│   │   ├── auth/           # AuthService, guards
│   │   ├── interceptors/   # JWT interceptor, error interceptor, loading interceptor
│   │   └── models/         # Interfaces TypeScript (Product, Order, Event, User...)
│   ├── shared/
│   │   ├── components/     # Atomic design: atoms, molecules, organisms
│   │   ├── pipes/
│   │   └── directives/
│   └── features/ (lazy loaded)
│       ├── shop/           # Catàleg, detall producte
│       ├── cart/           # Carret
│       ├── checkout/       # Stripe
│       ├── account/        # Perfil, historial comandes
│       ├── events/         # Calendari FullCalendar
│       ├── stores/         # Mapa Leaflet
│       ├── chatbot/        # Widget IA
│       └── admin/
│           ├── dashboard/  # Stats Chart.js
│           ├── products/   # CRUD productes
│           ├── orders/     # Gestió comandes
│           └── events/     # CRUD tallers
```


---


## 6. Esquema de base de dades (Supabase / PostgreSQL)


```
profiles          (id, user_id→auth.users, role: 'admin'|'user', name, avatar_url)
categories        (id, name, slug)
products          (id, name, description, price, stock, category_id→categories, images[], size?)
orders            (id, user_id→profiles, status: 'pending'|'shipped'|'completed', total, created_at)
order_items       (id, order_id→orders, product_id→products, quantity, unit_price)
workshops         (id, title, description, date, location, capacity, image_url, created_by→profiles)
workshop_signups  (id, workshop_id→workshops, user_id→profiles, created_at)
stores            (id, name, address, lat, lng, schedule, phone)
```


---


## 7. Interceptors Angular (3 planificats)


| Interceptor | Funció |
|---|---|
| `auth.interceptor` | Afegeix el JWT de Supabase a cada petició HTTP |
| `error.interceptor` | Gestiona errors globals: 401 → logout+redirect, 500 → toast d'error |
| `loading.interceptor` | Activa/desactiva un loader global durant les crides HTTP |


---


## 8. Roadmap per fases


### Fase 0 — Planificació (ara)
- [x] Briefing revisat
- [x] Stack decidit
- [x] Epiques i user stories definides
- [ ] Diagrames d'arquitectura i flux
- [ ] User journey maps
- [ ] Wireframes de pantalles principals
- [ ] Backlog creat a Linear
- [ ] Git Flow configurat


### Fase 1 — Setup i autenticació (MVP base)
- [ ] Supabase: projecte creat, taules, RLS
- [ ] Angular: estructura de carpetes, routing, lazy loading
- [ ] AuthService + guards + interceptors
- [ ] Login / Register / Logout
- [ ] Pàgina admin protegida


### Fase 2 — Catàleg i carret
- [ ] Seed de productes a Supabase
- [ ] Pàgina catàleg amb filtres i cercador
- [ ] Pàgina detall de producte
- [ ] Servei de carret (signals o NgRx)
- [ ] Component carret lateral


### Fase 3 — Checkout i comandes
- [ ] Integració Stripe (Edge Function per payment intent)
- [ ] Flux de checkout complet
- [ ] Confirmació de comanda i email
- [ ] Historial de comandes a perfil d'usuari


### Fase 4 — Mapa i Calendari (Nivell 1 + 2)
- [ ] Mapa Leaflet amb botigues
- [ ] CRUD botigues des del mapa (admin)
- [ ] Calendari FullCalendar amb tallers
- [ ] CRUD tallers des del calendari (admin)
- [ ] Registre d'usuaris a tallers


### Fase 5 — Admin dashboard i stats
- [ ] Dashboard Chart.js (vendes, productes, comandes)
- [ ] CRUD productes (admin)
- [ ] Gestió comandes (admin)
- [ ] Filtres avançats (Nivell 3)


### Fase 6 — IA i poliment
- [ ] Chatbot Claude API via Supabase Edge Function
- [ ] Accessibilitat (ARIA, teclat, contrastos)
- [ ] i18n (català / castellà / anglès)
- [ ] Optimitzacions (lazy loading imatges, memoització)


### Fase 7 — Testing i desplegament
- [ ] Escenaris Gherkin escrits
- [ ] Tests unitaris >20% cobertura
- [ ] README complet
- [ ] Desplegament Vercel/Netlify
- [ ] Demo i presentació


---


## 9. Guia d'implementació pas a pas


### Fase 1 — Setup i autenticació


---


#### TASCA 1.1 — Supabase: crear taules i RLS


Ves a **Supabase Dashboard → SQL Editor** i executa aquest script:


```sql
-- Perfils d'usuari (s'omple automàticament quan es registra algú)
create table profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 role text not null default 'user' check (role in ('user', 'admin')),
 name text,
 avatar_url text,
 created_at timestamptz default now()
);


-- Trigger: crea perfil automàticament quan es registra un usuari
create or replace function public.handle_new_user()
returns trigger as $$
begin
 insert into public.profiles (id, name)
 values (new.id, new.raw_user_meta_data->>'name');
 return new;
end;
$$ language plpgsql security definer;


create trigger on_auth_user_created
 after insert on auth.users
 for each row execute procedure public.handle_new_user();


-- Categories
create table categories (
 id serial primary key,
 name text not null,
 slug text not null unique
);


-- Productes
create table products (
 id serial primary key,
 name text not null,
 description text,
 price numeric(10,2) not null,
 stock int not null default 0,
 category_id int references categories(id),
 images text[] default '{}',
 size text,
 created_at timestamptz default now()
);


-- Comandes
create table orders (
 id serial primary key,
 user_id uuid references profiles(id),
 status text not null default 'pending' check (status in ('pending','shipped','completed','cancelled')),
 total numeric(10,2) not null,
 created_at timestamptz default now()
);


-- Línies de comanda
create table order_items (
 id serial primary key,
 order_id int references orders(id) on delete cascade,
 product_id int references products(id),
 quantity int not null,
 unit_price numeric(10,2) not null
);


-- Tallers
create table workshops (
 id serial primary key,
 title text not null,
 description text,
 date timestamptz not null,
 location text,
 capacity int not null default 20,
 image_url text,
 created_by uuid references profiles(id),
 created_at timestamptz default now()
);


-- Registres a tallers
create table workshop_signups (
 id serial primary key,
 workshop_id int references workshops(id) on delete cascade,
 user_id uuid references profiles(id) on delete cascade,
 created_at timestamptz default now(),
 unique(workshop_id, user_id)
);


-- Botigues
create table stores (
 id serial primary key,
 name text not null,
 address text not null,
 lat numeric(10,7) not null,
 lng numeric(10,7) not null,
 schedule text,
 phone text
);
```


**RLS (Row Level Security)** — executa a continuació:


```sql
-- Habilita RLS a totes les taules
alter table profiles enable row level security;
alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table workshops enable row level security;
alter table workshop_signups enable row level security;
alter table stores enable row level security;
alter table categories enable row level security;


-- profiles: cadascú veu només el seu perfil; admin veu tots
create policy "Usuari veu el seu perfil" on profiles for select using (auth.uid() = id);
create policy "Admin veu tots els perfils" on profiles for select using (
 exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Usuari actualitza el seu perfil" on profiles for update using (auth.uid() = id);


-- products: tothom llegeix; només admin escriu
create policy "Tothom llegeix productes" on products for select using (true);
create policy "Admin gestiona productes" on products for all using (
 exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);


-- categories: tothom llegeix; només admin escriu
create policy "Tothom llegeix categories" on categories for select using (true);
create policy "Admin gestiona categories" on categories for all using (
 exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);


-- stores: tothom llegeix; només admin escriu
create policy "Tothom llegeix botigues" on stores for select using (true);
create policy "Admin gestiona botigues" on stores for all using (
 exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);


-- workshops: tothom llegeix; només admin escriu
create policy "Tothom llegeix tallers" on workshops for select using (true);
create policy "Admin gestiona tallers" on workshops for all using (
 exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);


-- workshop_signups: usuari veu i gestiona els seus
create policy "Usuari veu les seves inscripcions" on workshop_signups for select using (auth.uid() = user_id);
create policy "Usuari s'inscriu a tallers" on workshop_signups for insert with check (auth.uid() = user_id);
create policy "Usuari cancel·la inscripció" on workshop_signups for delete using (auth.uid() = user_id);


-- orders: usuari veu les seves; admin veu totes
create policy "Usuari veu les seves comandes" on orders for select using (auth.uid() = user_id);
create policy "Usuari crea comandes" on orders for insert with check (auth.uid() = user_id);
create policy "Admin veu totes les comandes" on orders for select using (
 exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Admin actualitza comandes" on orders for update using (
 exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);


-- order_items: hereta accés via orders
create policy "Usuari veu els seus ítems" on order_items for select using (
 exists (select 1 from orders where orders.id = order_id and orders.user_id = auth.uid())
);
create policy "Usuari crea ítems" on order_items for insert with check (
 exists (select 1 from orders where orders.id = order_id and orders.user_id = auth.uid())
);
```


**Per crear un admin manualment** (primer usuari, per exemple tu):
```sql
-- Primer registra't a l'app, després executa això amb el teu user_id
update profiles set role = 'admin' where id = 'EL_TEU_USER_ID';
```


---


#### TASCA 1.2 — Posar les claus a l'environment


Fitxer: `src/environments/environment.development.ts`
```typescript
export const environment = {
 production: false,
 supabaseUrl: 'https://XXXX.supabase.co',      // Settings → API → Project URL
 supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5c...',  // Settings → API → anon public
};
```


Fitxer: `src/environments/environment.ts` (producció)
```typescript
export const environment = {
 production: true,
 supabaseUrl: 'https://XXXX.supabase.co',
 supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5c...',
};
```


> **Afegeix al `.gitignore`** les dues línies següents per no pujar les claus:
> ```
> src/environments/environment.ts
> src/environments/environment.development.ts
> ```
> I crea versions `.example` sense valors reals per documentar-ho.


---


#### TASCA 1.3 — SupabaseService


Crea el fitxer `src/app/core/supabase.service.ts`:


```typescript
import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';


@Injectable({ providedIn: 'root' })
export class SupabaseService {
 readonly client: SupabaseClient = createClient(
   environment.supabaseUrl,
   environment.supabaseKey
 );
}
```


---


#### TASCA 1.4 — AuthService


Crea `src/app/core/auth/auth.service.ts`:


```typescript
import { Injectable, signal, computed } from '@angular/core';
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
   const { data } = await this.supabase
     .from('profiles')
     .select('role')
     .eq('id', userId)
     .single();
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
```


> **Nota:** Afegeix `inject` als imports: `import { Injectable, signal, computed, inject } from '@angular/core';`


---


#### TASCA 1.5 — Guards


Crea `src/app/core/auth/auth.guard.ts`:


```typescript
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';


export const authGuard: CanActivateFn = () => {
 const auth = inject(AuthService);
 const router = inject(Router);
 if (auth.isLoggedIn()) return true;
 return router.createUrlTree(['/auth/login']);
};
```


Crea `src/app/core/auth/admin.guard.ts`:


```typescript
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';


export const adminGuard: CanActivateFn = () => {
 const auth = inject(AuthService);
 const router = inject(Router);
 if (auth.isAdmin()) return true;
 return router.createUrlTree(['/']);
};
```


---


#### TASCA 1.6 — Interceptors


Crea `src/app/core/interceptors/auth.interceptor.ts`:


```typescript
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
     return next(req.clone({
       setHeaders: { Authorization: `Bearer ${token}` },
     }));
   })
 );
};
```


Crea `src/app/core/interceptors/error.interceptor.ts`:


```typescript
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';


export const errorInterceptor: HttpInterceptorFn = (req, next) => {
 const router = inject(Router);
 const auth = inject(AuthService);
 return next(req).pipe(
   catchError((err) => {
     if (err.status === 401) auth.logout();
     if (err.status === 500) console.error('Error servidor:', err.message);
     return throwError(() => err);
   })
 );
};
```


Crea `src/app/core/interceptors/loading.interceptor.ts`:


```typescript
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LoadingService } from '../loading.service';
import { finalize } from 'rxjs';


export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
 const loading = inject(LoadingService);
 loading.show();
 return next(req).pipe(finalize(() => loading.hide()));
};
```


Crea `src/app/core/loading.service.ts`:


```typescript
import { Injectable, signal } from '@angular/core';


@Injectable({ providedIn: 'root' })
export class LoadingService {
 readonly isLoading = signal(false);
 private count = 0;


 show() { this.count++; this.isLoading.set(true); }
 hide() { if (--this.count <= 0) { this.count = 0; this.isLoading.set(false); } }
}
```


---


#### TASCA 1.7 — Registrar interceptors i routing


Actualitza `src/app/app.config.ts`:


```typescript
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';


export const appConfig: ApplicationConfig = {
 providers: [
   provideBrowserGlobalErrorListeners(),
   provideRouter(routes),
   provideClientHydration(withEventReplay()),
   provideHttpClient(
     withFetch(),
     withInterceptors([authInterceptor, errorInterceptor, loadingInterceptor])
   ),
 ],
};
```


Actualitza `src/app/app.routes.ts`:


```typescript
import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { adminGuard } from './core/auth/admin.guard';


export const routes: Routes = [
 {
   path: '',
   loadComponent: () => import('./features/home/home').then(m => m.Home),
 },
 {
   path: 'shop',
   loadComponent: () => import('./features/shop/shop/shop').then(m => m.Shop),
 },
 {
   path: 'shop/:id',
   loadComponent: () => import('./features/shop/product-detail/product-detail').then(m => m.ProductDetail),
 },
 {
   path: 'cart',
   loadComponent: () => import('./features/cart/cart').then(m => m.Cart),
 },
 {
   path: 'checkout',
   canActivate: [authGuard],
   loadComponent: () => import('./features/checkout/checkout').then(m => m.Checkout),
 },
 {
   path: 'events',
   loadComponent: () => import('./features/events/events').then(m => m.Events),
 },
 {
   path: 'stores',
   loadComponent: () => import('./features/stores/stores').then(m => m.Stores),
 },
 {
   path: 'auth',
   children: [
     {
       path: 'login',
       loadComponent: () => import('./features/auth/login/login').then(m => m.Login),
     },
     {
       path: 'register',
       loadComponent: () => import('./features/auth/register/register').then(m => m.Register),
     },
   ],
 },
 {
   path: 'account',
   canActivate: [authGuard],
   children: [
     {
       path: '',
       loadComponent: () => import('./features/account/account/account').then(m => m.Account),
     },
     {
       path: 'orders',
       loadComponent: () => import('./features/account/orders/orders').then(m => m.Orders),
     },
   ],
 },
 {
   path: 'admin',
   canActivate: [authGuard, adminGuard],
   children: [
     {
       path: 'dashboard',
       loadComponent: () => import('./features/admin/dashboard/dashboard').then(m => m.Dashboard),
     },
     {
       path: 'products',
       loadComponent: () => import('./features/admin/products/products').then(m => m.Products),
     },
     {
       path: 'orders',
       loadComponent: () => import('./features/admin/orders/orders').then(m => m.Orders),
     },
     {
       path: 'events',
       loadComponent: () => import('./features/admin/events/admin-events').then(m => m.AdminEvents),
     },
   ],
 },
 { path: '**', redirectTo: '' },
];
```


---


#### TASCA 1.8 — Models TypeScript


Crea `src/app/core/models/index.ts`:


```typescript
export interface Profile {
 id: string;
 role: 'user' | 'admin';
 name: string | null;
 avatar_url: string | null;
 created_at: string;
}


export interface Category {
 id: number;
 name: string;
 slug: string;
}


export interface Product {
 id: number;
 name: string;
 description: string | null;
 price: number;
 stock: number;
 category_id: number | null;
 images: string[];
 size: string | null;
 created_at: string;
 categories?: Category;
}


export interface Order {
 id: number;
 user_id: string;
 status: 'pending' | 'shipped' | 'completed' | 'cancelled';
 total: number;
 created_at: string;
 order_items?: OrderItem[];
}


export interface OrderItem {
 id: number;
 order_id: number;
 product_id: number;
 quantity: number;
 unit_price: number;
 products?: Product;
}


export interface Workshop {
 id: number;
 title: string;
 description: string | null;
 date: string;
 location: string | null;
 capacity: number;
 image_url: string | null;
 created_by: string | null;
 created_at: string;
}


export interface WorkshopSignup {
 id: number;
 workshop_id: number;
 user_id: string;
 created_at: string;
}


export interface Store {
 id: number;
 name: string;
 address: string;
 lat: number;
 lng: number;
 schedule: string | null;
 phone: string | null;
}
```


---


## 9. Notes i decisions pendents


- **API pública:** La rúbrica genèrica menciona TMDB però el briefing personalitzat no. **Confirmar amb el formador** si cal consumir alguna API pública externa o n'hi ha prou amb Supabase com a backend propi.
- **i18n:** Implementar des del principi per no refactoritzar. Usar `ngx-translate` o Angular i18n natiu.
- **Stripe:** Necessita Supabase Edge Function per no exposar la clau secreta al frontend.
- **Git Flow:** Iniciar des del dia 1 — branques `main`, `develop`, `feature/xxx`.
- **Atomic Design:** Definir els components base (Button, Input, Card, Badge...) abans de construir pàgines.




