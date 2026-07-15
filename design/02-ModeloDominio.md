# Modelo de Dominio — Aura Marketplace

## 1. Descripción del Dominio

El dominio de Aura Marketplace representa una plataforma de comercio electrónico que conecta Compradores y Vendedores para realizar transacciones de productos. Su característica distintiva es la presencia de un Agente Inteligente que interpreta instrucciones en lenguaje natural y ejecuta acciones funcionales en nombre del usuario: búsqueda, filtrado, ordenamiento, comparación de productos, gestión del carrito y ejecución de compras.

El dominio abarca la publicación y gestión de productos, la exploración y descubrimiento del catálogo, el proceso transaccional completo (desde la expresión de intención hasta la confirmación de la orden), la gestión de usuarios y roles, y la administración operativa de la plataforma.

---

## 2. Subdominios Identificados

### Core Domain — Dominio Principal

| Subdominio | Descripción |
|---|---|
| Agente Inteligente | Capacidad central y diferenciadora del sistema. Interpreta lenguaje natural, mantiene contexto conversacional y coordina la ejecución de acciones funcionales. |
| Catálogo de Productos | Conjunto de publicaciones activas disponibles para ser exploradas y adquiridas. La calidad y precisión del catálogo determina el valor del marketplace para los compradores. |

### Supporting Domains — Dominios de Soporte

| Subdominio | Descripción |
|---|---|
| Gestión de Órdenes | Registra, gestiona y hace seguimiento del ciclo de vida de las transacciones de compra. |
| Gestión de Publicaciones | Permite a los Vendedores crear y mantener su oferta de productos en el Catálogo. |
| Gestión de Carrito | Mantiene el estado temporal de los productos seleccionados por el Comprador antes de la compra. |

### Generic Domains — Dominios Genéricos

| Subdominio | Descripción |
|---|---|
| Autenticación | Registro, verificación de identidad y gestión de sesiones de usuarios. |
| Notificaciones | Comunicación de eventos relevantes a Compradores y Vendedores. |
| Pagos | Coordinación con la Pasarela de Pago para procesar las transacciones financieras. |

---

## 3. Lenguaje Ubicuo

| Término | Significado en el Dominio |
|---|---|
| Agente Inteligente | Componente central que interpreta instrucciones en lenguaje natural y ejecuta Acciones funcionales en el Marketplace en nombre del usuario. No es un chatbot pasivo: es un actor funcional. |
| Acción | Operación concreta ejecutada por el Agente: buscar, filtrar, ordenar, comparar, agregar al carrito, comprar. |
| Comprador | Usuario autenticado cuyo objetivo es encontrar y adquirir productos mediante el Agente o navegación directa. |
| Vendedor | Usuario autenticado cuyo objetivo es publicar y vender productos en el Catálogo. |
| Administrador | Actor interno con privilegios elevados para gestionar usuarios, publicaciones y órdenes. |
| Visitante | Usuario no autenticado que puede explorar el Catálogo pero no realizar transacciones. |
| Publicación | Registro creado por un Vendedor en el Catálogo con nombre, descripción, precio, categoría, stock e imágenes. |
| Catálogo | Conjunto de Publicaciones activas disponibles para ser exploradas por los Compradores. |
| Carrito | Contenedor temporal de productos seleccionados por el Comprador durante una Sesión activa. |
| Orden | Registro formal de una transacción de compra completada, con todos sus datos y estado. |
| Sesión | Período activo de interacción de un usuario autenticado con el Marketplace. |
| Contexto de Sesión | Estado interno del Agente durante una Sesión: historial, resultados activos, filtros aplicados. |
| Intención | Propósito comunicado por el usuario en una instrucción en lenguaje natural (buscar, filtrar, comprar, etc.). |
| Entidad | Elemento de información extraído de una instrucción: nombre de producto, marca, categoría, precio, condición de envío. |
| Restricción | Condición limitante en la instrucción que el Agente debe aplicar al ejecutar la Acción. |
| Filtro | Criterio aplicado sobre el conjunto de resultados activo para reducirlo. |
| Resultado | Conjunto de productos retornados por el sistema en respuesta a una búsqueda. |
| Stock | Cantidad de unidades disponibles de un producto en una Publicación. |
| Confianza STT | Nivel numérico de certeza del servicio de transcripción de voz sobre la precisión del texto generado. |
| Modo de Voz | Estado del Agente en el que la entrada y salida se realizan mediante audio. |
| Notificación | Mensaje enviado por el sistema a un usuario ante un evento relevante. |
| Pasarela de Pago | Servicio externo que procesa las transacciones financieras entre Compradores y Vendedores. |
| Estado de Orden | Fase en el ciclo de vida de una Orden: pendiente, confirmada, en preparación, despachada, entregada, cancelada, escalada. |
| Ordenamiento | Criterio para organizar los resultados: precio asc., precio desc., calificación, relevancia, novedad. |
| Vista Comparativa | Presentación estructurada de atributos de 2 a 5 productos en paralelo. |

