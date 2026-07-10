# Diseño de Contratos de Comunicación (API) — Marketplace Inteligente Asistido por IA

## 1. Objetivo

Definir los contratos de comunicación del sistema de forma explícita e independiente de la implementación, estableciendo qué operaciones expone cada recurso, qué datos recibe, qué datos retorna, qué reglas aplica y qué errores puede producir. Estos contratos permiten que los módulos del sistema interactúen de forma predecible y que la capa de presentación pueda operar sin conocer los detalles internos de la lógica de negocio.

---

## 2. Principios de Diseño

| Principio | Descripción |
|---|---|
| Separación de responsabilidades | Cada contrato expone operaciones de un único recurso del dominio. No mezcla preocupaciones de módulos distintos. |
| Contratos explícitos | Toda operación define con precisión sus datos de entrada, sus datos de salida, las reglas que aplica y los errores que puede retornar. |
| Versionado | Los contratos se identifican con versión para permitir evolución sin ruptura de consumidores existentes. |
| Seguridad por defecto | Toda operación que modifica estado o accede a datos privados requiere identidad verificada. El acceso anónimo se limita a operaciones de lectura pública explícitamente definidas. |
| Manejo uniforme de errores | Todos los errores siguen la misma estructura de respuesta: código, descripción y acción recomendada. |
| Idempotencia donde aplique | Las operaciones de escritura que puedan ejecutarse más de una vez ante fallos de red se diseñan para producir el mismo resultado sin duplicar efectos. |
| Validación en frontera | Toda entrada es validada en la capa de comunicación antes de alcanzar la lógica de negocio. Ningún módulo interno recibe datos sin validar. |

---

## 3. Tipos de Comunicación

**Comunicación síncrona (petición–respuesta):** Se usa para operaciones que requieren una respuesta inmediata para continuar el flujo. Aplica a búsqueda de productos, gestión del carrito, proceso de compra y autenticación. El solicitante espera el resultado antes de avanzar.

**Comunicación asíncrona (eventos):** Se usa para operaciones cuyo resultado no bloquea el flujo principal. Aplica a notificaciones al Comprador y al Vendedor, generación de registros de auditoría y escalamiento automático de órdenes. El emisor publica el evento y continúa sin esperar la confirmación del receptor.

**Comunicación en tiempo real:** Se usa para actualizaciones de estado del Agente Inteligente que el usuario debe percibir de forma inmediata. Aplica al indicador visual de escucha activa durante la captura de audio y al indicador de procesamiento mientras el Agente interpreta una instrucción.

---

## 4. Recursos Principales

### 4.1 Usuarios

**Propósito:** Gestionar el registro, perfil y preferencias de notificación de los usuarios del Marketplace.

**Actor principal:** Visitante (registro), Comprador / Vendedor / Administrador (perfil y preferencias).

**Operaciones necesarias:**

| Operación | Descripción |
|---|---|
| Registrar usuario | Crea una nueva cuenta con datos personales y contraseña válida. |
| Verificar correo | Activa la cuenta a partir del enlace de verificación enviado por correo. |
| Obtener perfil | Retorna los datos del perfil del usuario autenticado. |
| Actualizar perfil | Modifica los datos personales o el método de pago referenciado. |
| Gestionar preferencias de notificación | Activa o desactiva los tipos de notificación configurables por el usuario. |

**Datos de entrada:** Nombre, correo electrónico, contraseña, datos de dirección, referencia de método de pago, preferencias de notificación por tipo de evento.

**Datos de salida:** Identificador de usuario, estado de cuenta, datos de perfil (sin contraseña), preferencias activas.

**Reglas de negocio aplicables:** RN-09 (política de contraseña: mínimo 8 caracteres, una mayúscula, una minúscula, un dígito), RN-12 (preferencias de notificación configurables por el usuario).

**Validaciones:** Correo electrónico con formato válido y único en el sistema. Contraseña cumple RN-09. Campos obligatorios presentes.

**Errores esperados:** INVALID_REQUEST (campos inválidos o faltantes), UNAUTHORIZED (operación de perfil sin sesión activa), PUBLICATION_VALIDATION_ERROR (contraseña no cumple política).

