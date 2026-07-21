# Arquitectura Tecnológica — Aura Marketplace

---

## 1. Objetivo y Alcance

Este documento formaliza las decisiones tecnológicas para la implementación de la Fase 3 de Aura Marketplace. Complementa el diseño conceptual contenido en la carpeta `/design` sin modificar ni reemplazar ningún documento de `/specs`.

Todas las tecnologías seleccionadas deben mapearse a las capas arquitectónicas existentes L-01 a L-05 definidas en `01-ArquitecturaGeneral.md`. Ninguna decisión tecnológica puede forzar cambios estructurales en esa arquitectura.

---

## 2. Principios de Selección Tecnológica

1. **Alineación con la arquitectura:** la tecnología debe encajar en la arquitectura de 5 capas existente sin forzar cambios estructurales.
2. **Madurez y comunidad:** preferencia por tecnologías con mantenimiento activo, amplia adopción y ecosistema robusto.
3. **Tipado estático:** TypeScript en todas las capas garantiza seguridad en tiempo de compilación y reduce errores en tiempo de ejecución.
4. **Independencia del proveedor de IA:** las integraciones de IA se definen mediante interfaces abstractas en el backend (`SpeechToTextProvider`, `LanguageModelProvider`) y capacidades nativas del cliente (`API Web Speech`) — nunca acopladas a un proveedor específico.
5. **Separación frontend/backend:** React (L-01) se comunica con NestJS (L-03) exclusivamente a través de contratos de API definidos en `06-DisenoAPI.md`.
6. **Consistencia del modelo de datos:** Prisma provee una fuente única de verdad para el schema, alineada con el modelo de datos conceptual en `05-DisenoBaseDatos.md`.
7. **Seguridad implementada, no agregada:** Argon2 para contraseñas (RNF-07), JWT+RefreshToken para sesiones (RNF-09), class-validator para validación de entrada (L-01 validation).
8. **Observabilidad integrada:** Swagger/OpenAPI para documentación de la API, Playwright+Jest para cobertura de tests.

---

## 3. Stack Tecnológico Oficial

