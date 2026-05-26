# Jardí d'hivern — Diagrames tècnics

> Tots els diagrames en format Mermaid. Es renderitzen a GitHub, Linear i VSCode (extensió Mermaid Preview).

---

## 1. Arquitectura del sistema

```mermaid
graph TB
    subgraph Client["Client · Angular 22"]
        UI[Pages / Components]
        SVC[Services]
        INT["Interceptors<br/>auth · error · loading"]
        GRD["Guards<br/>auth · role"]
    end

    subgraph SSR["Angular SSR · Express"]
        API_PAY["POST /api/payment-intent"]
        API_CHAT["POST /api/chatbot<br/>(streaming)"]
    end

    subgraph Supabase["Supabase · Backend"]
        AUTH["Auth Service<br/>JWT + RLS"]
        DB[("PostgreSQL<br/>products · orders · favorites<br/>workshops · stores")]
        STR["Storage<br/>product images"]
    end

    subgraph External["Serveis externs"]
        STRIPE["Stripe API<br/>pagaments"]
        GEMINI["Gemini API<br/>gemini-2.5-flash"]
    end

    UI --> SVC
    UI --> GRD
    GRD --> AUTH
    SVC --> AUTH
    SVC --> DB
    SVC --> STR
    SVC --> INT
    INT --> AUTH
    INT --> API_PAY
    SVC --> API_CHAT
    API_PAY --> STRIPE
    API_CHAT --> DB
    API_CHAT --> GEMINI

    style Client fill:#f0fdf4,stroke:#16a34a
    style SSR fill:#fdf4ff,stroke:#9333ea
    style Supabase fill:#eff6ff,stroke:#3b82f6
    style External fill:#fef9c3,stroke:#ca8a04
```

---

## 2. Model de dades (ER Diagram)

```mermaid
erDiagram
    profiles {
        uuid id PK
        text role
        text name
        text avatar_url
        timestamptz created_at
    }
    categories {
        int id PK
        text name
        text slug
    }
    products {
        int id PK
        text name
        text description
        numeric price
        int stock
        int category_id FK
        text[] images
        text size
        boolean featured
        timestamptz created_at
    }
    orders {
        int id PK
        uuid user_id FK
        text status
        numeric total
        timestamptz created_at
    }
    order_items {
        int id PK
        int order_id FK
        int product_id FK
        int quantity
        numeric unit_price
    }
    workshops {
        int id PK
        text title
        text description
        timestamptz date
        text location
        int capacity
        text image_url
        uuid created_by FK
        numeric price
        text difficulty
        int store_id FK
        timestamptz created_at
    }
    workshop_signups {
        int id PK
        int workshop_id FK
        uuid user_id FK
        timestamptz created_at
    }
    stores {
        int id PK
        text name
        text address
        numeric lat
        numeric lng
        text schedule
        text phone
        text email
    }
    favorites {
        int id PK
        uuid user_id FK
        int product_id FK
        timestamptz created_at
    }

    profiles ||--o{ orders : "places"
    profiles ||--o{ workshop_signups : "signs up for"
    profiles ||--o{ workshops : "creates"
    profiles ||--o{ favorites : "saves"
    categories ||--o{ products : "contains"
    orders ||--o{ order_items : "includes"
    products ||--o{ order_items : "appears in"
    products ||--o{ favorites : "saved in"
    workshops ||--o{ workshop_signups : "receives"
    stores ||--o{ workshops : "hosts"
```

---

## 3. User Flow — Comprador (guest / usuari loguejat)

```mermaid
flowchart TD
    A([Entra al web]) --> B[Home]
    B --> C[Cataleg de productes]
    C --> D{Filtrar / cercar}
    D --> C
    C --> E[Detall de producte]
    E --> F[Afegir al carret]
    E --> E2{Esta loguejat?}
    E2 -- Si --> E3[Guardar a favorits]
    E2 -- No --> K
    F --> G{Continua comprant?}
    G -- Si --> C
    G -- No --> H[Veure carret]
    H --> I{Esta loguejat?}
    I -- No --> K[Login / Registre]
    K --> L[Checkout]
    I -- Si --> L
    L --> M[Formulari Stripe]
    M --> N{Pagament OK?}
    N -- Error --> O[Missatge d'error]
    O --> M
    N -- Exit --> P[Confirmacio de comanda]
    P --> Q([Fi])

    B --> R[Veure calendari de tallers]
    R --> S[Detall del taller]
    S --> T{Loguejat?}
    T -- No --> K
    T -- Si --> U[Apuntar-se al taller]
    U --> V[Confirmacio]

    B --> W[Veure mapa de botigues]
    W --> X[Clic al marcador]
    X --> Y[Popup info botiga]

    B --> Z[FAQ]
```

---

## 4. User Flow — Administrador