---

## 4. Entidades Principales

### Usuario
Representa a cualquier persona que interactúa con el Marketplace. Tiene identidad, credenciales y un rol asignado. Sus variantes son:
- **Comprador**: puede explorar el Catálogo, usar el Agente, gestionar su Carrito y realizar compras.
- **Vendedor**: puede crear y gestionar Publicaciones y atender Órdenes de sus productos.
- **Administrador**: puede gestionar cuentas y Publicaciones, y resolver escalamientos.

### Publicación
Registro que un Vendedor crea en el Catálogo para poner un producto a disposición de los Compradores. Contiene la información necesaria para que el Comprador tome una decisión de compra. Tiene un ciclo de vida propio (borrador, activa, inactiva, eliminada).

### Producto
Bien específico descrito dentro de una Publicación. Tiene atributos como nombre, marca, descripción y categoría. Puede estar referenciado por múltiples Publicaciones de distintos Vendedores.

### Categoría
Clasificación temática que organiza los Productos en el Catálogo (Calzado, Electrónica, Ropa, Deportes, etc.). Permite el filtrado y la navegación estructurada.

### Carrito
Contenedor temporal perteneciente a un Comprador que acumula los productos seleccionados antes de la compra. Persiste durante la Sesión activa. Solo puede ser gestionado por Compradores autenticados (RN-02).

### ItemCarrito
Unidad dentro del Carrito que representa una Publicación específica con una cantidad determinada.

### Orden
Registro formal e inmutable de una transacción de compra. Se genera al confirmar el pago y contiene todos los datos de la transacción. Tiene su propio ciclo de vida.

### LineaOrden
Unidad dentro de una Orden que representa un producto comprado, con su cantidad, precio unitario y referencia a la Publicación.

### Sesión (del Agente)
Período de interacción activa de un Comprador con el Agente Inteligente. Tiene un tiempo de vida controlado por inactividad (RN-14: 30 minutos).

### ContextoSesion
Estado interno de la Sesión del Agente: historial de instrucciones procesadas, conjunto de resultados activo, filtros activos, referencias a objetos anteriores.

### Conversacion
Historial de intercambios entre el Comprador y el Agente Inteligente dentro de una Sesión. Incluye las instrucciones del Comprador y las respuestas del Agente.

### Notificación
Mensaje generado por el sistema y enviado a un usuario para informar sobre un evento relevante (nueva Orden, cambio de estado, escalamiento). Respeta las preferencias del usuario (RN-12).

---

## 5. Objetos de Valor