| Capa | Categoría | Tecnología | Versión | Rol en el sistema |
|---|---|---|---|---|
| L-01 Frontend | Framework UI | React | 19 | SPA que implementa la Capa de Presentación e Interacción |
| L-01 Frontend | Lenguaje | TypeScript | latest | Tipado estático en toda la capa de presentación |
| L-01 Frontend | Build Tool | Vite | latest | Empaquetado y desarrollo del frontend |
| L-01 Frontend | Estilos | Tailwind CSS | latest | Sistema de diseño utilitario |
| L-01 Frontend | Componentes | Shadcn/ui | latest | Biblioteca de componentes accesibles sobre Tailwind |
| L-01 Frontend | Estado global | Zustand | latest | Gestión de estado del cliente (carrito, sesión del Agente, usuario) |
| L-01 Frontend | Caché de datos | TanStack Query | latest | Cache de peticiones HTTP, sincronización de estado servidor-cliente |
| L-01 Frontend | Formularios | React Hook Form | latest | Gestión de formularios con validación |
| L-01 Frontend | Validación | Zod | latest | Esquemas de validación compartibles entre frontend y backend |
| L-01 Frontend | HTTP Client | Axios | latest | Cliente HTTP para comunicación con la API del backend |
| L-01 Frontend | Enrutamiento | React Router DOM | latest | Enrutamiento SPA del lado del cliente |
| L-03/L-04 Backend | Framework | NestJS | latest | Framework backend que implementa L-03 (Aplicación) y L-04 (Dominio) |
| L-03/L-04 Backend | Lenguaje | TypeScript | latest | Tipado estático en toda la capa de lógica y dominio |
| L-05 Infraestructura | ORM | Prisma ORM | latest | Acceso a la base de datos, mapeo objeto-relacional, migraciones |
| L-05 Infraestructura | Documentación API | Swagger / OpenAPI | latest | Documentación automática de los contratos de la API |
| L-03 Backend | Validación | class-validator | latest | Validación declarativa de DTOs en la capa de aplicación |
| L-03 Backend | Transformación | class-transformer | latest | Transformación y serialización de objetos en la capa de aplicación |
| L-05 Base de datos | Motor | Neon PostgreSQL | latest | Base de datos relacional serverless en la nube |
| L-05 Base de datos | Migraciones | Prisma Migrate | latest | Versionado y aplicación de cambios en el esquema |
| L-05 Base de datos | Datos iniciales | Prisma Seed | latest | Datos de prueba y configuración inicial |
| Seguridad | Tokens | JWT | latest | Tokens de acceso stateless (Access Token + Refresh Token) |
| Seguridad | Hash de contraseñas | Argon2 | latest | Función de derivación de clave con sal para contraseñas (RNF-07) |
| Seguridad | Control de acceso | RBAC | — | Roles: Administrador, Vendedor, Comprador — implementado en L-03 |
| Documentación | API | Swagger/OpenAPI | latest | Contratos de API generados automáticamente desde decoradores |
| Documentación | Proyecto | Markdown | — | Documentación de especificación y diseño (esta carpeta) |
| Pruebas | Unitarias/Integración | Jest | latest | Tests unitarios de módulos de dominio y aplicación |
| Pruebas | HTTP Integration | Supertest | latest | Tests de integración de endpoints del backend |
| Pruebas | E2E | Playwright | latest | Tests end-to-end del flujo completo desde la UI |
| Calidad | Linting | ESLint | latest | Análisis estático de código en frontend y backend |
| Calidad | Formato | Prettier | latest | Formateo consistente del código |
| Nube Frontend | CDN/Hosting | Cloudflare Pages | — | Hosting del frontend (L-01) — despliegue global en el edge |
| Nube Backend | PaaS | Render | — | Hosting del backend (L-03/L-04) — despliegue de la API |
| Nube Base de Datos | DBaaS | Neon PostgreSQL | — | Base de datos serverless gestionada en la nube |
| Nube Almacenamiento | Cloud Storage | Cloudinary | — | Almacenamiento de imágenes de publicaciones y archivos de usuario |

---

## 4. Justificación Técnica por Tecnología

### React 19
**Justificación:** componentes reactivos con soporte de concurrent features, ecosistema maduro, compatibilidad nativa con Vite para builds optimizados.
**Requisitos que satisface:** RF-01 a RF-08 (interfaz del Agente conversacional), RNF-14 (indicadores visuales de procesamiento), RNF-15/16 (accesibilidad con Shadcn/ui basado en Radix UI).
**Relación con la arquitectura:** implementa L-01 completo — toda la capa de Presentación e Interacción.
**Alternativas descartadas:** Vue (ecosistema menor en enterprise), Angular (overhead para una SPA de este alcance), Svelte (madurez del ecosistema insuficiente para producción a esta escala).

### NestJS
**Justificación:** los módulos decorados de NestJS se mapean directamente a los módulos del diseño (`03-ModulosSistema.md`); la inyección de dependencias integrada implementa el patrón Repository definido en L-04; su estructura por capas refuerza la separación L-03/L-04 del diseño.
**Requisitos que satisface:** RF-09 a RF-15 (gestión de usuarios, publicaciones, órdenes), RNF-17 (auditabilidad mediante módulo dedicado).
**Relación con la arquitectura:** implementa L-03 (Application) y L-04 (Domain).
**Alternativas descartadas:** Express bare (sin estructura impuesta = riesgo de deuda técnica), Fastify (ecosistema de plugins menor), Hono (demasiado minimalista para un sistema de este dominio).

### Prisma ORM
**Justificación:** el `schema.prisma` actúa como fuente única de verdad alineada con `05-DisenoBaseDatos.md`; las migraciones versionadas garantizan trazabilidad del esquema; la generación de tipos TypeScript desde el schema elimina la doble definición.
**Requisitos que satisface:** RD-01 a RD-18 (reglas de datos del dominio).
**Relación con la arquitectura:** implementa la capa de acceso a datos en L-05.
**Alternativas descartadas:** TypeORM (decorator-heavy, menor alineación con Prisma schema-first), Drizzle (más nuevo, ecosistema en maduración), SQL crudo (pérdida de type-safety y migraciones).