```mermaid
flowchart TD
    A([Login admin]) --> B{Guard: rol admin?}
    B -- No --> C[Redirect a Home]
    B -- Si --> D[Admin Dashboard]

    D --> E["Estadistiques<br/>Chart.js"]
    D --> F[Gestio de productes]
    D --> G[Gestio de comandes]
    D --> H["Gestio de tallers<br/>des del calendari"]

    F --> F1[Crear producte]
    F --> F2[Editar producte]
    F --> F3[Eliminar producte]
    F1 & F2 --> F4["Formulari validat<br/>amb imatge"]

    G --> G1[Llistar comandes]
    G1 --> G2["Filtrar per estat<br/>pendent · enviat · completat"]
    G1 --> G3[Canviar estat de comanda]

    H --> H1["Crear taller<br/>des del calendari"]
    H --> H2["Editar taller<br/>clic sobre l'event"]
    H --> H3[Eliminar taller]

    E --> E1[Vendes per mes]
    E --> E2[Estat de comandes]
```

---

## 5. Flux d'autenticació (Sequence Diagram)

```mermaid
sequenceDiagram
    actor User
    participant Angular
    participant AuthInterceptor
    participant SupabaseAuth
    participant SupabaseDB

    User->>Angular: Login (email + password)
    Angular->>SupabaseAuth: signInWithPassword()
    SupabaseAuth-->>Angular: JWT token + user data
    Angular->>Angular: Desa token (Supabase session)
    Angular->>SupabaseDB: Consulta perfil (role)
    SupabaseDB-->>Angular: role admin o user
    Angular->>Angular: Redirect segons rol

    Note over Angular,SupabaseDB: Peticions posteriors autenticades

    User->>Angular: Accedeix a recurs protegit
    Angular->>Angular: authGuard comprova sessio activa
    Angular->>SupabaseDB: Crida via Supabase JS client
    SupabaseDB->>SupabaseDB: Comprova RLS Policy
    SupabaseDB-->>Angular: Dades filtrades per rol
    Angular-->>User: Mostra dades
```

---

## 6. Flux de pagament amb Stripe

```mermaid
sequenceDiagram
    actor User
    participant Angular
    participant SSR as Express SSR<br/>/api/payment-intent
    participant Stripe
    participant DB as Supabase PostgreSQL

    User->>Angular: Confirma comanda
    Angular->>SSR: POST /api/payment-intent { amount }
    SSR->>Stripe: paymentIntents.create(amount, EUR)
    Stripe-->>SSR: client_secret
    SSR-->>Angular: client_secret
    Angular->>Stripe: stripe.confirmPayment(client_secret)
    Note over Stripe,Angular: Redirecció a /account/orders

    alt Pagament exitos
        Angular->>DB: INSERT INTO orders (user_id, total, status)
        Angular-->>User: Pagina de confirmacio a /account/orders
    else Pagament fallit
        Angular-->>User: Missatge d'error inline
        User->>Angular: Reintenta
    end
```

---

## 7. Flux del chatbot IA (Gemini API)

```mermaid
sequenceDiagram
    actor User
    participant Widget as ChatbotWidget
    participant SSR as Express SSR<br/>/api/chatbot
    participant DB as Supabase PostgreSQL
    participant Gemini as Gemini API<br/>gemini-2.5-flash

    User->>Widget: Tinc un raco de 30x30cm amb poca llum
    Widget->>SSR: POST /api/chatbot { message }
    SSR->>DB: SELECT name, description, price FROM products LIMIT 20
    DB-->>SSR: Llista de productes
    SSR->>Gemini: generateContentStream amb systemInstruction + productes
    Note over SSR,Gemini: Streaming de text (Transfer-Encoding: chunked)
    Gemini-->>SSR: chunks de text
    SSR-->>Widget: stream de text
    Widget-->>User: Resposta renderitzada progressivament
```

---

## 8. Estructura de rutes Angular

```mermaid
graph LR
    ROOT["AppComponent<br/>router-outlet"] --> AUTH["/auth<br/>(sense Layout)"]
    ROOT --> LAYOUT["Layout<br/>Navbar + router-outlet"]
    ROOT --> WILD["** redir. /"]

    AUTH --> LOGIN["/auth/login"]
    AUTH --> REGISTER["/auth/register"]

    LAYOUT --> HOME["/ Home"]
    LAYOUT --> SHOP["/shop Cataleg"]
    LAYOUT --> DETAIL["/shop/:id Detall"]
    LAYOUT --> CART["/cart Carret"]
    LAYOUT --> CHECKOUT["/checkout<br/>authGuard"]
    LAYOUT --> EVENTS["/events Calendari"]
    LAYOUT --> STORES["/stores Mapa"]
    LAYOUT --> FAQ["/faq Preguntes freqüents"]
    LAYOUT --> ACCOUNT["/account<br/>authGuard"]
    LAYOUT --> ADMIN["/admin<br/>authGuard + adminGuard"]

    ACCOUNT --> ACC_ROOT["/account Perfil"]
    ACCOUNT --> ACC_ORD["/account/orders"]
    ACCOUNT --> ACC_FAV["/account/favorites"]
    ACCOUNT --> ACC_WRK["/account/workshops"]

    ADMIN --> DASH["/admin/dashboard"]
    ADMIN --> PROD["/admin/products"]
    ADMIN --> ORD["/admin/orders"]
    ADMIN --> EVT["/admin/events"]

    style AUTH fill:#f0f0f0,stroke:#aaa
    style LAYOUT fill:#f0fdf4,stroke:#16a34a
    style ACCOUNT fill:#fef9c3,stroke:#ca8a04
    style CHECKOUT fill:#fef9c3,stroke:#ca8a04
    style ADMIN fill:#fee2e2,stroke:#dc2626
```
