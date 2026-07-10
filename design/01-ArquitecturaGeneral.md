# Arquitectura General — Marketplace Inteligente Asistido por IA

## 1. Objetivos de la Arquitectura

La arquitectura del Marketplace Inteligente busca satisfacer los siguientes objetivos estructurales:

- **Escalabilidad horizontal**: soportar hasta 2.000 usuarios concurrentes activos sin degradar los tiempos de respuesta definidos en RNF-11, y crecer más allá de ese umbral con cambios de configuración, no de diseño.
- **Alta disponibilidad**: garantizar una disponibilidad mensual mínima del 99,5 % (RNF-05), equivalente a no más de 3 horas y 40 minutos de inactividad no planificada por mes.
- **Modularidad y mantenibilidad**: cada grupo funcional es un módulo independiente con responsabilidades delimitadas, reemplazable sin afectar al resto del sistema (RNF-17).
- **Degradación controlada**: cuando un servicio externo falla, el sistema continúa operando con las funcionalidades que no dependen de ese servicio (RNF-06).
- **Seguridad por diseño**: los controles de autenticación, autorización y protección de datos se aplican en capas estructurales, no como agregados posteriores (RNF-07 a RNF-10).
- **Observabilidad**: el sistema registra los eventos operativos suficientes para diagnosticar incidentes y auditar operaciones críticas (RNF-17).

---

## 2. Principios Arquitectónicos

| # | Principio | Descripción |
|---|---|---|
| P-01 | Separación de responsabilidades | Cada capa y módulo tiene una única razón para cambiar. |
| P-02 | Bajo acoplamiento | Los módulos se comunican a través de interfaces bien definidas; no acceden directamente a los internos de otro módulo. |
| P-03 | Alta cohesión | Los elementos relacionados se agrupan en el mismo módulo funcional. |
| P-04 | Defensa en profundidad | Los controles de seguridad se aplican en cada capa: presentación, aplicación, dominio e infraestructura. |
| P-05 | Degradación controlada | La falla de un servicio externo no debe colapsar los flujos que no lo requieren. |
| P-06 | Trazabilidad de operaciones | Toda acción relevante genera un registro con marca temporal, identidad y resultado. |
| P-07 | Diseño orientado al dominio | La lógica de negocio reside en la capa de dominio; las capas externas no toman decisiones de negocio. |
| P-08 | Modularidad evolutiva | El sistema se puede extender con nuevos módulos o reemplazar módulos existentes sin reescribir la arquitectura base. |


---

## 3. Estilo Arquitectónico Seleccionado

El sistema adopta una **Arquitectura en Capas con separación por dominios funcionales**. Las integraciones con servicios externos se gestionan a través de **puertos y adaptadores**, de modo que el núcleo del sistema no depende de ninguna implementación concreta de los servicios de terceros.

Este estilo organiza el sistema en capas horizontales con dirección de dependencia de afuera hacia adentro: las capas exteriores conocen a las interiores, pero nunca al revés. Dentro de cada capa, el sistema se organiza en módulos funcionales verticales (dominios), cada uno con su propia lógica de aplicación y de dominio.

---

## 4. Justificación del Estilo

| Requisito | Necesidad que origina la decisión |
|---|---|
| RNF-05 | La disponibilidad del 99,5 % exige que los módulos puedan reiniciarse o reemplazarse sin detener el sistema completo. La arquitectura en capas con módulos independientes lo habilita. |
| RNF-06 | La degradación controlada requiere que las integraciones externas estén aisladas detrás de adaptadores; si el adaptador falla, el núcleo no se ve afectado. |
| RNF-11 | La escalabilidad ante 2.000 usuarios concurrentes requiere que cada capa pueda escalar de forma independiente. |
| RNF-12 | La escalabilidad del Catálogo requiere que el módulo de búsqueda sea independiente y pueda optimizarse sin afectar al resto del sistema. |
| RNF-17 | La mantenibilidad exige que los módulos tengan responsabilidades claras y fronteras definidas, facilitando el diagnóstico y la modificación. |

