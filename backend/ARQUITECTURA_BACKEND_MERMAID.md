# Arquitectura Backend - Diagramas Mermaid

## Diagnostico rapido

El backend usa una arquitectura por capas con estilo Clean Architecture / Hexagonal:

- `l01-presentation`: controladores REST de NestJS.
- `l02-agent`: agente conversacional y manejo de conversaciones.
- `l03-application`: servicios de aplicacion y casos de uso.
- `l04-domain`: entidades, enums, puertos e interfaces del dominio.
- `l05-infrastructure`: adaptadores concretos, Prisma, cache, pagos, IA, storage y notificaciones.

La regla principal observada es: los servicios de aplicacion consumen interfaces del dominio y la infraestructura implementa esas interfaces con adaptadores concretos.

## 1. Vista Clean Architecture / Hexagonal

```mermaid
flowchart TB
  %% Backend Aura Marketplace - Clean / Hexagonal Architecture

  subgraph External["Actores y sistemas externos"]
    Browser["Frontend React / Vite"]
    Buyer["Comprador"]
    Seller["Vendedor"]
    Admin["Administrador"]
    MP["Mercado Pago"]
    Gemini["Gemini AI / STT"]
    Cloudinary["Cloudinary"]
    Redis["Upstash Redis"]
    Neon["Neon PostgreSQL"]
    MailProvider["Proveedor de notificaciones<br/>actual o futuro"]
  end

  subgraph API["Backend NestJS"]
    Main["main.ts<br/>Bootstrap, CORS, ValidationPipe, Swagger"]
    AppModule["AppModule<br/>Composition Root"]

    subgraph L01["L01 Presentation - Interface Adapters de entrada"]
      AuthCtrl["AuthController"]
      UsersCtrl["UsersController"]
      ProductsCtrl["ProductsController"]
      CategoriesCtrl["CategoriesController"]
      CartCtrl["CartController"]
      OrdersCtrl["OrdersController"]
      PaymentsCtrl["PaymentsController"]
      AgentCtrl["AgentController"]
      AdminCtrl["AdminController"]
      OtherCtrls["Favorites / Reviews / Promotions / Notifications"]
    end

    subgraph L02["L02 Agent - Orquestacion conversacional"]
      AgentSvc["AgentService"]
      ConversationSvc["ConversationsService"]
    end

    subgraph L03["L03 Application - Casos de uso"]
      AuthSvc["AuthService / NeonAuthService"]
      UsersSvc["UsersService"]
      ProductsSvc["ProductsService"]
      CategoriesSvc["CategoriesService"]
      CartSvc["CartService"]
      OrdersSvc["OrdersService"]
      PaymentsSvc["PaymentsService"]
      AdminSvc["AdminService"]
      AuditSvc["AuditService + AuditInterceptor"]
      SupportSvc["Favorites / Reviews / Promotions / Notifications"]
    end

    subgraph L04["L04 Domain - Nucleo"]
      Entities["UsuarioEntity<br/>RefreshTokenEntity<br/>Product enums"]
      Ports["Ports<br/>IUserRepository, IProductRepository,<br/>ICartRepository, IOrderRepository,<br/>IPaymentGateway, IHasher,<br/>ICacheProvider, AI Providers, etc."]
      Rules["Reglas e invariantes<br/>roles, estados, stock, pagos, ordenes"]
    end

    subgraph L05["L05 Infrastructure - Adaptadores de salida"]
      PrismaAdapters["Prisma repository adapters"]
      PrismaSvc["PrismaService"]
      Hasher["Argon2HasherService"]
      PaymentAdapter["MercadoPagoService"]
      AiAdapters["GeminiLanguageModelProvider<br/>GeminiSpeechToTextProvider<br/>MockTextToSpeechProvider"]
      CacheAdapter["SimpleCacheService"]
      StorageAdapter["CloudinaryService / MockStorageProvider"]
      NotifyAdapter["ResendMailService / ConsoleMailService<br/>MockNotificationProvider"]
    end
  end

  Buyer --> Browser
  Seller --> Browser
  Admin --> Browser
  Browser --> Main --> AppModule --> L01

  AuthCtrl --> AuthSvc
  UsersCtrl --> UsersSvc
  ProductsCtrl --> ProductsSvc
  CategoriesCtrl --> CategoriesSvc
  CartCtrl --> CartSvc
  OrdersCtrl --> OrdersSvc
  PaymentsCtrl --> PaymentsSvc
  AgentCtrl --> AgentSvc
  AdminCtrl --> AdminSvc
  OtherCtrls --> SupportSvc

  AgentSvc --> ConversationSvc
  AgentSvc --> Ports
  L03 --> Ports
  Ports --> Entities
  Ports --> Rules

  PrismaAdapters -. implementan .-> Ports
  Hasher -. implementa .-> Ports
  PaymentAdapter -. implementa .-> Ports
  AiAdapters -. implementan .-> Ports
  CacheAdapter -. implementa .-> Ports
  NotifyAdapter -. implementa .-> Ports

  PrismaAdapters --> PrismaSvc --> Neon
  PaymentAdapter --> MP
  PaymentAdapter --> PrismaSvc
  AiAdapters --> Gemini
  CacheAdapter --> Redis
  StorageAdapter --> Cloudinary
  NotifyAdapter --> MailProvider
```

