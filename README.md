# Jardí d'hivern

> Botiga en línia de jardins eterns de plantes preservades amb tallers, mapa de botigues i assessora IA.

Projecte final de Bootcamp Frontend — Angular 22 · Supabase · Stripe · Gemini AI

**[Demo en viu](#)** <!-- canviar x URL d Railway un cop hagi fet el deploy -->

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
| Testing | Vitest |

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
- Inscripció i cancel·lació de places
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
- Gestió de comandes amb canvi d'estat (pendent · enviat · completat)
- Creació i edició de tallers des del calendari
- Dashboard amb KPIs (vendes, comandes, productes) i gràfiques Chart.js

---

## Comptes de prova

| Rol | Email | Contrasenya |
|-----|-------|-------------|
| Usuari | user@test.com | test123 |
| Admin | admin@test.com | test123 |

---

## Posada en marxa

### Requisits

- Node.js >= 20
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
│   │   ├── auth/          # AuthService, authGuard, adminGuard
│   │   ├── interceptors/  # auth, error, loading
│   │   ├── models/        # Interfaces TypeScript
│   │   └── services/      # CartService, ProductService, FavoritesService, ChatService
│   ├── features/
│   │   ├── admin/         # Dashboard, productes, comandes, tallers (CRUD)
│   │   ├── account/       # Perfil, comandes, favorits, tallers inscrits
│   │   ├── shop/          # Catàleg i detall de producte
│   │   ├── checkout/      # Formulari de pagament Stripe
│   │   ├── events/        # Calendari FullCalendar
│   │   ├── stores/        # Mapa Leaflet
│   │   ├── cart/          # Carret de la compra
│   │   ├── auth/          # Login i registre
│   │   ├── home/          # Landing page
│   │   └── faq/           # Preguntes freqüents
│   └── shared/
│       └── components/    # Navbar, footer, chatbot, layout
├── environments/          # Claus públiques per entorn
└── server.ts              # Express SSR + API routes (/api/payment-intent, /api/chatbot)
```

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

Projecte educatiu — Bootcamp Frontend 2024-2025. Tots els drets reservats.
