---
# Sprint 0 — Plan de Implementación
# Marketplace Inteligente Asistido por IA

**Metodología:** Specification-Driven Development (SDD) — Desarrollo Incremental  
**Fase:** 3 — Implementación  
**Fecha de aprobación:** Sprint 0 completado  
**Versión del plan:** 2.0 (estrategia incremental)

---

## Principios del Plan

1. **Incrementos funcionales completos:** cada Sprint entrega Backend + Frontend operativos para las funcionalidades del Sprint.
2. **Prisma incremental:** cada Sprint crea únicamente las entidades Prisma que necesita. Nunca se crea un schema completo al inicio.
3. **Sin sprints de solo Frontend:** la interfaz de usuario evoluciona en paralelo con el backend.
4. **Trazabilidad:** cada Sprint referencia los RF, RNF y RN que implementa.
5. **Migraciones progresivas:** cada Sprint genera sus propias migraciones y mantiene compatibilidad con las anteriores.

---

## Resumen del Roadmap

| Sprint | Nombre | Entregable principal |
|--------|--------|----------------------|
| Sprint 1 | Fundación del Proyecto | Infraestructura base — sin funcionalidades de negocio |
| Sprint 2 | Autenticación | Registro, login, JWT, RBAC, UI de acceso |
| Sprint 3 | Usuarios | Perfiles, preferencias, direcciones, UI de cuenta |
| Sprint 4 | Productos | Catálogo, inventario, búsqueda, filtros, UI de catálogo |
| Sprint 5 | Marketplace | Carrito, checkout, pedidos, pagos, UI transaccional |
| Sprint 6 | Agente Inteligente | Pipeline NLU, STT/TTS, contexto conversacional, UI chat |
| Sprint 7 | Administración y complementos | Admin, favoritos, reseñas, promociones, auditoría |
| Sprint 8 | Calidad y Producción | Tests completos, optimización, despliegue a producción |

---


## Sprint 1 — Fundación del Proyecto

**Objetivo:** Establecer la infraestructura base del proyecto. Sin funcionalidades de negocio. Solo el esqueleto técnico que usarán todos los sprints posteriores.

**Alcance:** Configuración de herramientas, estructura de carpetas, conexión a la base de datos, servidor NestJS en funcionamiento, SPA React en funcionamiento, comunicación HTTP básica verificada.

**Dependencias previas:** Cuenta Neon PostgreSQL activa. Repositorio Git inicializado. Cuentas Render y Cloudflare Pages creadas.

### Backend

- Proyecto NestJS con TypeScript, estructura de carpetas por capas (L-01 a L-05 según `01-ArquitecturaGeneral.md`)
- Configuración de módulos base: AppModule, ConfigModule, DatabaseModule
- Conexión Prisma ↔ Neon PostgreSQL (SSL habilitado)
- Configuración de Swagger/OpenAPI (`/api/docs`)
- ESLint + Prettier configurados
- Logger estructurado (NestJS Logger)
- Health check endpoint (`/health`)
- Variables de entorno: `DATABASE_URL`, `NODE_ENV`, `PORT`

### Frontend

- Proyecto React 19 + TypeScript + Vite
- Tailwind CSS + Shadcn/ui instalados y verificados
- React Router DOM: rutas base (`/`, `/login`, `/register`)
- Zustand: store inicial vacío
- TanStack Query: QueryClient configurado
- Axios: instancia base con `baseURL` apuntando al backend
- Zod: schema de ejemplo validado
- Página de inicio placeholder con navegación funcional

### Entidades Prisma a crear

**Ninguna.** Solo configuración del cliente Prisma y conexión a la base de datos.

### Migraciones a generar

**Ninguna** en este sprint. El schema.prisma solo contiene el datasource y generator.

### API

- `GET /health` — Retorna estado del servidor
- `GET /api/docs` — Swagger UI disponible

### Pruebas

- Verificación manual: servidor NestJS responde en el puerto configurado
- Verificación manual: SPA React carga en el navegador sin errores
- Verificación manual: Swagger UI es accesible
- Verificación manual: conexión Prisma ↔ Neon establece sin errores

### Resultado esperado

Entorno de desarrollo completamente funcional. Backend y Frontend corren localmente. La conexión a la base de datos está verificada. No existe ninguna funcionalidad de negocio. El equipo puede comenzar el Sprint 2 sin bloqueos de configuración.


## Sprint 2 — Autenticación

**Objetivo:** El sistema permite el registro, verificación de correo, inicio de sesión, cierre de sesión y renovación de tokens. El control de acceso por roles (RBAC) está operativo. El usuario puede acceder a la UI de registro y login.

**Alcance:** Todo lo necesario para que un usuario se registre, verifique su cuenta, inicie sesión y obtenga un Access Token + Refresh Token. Roles: Comprador, Vendedor, Administrador.

