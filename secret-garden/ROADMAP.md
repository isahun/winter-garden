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

## 9. Notes i decisions pendents

- **API pública:** La rúbrica genèrica menciona TMDB però el briefing personalitzat no. **Confirmar amb el formador** si cal consumir alguna API pública externa o n'hi ha prou amb Supabase com a backend propi.
- **i18n:** Implementar des del principi per no refactoritzar. Usar `ngx-translate` o Angular i18n natiu.
- **Stripe:** Necessita Supabase Edge Function per no exposar la clau secreta al frontend.
- **Git Flow:** Iniciar des del dia 1 — branques `main`, `develop`, `feature/xxx`.
- **Atomic Design:** Definir els components base (Button, Input, Card, Badge...) abans de construir pàgines.