### Neon PostgreSQL
**Justificación:** arquitectura serverless compatible con la escalabilidad requerida en RNF-11; garantías ACID satisfacen RN-04 (atomicidad de Stock+Orden en transacciones); soporte completo y oficial de Prisma.
**Requisitos que satisface:** RNF-11 (2000 usuarios concurrentes), RNF-12 (1M publicaciones), RN-04 (atomicidad).
**Relación con la arquitectura:** motor de persistencia en L-05.
**Alternativas descartadas:** MySQL (menor soporte en Neon/Prisma para algunas features), MongoDB (NoSQL no garantiza ACID transaccional para Orden+Stock), SQLite (no apto para producción distribuida).

### JWT + Refresh Token
**Justificación:** diseño stateless que habilita escalabilidad horizontal; Access Token de 15 minutos minimiza la ventana de compromiso; Refresh Token de 7 días permite renovación transparente; ambos se invalidan en logout.
**Requisitos que satisface:** RNF-09 (tokens con expiración máxima 24h — cubierto por Access Token corto), RN-08 (bloqueo de cuenta).
**Relación con la arquitectura:** emisión en L-05, validación mediante Guards en L-03.
**Alternativas descartadas:** sesiones en servidor (requiere sticky sessions, rompe escalabilidad horizontal), OAuth solo (añade complejidad sin beneficio para el alcance actual).

### Argon2
**Justificación:** ganador del Password Hashing Competition (PHC) 2015; resistente a ataques GPU y ASIC por diseño; parámetros de memoria y tiempo ajustables; es el estándar recomendado actualmente para derivación de claves de contraseñas.
**Requisitos que satisface:** RNF-07 (contraseñas cifradas con sal).
**Relación con la arquitectura:** utilizado exclusivamente en L-05 — nunca en L-03/L-04.
**Alternativas descartadas:** bcrypt (no resistente a GPU modernas), scrypt (menor adopción en ecosistema Node), PBKDF2 (considerado legado para nuevas implementaciones).

### Zustand
**Justificación:** store global minimalista ideal para el estado conversacional del Agente (historial de sesión, contexto activo), estado del carrito y datos de sesión del usuario; sin boilerplate excesivo.
**Requisitos que satisface:** RF-04/RF-05/RF-06 (estado del contexto del Agente en frontend), RF-07 (estado del carrito).
**Relación con la arquitectura:** gestión de estado dentro de L-01.
**Alternativas descartadas:** Redux Toolkit (boilerplate excesivo para este alcance), Jotai (atómico, menos adecuado para contexto conversacional complejo), Context API (re-renders no optimizados a escala).

### TanStack Query
**Justificación:** cache de datos del servidor con revalidación automática; reduce llamadas redundantes al backend para datos de catálogo y resultados de búsqueda; sincronización optimista de estado.
**Requisitos que satisface:** RNF-02 (búsqueda ≤3s — la caché evita repetir la misma consulta al backend), RF-03 (resultados de búsqueda del Agente).
**Relación con la arquitectura:** capa de sincronización cliente-servidor dentro de L-01.
**Alternativas descartadas:** SWR (menos features de caché avanzadas), Apollo Client (orientado a GraphQL, overhead injustificado).

### Zod
**Justificación:** schemas compartibles entre frontend y backend garantizan consistencia en la validación de la frontera L-01; integración directa con React Hook Form via `@hookform/resolvers/zod`.
**Requisitos que satisface:** RF-01 (validación EMPTY_INPUT/INPUT_TOO_LONG), RN-05/06/09 (validación de publicaciones y contraseñas).
**Relación con la arquitectura:** validación en frontera L-01; schemas reutilizables en L-03 como complemento a class-validator.
**Alternativas descartadas:** Yup (API menos ergonómica en TypeScript), Joi (sin tipos nativos TypeScript), validación manual (no escalable).

