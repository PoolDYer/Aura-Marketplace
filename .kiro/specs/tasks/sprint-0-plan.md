---
# Sprint 0 — Plan de Implementación
# Marketplace Inteligente Asistido por IA — Aura Marketplace

**Metodología:** Specification-Driven Development (SDD) — Desarrollo Incremental (ADR-001)
**Fase:** 3 — Implementación
**Fecha de aprobación:** Sprint 0 completado
**Versión del plan:** 3.0 (integración completa con /specs, /design, /tasks y estado actual del código)

---

## Principios del Plan

1. **Incrementos funcionales completos:** cada Sprint entrega Backend + Frontend operativos para las funcionalidades del Sprint.
2. **Prisma incremental:** cada Sprint crea únicamente las entidades Prisma que necesita. Nunca se crea un schema completo al inicio.
3. **Sin sprints de solo Frontend:** la interfaz de usuario evoluciona en paralelo con el backend.
4. **Trazabilidad completa:** cada Sprint referencia los RF, RNF, RN, HU, KPI, ADR y CA que implementa.
5. **Migraciones progresivas:** cada Sprint genera sus propias migraciones y mantiene compatibilidad con las anteriores.
6. **Separación Spec → Design → Impl:** los documentos de /specs definen el QUÉ, /design define el CÓMO, este plan define el CUÁNDO (ADR-001).
7. **Arquitectura Limpia:** 5 capas (L-01 Presentación, L-02 Agente, L-03 Aplicación, L-04 Dominio, L-05 Infraestructura) con dirección de dependencia estricta (ADR-002).

---

## Stack Tecnológico (según /design/12-ArquitecturaTecnologica.md)

| Componente | Tecnología |
|-----------|------------|
| **Backend** | NestJS + TypeScript |
| **Frontend** | React 19 + TypeScript + Vite |
| **Base de datos** | PostgreSQL (Neon) via Prisma ORM |
| **Estilos** | Tailwind CSS + Shadcn/ui |
| **Estado global** | Zustand |
| **Data fetching** | TanStack Query + Axios |
| **Validación** | Zod |
| **Routing** | React Router DOM |
| **Auth** | JWT (Access Token 15min + Refresh Token 7d) + Argon2 |
| **NLP/STT** | Gemini AI (adaptador en L-05 — ADR-013) |
| **TTS** | API Web Speech del navegador (window.speechSynthesis) — RF-02 |
| **Pasarela de pago** | Mercado Pago (adaptador en L-05 — ADR-008) |
| **Notificaciones** | Resend (email transaccional — RF-15) |
| **Almacenamiento** | Cloudflare R2 (imágenes de publicaciones) |
| **Deploy Frontend** | Cloudflare Pages |
| **Deploy Backend** | Render |
| **Tests** | Jest + Supertest + Playwright |

---

## Integraciones Externas (según /design/09-Integraciones.md y /design/13-ValidacionDiseno.md)

| Integración | Proveedor | Degradación (RNF-06) | Seguridad |
|-------------|-----------|----------------------|-----------|
| Proveedor NLP | Gemini AI | Navegación manual | Canal cifrado |
| Servicio STT | Gemini AI | Modo solo texto | Audio cifrado, no retenido |
| API TTS | Web Speech API (cliente) | Respuesta solo texto | Cifrado en tránsito local |
| Pasarela de Pago | Mercado Pago | Carrito preservado | Idempotencia, sin datos de tarjeta (RNF-10) |
| Servicio Notificaciones | Resend | Cola de reintento | Sin datos sensibles |

---

## Resumen del Roadmap

| Sprint | Nombre | Entregable principal | HU principales |
|--------|--------|----------------------|----------------|
| Sprint 1 | Fundación del Proyecto | Infraestructura base — sin funcionalidades de negocio | — |
| Sprint 2 | Autenticación | Registro, login, JWT, RBAC, UI de acceso | HU-15, HU-16 |
| Sprint 3 | Usuarios | Perfiles, preferencias, direcciones, UI de cuenta | HU-17 |
| Sprint 4 | Productos | Catálogo, inventario, búsqueda, filtros, UI de catálogo | HU-03, HU-05, HU-11, HU-12, HU-25 |
| Sprint 5 | Marketplace | Carrito, checkout, pedidos, pagos, UI transaccional | HU-06, HU-07, HU-08, HU-09, HU-10, HU-13, HU-14 |
| Sprint 6 | Agente Inteligente | Pipeline NLU, STT/TTS, contexto conversacional, UI chat | HU-01, HU-02, HU-04 |
| Sprint 7 | Administración y complementos | Admin, favoritos, reseñas, promociones, auditoría | HU-18, HU-19, HU-20, HU-21, HU-22, HU-23, HU-24 |
| Sprint 8 | Calidad y Producción | Tests completos, optimización, despliegue a producción | Verificación completa |

---

## Trazabilidad Consolidada: Sprints → Requisitos → Historias de Usuario

### Matriz de trazabilidad RF → Sprint

| RF | Nombre | Sprint |
|----|--------|--------|
| RF-01 | Interpretación de instrucciones en texto | Sprint 6 |
| RF-02 | Interpretación de instrucciones por voz | Sprint 6 |
| RF-03 | Búsqueda de productos | Sprint 4 (manual) + Sprint 6 (via Agente) |
| RF-04 | Filtrado de resultados | Sprint 4 (manual) + Sprint 6 (via Agente) |
| RF-05 | Ordenamiento de resultados | Sprint 4 (manual) + Sprint 6 (via Agente) |
| RF-06 | Comparación de productos | Sprint 6 |
| RF-07 | Gestión del Carrito | Sprint 5 (manual) + Sprint 6 (via Agente) |
| RF-08 | Ejecución de compra | Sprint 5 (manual) + Sprint 6 (via Agente) |
| RF-09 | Creación de Publicación | Sprint 4 |
| RF-10 | Gestión de Órdenes por el Vendedor | Sprint 5 |
| RF-11 | Administración de usuarios y publicaciones | Sprint 3 (base) + Sprint 7 (completo) |
| RF-12 | Registro y autenticación de usuarios | Sprint 2 |
| RF-13 | Gestión de Sesión del Agente | Sprint 6 |
| RF-14 | Accesibilidad e Inclusión | Sprint 1 (base) + Sprint 8 (validación WCAG 2.1 AA) |
| RF-15 | Notificaciones al Usuario | Sprint 5 (base) + Sprint 7 (completo con Resend) |

### Matriz de trazabilidad RN → Sprint

