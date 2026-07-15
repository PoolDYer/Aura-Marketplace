# Diseño de Integraciones Externas — Aura Marketplace

## 1. Objetivo

Definir cómo el sistema se conecta con los servicios externos de los que depende, estableciendo contratos de comunicación explícitos, mecanismos de degradación controlada y límites claros de responsabilidad entre el dominio interno y los proveedores externos. La capa de integraciones protege al sistema de los cambios en implementaciones de terceros y garantiza que ningún fallo externo comprometa la operación del Marketplace en su conjunto.

---

## 2. Principios de Integración

| Principio | Descripción |
|---|---|
| Aislamiento por adaptador | Cada integración externa está encapsulada en un adaptador dedicado. El dominio interno no conoce los detalles del proveedor; solo conoce el contrato del adaptador. |
| Contrato explícito | Cada adaptador define con precisión qué datos envía al servicio externo y qué datos espera recibir. Los cambios en el proveedor son absorbidos por el adaptador sin afectar el dominio. |
| Degradación controlada | Cuando un servicio externo no está disponible, el sistema activa el modo degradado correspondiente sin interrumpir las funcionalidades que no dependen de ese servicio (RNF-06). |
| Seguridad en las comunicaciones | Toda comunicación con servicios externos se realiza mediante canales cifrados (RNF-08). Ningún dato sensible —credenciales, datos de pago, información personal— se transmite en texto plano. |
| Idempotencia en reintentos | Las operaciones que pueden reintentarse ante fallos de comunicación incluyen una clave de idempotencia para garantizar que el efecto no se duplica. |
| Trazabilidad | Todo error de comunicación con un servicio externo genera un registro de auditoría con la información suficiente para el diagnóstico posterior (RNF-17). |
| Independencia del proveedor | El diseño de cada integración es agnóstico del proveedor concreto. El adaptador puede ser reemplazado por una implementación alternativa sin cambios en la lógica de negocio. |

---

## 3. Mapa de Integraciones Externas

| Integración | Dirección | Criticidad | Modo de Degradación |
|---|---|---|---|
| Proveedor de NLP (Gemini AI) | Saliente | Crítica | El Agente informa al usuario que la interpretación de lenguaje natural no está disponible. El Marketplace continúa operable mediante navegación manual. |
| Servicio STT (Gemini AI) | Saliente | Alta | La modalidad de voz queda suspendida. La entrada por texto continúa funcionando con normalidad. |
| API Web Speech (Texto a Voz) | Cliente (navegador) | Media | Las respuestas del Agente se sintetizan en el cliente. Si la API no está disponible, se presentan en texto sin impacto funcional. |
| Pasarela de Pago (Mercado Pago) | Saliente | Crítica | El flujo de compra queda suspendido. El carrito del Comprador se preserva intacto para reintento posterior. |
| Servicio de Notificaciones (Resend) | Saliente | Media | Las notificaciones se encolan para reintento con retardo. Los flujos transaccionales no son bloqueados por fallos en la entrega de notificaciones. |

---

## 4. Diseño Detallado de Cada Integración

### 4.1 Proveedor de NLP (Procesamiento de Lenguaje Natural)

**Objetivo:** Interpretar las instrucciones del Comprador en lenguaje natural para identificar su intención, extraer entidades y detectar restricciones.

**Responsabilidad del adaptador:** Recibir el texto de la instrucción y el contexto de la sesión activa (historial reciente de turnos, conjunto de resultados activo), enviarlos al proveedor, y retornar al Agente la intención identificada con su nivel de confianza, las entidades extraídas con su tipo, valor y confianza individual, y las restricciones detectadas.

**Datos enviados al proveedor:** Texto de la instrucción del usuario. Historial reciente de la conversación (turnos suficientes para la resolución de referencias contextuales). Indicador del conjunto de resultados activo (sin datos de identificación personal). El contexto enviado no contiene datos personales del usuario ni referencias a información de pago.

