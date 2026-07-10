# Partes Interesadas — Marketplace Inteligente Asistido por IA

## 1. Introducción

Este documento identifica y describe a todas las partes interesadas (**stakeholders**) del Marketplace Inteligente: actores internos que interactúan directamente con el sistema y actores externos que proveen servicios o tienen interés en los resultados del sistema. Para cada parte interesada se definen sus objetivos, necesidades, expectativas y nivel de influencia.

---

## 2. Partes Interesadas Internas

### STK-01 — Comprador

| Campo | Descripción |
|---|---|
| **Definición** | Usuario registrado que accede al Marketplace con el propósito de buscar, explorar y adquirir productos. |
| **Objetivos** | Encontrar productos que satisfagan sus necesidades al mejor precio con el menor esfuerzo posible. |
| **Necesidades** | Interacción simple y natural; resultados relevantes; proceso de compra ágil; confianza en la seguridad de sus datos y pagos. |
| **Expectativas** | Que el Agente Inteligente comprenda sus instrucciones con precisión y ejecute las acciones correctas. Que la experiencia sea consistente entre texto y voz. |
| **Nivel de influencia** | Alto — Es el usuario primario del sistema y el principal generador de valor económico. |
| **Preocupaciones** | Que el Agente ejecute acciones no deseadas (ej. compras accidentales). Que sus datos de pago no estén seguros. |

---

### STK-02 — Vendedor

| Campo | Descripción |
|---|---|
| **Definición** | Usuario registrado que accede al Marketplace con el propósito de publicar productos y gestionar sus ventas. |
| **Objetivos** | Llegar a la mayor cantidad de Compradores posible, gestionar su catálogo con facilidad y cobrar sus ventas de forma segura. |
| **Necesidades** | Herramientas simples para publicar y actualizar productos. Visibilidad sobre el estado de sus órdenes. Notificaciones oportunas de nuevas ventas. |
| **Expectativas** | Que sus publicaciones sean descubribles por el Agente Inteligente. Que el proceso de cobro sea confiable. |
| **Nivel de influencia** | Alto — Es quien genera el Catálogo de productos, sin Vendedores el Marketplace no tiene oferta. |
| **Preocupaciones** | Que sus productos no aparezcan correctamente en los resultados del Agente. Que las órdenes no sean notificadas a tiempo. |

---

### STK-03 — Administrador

| Campo | Descripción |
|---|---|
| **Definición** | Usuario con privilegios especiales responsable de la supervisión y gestión operativa del Marketplace. |
| **Objetivos** | Garantizar el cumplimiento de las políticas del Marketplace, resolver incidencias y mantener la calidad del Catálogo. |
| **Necesidades** | Acceso completo a usuarios, publicaciones y órdenes. Herramientas de moderación y reportes de actividad. |
| **Expectativas** | Capacidad de tomar acción inmediata ante incumplimientos. Información consolidada y actualizada del estado del sistema. |
| **Nivel de influencia** | Alto — Controla la operación y puede intervenir en cualquier flujo del sistema. |
| **Preocupaciones** | Que las publicaciones incumplan las políticas sin ser detectadas. Que las órdenes escalen sin resolución oportuna. |

---

### STK-04 — Visitante

| Campo | Descripción |
|---|---|
| **Definición** | Usuario no autenticado que accede al Marketplace para explorar productos sin registrarse ni realizar transacciones. |
| **Objetivos** | Explorar el Catálogo y evaluar si desea registrarse para realizar una compra. |
| **Necesidades** | Acceso al Catálogo sin barreras. Información de productos visible. Proceso de registro claro. |
| **Expectativas** | Que la transición de Visitante a Comprador sea sencilla e incentivada. |
| **Nivel de influencia** | Medio — Representa usuarios potenciales que pueden convertirse en Compradores. |
| **Preocupaciones** | Que el proceso de registro sea demasiado largo o requiera información sensible antes de poder explorar. |

---

### STK-05 — Operador del Sistema

| Campo | Descripción |
|---|---|
| **Definición** | Equipo técnico responsable del despliegue, mantenimiento y monitoreo del Marketplace en producción. |
| **Objetivos** | Garantizar la disponibilidad, el rendimiento y la seguridad del sistema. |
| **Necesidades** | Acceso a registros de actividad (logs). Herramientas de monitoreo. Capacidad de intervención ante incidentes. |
| **Expectativas** | Que el sistema provea interfaces de observabilidad suficientes. Que los errores sean registrados con detalle. |
| **Nivel de influencia** | Alto — Tiene control sobre el entorno de ejecución del sistema. |
| **Preocupaciones** | Fallos en cascada por dependencias externas. Falta de alertas tempranas ante degradación del servicio. |