**Seguridad requerida:** Registro es público. Verificación de correo requiere token de verificación válido. Obtener perfil, actualizar perfil y gestionar preferencias requieren sesión activa del propio usuario.

---

### 4.2 Autenticación

**Propósito:** Gestionar el inicio y cierre de sesiones y el ciclo de vida de los tokens de acceso.

**Actor principal:** Comprador, Vendedor, Administrador.

**Operaciones necesarias:**

| Operación | Descripción |
|---|---|
| Iniciar sesión | Valida credenciales y emite un token de acceso con expiración. |
| Cerrar sesión | Invalida el token de acceso activo. |
| Refrescar token | Emite un nuevo token antes de que el actual expire, si la sesión sigue válida. |

**Datos de entrada:** Correo electrónico, contraseña. Para cierre de sesión: token activo.

**Datos de salida:** Token de acceso con expiración, rol del usuario autenticado, identificador de sesión.

**Reglas de negocio aplicables:** RN-08 (bloqueo temporal de 15 minutos tras 3 intentos fallidos consecutivos), RNF-09 (token expira en máximo 24 horas o al cerrar sesión).

**Validaciones:** Credenciales presentes y con formato válido. Cuenta no bloqueada ni suspendida.

**Errores esperados:** INVALID_CREDENTIALS, ACCOUNT_LOCKED (RN-08), ACCOUNT_SUSPENDED, TOKEN_EXPIRED.

**Seguridad requerida:** Operaciones públicas. El token emitido es requerido por todas las operaciones autenticadas del sistema.

---

### 4.3 Productos (Publicaciones)

**Propósito:** Gestionar las publicaciones de productos en el Catálogo a lo largo de su ciclo de vida.

**Actor principal:** Vendedor (creación y gestión), Administrador (eliminación), Visitante y Comprador (lectura pública).

**Operaciones necesarias:**

| Operación | Descripción |
|---|---|
| Crear publicación | Registra una nueva publicación con todos los campos obligatorios validados. |
| Actualizar publicación | Modifica los atributos de una publicación existente del mismo Vendedor. |
| Desactivar publicación | Deshabilita una publicación del Catálogo sin eliminarla. |
| Reactivar publicación | Vuelve a activar una publicación previamente desactivada. |
| Obtener detalle de publicación | Retorna todos los atributos de una publicación específica. |
| Listar publicaciones del vendedor | Retorna todas las publicaciones del Vendedor autenticado. |

**Datos de entrada:** Nombre, descripción, precio, categoría, stock, imágenes. Para actualización: identificador de publicación más campos a modificar.

**Datos de salida:** Publicación con identificador único, marca temporal de creación, estado activo/inactivo, atributos completos.

**Reglas de negocio aplicables:** RN-05 (campos obligatorios: nombre, descripción, precio, categoría, stock, al menos una imagen), RN-06 (precio mayor que cero), RNF-04 (visible en el Catálogo dentro de 60 segundos).

**Validaciones:** Todos los campos de RN-05 presentes. Precio numérico mayor que cero. Categoría existente en el sistema.

**Errores esperados:** PUBLICATION_VALIDATION_ERROR (RN-05 o RN-06 incumplidos), UNAUTHORIZED (operación sin sesión), FORBIDDEN (Vendedor intenta modificar publicación de otro Vendedor).

**Seguridad requerida:** Lectura pública. Creación y modificación requieren Vendedor autenticado y propietario. Eliminación requiere rol Administrador.

---

### 4.4 Búsqueda

**Propósito:** Permitir la exploración y el filtrado del Catálogo de productos disponibles.

**Actor principal:** Visitante, Comprador, Agente Inteligente.

**Operaciones necesarias:**

| Operación | Descripción |
|---|---|
| Buscar productos | Ejecuta una consulta sobre el Catálogo con entidades y restricciones. |
| Aplicar filtro | Reduce el conjunto de resultados activo aplicando una condición adicional. |
| Eliminar filtro | Remueve un filtro específico del conjunto de resultados activo. |
| Aplicar ordenamiento | Reordena el conjunto de resultados activo según un criterio dado. |
| Obtener detalle de producto | Retorna los atributos completos de una publicación para su visualización. |