---

## 5. Vista Lógica — Capas del Sistema

| Capa | Nombre | Responsabilidad Principal |
|---|---|---|
| L-01 | Presentación e Interacción | Recibe las solicitudes de los usuarios (texto, voz, formularios) y presenta las respuestas. No contiene lógica de negocio. |
| L-02 | Agente Inteligente | Interpreta instrucciones en lenguaje natural, identifica intenciones y entidades, mantiene el Contexto de Sesión y coordina la ejecución de acciones. |
| L-03 | Lógica de Aplicación | Orquesta los flujos de negocio, coordina los módulos funcionales y aplica las reglas de autorización. |
| L-04 | Dominio | Contiene las entidades, los objetos de valor, los agregados y los servicios de dominio. Es el núcleo del sistema y no depende de ninguna capa exterior. |
| L-05 | Infraestructura e Integraciones | Gestiona la persistencia de datos y la comunicación con los servicios externos mediante adaptadores. |


---

## 6. Vista Funcional — Grupos Funcionales

| Grupo | Módulos que lo componen | Descripción |
|---|---|---|
| Gestión de Identidad | Autenticación, Usuarios | Registro, autenticación, gestión de sesiones y control de acceso por rol. |
| Catálogo y Búsqueda | Productos, Categorías, Inventario, Búsquedas | Publicación, descubrimiento, filtrado y ordenamiento de productos. |
| Agente Conversacional | Conversaciones, Agente Inteligente | Interpretación de lenguaje natural, gestión de contexto, ejecución de acciones. |
| Transacciones | Carrito, Pedidos, Pagos | Gestión del carrito, proceso de compra y coordinación con la Pasarela de Pago. |
| Administración | Administración, Vendedores, Compradores | Gestión de cuentas, moderación de publicaciones, reportes y resolución de escalamientos. |
| Observabilidad | Auditoría, Notificaciones | Registro de eventos, trazabilidad de operaciones, entrega de notificaciones a usuarios. |

---

## 7. Vista Conceptual — Perspectiva de Despliegue

Desde una perspectiva de despliegue, el sistema se organiza en tres zonas conceptuales:

**Zona de Frontera**: componentes que reciben solicitudes de los usuarios (texto y voz) y de los servicios externos (pasarela de pago, STT, TTS). Esta zona expone las interfaces de entrada al sistema y aplica los primeros controles de seguridad.

**Zona de Procesamiento**: componentes que ejecutan la lógica de aplicación y de dominio. Aquí reside el Agente Inteligente, los módulos funcionales y los servicios de dominio. Esta zona no es directamente accesible desde el exterior.

**Zona de Persistencia e Integración**: componentes que almacenan el estado del sistema y los adaptadores que se comunican con los servicios externos. Las dependencias externas (NLP, STT, TTS, Pasarela de Pago, Notificaciones) se acceden únicamente desde esta zona.

---

## 8. Separación por Capas — Detalle de Responsabilidades

**Capa de Presentación e Interacción (L-01)**
Responsable de capturar la entrada del usuario (texto escrito, audio de voz, formularios) y de presentar la respuesta del sistema (resultados, confirmaciones, mensajes de error). No toma decisiones de negocio. Aplica controles de accesibilidad (RNF-15, RNF-16) y provee retroalimentación visual durante el procesamiento (RNF-14).

**Capa del Agente Inteligente (L-02)**
Responsable de interpretar las instrucciones del usuario en lenguaje natural. Recibe texto (desde L-01 directamente o tras transcripción STT), determina la intención, extrae entidades y restricciones, mantiene el Contexto de Sesión y delega la ejecución a la Capa de Aplicación (L-03). Gestiona la expiración de sesión por inactividad (RN-14) y verifica el umbral de confianza del STT (RN-11).

