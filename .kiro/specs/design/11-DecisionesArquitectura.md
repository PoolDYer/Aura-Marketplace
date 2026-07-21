# Registro de Decisiones Arquitectónicas — Aura Marketplace

## Introducción

Un **Registro de Decisiones Arquitectónicas** (ADR, por sus siglas en inglés) documenta cada decisión de diseño significativa tomada durante el proyecto: el contexto que la motivó, las alternativas que se evaluaron, la decisión adoptada, su justificación y las consecuencias esperadas.

En este proyecto, los ADR cumplen tres propósitos:

1. **Trazabilidad:** cada decisión queda vinculada a los requisitos y reglas de negocio que la originaron.
2. **Comunicación:** cualquier miembro del equipo puede entender por qué el sistema está diseñado de una forma específica, no solo cómo.
3. **Gobierno del cambio:** antes de modificar una decisión registrada, el equipo debe evaluar conscientemente sus consecuencias.

Los ADR de este proyecto corresponden a la **Fase 2 — Diseño**, que ocurre después de que la especificación (`/specs`) ha sido validada y antes de que comience la implementación.

---

## ADR-001: Separación entre Especificación y Diseño

- **ID:** ADR-001
- **Título:** Separación entre Especificación y Diseño
- **Estado:** Aceptada
- **Fecha de registro:** Fase 2 — Diseño del sistema

### Contexto

Antes de iniciar el proyecto, el equipo debía decidir si combinar los requisitos y el diseño en un único documento o separarlos en fases distintas. Construir software sin una fase de especificación explícita arriesga producir el sistema incorrecto. Una metodología de Desarrollo Dirigido por Especificación (SDD) debe definir con precisión el límite entre fases.

### Alternativas evaluadas

1. Documento único: requisitos, diseño e implementación en un solo artefacto.
2. Dos fases: especificación combinada con diseño e implementación.
3. Tres fases distintas: especificación → diseño → implementación (metodología SDD).

### Decisión tomada

Tres fases distintas siguiendo la metodología SDD. El directorio `/specs` contiene **únicamente** lo que el sistema debe hacer. El directorio `/design` contiene **únicamente** cómo será construido. La implementación comienza solo después de que ambas fases estén validadas.

### Justificación

SDD garantiza que las decisiones de diseño nunca se tomen prematuramente sin una especificación validada. Elimina el riesgo de construir un sistema que resuelva el problema equivocado y permite la validación independiente de cada fase. Trazado a: OBJ-01 a OBJ-06 (`/specs/05-Objetivos.md`).

### Consecuencias

**Ventajas:**
- La especificación puede ser revisada por stakeholders no técnicos antes de que el diseño comience.
- Los cambios en requisitos no invalidan automáticamente decisiones de diseño ya tomadas.
- Permite detectar inconsistencias en los requisitos antes de comprometer recursos de diseño.

**Desventajas / Compromisos:**
- Requiere disciplina para no incluir decisiones de implementación en `/specs`.
- El proceso completo tarda más que un enfoque directo de codificación.

**Impactos en el diseño:**
Todos los documentos del directorio `/design` asumen que `/specs` es un insumo estable y validado. Los ADR referencian explícitamente los identificadores de `/specs`.

---

## ADR-002: Separación Conceptual entre Capa de Presentación y Capa de Lógica

- **ID:** ADR-002
- **Título:** Separación Conceptual entre Capa de Presentación y Capa de Lógica
- **Estado:** Aceptada
- **Fecha de registro:** Fase 2 — Diseño del sistema

### Contexto

El sistema debe atender distintos tipos de usuario (Comprador mediante texto y voz, Vendedor mediante panel de gestión, Administrador mediante panel de control) a través de canales de interacción potencialmente diferentes. La pregunta es si diseñar un sistema monolítico o separar conceptualmente la capa de cara al usuario de la lógica de negocio.

### Alternativas evaluadas

1. Diseño monolítico: presentación y lógica de negocio en la misma capa.
2. Cliente ligero: toda la lógica en el servidor; la presentación es renderizado puro.
3. Separación conceptual clara: Capa de Presentación (L-01) independiente de la Capa de Aplicación (L-03) y la Capa de Dominio (L-04).

### Decisión tomada

Separación conceptual clara entre L-01 (Presentación e Interacción) y las capas internas (L-03 Aplicación, L-04 Dominio). L-01 no contiene lógica de negocio. Las reglas de negocio residen en L-04.

### Justificación

Permite que distintas modalidades de interacción (texto, voz, formularios) compartan la misma lógica de dominio. Satisface RNF-15 y RNF-16 (accesibilidad) sin duplicar lógica de negocio. Habilita que la capa del Agente Inteligente (L-02) se introduzca entre presentación y aplicación sin afectar a ninguna de las dos.