**Requisitos implementados:** RF-12, RN-08, RN-09, RNF-07, RNF-08, RNF-09

**Dependencias previas:** Sprint 1 completado.

### Entidades Prisma a crear

- `Usuario` — id, nombre, email (único), passwordHash, estado (PENDIENTE/ACTIVO/SUSPENDIDO), rol (COMPRADOR/VENDEDOR/ADMINISTRADOR), fechaRegistro, fechaActualizacion, intentosFallidos, bloqueadoHasta
- `RefreshToken` — id, token (hash), usuarioId, expiresAt, revocado

### Migraciones a generar

- `migration_001_create_usuario`
- `migration_002_create_refresh_token`

### Backend

- Módulo Autenticación: registro con validación RN-09 (mín. 8 chars, mayúscula, minúscula, dígito)
- Hash de contraseña con Argon2 (RNF-07) — nunca en texto plano
- Envío de correo de verificación (adaptador de notificación simplificado)
- Login: validación de credenciales + emisión JWT Access Token (15min) + Refresh Token (7d)
- Bloqueo temporal 15 min tras 3 intentos fallidos consecutivos (RN-08)
- Logout: invalidación del Refresh Token
- Endpoint de renovación de Access Token via Refresh Token
- Guards NestJS: `JwtAuthGuard`, `RolesGuard`
- Decoradores: `@Roles(Role.COMPRADOR)`, `@Public()`
- RBAC: Administrador, Vendedor, Comprador

### Frontend

- Página de Registro: formulario con validación Zod (nombre, email, contraseña, confirmación)
- Página de Login: formulario con manejo de errores (INVALID_CREDENTIALS, ACCOUNT_LOCKED)
- Página de Verificación de email: confirmación de enlace
- Página de Recuperación de contraseña: solicitud de reset
- Zustand: `authStore` (usuario autenticado, Access Token, rol)
- Axios interceptor: adjunta Access Token en cada request; renueva automáticamente via Refresh Token si expira
- Rutas protegidas: redirect a `/login` si no autenticado
- Manejo de errores: mensajes claros para ACCOUNT_LOCKED (RN-08)

### API

- `POST /auth/register` — Registro de nuevo usuario
- `POST /auth/verify-email` — Verificación de correo
- `POST /auth/login` — Inicio de sesión → Access Token + Refresh Token
- `POST /auth/logout` — Cierre de sesión → invalida Refresh Token
- `POST /auth/refresh` — Renovación de Access Token
- `POST /auth/forgot-password` — Solicitud de recuperación
- `POST /auth/reset-password` — Reset de contraseña

### Pruebas

- Tests unitarios (Jest): Servicio de Autenticación — hash Argon2, validación contraseña RN-09, lógica de bloqueo RN-08
- Tests Supertest: flujo completo register → verify → login → refresh → logout
- Verificación manual: la UI de login funciona end-to-end

### Resultado esperado

Un usuario puede registrarse, verificar su correo, iniciar sesión y obtener tokens. El bloqueo por intentos fallidos funciona. Las rutas protegidas redirigen a `/login`. El Swagger documenta todos los endpoints de Auth.

---

## Sprint 3 — Usuarios

**Objetivo:** Los usuarios pueden gestionar su perfil, preferencias de notificación y direcciones de entrega. El Administrador puede ver y gestionar cuentas desde el panel.

**Alcance:** Perfil de usuario (Comprador y Vendedor), preferencias de notificación configurables (RN-12), gestión de direcciones para entregas, administración básica de cuentas.

**Requisitos implementados:** RF-11 (parcial — gestión de cuentas), RN-12, RNF-10 (no datos completos de tarjeta)

**Dependencias previas:** Sprint 2 completado. Entidades `Usuario` y `RefreshToken` ya existen.

### Entidades Prisma a crear

- `Direccion` — id, usuarioId, calle, ciudad, estado, codigoPostal, pais, referencia, activa
- `PreferenciasUsuario` — id, usuarioId, notifNuevaOrden, notifEstadoOrden, notifSeguridad, notifMarketing

### Migraciones a generar

- `migration_003_create_direccion`
- `migration_004_create_preferencias_usuario`

### Backend

- Módulo Usuarios: obtener perfil propio, actualizar perfil (nombre, teléfono)
- Gestión de direcciones: CRUD de Direccion vinculadas al Usuario
- Módulo Administración (base): listar usuarios, ver detalle, cambiar estado (ACTIVO/SUSPENDIDO)
- Módulo PreferenciasUsuario: obtener y actualizar preferencias de notificación (RN-12)
- Restricción: datos de tarjeta nunca se almacenan — solo referencia externa (RNF-10)

### Frontend

