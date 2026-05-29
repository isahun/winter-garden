# Jardí d'hivern

> Botiga en línia de jardins eterns de plantes preservades amb tallers, mapa de botigues i assessora IA.

Projecte final de Bootcamp Frontend — Angular 22 · Supabase · Stripe · Gemini AI

**[Demo en viu](#)** (no funciona encara) <!-- canviar x URL d Railway quan hagi fet el deploy -->

---

## Captures de pantalla

<!-- m falta posar captures a public/screenshots/ -->

**Home**
<!-- ![Home desktop](public/screenshots/home-desktop.png) -->
> *(captura pendent)*

**Catàleg i detall de producte**
<!-- ![Shop](public/screenshots/shop.png) ![Product detail](public/screenshots/product-detail.png) -->
> *(captura pendent)*

**Calendari de tallers · Mapa de botigues**
<!-- ![Events](public/screenshots/events.png) ![Stores](public/screenshots/stores.png) -->
> *(captura pendent)*

**Chatbot IA · Panell d'administració**
<!-- ![Chatbot](public/screenshots/chatbot.png) ![Admin](public/screenshots/admin.png) -->
> *(captura pendent)*

---

## Stack tecnològic

| Capa | Tecnologia |
|------|------------|
| Framework | Angular 22 amb SSR (Node + Express) |
| Estils | Tailwind CSS v4 amb sistema de disseny propi |
| Backend | Supabase — Auth, PostgreSQL i Storage |
| Pagaments | Stripe Elements |
| IA | Google Gemini API (`gemini-2.5-flash`) en streaming |
| Mapa | Leaflet + OpenStreetMap |
| Calendari | FullCalendar |
| Imatges | Cloudinary |
| Gràfiques | Chart.js |
| Testing | Karma + Jasmine (21 tests, format Gherkin) |

---

## Funcionalitats

### Botiga
- Catàleg amb filtres combinats per categoria, preu màxim i mida
- Paginació de 9 productes per pàgina
- Detall de producte amb galeria d'imatges i lightbox
- Sistema de favorits per a usuaris registrats

### Carret i pagament
- Carret persistent en `localStorage` (funciona sense compte)
- Checkout amb Stripe Elements — pagament per targeta
- Redirecció automàtica a l'historial de comandes en confirmar

### Autenticació
- Registre i login per email/contrasenya
- Login amb Google OAuth
- Guards de ruta independents per a usuari i administrador

### Tallers
- Calendari interactiu amb FullCalendar (vista mensual)
- Events amb codi de color: verd (places lliures) · ambre (quasi ple, <20% restant) · vermell (complet) · gris (passat)
- Inscripció i cancel·lació de places; botó deshabilitat quan el taller és complet
- Color dels events s'actualitza en temps real en apuntar-se o cancel·lar
- Historial de tallers inscrits al compte de l'usuari

### Botigues
- Mapa interactiu amb Leaflet + OpenStreetMap
- Cards amb informació sincronitzada bidireccional amb el mapa
- Clic al marcador/card ressalta la botiga seleccionada

### Chatbot IA
- Widget flotant accessible des de qualsevol pàgina
- Respostes en streaming (`Transfer-Encoding: chunked`)
- Context enriquit amb el catàleg real de productes
- Model Gemini 2.5 Flash, respon sempre en català

### Panell d'administració
- CRUD complet de productes amb pujada d'imatges via Cloudinary
- Soft delete de productes (arxivar/restaurar) per preservar l'historial de comandes
- Gestió de comandes amb canvi d'estat (pendent · enviat · completat)
- Creació i edició de tallers des del calendari (desktop: panell lateral · mòbil: bottom sheet)
- Comptador d'inscrits per taller, llista de participants amb email
- Dashboard amb KPIs (vendes, comandes, productes) i gràfiques Chart.js

---

## Comptes de prova

| Rol | Email | Contrasenya |
|-----|-------|-------------|
| Usuari | user@test.com | test123 |
| Admin | admin@test.com | test123 |

### Targetes de prova Stripe

L'entorn de test de Stripe no cobra diners reals. Fes servir aquestes dades al formulari de checkout:

| Cas | Número de targeta | Caducitat | CVC |
|-----|-------------------|-----------|-----|
| Pagament correcte | `4242 4242 4242 4242` | Qualsevol data futura | Qualsevol 3 dígits |
| Targeta rebutjada | `4000 0000 0000 0002` | Qualsevol data futura | Qualsevol 3 dígits |
| Fons insuficients | `4000 0000 0000 9995` | Qualsevol data futura | Qualsevol 3 dígits |

---

## Posada en marxa

### Requisits

- Node.js >= 22.22.0 (recomanat: v24)
- npm >= 11

### Instal·lació

```bash
git clone https://github.com/isahun/winter-garden.git
cd winter-garden
npm install
```

### Variables d'entorn

Crea un fitxer `.env` a l'arrel del projecte:

```env
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
STRIPE_SECRET_KEY=
GEMINI_API_KEY=
PORT=4000
```

Edita `src/environments/environment.development.ts` amb les claus públiques:

```ts
export const environment = {
  supabaseUrl: '',
  supabaseAnonKey: '',
  stripeKey: '',
  cloudinaryCloudName: '',
  cloudinaryUploadPreset: '',
};
```

### Executar en local

```bash
ng serve
```

Obre `http://localhost:4200`. El dev server inclou les API routes d'Express (`/api/chatbot`, `/api/payment-intent`), de manera que el chatbot i Stripe funcionen en local sense cap pas addicional.

Per a un build de producció:

```bash
ng build && node dist/secret-garden/server/server.mjs
```

### Tests

```bash
ng test
```

---

## Estructura del projecte

```
src/
├── app/
│   ├── core/
│   │   ├── auth/              # AuthService, authGuard, adminGuard
│   │   ├── interceptors/      # auth, error, loading
│   │   ├── models/            # Interfaces TypeScript
│   │   └── services/
│   │       ├── cart.service         # Carret — localStorage
│   │       ├── chat.service         # Streaming Gemini AI
│   │       ├── dashboard.service    # KPIs i estadístiques del panell admin
│   │       ├── favorites.service    # Favorits de l'usuari (Supabase)
│   │       ├── image.service        # Pujada d'imatges a Cloudinary
│   │       ├── product.service      # CRUD de productes (Supabase)
│   │       └── workshop.service     # CRUD de tallers i inscripcions (Supabase)
│   ├── features/
│   │   ├── admin/
│   │   │   ├── dashboard/     # KPIs i gràfiques Chart.js
│   │   │   ├── products/      # CRUD de productes
│   │   │   ├── orders/        # Gestió d'estat de comandes
│   │   │   └── events/        # Creació i edició de tallers
│   │   ├── account/
│   │   │   ├── account/       # Perfil d'usuari
│   │   │   ├── orders/        # Historial de comandes
│   │   │   ├── favorites/     # Productes favorits
│   │   │   └── workshops/     # Tallers inscrits
│   │   ├── shop/
│   │   │   ├── shop/          # Catàleg amb filtres i paginació
│   │   │   └── product-detail/ # Galeria, lightbox i afegir al carret
│   │   ├── checkout/          # Formulari de pagament Stripe
│   │   ├── events/            # Calendari FullCalendar (vista pública)
│   │   ├── stores/            # Mapa Leaflet + cards sincronitzades
│   │   ├── cart/              # Carret de la compra
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── home/              # Landing page
│   │   └── faq/               # Preguntes freqüents
│   └── shared/
│       └── components/
│           ├── navbar/        # Glassmorphism top nav + bottom nav mòbil
│           ├── footer/
│           ├── chatbot/       # Widget flotant IA
│           └── layout/
├── environments/              # Claus públiques per entorn
└── server.ts                  # Express SSR + API routes (/api/payment-intent, /api/chatbot)
```

---

## Refactors recents

### Capa de serveis (maig 2026)

La lògica de negoci que estava acoblada als components s'ha extret progressivament a serveis dedicats dins de `core/services/`:

| Servei | Responsabilitat | Extret de |
|--------|----------------|-----------|
| `WorkshopService` | CRUD de tallers, inscripcions i cancel·lacions a Supabase | `admin-events` component |
| `ImageService` | Pujada i transformació d'imatges a Cloudinary | `admin-products` component |
| `DashboardService` | Consultes de KPIs (vendes, comandes, productes) a Supabase | `admin-dashboard` component |

Cada component admin ara delega tota la comunicació amb serveis externs al servei corresponent i només gestiona l'estat de la UI.

### Navbar (glassmorphism + mòbil)

- Top navbar amb efecte glassmorphism, visible en desktop
- Bottom navigation fixa en mòbil (signal `menuOpen` + classes `md:hidden` / `md:flex`)
- Padding inferior afegit als layouts per evitar solapament amb el bottom nav

---

## Arquitectura

El projecte utilitza Angular SSR amb Node Express com a servidor únic:
- Les rutes `/api/*` les gestiona Express directament (Stripe i Gemini no poden anar al client per seguretat)
- La resta de peticions les processa Angular SSR
- Supabase s'usa tant des del client (amb `anonKey` + RLS) com des del servidor (amb `service_role` per al context del chatbot)

---

## Deploy a Railway

1. Crea un projecte nou a [railway.app](https://railway.app) i connecta el repositori de GitHub.
2. Railway detecta `package.json` automàticament. Configura manualment:
   - **Build command:** `ng build`
   - **Start command:** `node dist/secret-garden/server/server.mjs`
3. Afegeix les variables d'entorn des del panell de Railway (les mateixes que al fitxer `.env` local):

| Variable | On obtenir-la |
|----------|---------------|
| `SUPABASE_URL` | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_KEY` | Supabase → Project Settings → API → `service_role` |
| `STRIPE_SECRET_KEY` | Stripe Dashboard → Developers → API keys |
| `GEMINI_API_KEY` | Google AI Studio → API keys |

> Railway injecta `PORT` automàticament — no cal afegir-la.

4. Afegeix la URL del deploy de Railway a la llista de dominis autoritzats de Supabase (Authentication → URL Configuration).

---

## Llicència

Projecte educatiu — Bootcamp Frontend 2025-2026. Tots els drets reservats.