**Datos de entrada:** Términos de búsqueda, filtros (precio mínimo/máximo, categoría, marca, disponibilidad, calificación mínima, condición de envío), criterio de ordenamiento (precio ascendente/descendente, calificación, relevancia, novedad).

**Datos de salida:** Lista de publicaciones coincidentes con nombre, precio efectivo, imagen principal, nombre del vendedor y calificación promedio. Total de resultados encontrados.

**Reglas de negocio aplicables:** RNF-02 (respuesta en máximo 3 segundos en el percentil 95), RNF-12 (Catálogo de hasta 1.000.000 de publicaciones activas).

**Validaciones:** Términos de búsqueda no vacíos. Filtros de precio con valores numéricos positivos. Criterio de ordenamiento reconocido.

**Errores esperados:** INVALID_REQUEST (parámetros de búsqueda inválidos), PRODUCT_NOT_FOUND (búsqueda sin resultados, informativo).

**Seguridad requerida:** Operaciones públicas. No requiere sesión activa.

---

### 4.5 Carrito

**Propósito:** Gestionar el carrito de compras del Comprador autenticado.

**Actor principal:** Comprador, Agente Inteligente.

**Operaciones necesarias:**

| Operación | Descripción |
|---|---|
| Agregar ítem | Incorpora un producto al carrito con la cantidad indicada. |
| Modificar cantidad | Actualiza la cantidad de un producto ya presente en el carrito. |
| Eliminar ítem | Remueve un producto específico del carrito. |
| Vaciar carrito | Elimina todos los productos del carrito. |
| Obtener carrito | Retorna el contenido completo del carrito con total actualizado. |

**Datos de entrada:** Identificador de publicación, cantidad. Para modificación: nuevo valor de cantidad.

**Datos de salida:** Estado actualizado del carrito con lista de productos, cantidades, precios individuales y total.

**Reglas de negocio aplicables:** RN-02 (Comprador debe estar autenticado para operar el carrito), RNF-01 (respuesta en máximo 2 segundos).

**Validaciones:** Comprador autenticado. Publicación existente y activa. Cantidad mayor que cero.

**Errores esperados:** UNAUTHORIZED (RN-02), PRODUCT_NOT_FOUND, OUT_OF_STOCK (stock insuficiente para la cantidad solicitada).

**Seguridad requerida:** Requiere sesión activa con rol Comprador. El Comprador solo puede acceder a su propio carrito.

---

### 4.6 Pedidos (Órdenes)

**Propósito:** Gestionar el ciclo de vida completo de las órdenes desde su registro hasta su resolución.

**Actor principal:** Comprador (creación y consulta propia), Vendedor (consulta y actualización de sus órdenes), Administrador (gestión de órdenes escaladas).

**Operaciones necesarias:**

| Operación | Descripción |
|---|---|
| Crear orden | Registra una nueva orden tras confirmación explícita y pago aprobado. |
| Obtener orden | Retorna el detalle de una orden específica. |
| Listar órdenes del comprador | Retorna el historial de órdenes del Comprador autenticado. |
| Listar órdenes del vendedor | Retorna las órdenes recibidas que incluyen productos del Vendedor autenticado. |
| Actualizar estado de orden | Modifica el estado de una orden dentro del ciclo de vida permitido. |

**Datos de entrada:** Contenido del carrito validado y referencia de pago confirmado. Para actualización de estado: identificador de orden y nuevo estado.

**Datos de salida:** Orden con número de confirmación único, marca temporal, estado actual, lista de productos, total, identificadores del Comprador y del Vendedor.

**Reglas de negocio aplicables:** RN-01 (confirmación explícita antes del registro), RN-03 (verificación de stock antes del pago), RN-04 (decremento atómico de stock al registrar la orden), RN-07 (escalamiento automático al Administrador si la orden permanece en estado pendiente más de 24 horas).

**Validaciones:** Sesión activa del Comprador. Carrito no vacío. Pago confirmado por la pasarela antes del registro.

**Errores esperados:** INSUFFICIENT_STOCK, PAYMENT_REQUIRED (intento de registro sin pago confirmado), ORDER_NOT_FOUND, UNAUTHORIZED (acceso a orden de otro Comprador), CART_EMPTY.