- Página de Perfil: nombre, email (solo lectura), cambio de contraseña
- Gestión de Direcciones: lista, agregar, editar, desactivar
- Preferencias de Notificación: toggles por tipo de evento (RN-12)
- Sección de Configuración de Cuenta: estado, rol
- Panel Administrador (base): tabla de usuarios con búsqueda, filtro por rol/estado, botón de suspender/reactivar

### API

- `GET /users/me` — Perfil del usuario autenticado
- `PATCH /users/me` — Actualizar perfil
- `GET /users/me/addresses` — Listar direcciones
- `POST /users/me/addresses` — Agregar dirección
- `PATCH /users/me/addresses/:id` — Editar dirección
- `DELETE /users/me/addresses/:id` — Desactivar dirección
- `GET /users/me/preferences` — Preferencias de notificación
- `PATCH /users/me/preferences` — Actualizar preferencias
- `GET /admin/users` — Listar usuarios (solo Administrador)
- `PATCH /admin/users/:id/status` — Cambiar estado de cuenta (solo Administrador)

### Pruebas

- Tests unitarios (Jest): lógica de preferencias de notificación (RN-12), validación de campos de dirección
- Tests Supertest: obtener perfil, actualizar perfil, CRUD de direcciones, cambio de preferencias, suspensión de usuario
- Verificación manual: el panel de Administrador lista y suspende usuarios correctamente

### Resultado esperado

Un usuario autenticado puede gestionar su perfil completo, direcciones y preferencias de notificación. El Administrador puede listar y gestionar el estado de cuentas. Las preferencias de notificación respetan RN-12. Swagger documenta todos los endpoints de usuarios y administración básica.

---

## Sprint 4 — Productos

**Objetivo:** Los Vendedores pueden crear y gestionar publicaciones con imágenes. El catálogo es explorable, buscable y filtrable. El Administrador puede gestionar categorías.

**Alcance:** CRUD de Publicaciones (RF-09), gestión de Categorías, Inventario, búsqueda con filtros y ordenamiento (RF-03, RF-04, RF-05), almacenamiento de imágenes en Cloudflare R2, UI completa de catálogo y panel del Vendedor.

**Requisitos implementados:** RF-03, RF-04, RF-05, RF-09, RN-03 (verificación stock), RN-05, RN-06, RNF-02, RNF-04, RNF-12

**Dependencias previas:** Sprint 3 completado.

### Entidades Prisma a crear

- `Categoria` — id, nombre, descripcion, parentId (autoreferencia, nullable), activa, createdAt
- `Publicacion` — id, nombre, descripcion, precio (Decimal, >0), estado (BORRADOR/ACTIVA/INACTIVA/ELIMINADA), vendedorId, categoriaId, createdAt, updatedAt
- `Inventario` — id, publicacionId (único), cantidad (Int ≥0), cantidadReservada, updatedAt
- `ImagenPublicacion` — id, publicacionId, url, orden, activa

### Migraciones a generar

- `migration_005_create_categoria`
- `migration_006_create_publicacion`
- `migration_007_create_inventario`
- `migration_008_create_imagen_publicacion`

### Backend

- Módulo Categorías: árbol jerárquico, CRUD por Administrador, listado público
- Módulo Productos: crear publicación (validar RN-05 campos obligatorios + RN-06 precio > 0), modificar, desactivar, reactivar, eliminar (solo Administrador)
- Módulo Inventario: mantener stock, verificar disponibilidad (RN-03), nunca stock negativo (RD-03)
- Adaptador `StorageProvider` en L-05: genera URLs pre-firmadas para upload directo a Cloudflare R2
- Módulo Búsquedas: búsqueda por nombre/descripción, filtros (precio min/max, categoría, disponibilidad, envío gratis), ordenamiento (precio asc/desc, relevancia, novedad)
- Índices Prisma en `publicacion.estado`, `publicacion.categoriaId`, `publicacion.precio` para cumplir RNF-02 (≤3s)
- Publicaciones visibles en catálogo ≤60s tras creación/modificación (RNF-04)
- Efecto cascada RN-10: suspender Vendedor → deshabilitar todas sus publicaciones activas

### Frontend

- Página de Catálogo: grid de publicaciones con paginación, TanStack Query para caché (RNF-02)
- Sidebar de Filtros: precio, categoría, disponibilidad, envío gratis — Zustand para estado de filtros activos
- Barra de Búsqueda: campo de texto con debounce → llama a `GET /products/search`
- Página de Detalle de Producto: galería de imágenes, descripción completa, precio, stock, botón "Agregar al carrito" (placeholder)
- Panel Vendedor — Mis Publicaciones: lista con estado (ACTIVA/INACTIVA/BORRADOR), acciones activar/desactivar
- Formulario de Publicación: todos los campos RN-05, validación Zod (precio > 0 para RN-06), upload de imágenes con URL pre-firmada R2
- Panel Administrador: sección de Categorías (crear, editar), sección de Publicaciones (eliminar por incumplimiento)