### Consecuencias

**Ventajas:**
- Un cambio en la interfaz de usuario no requiere modificar la lógica de dominio.
- La capa de dominio puede probarse independientemente de cualquier modalidad de presentación.
- Nuevos canales de interacción futuros reutilizan L-03 y L-04 sin cambios.

**Desventajas / Compromisos:**
- Requiere definir contratos explícitos entre capas, lo que añade superficie de diseño inicial.
- Los equipos deben mantener disciplina para no filtrar lógica de negocio hacia L-01.

**Impactos en el diseño:**
Define la estructura de cinco capas documentada en `/design/01-ArquitecturaGeneral.md`. Cada módulo del sistema (`/design/03-ModulosSistema.md`) especifica a qué capa pertenece cada una de sus responsabilidades.

---

## ADR-003: Organización Modular del Sistema por Dominios Funcionales

- **ID:** ADR-003
- **Título:** Organización Modular del Sistema por Dominios Funcionales
- **Estado:** Aceptada
- **Fecha de registro:** Fase 2 — Diseño del sistema

### Contexto

El sistema cuenta con más de 20 módulos funcionales identificados (Autenticación, Usuarios, Productos, Carrito, Órdenes, Pagos, Agente, etc.). El diseño debe decidir cómo organizar estos módulos para evitar el alto acoplamiento y permitir la evolución independiente de cada uno.

### Alternativas evaluadas

1. Componente monolítico único: toda la funcionalidad en una sola unidad.
2. Capas sin separación modular: solo agrupación por capa, sin agrupación funcional.
3. Organización modular por dominio funcional: cada módulo tiene una única responsabilidad, una interfaz clara y dependencias explícitas.

### Decisión tomada

Veinte módulos independientes organizados en seis grupos funcionales (Identidad, Catálogo, Transaccional, Social, Conversacional, Soporte). Cada módulo define: objetivo, responsabilidades, entradas, salidas, dependencias, eventos, restricciones e interfaces conceptuales. No se permiten dependencias circulares entre módulos.

### Justificación

Satisface RNF-17 (mantenibilidad). Permite que los módulos sean desarrollados y probados de forma independiente. Reduce el radio de impacto de los cambios. Satisface RNF-11 (escalabilidad: los módulos pueden escalar de forma independiente). Derivado directamente de `/design/03-ModulosSistema.md`.

### Consecuencias

**Ventajas:**
- Un fallo en un módulo no se propaga automáticamente a módulos no relacionados.
- Los equipos pueden trabajar en módulos distintos en paralelo sin conflictos de diseño.
- Facilita la incorporación de nuevos módulos sin afectar los existentes.

**Desventajas / Compromisos:**
- Requiere definir y mantener contratos de interfaz entre los 20 módulos.
- La coordinación entre módulos para flujos transversales (ej.: una compra completa) exige orquestación explícita.

**Impactos en el diseño:**
Estructura completa documentada en `/design/03-ModulosSistema.md`. El modelo de dominio (`/design/02-ModeloDominio.md`) refleja los límites entre grupos funcionales como agregados separados.

---

## ADR-004: Diseño del Agente Inteligente como Capa Arquitectónica Independiente

- **ID:** ADR-004
- **Título:** Diseño del Agente Inteligente como Capa Arquitectónica Independiente
- **Estado:** Aceptada
- **Fecha de registro:** Fase 2 — Diseño del sistema

### Contexto

La innovación central del Marketplace es el Agente Inteligente. La pregunta es si incrustar la lógica del agente dentro de los módulos existentes (por ejemplo, dentro del módulo de Búsqueda) o diseñarlo como una capa arquitectónica independiente.

### Alternativas evaluadas

1. Incrustado en cada módulo: cada módulo gestiona su propia interpretación de lenguaje natural.
2. Servicio centralizado dentro de la capa de aplicación: el Agente es solo otro módulo en L-03.
3. Capa arquitectónica independiente (L-02) ubicada entre Presentación (L-01) y Aplicación (L-03).

### Decisión tomada

El Agente Inteligente se diseña como su propia capa arquitectónica (L-02), separada tanto de la capa de presentación como de las capas de aplicación y dominio. Cuenta con su propia estructura interna compuesta por cinco sub-capas: Entrada, Comprensión de Lenguaje Natural, Gestión de Contexto, Ejecución de Acciones y Respuesta.

### Justificación

OBJ-01, OBJ-02, OBJ-03 y OBJ-04 requieren que el Agente sea una preocupación arquitectónica de primer orden. Separarlo permite: evolucionar las capacidades de comprensión de lenguaje natural de forma independiente, escalar la capa del Agente de forma independiente (RNF-11) y reemplazar el proveedor de procesamiento de lenguaje sin tocar la lógica de negocio. Derivado de `/design/04-DisenoAgenteIA.md` y `/design/01-ArquitecturaGeneral.md`.