### Jest + Supertest + Playwright
**Justificación:** Jest cubre tests unitarios de L-04 (dominio puro sin efectos externos); Supertest verifica que los contratos de `06-DisenoAPI.md` se cumplan en los endpoints; Playwright verifica flujos E2E del Agente en el navegador real.
**Requisitos que satisface:** OBJ-01 a OBJ-06 (verificación de correctitud de los requisitos funcionales).
**Relación con la arquitectura:** transversal — cubre L-01, L-03, L-04.
**Alternativas descartadas:** Vitest+Cypress (ecosistema Vitest aún no al nivel de Jest para backend NestJS), Mocha+Chai (más configuración manual para NestJS).

### Cloudflare Pages + Render + Cloudinary
**Justificación:** Cloudflare Pages sirve L-01 desde el edge global (CDN) sin servidor; Render provee un PaaS confiable para L-03/L-04 con HTTPS automático; Cloudinary almacena imágenes de Publicación sin impactar la carga del backend ni de la base de datos, ofreciendo optimización automática de imágenes.
**Requisitos que satisface:** RNF-05 (disponibilidad 99.5%), RNF-11 (escalabilidad), RF-09 (imágenes de publicaciones).
**Relación con la arquitectura:** infraestructura de despliegue para L-01, L-03/L-04/L-05.
**Alternativas descartadas:** Vercel (costo mayor a escala para backend full), AWS (complejidad operacional excesiva para fase inicial), Railway (menor madurez que Render para NestJS), Cloudflare R2 (descartado para evitar codificar pipelines de compresión personalizados).

---

## 5. Interfaces de Abstracción para Inteligencia Artificial

El sistema **no debe depender de ningún proveedor de IA específico**. Toda integración de IA se realiza mediante adaptadores en L-05 que implementan las siguientes interfaces abstractas. Los módulos de L-02, L-03 y L-04 nunca referencian un proveedor concreto.

### 5.1 LanguageModelProvider (adaptador L-05)

**Propósito:** interpretar instrucciones en lenguaje natural y retornar la intención identificada, entidades extraídas y restricciones detectadas.

**Contrato de entrada:**
- Texto de instrucción (string)
- Contexto de sesión: historial reciente de la conversación, conjunto de resultados activo
- Indicador de idioma (español por defecto)

**Contrato de salida:**
- Intención identificada (del catálogo de intenciones definido en `04-DisenoAgenteIA.md`)
- Nivel de confianza (0.0 – 1.0)
- Lista de entidades extraídas: tipo + valor + confianza individual
- Lista de restricciones: tipo + valor

**Estados de error:** timeout de proveedor, servicio no disponible, respuesta con formato inválido.

**Degradación:** cuando no está disponible → el Agente entra en modo degradado; el marketplace opera mediante navegación manual (búsqueda y filtros convencionales sin Agente).

**Cumplimiento con ADR-008:** el proveedor puede ser reemplazado sin tocar las capas de dominio ni aplicación — solo se crea un nuevo adaptador en L-05.

**Proveedores compatibles (sin acoplamiento):** cualquier LLM o servicio NLP-as-a-service capaz de recibir texto + contexto y retornar datos estructurados de intención/entidad/restricción.

### 5.2 SpeechToTextProvider (adaptador L-05)

**Propósito:** transcribir la entrada de voz del usuario a texto para su procesamiento por el Agente.

**Contrato de entrada:**
- Stream de audio o archivo de audio
- Configuración de idioma (español)

**Contrato de salida:**
- Texto de transcripción
- Puntuación de confianza (0.0 – 1.0)

**Estados de error:** baja calidad de audio, timeout, idioma no soportado.

**Umbral de confianza (RN-11):** las transcripciones con confianza por debajo del umbral configurado **no se envían al Agente** — se solicita al usuario que repita la instrucción.

**Degradación:** si el adaptador no está disponible → el modo de voz queda suspendido; el modo texto continúa sin interrupción (RNF-06).

**Retención de audio:** el adaptador no debe almacenar el audio una vez entregada la transcripción.

### 5.3 API de Síntesis de Voz (Web Speech API)

**Propósito:** sintetizar las respuestas de texto del Agente en audio para reproducción en modo de voz.

