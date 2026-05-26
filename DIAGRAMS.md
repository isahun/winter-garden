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
        DB[("PostgreSQL<br/>products · orders<br/>workshops · stores")]
        STR["Storage<br/>product images"]
    end

    subgraph External["Serveis externs"]
        STRIPE["Stripe API<br/>pagaments"]
        GEMINI["Gemini API<br/>gemini-2.5-flash"]
    end

    UI --> SVC
    SVC --> INT
    INT --> AUTH
    INT --> DB
    SVC --> STR
    SVC --> API_PAY
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
        text images
        varchar size
        boolean active
    }
    orders {
        uuid id PK
        uuid user_id FK
        varchar status
        decimal total
        varchar shipping_address
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
    B --> C[Cataleg de productes]
    C --> D{Filtrar / cercar}
    D --> C
    C --> E[Detall de producte]
    E --> F[Afegir al carret]
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
    D --> I["Gestio de botigues<br/>des del mapa"]

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

    I --> I1["Afegir marcador<br/>al mapa"]
    I --> I2["Editar info botiga<br/>clic sobre marcador"]
    I --> I3[Eliminar botiga]

    E --> E1[Vendes per mes]
    E --> E2[Productes mes venuts]
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
    SupabaseDB-->>Angular: role admin o user
    Angular->>Angular: Redirect segons rol

    Note over Angular,SupabaseDB: Peticions posteriors autenticades

    User->>Angular: Accedeix a recurs protegit
    Angular->>AuthInterceptor: HTTP request
    AuthInterceptor->>AuthInterceptor: Afegeix JWT a la capcalera
    AuthInterceptor->>SupabaseDB: GET /recurs amb Authorization Bearer
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
