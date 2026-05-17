# Secret Garden — Diagrames tècnics

> Tots els diagrames en format Mermaid. Es renderitzen a GitHub, Linear i VSCode (extensió Mermaid Preview).

---

## 1. Arquitectura del sistema

```mermaid
graph TB
    subgraph Client["Client · Angular 22"]
        UI[Pages / Components]
        SVC[Services]
        INT[Interceptors\nauth · error · loading]
        GRD[Guards\nauth · role]
    end

    subgraph Supabase["Supabase · Backend"]
        AUTH[Auth Service\nJWT + RLS]
        DB[(PostgreSQL\nproducts · orders\nworkshops · stores)]
        STR[Storage\nproduct images]
        EFN[Edge Functions\nStripe · Claude AI]
    end

    subgraph External["Serveis externs"]
        STRIPE[Stripe API\npagaments]
        CLAUDE[Claude API\nchatbot IA]
    end

    UI --> SVC
    SVC --> INT
    INT --> AUTH
    INT --> DB
    SVC --> EFN
    SVC --> STR
    EFN --> STRIPE
    EFN --> CLAUDE

    style Client fill:#f0fdf4,stroke:#16a34a
    style Supabase fill:#eff6ff,stroke:#3b82f6
    style External fill:#fef9c3,stroke:#ca8a04
```

---

## 2. Model de dades (ER Diagram)

```mermaid
erDiagram
    profiles {
        uuid id PK
        uuid user_id FK
        varchar role
        varchar name
        varchar avatar_url
    }
    categories {
        uuid id PK
        varchar name
        varchar slug
    }
    products {
        uuid id PK
        varchar name
        text description
        decimal price
        int stock
        uuid category_id FK
        text[] images
        varchar size
        boolean active
    }
    orders {
        uuid id PK
        uuid user_id FK
        varchar status
        decimal total
        jsonb shipping_address
        timestamp created_at
    }
    order_items {
        uuid id PK
        uuid order_id FK
        uuid product_id FK
        int quantity
        decimal unit_price
    }
    workshops {
        uuid id PK
        varchar title
        text description
        timestamp date
        varchar location
        int capacity
        varchar image_url
        uuid created_by FK
    }
    workshop_signups {
        uuid id PK
        uuid workshop_id FK
        uuid user_id FK
        timestamp created_at
    }
    stores {
        uuid id PK
        varchar name
        varchar address
        decimal lat
        decimal lng
        varchar schedule
        varchar phone
    }

    profiles ||--o{ orders : "places"
    profiles ||--o{ workshop_signups : "signs up for"
    profiles ||--o{ workshops : "creates"
    categories ||--o{ products : "contains"
    orders ||--o{ order_items : "includes"
    products ||--o{ order_items : "appears in"
    workshops ||--o{ workshop_signups : "receives"
```

---

## 3. User Flow — Comprador (guest / usuari loguejat)

```mermaid
flowchart TD
    A([Entra al web]) --> B[Home]
    B --> C[Catàleg de productes]
    C --> D{Filtrar / cercar}
    D --> C
    C --> E[Detall de producte]
    E --> F[Afegir al carret]
    F --> G{Continua comprant?}
    G -- Sí --> C
    G -- No --> H[Veure carret]
    H --> I{Està loguejat?}
    I -- No --> J{Vol compte?}
    J -- Sí --> K[Registre]
    J -- No --> L[Checkout com a guest]
    K --> L
    I -- Sí --> L
    L --> M[Formulari Stripe]
    M --> N{Pagament OK?}
    N -- Error --> O[Missatge d'error]
    O --> M
    N -- Èxit --> P[Confirmació de comanda]
    P --> Q([Fi])

    B --> R[Veure calendari de tallers]
    R --> S[Detall del taller]
    S --> T{Loguejat?}
    T -- No --> K
    T -- Sí --> U[Apuntar-se al taller]
    U --> V[Confirmació]

    B --> W[Veure mapa de botigues]
    W --> X[Clic al marcador]
    X --> Y[Popup info botiga]
```

---

## 4. User Flow — Administrador