### Consecuencias

**Ventajas:**
- Las mejoras en capacidad de comprensión no requieren cambios en los módulos de dominio.
- La capa L-02 puede escalar de forma independiente según la carga conversacional.
- Facilita la evaluación y sustitución del componente de comprensión de lenguaje natural sin afectar al resto del sistema.

**Desventajas / Compromisos:**
- Añade una capa adicional de coordinación entre L-01 y L-03 que debe ser diseñada explícitamente.
- El flujo de una instrucción compleja atraviesa más capas, lo que incrementa la superficie de posibles fallos.

**Impactos en el diseño:**
Estructura interna del Agente completamente especificada en `/design/04-DisenoAgenteIA.md`. La máquina de estados del Agente y los flujos de procesamiento están documentados en ese mismo archivo.

---

## ADR-005: Gestión del Contexto Conversacional en el Agregado Sesión

- **ID:** ADR-005
- **Título:** Gestión del Contexto Conversacional en el Agregado Sesión
- **Estado:** Aceptada
- **Fecha de registro:** Fase 2 — Diseño del sistema

### Contexto

El Agente debe mantener contexto a lo largo de múltiples instrucciones dentro de la misma sesión de usuario ("busca zapatillas" → "ordénalas por precio" → "la primera al carrito"). La pregunta es dónde almacenar y gestionar este contexto conversacional.

### Alternativas evaluadas

1. Sin estado: cada instrucción es independiente; no se mantiene contexto entre instrucciones.
2. Contexto almacenado en la capa de presentación: cada dispositivo cliente mantiene su propio contexto.
3. Contexto gestionado como agregado de dominio de primer orden (Sesión + ContextoSesión) dentro de la capa del Agente.

### Decisión tomada

El contexto conversacional se gestiona como el agregado "Sesión del Agente" con entidad raíz `Sesion` y sub-entidades `ContextoSesion` e `HistorialInstrucciones`. El contexto es administrado por la sub-capa de Gestión de Contexto del Agente (CA-03). Expira automáticamente tras 30 minutos de inactividad (RN-14).

### Justificación

RN-14 exige explícitamente la expiración del contexto de sesión. RF-01, RF-04, RF-05, RF-06 y RF-07 requieren resolución de contexto entre instrucciones. Convertirlo en agregado de dominio garantiza que la regla de expiración de 30 minutos sea aplicada por el dominio, no por la infraestructura. Derivado de `/design/02-ModeloDominio.md` y `/design/04-DisenoAgenteIA.md`.

### Consecuencias

**Ventajas:**
- La regla de expiración de sesión (RN-14) se aplica en un único lugar del dominio.
- El historial de instrucciones es un agregado con ciclo de vida propio, fácil de auditar.
- Permite que diferentes instancias del Agente accedan al mismo contexto de sesión de un usuario.

**Desventajas / Compromisos:**
- El almacenamiento del contexto conversacional debe ser de acceso muy rápido para no afectar la latencia de respuesta (RNF-01).
- La gestión de la expiración automática requiere un mecanismo de limpieza en la capa de infraestructura (L-05).

**Impactos en el diseño:**
El agregado `Sesion` está definido en `/design/02-ModeloDominio.md`. La sub-capa CA-03 del Agente, detallada en `/design/04-DisenoAgenteIA.md`, es la propietaria de este agregado durante el ciclo de vida conversacional.

---

## ADR-006: Confirmación Explícita Obligatoria para Acciones Irreversibles

- **ID:** ADR-006
- **Título:** Confirmación Explícita Obligatoria para Acciones Irreversibles
- **Estado:** Aceptada
- **Fecha de registro:** Fase 2 — Diseño del sistema

### Contexto

El Agente puede ejecutar acciones irreversibles como compras en nombre del usuario. Si el Agente malinterpreta una instrucción o el usuario se expresa de forma ambigua ("compra lo más barato"), ejecutar una transacción financiera sin confirmación constituiría un error crítico tanto de experiencia de usuario como de negocio.

### Alternativas evaluadas

1. Sin confirmación: el Agente ejecuta de inmediato al detectar intención de compra.
2. Confirmación automática por tiempo de espera: si el usuario no cancela en N segundos, se procede.
3. Confirmación explícita obligatoria: el Agente presenta el resumen completo de la orden y espera una respuesta afirmativa explícita antes de ejecutar el pago.

### Decisión tomada