| Objeto de Valor | Descripción |
|---|---|
| Precio | Valor monetario positivo (mayor que cero, RN-06) expresado en la moneda del Marketplace. |
| Credenciales | Par de correo electrónico y contraseña que identifican a un usuario. La contraseña cumple la política RN-09 y se almacena utilizando Argon2 (RNF-07). |
| TokenAcceso | Identificador JWT de sesión local con vida útil de 15 minutos en producción, y Refresh Token de 7 días (RNF-09). |
| NivelConfianzaSTT | Valor numérico retornado por el servicio STT que indica la certeza de la transcripción. Debe superar el umbral configurado (RN-11) para ser procesado. |
| Intencion | Propósito identificado en la instrucción del usuario por el Agente (buscar, filtrar, ordenar, comparar, agregar al carrito, comprar, ver carrito). |
| EntidadExtraida | Elemento de información extraído de la instrucción: nombre de producto, marca, categoría, rango de precio, condición de envío. |
| Restriccion | Condición limitante extraída de la instrucción que debe aplicarse a la ejecución de la Acción. |
| FiltroActivo | Filtro que está actualmente aplicado sobre el conjunto de resultados de la Sesión. |
| CriterioOrdenamiento | Criterio de ordenamiento activo sobre el conjunto de resultados (precio asc., precio desc., calificación, relevancia, novedad). |
| ResumenOrden | Presentación estructurada de la Orden antes de la confirmación: productos, cantidades, precios y total. |


---

## 6. Agregados

### Agregado Usuario
- **Raíz**: Usuario
- **Incluye**: Credenciales, TokenAcceso, preferencias de notificación, datos de perfil.
- **Responsabilidad**: garantiza la consistencia de la identidad, la validez de las credenciales y la integridad del rol asignado. Las operaciones de autenticación y gestión de sesión se realizan a través de esta raíz.

### Agregado Publicación
- **Raíz**: Publicación
- **Incluye**: Producto, Categoría, Stock, imágenes, historial de cambios de precio.
- **Responsabilidad**: garantiza que la Publicación siempre tiene los campos obligatorios completos (RN-05), que el precio es mayor que cero (RN-06), y que el Stock refleja la disponibilidad real. Gestiona el ciclo de vida de la Publicación.

### Agregado Carrito
- **Raíz**: Carrito
- **Incluye**: ItemCarrito (conjunto de ítems con producto y cantidad).
- **Responsabilidad**: garantiza que solo Compradores autenticados pueden modificarlo (RN-02) y que refleja el estado actual de los productos seleccionados antes de la compra.

### Agregado Orden
- **Raíz**: Orden
- **Incluye**: LineaOrden (conjunto de líneas con producto, cantidad y precio unitario), estado, datos del Comprador y del Vendedor.
- **Responsabilidad**: garantiza que la Orden se registra solo tras confirmación explícita (RN-01) y pago confirmado, que el Stock fue verificado (RN-03), que las líneas son inmutables una vez creadas, y que el ciclo de vida avanza de forma válida.

### Agregado Sesión del Agente
- **Raíz**: Sesión
- **Incluye**: ContextoSesion, HistorialInstrucciones.
- **Responsabilidad**: mantiene el estado conversacional del Agente durante la interacción activa. Gestiona la expiración por inactividad (RN-14: 30 minutos) y la limpieza del contexto al expirar.

---

## 7. Servicios de Dominio

| Servicio | Responsabilidad |
|---|---|
| Servicio de Interpretación | Procesa la instrucción del Comprador (texto transcrito o escrito), determina la Intención y extrae EntidadesExtraidas y Restricciones. Coordina con el Proveedor de NLP externo. |
| Servicio de Verificación de Stock | Comprueba que todos los productos del Carrito tienen Stock suficiente inmediatamente antes de enviar la solicitud de pago (RN-03). |
| Servicio de Escalamiento de Órdenes | Detecta Órdenes que llevan más de 24 horas en estado "pendiente" y las escala automáticamente al Administrador (RN-07). |
| Servicio de Validación de Publicación | Verifica que una Publicación contiene todos los campos obligatorios (RN-05) y que el precio es mayor que cero (RN-06) antes de permitir su creación o modificación. |
| Servicio de Autenticación | Gestiona el registro de usuarios, la validación de credenciales, el control de intentos fallidos (RN-08), la política de contraseñas (RN-09) y la emisión de tokens de sesión. |
| Servicio de Notificación | Coordina el envío de notificaciones a Compradores y Vendedores, verificando previamente las preferencias de cada usuario (RN-12). |