```mermaid
flowchart TD
    A([Login admin]) --> B{Guard: rol admin?}
    B -- No --> C[Redirect a Home]
    B -- Sí --> D[Admin Dashboard]

    D --> E[Estadístiques\nChart.js]
    D --> F[Gestió de productes]
    D --> G[Gestió de comandes]
    D --> H[Gestió de tallers\ndes del calendari]
    D --> I[Gestió de botigues\ndes del mapa]

    F --> F1[Crear producte]
    F --> F2[Editar producte]
    F --> F3[Eliminar producte]
    F1 & F2 --> F4[Formulari validat\namb imatge]

    G --> G1[Llistar comandes]
    G1 --> G2[Filtrar per estat\npendent · enviat · completat]
    G1 --> G3[Canviar estat de comanda]

    H --> H1[Crear taller\ndes del calendari]
    H --> H2[Editar taller\nclic sobre l'event]
    H --> H3[Eliminar taller]

    I --> I1[Afegir marcador\nal mapa]
    I --> I2[Editar info botiga\nclick sobre marcador]
    I --> I3[Eliminar botiga]

    E --> E1[Vendes per mes]
    E --> E2[Productes més venuts]
    E --> E3[Estat de comandes]
    E --> E4[Inscripcions a tallers]
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
    SupabaseDB-->>Angular: { role: 'admin' | 'user' }
    Angular->>Angular: Redirect segons rol

    Note over Angular,SupabaseDB: Peticions posteriors autenticades

    User->>Angular: Accedeix a recurs protegit
    Angular->>AuthInterceptor: HTTP request
    AuthInterceptor->>AuthInterceptor: Afegeix JWT a la capçalera
    AuthInterceptor->>SupabaseDB: GET /recurs (Authorization: Bearer JWT)
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
    participant EdgeFn as Edge Function (Supabase)
    participant Stripe
    participant DB as PostgreSQL

    User->>Angular: Confirma comanda
    Angular->>EdgeFn: POST /create-payment-intent\n{ items[], total }
    EdgeFn->>Stripe: createPaymentIntent(amount, currency)
    Stripe-->>EdgeFn: { client_secret }
    EdgeFn-->>Angular: { client_secret }
    Angular->>Stripe: stripe.confirmPayment(client_secret)
    Stripe-->>Angular: { status }

    alt Pagament exitós
        Angular->>EdgeFn: POST /confirm-order
        EdgeFn->>DB: INSERT INTO orders + order_items
        EdgeFn-->>Angular: { order_id }
        Angular-->>User: Pàgina de confirmació
    else Pagament fallit
        Angular-->>User: Missatge d'error
        User->>Angular: Reintenta
    end
```

---

## 7. Flux del chatbot IA (Claude API)

```mermaid
sequenceDiagram
    actor User
    participant Widget as Chatbot Widget (Angular)
    participant EdgeFn as Edge Function (Supabase)
    participant Claude as Claude API
    participant DB as PostgreSQL

    User->>Widget: "Tinc un racó de 30x30cm amb poca llum"
    Widget->>EdgeFn: POST /ai-chat\n{ message, conversation_history }
    EdgeFn->>DB: SELECT productes actius (context)
    DB-->>EdgeFn: Llista de productes
    EdgeFn->>Claude: Messages amb context de productes
    Claude-->>EdgeFn: Recomanació amb productes concrets
    EdgeFn-->>Widget: { response, recommended_product_ids[] }
    Widget-->>User: Resposta + links als productes recomanats
```

---

## 8. Estructura de rutes Angular

```mermaid
graph LR
    ROOT["/"] --> HOME["/ · Home"]
    ROOT --> SHOP["/shop · Catàleg"]
    ROOT --> DETAIL["/shop/:id · Detall"]
    ROOT --> CART["/cart · Carret"]
    ROOT --> CHECKOUT["/checkout · Checkout"]
    ROOT --> EVENTS["/events · Calendari"]
    ROOT --> STORES["/stores · Mapa"]
    ROOT --> AUTH["/auth"]
    AUTH --> LOGIN["/auth/login"]
    AUTH --> REGISTER["/auth/register"]
    ROOT --> ACCOUNT["/account · Perfil\n🔒 auth guard"]
    ACCOUNT --> ORDERS["/account/orders"]
    ROOT --> ADMIN["/admin\n🔒 admin guard"]
    ADMIN --> DASH["/admin/dashboard"]
    ADMIN --> PROD["/admin/products"]
    ADMIN --> ORD["/admin/orders"]
    ADMIN --> EVT["/admin/events"]

    style ACCOUNT fill:#fef9c3
    style ADMIN fill:#fee2e2
```