**Funcionamiento:** la síntesis de voz se realiza del lado del cliente utilizando la API nativa del navegador (`window.speechSynthesis`), configurando la voz en español (`es-ES`).

**Estados de error:** API del navegador no compatible o silenciada por el sistema operativo.

**Degradación:** si la API no está disponible o falla → la respuesta se entrega únicamente en texto; no hay impacto funcional en el flujo del Agente (RNF-06).

### Reglas de sustitución de interfaces (deben respetarse todas)

- Ningún nombre de proveedor de IA puede aparecer en las capas L-03 o L-04.
- Todas las llamadas a proveedores de IA (NLP, STT) se enrutan exclusivamente a través de los adaptadores en L-05.
- La lógica interna del Agente (L-02) llama a la interfaz del adaptador, nunca al proveedor directamente.
- Reemplazar un proveedor requiere únicamente implementar un nuevo adaptador en L-05 — cero cambios en dominio ni en lógica de aplicación.

---

## 6. Mapeo del Stack a la Arquitectura por Capas

| Capa | Descripción | Tecnologías asignadas |
|---|---|---|
| L-01 | Presentación e Interacción | React 19, TypeScript, Vite, Tailwind CSS, Shadcn/ui, React Router DOM, Axios, API Web Speech (client-side synthesis) |
| L-01 (estado) | Gestión de estado cliente | Zustand, TanStack Query, React Hook Form, Zod (cliente) |
| L-02 | Agente Inteligente | NestJS (módulo AgentModule), Zustand (estado del Agente en frontend) |
| L-03 | Lógica de Aplicación | NestJS (services, controllers, guards), class-validator, class-transformer, JWT guards |
| L-04 | Dominio | NestJS (domain entities, domain services, value objects — sin dependencias externas) |
| L-05 | Infraestructura e Integraciones | Prisma ORM, Neon PostgreSQL, Argon2, JWT (emisión), adaptadores LanguageModelProvider / SpeechToTextProvider, adaptador Pasarela de Pago, adaptador Notificaciones |
| Transversal | Seguridad | JWT, Argon2, RBAC (NestJS Guards + Decorators), Zod |
| Transversal | Pruebas | Jest, Supertest, Playwright |
| Transversal | Calidad | ESLint, Prettier |
| Nube L-01 | Despliegue Frontend | Cloudflare Pages |
| Nube L-03/L-04/L-05 | Despliegue Backend | Render |
| Nube L-05 | Base de datos | Neon PostgreSQL (cloud) |
| Nube L-05 | Almacenamiento | Cloudinary |

---

## 7. Diagrama de Interacción entre Componentes

```
ZONA CLIENTE (Cloudflare Pages)
  [Browser]
    └── [React 19 + TypeScript + Vite]
          ├── [React Router DOM] — enrutamiento SPA
          ├── [Shadcn/ui + Tailwind CSS] — interfaz visual
          ├── [Zustand] — estado global (sesión Agente, carrito UI)
          ├── [TanStack Query] — caché de datos del servidor
          └── [Axios] — cliente HTTP → llama a la API del backend

          ↕ HTTPS / REST (API contratos de 06-DisenoAPI.md)
          ↕ WebSocket (actualizaciones en tiempo real del Agente)

ZONA BACKEND (Render)
  [NestJS + TypeScript]
    ├── L-01 Boundary: Guards JWT, class-validator DTOs (Zod schemas)
    ├── L-03 Application: Services, Controllers, RBAC Guards
    ├── L-04 Domain: Entities, Domain Services, Value Objects
    └── L-05 Infrastructure:
          ├── [Prisma ORM] → [Neon PostgreSQL] (datos operacionales)
          ├── [Argon2] → hash de contraseñas
          ├── [JWT] → emisión/validación de tokens
          ├── [Adaptador LanguageModelProvider] → [Proveedor NLP externo (Gemini AI)]
          ├── [Adaptador SpeechToTextProvider] → [Proveedor STT externo (Gemini AI)]
          ├── [Adaptador Pasarela de Pago] → [Pasarela externa (Mercado Pago)]
          └── [Adaptador Notificaciones] → [Servicio externo (Resend)]

ALMACENAMIENTO DE IMÁGENES (Cloudinary)
  └── Imágenes de Publicaciones (subidas por Vendedores)
      └── Accedidas desde L-03 a través de CloudinaryService
```