## 2. Vista de modulos funcionales NestJS

```mermaid
flowchart LR
  Client["Cliente HTTP<br/>Frontend / Swagger / Webhooks"] --> Guards["Guards + Decorators<br/>JwtAuthGuard, RolesGuard, Public"]
  Guards --> Controllers["Controllers L01"]

  subgraph Modules["AppModule imports"]
    Auth["AuthModule"]
    Users["UsersModule"]
    Admin["AdminModule"]
    Categories["CategoriesModule"]
    Products["ProductsModule"]
    Cart["CartModule"]
    Orders["OrdersModule"]
    Payments["PaymentsModule"]
    Agent["AgentModule"]
    Audit["AuditModule"]
    Favorites["FavoritesModule"]
    Reviews["ReviewsModule"]
    Promotions["PromotionsModule"]
    Notifications["NotificationsModule"]
  end

  Controllers --> Modules

  Auth --> UserRepo["IUserRepository"]
  Auth --> TokenRepo["IRefreshTokenRepository / ITokenRevocadoRepository"]
  Auth --> Hasher["IHasher"]
  Auth --> Mail["IMailSender"]

  Users --> UserRepo
  Admin --> AdminRepo["IAdminRepository"]
  Categories --> CategoryRepo["ICategoriaRepository"]
  Categories --> Cache["ICacheProvider"]
  Products --> ProductRepo["IProductRepository"]
  Products --> CategoryRepo
  Products --> Cache
  Cart --> CartRepo["ICartRepository"]
  Cart --> ProductRepo
  Orders --> OrderRepo["IOrderRepository"]
  Orders --> CartRepo
  Orders --> UserRepo
  Payments --> Gateway["IPaymentGateway"]
  Agent --> ProductRepo
  Agent --> ConversationRepo["IConversationRepository"]
  Agent --> AI["LanguageModelProvider / STT / TTS"]
  Audit --> AuditRepo["IAuditRepository"]
  Favorites --> FavoriteRepo["IFavoriteRepository"]
  Favorites --> ProductRepo
  Reviews --> ReviewRepo["IReviewRepository"]
  Reviews --> ProductRepo
  Reviews --> OrderRepo
  Promotions --> PromotionRepo["IPromotionRepository"]
  Notifications --> NotificationRepo["INotificationRepository"]
  Notifications --> NotificationProvider["INotificationProvider"]
  Notifications --> UserRepo

  subgraph DatabaseModule["Global DatabaseModule"]
    UserRepo --> PrismaUser["PrismaUserRepository"]
    ProductRepo --> PrismaProduct["PrismaProductRepository"]
    CategoryRepo --> PrismaCategory["PrismaCategoriaRepository"]
    CartRepo --> PrismaCart["PrismaCartRepository"]
    OrderRepo --> PrismaOrder["PrismaOrderRepository"]
    ConversationRepo --> PrismaConversation["PrismaConversationRepository"]
    AdminRepo --> PrismaAdmin["PrismaAdminRepository"]
    AuditRepo --> PrismaAudit["PrismaAuditRepository"]
    FavoriteRepo --> PrismaFavorite["PrismaFavoriteRepository"]
    ReviewRepo --> PrismaReview["PrismaReviewRepository"]
    PromotionRepo --> PrismaPromotion["PrismaPromotionRepository"]
    NotificationRepo --> PrismaNotification["PrismaNotificationRepository"]
  end

  PrismaUser --> Prisma["PrismaService"]
  PrismaProduct --> Prisma
  PrismaCategory --> Prisma
  PrismaCart --> Prisma
  PrismaOrder --> Prisma
  PrismaConversation --> Prisma
  PrismaAdmin --> Prisma
  PrismaAudit --> Prisma
  PrismaFavorite --> Prisma
  PrismaReview --> Prisma
  PrismaPromotion --> Prisma
  PrismaNotification --> Prisma
  Prisma --> DB[("PostgreSQL / Neon")]
```