**Datos recibidos del proveedor:** Intención identificada con nivel de confianza. Lista de entidades extraídas, cada una con tipo, valor y nivel de confianza. Lista de restricciones detectadas con tipo y valor.

**Dependencias:** Módulo Agente Inteligente (consumidor), Módulo Conversaciones (proveedor de contexto de sesión).

**Eventos que dispara en el sistema:** IntencionIdentificada (consumido por la Capa de Ejecución del Agente).

**Errores posibles:** Tiempo de espera superado sin respuesta. Servicio no disponible. Respuesta con formato no esperado.

**Restricciones de seguridad:** El contexto enviado al proveedor nunca incluye datos personales identificables más allá de lo estrictamente necesario. Datos de tarjeta nunca aparecen en el texto enviado. Toda comunicación por canal cifrado (RNF-08).

**Estrategia ante tiempo de espera:** Si el proveedor no responde dentro del umbral definido, el Agente pasa al estado Error e informa al usuario que el servicio de interpretación no está disponible. El Marketplace continúa operable mediante navegación manual.

**Reintentos:** Un reintento automático ante fallo por tiempo de espera. Si el segundo intento también falla, se activa el modo degradado.

---

### 4.2 Servicio STT (Speech-to-Text)

**Objetivo:** Transcribir el audio capturado del Comprador a texto para su procesamiento por el Agente Inteligente.

**Responsabilidad del adaptador:** Recibir el audio del Comprador, enviarlo al servicio STT con la configuración de idioma, y retornar al Agente el texto transcrito junto con el nivel de confianza de la transcripción.

**Datos enviados al servicio:** Flujo de audio o archivo de audio capturado. Indicación del idioma esperado (español). No se envía ningún dato de identificación del usuario.

**Datos recibidos del servicio:** Texto de la transcripción. Nivel de confianza de la transcripción, expresado en una escala normalizada de cero a uno.

**Dependencias:** Módulo Agente Inteligente (consumidor), Módulo Conversaciones.

**Errores posibles:** Audio de calidad insuficiente o con demasiado ruido. Idioma no reconocido. Tiempo de espera superado. Nivel de confianza por debajo del umbral (RN-11).

**Restricciones de seguridad:** El audio se transmite por canal cifrado (RNF-08). El sistema no almacena el audio tras recibir la transcripción. El audio no debe contener datos sensibles registrados previamente; si el usuario los pronuncia, el Agente no los registra en el historial.

**Degradación:** Si el servicio no está disponible, el Agente informa al usuario que el modo de voz no está disponible en este momento y sugiere usar la entrada por texto. La modalidad de texto continúa funcionando con normalidad (RNF-06).

---

### 4.3 API de Síntesis de Voz (Web Speech API)

**Objetivo:** Sintetizar las respuestas de texto del Agente Inteligente en audio para reproducción al Comprador en el navegador en el modo de voz.

**Responsabilidad:** Recibir el texto de la respuesta del Agente en el cliente y utilizar la API nativa de síntesis de voz (window.speechSynthesis) con el idioma configurado (es-ES) para reproducir el audio.

**Datos utilizados:** Texto de la respuesta en lenguaje natural. No hay envío de datos sensibles ni procesamiento en servidores externos para esta función.

**Dependencias:** Módulo frontend (agentStore.ts).

**Errores posibles:** API no compatible con el navegador del usuario o silenciada por el sistema operativo.

**Restricciones de seguridad:** Al ser una API nativa del navegador del cliente, los datos no viajan a servidores de terceros para la síntesis de voz, protegiendo la privacidad del usuario.

**Degradación:** Si la API no está disponible o falla, la respuesta se presenta únicamente en texto. No hay impacto funcional en ningún flujo transaccional (RNF-06).

---

### 4.4 Pasarela de Pago

**Objetivo:** Procesar las transacciones financieras entre Compradores y Vendedores de forma segura, delegando el manejo de datos de tarjeta al proveedor especializado.