### API

- `GET /categories` — Árbol de categorías (público)
- `POST /categories` — Crear categoría (solo Administrador)
- `PATCH /categories/:id` — Editar categoría (solo Administrador)
- `GET /products` — Listar publicaciones activas con paginación (público)
- `GET /products/search` — Búsqueda con filtros y ordenamiento (público)
- `GET /products/:id` — Detalle de publicación (público)
- `POST /products` — Crear publicación (solo Vendedor autenticado)
- `PATCH /products/:id` — Actualizar publicación (solo propietario Vendedor)
- `PATCH /products/:id/status` — Activar/Desactivar (propietario o Administrador)
- `DELETE /products/:id` — Eliminar por incumplimiento (solo Administrador)
- `POST /products/:id/images/upload-url` — URL pre-firmada para upload a R2
- `GET /vendors/me/products` — Publicaciones del Vendedor autenticado

### Pruebas

- Tests unitarios (Jest): validaciones de dominio RN-05 y RN-06, lógica de stock (cantidad nunca negativa), efecto cascada RN-10
- Tests Supertest: crear publicación con campos válidos → 201; crear sin campos obligatorios → 422; búsqueda con filtros → resultados correctos; suspender Vendedor → publicaciones deshabilitadas
- Verificación manual: upload de imágenes a R2 funciona, catálogo muestra resultados en ≤3s

### Resultado esperado

El Catálogo funciona completamente: un Vendedor puede crear publicaciones con imágenes en R2; un Comprador (o visitante) puede buscar, filtrar y ordenar productos. La búsqueda cumple RNF-02. El efecto cascada RN-10 está verificado con tests. Swagger documenta todos los endpoints de Productos y Categorías.

---

---

## Sprint 5 — Marketplace

**Objetivo:** El flujo transaccional completo funciona end-to-end: un Comprador autenticado puede agregar productos al carrito, confirmar la compra, pagar y recibir la confirmación de su Orden. El Vendedor puede gestionar sus Órdenes recibidas.

**Alcance:** Módulo Carrito (RF-07), flujo de Checkout y Confirmación (RF-08 RN-01), Módulo Pagos (adaptador `PaymentGatewayProvider`), Módulo Pedidos (ciclo de vida completo, RN-04/07), historial de Órdenes, UI transaccional completa.

**Requisitos implementados:** RF-07, RF-08, RF-10, RN-01, RN-02, RN-03, RN-04, RN-07, RNF-03

**Dependencias previas:** Sprint 4 completado. Proveedor de pago externo configurado (credenciales en variables de entorno).

### Entidades Prisma a crear

- `Carrito` — id, compradorId (único), updatedAt
- `ItemCarrito` — id, carritoId, publicacionId, cantidad (Int >0), agregadoAt
- `Orden` — id, compradorId, direccionId, estado (PENDIENTE/CONFIRMADA/EN_PREPARACION/DESPACHADA/ENTREGADA/CANCELADA/ESCALADA), total (Decimal), numeroConfirmacion (único), createdAt, updatedAt
- `LineaOrden` — id, ordenId, publicacionId, nombreProducto (snapshot), precioUnitario (Decimal, snapshot), cantidad (Int), subtotal (Decimal)
- `Pago` — id, ordenId (único), referenciaPasarela, monto (Decimal), estado (PENDIENTE/APROBADO/RECHAZADO), metodoPago, createdAt

### Migraciones a generar

- `migration_009_create_carrito`
- `migration_010_create_item_carrito`
- `migration_011_create_orden`
- `migration_012_create_linea_orden`
- `migration_013_create_pago`

### Backend

- Módulo Carrito: agregar ítem (verifica RN-02 auth + stock RN-03), modificar cantidad, eliminar ítem, ver carrito con total; vaciar al confirmar Orden
- Módulo Pagos: adaptador `PaymentGatewayProvider` en L-05 — envía solicitud de cobro con clave de idempotencia; retorna PagoConfirmado o PagoRechazado; datos de tarjeta nunca llegan a L-03/L-04 (RNF-10)
- Módulo Pedidos: registrar Orden con número único al confirmar pago (RN-01 confirmación explícita); decremento atómico de stock en misma transacción Prisma (RN-04); ciclo de vida de estado; escalamiento automático a las 24h en PENDIENTE sin atención (RN-07)
- Módulo Ordenes Vendedor: listar Órdenes recibidas, actualizar estado, filtrar por estado
- Notificaciones básicas: enviar aviso a Comprador y Vendedor al registrar Orden (sin módulo de notificaciones completo — adaptador simplificado)
- Restricción RD-05: LineaOrden es inmutable una vez creada; precio guardado como snapshot

### Frontend