## 3. Vista de despliegue e integraciones

```mermaid
flowchart TB
  subgraph UserZone["Zona de usuarios"]
    U1["Comprador"]
    U2["Vendedor"]
    U3["Administrador"]
    U4["Visitante"]
  end

  subgraph FrontendZone["Frontend"]
    Web["React + Vite<br/>Vercel / Cloudflare Pages"]
  end

  subgraph BackendZone["Backend Render"]
    Nest["NestJS API<br/>Node.js"]
    Swagger["Swagger<br/>/api/docs"]
    Static["Static uploads<br/>/uploads"]
    Scheduler["ScheduleModule<br/>cron ordenes pendientes"]
  end

  subgraph DataZone["Persistencia y cache"]
    DB[("Neon PostgreSQL")]
    Cache[("Upstash Redis<br/>opcional")]
  end

  subgraph ProviderZone["Proveedores externos"]
    Payment["Mercado Pago<br/>checkout, brick, webhook"]
    AI["Gemini<br/>LLM y STT"]
    CDN["Cloudinary<br/>imagenes"]
    Mail["Mail / Notification provider<br/>actualmente mock/dummy"]
    NeonAuth["Neon Auth JWKS"]
  end

  U1 --> Web
  U2 --> Web
  U3 --> Web
  U4 --> Web
  Web -->|HTTPS REST| Nest
  Nest --> Swagger
  Nest --> Static
  Nest --> Scheduler
  Nest --> DB
  Nest --> Cache
  Nest --> Payment
  Payment -->|webhook| Nest
  Nest --> AI
  Nest --> CDN
  Nest --> Mail
  Nest --> NeonAuth
```

## 4. Flujo de compra y pago