**Capa de Lógica de Aplicación (L-03)**
Responsable de orquestar los flujos de negocio. Recibe instrucciones del Agente o solicitudes directas de los actores, aplica las reglas de autorización por rol, coordina los módulos funcionales y delega las reglas de negocio a la Capa de Dominio (L-04).

**Capa de Dominio (L-04)**
Responsable de las invariantes del negocio. Contiene las entidades (Usuario, Publicación, Orden, Carrito), los objetos de valor, los agregados y los servicios de dominio. No conoce cómo se presentan los datos ni cómo se persisten.

**Capa de Infraestructura e Integraciones (L-05)**
Responsable de la persistencia de datos y de la comunicación con los servicios externos. Los adaptadores de esta capa implementan los puertos definidos en la Capa de Dominio, desacoplando el núcleo de las tecnologías de soporte.


---

## 9. Flujo de Comunicación

El flujo de solicitudes sigue una dirección única de afuera hacia adentro:

```
Usuario
  └─► Capa de Presentación (L-01)
        └─► Capa del Agente Inteligente (L-02)
              └─► Capa de Lógica de Aplicación (L-03)
                    └─► Capa de Dominio (L-04)
                          └─► Capa de Infraestructura e Integraciones (L-05)
                                └─► Servicios Externos
                                    (NLP, STT, TTS, Pasarela de Pago, Notificaciones)
```

La respuesta recorre el camino inverso: cada capa retorna el resultado a la capa que la invocó. Ninguna capa interna invoca directamente a una capa más externa.

---

## 10. Flujo de Dependencias

Las dependencias de compilación y ejecución siguen la regla de dependencia estricta: las capas externas dependen de las internas, nunca al revés.

- L-01 depende de L-02 y L-03.
- L-02 depende de L-03.
- L-03 depende de L-04.
- L-04 no depende de ninguna otra capa del sistema.
- L-05 depende de L-04 (implementa los puertos definidos en el dominio) y expone adaptadores a los servicios externos.

Este diseño garantiza que el núcleo del dominio (L-04) pueda ser probado de forma aislada y que los adaptadores externos (L-05) puedan reemplazarse sin modificar la lógica de negocio.

---

## 11. Restricciones Arquitectónicas

| ID | Restricción | Origen |
|---|---|---|
| RA-01 | Ningún módulo accede directamente a la capa de persistencia de otro módulo. | P-02 |
| RA-02 | Los servicios externos solo son invocados desde los adaptadores de la Capa de Infraestructura. | RNF-06 |
| RA-03 | Los datos de tarjetas de pago nunca se almacenan en el sistema; solo se conservan identificadores de referencia de la Pasarela. | RNF-10 |
| RA-04 | Las contraseñas nunca se transmiten ni almacenan en texto plano. | RNF-07, RNF-08 |
| RA-05 | Los registros de auditoría no incluyen datos personales ni datos de pago. | RNF-17 |
| RA-06 | El Contexto de Sesión del Agente expira tras 30 minutos de inactividad. | RN-14 |
| RA-07 | La compra requiere confirmación explícita del Comprador antes de invocar la Pasarela de Pago. | RN-01 |
| RA-08 | El decremento de stock y el registro de la Orden son operaciones atómicas dentro del mismo proceso. | RN-04 |


---

## 12. Escalabilidad

Para soportar RNF-11 (2.000 usuarios concurrentes) y RNF-12 (Catálogo con hasta 1.000.000 de Publicaciones):

- **Módulos independientes**: cada grupo funcional puede escalar de forma autónoma según su demanda. El módulo de Búsquedas puede incrementar su capacidad sin afectar al módulo de Pagos.
- **Separación del Agente Inteligente**: la capa L-02 es independiente y puede aumentar su capacidad de procesamiento sin modificar el resto del sistema.
- **Módulo de Catálogo y Búsqueda optimizado**: el diseño del módulo de Búsquedas contempla que el tiempo de respuesta no debe degradarse más de un 20 % al crecer de 100.000 a 1.000.000 de publicaciones activas (RNF-12).
- **Sin estado compartido entre solicitudes**: el diseño evita el estado compartido entre sesiones de usuario, lo que permite distribuir la carga entre múltiples instancias del mismo módulo.