- Componente Carrito: drawer/modal con lista de ítems, cantidades editables, total, botón "Ir al Checkout"
- Zustand `cartStore`: estado del carrito sincronizado con el backend via TanStack Query
- Página de Checkout: resumen de Orden (productos, precios, total, dirección de entrega), selección de método de pago referenciado
- Modal de Confirmación explícita (RN-01): "¿Confirmar compra por $X?" con botones Confirmar/Cancelar
- Página de Confirmación de Orden: número de Orden, resumen, estado actual
- Página de Historial de Órdenes: lista paginada con estado, fecha, total, enlace a detalle
- Página de Detalle de Orden: líneas, estado actual, historial de cambios de estado
- Panel Vendedor — Órdenes: lista de Órdenes recibidas, botones de cambio de estado, badge de escalamiento

### API

- `GET /cart` — Ver carrito del Comprador autenticado
- `POST /cart/items` — Agregar ítem al carrito
- `PATCH /cart/items/:itemId` — Modificar cantidad de ítem
- `DELETE /cart/items/:itemId` — Eliminar ítem del carrito
- `DELETE /cart` — Vaciar carrito
- `POST /orders` — Crear Orden desde Carrito (RN-01: requiere confirmación explícita)
- `GET /orders` — Historial de Órdenes del Comprador
- `GET /orders/:id` — Detalle de Orden
- `GET /vendors/me/orders` — Órdenes recibidas del Vendedor
- `PATCH /vendors/me/orders/:id/status` — Actualizar estado de Orden (Vendedor)
- `POST /payments/process` — Iniciar pago (coordinado con adaptador Pasarela)
- `GET /payments/:ordenId` — Estado del pago de una Orden

### Pruebas

- Tests unitarios (Jest): lógica de dominio Orden (inmutabilidad LineaOrden RD-05/06), atomicidad Carrito+Stock (RN-04), escalamiento 24h (RN-07), precio snapshot
- Tests Supertest: agregar al carrito sin auth → 401; agregar producto sin stock → 409; flujo completo add-to-cart → checkout → confirm → order-created → stock-decremented; Vendedor actualiza estado → 200
- Verificación manual: la confirmación explícita (RN-01) bloquea el pago hasta que el usuario confirma; el carrito se vacía tras la compra

### Resultado esperado

Flujo transaccional completo funcionando: agregar al carrito → checkout → confirmación explícita (RN-01) → pago via adaptador → Orden registrada → stock decrementado atómicamente (RN-04) → notificación básica enviada. El Vendedor puede gestionar sus Órdenes. El proceso desde confirmación de pago hasta Orden registrada cumple RNF-03 (≤5s). Swagger documenta todos los endpoints de Carrito, Pedidos y Pagos.

---

## Sprint 6 — Agente Inteligente

**Objetivo:** El Agente Inteligente funciona end-to-end: interpreta instrucciones en texto y voz, mantiene el contexto de sesión y ejecuta acciones dentro del Marketplace. La UI de chat conversacional está operativa.

**Alcance:** Pipeline completo del Agente (CA-01 a CA-05), adaptadores `LanguageModelProvider`, `SpeechToTextProvider`, `TextToSpeechProvider` en L-05, módulo Conversaciones, expiración de contexto RN-14, máquina de estados, confirmaciones RN-01, UI de chat texto y voz.

**Requisitos implementados:** RF-01, RF-02, RF-03 (vía Agente), RF-04, RF-05, RF-06, RF-07 (vía Agente), RF-08 (vía Agente), RN-01, RN-11, RN-13, RN-14, RNF-01, RNF-06, RNF-13, RNF-14

**Dependencias previas:** Sprint 5 completado. Credenciales de proveedor NLP, STT y TTS en variables de entorno.

### Entidades Prisma a crear

- `Sesion` — id, usuarioId, estado (ACTIVA/EXPIRADA), ultimaActividad, createdAt
- `Conversacion` — id, sesionId (único), estado (ACTIVA/EXPIRADA), creadaAt, expiradaAt
- `Mensaje` — id, conversacionId, rol (USUARIO/AGENTE), contenido, ordenEnConversacion, creadoAt
- `Intencion` — id, mensajeId (único), tipo (BUSCAR/FILTRAR/ORDENAR/COMPARAR/AGREGAR_CARRITO/COMPRAR/VER_CARRITO), confianza (Decimal 0-1)
- `EntidadExtraida` — id, mensajeId, tipo (PRODUCTO/MARCA/CATEGORIA/PRECIO/ENVIO/CALIFICACION), valor, confianza

### Migraciones a generar

- `migration_014_create_sesion`
- `migration_015_create_conversacion`
- `migration_016_create_mensaje`
- `migration_017_create_intencion`
- `migration_018_create_entidad_extraida`

### Backend

