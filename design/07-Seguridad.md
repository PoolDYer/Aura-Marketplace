# Diseño de Seguridad — Aura Marketplace

## 1. Objetivos de Seguridad

Derivados de los requisitos RNF-07 al RNF-10 y del objetivo estratégico OBJ-06:

| Objetivo | Descripción | Origen |
|---|---|---|
| SEG-01 | Proteger los datos personales de los usuarios frente a accesos no autorizados. | RNF-08, OBJ-06 |
| SEG-02 | Prevenir el acceso no autorizado a funcionalidades y datos del sistema mediante verificación de identidad y roles. | RNF-07, RNF-09 |
| SEG-03 | Proteger los datos de pago garantizando que el sistema nunca almacena ni procesa información completa de tarjetas. | RNF-10 |
| SEG-04 | Registrar las operaciones críticas del sistema para permitir auditoría e investigación de incidentes. | RNF-17 |
| SEG-05 | Mantener la continuidad del servicio ante intentos de abuso y fallos de servicios externos. | RNF-06, RN-08 |

---

## 2. Principios de Seguridad

| Principio | Descripción |
|---|---|
| Defensa en profundidad | La seguridad se aplica en múltiples capas del sistema: entrada, lógica de negocio y almacenamiento. El fallo de una capa no compromete las demás. |
| Mínimo privilegio | Cada actor y cada módulo del sistema accede únicamente a los recursos y operaciones estrictamente necesarios para cumplir su función. |
| Separación de roles | Las capacidades de Visitante, Comprador, Vendedor y Administrador están claramente delimitadas. Ningún rol hereda automáticamente las capacidades de un rol superior. |
| Seguridad por defecto | El estado inicial de cualquier operación o recurso es el más restrictivo. El acceso se concede explícitamente, nunca se asume. |
| No almacenar lo que no es necesario | El sistema no persiste datos que no son estrictamente necesarios para su operación. Datos de tarjeta completos, contraseñas en claro y contenido de conversaciones pasadas no se retienen. |
| Confidencialidad en tránsito | Toda comunicación entre el usuario y el sistema, y entre el sistema y sus integraciones externas, se realiza mediante canales cifrados (RNF-08). |
| Autenticidad verificable | Toda solicitud autenticada lleva consigo un token verificable que acredita la identidad y el rol del usuario sin requerir consultas adicionales en cada operación. |
| No repudio | Las operaciones críticas quedan registradas en el sistema de auditoría con suficiente detalle para que no puedan ser negadas por el actor que las ejecutó. |

---

## 3. Gestión de Identidad

### 3.1 Registro y Verificación

El proceso de registro crea una cuenta en estado pendiente de verificación. El sistema valida que la contraseña cumple la política establecida en RN-09: mínimo 8 caracteres, al menos una letra mayúscula, al menos una letra minúscula y al menos un dígito numérico. Si la contraseña no cumple la política, el registro es rechazado e informado con los criterios específicos no satisfechos. Tras la creación de la cuenta, el sistema envía un correo de verificación al usuario. La cuenta solo queda activa tras la confirmación del correo. Hasta ese momento, no se puede iniciar sesión.

### 3.2 Autenticación

Al recibir las credenciales, el sistema verifica que el correo existe, que la cuenta está activa y que la contraseña proporcionada corresponde al hash almacenado. Si la verificación es exitosa, el sistema emite un token de acceso que contiene el identificador del usuario, su rol y la marca temporal de expiración. El token de acceso (Access Token) local expira después de 15 minutos en producción, y el Refresh Token expira después de 7 días (RNF-09). Cada token está asociado a una sesión específica.

### 3.3 Control de Bloqueo

El sistema contabiliza los intentos de autenticación fallidos consecutivos para cada cuenta. Tras tres intentos fallidos consecutivos, la cuenta es bloqueada temporalmente por 15 minutos (RN-08). Durante el bloqueo, ninguna combinación de credenciales permite iniciar sesión, aunque sea correcta. El contador de intentos fallidos se reinicia a cero tras una autenticación exitosa o tras el vencimiento del período de bloqueo. El Administrador puede desbloquear manualmente una cuenta.

### 3.4 Gestión de Tokens

El token de acceso contiene el identificador del usuario, su rol en el sistema y la marca temporal de expiración. Al cerrar sesión, los tokens son invalidados de forma inmediata e irrecuperable en el sistema. Un token invalidado no puede reutilizarse aunque su marca temporal de expiración aún no haya llegado (RNF-09). La invalidación es registrada en el sistema de auditoría.

---