---

## 8. Consideraciones de Despliegue

### 8.1 Frontend (Cloudflare Pages)

- La SPA React se compila con Vite a archivos estáticos (HTML, JS, CSS).
- Cloudflare Pages sirve estos archivos desde el edge global (CDN).
- Las rutas del cliente (React Router) se redirigen al `index.html` mediante regla de rewrite.
- Las variables de entorno del frontend (URL del backend, claves públicas) se inyectan en tiempo de build.
- El frontend nunca contiene secretos — toda operación sensible ocurre en el backend.

### 8.2 Backend (Render)

- NestJS se despliega como proceso Node.js persistente.
- Las variables de entorno (`DATABASE_URL`, `JWT_SECRET`, credenciales de proveedores) se configuran en Render sin estar en el repositorio.
- `prisma migrate deploy` se ejecuta como parte del proceso de despliegue, no en tiempo de ejecución.
- Render provee HTTPS automático con TLS — satisface RNF-08 (tráfico cifrado).
- Un health check endpoint permite que Render detecte instancias no saludables y las reemplace.

### 8.3 Base de Datos (Neon PostgreSQL)

- Neon provee una instancia PostgreSQL serverless con conexión segura (SSL).
- La `DATABASE_URL` incluye parámetros SSL — el sistema nunca se conecta sin cifrado.
- Prisma Migrate gestiona el estado del esquema — no se realizan cambios manuales al esquema en producción.
- Neon soporta branching de base de datos para entornos de staging y test independientes del entorno de producción.

### 8.4 Almacenamiento (Cloudinary)

- Las imágenes de Publicaciones se almacenan y sirven a través del servicio administrado de Cloudinary.
- El backend utiliza el SDK oficial de Cloudinary en NestJS para subir las imágenes directamente.
- Cloudinary realiza la optimización de las imágenes de forma transparente (formato dinámico, compresión automática).

---

## 9. Consideraciones de Escalabilidad

Relacionadas con RNF-11 (2000 usuarios concurrentes) y RNF-12 (1M publicaciones):

- **React + Cloudflare Pages:** el frontend es estático — escala infinitamente en el CDN sin costo de servidor adicional.
- **NestJS en Render:** se pueden ejecutar múltiples instancias del backend en paralelo; el diseño stateless de JWT lo permite sin sticky sessions.
- **Neon PostgreSQL serverless:** escala las conexiones automáticamente; soporta connection pooling para reducir latencia de conexión en frío.
- **TanStack Query:** la caché en el cliente reduce significativamente las peticiones al backend para datos de catálogo repetidos.
- **Prisma:** los índices definidos en el schema son críticos para que la búsqueda de publicaciones cumpla RNF-02 (≤3s con 1M de registros).
- **Cloudinary:** el almacenamiento y optimización de imágenes es delegado por completo al servicio Cloudinary, reduciendo el tráfico y almacenamiento en servidores de base de datos o backend.
- **JWT stateless:** no requiere sesiones en servidor — el backend puede escalar horizontalmente sin infraestructura de sesiones compartidas.

---

## 10. Consideraciones de Seguridad