| RN | Nombre | Sprint |
|----|--------|--------|
| RN-01 | Confirmación antes de acciones irreversibles | Sprint 5 + Sprint 6 |
| RN-02 | Autenticación obligatoria para transacciones | Sprint 5 + Sprint 6 |
| RN-03 | Verificación de stock antes del pago | Sprint 4 + Sprint 5 |
| RN-04 | Decremento atómico de stock al registrar Orden | Sprint 5 |
| RN-05 | Campos obligatorios para Publicación | Sprint 4 |
| RN-06 | Precio > 0 en Publicaciones | Sprint 4 + Sprint 7 (con Promociones) |
| RN-07 | Escalamiento Orden 24h sin atención | Sprint 5 + Sprint 7 (Admin panel) |
| RN-08 | Bloqueo temporal 3 intentos fallidos | Sprint 2 |
| RN-09 | Política de contraseña segura | Sprint 2 |
| RN-10 | Suspensión cascada publicaciones al suspender Vendedor | Sprint 4 (lógica) + Sprint 7 (admin UI) |
| RN-11 | Umbral de confianza STT | Sprint 6 |
| RN-12 | Preferencias de notificación | Sprint 3 (preferencias) + Sprint 7 (notificaciones) |
| RN-13 | Comparación máxima 2-5 productos | Sprint 6 |
| RN-14 | Expiración contexto sesión 30 min | Sprint 6 |

### Matriz de trazabilidad RNF → Sprint

| RNF | Nombre | Sprint |
|-----|--------|--------|
| RNF-01 | Respuesta Agente ≤ 2s P95 | Sprint 6 + Sprint 8 (validación) |
| RNF-02 | Búsqueda ≤ 3s P95 | Sprint 4 + Sprint 8 (validación) |
| RNF-03 | Registro Orden ≤ 5s | Sprint 5 + Sprint 8 (validación) |
| RNF-04 | Cambios en Catálogo visibles ≤ 60s | Sprint 4 |
| RNF-05 | Disponibilidad 99.5% mensual | Sprint 8 (infraestructura producción) |
| RNF-06 | Degradación controlada ante fallos externos | Sprint 6 |
| RNF-07 | Contraseñas hash Argon2 | Sprint 2 |
| RNF-08 | Tráfico cifrado (HTTPS/SSL) | Sprint 1 (SSL Neon) + Sprint 8 (producción) |
| RNF-09 | Tokens Access 15min + Refresh 7d + revocación | Sprint 2 + Sprint 8 (TokenRevocado PA-02) |
| RNF-10 | No almacenar datos de tarjeta | Sprint 5 |
| RNF-11 | Soporte 2000 usuarios concurrentes | Sprint 8 (prueba de carga) |
| RNF-12 | Catálogo 1M publicaciones sin degradación | Sprint 4 (índices) + Sprint 8 (prueba) |
| RNF-13 | Respuestas claras del Agente (explicabilidad) | Sprint 6 |
| RNF-14 | Indicadores visuales durante procesamiento | Sprint 6 |
| RNF-15 | WCAG 2.1 nivel AA | Sprint 8 (validación completa) |
| RNF-16 | Compatibilidad lectores de pantalla | Sprint 1 (semántica base) + Sprint 8 (validación) |
| RNF-17 | Registro de eventos / Auditoría | Sprint 7 |

### Matriz de trazabilidad HU → Sprint

| HU | Historia de Usuario | Sprint |
|----|-------|--------|
| HU-01 | Interactuar con Agente por texto/voz | Sprint 6 |
| HU-02 | Interpretar instrucciones y mantener contexto | Sprint 6 |
| HU-03 | Explorar catálogo, filtros y ordenamientos | Sprint 4 + Sprint 6 |
| HU-04 | Comparar productos | Sprint 6 |
| HU-05 | Ver detalle de publicación | Sprint 4 |
| HU-06 | Gestionar carrito | Sprint 5 |
| HU-07 | Checkout y confirmar orden | Sprint 5 |
| HU-08 | Pago, cupones y completar transacción | Sprint 5 + Sprint 7 (cupones) |
| HU-09 | Procesar pagos y estados de orden | Sprint 5 |
| HU-10 | Consultar número de orden e historial | Sprint 5 |
| HU-11 | Publicar productos con imágenes | Sprint 4 |
| HU-12 | Editar, pausar, reactivar publicaciones | Sprint 4 |
| HU-13 | Consultar y actualizar órdenes (Vendedor) | Sprint 5 |
| HU-14 | Consultar clientes vinculados a ventas | Sprint 5 |
| HU-15 | Registrarse y verificar correo | Sprint 2 |
| HU-16 | Login, logout, recuperar contraseña | Sprint 2 |
| HU-17 | Gestionar datos, direcciones y preferencias | Sprint 3 |
| HU-18 | Guardar y consultar favoritos | Sprint 7 |
| HU-19 | Consultar y registrar reseñas | Sprint 7 |
| HU-20 | Notificaciones | Sprint 7 |
| HU-21 | Administrar usuarios (suspender, reactivar) | Sprint 3 (base) + Sprint 7 (completo) |
| HU-22 | Moderar publicaciones | Sprint 4 + Sprint 7 |
| HU-23 | Gestionar órdenes escaladas | Sprint 7 |
| HU-24 | Reportes y estadísticas | Sprint 7 |
| HU-25 | Gestionar categorías | Sprint 4 |

---

## KPIs a Verificar (según /specs/05-Objetivos.md)

| ID | Indicador | Valor Objetivo | Sprint de validación |
|----|-----------|---------------|---------------------|
| KPI-01 | Tasa de reconocimiento de intención | ≥ 85% | Sprint 6 + Sprint 8 |
| KPI-02 | Tiempo de respuesta del Agente (texto) | ≤ 2s (P95) | Sprint 6 + Sprint 8 |
| KPI-03 | Tiempo de retorno de búsqueda | ≤ 3s (P95) | Sprint 4 + Sprint 8 |
| KPI-04 | Tiempo de registro de Orden | ≤ 5s desde confirmación pago | Sprint 5 + Sprint 8 |
| KPI-05 | Pasos Comprador → Orden completada | ≤ 3 instrucciones al Agente | Sprint 6 + Sprint 8 |
| KPI-06 | Cumplimiento WCAG 2.1 AA | Sin errores nivel AA | Sprint 8 |
| KPI-07 | Tiempo notificación Orden a Vendedor | ≤ 60s | Sprint 5 + Sprint 7 |
| KPI-08 | Actualización Publicación en Catálogo | ≤ 60s | Sprint 4 |

---

## ADRs a Implementar por Sprint