- Módulo Agente (AgentModule, L-02): pipeline CA-01 → CA-05 completo según `04-DisenoAgenteIA.md`
- CA-01 Entrada texto: recibe instrucción, valida EMPTY_INPUT e INPUT_TOO_LONG
- CA-01 Entrada voz: recibe audio → invoca adaptador `SpeechToTextProvider` → verifica umbral de confianza (RN-11); si bajo umbral → retorna LOW_CONFIDENCE sin procesar
- CA-02 Comprensión: invoca `LanguageModelProvider` con texto + contexto de sesión → retorna intención + entidades + restricciones + confianza
- CA-03 Contexto: crea/actualiza Sesion y Conversacion; almacena Mensajes e Intenciones; resuelve referencias posicionales ("la primera", "esas"); limpieza automática a 30 min de inactividad (RN-14)
- CA-04 Ejecución: orquesta según intención — BUSCAR/FILTRAR/ORDENAR → módulo Búsquedas; COMPARAR → Búsquedas (2-5 productos, RN-13); AGREGAR_CARRITO → módulo Carrito (verifica RN-02); COMPRAR → módulo Pedidos (confirmación explícita RN-01); VER_CARRITO → módulo Carrito
- CA-05 Respuesta: formatea en lenguaje natural con explicabilidad (RNF-13); si modo voz activo → `TextToSpeechProvider`; si TTS no disponible → solo texto (RNF-06)
- Degradación completa (RNF-06): NLP caído → modo manual; STT caído → solo texto; TTS caído → texto sin audio
- Restricción RA-09: ningún nombre de proveedor IA en L-02/L-03/L-04 — solo interfaces en L-05

### Frontend

- Componente ChatAgente: panel lateral con historial de mensajes (burbujas Usuario y Agente)
- Botón Micrófono: activa captura de audio → envía al backend → muestra respuesta texto y reproduce audio
- Indicador de escucha activa: icono animado mientras captura voz (RNF-14)
- Indicador de procesamiento: spinner mientras el Agente interpreta (RNF-14)
- Modal de Confirmación de Compra: ResumenOrden completo con productos, precios, total → botones Confirmar/Cancelar (RN-01)
- Manejo de errores en chat: LOW_CONFIDENCE → "No entendí tu instrucción de voz, inténtala de nuevo o escríbela"; SESSION_EXPIRED → "Tu sesión expiró, inicia una nueva búsqueda"; AGENT_UNAVAILABLE → "El asistente no está disponible, puedes navegar manualmente"
- Zustand `agentStore`: estado del Agente (INACTIVO/PROCESANDO/CONFIRMANDO/ERROR), conjunto de resultados activo, filtros activos de la sesión
- El componente ChatAgente está disponible en las páginas de Catálogo, Detalle de Producto y Carrito

### API

- `POST /agent/text` — Enviar instrucción en texto al Agente
- `POST /agent/voice` — Enviar audio al Agente (STT + procesamiento)
- `POST /agent/confirm` — Confirmar acción irreversible pendiente (RN-01)
- `POST /agent/cancel` — Cancelar acción pendiente en estado CONFIRMANDO
- `GET /agent/session` — Estado de la sesión activa del Agente
- `GET /conversations/active` — Historial de la conversación activa
- `GET /conversations/:id/messages` — Mensajes de una conversación

### Pruebas

- Tests unitarios (Jest): expiración de sesión (RN-14), umbral STT (RN-11), límite comparación 2-5 (RN-13), confirmación antes de pago (RN-01), 9 escenarios límite de `04-DisenoAgenteIA.md` sec.26
- Tests Supertest: instrucción texto → intención identificada → acción ejecutada; instrucción sin auth para carrito → 401; flujo compra vía Agente → confirmación → Orden registrada; STT bajo umbral → LOW_CONFIDENCE
- Tests de adaptadores con mocks: `LanguageModelProvider` mock, `SpeechToTextProvider` mock (alta y baja confianza), `TextToSpeechProvider` mock

### Resultado esperado

El Agente Inteligente funciona completamente: interpreta instrucciones de texto y voz, ejecuta búsquedas, filtros, gestión del carrito y compras. El contexto de sesión persiste y expira correctamente (RN-14). Los tres adaptadores de IA son intercambiables sin cambios en L-02/L-03/L-04 (ADR-013). Respuesta del Agente ≤2s en P95 (RNF-01). El modo texto continúa operativo ante cualquier fallo de STT o TTS.

---

## Sprint 7 — Administración y Funcionalidades Complementarias

**Objetivo:** El panel de Administrador tiene control completo. Los Compradores pueden gestionar favoritos y escribir reseñas. El sistema de notificaciones es completo. Módulo de Auditoría activo. Promociones y cupones disponibles.

**Alcance:** Administración completa (RF-11), Favoritos, Reseñas (con verificación de compra), Módulo Notificaciones con adaptador externo, Módulo Auditoría (RNF-17), Promociones y Cupones.