## 4. Modelo de Roles y Permisos

### Visitante

Accede a la exploración del Catálogo, búsqueda y filtrado de productos, y visualización del detalle de publicaciones.

**No puede:** iniciar sesión con otra cuenta que no sea la suya, agregar productos al carrito, iniciar procesos de compra, acceder a perfiles de usuarios, gestionar publicaciones ni ver órdenes.

### Comprador

Todo lo que puede hacer el Visitante, más: gestionar su propio carrito, ejecutar el proceso de compra, consultar y hacer seguimiento de sus propias órdenes, actualizar su perfil y preferencias, gestionar su lista de favoritos, dejar reseñas de productos que compró, e interactuar con el Agente Inteligente para todas las operaciones anteriores.

**No puede:** crear ni modificar publicaciones, acceder a órdenes o carritos de otros Compradores, gestionar cuentas de usuarios, ni acceder a reportes del sistema.

### Vendedor

Todo lo que puede hacer el Comprador, más: crear, modificar, desactivar y reactivar sus propias publicaciones, y gestionar las órdenes recibidas que contienen sus productos.

**No puede:** modificar publicaciones de otros Vendedores, acceder a órdenes que no incluyan sus productos, gestionar cuentas de usuarios, ni acceder a reportes globales del sistema.

### Administrador

Todo lo que puede hacer el Vendedor, más: suspender y reactivar cuentas de cualquier usuario, eliminar publicaciones por incumplimiento de políticas, resolver órdenes escaladas, y consultar reportes agregados de ventas y actividad.

**No puede:** ejecutar compras en nombre de un Comprador, modificar el contenido de publicaciones (solo eliminarlas), acceder al carrito o historial de conversación de usuarios específicos, ni impersonar a otro usuario.

---

## 5. Control de Autorización

Cada operación del sistema verifica la identidad y el rol del solicitante antes de ejecutarse. La verificación de autorización ocurre en la capa de lógica de negocio, no exclusivamente en la interfaz.

**Propietario de recursos:** El Vendedor solo puede consultar y modificar sus propias publicaciones. Cualquier intento de acceder a publicaciones de otro Vendedor retorna el error FORBIDDEN. El Comprador solo puede acceder a su propio carrito, historial de órdenes y conversación.

**Operaciones transaccionales del Agente:** Antes de ejecutar cualquier operación de carrito o compra, el Agente Inteligente verifica que el Comprador tiene sesión activa (RN-02). Si no la tiene, el Agente redirige al proceso de autenticación sin ejecutar la operación.

**Administrador:** Tiene capacidad de acceso a cuentas y publicaciones globales, pero no puede actuar en nombre de usuarios específicos en transacciones comerciales. El Administrador no puede comprar ni agregar al carrito en representación de un Comprador.

---

## 6. Protección de Datos

### 6.1 Datos personales

Los datos personales se almacenan únicamente en la medida necesaria para el funcionamiento del sistema. El acceso a datos de perfil está restringido al propio usuario y al Administrador para funciones de gestión de cuentas.

### 6.2 Contraseñas

Las contraseñas se almacenan de forma segura utilizando hashes derivados con Argon2 (RNF-07). El sistema nunca tiene acceso a la contraseña original en texto plano tras su recepción en el punto de registro o autenticación. Las contraseñas no aparecen en registros de auditoría, respuestas de operaciones ni mensajes de error.

### 6.3 Datos de pago

El sistema nunca almacena el número completo de tarjeta, el código de seguridad ni la fecha de vencimiento en ninguna capa de datos propia (RNF-10). El único dato de pago que el sistema retiene es el identificador de referencia provisto por la pasarela de pago tras una transacción. Los datos completos de pago son gestionados íntegramente por la pasarela externa.

### 6.4 Datos conversacionales

El historial de conversación del Agente Inteligente está vinculado exclusivamente a la sesión activa del Comprador. Cuando la sesión expira por inactividad (RN-14, 30 minutos), el contexto conversacional es eliminado. El historial de una sesión no es accesible desde sesiones posteriores. Los datos conversacionales no se transfieren a ningún servicio externo más allá de lo estrictamente necesario para la interpretación de cada instrucción.

### 6.5 Transmisión segura

Toda comunicación entre la capa de presentación y el sistema, y entre el sistema y sus integraciones externas (proveedor de NLP, servicio STT, API de síntesis de voz del navegador, pasarela de pago de Mercado Pago, servicio de notificaciones de Resend), se realiza mediante canales cifrados (RNF-08). Ningún dato sensible —credenciales, referencia de método de pago, datos personales— puede transmitirse en texto plano.