**Responsabilidad del adaptador:** Recibir la solicitud de cobro del Módulo de Pagos, enviarla a la pasarela con el importe, la referencia del método de pago y la clave de idempotencia, y retornar el resultado de la transacción al Módulo de Pagos.

**Datos enviados a la pasarela:** Importe de la transacción. Referencia del método de pago provista por la pasarela en una interacción previa (nunca el número completo de tarjeta ni el código de seguridad, conforme a RNF-10). Identificador de referencia de la orden asociada. Clave de idempotencia única por intento de cobro.

**Datos recibidos de la pasarela:** Estado de la transacción (aprobada o rechazada). Identificador de referencia de la transacción provisto por la pasarela. Código de motivo de rechazo cuando aplica.

**Dependencias:** Módulo Pagos (consumidor), Módulo Pedidos (desencadenante del flujo).

**Eventos que dispara en el sistema:** PagoConfirmado (cuando la pasarela aprueba la transacción), PagoRechazado (cuando la pasarela rechaza o no responde).

**Errores posibles:** Pago rechazado por fondos insuficientes, tarjeta expirada o detección de fraude. Tiempo de espera superado sin respuesta de la pasarela. Error de comunicación de red.

**Restricciones de seguridad:** El sistema nunca almacena datos completos de tarjeta (RNF-10). Los datos de pago no atraviesan la lógica de dominio ni la capa de aplicación; solo el adaptador interactúa con la pasarela. Comunicación por canal cifrado (RNF-08). La clave de idempotencia previene cobros duplicados ante reintentos.

**Estrategia ante tiempo de espera:** Si la pasarela no responde dentro del umbral, el pago es marcado como PAYMENT_TIMEOUT. La orden permanece en estado pendiente sin ser registrada. El carrito del Comprador se preserva intacto. El usuario es informado para reintentar.

**Reintentos:** La clave de idempotencia es obligatoria en todo reintento para garantizar que el cargo no se duplica. Se permite un reintento automático. Los reintentos posteriores requieren acción explícita del usuario.

---

### 4.5 Servicio de Notificaciones

**Objetivo:** Entregar mensajes de aviso a Compradores y Vendedores sobre eventos relevantes del Marketplace, respetando las preferencias de cada usuario.

**Responsabilidad del adaptador:** Recibir la solicitud de notificación del Módulo de Notificaciones, enviarla al servicio externo con el destinatario, el tipo de mensaje y el contenido, y retornar la confirmación o el fallo de entrega.

**Datos enviados al servicio:** Identificador del usuario destinatario. Tipo de notificación. Contenido del mensaje. Canal de entrega preferido según las preferencias del usuario (correo electrónico, notificación en la aplicación, notificación de dispositivo). El contenido no incluye datos de tarjeta, contraseñas ni tokens de acceso.

**Datos recibidos del servicio:** Confirmación de entrega o estado de fallo con motivo.

**Dependencias:** Módulo Notificaciones (consumidor), Módulo Usuarios (proveedor de preferencias de notificación).

**Eventos que consume del sistema:** OrdenRegistrada, OrdenEscalada, cambio de estado de Orden, SesionIniciada (para alertas de seguridad de cuenta).

**Errores posibles:** Fallo de entrega por destinatario inválido. Servicio externo no disponible. Tiempo de espera superado.

**Restricciones de seguridad:** Las preferencias del usuario son verificadas antes del envío (RN-12). Las notificaciones de seguridad se envían siempre, independientemente de las preferencias. El contenido de notificaciones no incluye información sensible. Comunicación por canal cifrado (RNF-08).

**Degradación:** Si el servicio no está disponible, las notificaciones pendientes se encolan para reintento con retardo progresivo. Los flujos transaccionales del Marketplace (registro de órdenes, proceso de compra) no son bloqueados por fallos en la entrega de notificaciones. Los fallos de entrega son registrados en el sistema de auditoría.

---

## 5. Integración con el Agente Inteligente — Flujo Completo

### 5.1 Flujo de entrada por texto