**Requisitos implementados:** RF-11 (completo), RN-10 (cascada), RN-12 (notificaciones), RNF-17 (auditoría), RN-07 (escalamiento en Admin panel)

**Dependencias previas:** Sprint 6 completado.

### Entidades Prisma a crear

- `Favorito` — id, compradorId, publicacionId, creadoAt (unique constraint compradorId+publicacionId)
- `Resena` — id, ordenId, compradorId, publicacionId, calificacion (Int 1-5), comentario, creadoAt
- `Promocion` — id, publicacionId, porcentajeDescuento (Decimal), activa, inicio, fin
- `Cupon` — id, codigo (único), descuento (Decimal), tipo (PORCENTAJE/MONTO_FIJO), vigenciaHasta, usos, usosMaximos
- `Notificacion` — id, usuarioId, tipo, contenido, canal, estado (PENDIENTE/ENVIADA/FALLIDA), createdAt, enviadaAt
- `Auditoria` — id, usuarioId (nullable), accion, modulo, resultado, ipCliente, timestamp

### Migraciones a generar

- `migration_019_create_favorito`
- `migration_020_create_resena`
- `migration_021_create_promocion`
- `migration_022_create_cupon`
- `migration_023_create_notificacion`
- `migration_024_create_auditoria`

### Backend

- Módulo Administración (completo): suspender/reactivar usuarios (efecto cascada RN-10 publicaciones), eliminar publicaciones, resolver Órdenes escaladas (RN-07), reportes agregados (ventas, usuarios activos, publicaciones, órdenes)
- Módulo Favoritos: agregar/eliminar favorito, listar favoritos del Comprador con estado actualizado de publicación
- Módulo Reseñas: registrar reseña (verifica que el Comprador compró el producto — consulta Ordenes), calificación promedio por publicación
- Módulo Notificaciones (completo): adaptador `NotificationProvider` en L-05, verificación de PreferenciasUsuario (RN-12), cola de reintento ante fallos, notificaciones de seguridad siempre enviadas
- Módulo Auditoría: interceptors NestJS que registran automáticamente autenticaciones, modificaciones de datos críticos, transacciones económicas; registros inmutables (RNF-17); sin contraseñas ni datos de pago
- Módulo Promociones: precio efectivo = precio base - descuento; precio efectivo nunca ≤0 (RN-06 aplicado)
- Módulo Cupones: validar código, vigencia, usos disponibles; aplicar descuento al total del Carrito

### Frontend

- Panel Administrador (completo): gestión de usuarios, publicaciones, resolución de escalamientos, reportes con tablas y métricas
- Lista de Favoritos: página del Comprador con sus publicaciones guardadas, con estado actualizado
- Sección de Reseñas: en página de Detalle de Producto — lista de reseñas, calificación promedio, botón "Escribir reseña" (solo si compró)
- Formulario de Reseña: calificación por estrellas (1-5) + texto opcional
- Campo de Cupón: input en página de Checkout para aplicar código de descuento
- Indicadores de Promoción: badge de precio con descuento en tarjetas de catálogo y detalle de producto
- Centro de Notificaciones: icono con badge en el header, dropdown con lista de notificaciones recientes

### API

- `GET /admin/reports` — Reportes agregados del Marketplace (solo Administrador)
- `DELETE /admin/products/:id` — Eliminar publicación por incumplimiento (solo Administrador)
- `PATCH /admin/orders/:id/resolve` — Resolver Orden escalada (solo Administrador)
- `GET /favorites` — Lista de favoritos del Comprador
- `POST /favorites` — Agregar favorito
- `DELETE /favorites/:publicacionId` — Eliminar favorito
- `GET /products/:id/reviews` — Reseñas de una publicación
- `POST /products/:id/reviews` — Crear reseña (requiere compra verificada)
- `POST /coupons/validate` — Validar código de cupón
- `POST /cart/coupon` — Aplicar cupón al carrito
- `GET /notifications` — Notificaciones del usuario autenticado
- `PATCH /notifications/:id/read` — Marcar como leída

### Pruebas

- Tests unitarios (Jest): lógica de Auditoría (inmutabilidad), validación de Reseña (compra verificada), efecto cascada RN-10 (publicaciones al suspender Vendedor), precio efectivo con Promoción nunca ≤0
- Tests Supertest: reportes del Admin → 200 con datos; reseña sin compra verificada → 403; cupón expirado → 422; notificación respeta preferencias RN-12
- Verificación manual: el panel Admin muestra escalamientos y permite resolverlos

### Resultado esperado

El sistema está completo funcionalmente. El Administrador tiene control total. Favoritos, reseñas, promociones y cupones operativos. El módulo de Auditoría registra automáticamente todos los eventos críticos según RNF-17. Las notificaciones respetan las preferencias de cada usuario (RN-12).

---

