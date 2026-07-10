# Requisitos No Funcionales — Marketplace Inteligente Asistido por IA

## 1. Introducción

Los requisitos no funcionales definen las restricciones de calidad que el sistema debe satisfacer. A diferencia de los requisitos funcionales (qué hace el sistema), los requisitos no funcionales especifican cómo debe comportarse el sistema en términos de rendimiento, seguridad, disponibilidad, usabilidad, accesibilidad, escalabilidad y mantenibilidad. Cada requisito incluye métricas objetivas y verificables.

---

## 2. Rendimiento

### RNF-01 — Tiempo de respuesta del Agente Inteligente

| Campo | Descripción |
|---|---|
| **ID** | RNF-01 |
| **Nombre** | Latencia de procesamiento del Agente Inteligente |
| **Descripción** | El Agente Inteligente debe completar la identificación de intención, extracción de entidades y ejecución de la acción correspondiente dentro de un tiempo máximo desde la recepción de la instrucción. |
| **Métrica** | El tiempo desde la recepción de la instrucción hasta la presentación del resultado debe ser menor o igual a 2 segundos en el percentil 95 de las solicitudes. |
| **Condición de medición** | Bajo carga normal de hasta 500 usuarios concurrentes activos. |
| **Prioridad** | Alta |

---

### RNF-02 — Tiempo de retorno de resultados de búsqueda

| Campo | Descripción |
|---|---|
| **ID** | RNF-02 |
| **Nombre** | Latencia de búsqueda en el Catálogo |
| **Descripción** | El módulo de búsqueda debe retornar los resultados al Agente Inteligente dentro del tiempo máximo establecido. |
| **Métrica** | El tiempo desde la recepción de la consulta hasta la retorno de resultados al Agente debe ser menor o igual a 3 segundos en el percentil 95. |
| **Condición de medición** | Bajo carga normal. Catálogo con hasta 1,000,000 de Publicaciones activas. |
| **Prioridad** | Alta |

---

### RNF-03 — Tiempo de registro de Orden

| Campo | Descripción |
|---|---|
| **ID** | RNF-03 |
| **Nombre** | Latencia del proceso de registro de Orden |
| **Descripción** | El tiempo total del proceso de compra, desde la confirmación del pago por la Pasarela hasta la presentación del número de confirmación al Comprador, debe estar dentro del límite establecido. |
| **Métrica** | El proceso de registro de Orden debe completarse dentro de los 5 segundos posteriores a la confirmación del pago. |
| **Condición de medición** | Bajo carga normal. El tiempo del procesamiento externo de la Pasarela de Pago no se incluye en este límite. |
| **Prioridad** | Alta |

---

### RNF-04 — Tiempo de actualización de Publicación en el Catálogo

| Campo | Descripción |
|---|---|
| **ID** | RNF-04 |
| **Nombre** | Latencia de propagación de cambios en Publicaciones |
| **Descripción** | Los cambios en precio, stock o estado de una Publicación deben reflejarse en el Catálogo visible para búsquedas dentro del tiempo máximo establecido. |
| **Métrica** | Los cambios en una Publicación deben ser visibles en el Catálogo dentro de los 60 segundos posteriores a la modificación. |
| **Prioridad** | Alta |

---

## 3. Disponibilidad

### RNF-05 — Disponibilidad del sistema

| Campo | Descripción |
|---|---|
| **ID** | RNF-05 |
| **Nombre** | Disponibilidad mínima del Marketplace |
| **Descripción** | El Marketplace debe estar disponible para Compradores, Vendedores y Administradores durante el tiempo comprometido. |
| **Métrica** | El sistema debe tener una disponibilidad mínima del 99.5% mensual, equivalente a un máximo de 3 horas y 40 minutos de inactividad no planificada por mes. |
| **Exclusiones** | Las ventanas de mantenimiento planificadas y comunicadas con al menos 48 horas de anticipación no se contabilizan como tiempo de inactividad. |
| **Prioridad** | Alta |