| ADR | Decisión | Sprint |
|-----|----------|--------|
| ADR-001 | Separación Spec → Design → Impl | Sprint 0 (metodología) |
| ADR-002 | Separación Presentación / Lógica (5 capas) | Sprint 1 (estructura) |
| ADR-003 | Organización modular por dominios | Sprint 1 (estructura) |
| ADR-004 | Capa dedicada para el Agente (L-02) | Sprint 6 |
| ADR-005 | Modelo de dominio con agregados | Sprint 2-5 (progresivo) |
| ADR-006 | Confirmación explícita acciones irreversibles | Sprint 5 + Sprint 6 |
| ADR-007 | Defensa en profundidad (seguridad multicapa) | Sprint 2 + Sprint 8 |
| ADR-008 | Integraciones externas tras adaptadores L-05 | Sprint 2-7 (progresivo) |
| ADR-009 | PostgreSQL como almacén principal | Sprint 1 |
| ADR-010 | Evolución incremental del schema Prisma | Sprint 1-7 (continuo) |
| ADR-011 | APIs REST documentadas con Swagger | Sprint 1-7 |
| ADR-012 | React SPA como presentación | Sprint 1 |
| ADR-013 | Adaptadores IA intercambiables sin cambios L-02/L-03/L-04 | Sprint 6 |

---

## Sprint 1 — Fundación del Proyecto

**Objetivo:** Establecer la infraestructura base del proyecto. Sin funcionalidades de negocio. Solo el esqueleto técnico que usarán todos los sprints posteriores.

**Alcance:** Configuración de herramientas, estructura de carpetas (5 capas L-01 a L-05), conexión a la base de datos, servidor NestJS en funcionamiento, SPA React en funcionamiento, comunicación HTTP básica verificada.

**Dependencias previas:** Cuenta Neon PostgreSQL activa. Repositorio Git inicializado. Cuentas Render y Cloudflare Pages creadas.

**Requisitos implementados:** RF-14 (base semántica HTML), RNF-08 (SSL Neon), RNF-16 (estructura accesible base)

**ADRs implementados:** ADR-001 (metodología), ADR-002 (5 capas), ADR-003 (modularidad), ADR-009 (PostgreSQL), ADR-010 (Prisma incremental), ADR-011 (Swagger), ADR-012 (React SPA)

### Backend

- Proyecto NestJS con TypeScript, estructura de carpetas por capas (L-01 a L-05 según `01-ArquitecturaGeneral.md`)
  - `l01-presentation/` — Controladores y DTOs
  - `l02-agent/` — Capa del Agente Inteligente (vacía inicialmente)
  - `l03-application/` — Servicios de aplicación
  - `l04-domain/` — Lógica de dominio pura
  - `l05-infrastructure/` — Adaptadores externos (DB, cache, etc.)
- Configuración de módulos base: AppModule, ConfigModule, DatabaseModule (InfrastructureModule)
- Conexión Prisma ↔ Neon PostgreSQL (SSL habilitado — RNF-08)
- Configuración de Swagger/OpenAPI (`/api/docs`) — ADR-011
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
- Estructura HTML semántica para accesibilidad base (RNF-16)

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

Entorno de desarrollo completamente funcional. Backend y Frontend corren localmente. La conexión a la base de datos está verificada. La estructura de 5 capas (ADR-002) está establecida. No existe ninguna funcionalidad de negocio. El equipo puede comenzar el Sprint 2 sin bloqueos de configuración.


## Sprint 2 — Autenticación

**Objetivo:** El sistema permite el registro, verificación de correo, inicio de sesión, cierre de sesión y renovación de tokens. El control de acceso por roles (RBAC) está operativo. El usuario puede acceder a la UI de registro y login.

**Alcance:** Todo lo necesario para que un usuario se registre, verifique su cuenta, inicie sesión y obtenga un Access Token + Refresh Token. Roles: Comprador, Vendedor, Administrador.

**Requisitos implementados:** RF-12, RN-08, RN-09, RNF-07, RNF-08, RNF-09

**Historias de Usuario:** HU-15 (registro y verificación), HU-16 (login, logout, recuperar contraseña)

**Criterios de Aceptación a validar:** CA-RF12-01, CA-RF12-02, CA-RF12-03, CA-RF12-04, CA-RF12-05

**ADRs implementados:** ADR-005 (agregado Usuario), ADR-007 (defensa en profundidad), ADR-008 (adaptador notificación email)

**Dependencias previas:** Sprint 1 completado.

### Entidades Prisma a crear

- `Usuario` — id, nombre, email (único), passwordHash, estado (PENDIENTE/ACTIVO/SUSPENDIDO), rol (COMPRADOR/VENDEDOR/ADMINISTRADOR), fechaRegistro, fechaActualizacion, intentosFallidos, bloqueadoHasta, telefono
- `RefreshToken` — id, token (hash, único), usuarioId, expiresAt, revocado

### Migraciones a generar

- `migration_001_create_usuario`
- `migration_002_create_refresh_token`

### Backend

- Módulo Autenticación: registro con validación RN-09 (mín. 8 chars, mayúscula, minúscula, dígito)
- Hash de contraseña con Argon2 (RNF-07) — nunca en texto plano
- Envío de correo de verificación (adaptador de notificación simplificado en L-05 — ADR-008)
- Login: validación de credenciales + emisión JWT Access Token (15min) + Refresh Token (7d) — RNF-09
- Bloqueo temporal 15 min tras 3 intentos fallidos consecutivos (RN-08)
- Logout: invalidación del Refresh Token
- Endpoint de renovación de Access Token via Refresh Token
- Guards NestJS: `JwtAuthGuard`, `RolesGuard` — ADR-007
- Decoradores: `@Roles(Role.COMPRADOR)`, `@Public()`
- RBAC: Administrador, Vendedor, Comprador — 4 niveles (Visitante incluido)

### Frontend

- Página de Registro: formulario con validación Zod (nombre, email, contraseña, confirmación)
- Página de Login: formulario con manejo de errores (INVALID_CREDENTIALS, ACCOUNT_LOCKED)
- Página de Verificación de email: confirmación de enlace
- Página de Recuperación de contraseña: solicitud de reset
- Página de Reset de contraseña: nuevo password con validación RN-09
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

Un usuario puede registrarse, verificar su correo, iniciar sesión y obtener tokens. El bloqueo por intentos fallidos funciona (CA-RF12-03). Las rutas protegidas redirigen a `/login` (CA-RF12-05). El Swagger documenta todos los endpoints de Auth.

---

## Sprint 3 — Usuarios

**Objetivo:** Los usuarios pueden gestionar su perfil, preferencias de notificación y direcciones de entrega. El Administrador puede ver y gestionar cuentas desde el panel.

**Alcance:** Perfil de usuario (Comprador y Vendedor), preferencias de notificación configurables (RN-12), gestión de direcciones para entregas, administración básica de cuentas.

**Requisitos implementados:** RF-11 (parcial — gestión de cuentas), RF-12 (complemento — perfil), RN-12, RNF-10 (no datos completos de tarjeta)

**Historias de Usuario:** HU-17 (gestionar datos, direcciones y preferencias), HU-21 (admin base)

**Criterios de Aceptación a validar:** CA-RF11-01 (parcial)

**Dependencias previas:** Sprint 2 completado. Entidades `Usuario` y `RefreshToken` ya existen.

### Entidades Prisma a crear

