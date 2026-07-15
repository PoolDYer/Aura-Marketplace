# Reglas de Negocio — Aura Marketplace

## 1. Introducción

Este documento cataloga todas las reglas de negocio que rigen el comportamiento de Aura Marketplace. Cada regla tiene un identificador único, una descripción precisa, su justificación de negocio, el impacto en el sistema y su prioridad. Las reglas de negocio expresan restricciones y políticas del dominio que el sistema debe respetar independientemente del flujo técnico.

*Última revisión de alineación con producción: 14 de Julio de 2026*

---

## 2. Catálogo de Reglas de Negocio

### RN-01 — Confirmación obligatoria antes de ejecutar acciones irreversibles

| Campo | Descripción |
|---|---|
| **ID** | RN-01 |
| **Nombre** | Confirmación antes de acciones irreversibles |
| **Descripción** | El Agente Inteligente debe solicitar confirmación explícita del Comprador antes de ejecutar cualquier acción que no pueda deshacerse, incluyendo la iniciación del proceso de pago y el registro de una Orden. |
| **Justificación** | Las instrucciones en lenguaje natural pueden ser ambiguas. Una compra accidental genera insatisfacción, disputas y costos operativos. La confirmación protege al usuario y reduce el riesgo de transacciones no deseadas. |
| **Impacto** | El Agente Inteligente interrumpe el flujo de compra para presentar un resumen de la Orden y solicita una confirmación explícita antes de enviar la solicitud a la Pasarela de Pago. |
| **Prioridad** | Alta |

---

### RN-02 — Autenticación requerida para transacciones

| Campo | Descripción |
|---|---|
| **ID** | RN-02 |
| **Nombre** | Autenticación obligatoria para compra y gestión de Carrito |
| **Descripción** | Solo los Compradores autenticados pueden agregar productos al Carrito, modificar el Carrito e iniciar el proceso de compra. Un Visitante no autenticado no puede realizar estas acciones. |
| **Justificación** | Las transacciones comerciales requieren identificación del Comprador para garantizar la trazabilidad, el cumplimiento de la Orden y la seguridad del pago. |
| **Impacto** | Si el Agente Inteligente recibe una instrucción de gestión de Carrito o de compra de un Visitante, debe redirigir al usuario al proceso de registro o autenticación antes de continuar. |
| **Prioridad** | Alta |

---

### RN-03 — Verificación de stock antes del pago

| Campo | Descripción |
|---|---|
| **ID** | RN-03 |
| **Nombre** | Verificación de disponibilidad previa al procesamiento del pago |
| **Descripción** | El Marketplace debe verificar que todos los productos del Carrito tienen Stock suficiente inmediatamente antes de enviar la solicitud de pago a la Pasarela de Pago. Si algún producto no tiene Stock disponible, se debe notificar al Comprador antes de continuar. |
| **Justificación** | El stock puede cambiar entre el momento en que el producto se agrega al Carrito y el momento de la compra. Procesar el pago de un producto sin stock genera una Orden imposible de cumplir, con el consecuente costo de reembolso y pérdida de confianza. |
| **Impacto** | Se requiere una verificación de stock en tiempo real como paso previo al cobro, con la opción de continuar con los productos disponibles o cancelar la compra completa. |
| **Prioridad** | Alta |

---

### RN-04 — Actualización de stock tras la confirmación de Orden

| Campo | Descripción |
|---|---|
| **ID** | RN-04 |
| **Nombre** | Decremento de stock al registrar una Orden |
| **Descripción** | Cuando la Pasarela de Pago confirma una transacción y se registra una Orden, el Marketplace debe decrementar el Stock de cada producto comprado en la cantidad correspondiente a la Orden, de forma atómica. |
| **Justificación** | El Stock publicado en el Catálogo debe reflejar con precisión la disponibilidad real. Un Stock incorrecto genera ventas de productos agotados y disputas posteriores. |
| **Impacto** | La actualización de Stock debe ocurrir como parte del mismo proceso de registro de la Orden, no como un proceso separado y diferido. |
| **Prioridad** | Alta |

---

### RN-05 — Campos obligatorios para la Publicación de productos