```mermaid
sequenceDiagram
  autonumber
  actor Buyer as Comprador
  participant FE as Frontend
  participant CartCtrl as CartController
  participant CartSvc as CartService
  participant OrdersCtrl as OrdersController
  participant OrdersSvc as OrdersService
  participant PaymentsCtrl as PaymentsController
  participant PaySvc as PaymentsService
  participant MP as MercadoPagoService
  participant Prisma as Prisma/Repositorios
  participant Gateway as Mercado Pago

  Buyer->>FE: Agrega productos al carrito
  FE->>CartCtrl: POST /cart/items
  CartCtrl->>CartSvc: addItem(userId, productId, cantidad)
  CartSvc->>Prisma: Verifica producto e inventario
  Prisma-->>CartSvc: Producto disponible
  CartSvc-->>FE: Carrito actualizado

  Buyer->>FE: Confirma compra
  FE->>OrdersCtrl: POST /orders
  OrdersCtrl->>OrdersSvc: createOrder(userId, direccionId, cupon)
  OrdersSvc->>Prisma: Lee carrito, direccion, cupon y stock
  OrdersSvc->>Prisma: Crea orden desde carrito
  Prisma-->>OrdersSvc: Orden PENDIENTE
  OrdersSvc-->>FE: Orden creada

  FE->>PaymentsCtrl: POST /payments/checkout/:orderId
  PaymentsCtrl->>PaySvc: createCheckoutPreference
  PaySvc->>MP: createCheckoutPreference
  MP->>Prisma: Lee orden y registra Pago PENDIENTE
  MP->>Gateway: Crea preferencia con idempotencyKey
  Gateway-->>MP: preferenceId + checkoutUrl
  MP-->>FE: URL de checkout

  Gateway-->>PaymentsCtrl: POST /payments/webhook
  PaymentsCtrl->>PaySvc: handleWebhook
  PaySvc->>MP: verifyPayment / applyPaymentStatus
  MP->>Prisma: Actualiza Pago y Orden CONFIRMADA si aprobado
```

## 5. Modelo de dominio resumido

```mermaid
erDiagram
  USUARIO ||--o{ REFRESH_TOKEN : tiene
  USUARIO ||--o{ DIRECCION : registra
  USUARIO ||--|| PREFERENCIAS_USUARIO : configura
  USUARIO ||--o{ PUBLICACION : vende
  USUARIO ||--|| CARRITO : posee
  USUARIO ||--o{ ORDEN : compra
  USUARIO ||--o{ SESION : inicia
  USUARIO ||--o{ FAVORITO : marca
  USUARIO ||--o{ RESENA : escribe
  USUARIO ||--o{ NOTIFICACION : recibe
  USUARIO ||--o{ AUDITORIA : genera

  CATEGORIA ||--o{ CATEGORIA : jerarquia
  CATEGORIA ||--o{ PUBLICACION : clasifica
  PUBLICACION ||--|| INVENTARIO : controla
  PUBLICACION ||--o{ IMAGEN_PUBLICACION : muestra
  PUBLICACION ||--o{ ITEM_CARRITO : aparece_en
  PUBLICACION ||--o{ LINEA_ORDEN : vendido_como
  PUBLICACION ||--o{ FAVORITO : favorito
  PUBLICACION ||--o{ RESENA : recibe
  PUBLICACION ||--o{ PROMOCION : aplica

  CARRITO ||--o{ ITEM_CARRITO : contiene
  ORDEN ||--o{ LINEA_ORDEN : contiene
  ORDEN ||--|| PAGO : paga
  ORDEN ||--o{ RESENA : origina
  DIRECCION ||--o{ ORDEN : entrega

  SESION ||--o{ CONVERSACION : contiene
  CONVERSACION ||--o{ MENSAJE : contiene
  MENSAJE ||--o{ INTENCION : produce
  INTENCION ||--o{ ENTIDAD_EXTRAIDA : extrae
```

## Herramienta recomendada para graficos profesionales

Para documentacion tecnica rapida y mantenible, Mermaid es suficiente. Para diagramas mas profesionales y consistentes a nivel arquitectura recomiendo:

- Structurizr DSL: ideal para C4 Model, arquitectura empresarial y documentacion viva.
- D2: muy bueno para diagramas limpios, modernos y con mejor control visual que Mermaid.
- diagrams.net / draw.io: mejor si quieres una imagen estilo presentacion como la referencia.
- PlantUML: fuerte para UML clasico y secuencias, menos moderno visualmente.

Mi recomendacion para este backend: Mermaid para README/documentacion del repositorio, y Structurizr o D2 si necesitas laminas profesionales para informe o exposicion.