## Sprint 8 — Calidad y Producción

**Objetivo:** El sistema completo está probado de forma integral, documentado y desplegado en producción. Todos los KPIs de la especificación son medibles.

**Alcance:** Suite de tests completa (Jest + Supertest + Playwright), prueba de carga básica (RNF-11), resolución de observaciones pendientes (RD-08, PA-02), optimización de rendimiento, despliegue a producción en Cloudflare Pages + Render + Neon, validación final contra `/specs` y `/design`.

**Requisitos implementados:** Verificación de todos los RF, RNF, RN documentados en `/specs`

**Dependencias previas:** Sprint 7 completado. Entornos de producción configurados.

### Entidades Prisma a crear

**Ninguna nueva.** Solo ajustes de índices o restricciones identificados durante pruebas de carga.

### Migraciones a generar

Solo las necesarias para ajustes de rendimiento identificados en testing de carga (límite de ítems en Carrito para RD-08 si aún no resuelto).

### Backend / Frontend

- Resolución de observación RD-08: definir e implementar límite máximo de ítems en el Carrito (el equipo decide el valor; sugerido: 50 ítems)
- Resolución de PA-02: implementar lista negra de tokens JWT para logout inmediato (usando tabla en Neon o caché en memoria según decisión del equipo)
- Optimización de queries Prisma con explain analyze en búsquedas críticas
- Validación WCAG 2.1 AA con herramienta automática de accesibilidad (RNF-15)
- Corrección de errores detectados durante las suites de pruebas

### Pruebas

- Suite Jest completa: cobertura de todos los servicios de dominio (L-04) de los 8 sprints
- Suite Supertest: verificación de todos los contratos definidos en `06-DisenoAPI.md`
- Suite Playwright E2E: flujos críticos — registro completo, búsqueda por texto, búsqueda por voz, compra completa, gestión de publicación, flujo completo del Agente (texto a Orden confirmada)
- Prueba de carga básica: simular 500 usuarios concurrentes → verificar RNF-01 (≤2s Agente) y RNF-02 (≤3s búsqueda)
- Validación final Specification: confirmar que cada RF de `/specs` tiene test que lo valida
- Validación final Design: confirmar que las decisiones ADR-001 a ADR-016 están implementadas

### Despliegue a Producción

- **Frontend:** build Vite → deploy a Cloudflare Pages con variables de entorno de producción
- **Backend:** `prisma migrate deploy` → deploy a Render con variables de entorno seguras (JWT_SECRET, DATABASE_URL, credenciales de proveedores)
- **Base de datos:** Neon PostgreSQL producción (rama main) con SSL habilitado
- **Almacenamiento:** Cloudflare R2 bucket de producción configurado
- Health check verificado en Render post-deploy
- Swagger UI disponible en producción en `/api/docs`

### Resultado esperado

El sistema está en producción y funciona correctamente en todos los flujos documentados. Los KPI-01 a KPI-05 de `/specs/05-Objetivos.md` son medibles. La cobertura de tests valida todos los RF y RNF de la especificación. El diseño de `/design` está completamente implementado. El proyecto está listo para operar.

---

## Evolución del Schema Prisma por Sprint

| Sprint | Entidades creadas | Migraciones |
|--------|-------------------|-------------|
| Sprint 1 | Ninguna — solo configuración | Ninguna |
| Sprint 2 | Usuario, RefreshToken | migration_001, migration_002 |
| Sprint 3 | Direccion, PreferenciasUsuario | migration_003, migration_004 |
| Sprint 4 | Categoria, Publicacion, Inventario, ImagenPublicacion | migration_005 a 008 |
| Sprint 5 | Carrito, ItemCarrito, Orden, LineaOrden, Pago | migration_009 a 013 |
| Sprint 6 | Sesion, Conversacion, Mensaje, Intencion, EntidadExtraida | migration_014 a 018 |
| Sprint 7 | Favorito, Resena, Promocion, Cupon, Notificacion, Auditoria | migration_019 a 024 |
| Sprint 8 | Ajustes de índices y restricciones según testing | Opcionales |
| **Total** | **20 entidades** | **24 migraciones base** |

**Principio verificado:** Ningún sprint crea entidades que no usará. El schema crece únicamente cuando el sprint lo necesita.

---

## Aprobación Final

**Estado del plan:** ✅ APROBADO PARA INICIAR IMPLEMENTACIÓN

El proyecto cumple todas las condiciones para iniciar la Fase 3:
- Specification completa y validada (/specs) ✅
- Design completo y validado (/design) ✅
- Stack tecnológico definido y consistente ✅
- Plan incremental con Backend + Frontend por Sprint ✅
- Prisma evoluciona progresivamente ✅
- Trazabilidad completa Spec → Design → Plan ✅

**Inicio autorizado:** Sprint 1 — Fundación del Proyecto
