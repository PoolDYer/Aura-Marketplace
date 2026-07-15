# Alcance del Sistema — Aura Marketplace

## 1. Propósito del Documento

Este documento delimita con precisión qué funcionalidades, capacidades e integraciones comprende Aura Marketplace en su versión actual, y cuáles quedan explícitamente fuera del alcance. Establecer estos límites es fundamental para controlar el alcance del proyecto, gestionar las expectativas de las partes interesadas y orientar la especificación de requisitos.

---

## 2. Dentro del Alcance

### 2.1 Gestión de Usuarios

- Registro de nuevos usuarios con los roles de Comprador y Vendedor.
- Autenticación de usuarios registrados.
- Gestión de perfil de usuario (datos personales, dirección, preferencias de notificación).
- Administración de cuentas por parte del Administrador (suspensión, reactivación).

### 2.2 Agente Inteligente

- Interpretación de instrucciones en lenguaje natural mediante texto.
- Interpretación de instrucciones en lenguaje natural mediante voz, con apoyo de la API de Google Gemini (Gemini Pro y Gemini Speech-To-Text).
- Reconocimiento de intenciones de: búsqueda, filtrado, ordenamiento, comparación, gestión de carrito y compra.
- Extracción de entidades y restricciones de las instrucciones del usuario.
- Mantenimiento del Contexto de Sesión durante la interacción activa.
- Resolución de referencias contextuales en instrucciones de seguimiento.
- Solicitud de aclaración cuando la intención no puede determinarse con certeza.
- Confirmación explícita del usuario antes de ejecutar acciones irreversibles (compra).

### 2.3 Catálogo y Búsqueda

- Búsqueda de productos en el Catálogo por términos, entidades y restricciones.
- Presentación de resultados con información básica del producto (nombre, precio, imagen, vendedor, calificación).
- Filtrado de resultados por: precio, categoría, marca, disponibilidad, calificación y condición de envío.
- Ordenamiento de resultados por: precio ascendente, precio descendente, calificación, relevancia y novedad.
- Vista comparativa de entre 2 y 5 productos simultáneamente.

### 2.4 Gestión de Publicaciones (Vendedor)

- Creación de Publicaciones con campos obligatorios: nombre, descripción, precio, categoría, stock e imágenes.
- Modificación de Publicaciones activas (precio, stock, descripción).
- Desactivación de Publicaciones por el Vendedor o el Administrador.

### 2.5 Carrito y Proceso de Compra

- Agregado de productos al Carrito mediante instrucción al Agente Inteligente o selección directa.
- Modificación de cantidades y eliminación de productos del Carrito.
- Verificación de disponibilidad de stock antes del pago.
- Procesamiento del pago mediante la Pasarela de Pago de Mercado Pago.
- Registro de la Orden y generación de número de confirmación único.
- Actualización automática del stock de productos tras la confirmación de compra.

### 2.6 Gestión de Órdenes

- Visualización del estado de órdenes por Compradores y Vendedores.
- Actualización del estado de la Orden por parte del Vendedor.
- Escalamiento de órdenes sin atención al Administrador.
- Historial de órdenes para Compradores y Vendedores.

### 2.7 Administración del Marketplace

- Gestión de cuentas de usuarios (suspensión, reactivación).
- Moderación de Publicaciones (eliminación por incumplimiento de políticas).
- Acceso a reportes agregados de ventas, usuarios y órdenes.
- Resolución de órdenes escaladas.

### 2.8 Notificaciones

- Notificaciones de nuevas órdenes a Compradores y Vendedores.
- Notificaciones de cambio de estado de Orden a Compradores.
- Envío de correos electrónicos transaccionales (verificación de correo, restablecimiento de contraseña) utilizando la integración real de Resend.
- Configuración de preferencias de notificación por usuario.

### 2.9 Funcionalidades Complementarias

- **Sistema de Favoritos**: Los Compradores pueden marcar Publicaciones como favoritas para acceso rápido posterior.
- **Sistema de Reseñas y Valoraciones**: Los Compradores pueden calificar y comentar productos después de completar una Orden.
- **Sistema de Promociones**: Los Vendedores pueden crear descuentos temporales con porcentaje de descuento y vigencia definida.
- **Sistema de Cupones**: Los Administradores pueden crear códigos promocionales con descuentos (porcentuales o de monto fijo) aplicables al total de órdenes.
- **Tokens de Autenticación**: Sistema dual de Access Token (15 minutos) y Refresh Token (7 días) para mayor seguridad.
- **Lista de Tokens Revocados**: Gestión de tokens invalidados explícitamente para logout seguro y manejo de compromisos de seguridad.

### 2.10 Infraestructura de Soporte