---

## 13. Disponibilidad

Para satisfacer RNF-05 (99,5 % mensual) y RNF-06 (degradación controlada):

- **Módulos aislados por fallo**: la falla de un módulo no se propaga en cascada. El módulo de Pagos puede fallar sin afectar la capacidad de búsqueda del Catálogo.
- **Adaptadores con manejo de fallo**: los adaptadores de servicios externos (STT, TTS, NLP, Pasarela) implementan lógica de degradación: si el servicio no responde, el adaptador retorna una señal de fallo controlada y el sistema activa el modo degradado correspondiente.
- **Modo degradado por servicio externo**:
  - Si STT no está disponible: la modalidad de texto continúa funcionando con normalidad.
  - Si TTS no está disponible: el Agente responde solo en texto.
  - Si el Proveedor de NLP no está disponible: el Agente informa el estado y el Marketplace opera mediante navegación manual.
  - Si la Pasarela de Pago no está disponible: el flujo de compra queda en espera con el Carrito preservado.

---

## 14. Seguridad desde la Arquitectura

| Requisito | Decisión arquitectónica |
|---|---|
| RNF-07 — Contraseñas cifradas | Las contraseñas se procesan en la Capa de Dominio mediante una función de derivación con sal; nunca salen de esa capa en texto plano. |
| RNF-08 — Tráfico cifrado | Toda comunicación entre zonas (frontera, procesamiento, integración) utiliza protocolos cifrados; el adaptador de red de L-01 rechaza conexiones no cifradas. |
| RNF-09 — Gestión de sesiones | Los tokens de acceso se emiten y validan en el módulo de Autenticación con vida útil máxima de 24 horas; el cierre de sesión invalida el token de inmediato. |
| RNF-10 — Protección de datos de pago | Los datos de tarjetas nunca atraviesan L-03 ni L-04; el adaptador de Pasarela en L-05 recibe solo el importe y el método referenciado. |

Adicionalmente, el principio P-04 (defensa en profundidad) aplica controles en cada capa: L-01 valida el formato de entrada, L-03 verifica autorización por rol antes de ejecutar cualquier operación, L-04 aplica invariantes del dominio y L-05 valida los datos antes de persistirlos.

---

## 15. Modularidad

Cada módulo funcional (Autenticación, Catálogo, Agente, Carrito, Pedidos, Pagos, Notificaciones, Auditoría, Administración) cumple tres condiciones de modularidad:

1. **Interfaz pública definida**: los otros módulos interactúan con él únicamente a través de su interfaz conceptual, no accediendo a su estado interno.
2. **Independencia de implementación**: el módulo puede ser reemplazado por una implementación diferente sin modificar los módulos que lo consumen.
3. **Responsabilidad única**: el módulo tiene un único propósito funcional claramente delimitado por las especificaciones del dominio.


---

## 16. Mantenibilidad

Derivada de RNF-17, la arquitectura garantiza la mantenibilidad mediante:

- **Registro de eventos estructurado**: cada módulo emite eventos de auditoría con marca temporal, identificador de usuario y resultado, sin incluir datos sensibles. Esto facilita el diagnóstico de incidentes sin necesidad de acceder a los datos de producción.
- **Módulos de responsabilidad única**: el impacto de un cambio en un módulo se circunscribe a ese módulo y su interfaz pública.
- **Dependencias unidireccionales**: la regla de dependencia garantiza que modificar una capa interna no fuerza cambios en las capas externas, y que agregar un nuevo adaptador externo no requiere modificar la lógica de dominio.
- **Separación del Agente Inteligente en su propia capa (L-02)**: permite evolucionar las capacidades de interpretación de lenguaje natural de forma independiente del resto de los módulos funcionales.