Toda acción irreversible (específicamente: cualquier solicitud de pago a la Pasarela de Pago) requiere una confirmación explícita del Comprador. El Agente presenta el `ResumenOrden` y entra en el estado "Confirmando", que no avanza hasta que el usuario responde de forma afirmativa. Esto está aplicado por RN-01.

### Justificación

RN-01 es una regla de negocio inapelable (`/specs/06-ReglasNegocio.md`). Las transacciones financieras son irreversibles. El estado "Confirmando" en la máquina de estados del Agente (`/design/04-DisenoAgenteIA.md`, sección de estados) aplica esto a nivel arquitectónico. Elimina el riesgo de compras accidentales por mala interpretación de instrucciones de voz.

### Consecuencias

**Ventajas:**
- Protege al usuario de cargos no deseados, lo que genera confianza en el canal conversacional.
- El cumplimiento de RN-01 queda garantizado por el diseño, no por la buena voluntad de la implementación.
- La presentación del `ResumenOrden` permite al usuario corregir cantidad, variante o dirección antes de confirmar.

**Desventajas / Compromisos:**
- Añade un paso adicional al flujo de compra, lo que aumenta ligeramente la fricción en escenarios de compra repetida.
- El estado "Confirmando" tiene un tiempo de espera (definido en `/design/04-DisenoAgenteIA.md`) que debe comunicarse claramente al usuario.

**Impactos en el diseño:**
La máquina de estados del Agente incluye el estado `CONFIRMANDO` como estado bloqueante antes de `EJECUTANDO_PAGO`. El módulo de Órdenes no recibe instrucción de pago hasta que el estado del Agente ha transitado de `CONFIRMANDO` a `CONFIRMADO`.

---

## ADR-007: Estrategia de Seguridad por Capas con Defensa en Profundidad

- **ID:** ADR-007
- **Título:** Estrategia de Seguridad por Capas con Defensa en Profundidad
- **Estado:** Aceptada
- **Fecha de registro:** Fase 2 — Diseño del sistema

### Contexto

El sistema maneja datos sensibles: credenciales de usuario, referencias de pago, direcciones personales y datos conversacionales. Una brecha de seguridad en un único punto no debería comprometer el sistema completo.

### Alternativas evaluadas

1. Seguridad perimetral única: un único control de seguridad en el punto de entrada al sistema.
2. Seguridad solo en la capa de datos: cifrado y control de acceso únicamente a nivel de almacenamiento.
3. Defensa en profundidad: controles de seguridad en cada capa arquitectónica (L-01 a L-05), donde cada capa asume que la anterior puede estar comprometida.

### Decisión tomada

La seguridad se aplica en cada capa: L-01 valida y filtra todas las entradas; L-03 verifica la autorización basada en roles para cada operación; L-04 aplica los invariantes de dominio (hash de contraseñas, no almacenamiento de datos completos de tarjeta); L-05 cifra los datos sensibles en reposo y en tránsito. Adicionalmente: RBAC con 4 roles, sesiones por token (máximo 24 horas por RNF-09), bloqueo de cuenta tras intentos fallidos (RN-08) y no almacenamiento del número completo de tarjeta (RNF-10).

### Justificación

RNF-07, RNF-08, RNF-09, RNF-10, RNF-17 y OBJ-06 (`/specs/08-RequisitosNoFuncionales.md`). La defensa en profundidad implica que una brecha en L-01 no expone datos de dominio porque L-03 también aplica autorización. Derivado de `/design/07-Seguridad.md`.

### Consecuencias

**Ventajas:**
- Un atacante que supere un control de seguridad encuentra controles adicionales en cada capa siguiente.
- El cumplimiento de RNF-10 (no datos completos de tarjeta) es un invariante de dominio en L-04, no solo una política de infraestructura.
- El RBAC centralizado en L-03 garantiza que ninguna operación sensible pueda ejecutarse sin verificación de rol.

**Desventajas / Compromisos:**
- Los controles de seguridad redundantes entre capas añaden latencia acumulada en cada solicitud.
- Requiere mantener la coherencia de los controles de seguridad a lo largo de las cinco capas a medida que el sistema evoluciona.

**Impactos en el diseño:**
Cada módulo documentado en `/design/03-ModulosSistema.md` especifica qué controles de seguridad aplica. El diseño completo de seguridad, incluyendo el modelo RBAC y la política de tokens, está en `/design/07-Seguridad.md`.

---

## ADR-008: Integración con Servicios Externos mediante Adaptadores con Degradación Controlada

- **ID:** ADR-008
- **Título:** Integración con Servicios Externos mediante Adaptadores con Degradación Controlada
- **Estado:** Aceptada
- **Fecha de registro:** Fase 2 — Diseño del sistema

### Contexto