---

## 7. Seguridad del Agente Inteligente

### 7.1 Protección contra instrucciones maliciosas

Toda instrucción enviada al Agente es tratada como datos del usuario, nunca como comandos del sistema. El contenido de la instrucción es procesado por el proveedor de NLP para identificar intenciones del dominio del Marketplace. El sistema no ejecuta operaciones del sistema a partir del contenido literal de instrucciones.

### 7.2 Validación de entradas

Las instrucciones son validadas en la capa de entrada antes de enviarse al Agente. Una instrucción vacía es rechazada con el error EMPTY_INPUT. Una instrucción que supera la longitud máxima definida es rechazada con el error INPUT_TOO_LONG. Contenido de tipo no textual es rechazado en la entrada por texto. El audio en la entrada por voz es procesado únicamente por el adaptador STT y nunca es ejecutado directamente.

### 7.3 Control de acciones críticas

Ninguna operación irreversible —en particular, el proceso de compra— se ejecuta sin una confirmación explícita del Comprador (RN-01). El Agente presenta el resumen completo de la acción y detiene el flujo hasta recibir la respuesta del usuario. La verificación de autenticación ocurre antes de toda operación de carrito o compra (RN-02).

### 7.4 Gestión de confianza STT

Las transcripciones producidas por el servicio STT con un nivel de confianza inferior al umbral configurado no son procesadas como instrucciones (RN-11). El Agente informa al Comprador que la instrucción de voz no pudo ser interpretada con certeza suficiente y le ofrece la opción de repetirla o escribirla. Ninguna acción es ejecutada a partir de una transcripción de baja confianza.

### 7.5 Información sensible en conversaciones

El Agente nunca solicita al usuario su contraseña, datos completos de tarjeta ni credenciales de seguridad de ningún tipo. Las respuestas del Agente nunca incluyen números de tarjeta, tokens de sesión ni claves de acceso. Si el usuario introduce voluntariamente información sensible en una instrucción, el Agente no la registra en el historial conversacional ni la envía al proveedor de NLP como parte del contexto.

### 7.6 Expiración de sesión

Tras 30 minutos de inactividad del Comprador, el contexto de la sesión del Agente es eliminado y la sesión es marcada como expirada (RN-14). Esto impide que el contexto acumulado de una sesión sin supervisión sea utilizado por una persona distinta o explotado tras un período de inactividad prolongado. Las instrucciones emitidas después de la expiración se procesan sin contexto previo.

---

## 8. Auditoría de Seguridad

Los siguientes eventos generan registros de auditoría obligatorios en el sistema (RNF-17):

| Categoría | Eventos auditados |
|---|---|
| Autenticación | Intento de autenticación exitoso, intento de autenticación fallido, cierre de sesión, emisión de token, invalidación de token. |
| Control de acceso | Bloqueo de cuenta por intentos fallidos (RN-08), desbloqueo de cuenta por Administrador, asignación o modificación de rol. |
| Publicaciones | Creación de publicación, modificación de atributos, desactivación, reactivación, eliminación por Administrador. |
| Órdenes y pagos | Registro de orden, inicio de proceso de pago, confirmación de pago, rechazo | Agente Inteligente | Instrucción procesada con resultado, confirmación de acción irreversible, cancelación de acción pendiente. |
| Integraciones externas | Error de comunicación con proveedor de NLP, con servicio STT, con la API Web Speech del navegador, con pasarela de pago, con servicio de notificaciones. |

**Estructura de cada registro de auditoría:** Marca temporal (fecha y hora con precisión de segundo), identificador del usuario que ejecutó la acción, tipo de acción, módulo de origen, resultado de la operación (exitoso / fallido) y, cuando aplique, identificador del recurso afectado (orden, publicación, cuenta).

**Exclusiones obligatorias:** Los registros no incluyen contraseñas, datos completos de tarjeta, tokens de acceso activos ni datos personales más allá del identificador del usuario necesario para la trazabilidad.

---

## 9. Disponibilidad y Resiliencia

**Degradación controlada ante fallos externos (RNF-06):** Cuando el servicio NLP no está disponible, el Agente informa al usuario y el Marketplace continúa operativo mediante navegación manual. Cuando el servicio STT o la API Web Speech no responden, el modo de texto continúa funcionando con normalidad. El fallo de un servicio externo no bloquea la totalidad del sistema.

**Limitación de frecuencia:** Se aplica un control de frecuencia sobre operaciones susceptibles de abuso: intentos de autenticación, registro de cuentas y envío de instrucciones al Agente. Este control previene el agotamiento de recursos y los intentos de fuerza bruta.

