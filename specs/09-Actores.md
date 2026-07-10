# Actores del Sistema — Marketplace Inteligente Asistido por IA

## 1. Introducción

Este documento define con precisión todos los actores del sistema, sus responsabilidades, permisos, acciones permitidas y restricciones. Los actores se clasifican en **actores internos** (interactúan directamente con el sistema) y **actores externos** (servicios externos con los que el sistema se integra).

---

## 2. Actores Internos

### ACT-01 — Visitante

| Campo | Descripción |
|---|---|
| **ID** | ACT-01 |
| **Nombre** | Visitante |
| **Definición** | Usuario no autenticado que accede al Marketplace sin haber iniciado sesión. |
| **Objetivo** | Explorar el Catálogo de productos y evaluar el Marketplace antes de registrarse. |
| **Responsabilidades** | Ninguna responsabilidad operativa sobre el sistema. |

#### Acciones Permitidas — Visitante

| # | Acción |
|---|---|
| 1 | Explorar el Catálogo de Publicaciones |
| 2 | Ver el detalle de una Publicación |
| 3 | Utilizar el Agente Inteligente en modo de solo búsqueda y exploración |
| 4 | Registrarse como Comprador o Vendedor |
| 5 | Iniciar sesión si ya tiene cuenta registrada |

#### Restricciones — Visitante

| # | Restricción |
|---|---|
| 1 | No puede agregar productos al Carrito |
| 2 | No puede iniciar el proceso de compra |
| 3 | No puede publicar productos |
| 4 | No puede acceder a historial de Órdenes |
| 5 | No puede configurar preferencias de notificación |

---

### ACT-02 — Comprador

| Campo | Descripción |
|---|---|
| **ID** | ACT-02 |
| **Nombre** | Comprador |
| **Definición** | Usuario autenticado registrado con el rol de Comprador. |
| **Objetivo** | Encontrar, evaluar y adquirir productos dentro del Marketplace mediante instrucciones al Agente Inteligente o navegación directa. |
| **Responsabilidades** | Proveer instrucciones precisas al Agente. Confirmar las acciones irreversibles. Mantener actualizada la información de pago y dirección de entrega. |

#### Acciones Permitidas — Comprador

| # | Acción |
|---|---|
| 1 | Todas las acciones del Visitante |
| 2 | Instruir al Agente Inteligente mediante texto |
| 3 | Instruir al Agente Inteligente mediante voz |
| 4 | Agregar, modificar y eliminar productos del Carrito |
| 5 | Iniciar y confirmar el proceso de compra |
| 6 | Ver su historial de Órdenes |
| 7 | Configurar sus preferencias de notificación |
| 8 | Gestionar su perfil (datos personales, dirección, método de pago) |
| 9 | Cerrar su sesión |

#### Restricciones — Comprador

| # | Restricción |
|---|---|
| 1 | No puede publicar productos en el Catálogo |
| 2 | No puede ver ni modificar órdenes de otros Compradores |
| 3 | No puede acceder al panel de administración |
| 4 | No puede modificar el estado de una Orden una vez registrada |
| 5 | No puede ejecutar la compra sin confirmar explícitamente la acción (RN-01) |

---

### ACT-03 — Vendedor

| Campo | Descripción |
|---|---|
| **ID** | ACT-03 |
| **Nombre** | Vendedor |
| **Definición** | Usuario autenticado registrado con el rol de Vendedor. |
| **Objetivo** | Publicar productos en el Catálogo, gestionar su oferta y atender las Órdenes de los Compradores. |
| **Responsabilidades** | Mantener el Catálogo de sus Publicaciones actualizado y con información veraz. Atender las Órdenes dentro de los plazos establecidos (RN-07). Actualizar el estado de las Órdenes recibidas. |

#### Acciones Permitidas — Vendedor

| # | Acción |
|---|---|
| 1 | Crear Publicaciones con todos los campos obligatorios |
| 2 | Modificar el precio, stock, descripción e imágenes de sus Publicaciones |
| 3 | Desactivar sus Publicaciones |
| 4 | Ver las Órdenes recibidas que incluyen sus productos |
| 5 | Actualizar el estado de sus Órdenes |
| 6 | Recibir notificaciones de nuevas Órdenes |
| 7 | Configurar sus preferencias de notificación |
| 8 | Gestionar su perfil |
| 9 | Cerrar su sesión |

#### Restricciones — Vendedor