| Requisito | Tecnología implementadora | Cómo lo satisface |
|---|---|---|
| RNF-07 Contraseñas cifradas | Argon2 | Hash con sal y parámetros ajustables; resistente a GPU/ASIC; resultado almacenado en L-05 vía Prisma |
| RNF-08 Tráfico cifrado | Render TLS + Cloudflare HTTPS | Todo el tráfico HTTP ocurre sobre TLS automático en ambas plataformas |
| RNF-09 Tokens máx 24h | JWT Access Token (15min) + Refresh Token (7 días) | Access Token de vida corta minimiza la ventana de compromiso; Refresh Token permite renovación sin reautenticación completa; ambos se invalidan en logout |
| RNF-10 No datos de tarjeta | Adaptador Pasarela de Pago (L-05) | Solo el adaptador interactúa con la pasarela; los datos de tarjeta nunca llegan a L-03/L-04/Prisma |
| RNF-17 Auditoría | Módulo Auditoría NestJS + Prisma | Eventos de auditoría persistidos en tabla Auditoria de Neon PostgreSQL; inmutables por diseño del schema |
| RN-08 Bloqueo de cuenta | Lógica en L-04 + Prisma | Contador de intentos fallidos y marca de bloqueo temporal en tabla Usuario; verificado en cada intento de autenticación |
| RN-09 Política contraseña | Zod schema + class-validator | Validación en L-01 (Zod) y en L-03 (class-validator) antes de llegar a Argon2 |
| RBAC | NestJS Guards + Decoradores | Guards verifican JWT y rol en cada endpoint protegido; decoradores `@Roles()` definen permisos por endpoint |

---

## 11. Consideraciones de Mantenibilidad

- **TypeScript en ambas capas:** refactoring seguro con soporte completo de IDE; los errores se detectan en compilación, no en producción.
- **Prisma schema como fuente de verdad:** el modelo conceptual de `05-DisenoBaseDatos.md` tiene una representación directa en `schema.prisma`; los cambios al modelo se versionan como migraciones auditables.
- **NestJS modular:** cada módulo funcional de `03-ModulosSistema.md` corresponde a un módulo NestJS — bajo acoplamiento, alta cohesión, reemplazable de forma independiente.
- **Swagger/OpenAPI generado automáticamente:** los contratos de `06-DisenoAPI.md` son verificables contra la implementación real en cualquier momento.
- **ESLint + Prettier:** código consistente entre todos los colaboradores; reduce la carga cognitiva al revisar cambios.
- **Jest + Supertest + Playwright:** la suite de tests documenta el comportamiento esperado y actúa como red de seguridad contra regresiones.
- **Interfaces de abstracción AI:** cambiar de proveedor de NLP o STT no requiere modificar L-03 ni L-04 — solo el adaptador L-05 correspondiente.

---

## 12. Riesgos y Mitigaciones Tecnológicas

| ID | Riesgo | Impacto | Probabilidad | Mitigación |
|---|---|---|---|---|
| RT-01 | Render puede tener cold starts en instancias inactivas (primer request lento) | Bajo-Medio | Media | Configurar health check pings para mantener la instancia activa; documentar comportamiento esperado para usuarios |
| RT-02 | Neon PostgreSQL serverless puede introducir latencia en conexiones en frío | Medio | Baja-Media | Usar connection pooling de Prisma; medir impacto en RNF-02 durante testing de carga |
| RT-03 | Cambio de proveedor de NLP o STT requiere implementar nuevo adaptador L-05 | Bajo | Alta (es un feature, no un riesgo real) | Las interfaces SpeechToTextProvider y LanguageModelProvider están definidas — el adaptador es el único artefacto a crear |
| RT-04 | JWT Access Token comprometido tiene ventana de 15 minutos de validez | Medio | Baja | La ventana corta minimiza el daño; implementar lista negra de tokens en casos de logout o compromiso detectado |
| RT-05 | Upload de imágenes podría eludir validaciones del backend | Medio | Baja | Restricciones de tipo MIME y tamaño máximo en el validador del backend y configuración del SDK de Cloudinary |
| RT-06 | Versiones de dependencias npm sin pinning exacto pueden introducir regresiones | Medio | Media | Usar `package-lock.json` con versiones exactas; revisar actualizaciones de forma controlada (dependabot o equivalente) |
| RT-07 | Playwright E2E tests pueden ser frágiles ante cambios de UI | Bajo-Medio | Media | Usar selectores semánticos (`data-testid`, roles ARIA) en lugar de selectores CSS frágiles |

---

## 13. Compatibilidad entre Tecnologías