---

### RNF-06 — Degradación controlada ante fallos de servicios externos

| Campo | Descripción |
|---|---|
| **ID** | RNF-06 |
| **Nombre** | Operación en modo degradado ante fallos de dependencias externas |
| **Descripción** | Cuando un servicio externo (STT, TTS, Proveedor de IA) no está disponible, el sistema debe continuar operando con las funcionalidades que no dependan de dicho servicio. |
| **Métrica** | Si el servicio STT o TTS no está disponible, la modalidad de texto del Agente Inteligente debe continuar funcionando con normalidad. Si el servicio de IA no está disponible, el Agente informa el estado y el Marketplace continúa operable mediante navegación manual. |
| **Prioridad** | Alta |

---

## 4. Seguridad

### RNF-07 — Almacenamiento seguro de contraseñas

| Campo | Descripción |
|---|---|
| **ID** | RNF-07 |
| **Nombre** | Cifrado de contraseñas en reposo |
| **Descripción** | Las contraseñas de los usuarios nunca deben almacenarse en texto plano. Deben almacenarse como el resultado de una función de derivación de clave con sal. |
| **Métrica** | El 100% de las contraseñas almacenadas en el sistema deben estar en forma de hash con sal. Ningún proceso del sistema debe tener acceso a la contraseña original. |
| **Prioridad** | Alta |

---

### RNF-08 — Transmisión segura de datos

| Campo | Descripción |
|---|---|
| **ID** | RNF-08 |
| **Nombre** | Cifrado de datos en tránsito |
| **Descripción** | Toda comunicación entre el usuario y el Marketplace, y entre el Marketplace y los servicios externos, debe realizarse mediante protocolos de comunicación seguros. |
| **Métrica** | El 100% del tráfico de red del sistema debe utilizar protocolos de comunicación cifrados. Ningún dato sensible (credenciales, datos de pago, datos personales) debe transmitirse en texto plano. |
| **Prioridad** | Alta |

---

### RNF-09 — Gestión de sesiones y tokens

| Campo | Descripción |
|---|---|
| **ID** | RNF-09 |
| **Nombre** | Seguridad en la gestión de sesiones |
| **Descripción** | Los tokens de acceso de las sesiones de usuario deben tener una vida útil limitada y deben ser invalidados al cerrar sesión. |
| **Métrica** | Los tokens de acceso deben expirar después de un máximo de 24 horas de emisión o al cerrar sesión, lo que ocurra primero. Los tokens invalidados no pueden reutilizarse. |
| **Prioridad** | Alta |

---

### RNF-10 — Protección de datos de pago

| Campo | Descripción |
|---|---|
| **ID** | RNF-10 |
| **Nombre** | No almacenamiento de datos sensibles de pago |
| **Descripción** | El Marketplace no debe almacenar datos completos de tarjetas de crédito o débito en sus propios sistemas. El procesamiento y almacenamiento de datos de pago es responsabilidad exclusiva de la Pasarela de Pago. |
| **Métrica** | El sistema no debe almacenar en ninguna capa de datos el número completo de tarjeta, código de seguridad ni fecha de vencimiento. Solo puede retener identificadores de referencia provistos por la Pasarela de Pago. |
| **Prioridad** | Alta |

---

## 5. Escalabilidad

### RNF-11 — Escalabilidad ante crecimiento de usuarios

| Campo | Descripción |
|---|---|
| **ID** | RNF-11 |
| **Nombre** | Capacidad de escalar ante incremento de carga |
| **Descripción** | El sistema debe poder soportar incrementos significativos en el número de usuarios concurrentes sin degradar los tiempos de respuesta definidos en RNF-01 y RNF-02. |
| **Métrica** | El sistema debe soportar hasta 2,000 usuarios concurrentes activos sin que los tiempos de respuesta del Agente Inteligente superen los 4 segundos en el percentil 95. |
| **Prioridad** | Media |

---

### RNF-12 — Escalabilidad del Catálogo