- `Direccion` — id, usuarioId, calle, ciudad, estado, codigoPostal, pais, referencia, activa
- `PreferenciasUsuario` — id, usuarioId (único), notifNuevaOrden, notifEstadoOrden, notifSeguridad (siempre true — RD-15), notifMarketing

### Migraciones a generar

- `migration_003_create_direccion`
- `migration_004_create_preferencias_usuario`

### Backend

- Módulo Usuarios: obtener perfil propio, actualizar perfil (nombre, teléfono)
- Gestión de direcciones: CRUD de Direccion vinculadas al Usuario
- Módulo Administración (base): listar usuarios, ver detalle, cambiar estado (ACTIVO/SUSPENDIDO)
- Módulo PreferenciasUsuario: obtener y actualizar preferencias de notificación (RN-12)
- Restricción: `notifSeguridad` siempre true — notificaciones de seguridad nunca se desactivan (RN-12 excepción)
- Restricción: datos de tarjeta nunca se almacenan — solo referencia externa (RNF-10)

### Frontend

- Página de Perfil: nombre, email (solo lectura), cambio de contraseña
- Gestión de Direcciones: lista, agregar, editar, desactivar
- Preferencias de Notificación: toggles por tipo de evento (RN-12), `notifSeguridad` deshabilitado
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

**Requisitos implementados:** RF-03, RF-04, RF-05, RF-09, RN-03 (verificación stock), RN-05, RN-06, RN-10 (lógica cascada), RNF-02, RNF-04, RNF-12

**Historias de Usuario:** HU-03 (explorar catálogo), HU-05 (detalle publicación), HU-11 (publicar productos), HU-12 (editar publicaciones), HU-22 (moderar publicaciones — Admin), HU-25 (gestionar categorías — Admin)

**Criterios de Aceptación a validar:** CA-RF03-01, CA-RF03-02, CA-RF09-01, CA-RF09-02, CA-RF09-03, CA-RF11-01 (cascada), CA-RF11-02

**KPIs verificables:** KPI-03 (búsqueda ≤ 3s), KPI-08 (actualización catálogo ≤ 60s)

**Dependencias previas:** Sprint 3 completado.

### Entidades Prisma a crear

- `Categoria` — id, nombre, descripcion, parentId (autoreferencia, nullable), activa, createdAt
- `Publicacion` — id, nombre, descripcion, precio (Decimal, >0), estado (BORRADOR/ACTIVA/INACTIVA/ELIMINADA), vendedorId, categoriaId, createdAt, updatedAt
  - Índices: `@@index([estado])`, `@@index([categoriaId])`, `@@index([precio])` — RNF-02
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
- Adaptador `StorageProvider` en L-05: genera URLs pre-firmadas para upload directo a Cloudflare R2 — ADR-008
- Módulo Búsquedas: búsqueda por nombre/descripción, filtros (precio min/max, categoría, disponibilidad, envío gratis), ordenamiento (precio asc/desc, relevancia, novedad)
- Índices Prisma en `publicacion.estado`, `publicacion.categoriaId`, `publicacion.precio` para cumplir RNF-02 (≤3s)
- Publicaciones visibles en catálogo ≤60s tras creación/modificación (RNF-04 / KPI-08)
- Efecto cascada RN-10: suspender Vendedor → deshabilitar todas sus publicaciones activas

### Frontend

- Página de Catálogo: grid de publicaciones con paginación, TanStack Query para caché (RNF-02)
- Sidebar de Filtros: precio, categoría, disponibilidad, envío gratis — Zustand para estado de filtros activos
- Barra de Búsqueda: campo de texto con debounce → llama a `GET /products/search`
- Página de Detalle de Producto: galería de imágenes, descripción completa, precio, stock, botón "Agregar al carrito" (placeholder)
- Panel Vendedor — Mis Publicaciones: lista con estado (ACTIVA/INACTIVA/BORRADOR), acciones activar/desactivar
- Formulario de Publicación: todos los campos RN-05, validación Zod (precio > 0 para RN-06), upload de imágenes con URL pre-firmada R2
- Panel Administrador: sección de Categorías (crear, editar), sección de Publicaciones (eliminar por incumplimiento)
- Panel Vendedor — Clientes: tabla de clientes vinculados a ventas

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

El Catálogo funciona completamente: un Vendedor puede crear publicaciones con imágenes en R2; un Comprador (o visitante) puede buscar, filtrar y ordenar productos. La búsqueda cumple RNF-02 (KPI-03). El efecto cascada RN-10 está verificado con tests. Swagger documenta todos los endpoints de Productos y Categorías.

---

---

## Sprint 5 — Marketplace

**Objetivo:** El flujo transaccional completo funciona end-to-end: un Comprador autenticado puede agregar productos al carrito, confirmar la compra, pagar y recibir la confirmación de su Orden. El Vendedor puede gestionar sus Órdenes recibidas.

**Alcance:** Módulo Carrito (RF-07), flujo de Checkout y Confirmación (RF-08 RN-01), Módulo Pagos (adaptador `PaymentGatewayProvider` — Mercado Pago), Módulo Pedidos (ciclo de vida completo, RN-04/07), historial de Órdenes, UI transaccional completa.

**Requisitos implementados:** RF-07, RF-08, RF-10, RF-15 (notificación básica), RN-01, RN-02, RN-03, RN-04, RN-07, RNF-03, RNF-10

**Historias de Usuario:** HU-06 (gestionar carrito), HU-07 (checkout), HU-08 (pago y transacción), HU-09 (procesar pagos), HU-10 (historial de órdenes), HU-13 (gestión órdenes Vendedor), HU-14 (clientes de ventas)

**Criterios de Aceptación a validar:** CA-RF07-01 a CA-RF07-05, CA-RF08-01 a CA-RF08-05, CA-RF10-01 a CA-RF10-03

**KPIs verificables:** KPI-04 (registro Orden ≤ 5s), KPI-07 (notificación Vendedor ≤ 60s)

**ADRs implementados:** ADR-006 (confirmación explícita), ADR-008 (adaptador Mercado Pago en L-05)

**Dependencias previas:** Sprint 4 completado. Proveedor de pago externo (Mercado Pago) configurado (credenciales en variables de entorno).

### Entidades Prisma a crear

- `Carrito` — id, compradorId (único), updatedAt
- `ItemCarrito` — id, carritoId, publicacionId, cantidad (Int >0), agregadoAt
  - Constraint: `@@unique([carritoId, publicacionId])`
- `Orden` — id, compradorId, direccionId, estado (PENDIENTE/CONFIRMADA/EN_PREPARACION/DESPACHADA/ENTREGADA/CANCELADA/ESCALADA), total (Decimal), numeroConfirmacion (único), createdAt, updatedAt
- `LineaOrden` — id, ordenId, publicacionId, nombreProducto (snapshot), precioUnitario (Decimal, snapshot), cantidad (Int), subtotal (Decimal)
- `Pago` — id, ordenId (único), referenciaPasarela, monto (Decimal), estado (PENDIENTE/APROBADO/RECHAZADO/REEMBOLSADO), metodoPago, createdAt