**Seguridad requerida:** Requiere sesión activa. El Comprador solo accede a sus propias órdenes. El Vendedor solo accede a órdenes que contienen sus publicaciones. El Administrador accede a todas las órdenes escaladas.

---

### 4.7 Pagos

**Propósito:** Coordinar el proceso de cobro con la pasarela de pago externa dentro del flujo de compra.

**Actor principal:** Comprador (inicia), sistema (consulta estado).

**Operaciones necesarias:**

| Operación | Descripción |
|---|---|
| Iniciar proceso de pago | Envía la solicitud de cobro a la pasarela con el importe y la referencia del método de pago. |
| Consultar estado de pago | Consulta el resultado de una transacción en curso o reciente. |

**Datos de entrada:** Importe de la transacción, referencia del método de pago (nunca datos completos de tarjeta), identificador de la orden asociada, clave de idempotencia.

**Datos de salida:** Estado de la transacción (aprobada / rechazada), identificador de referencia de la transacción provisto por la pasarela, motivo de rechazo en caso de fallo.

**Reglas de negocio aplicables:** RNF-10 (el sistema nunca almacena datos completos de tarjeta), RNF-03 (el proceso completo desde confirmación de pago hasta número de orden no supera 5 segundos).

**Validaciones:** Importe mayor que cero. Referencia de método de pago presente. Clave de idempotencia única por intento.

**Errores esperados:** PAYMENT_REJECTED (fondos insuficientes, tarjeta expirada, detección de fraude), PAYMENT_TIMEOUT (pasarela sin respuesta dentro del umbral), INVALID_PAYMENT_METHOD.

**Seguridad requerida:** Requiere sesión activa del Comprador. Los datos completos de tarjeta nunca atraviesan la lógica del sistema.

---

### 4.8 Conversaciones (Agente IA)

**Propósito:** Gestionar la interacción del Comprador con el Agente Inteligente a través de texto y voz.

**Actor principal:** Comprador.

**Operaciones necesarias:**

| Operación | Descripción |
|---|---|
| Enviar instrucción en texto | Envía una instrucción escrita al Agente para su interpretación y ejecución. |
| Enviar instrucción en voz | Envía un audio capturado del Comprador para transcripción y procesamiento. |
| Obtener respuesta del agente | Retorna el resultado de la última instrucción procesada con el contexto actualizado. |
| Confirmar acción irreversible | Envía la confirmación explícita del Comprador para ejecutar una acción pendiente de confirmación. |
| Cancelar acción en curso | Cancela una acción que está en estado de espera de confirmación. |
| Obtener historial de conversación activa | Retorna los turnos de la conversación activa en la sesión actual. |

**Datos de entrada:** Texto libre de la instrucción, o audio capturado. Identificador de sesión activa.

**Datos de salida:** Acción ejecutada, resultado en lenguaje natural, estado actualizado del Agente, contexto de sesión actualizado. Para instrucciones de voz: respuesta también en audio si el servicio TTS está disponible.

**Reglas de negocio aplicables:** RN-01 (confirmación antes de acción irreversible), RN-11 (umbral de confianza STT), RN-14 (expiración de sesión a los 30 minutos de inactividad), RNF-01 (respuesta en máximo 2 segundos).

**Validaciones:** Instrucción de texto no vacía (EMPTY_INPUT). Longitud de texto dentro del límite establecido (INPUT_TOO_LONG). Nivel de confianza STT supera el umbral (LOW_CONFIDENCE). Sesión no expirada.

**Errores esperados:** EMPTY_INPUT, INPUT_TOO_LONG, LOW_CONFIDENCE, AGENT_UNAVAILABLE (servicio NLP no disponible), SESSION_EXPIRED (RN-14), UNAUTHORIZED (Comprador no autenticado para operaciones de carrito o compra).

**Seguridad requerida:** Requiere sesión activa para operaciones de carrito y compra (RN-02). El historial de conversación es exclusivo del Comprador propietario de la sesión.

---

### 4.9 Notificaciones

**Propósito:** Gestionar la consulta y configuración de las notificaciones del usuario.

**Actor principal:** Comprador, Vendedor.

**Operaciones necesarias:**