**Bloqueo por intentos fallidos (RN-08):** El mecanismo de bloqueo temporal de cuenta actúa simultáneamente como control de seguridad ante ataques de adivinación de contraseña y como medida de protección de disponibilidad para cuentas individuales.

**Preservación del carrito:** Ante un fallo del proceso de pago, el carrito del Comprador se preserva intacto, lo que permite reintentar la operación sin reconstruir el estado de la sesión.

**Sin punto único de fallo en autenticación:** El flujo de autenticación no depende de un único componente cuyo fallo impida a todos los usuarios iniciar sesión.

---

## 10. Privacidad y Protección de Datos Personales

Los datos personales recopilados están limitados a los necesarios para el funcionamiento del Marketplace: identificación del usuario, dirección de entrega y referencia de método de pago. No se recopilan datos adicionales de uso o comportamiento más allá de lo requerido por el sistema.

Los usuarios pueden actualizar sus datos personales y configurar sus preferencias de notificación en cualquier momento. Las preferencias de notificación son completamente controladas por el usuario para todos los tipos de evento no relacionados con la seguridad (RN-12). Las notificaciones de seguridad —como alertas de inicio de sesión— no pueden desactivarse.

El historial conversacional del Agente Inteligente no es retenido más allá del alcance de la sesión activa. No se comparte entre sesiones ni se utiliza para perfilado del usuario.

Los registros de auditoría incluyen únicamente los identificadores mínimos necesarios para la trazabilidad, sin datos personales adicionales.

---

## 11. Trazabilidad con la Especificación

| Decisión de seguridad | Fuente |
|---|---|
| Contraseñas almacenadas utilizando Argon2 | RNF-07 |
| Comunicaciones en canales cifrados | RNF-08 |
| Política de contraseña (8 chars, mayúscula, minúscula, dígito) | RN-09 |
| Tokens de acceso (15m) y Refresh Tokens (7d) con expiración | RNF-09 |
| No almacenamiento de datos completos de tarjeta | RNF-10 |
| Registro de auditoría de operaciones críticas | RNF-17 |
| Confirmación explícita antes de acciones irreversibles | RN-01 |
| Verificación de autenticación para carrito y compra | RN-02 |
| Bloqueo temporal de cuenta tras 3 intentos fallidos | RN-08 |
| Umbral de confianza STT antes de procesar transcripción | RN-11 |
| Preferencias de notificación controladas por el usuario | RN-12 |
| Expiración del contexto de sesión a los 30 minutos | RN-14 |
| Protección de datos del usuario y auditoría | OBJ-06 |

---

## 12. Implementación Tecnológica de la Seguridad

> Esta sección fue agregada durante la actualización tecnológica de la Fase 2. No modifica los principios ni requisitos definidos en las secciones anteriores.

| Decisión de seguridad | Tecnología implementadora | Ubicación en la arquitectura |
|---|---|---|
| Hash de contraseñas con sal | Argon2 | L-05 — ejecutado solo en el adaptador de autenticación, nunca en L-03/L-04 |
| Tokens de acceso stateless | JWT Access Token (15min) | L-05 emisión, L-03 validación mediante Guards NestJS |
| Renovación transparente de sesión | JWT Refresh Token (7 días) | L-05 persistido como referencia en base de datos Neon; invalidado en logout |
| Control de acceso por rol | RBAC mediante NestJS Guards + Decoradores `@Roles()` | L-03 — verificado antes de ejecutar cualquier operación |
| Validación de entrada en frontera | Zod (L-01) + class-validator (L-03) | L-01 frontend y L-03 backend — doble validación antes de llegar al dominio |
| Cifrado en tránsito | TLS automático en Render (backend) + Cloudflare HTTPS (frontend) | L-01 y L-03/L-05 — satisface RNF-08 sin configuración manual |
| Protección de datos de tarjeta | Adaptador Pasarela de Pago en L-05 | Los datos completos de tarjeta nunca cruzan L-03/L-04/Prisma |
| Auditoría de operaciones | Módulo Auditoría NestJS + tabla Auditoria en Neon PostgreSQL | L-03 (interceptors de auditoría) + L-05 (persistencia inmutable) |
| Política de contraseñas | Zod schema compartido frontend-backend | RF-01 validación, RN-09 cumplimiento |
| Bloqueo de cuenta | Contador de intentos en tabla Usuario (Prisma/Neon) + lógica en L-04 | RN-08 — estado de bloqueo persistido y verificado en cada autenticación |