| Campo | Descripción |
|---|---|
| **ID** | RNF-12 |
| **Nombre** | Capacidad del Catálogo de productos |
| **Descripción** | El módulo de búsqueda debe mantener sus tiempos de respuesta (RNF-02) independientemente del tamaño del Catálogo dentro del rango establecido. |
| **Métrica** | El tiempo de búsqueda no debe degradarse más de un 20% cuando el Catálogo crece de 100,000 a 1,000,000 de Publicaciones activas. |
| **Prioridad** | Media |

---

## 6. Usabilidad

### RNF-13 — Claridad de las respuestas del Agente Inteligente

| Campo | Descripción |
|---|---|
| **ID** | RNF-13 |
| **Nombre** | Legibilidad de las respuestas del Agente |
| **Descripción** | Las respuestas del Agente Inteligente deben ser concisas, usar lenguaje natural comprensible y proveer retroalimentación clara sobre la acción ejecutada y su resultado. |
| **Métrica** | El Agente debe siempre informar al usuario qué acción ejecutó y cuál fue el resultado. Los mensajes de error deben indicar qué ocurrió y qué puede hacer el usuario para continuar. |
| **Prioridad** | Alta |

---

### RNF-14 — Retroalimentación visual durante procesamiento

| Campo | Descripción |
|---|---|
| **ID** | RNF-14 |
| **Nombre** | Indicadores de estado durante operaciones en curso |
| **Descripción** | El sistema debe proveer retroalimentación visual al usuario mientras se procesa una operación que tome más tiempo del perceptible. |
| **Métrica** | Para cualquier operación que tome más de 500 milisegundos, el sistema debe mostrar un indicador de procesamiento activo. El indicador debe desaparecer cuando la operación concluye. |
| **Prioridad** | Alta |

---

## 7. Accesibilidad

### RNF-15 — Cumplimiento de accesibilidad WCAG 2.1

| Campo | Descripción |
|---|---|
| **ID** | RNF-15 |
| **Nombre** | Conformidad con WCAG 2.1 nivel AA |
| **Descripción** | El Marketplace debe cumplir con los criterios de conformidad del nivel AA de las Pautas de Accesibilidad para el Contenido Web WCAG 2.1. |
| **Métrica** | El sistema debe superar la verificación automatizada de accesibilidad sin errores de nivel A ni AA. Todos los elementos interactivos deben ser accesibles mediante teclado. Todos los elementos visuales con significado deben tener equivalente textual. |
| **Prioridad** | Alta |

---

### RNF-16 — Compatibilidad con lectores de pantalla

| Campo | Descripción |
|---|---|
| **ID** | RNF-16 |
| **Nombre** | Soporte para lectores de pantalla |
| **Descripción** | Todos los elementos interactivos del Marketplace deben ser reconocibles por los lectores de pantalla más utilizados, con etiquetas y descripciones textuales apropiadas. |
| **Métrica** | El 100% de los controles interactivos deben tener etiquetas textuales asociadas. Las imágenes con significado funcional deben tener descripciones alternativas. Los mensajes de estado del Agente Inteligente deben ser anunciados por los lectores de pantalla. |
| **Prioridad** | Alta |

---

## 8. Mantenibilidad

### RNF-17 — Registro de eventos del sistema

| Campo | Descripción |
|---|---|
| **ID** | RNF-17 |
| **Nombre** | Logging de eventos operativos |
| **Descripción** | El sistema debe registrar los eventos operativos relevantes con suficiente detalle para permitir el diagnóstico de incidentes y la auditoría de operaciones críticas. |
| **Métrica** | El sistema debe registrar como mínimo: autenticaciones exitosas y fallidas, instrucciones al Agente Inteligente con su resultado, creación y modificación de Publicaciones, registro y cambios de estado de Órdenes, y errores de integraciones externas. Cada registro debe incluir marca temporal, identificador de usuario y resultado de la operación. Los datos personales o de pago no deben incluirse en los registros. |
| **Prioridad** | Media |