---

## 17. Observabilidad

El sistema registra como mínimo los siguientes eventos, tal como establece RNF-17:

- Autenticaciones exitosas y fallidas (con identificador de cuenta y resultado).
- Instrucciones recibidas por el Agente Inteligente, intención identificada y resultado de la ejecución.
- Creación, modificación y cambio de estado de Publicaciones.
- Registro de Órdenes, cambios de estado y escalamientos.
- Errores en integraciones con servicios externos (NLP, STT, TTS, Pasarela de Pago, Notificaciones).

Cada registro incluye marca temporal e identificador de usuario. Los datos personales, contraseñas y datos de pago están excluidos de los registros.

La trazabilidad de sesiones permite reconstruir el flujo completo de una interacción: instrucción recibida → intención identificada → acción ejecutada → resultado presentado.

---

## 18. Trazabilidad con la Especificación

| Decisión Arquitectónica | Requisito que la origina |
|---|---|
| Arquitectura en capas con módulos independientes | RNF-11, RNF-12 (escalabilidad) |
| Disponibilidad 99,5 % con módulos aislados por fallo | RNF-05 |
| Adaptadores de servicios externos con degradación controlada | RNF-06 |
| Contraseñas cifradas con función de derivación con sal | RNF-07 |
| Todo el tráfico mediante protocolos cifrados | RNF-08 |
| Tokens de sesión con vida útil máxima de 24 horas | RNF-09 |
| Datos de pago no almacenados en el sistema | RNF-10 |
| Módulo de Auditoría con registro estructurado | RNF-17 |
| Confirmación obligatoria antes de invocar Pasarela de Pago | RN-01 |
| Decremento atómico de stock al registrar Orden | RN-04 |
| Expiración del Contexto de Sesión por inactividad | RN-14 |
| Suspensión en cascada de Publicaciones al suspender Vendedor | RN-10 |
| Capa del Agente Inteligente independiente | OBJ-01, OBJ-02, OBJ-03, OBJ-04 |
| Principio de defensa en profundidad en todas las capas | OBJ-06 |

---

## 19. Decisiones Tecnológicas por Capa

> Esta sección fue agregada durante la actualización tecnológica de la Fase 2. Detalla las tecnologías asignadas a cada capa arquitectónica. La justificación completa se encuentra en `11-ArquitecturaTecnologica.md`.

| Capa | Tecnologías |
|---|---|
| L-01 — Presentación e Interacción | React 19, TypeScript, Vite, Tailwind CSS, Shadcn/ui, Zustand, TanStack Query, React Hook Form, Zod (cliente), Axios, React Router DOM |
| L-02 — Agente Inteligente | Implementado como módulo NestJS (AgentModule) en el backend; estado del Agente gestionado con Zustand en el frontend |
| L-03 — Lógica de Aplicación | NestJS (services, controllers, RBAC Guards), class-validator, class-transformer, JWT validation |
| L-04 — Dominio | NestJS (domain entities y domain services sin dependencias externas), TypeScript |
| L-05 — Infraestructura | Prisma ORM, Neon PostgreSQL, Argon2, JWT (emisión), adaptadores LanguageModelProvider / SpeechToTextProvider / TextToSpeechProvider, Cloudflare R2 |
| Despliegue L-01 | Cloudflare Pages (CDN global) |
| Despliegue L-03/L-04/L-05 | Render (PaaS Node.js) |
| Base de datos | Neon PostgreSQL (serverless) |
| Almacenamiento | Cloudflare R2 (compatible S3) |

**Nueva restricción arquitectónica agregada (RA-09):**
El nombre de ningún proveedor de IA (NLP, STT, TTS) puede aparecer en las capas L-02, L-03 o L-04. Solo los adaptadores de L-05 conocen el proveedor concreto. Toda sustitución de proveedor ocurre únicamente en L-05.