---

## 8. Eventos de Dominio

| Evento | Descripción |
|---|---|
| UsuarioRegistrado | Un nuevo usuario completó el registro y verificó su correo electrónico. |
| SesionIniciada | Un usuario autenticado inició sesión y se emitió un token de acceso. |
| SesionCerrada | Un usuario cerró sesión y el token fue invalidado. |
| InstruccionRecibida | El Agente recibió una instrucción de texto o voz del Comprador. |
| IntencionIdentificada | El Servicio de Interpretación determinó la intención y extrajo entidades y restricciones. |
| AccionEjecutada | El Agente completó la ejecución de una acción derivada de la instrucción. |
| ProductoBuscado | El módulo de búsqueda retornó resultados para una consulta. |
| FiltroAplicado | Se aplicó un filtro sobre el conjunto de resultados activo. |
| ResultadosOrdenados | El conjunto de resultados activo fue reordenado según un criterio. |
| ProductoAgregadoAlCarrito | Un producto fue agregado al Carrito del Comprador. |
| CarritoActualizado | El contenido del Carrito fue modificado (cambio de cantidad o eliminación de ítem). |
| CompraConfirmada | El Comprador confirmó explícitamente la Orden presentada por el Agente. |
| OrdenRegistrada | La Orden fue registrada formalmente tras la confirmación del pago. |
| PagoConfirmado | La Pasarela de Pago retornó confirmación de la transacción. |
| StockDecrementado | El Stock de los productos comprados fue reducido de forma atómica (RN-04). |
| OrdenEscalada | Una Orden en estado pendiente superó las 24 horas sin atención y fue escalada (RN-07). |
| PublicacionCreada | Un Vendedor creó una nueva Publicación con todos los campos válidos. |
| VendedorSuspendido | El Administrador suspendió la cuenta de un Vendedor. |
| PublicacionesDeshabilitadas | Todas las Publicaciones activas de un Vendedor fueron deshabilitadas por la suspensión del Vendedor (RN-10). |


---

## 9. Invariantes del Dominio

| ID | Invariante | Origen |
|---|---|---|
| INV-01 | Una Publicación nunca puede existir en el Catálogo sin los campos: nombre, descripción, precio, categoría, stock e imágenes. | RN-05 |
| INV-02 | El precio de una Publicación es siempre mayor que cero. | RN-06 |
| INV-03 | El Carrito solo puede ser modificado por un Comprador autenticado. | RN-02 |
| INV-04 | Una Orden nunca se registra sin confirmación explícita previa del Comprador. | RN-01 |
| INV-05 | Una Orden nunca se registra sin verificación previa de Stock suficiente para todos sus productos. | RN-03 |
| INV-06 | El decremento de Stock y el registro de la Orden ocurren como una operación atómica indivisible. | RN-04 |
| INV-07 | Al suspender un Vendedor, todas sus Publicaciones activas quedan deshabilitadas de forma inmediata. | RN-10 |
| INV-08 | Una Orden con más de 24 horas en estado "pendiente" es siempre escalada al Administrador. | RN-07 |
| INV-09 | Una transcripción de voz con nivel de confianza inferior al umbral nunca es procesada como instrucción. | RN-11 |
| INV-10 | El Contexto de Sesión del Agente expira siempre tras 30 minutos de inactividad. | RN-14 |

---

## 10. Restricciones del Dominio

- La vista comparativa acepta entre 2 y 5 productos simultáneamente; no puede iniciarse con menos de 2 ni con más de 5 (RN-13).
- Las contraseñas deben tener mínimo 8 caracteres, una letra mayúscula, una letra minúscula y un dígito numérico (RN-09).
- Una cuenta queda bloqueada temporalmente 15 minutos tras 3 intentos de autenticación fallidos consecutivos (RN-08).
- El sistema no envía notificaciones de tipos que el usuario haya desactivado, excepto notificaciones de seguridad de cuenta (RN-12).
- Los datos de tarjeta de pago nunca son almacenados por el sistema (RNF-10).