| Campo | Descripción |
|---|---|
| **ID** | RN-05 |
| **Nombre** | Completitud mínima de una Publicación |
| **Descripción** | Una Publicación solo puede crearse y aparecer en el Catálogo si incluye todos los campos obligatorios: nombre del producto, descripción, precio, categoría, cantidad disponible (Stock) e imágenes. |
| **Justificación** | Una Publicación incompleta no provee información suficiente para que el Comprador tome una decisión de compra informada, y degrada la calidad percibida del Marketplace. |
| **Impacto** | El sistema debe validar la completitud de los campos antes de aceptar la creación de la Publicación, y debe señalar específicamente los campos faltantes. |
| **Prioridad** | Alta |

---

### RN-06 — El precio de una Publicación no puede ser menor o igual a cero

| Campo | Descripción |
|---|---|
| **ID** | RN-06 |
| **Nombre** | Precio mínimo de Publicación |
| **Descripción** | El precio de cualquier producto publicado en el Catálogo debe ser un valor numérico mayor que cero. No se permiten publicaciones gratuitas ni con precios negativos. |
| **Justificación** | El Marketplace opera como plataforma comercial con productos de valor económico. Un precio de cero o negativo indica un error de datos o una intención fraudulenta. |
| **Impacto** | El sistema debe validar el campo precio al crear o modificar una Publicación y rechazar valores menores o iguales a cero. |
| **Prioridad** | Alta |

---

### RN-07 — Escalamiento automático de Órdenes sin atención

| Campo | Descripción |
|---|---|
| **ID** | RN-07 |
| **Nombre** | Escalamiento de Orden no confirmada en 24 horas |
| **Descripción** | Si un Vendedor no actualiza el estado de una Orden desde "pendiente" dentro de las 24 horas posteriores a su recepción, el Marketplace debe cambiar automáticamente el estado de la Orden a "escalada" y notificar al Administrador. |
| **Justificación** | Una Orden sin atención genera incertidumbre en el Comprador y puede derivar en disputas. El escalamiento automático garantiza que ninguna Orden quede sin seguimiento. |
| **Impacto** | Se requiere un proceso de verificación periódica del estado de Órdenes pendientes para detectar y escalar las que superen el plazo establecido. |
| **Prioridad** | Alta |

---

### RN-08 — Bloqueo temporal de cuenta por intentos de autenticación fallidos

| Campo | Descripción |
|---|---|
| **ID** | RN-08 |
| **Nombre** | Bloqueo por intentos de autenticación fallidos |
| **Descripción** | Si un usuario intenta iniciar sesión con credenciales incorrectas tres veces consecutivas, el Marketplace debe bloquear temporalmente el acceso a esa cuenta por un período de 15 minutos, independientemente del rol del usuario. |
| **Justificación** | Los ataques de fuerza bruta intentan adivinar contraseñas mediante múltiples intentos consecutivos. El bloqueo temporal es una medida de seguridad estándar para mitigar este riesgo. |
| **Impacto** | El sistema debe contabilizar los intentos fallidos consecutivos por cuenta y activar el bloqueo temporal al alcanzar el umbral. Debe informar al usuario sobre el bloqueo y la duración. |
| **Prioridad** | Alta |

---

### RN-09 — Requisitos de complejidad de contraseña

| Campo | Descripción |
|---|---|
| **ID** | RN-09 |
| **Nombre** | Política de contraseña segura |
| **Descripción** | Toda contraseña registrada o actualizada en el sistema debe tener un mínimo de 8 caracteres e incluir al menos una letra mayúscula, una letra minúscula y un dígito numérico. El sistema rechaza contraseñas que no cumplan estos criterios. |
| **Justificación** | Las contraseñas simples son vulnerables a ataques de diccionario y fuerza bruta. Una política de complejidad mínima reduce significativamente el riesgo de compromiso de cuentas. |
| **Impacto** | El sistema debe validar la contraseña en el momento del registro y en cualquier cambio de contraseña posterior, e informar al usuario los criterios no cumplidos. |
| **Prioridad** | Alta |

---

### RN-10 — Deshabilitación inmediata de Publicaciones al suspender un Vendedor