| Operación | Descripción |
|---|---|
| Obtener notificaciones del usuario | Retorna las notificaciones recibidas por el usuario autenticado. |
| Marcar como leída | Marca una notificación específica como leída. |
| Actualizar preferencias de notificación | Activa o desactiva tipos de notificación configurables. |

**Datos de entrada:** Para consulta: filtros opcionales por tipo o estado (leída/no leída). Para preferencias: tipo de notificación y estado deseado (activo/inactivo).

**Datos de salida:** Lista de notificaciones con tipo, contenido y marca temporal. Estado actualizado de preferencias.

**Reglas de negocio aplicables:** RN-12 (el usuario puede desactivar tipos de notificación no obligatorios; las notificaciones de seguridad se envían siempre).

**Validaciones:** Sesión activa. Las notificaciones de seguridad no pueden desactivarse.

**Errores esperados:** UNAUTHORIZED, INVALID_REQUEST (tipo de notificación no reconocido).

**Seguridad requerida:** Requiere sesión activa. El usuario solo puede acceder a sus propias notificaciones.

---

## 5. Contratos del Agente Inteligente

### Entrada por texto

**Actor:** Comprador con sesión activa.
**Entrada:** Texto libre con la instrucción del usuario. Contexto de la sesión activa (historial reciente, conjunto de resultados activo, filtros aplicados).
**Salida:** Acción ejecutada con descripción, resultado de la acción, mensaje de respuesta en lenguaje natural, estado actualizado del Agente y del contexto de sesión.

### Entrada por voz

**Actor:** Comprador con sesión activa y modo de voz activado.
**Entrada:** Audio capturado del micrófono del Comprador.
**Procesamiento:** El audio es enviado al servicio STT, que retorna la transcripción con su nivel de confianza. El Agente verifica que el nivel de confianza supera el umbral configurado (RN-11). Si supera el umbral, la transcripción es procesada exactamente como una instrucción de texto.
**Salida:** Resultado de la acción en texto. Cuando el servicio TTS está disponible, también se retorna la respuesta sintetizada en audio.

### Interpretación

**Entrada:** Texto de la instrucción con contexto de sesión activa.
**Salida:** Intención identificada (buscar, filtrar, ordenar, comparar, agregar al carrito, comprar, ver carrito), entidades extraídas con tipo y valor, restricciones identificadas, nivel de confianza de la interpretación.

### Confirmación

**Entrada:** Resumen de la acción irreversible pendiente (productos, cantidades, precios, total, método de pago).
**Salida:** Estado de confirmación con dos valores posibles: confirmado (el flujo continúa hacia el módulo de pagos) o cancelado (el carrito se conserva sin cambios).

### Resultado

**Estructura de salida:** Acción ejecutada (nombre de la intención procesada), datos del resultado (lista de productos, estado del carrito, número de orden, según corresponda), mensaje del Agente en lenguaje natural que informa la acción y el resultado (RNF-13), estado del contexto actualizado (conjunto de resultados activo, filtros vigentes, estado del Agente).

---

## 6. Catálogo de Errores del Sistema