---

## 11. Ciclo de Vida de las Entidades Principales

### Ciclo de Vida de la Orden

```
Pendiente → Confirmada → En Preparación → Despachada → Entregada
     ↓                                        ↓
  Escalada                                Cancelada
```

- **Pendiente**: registrada tras confirmación del pago, esperando atención del Vendedor.
- **Confirmada**: el Vendedor confirmó que atenderá la Orden.
- **En Preparación**: el Vendedor está preparando el envío.
- **Despachada**: el producto fue enviado al Comprador.
- **Entregada**: el producto fue recibido por el Comprador.
- **Cancelada**: la Orden fue cancelada por decisión del Administrador.
- **Escalada**: la Orden lleva más de 24 horas en estado Pendiente sin atención (RN-07).

### Ciclo de Vida de la Publicación

```
Borrador → Activa → Inactiva → Activa (reactivación)
                      ↓
                  Eliminada
```

- **Borrador**: en proceso de creación, aún no publicada en el Catálogo.
- **Activa**: visible en el Catálogo y disponible para búsquedas y compra.
- **Inactiva**: retirada del Catálogo por el Vendedor o el Administrador; no aparece en búsquedas.
- **Eliminada**: removida permanentemente por el Administrador por incumplimiento de políticas.

### Ciclo de Vida del Usuario

```
Pendiente → Activo → Suspendido → Activo (reactivación)
```

- **Pendiente**: cuenta creada, esperando verificación de correo electrónico.
- **Activo**: cuenta verificada y operativa.
- **Suspendido**: cuenta inhabilitada por el Administrador. Si es Vendedor, sus Publicaciones se deshabilitan (RN-10).

---

## 12. Límites del Dominio

**Pertenece al dominio:**
- Gestión de usuarios, roles y autenticación.
- Publicación y ciclo de vida de productos en el Catálogo.
- Interpretación de instrucciones en lenguaje natural y gestión del contexto conversacional.
- Búsqueda, filtrado, ordenamiento y comparación de productos.
- Gestión del Carrito y proceso de compra.
- Registro y ciclo de vida de Órdenes.
- Notificación de eventos a usuarios.
- Administración y moderación del Marketplace.
- Auditoría de operaciones críticas.

**No pertenece al dominio:**
- Procesamiento de lenguaje natural (delegado al Proveedor de IA externo).
- Transcripción de voz a texto (delegado al servicio STT externo).
- Síntesis de texto a voz (delegado a la API nativa de síntesis de voz del navegador del cliente).
- Procesamiento financiero de la transacción (delegado a la Pasarela de Pago).
- Entrega física de productos y seguimiento logístico.
- Gestión de devoluciones y disputas post-venta.
- Recomendaciones proactivas sin instrucción explícita del usuario.

---

## 13. Responsabilidades de Cada Agregado

| Agregado | Responsabilidades |
|---|---|
| Usuario | Mantener la consistencia de identidad y rol. Controlar el acceso según permisos del rol. Gestionar las preferencias de notificación. |
| Publicación | Garantizar la completitud y validez de los datos del producto. Gestionar el Stock. Controlar el ciclo de vida de la publicación. |
| Carrito | Acumular los productos seleccionados durante la sesión. Verificar que solo Compradores autenticados pueden modificarlo. Servir de base para el proceso de compra. |
| Orden | Registrar de forma inmutable la transacción completada. Controlar el avance válido del ciclo de vida. Gestionar el escalamiento automático por inactividad del Vendedor. |
| Sesión del Agente | Mantener el contexto conversacional activo. Gestionar la expiración por inactividad. Conservar el historial de instrucciones y los resultados activos de la sesión. |