### Migraciones a generar

- `migration_009_create_carrito`
- `migration_010_create_item_carrito`
- `migration_011_create_orden`
- `migration_012_create_linea_orden`
- `migration_013_create_pago`

### Backend

- Módulo Carrito: agregar ítem (verifica RN-02 auth + stock RN-03), modificar cantidad, eliminar ítem, ver carrito con total; vaciar al confirmar Orden
- Módulo Pagos: adaptador `PaymentGatewayProvider` en L-05 (Mercado Pago) — envía solicitud de cobro con clave de idempotencia; retorna PagoConfirmado o PagoRechazado; datos de tarjeta nunca llegan a L-03/L-04 (RNF-10) — ADR-008
- Módulo Pedidos: registrar Orden con número único al confirmar pago (RN-01 confirmación explícita); decremento atómico de stock en misma transacción Prisma (RN-04 / INV-06); ciclo de vida de estado (7 estados); escalamiento automático a las 24h en PENDIENTE sin atención (RN-07 / INV-08)
- Módulo Ordenes Vendedor: listar Órdenes recibidas, actualizar estado, filtrar por estado
- Notificaciones básicas: enviar aviso a Comprador y Vendedor al registrar Orden (sin módulo de notificaciones completo — adaptador simplificado) — KPI-07
- Restricción RD-05: LineaOrden es inmutable una vez creada; precio guardado como snapshot
- Restricción RD-06: precio de LineaOrden nunca modificable

### Frontend

- Componente Carrito: drawer/modal con lista de ítems, cantidades editables, total, botón "Ir al Checkout"
- Zustand `cartStore`: estado del carrito sincronizado con el backend via TanStack Query
- Página de Checkout Envío: resumen de productos, selección de dirección de entrega
- Página de Checkout Pago: selección de método de pago referenciado (Mercado Pago)
- Modal de Confirmación explícita (RN-01 / ADR-006): "¿Confirmar compra por $X?" con botones Confirmar/Cancelar
- Página de Confirmación de Orden (OrderSuccessPage): número de Orden, resumen, estado actual
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
- `POST /payments/process` — Iniciar pago (coordinado con adaptador Mercado Pago)
- `GET /payments/:ordenId` — Estado del pago de una Orden

### Pruebas

- Tests unitarios (Jest): lógica de dominio Orden (inmutabilidad LineaOrden RD-05/06), atomicidad Carrito+Stock (RN-04 / INV-06), escalamiento 24h (RN-07 / INV-08), precio snapshot
- Tests Supertest: agregar al carrito sin auth → 401; agregar producto sin stock → 409; flujo completo add-to-cart → checkout → confirm → order-created → stock-decremented; Vendedor actualiza estado → 200
- Verificación manual: la confirmación explícita (RN-01) bloquea el pago hasta que el usuario confirma; el carrito se vacía tras la compra

### Resultado esperado

Flujo transaccional completo funcionando: agregar al carrito → checkout → confirmación explícita (RN-01 / ADR-006) → pago via adaptador Mercado Pago → Orden registrada → stock decrementado atómicamente (RN-04) → notificación básica enviada (KPI-07). El Vendedor puede gestionar sus Órdenes. El proceso desde confirmación de pago hasta Orden registrada cumple RNF-03 / KPI-04 (≤5s). Swagger documenta todos los endpoints de Carrito, Pedidos y Pagos.

---

## Sprint 6 — Agente Inteligente

**Objetivo:** El Agente Inteligente funciona end-to-end: interpreta instrucciones en texto y voz, mantiene el contexto de sesión y ejecuta acciones dentro del Marketplace. La UI de chat conversacional está operativa.

**Alcance:** Pipeline completo del Agente (CA-01 a CA-05), adaptadores `LanguageModelProvider` (Gemini AI), `SpeechToTextProvider` (Gemini AI) en L-05, API Web Speech (TTS en cliente), módulo Conversaciones, expiración de contexto RN-14, máquina de estados (8 estados), confirmaciones RN-01, UI de chat texto y voz.

**Requisitos implementados:** RF-01, RF-02, RF-03 (vía Agente), RF-04, RF-05, RF-06, RF-07 (vía Agente), RF-08 (vía Agente), RF-13, RN-01, RN-11, RN-13, RN-14, RNF-01, RNF-06, RNF-13, RNF-14

**Historias de Usuario:** HU-01 (interactuar con Agente texto/voz), HU-02 (interpretar instrucciones y mantener contexto), HU-03 (explorar vía Agente), HU-04 (comparar productos)

**Criterios de Aceptación a validar:** CA-RF01-01 a CA-RF01-04, CA-RF02-01 a CA-RF02-04, CA-RF03-03, CA-RF04-01 a CA-RF04-03, CA-RF05-01 a CA-RF05-03, CA-RF06-01 a CA-RF06-04, CA-RF07-01 a CA-RF07-05 (vía Agente), CA-RF08-01 a CA-RF08-02 (vía Agente), CA-RF13-01, CA-RF13-02

**KPIs verificables:** KPI-01 (reconocimiento intención ≥ 85%), KPI-02 (respuesta Agente ≤ 2s P95), KPI-05 (≤ 3 instrucciones para completar compra)

**ADRs implementados:** ADR-004 (capa L-02 dedicada al Agente), ADR-008 (adaptadores IA en L-05), ADR-013 (proveedores IA intercambiables)

**Dependencias previas:** Sprint 5 completado. Credenciales de Gemini AI (NLP + STT) en variables de entorno.

### Entidades Prisma a crear

- `Sesion` — id, usuarioId, createdAt, updatedAt
- `Conversacion` — id, sesionId, createdAt, updatedAt
- `Mensaje` — id, conversacionId, rol (USER/AGENT/SYSTEM), contenido (Text), createdAt
- `Intencion` — id, mensajeId, nombre (BUSCAR/FILTRAR/ORDENAR/COMPARAR/AGREGAR_CARRITO/COMPRAR/VER_CARRITO), confianza (Float 0-1)
- `EntidadExtraida` — id, intencionId, tipo (PRODUCTO/MARCA/CATEGORIA/PRECIO/ENVIO/CALIFICACION), valor

### Migraciones a generar

- `migration_014_create_sesion`
- `migration_015_create_conversacion`
- `migration_016_create_mensaje`
- `migration_017_create_intencion`
- `migration_018_create_entidad_extraida`

### Backend