El sistema depende de servicios externos (procesamiento de lenguaje natural, conversión de voz a texto, pasarela de pago, notificaciones) y de capacidades nativas del cliente para la síntesis de voz. Los servicios externos son inherentemente poco fiables. Si alguno falla, la pregunta es si el sistema completo debe fallar o continuar operando en capacidad reducida.

### Alternativas evaluadas

1. Acoplamiento directo: la capa de dominio llama directamente a los servicios externos; si fallan, la funcionalidad falla por completo.
2. Solo disyuntor de circuito: envuelve las llamadas externas pero sin un comportamiento de degradación definido.
3. Patrón adaptador con modo de degradación explícito: cada integración externa queda aislada en un adaptador (L-05) con un comportamiento de degradación definido cuando el servicio no está disponible.

### Decisión tomada

Cada integración externa queda encapsulada en un adaptador dedicado en L-05. Cada adaptador tiene un modo de degradación explícitamente definido (derivado de RNF-06): servicio de lenguaje natural no disponible → modo de navegación manual; conversión de voz a texto no disponible → modo solo texto; síntesis de voz en el navegador mediante API Web Speech no disponible → solo respuesta de texto; pasarela de pago no disponible → carrito preservado, compra suspendida; servicio de notificaciones no disponible → cola de reintento. El dominio no depende de ningún proveedor externo específico.

### Justificación

RNF-05 (disponibilidad del 99,5%) y RNF-06 (degradación controlada) requieren que el sistema continúe operando incluso cuando los servicios externos fallen. El diseño agnóstico al proveedor permite sustituir proveedores sin modificar la lógica de dominio. Derivado de `/design/08-Integraciones.md` y `/design/01-ArquitecturaGeneral.md`.

### Consecuencias

**Ventajas:**
- Una caída del servicio de voz no interrumpe la capacidad de compra del usuario; solo pierde la modalidad vocal.
- El dominio permanece completamente ajeno a los detalles del contrato con cada proveedor externo.
- Permite cambiar de proveedor de procesamiento de lenguaje o pasarela de pago modificando únicamente el adaptador correspondiente en L-05.

**Desventajas / Compromisos:**
- Cada adaptador debe implementar y mantener su propio comportamiento de degradación, lo que añade lógica a L-05.
- Los modos de degradación deben comunicarse claramente al usuario en tiempo real, lo que requiere coordinación con L-01.

**Impactos en el diseño:**
Los cinco adaptadores y sus modos de degradación están especificados en `/design/08-Integraciones.md`. La capa L-05 del mapa arquitectónico (`/design/01-ArquitecturaGeneral.md`) es la única capa que conoce los detalles de cada servicio externo.

---

## Tabla Resumen

| ADR | Título | Estado | Requisitos relacionados |
|-----|--------|--------|------------------------|
| ADR-001 | Separación entre Especificación y Diseño | Aceptada | OBJ-01 a OBJ-06 |
| ADR-002 | Separación Conceptual entre Capa de Presentación y Capa de Lógica | Aceptada | RNF-15, RNF-16 |
| ADR-003 | Organización Modular del Sistema por Dominios Funcionales | Aceptada | RNF-11, RNF-17 |
| ADR-004 | Diseño del Agente Inteligente como Capa Arquitectónica Independiente | Aceptada | OBJ-01, OBJ-02, OBJ-03, OBJ-04, RNF-11 |
| ADR-005 | Gestión del Contexto Conversacional en el Agregado Sesión | Aceptada | RN-14, RF-01, RF-04, RF-05, RF-06, RF-07 |
| ADR-006 | Confirmación Explícita Obligatoria para Acciones Irreversibles | Aceptada | RN-01 |
| ADR-007 | Estrategia de Seguridad por Capas con Defensa en Profundidad | Aceptada | RNF-07, RNF-08, RNF-09, RNF-10, RNF-17, OBJ-06 |
| ADR-008 | Integración con Servicios Externos mediante Adaptadores con Degradación Controlada | Aceptada | RNF-05, RNF-06 |

---

## ADR-009: Selección de React 19 y Vite para la Capa de Presentación

- **ID:** ADR-009
- **Título:** Selección de React 19 y Vite para la Capa de Presentación (L-01)
- **Estado:** Aceptada
- **Fecha de registro:** Fase 2 — Actualización tecnológica

**Contexto:** La Capa de Presentación e Interacción (L-01) requiere una solución que soporte la interfaz conversacional del Agente, controles accesibles (RNF-15, RNF-16), indicadores visuales en tiempo real (RNF-14) y navegación SPA.

**Alternativas evaluadas:**
1. Vue 3 + Nuxt — ecosistema sólido pero menor adopción en proyectos enterprise
2. Angular — overhead de framework para una SPA de este alcance
3. React 19 + Vite — SPA con concurrent features, ecosistema maduro, Vite para builds optimizados