---

## 3. Partes Interesadas Externas

### STK-06 — Proveedor del Servicio de Inteligencia Artificial

| Campo | Descripción |
|---|---|
| **Definición** | Servicio externo que provee las capacidades de procesamiento de lenguaje natural utilizadas por el Agente Inteligente para interpretar instrucciones. |
| **Objetivos** | Proveer respuestas precisas y con baja latencia a las solicitudes de interpretación. |
| **Necesidades** | Recibir las instrucciones del usuario en el formato esperado por su interfaz. |
| **Expectativas** | Que el sistema consuma su servicio según los términos de uso y respete los límites de cuota. |
| **Nivel de influencia** | Alto — La calidad del Agente Inteligente depende directamente del rendimiento de este proveedor. |
| **Preocupaciones** | Uso fuera de los términos de servicio. Envío de datos sensibles del usuario al servicio sin consentimiento. |

---

### STK-07 — Proveedor del Servicio STT (Speech-to-Text)

| Campo | Descripción |
|---|---|
| **Definición** | Servicio externo que convierte las instrucciones de voz del usuario en texto para ser procesadas por el Agente Inteligente. |
| **Objetivos** | Proveer transcripciones precisas y con baja latencia. |
| **Necesidades** | Recibir audio de calidad suficiente y en el formato esperado. |
| **Expectativas** | Que el sistema informe al usuario cuando la transcripción no tenga suficiente confianza. |
| **Nivel de influencia** | Medio — Afecta la modalidad de voz, pero el sistema puede operar sin ella en modo texto. |
| **Preocupaciones** | Audio de baja calidad que degrada la precisión de la transcripción. |

---

### STK-08 — Proveedor del Servicio TTS (Text-to-Speech)

| Campo | Descripción |
|---|---|
| **Definición** | Servicio externo que convierte las respuestas del Agente Inteligente en audio de voz para ser reproducido al usuario. |
| **Objetivos** | Generar audio claro, natural y con baja latencia. |
| **Necesidades** | Recibir el texto a sintetizar en el idioma correcto y con las indicaciones de énfasis necesarias. |
| **Expectativas** | Que el sistema solo solicite síntesis de voz cuando la modalidad de voz esté activa. |
| **Nivel de influencia** | Bajo — Su fallo afecta la respuesta auditiva, pero no bloquea el flujo funcional en modo texto. |
| **Preocupaciones** | Ninguna de impacto crítico en la especificación de requisitos. |

---

### STK-09 — Pasarela de Pago

| Campo | Descripción |
|---|---|
| **Definición** | Servicio externo que procesa las transacciones financieras entre Compradores y Vendedores. |
| **Objetivos** | Procesar pagos de forma segura, confiable y dentro de los tiempos de respuesta esperados. |
| **Necesidades** | Recibir las solicitudes de pago con los datos requeridos en el formato de su interfaz. |
| **Expectativas** | Que el sistema maneje correctamente los estados de pago: aprobado, rechazado, pendiente. |
| **Nivel de influencia** | Alto — Sin la Pasarela de Pago no es posible completar ninguna transacción. |
| **Preocupaciones** | Manejo inadecuado de errores de pago que pueda generar cobros duplicados o inconsistencias en órdenes. |

---

### STK-10 — Sistemas Externos de Notificación

| Campo | Descripción |
|---|---|
| **Definición** | Servicios externos (correo electrónico, mensajería) utilizados para enviar notificaciones a Compradores y Vendedores. |
| **Objetivos** | Entregar las notificaciones en tiempo y forma al destinatario correcto. |
| **Necesidades** | Recibir las solicitudes de envío con el destinatario, el asunto y el contenido correctamente formateados. |
| **Expectativas** | Que el sistema no envíe notificaciones duplicadas ni notificaciones a usuarios que las han desactivado. |
| **Nivel de influencia** | Bajo — Afecta la comunicación, pero no bloquea los flujos funcionales principales. |
| **Preocupaciones** | Envío masivo no controlado que pueda generar quejas por spam. |