- Módulo Agente (AgentModule, L-02): pipeline CA-01 → CA-05 completo según `04-DisenoAgenteIA.md`
- CA-01 Entrada texto: recibe instrucción, valida EMPTY_INPUT e INPUT_TOO_LONG
- CA-01 Entrada voz: recibe audio → invoca adaptador `SpeechToTextProvider` (Gemini AI en L-05) → verifica umbral de confianza (RN-11); si bajo umbral → retorna LOW_CONFIDENCE sin procesar
- CA-02 Comprensión: invoca `LanguageModelProvider` (Gemini AI en L-05) con texto + contexto de sesión → retorna intención + entidades + restricciones + confianza
- CA-03 Contexto: crea/actualiza Sesion y Conversacion; almacena Mensajes e Intenciones; resuelve referencias posicionales ("la primera", "esas"); limpieza automática a 30 min de inactividad (RN-14 / INV-10)
- CA-04 Ejecución: orquesta según intención — BUSCAR/FILTRAR/ORDENAR → módulo Búsquedas; COMPARAR → Búsquedas (2-5 productos, RN-13 / RAG-04); AGREGAR_CARRITO → módulo Carrito (verifica RN-02); COMPRAR → módulo Pedidos (confirmación explícita RN-01); VER_CARRITO → módulo Carrito
- CA-05 Respuesta: formatea en lenguaje natural con explicabilidad (RNF-13 / RAG-07); si modo voz activo → respuesta texto + flag para TTS en frontend; si API Web Speech no disponible → solo texto (RNF-06)
- Degradación completa (RNF-06 / ADR-008): NLP caído → modo manual; STT caído → solo texto; Web Speech no disponible → texto sin audio
- Restricción RA-09: ningún nombre de proveedor IA (Gemini) en L-02/L-03/L-04 — solo interfaces en L-05 (ADR-013)

### Frontend

- Componente ChatAgente: panel lateral con historial de mensajes (burbujas Usuario y Agente)
- Botón Micrófono: activa captura de audio → envía al backend → muestra respuesta texto y reproduce audio via `window.speechSynthesis` (Web Speech API)
- Indicador de escucha activa: icono animado mientras captura voz (RNF-14 / CA-RF02-04)
- Indicador de procesamiento: spinner mientras el Agente interpreta (RNF-14)
- Modal de Confirmación de Compra: ResumenOrden completo con productos, precios, total → botones Confirmar/Cancelar (RN-01)
- Manejo de errores en chat: LOW_CONFIDENCE → "No entendí tu instrucción de voz, inténtala de nuevo o escríbela" (CA-RF02-02); SESSION_EXPIRED → "Tu sesión expiró, inicia una nueva búsqueda"; AGENT_UNAVAILABLE → "El asistente no está disponible, puedes navegar manualmente" (RNF-06)
- Zustand `agentStore`: estado del Agente (INACTIVO/PROCESANDO/CONFIRMANDO/ERROR), conjunto de resultados activo, filtros activos de la sesión
- El componente ChatAgente está disponible en las páginas de Catálogo, Detalle de Producto y Carrito
- Fallback TTS: si `window.speechSynthesis` no disponible, solo muestra texto (CA-RF02-03)

### API

- `POST /agent/text` — Enviar instrucción en texto al Agente
- `POST /agent/voice` — Enviar audio al Agente (STT + procesamiento)
- `POST /agent/confirm` — Confirmar acción irreversible pendiente (RN-01)
- `POST /agent/cancel` — Cancelar acción pendiente en estado CONFIRMANDO
- `GET /agent/session` — Estado de la sesión activa del Agente
- `GET /conversations/active` — Historial de la conversación activa
- `GET /conversations/:id/messages` — Mensajes de una conversación

### Pruebas

- Tests unitarios (Jest): expiración de sesión (RN-14 / INV-10), umbral STT (RN-11 / RAG-03), límite comparación 2-5 (RN-13 / RAG-04), confirmación antes de pago (RN-01), 9 escenarios límite de `04-DisenoAgenteIA.md` sec.26
- Tests Supertest: instrucción texto → intención identificada → acción ejecutada; instrucción sin auth para carrito → 401; flujo compra vía Agente → confirmación → Orden registrada; STT bajo umbral → LOW_CONFIDENCE
- Tests de adaptadores con mocks: `LanguageModelProvider` mock (Gemini), `SpeechToTextProvider` mock (alta y baja confianza)

### Resultado esperado

El Agente Inteligente funciona completamente: interpreta instrucciones de texto y voz, ejecuta búsquedas, filtros, gestión del carrito y compras. El contexto de sesión persiste y expira correctamente (RN-14). Los adaptadores de IA son intercambiables sin cambios en L-02/L-03/L-04 (ADR-013). Respuesta del Agente ≤2s en P95 (RNF-01 / KPI-02). El modo texto continúa operativo ante cualquier fallo de STT o Web Speech API (RNF-06).

---

## Sprint 7 — Administración y Funcionalidades Complementarias

**Objetivo:** El panel de Administrador tiene control completo. Los Compradores pueden gestionar favoritos y escribir reseñas. El sistema de notificaciones por email (Resend) es completo. Módulo de Auditoría activo. Promociones y cupones disponibles.

**Alcance:** Administración completa (RF-11), Favoritos, Reseñas (con verificación de compra), Módulo Notificaciones completo con adaptador Resend (RF-15), Módulo Auditoría (RNF-17), Promociones y Cupones.

**Requisitos implementados:** RF-11 (completo), RF-15 (completo con Resend), RN-10 (cascada completa), RN-12 (notificaciones con preferencias), RN-07 (escalamiento en Admin panel), RNF-17 (auditoría)

**Historias de Usuario:** HU-18 (favoritos), HU-19 (reseñas), HU-20 (notificaciones), HU-21 (admin completo), HU-22 (moderar publicaciones), HU-23 (órdenes escaladas), HU-24 (reportes y estadísticas)

**Criterios de Aceptación a validar:** CA-RF11-01 (completo), CA-RF11-02, CA-RF11-03, CA-RF15-01, CA-RF15-02

**ADRs implementados:** ADR-008 (adaptador Resend en L-05)

**Dependencias previas:** Sprint 6 completado.

### Entidades Prisma a crear

- `Favorito` — id, compradorId, publicacionId, creadoAt (unique constraint compradorId+publicacionId)
- `Resena` — id, ordenId, compradorId, publicacionId, calificacion (Int 1-5), comentario (Text, opcional), creadoAt
- `Promocion` — id, publicacionId, porcentajeDescuento (Decimal), activa, inicio, fin
- `Cupon` — id, codigo (único), descuento (Decimal), tipo (PORCENTAJE/MONTO_FIJO), vigenciaHasta, usos, usosMaximos
- `Notificacion` — id, usuarioId, tipo, contenido (Text), canal, estado (PENDIENTE/ENVIADA/FALLIDA), createdAt, enviadaAt
- `Auditoria` — id, usuarioId (nullable), accion, modulo, resultado, ipCliente, timestamp

### Migraciones a generar