- **Sistema de Caché**: Caching del lado del cliente mediante TanStack Query y caché en memoria del backend para consultas frecuentes.
- **Almacenamiento de Imágenes**: Integración con Cloudinary para gestión y entrega optimizada de imágenes de Publicaciones.
- **Procesamiento de Pagos**: Integración específica con Mercado Pago como pasarela de pago.
- **Procesamiento de Lenguaje Natural**: Integración con Gemini AI para interpretación de instrucciones del Agente.
- **Auditoría Completa**: Sistema de registro inmutable de eventos críticos del sistema.

### 2.11 Accesibilidad

- Cumplimiento del nivel AA de las Pautas de Accesibilidad para el Contenido Web WCAG 2.1.
- Compatibilidad con lectores de pantalla para todos los elementos interactivos.
- Modalidad de voz como alternativa equivalente a la modalidad de texto.

---

## 3. Fuera del Alcance

Los siguientes elementos quedan explícitamente excluidos de la versión inicial del sistema:

### 3.1 Funcionalidades Diferidas

| Elemento | Justificación | Estado Actual |
|---|---|---|
| Recomendaciones proactivas sin instrucción del usuario | Requiere análisis de comportamiento e historial; se contempla en versiones futuras. | Pendiente |
| Aprendizaje continuo del Agente basado en historial de usuario | Implica modelos de personalización que exceden el alcance inicial. | Pendiente |
| Gestión de devoluciones y disputas post-venta | Proceso de negocio con alta complejidad regulatoria; se abordará por separado. | Pendiente |
| Seguimiento de envíos en tiempo real mediante integración con logística | Depende de integraciones con transportistas que no forman parte del sistema. | Pendiente |
| Marketplace multidivisa | Requiere lógica de conversión y cumplimiento regulatorio por país. | Pendiente |
| Marketplace multiidioma | Requiere internacionalización y localización del contenido. | Pendiente |
| Aplicación móvil nativa | Constituye un proyecto separado con su propia especificación. | Pendiente |
| Chat entre Comprador y Vendedor | No corresponde al modelo de interacción del Marketplace inicial. | Pendiente |
| Suscripciones y planes de membresía | No contemplado en el modelo de negocio inicial. | Pendiente |

---

## 4. Fronteras del Sistema

### 4.1 Entradas al Sistema

| Origen | Tipo de Entrada |
|---|---|
| Comprador (texto) | Instrucciones en lenguaje natural |
| Comprador (voz) | Audio capturado para transcripción |
| Vendedor | Datos de Publicación, actualizaciones de stock y precio |
| Administrador | Acciones de moderación y gestión |
| Pasarela de Pago | Confirmación o rechazo de transacción |
| Servicio STT | Transcripción de audio a texto |
| Servicio TTS | Audio sintetizado de respuestas |

### 4.2 Salidas del Sistema

| Destino | Tipo de Salida |
|---|---|
| Comprador | Resultados de búsqueda, confirmaciones de acción, vista comparativa, confirmación de orden |
| Vendedor | Notificaciones de órdenes, estado de publicaciones |
| Administrador | Reportes, alertas de escalamiento |
| Pasarela de Pago | Solicitudes de pago |
| Servicio STT | Audio para transcripción |
| Servicio TTS | Texto para síntesis de voz |
| Sistema de Notificaciones | Mensajes de notificación para Compradores y Vendedores |

---

## 5. Dependencias Externas

| Servicio Externo | Función en el Sistema | Criticidad |
|---|---|---|
| Proveedor de IA (NLP) | Interpretación de lenguaje natural para el Agente Inteligente | Crítica — Sin este servicio, el Agente no puede operar. |
| Servicio STT | Transcripción de voz a texto | Alta — Bloquea la modalidad de voz, no la modalidad de texto. |
| Servicio TTS | Síntesis de texto a voz | Media — Bloquea la respuesta auditiva, no la funcionalidad escrita. |
| Pasarela de Pago | Procesamiento de transacciones financieras | Crítica — Sin este servicio, no es posible completar compras. |
| Servicio de Notificaciones | Envío de notificaciones a usuarios | Media — Afecta la comunicación, no los flujos transaccionales. |

---

## 6. Limitaciones Conocidas

1. **Precisión del reconocimiento de voz**: La precisión del servicio STT puede verse afectada por acentos regionales, ruido ambiental o calidad del micrófono. El sistema no puede garantizar el 100% de precisión en reconocimiento de voz.

2. **Comprensión de instrucciones altamente ambiguas**: El Agente Inteligente puede no resolver instrucciones que contengan múltiples intenciones contradictorias o referencias no resolubles por el Contexto de Sesión.

3. **Dependencia de disponibilidad de servicios externos**: La disponibilidad del Agente Inteligente en modalidad de voz depende de la disponibilidad de los servicios STT, TTS y del proveedor de IA, que son externos al sistema.

4. **Operación sin conexión**: El sistema requiere conectividad de red para todas sus funciones. No se contempla operación sin conexión en la versión inicial.