| Código | Descripción | Causa | Módulo Origen | Acción recomendada |
|---|---|---|---|---|
| EMPTY_INPUT | La instrucción está vacía | El usuario envió una instrucción sin contenido | Agente Inteligente | Ingresar una instrucción con contenido |
| INPUT_TOO_LONG | La instrucción supera la longitud máxima | El texto enviado excede el límite permitido | Agente Inteligente | Reducir la longitud de la instrucción |
| INVALID_REQUEST | Los datos de la solicitud no son válidos | Campos faltantes, formatos incorrectos o valores fuera de rango | Cualquier módulo | Revisar los datos enviados |
| LOW_CONFIDENCE | Nivel de confianza STT por debajo del umbral (RN-11) | El audio no fue transcrito con suficiente certeza | Agente Inteligente | Repetir la instrucción o cambiar al modo texto |
| UNAUTHORIZED | Operación sin sesión activa o con rol insuficiente | El usuario no está autenticado | Autenticación | Iniciar sesión antes de continuar |
| FORBIDDEN | Sesión activa pero sin permiso sobre el recurso | El usuario intenta acceder a recursos de otro usuario o con rol insuficiente | Cualquier módulo | Verificar que el recurso pertenece al usuario |
| PRODUCT_NOT_FOUND | El producto no existe en el Catálogo | Identificador inválido o publicación eliminada | Productos / Búsquedas | Buscar el producto nuevamente |
| OUT_OF_STOCK | El producto no tiene stock disponible | El stock llegó a cero tras la última verificación | Inventario / Carrito | Elegir un producto alternativo |
| INSUFFICIENT_STOCK | Stock insuficiente para la cantidad solicitada | La cantidad supera las unidades disponibles | Inventario / Pedidos | Reducir la cantidad o elegir alternativa |
| CART_EMPTY | El carrito no tiene productos | Se inició el proceso de compra con el carrito vacío | Carrito | Agregar productos al carrito |
| ORDER_NOT_FOUND | La orden no existe | Identificador de orden inválido o no pertenece al usuario | Pedidos | Verificar el identificador de orden |
| PAYMENT_REJECTED | El pago fue rechazado por la pasarela | Fondos insuficientes, tarjeta expirada o detección de fraude | Pagos | Usar otro método de pago |
| PAYMENT_TIMEOUT | La pasarela no respondió en el tiempo establecido | Fallo de comunicación con la pasarela | Pagos | Reintentar el proceso de pago |
| ACCOUNT_LOCKED | La cuenta está bloqueada temporalmente (RN-08) | Tres intentos de autenticación fallidos consecutivos | Autenticación | Esperar 15 minutos antes de reintentar |
| ACCOUNT_SUSPENDED | La cuenta fue suspendida por un Administrador | Incumplimiento de las políticas del Marketplace | Autenticación | Contactar al soporte del Marketplace |
| TOKEN_EXPIRED | El token de acceso ha expirado (RNF-09) | Han transcurrido más de 24 horas desde la emisión | Autenticación | Iniciar sesión nuevamente |
| SESSION_EXPIRED | La sesión del Agente expiró por inactividad (RN-14) | Han transcurrido 30 minutos sin actividad del Comprador | Agente Inteligente | Iniciar una nueva conversación |
| AGENT_UNAVAILABLE | El servicio de interpretación de lenguaje no está disponible | El proveedor de NLP no responde | Agente Inteligente | Navegar el Marketplace de forma manual |
| STT_UNAVAILABLE | El servicio de reconocimiento de voz no está disponible | El servicio STT no responde | Agente Inteligente | Cambiar al modo de entrada por texto |
| TTS_UNAVAILABLE | El servicio de síntesis de voz no está disponible | El servicio TTS no responde | Agente Inteligente | La respuesta se presenta solo en texto |
| PUBLICATION_VALIDATION_ERROR | La publicación no cumple los campos obligatorios o el precio es inválido | Incumplimiento de RN-05 o RN-06 | Productos | Completar todos los campos obligatorios con valores válidos |
| COMPARISON_LIMIT_EXCEEDED | Se intentó comparar más de 5 productos (RN-13) | La cantidad de productos seleccionados supera el límite | Agente Inteligente | Seleccionar entre 2 y 5 productos para comparar |
| INVALID_PAYMENT_METHOD | El método de pago no es válido o no está registrado | Referencia de pago expirada o no reconocida | Pagos | Registrar un método de pago válido |

---

## 7. Consideraciones de Seguridad Transversal

**Autenticación requerida:** Toda operación que modifique estado o acceda a datos privados requiere sesión activa verificada. El acceso público se limita exclusivamente a operaciones de lectura del catálogo y al proceso de registro.

**Validación en frontera:** Toda entrada es validada en la capa de comunicación antes de ser procesada por la lógica de negocio. Los módulos internos no reciben datos sin validar (L-01 según la arquitectura).

**Limitación de frecuencia:** Se aplica un control conceptual de frecuencia de solicitudes para prevenir el abuso de operaciones críticas como autenticación, registro y procesamiento de instrucciones del Agente.

**Registro de auditoría:** Toda solicitud autenticada que modifique el estado del sistema genera un registro de auditoría con marca temporal, identificador de usuario, operación ejecutada y resultado. Los registros no incluyen contraseñas, datos de tarjeta ni datos personales sensibles (RNF-17).