- `migration_019_create_favorito`
- `migration_020_create_resena`
- `migration_021_create_promocion`
- `migration_022_create_cupon`
- `migration_023_create_notificacion`
- `migration_024_create_auditoria`

### Backend

- Módulo Administración (completo): suspender/reactivar usuarios (efecto cascada RN-10 publicaciones), eliminar publicaciones, resolver Órdenes escaladas (RN-07), reportes agregados (ventas, usuarios activos, publicaciones, órdenes — CA-RF11-03 actualización ≤ 24h)
- Módulo Favoritos: agregar/eliminar favorito, listar favoritos del Comprador con estado actualizado de publicación
- Módulo Reseñas: registrar reseña (verifica que el Comprador compró el producto — consulta Ordenes), calificación promedio por publicación
- Módulo Notificaciones (completo): adaptador `NotificationProvider` (Resend) en L-05, verificación de PreferenciasUsuario (RN-12), cola de reintento ante fallos, notificaciones de seguridad siempre enviadas (RN-12 excepción — RD-15) — RF-15
- Módulo Auditoría: interceptors NestJS que registran automáticamente autenticaciones, modificaciones de datos críticos, transacciones económicas; registros inmutables (RNF-17); sin contraseñas ni datos de pago
- Módulo Promociones: precio efectivo = precio base - descuento; precio efectivo nunca ≤0 (RN-06 aplicado)
- Módulo Cupones: validar código, vigencia, usos disponibles; aplicar descuento al total del Carrito

### Frontend

- Panel Administrador (completo): gestión de usuarios, publicaciones, resolución de escalamientos, reportes con tablas y métricas (AdminMetricStrip)
  - AdminUsersPage: tabla de usuarios, búsqueda, filtros, suspender/reactivar
  - AdminProductsPage: publicaciones con acciones de eliminación
  - AdminOrdersPage: órdenes escaladas con resolución
  - AdminReportsPage: reportes agregados con gráficas
  - AdminCategoriesPage: gestión del árbol de categorías
  - AdminProfilePage: perfil del administrador
- Lista de Favoritos (FavoritesPage): página del Comprador con sus publicaciones guardadas, con estado actualizado
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

- Tests unitarios (Jest): lógica de Auditoría (inmutabilidad — RNF-17), validación de Reseña (compra verificada), efecto cascada RN-10 (publicaciones al suspender Vendedor), precio efectivo con Promoción nunca ≤0
- Tests Supertest: reportes del Admin → 200 con datos; reseña sin compra verificada → 403; cupón expirado → 422; notificación respeta preferencias RN-12
- Verificación manual: el panel Admin muestra escalamientos y permite resolverlos

### Resultado esperado

El sistema está completo funcionalmente. El Administrador tiene control total. Favoritos, reseñas, promociones y cupones operativos. El módulo de Auditoría registra automáticamente todos los eventos críticos según RNF-17. Las notificaciones via Resend respetan las preferencias de cada usuario (RN-12) y se envían dentro de 60s (KPI-07). RF-15 completamente implementado.

---

## Sprint 8 — Calidad y Producción

**Objetivo:** El sistema completo está probado de forma integral, documentado y desplegado en producción. Todos los KPIs de la especificación son medibles. Las observaciones pendientes están resueltas.

**Alcance:** Suite de tests completa (Jest + Supertest + Playwright), prueba de carga básica (RNF-11), resolución de observaciones pendientes (RD-08, PA-02), validación WCAG 2.1 AA (RF-14, RNF-15, RNF-16), optimización de rendimiento, despliegue a producción en Cloudflare Pages + Render + Neon, validación final contra `/specs` y `/design`.

**Requisitos implementados:** RF-14 (validación completa WCAG), RNF-05 (disponibilidad infraestructura), RNF-11 (prueba de carga 2000 usuarios), RNF-15 (WCAG 2.1 AA), RNF-16 (lectores de pantalla). Verificación de todos los RF, RNF, RN documentados en `/specs`.

**Historias de Usuario:** Verificación completa de HU-01 a HU-25.

**KPIs a validar finalmente:** KPI-01 a KPI-08 completos.

**Dependencias previas:** Sprint 7 completado. Entornos de producción configurados.

### Entidades Prisma a crear

- `TokenRevocado` — id, token (único, Text), expiraEn, creadoAt — Para resolución de PA-02

Solo ajustes de índices o restricciones identificados durante pruebas de carga.

### Migraciones a generar

- `migration_025_create_token_revocado` — Lista negra de JWT para logout inmediato (PA-02)
- Solo las necesarias para ajustes de rendimiento identificados en testing de carga (límite de ítems en Carrito para RD-08 si aún no resuelto).

### Observaciones Pendientes a Resolver

| ID | Observación | Origen | Resolución planificada |
|----|------------|--------|----------------------|
| **RD-08** | El diseño no especifica límite máximo de ítems en Carrito | /design/13-ValidacionDiseno.md | Implementar límite máximo de 50 ítems en Carrito |
| **PA-02** | No existe lista negra de tokens JWT para logout inmediato | /design/13-ValidacionDiseno.md | Implementar tabla `TokenRevocado` con verificación en `JwtAuthGuard` |

### Backend / Frontend

- Resolución de observación RD-08: definir e implementar límite máximo de ítems en el Carrito (sugerido: 50 ítems) — agregar validación en módulo Carrito
- Resolución de PA-02: implementar tabla `TokenRevocado` para lista negra de tokens JWT para logout inmediato — verificación en `JwtAuthGuard` en cada request
- Optimización de queries Prisma con explain analyze en búsquedas críticas
- Validación WCAG 2.1 AA con herramienta automática de accesibilidad (RNF-15 / KPI-06)
- Validación de compatibilidad con lectores de pantalla (RNF-16) — etiquetas y descripciones en todos los elementos interactivos
- Corrección de errores detectados durante las suites de pruebas

### Pruebas

- Suite Jest completa: cobertura de todos los servicios de dominio (L-04) de los 8 sprints
- Suite Supertest: verificación de todos los contratos definidos en `06-DisenoAPI.md`
- Suite Playwright E2E: flujos críticos — registro completo, búsqueda por texto, búsqueda por voz (con Web Speech API), compra completa, gestión de publicación, flujo completo del Agente (texto a Orden confirmada)
- Prueba de carga básica: simular 500 usuarios concurrentes → verificar RNF-01 (≤2s Agente / KPI-02) y RNF-02 (≤3s búsqueda / KPI-03)
- Prueba de escalabilidad: verificar RNF-11 (2000 usuarios concurrentes sin degradación > 4s P95)
- Validación final Specification: confirmar que cada RF de `/specs` tiene test que lo valida
- Validación final Design: confirmar que las decisiones ADR-001 a ADR-013 están implementadas
- Validación final KPIs: confirmar que KPI-01 a KPI-08 son medibles y cumplen el valor objetivo

### Despliegue a Producción