| Campo | Descripción |
|---|---|
| **ID** | RN-10 |
| **Nombre** | Suspensión de Publicaciones al suspender al Vendedor |
| **Descripción** | Cuando el Administrador suspende la cuenta de un Vendedor, todas las Publicaciones activas de dicho Vendedor deben ser deshabilitadas del Catálogo de forma inmediata, sin intervención manual adicional. |
| **Justificación** | Permitir que un Vendedor suspendido mantenga Publicaciones activas puede resultar en Órdenes que no serán cumplidas, generando perjuicio a los Compradores. |
| **Impacto** | La acción de suspensión de cuenta debe disparar un proceso que deshabilite todas las Publicaciones asociadas al Vendedor en el mismo acto. |
| **Prioridad** | Alta |

---

### RN-11 — Umbral mínimo de confianza para transcripción de voz

| Campo | Descripción |
|---|---|
| **ID** | RN-11 |
| **Nombre** | Umbral de confianza en transcripción STT |
| **Descripción** | El Agente Inteligente solo procesará una transcripción de voz si el servicio STT reporta un nivel de confianza igual o superior al umbral configurado en el sistema. Transcripciones por debajo del umbral no deben ser procesadas como instrucciones. |
| **Justificación** | Procesar transcripciones de baja confianza puede resultar en la ejecución de acciones incorrectas que el usuario no solicitó. Es preferible solicitar que el usuario repita la instrucción antes que ejecutar una acción incorrecta. |
| **Impacto** | El Agente debe evaluar el nivel de confianza reportado por el servicio STT antes de procesar la transcripción, e informar al usuario cuando el umbral no se alcance. |
| **Prioridad** | Alta |

---

### RN-12 — Respeto a las preferencias de notificación del usuario

| Campo | Descripción |
|---|---|
| **ID** | RN-12 |
| **Nombre** | Obligatoriedad de respetar preferencias de notificación |
| **Descripción** | El sistema no debe enviar a un usuario un tipo de notificación que el usuario haya desactivado en sus preferencias, con excepción de las notificaciones de seguridad relacionadas con el acceso a la cuenta. |
| **Justificación** | El envío de notificaciones no deseadas genera rechazo en los usuarios y puede constituir una violación de regulaciones de privacidad y comunicaciones electrónicas. |
| **Impacto** | Antes de enviar cualquier notificación, el sistema debe verificar que el usuario tiene activo ese tipo de notificación en sus preferencias. |
| **Prioridad** | Media |

---

### RN-13 — Comparación máxima de 5 productos simultáneos

| Campo | Descripción |
|---|---|
| **ID** | RN-13 |
| **Nombre** | Límite de productos en vista comparativa |
| **Descripción** | La vista comparativa puede mostrar entre 2 y 5 productos simultáneamente. El Agente Inteligente no debe iniciar una comparación con menos de 2 ni con más de 5 productos. |
| **Justificación** | Comparar más de 5 productos simultáneamente genera una vista con exceso de información que dificulta la toma de decisiones del Comprador en lugar de facilitarla. |
| **Impacto** | El Agente debe validar la cantidad de productos a comparar antes de mostrar la vista comparativa e informar al Comprador si el límite es excedido. |
| **Prioridad** | Media |

---

### RN-14 — Persistencia del Contexto de Sesión por 30 minutos de inactividad

| Campo | Descripción |
|---|---|
| **ID** | RN-14 |
| **Nombre** | Expiración del Contexto de Sesión por inactividad |
| **Descripción** | El Contexto de Sesión del Agente Inteligente debe mantenerse activo durante un mínimo de 30 minutos de inactividad del usuario. Al expirar la Sesión, el Contexto de Sesión se limpia y las instrucciones de seguimiento no podrán hacer referencia a resultados previos de la Sesión expirada. |
| **Justificación** | Un período de inactividad prolongado puede implicar que el usuario ha comenzado una nueva tarea o contexto de búsqueda diferente. Mantener el contexto activo por 30 minutos es un balance entre utilidad y uso de recursos del sistema. |
| **Impacto** | El sistema debe registrar el tiempo de la última actividad del usuario en la Sesión y limpiar el contexto al superar el umbral de inactividad. |
| **Prioridad** | Media |