**Decisión tomada:** React 19 con Vite como build tool, TypeScript, Tailwind CSS y Shadcn/ui (basado en Radix UI para accesibilidad).

**Justificación:** React 19 implementa directamente L-01. Shadcn/ui provee componentes accesibles que satisfacen RNF-15 y RNF-16 sin configuración adicional. Vite elimina el overhead de Webpack.

**Consecuencias:**
- Ventajas: ciclo de desarrollo rápido con HMR de Vite; tipado estático con TypeScript; accesibilidad WCAG 2.1 AA con Radix UI primitives
- Desventajas/Compromisos: React 19 es reciente — algunas librerías del ecosistema pueden no estar completamente actualizadas
- Impactos: el frontend se despliega como archivos estáticos en Cloudflare Pages (CDN global)

---

## ADR-010: Selección de NestJS para el Backend (L-03 y L-04)

- **ID:** ADR-010
- **Título:** Selección de NestJS para la implementación del Backend
- **Estado:** Aceptada
- **Fecha de registro:** Fase 2 — Actualización tecnológica

**Contexto:** L-03 (Lógica de Aplicación) y L-04 (Dominio) requieren un framework que respete la arquitectura modular, soporte inyección de dependencias (Repository Pattern), y permita mantener la separación entre capas definida en ADR-002 y ADR-003.

**Alternativas evaluadas:**
1. Express.js — sin estructura impuesta, riesgo de deuda técnica
2. Fastify — ecosistema de plugins menor para un dominio complejo
3. NestJS — módulos decorados, DI integrada, estructura por capas nativa

**Decisión tomada:** NestJS con TypeScript. Cada módulo funcional de `03-ModulosSistema.md` se implementa como un módulo NestJS.

**Justificación:** La estructura de módulos de NestJS mapea 1:1 con los módulos del diseño. DI integrada implementa el Repository Pattern de L-04 sin código de infraestructura adicional. Satisface RNF-17 (mantenibilidad modular).

**Consecuencias:**
- Ventajas: estructura impuesta = consistencia del equipo; DI facilita tests unitarios de L-04
- Desventajas/Compromisos: curva de aprendizaje de decoradores y metadatos para nuevos integrantes
- Impactos: backend se despliega como proceso Node.js en Render

---

## ADR-011: Selección de Prisma ORM y Neon PostgreSQL para L-05

- **ID:** ADR-011
- **Título:** Selección de Prisma ORM con Neon PostgreSQL para la capa de persistencia
- **Estado:** Aceptada
- **Fecha de registro:** Fase 2 — Actualización tecnológica

**Contexto:** L-05 requiere un motor de persistencia que satisfaga RN-04 (atomicidad Orden+Stock), RNF-12 (1M publicaciones), soporte de Prisma para type-safety y alineación con el modelo de datos de `05-DisenoBaseDatos.md`.

**Alternativas evaluadas:**
1. TypeORM + PostgreSQL tradicional — decorator-heavy, menor alineación schema-first
2. Drizzle + Supabase — ecosistema en maduración
3. Prisma ORM + Neon PostgreSQL serverless — schema como fuente de verdad, ACID, serverless scale

**Decisión tomada:** Prisma ORM como ORM con `schema.prisma` como única fuente de verdad del esquema. Neon PostgreSQL como motor de base de datos serverless en la nube.

**Justificación:** Prisma schema-first alinea directamente con `05-DisenoBaseDatos.md`. Las transacciones ACID de PostgreSQL satisfacen RN-04. Neon serverless satisface RNF-11.

**Consecuencias:**
- Ventajas: migraciones versionadas, type-safety completo, soporte Prisma+Neon oficial
- Desventajas/Compromisos: Neon puede tener latencia en conexiones en frío (mitigado con connection pooling)
- Impactos: `prisma migrate deploy` como paso obligatorio en el pipeline de despliegue

---

## ADR-012: Selección de JWT con Refresh Token y Argon2 para Autenticación

- **ID:** ADR-012
- **Título:** JWT con Access+Refresh Token y Argon2 para el sistema de autenticación
- **Estado:** Aceptada
- **Fecha de registro:** Fase 2 — Actualización tecnológica

**Contexto:** El sistema requiere autenticación stateless para habilitar escalabilidad horizontal (múltiples instancias del backend), con contraseñas almacenadas de forma segura (RNF-07) y tokens con expiración (RNF-09).

**Alternativas evaluadas:**
1. Sesiones en servidor — requiere sticky sessions, rompe escalabilidad horizontal
2. OAuth2 solo — añade complejidad de flujo sin beneficio directo para el alcance actual
3. JWT Access Token (15min) + Refresh Token (7 días) + Argon2