- **Frontend:** build Vite → deploy a Cloudflare Pages con variables de entorno de producción
- **Backend:** `prisma migrate deploy` → deploy a Render con variables de entorno seguras (JWT_SECRET, DATABASE_URL, credenciales de Gemini AI, Mercado Pago, Resend)
- **Base de datos:** Neon PostgreSQL producción (rama main) con SSL habilitado (RNF-08)
- **Almacenamiento:** Cloudflare R2 bucket de producción configurado
- Health check verificado en Render post-deploy
- Swagger UI disponible en producción en `/api/docs`
- Disponibilidad 99.5% mensual verificada con monitoreo (RNF-05)

### Resultado esperado

El sistema está en producción y funciona correctamente en todos los flujos documentados. Los KPI-01 a KPI-08 de `/specs/05-Objetivos.md` son medibles y cumplen sus valores objetivo. La cobertura de tests valida todos los RF (RF-01 a RF-15) y RNF (RNF-01 a RNF-17) de la especificación. Las 14 reglas de negocio (RN-01 a RN-14) están verificadas. El diseño de `/design` está completamente implementado. Las observaciones RD-08 y PA-02 están resueltas. El proyecto está listo para operar.

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
| Sprint 8 | TokenRevocado + ajustes de índices según testing | migration_025 + opcionales |
| **Total** | **21 entidades** | **25 migraciones base** |

**Principio verificado:** Ningún sprint crea entidades que no usará. El schema crece únicamente cuando el sprint lo necesita.

---

## Bugfix Completado: Corrección de texto en HomePage

**Spec:** `/specs/homepage-text-correction/`
**Estado:** ✅ COMPLETADO — 21 de julio de 2026

**Descripción:** Se eliminó la palabra "reales" del texto hero en `frontend/src/pages/HomePage.tsx` línea 154.
- **Antes:** "Explora productos reales publicados en Aura."
- **Después:** "Explora productos publicados en Aura."

**Tests:** 13 tests E2E Playwright (4 bug condition + 9 preservation) — todos pasan.
**Regresiones:** 0 — Todas las funcionalidades preservadas (CSS, responsive, navegación, búsqueda, carrito).

---

## Estado Actual del Proyecto (al 21 de julio de 2026)

### Progreso de Implementación

| Sprint | Estado | Entidades Prisma | Frontend Pages | Backend Modules |
|--------|--------|------------------|----------------|-----------------|
| Sprint 1 | ✅ Completado | Configuración | HomePage (placeholder) | AppModule, InfrastructureModule |
| Sprint 2 | ✅ Completado | Usuario, RefreshToken | LoginPage, RegisterPage, VerifyEmailPage, ForgotPasswordPage, ResetPasswordPage | auth/ |
| Sprint 3 | ✅ Completado | Direccion, PreferenciasUsuario | ProfilePage, PreferencesPage, AdminUsersPage | users/, admin/ |
| Sprint 4 | ✅ Completado | Categoria, Publicacion, Inventario, ImagenPublicacion | CatalogPage, ProductDetailPage, VendorProductsPage, ProductFormPage, AdminCategoriesPage, AdminProductsPage | products/, categories/ |
| Sprint 5 | ✅ Completado | Carrito, ItemCarrito, Orden, LineaOrden, Pago | CartPage, CheckoutShippingPage, CheckoutPaymentPage, OrderSuccessPage, OrderHistoryPage, OrderDetailPage, VendorOrdersPage, VendorClientsPage | cart/, orders/, payments/ |
| Sprint 6 | ✅ Completado | Sesion, Conversacion, Mensaje, Intencion, EntidadExtraida | ChatAgente (componente), agentStore | l02-agent/, l04-domain/ai/ |
| Sprint 7 | ✅ Completado | Favorito, Resena, Promocion, Cupon, Notificacion, Auditoria | FavoritesPage, AdminOrdersPage, AdminReportsPage, AdminProfilePage | favorites/, reviews/, promotions/, notifications/, l03-application/audit/ |
| Sprint 8 | 🔄 En progreso | TokenRevocado | — | l05-infrastructure/security/ |

### Migraciones Aplicadas

1. `20260707153030_sprint_5` — Entidades de Sprints 1-5 consolidadas
2. `20260707215357_sprint6_agent` — Entidades del Agente Inteligente
3. `20260707220507_sprint7_admin_features` — Entidades de administración y complementos
4. `20260707233638_migration_025_create_token_revocado` — Lista negra de JWT (PA-02)

### Archivos del Proyecto

**Backend:** 5 capas implementadas (l01-presentation, l02-agent, l03-application, l04-domain, l05-infrastructure) con 13+ módulos funcionales.

**Frontend:** 22+ páginas implementadas, 4 stores Zustand (authStore, cartStore, agentStore, profilePhotoStore), componente ChatAgente operativo.

**Schema Prisma:** 21 entidades definidas, 4 migraciones consolidadas aplicadas.

---

## Cobertura de Trazabilidad Final

| Elemento | Total en /specs | Cubiertos en el plan | Cobertura |
|----------|----------------|---------------------|-----------|
| Objetivos (OBJ-01 a OBJ-06) | 6 | 6 | 100% |
| Requisitos funcionales (RF-01 a RF-15) | 15 | 15 | 100% |
| Requisitos no funcionales (RNF-01 a RNF-17) | 17 | 17 | 100% |
| Reglas de negocio (RN-01 a RN-14) | 14 | 14 | 100% |
| Historias de Usuario (HU-01 a HU-25) | 25 | 25 | 100% |
| KPIs (KPI-01 a KPI-08) | 8 | 8 | 100% |
| ADRs (ADR-001 a ADR-013) | 13 | 13 | 100% |
| Criterios de Aceptación | 43 | 43 | 100% |
| Observaciones de diseño (RD-08, PA-02) | 2 | 2 | 100% |

---

## Aprobación Final

**Estado del plan:** ✅ APROBADO PARA IMPLEMENTACIÓN — v3.0 INTEGRACIÓN COMPLETA

El proyecto cumple todas las condiciones para la Fase 3:
- Specification completa y validada (/specs) ✅ — 15 RF, 17 RNF, 14 RN, 25 HU
- Design completo y validado (/design) ✅ — 14 documentos, 13 ADRs
- Stack tecnológico definido y consistente ✅ — NestJS, React, Prisma, Gemini AI, Mercado Pago, Resend
- Plan incremental con Backend + Frontend por Sprint ✅
- Prisma evoluciona progresivamente ✅ — 21 entidades, 25 migraciones
- Trazabilidad completa Spec → Design → Plan ✅ — 100% cobertura
- KPIs medibles y mapeados a sprints ✅ — KPI-01 a KPI-08
- Observaciones de diseño (RD-08, PA-02) incluidas en Sprint 8 ✅
- Estado actual del proyecto documentado ✅

**Inicio autorizado:** Sprint 1 — Fundación del Proyecto