- **React 19 + TypeScript + Vite:** soporte completo — Vite tiene soporte de primera clase para React con TypeScript.
- **NestJS + TypeScript + Prisma:** integración oficial con el patrón `@nestjs/prisma` — ampliamente documentada y en producción en miles de proyectos.
- **NestJS + class-validator + class-transformer:** patrón central de NestJS — `ValidationPipe` integra directamente ambas librerías.
- **NestJS + JWT:** módulo `@nestjs/jwt` provee soporte oficial con el patrón Guards.
- **Argon2 + NestJS:** el paquete `argon2` de npm funciona directamente dentro del service layer de NestJS sin configuración adicional.
- **Prisma + Neon PostgreSQL:** Prisma soporta oficialmente Neon con `@prisma/adapter-neon` — requiere connection string con SSL habilitado.
- **TanStack Query + React 19 + Axios:** totalmente compatibles — TanStack Query es agnóstico del framework en su núcleo; Axios se usa como fetcher.
- **Zustand + React 19:** Zustand 4.x soporta completamente las concurrent features de React 18+.
- **Zod + React Hook Form:** integración oficial mediante `@hookform/resolvers/zod` — validación de schemas directamente en formularios.
- **Playwright + NestJS:** Playwright ejecuta tests contra la aplicación desplegada de forma independiente — sin acoplamiento.
- **Cloudflare Pages + Vite:** adaptador oficial de Cloudflare Pages para builds de Vite.
- **Cloudinary + NestJS SDK:** integración robusta utilizando el SDK de Cloudinary para NestJS para la subida de imágenes y generación de URLs dinámicas.

---

## 14. Trazabilidad Stack → Especificación

| Tecnología | Requisitos que justifican su selección |
|---|---|
| React 19 + Vite | RF-01 (UI del Agente texto), RF-02 (interfaz de voz), RNF-14 (indicadores visuales), RNF-15/16 (accesibilidad) |
| Shadcn/ui + Tailwind | RNF-15 (WCAG 2.1 AA — Shadcn/ui usa Radix UI primitives accesibles), RNF-16 (lectores de pantalla) |
| Zustand | RF-01 a RF-06 (estado conversacional del Agente en cliente), RF-07 (estado del carrito en cliente) |
| TanStack Query | RNF-02 (búsqueda ≤3s — caché reduce llamadas), RF-03 (resultados de búsqueda) |
| NestJS + TypeScript | RNF-17 (mantenibilidad, módulos independientes), RNF-11 (escalabilidad horizontal), ADR-003 |
| Prisma ORM + Neon PostgreSQL | RN-04 (atomicidad Orden+Stock), RD-01 a RD-18, RNF-12 (1M publicaciones) |
| Argon2 | RNF-07 (contraseñas cifradas con sal) |
| JWT + Refresh Token | RNF-09 (tokens con expiración), RN-08 (bloqueo de cuenta), RF-12 (autenticación) |
| RBAC (NestJS Guards) | RF-11 (admin), RF-09/10 (vendedor), RF-07/08 (comprador), `07-Seguridad.md` sec. 4 |
| class-validator + Zod | RF-01 (validación EMPTY_INPUT/INPUT_TOO_LONG), RN-05/06/09 |
| Swagger/OpenAPI | `06-DisenoAPI.md` (todos los contratos), RNF-17 (documentación como parte de mantenibilidad) |
| Jest + Supertest | OBJ-01 a OBJ-06 (verificación de correctitud de los requisitos funcionales) |
| Playwright | RF-01 a RF-08 (flujos E2E del Agente y del Marketplace) |
| Cloudflare Pages | RNF-05 (disponibilidad 99.5%), RNF-11 (escalabilidad — CDN global) |
| Render | RNF-05 (disponibilidad), RNF-11 (escalabilidad horizontal backend) |
| Cloudinary | RF-09 (imágenes de Publicaciones — RN-05 requiere al menos una imagen) |
| LanguageModelProvider | RF-01/02 (NLP), ADR-008 (independencia del proveedor) |
| SpeechToTextProvider | RF-02 (voz a texto), RN-11 (umbral de confianza STT) |
| API Web Speech | RF-02 (texto a voz), RNF-06 (degradación controlada) |