El Comprador envía una instrucción escrita a través de la capa de presentación. La capa de presentación la transmite al Agente Inteligente. El Agente envía el texto junto con el contexto de sesión activa al adaptador del Proveedor de NLP. El proveedor retorna la intención identificada, las entidades extraídas y las restricciones. El Agente coordina con el módulo funcional correspondiente (Búsquedas, Carrito, Pedidos) para ejecutar la acción. La Capa de Respuesta formula el resultado en lenguaje natural y lo presenta al Comprador.

### 5.2 Flujo de entrada por voz

El Comprador activa el modo de voz y pronuncia su instrucción. La capa de presentación captura el audio y lo transmite al adaptador STT. El servicio STT retorna la transcripción y el nivel de confianza. El Agente verifica que el nivel de confianza supera el umbral (RN-11). Si lo supera, la transcripción es procesada exactamente como una instrucción de texto (flujo 5.1). La respuesta resultante es enviada al adaptador TTS para síntesis de audio. El audio sintetizado es reproducido al Comprador. Si el servicio TTS no está disponible, la respuesta se presenta únicamente en texto.

### 5.3 Flujo de compra con pasarela

El Agente identifica la intención de compra y verifica la autenticación del Comprador (RN-02). Coordina con el Módulo de Inventario la verificación de stock de todos los productos del carrito (RN-03). El Agente presenta el ResumenOrden al Comprador con todos los detalles. El Agente solicita la confirmación explícita del Comprador y espera su respuesta (RN-01). Tras la confirmación, el Módulo de Pagos envía la solicitud al adaptador de la Pasarela de Pago con la clave de idempotencia. La pasarela retorna la confirmación. El sistema produce el evento PagoConfirmado. El Módulo de Pedidos registra la Orden con número de confirmación único y el Módulo de Inventario decrementa el stock de forma atómica (RN-04). El Módulo de Notificaciones despacha los avisos al Comprador y al Vendedor de forma asíncrona.

### 5.4 Gestión de fallos en cadena

Si el proveedor de NLP falla en cualquier punto del flujo: el Agente pasa al estado Error, informa al usuario y el flujo de instrucciones queda suspendido. La navegación manual del Marketplace continúa disponible. Si el servicio STT falla: el modo de voz queda suspendido; el modo de texto continúa sin afectación. Si el servicio TTS falla: la respuesta se entrega únicamente en texto; ningún flujo transaccional se interrumpe. Si la Pasarela de Pago falla o no responde: el carrito es preservado, la orden no se registra, el usuario es informado para reintentar cuando el servicio esté disponible.

---

## 6. Manejo de Fallos y Resiliencia

### 6.1 Tiempos de espera

Cada integración tiene un tiempo máximo de espera definido. Superar ese tiempo activa el flujo de degradación o de error correspondiente sin bloquear el resto del sistema. El tiempo de espera de la pasarela de pago no se contabiliza dentro del límite de 5 segundos para el registro de la orden (RNF-03).

### 6.2 Reintentos

Los reintentos son idempotentes donde el efecto podría duplicarse. El número máximo de reintentos automáticos por integración es:

| Integración | Reintentos automáticos | Comportamiento posterior |
|---|---|---|
| Proveedor de NLP | 1 reintento ante tiempo de espera | Modo degradado: Agente informa indisponibilidad |
| Servicio STT | 1 reintento ante tiempo de espera | Modo degradado: voz suspendida, texto continúa |
| Servicio TTS | 1 reintento ante tiempo de espera | Respuesta en solo texto, sin impacto funcional |
| Pasarela de Pago | 1 reintento idempotente con clave | Reintentos posteriores requieren acción del usuario |
| Servicio de Notificaciones | Cola con retardo progresivo | Flujo transaccional no es bloqueado |

### 6.3 Caídas externas (modo degradado)

Derivado de RNF-06, los modos degradados se activan de forma automática cuando se detecta que un servicio externo no responde:

- **Proveedor de NLP no disponible:** El Agente informa al usuario que la interpretación de lenguaje natural no está disponible. El Marketplace opera mediante navegación manual sin interrumpir búsquedas, carrito ni compras iniciadas directamente.
- **Servicio STT no disponible:** El modo de voz es deshabilitado automáticamente. El modo de texto continúa con plena funcionalidad.
- **Servicio TTS no disponible:** Las respuestas del Agente se presentan únicamente en texto. No existe impacto funcional en ningún flujo.
- **Pasarela de Pago no disponible:** El proceso de compra queda suspendido hasta que el servicio se restaure. El carrito permanece intacto.

### 6.4 Recuperación

Cuando un servicio externo se restaura tras un período de fallo, el sistema reanuda automáticamente la integración sin intervención manual. Las notificaciones pendientes en cola son enviadas al restaurarse el servicio. El carrito preservado permite al usuario completar la compra sin reconstruir su selección. El modo de voz se reactiva automáticamente cuando los servicios STT y TTS estén disponibles.

---

## 7. Trazabilidad con la Especificación

| Decisión de integración | Fuente |
|---|---|
| Agente interpreta instrucciones en lenguaje natural mediante NLP externo | RF-01, RF-02 |
| Proceso de compra coordina con pasarela de pago | RF-08 |
| Degradación controlada ante fallos de STT, TTS y NLP | RNF-06 |
| Comunicaciones con todos los servicios externos por canal cifrado | RNF-08 |
| Sistema nunca almacena datos completos de tarjeta | RNF-10 |
| Confirmación explícita antes del envío a la pasarela | RN-01 |
| Verificación de stock antes del cobro | RN-03 |
| Decremento atómico de stock al registrar la orden | RN-04 |
| Nivel de confianza STT verificado antes de procesar transcripción | RN-11 |
| Preferencias del usuario verificadas antes de enviar notificaciones | RN-12 |
| Objetivo de permitir interacción en lenguaje natural | OBJ-01 |
| Objetivo de gestionar carrito y compra mediante lenguaje natural | OBJ-03 |
| Objetivo de accesibilidad por modalidad de voz | OBJ-04 |

---

## 8. Implementación Tecnológica de las Integraciones

> Esta sección fue agregada durante la actualización tecnológica de la Fase 2. No modifica los contratos ni modos de degradación definidos en las secciones anteriores.

### 8.1 Interfaces de Adaptador en L-05

Cada integración externa se implementa mediante un adaptador en L-05 que cumple una interfaz definida en el diseño. Los módulos de L-02, L-03 y L-04 solo conocen la interfaz, nunca el proveedor concreto:

| Integración | Interfaz de adaptador | Tecnología del adaptador L-05 | Proveedor |
|---|---|---|---|
| Procesamiento de Lenguaje Natural | LanguageModelProvider | Módulo NestJS en L-05 que implementa la interfaz | Gemini AI |
| Transcripción de voz (STT) | SpeechToTextProvider | Módulo NestJS en L-05 que implementa la interfaz | Gemini AI |
| Síntesis de voz (TTS) | N/A (Frontend Nativo) | API nativa Web Speech (speechSynthesis) en el cliente | Nativo del navegador del cliente |
| Pasarela de Pago | MercadoPagoService | Módulo NestJS en L-05 | Mercado Pago |
| Notificaciones | ResendMailService | Módulo NestJS en L-05 | Resend |
| Almacenamiento de imágenes | CloudinaryService | Módulo NestJS en L-05 | Cloudinary |

### 8.2 Regla de Sustitución de Proveedores

Para cualquiera de los adaptadores anteriores, el proceso de sustitución de proveedor es:
1. Crear una nueva clase en L-05 que implemente la interfaz correspondiente
2. Registrar la nueva implementación en el módulo NestJS de L-05
3. Cero cambios en L-02, L-03 o L-04

Esta regla garantiza que las decisiones de proveedor no afectan nunca la lógica de negocio.