**Decisión tomada:** JWT stateless con dos tokens: Access Token de corta duración (15 minutos) y Refresh Token de larga duración (7 días). Contraseñas hasheadas con Argon2 (ganador PHC, resistente a GPU).

**Justificación:** JWT stateless satisface RNF-11 (escalabilidad horizontal sin sticky sessions). Argon2 satisface RNF-07. La combinación Access+Refresh cumple RNF-09 con buena UX.

**Consecuencias:**
- Ventajas: escalabilidad horizontal sin estado de sesión compartido; Argon2 es el estándar actual
- Desventajas/Compromisos: revocación de tokens requiere lista negra o esperar expiración natural
- Impactos: Guards NestJS verifican JWT en cada endpoint protegido; RBAC implementado mediante decoradores

---

## ADR-013: Interfaces de Abstracción para Proveedores de Inteligencia Artificial

- **ID:** ADR-013
- **Título:** Definición de interfaces abstractas para proveedores de IA en el backend
- **Estado:** Aceptada
- **Fecha de registro:** Fase 2 — Actualización tecnológica

**Contexto:** El Agente Inteligente depende de servicios de NLP y STT en el backend. Si la lógica de negocio se acopla a un proveedor específico, cualquier cambio de proveedor (costo, capacidades, disponibilidad) requeriría modificar L-03 o L-04, violando ADR-008. La síntesis de voz (TTS) se delega directamente al cliente para reducir costos y latencia.

**Alternativas evaluadas:**
1. Llamadas directas al proveedor desde L-02/L-03 — acoplamiento directo, rompe ADR-008
2. Abstracción solo a nivel de servicio — insuficiente para garantizar independencia del proveedor
3. Interfaces explícitas en L-05: LanguageModelProvider, SpeechToTextProvider. La síntesis de voz (TTS) se ejecuta de manera nativa en el navegador del cliente mediante la API Web Speech.

**Decisión tomada:** Dos interfaces abstractas en L-05 para NLP y STT con contratos de entrada/salida explícitos. Ningún nombre de proveedor puede aparecer en L-02, L-03 o L-04. Todo acceso a IA pasa exclusivamente por estas interfaces en el backend, mientras que la síntesis de voz se implementa localmente en el frontend.

**Justificación:** Extiende ADR-008 al dominio de IA. Permite adoptar o cambiar cualquier proveedor (LLM, STT) sin tocar la lógica de negocio. Satisface el principio de independencia del proveedor de `11-ArquitecturaTecnologica.md`.

**Consecuencias:**
- Ventajas: libertad de elegir el mejor proveedor para cada necesidad; zero cambios en L-04 al cambiar de proveedor
- Desventajas/Compromisos: cada nuevo proveedor requiere implementar su adaptador L-05
- Impactos: los tests del Agente (L-02/L-04) usan mocks de estas interfaces, no proveedores reales

---

## ADR-014: Estrategia de Pruebas con Jest, Supertest y Playwright

- **ID:** ADR-014
- **Título:** Suite de pruebas en tres niveles: Jest, Supertest y Playwright
- **Estado:** Aceptada
- **Fecha de registro:** Fase 2 — Actualización tecnológica

**Contexto:** La especificación en `/specs` incluye criterios de aceptación explícitos para cada requisito funcional. Es necesario una estrategia de pruebas que valide el dominio (L-04) de forma aislada, los contratos de API (06-DisenoAPI.md), y los flujos E2E del Agente.

**Alternativas evaluadas:**
1. Solo Jest — cubre dominio y API pero no flujos de usuario reales en el navegador
2. Vitest + Cypress — ecosistema válido pero Vitest menos maduro para NestJS
3. Jest (unitario/dominio) + Supertest (API) + Playwright (E2E)

**Decisión tomada:** Tres niveles complementarios: Jest para L-04 (dominio puro, sin efectos externos), Supertest para verificar los contratos de `06-DisenoAPI.md` en los endpoints del backend, Playwright para flujos E2E del Agente desde el navegador.

**Justificación:** Cada nivel cubre una capa de riesgo diferente. El nivel E2E con Playwright es crítico para el Agente, cuya correctitud no puede verificarse solo con tests unitarios.

**Consecuencias:**
- Ventajas: cobertura de L-04 sin mocks innecesarios; verificación de contratos API; detección de regresiones E2E
- Desventajas/Compromisos: Playwright E2E requiere entorno ejecutable para correr
- Impactos: la CI/CD pipeline ejecuta Jest+Supertest en cada PR; Playwright en despliegues a staging

---

## ADR-015: Despliegue en Cloudflare Pages, Render y Neon