| # | Restricción |
|---|---|
| 1 | No puede ver ni modificar Publicaciones de otros Vendedores |
| 2 | No puede ver los datos personales de los Compradores más allá de los necesarios para la entrega |
| 3 | No puede acceder al panel de administración |
| 4 | No puede cancelar una Orden unilateralmente sin escalamiento al Administrador |
| 5 | No puede publicar productos con precio igual o menor a cero (RN-06) |
| 6 | No puede publicar productos con campos obligatorios incompletos (RN-05) |

---

### ACT-04 — Administrador

| Campo | Descripción |
|---|---|
| **ID** | ACT-04 |
| **Nombre** | Administrador |
| **Definición** | Usuario autenticado con el rol de Administrador del Marketplace. |
| **Objetivo** | Supervisar la operación del Marketplace, hacer cumplir las políticas de uso y resolver incidencias que no pueden ser atendidas por Compradores o Vendedores. |
| **Responsabilidades** | Moderar el contenido del Catálogo. Gestionar las cuentas de usuarios. Resolver Órdenes escaladas. Mantener la calidad operativa del Marketplace. |

#### Acciones Permitidas — Administrador

| # | Acción |
|---|---|
| 1 | Ver, suspender y reactivar cuentas de Compradores |
| 2 | Ver, suspender y reactivar cuentas de Vendedores (con efecto cascada sobre Publicaciones, RN-10) |
| 3 | Eliminar Publicaciones que incumplan las políticas del Marketplace |
| 4 | Ver y gestionar todas las Órdenes del Marketplace |
| 5 | Recibir y resolver Órdenes escaladas |
| 6 | Acceder a reportes agregados de ventas, usuarios y Órdenes |
| 7 | Gestionar su propio perfil |
| 8 | Cerrar su sesión |

#### Restricciones — Administrador

| # | Restricción |
|---|---|
| 1 | No puede modificar Publicaciones de Vendedores, solo eliminarlas |
| 2 | No puede modificar los datos de pago de un Comprador |
| 3 | No puede ejecutar compras en nombre de un Comprador |
| 4 | No puede crear cuentas de otros Administradores sin autorización del proceso establecido |

---

## 3. Actores Externos

### ACT-05 — Proveedor de IA (NLP)

| Campo | Descripción |
|---|---|
| **ID** | ACT-05 |
| **Nombre** | Proveedor de IA (NLP) |
| **Definición** | Servicio externo que provee las capacidades de procesamiento de lenguaje natural. |
| **Interacción con el sistema** | Recibe el texto de las instrucciones del Comprador y retorna la intención identificada, las entidades extraídas y el nivel de confianza. |
| **Dependencias** | RF-01, RF-02 |

---

### ACT-06 — Servicio STT

| Campo | Descripción |
|---|---|
| **ID** | ACT-06 |
| **Nombre** | Servicio STT (Speech-to-Text) |
| **Definición** | Servicio externo que convierte el audio de voz del Comprador en texto. |
| **Interacción con el sistema** | Recibe el audio capturado y retorna la transcripción en texto con su nivel de confianza. |
| **Dependencias** | RF-02, RN-11 |

---

### ACT-07 — Servicio TTS

| Campo | Descripción |
|---|---|
| **ID** | ACT-07 |
| **Nombre** | Servicio TTS (Text-to-Speech) |
| **Definición** | Servicio externo que convierte el texto de las respuestas del Agente en audio. |
| **Interacción con el sistema** | Recibe el texto de la respuesta del Agente y retorna el audio sintetizado para ser reproducido al Comprador. |
| **Dependencias** | RF-02 |

---

### ACT-08 — Pasarela de Pago

| Campo | Descripción |
|---|---|
| **ID** | ACT-08 |
| **Nombre** | Pasarela de Pago |
| **Definición** | Servicio externo que procesa las transacciones financieras. |
| **Interacción con el sistema** | Recibe la solicitud de cobro del Marketplace y retorna la confirmación o rechazo del pago. |
| **Dependencias** | RF-08, RN-03 |

---

### ACT-09 — Sistema de Notificaciones

| Campo | Descripción |
|---|---|
| **ID** | ACT-09 |
| **Nombre** | Sistema de Notificaciones externo |
| **Definición** | Servicio externo (correo electrónico, mensajería) para la entrega de notificaciones a usuarios. |
| **Interacción con el sistema** | Recibe las solicitudes de notificación del Marketplace y las entrega al destinatario. |
| **Dependencias** | RF-08, RF-10, RN-12 |