- **ID:** ADR-015
- **Título:** Arquitectura de despliegue: Cloudflare Pages + Render + Neon PostgreSQL
- **Estado:** Aceptada
- **Fecha de registro:** Fase 2 — Actualización tecnológica

**Contexto:** El sistema tiene tres componentes desplegables: la SPA frontend (L-01), el backend API (L-03/L-04/L-05) y la base de datos. Cada componente tiene requisitos de disponibilidad (RNF-05) y escalabilidad (RNF-11) distintos.

**Alternativas evaluadas:**
1. Vercel (frontend + backend) — costo mayor a escala para procesos Node.js persistentes
2. AWS (EC2 + RDS) — complejidad operacional elevada para fase inicial
3. Cloudflare Pages (SPA) + Render (API) + Neon (DB) — especialización por componente, costo optimizado

**Decisión tomada:** Frontend en Cloudflare Pages (CDN global, archivos estáticos), backend en Render (PaaS Node.js con HTTPS automático), base de datos en Neon (PostgreSQL serverless gestionado).

**Justificación:** Cada plataforma es especialista en su componente. Cloudflare Pages entrega L-01 con latencia mínima global. Render provee HTTPS automático (RNF-08) y health checks. Neon gestiona PostgreSQL sin overhead operacional.

**Consecuencias:**
- Ventajas: HTTPS automático en ambas plataformas; escala independiente por componente; sin gestión de infraestructura
- Desventajas/Compromisos: tres plataformas = tres dashboards; Render puede tener cold starts
- Impactos: las variables de entorno sensibles (JWT_SECRET, DATABASE_URL) se configuran en Render, nunca en el repositorio

---

## ADR-016: Cloudinary para Almacenamiento de Imágenes de Publicaciones

- **ID:** ADR-016
- **Título:** Cloudinary como almacenamiento de objetos para imágenes de Publicaciones
- **Estado:** Aceptada
- **Fecha de registro:** Fase 2 — Actualización tecnológica

**Contexto:** RN-05 requiere que toda Publicación tenga al menos una imagen. Las imágenes no deben almacenarse en la base de datos (blobs degradan el rendimiento) ni en el servidor de la API (escala independiente del backend).

**Alternativas evaluadas:**
1. AWS S3 — costo de egress alto; mayor complejidad de configuración
2. Cloudflare R2 — sin costos de egress, pero requiere desarrollo adicional de pipelines de optimización
3. Cloudinary — servicio administrado para optimización y almacenamiento de imágenes con SDK integrado para NestJS.

**Decisión tomada:** Cloudinary para almacenar y servir las imágenes de las Publicaciones. El backend interactúa directamente con la API de Cloudinary a través de su SDK para gestionar la subida y generación de URLs de forma segura.

**Justificación:** Cloudinary provee optimización automática de imágenes (compresión, redimensionamiento), entrega rápida vía CDN global y un SDK de Node.js maduro que simplifica el desarrollo de infraestructura en L-05. La abstracción a través de la interfaz `IStorageProvider` permite reemplazar el proveedor de almacenamiento cambiando solo el adaptador L-05.

**Consecuencias:**
- Ventajas: Optimización automática y entrega rápida; SDK maduro y fácil integración.
- Desventajas/Compromisos: Dependencia de un servicio administrado (mitigado mediante la interfaz abstracta `IStorageProvider` / `StorageProvider`).
- Impactos: El backend utiliza el SDK de Cloudinary para subir las imágenes directamente.

---

## Tabla Resumen Actualizada (ADR-009 a ADR-016)

| ADR | Título | Estado | Requisitos relacionados |
|-----|--------|--------|------------------------|
| ADR-009 | React 19 + Vite para L-01 | Aceptada | RF-01, RF-02, RNF-14, RNF-15, RNF-16 |
| ADR-010 | NestJS para L-03 y L-04 | Aceptada | RNF-17, RNF-11, ADR-003 |
| ADR-011 | Prisma ORM + Neon PostgreSQL para L-05 | Aceptada | RN-04, RNF-11, RNF-12, RD-01 a RD-18 |
| ADR-012 | JWT + Refresh Token + Argon2 | Aceptada | RNF-07, RNF-09, RN-08, RF-12 |
| ADR-013 | Interfaces de abstracción IA | Aceptada | RF-01, RF-02, ADR-008 |
| ADR-014 | Jest + Supertest + Playwright | Aceptada | OBJ-01 a OBJ-06 |
| ADR-015 | Cloudflare Pages + Render + Neon | Aceptada | RNF-05, RNF-08, RNF-11 |
| ADR-016 | Cloudinary para imágenes | Aceptada | RN-05, RF-09 |
