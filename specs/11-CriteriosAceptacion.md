# Criterios de Aceptación Consolidados — Marketplace Inteligente Asistido por IA

## 1. Introducción

Este documento consolida todos los criterios de aceptación del sistema en formato **Given/When/Then**. Cada criterio está identificado con un código único que incluye el requisito funcional al que pertenece. Los criterios están organizados por módulo funcional.

Formato del identificador: `CA-RFxx-yy` donde `xx` es el número del requisito funcional y `yy` es el número secuencial del criterio dentro de ese requisito.

---

## 2. Módulo: Agente Inteligente — Procesamiento de Lenguaje Natural

### RF-01 — Interpretación de instrucciones en texto

| ID | Dado (Given) | Cuando (When) | Entonces (Then) |
|---|---|---|---|
| CA-RF01-01 | El Comprador tiene una Sesión activa en el Marketplace | El Comprador ingresa la instrucción "Busca pantalones negros" | El Agente Inteligente ejecuta la búsqueda con las entidades "pantalones" y "negros" y presenta los resultados dentro de 2 segundos |
| CA-RF01-02 | El Comprador tiene una Sesión activa | El Comprador ingresa una instrucción cuya intención no puede determinarse | El Agente solicita aclaración al Comprador sin ejecutar ninguna acción |
| CA-RF01-03 | El Agente ejecutó una búsqueda previa con resultados visibles | El Comprador ingresa "ordénalos por precio" | El Agente aplica el ordenamiento al conjunto de Resultados activo sin perder el contexto previo |
| CA-RF01-04 | El servicio NLP no responde dentro del tiempo límite | El Agente intenta enviar la instrucción al servicio | El Agente informa al Comprador que no puede procesar la instrucción en este momento y solicita reintento |

---

### RF-02 — Interpretación de instrucciones por voz

| ID | Dado (Given) | Cuando (When) | Entonces (Then) |
|---|---|---|---|
| CA-RF02-01 | El modo de voz está activo y los servicios STT y TTS están disponibles | El Comprador dice "Muéstrame zapatillas Nike" | El sistema transcribe el audio, ejecuta la búsqueda y reproduce la confirmación en audio al Comprador |
| CA-RF02-02 | El modo de voz está activo | El servicio STT retorna una transcripción con nivel de confianza inferior al umbral configurado | El Agente no ejecuta ninguna acción y solicita al Comprador que repita o escriba la instrucción |
| CA-RF02-03 | El modo de voz está activo | El servicio TTS no está disponible | El Agente presenta la respuesta únicamente en texto sin interrumpir el flujo funcional |
| CA-RF02-04 | El modo de voz está activo | El Agente está escuchando al Comprador | El Marketplace muestra el indicador visual de escucha activa durante todo el tiempo que dura la captura del audio |

---

## 3. Módulo: Catálogo y Exploración

### RF-03 — Búsqueda de productos

| ID | Dado (Given) | Cuando (When) | Entonces (Then) |
|---|---|---|---|
| CA-RF03-01 | El Catálogo tiene productos disponibles | El Agente ejecuta la búsqueda con entidades y restricciones válidas | Los resultados se presentan dentro de 3 segundos con nombre, precio, imagen y vendedor de cada producto |
| CA-RF03-02 | El Comprador ingresa una instrucción de búsqueda válida | No existen productos en el Catálogo que coincidan con los criterios | El Agente informa que no se encontraron resultados y sugiere ampliar o modificar los criterios de búsqueda |
| CA-RF03-03 | Una búsqueda retornó resultados activos en la Sesión | El Comprador da una instrucción de seguimiento que hace referencia a "ellos" o "esos" | El Agente resuelve la referencia usando el conjunto de Resultados activo sin requerir que el Comprador repita los criterios |

---

### RF-04 — Filtrado de resultados

| ID | Dado (Given) | Cuando (When) | Entonces (Then) |
|---|---|---|---|
| CA-RF04-01 | Hay un conjunto de Resultados activo en la Sesión | El Comprador indica "filtra solo las que tengan envío gratis" | El Agente aplica el filtro de condición de envío y actualiza los resultados visibles conservando los demás filtros activos |
| CA-RF04-02 | Se aplica un filtro sobre el conjunto de Resultados activo | El resultado del filtro es un conjunto vacío de productos | El Agente informa al Comprador que no hay productos con esa restricción y muestra los filtros activos que produjeron el resultado vacío |
| CA-RF04-03 | Hay múltiples filtros activos en la Sesión | El Comprador solicita eliminar un filtro específico (ej. "quita el filtro de envío gratis") | El Agente remueve únicamente el filtro indicado, conserva los demás filtros activos y actualiza los resultados |

---

### RF-05 — Ordenamiento de resultados

| ID | Dado (Given) | Cuando (When) | Entonces (Then) |
|---|---|---|---|
| CA-RF05-01 | Hay un conjunto de Resultados activo en la Sesión | El Comprador indica "ordénalas por precio" | El Agente aplica el ordenamiento por precio ascendente y los resultados se presentan en ese orden |
| CA-RF05-02 | Hay filtros activos y resultados visibles en la Sesión | El Comprador aplica un nuevo criterio de ordenamiento | Los filtros activos se conservan sin modificación y únicamente el orden de los resultados cambia |
| CA-RF05-03 | El Comprador ingresa una instrucción de ordenamiento con un criterio no reconocible | El Agente no puede determinar el criterio de ordenamiento | El Agente informa al Comprador los criterios disponibles (precio asc, precio desc, calificación, relevancia, novedad) sin modificar el orden actual |

---

### RF-06 — Comparación de productos

| ID | Dado (Given) | Cuando (When) | Entonces (Then) |
|---|---|---|---|
| CA-RF06-01 | Hay al menos 2 productos en el conjunto de Resultados activo | El Comprador indica "compáralas" sin especificar cuáles | El Agente presenta la vista comparativa de los primeros productos del conjunto activo con sus atributos relevantes |
| CA-RF06-02 | Los productos del conjunto activo pertenecen a categorías distintas | El Comprador solicita comparar productos de diferentes categorías | El Agente advierte al Comprador que los productos son de categorías diferentes antes de mostrar la comparación |
| CA-RF06-03 | El Comprador solicita comparar más de 5 productos | El Agente detecta que la cantidad supera el límite permitido (RN-13) | El Agente informa que el máximo es 5 productos y solicita al Comprador que seleccione cuáles comparar |
| CA-RF06-04 | Se muestra la vista comparativa de productos | El Agente presenta los resultados | Los atributos donde un producto supera a los demás son destacados visualmente en la comparación |

---

## 4. Módulo: Carrito y Proceso de Compra

### RF-07 — Gestión del Carrito

| ID | Dado (Given) | Cuando (When) | Entonces (Then) |
|---|---|---|---|
| CA-RF07-01 | El Comprador está autenticado y hay un conjunto de Resultados activo | El Comprador indica "agrega la primera al carrito" | El Agente agrega el primer producto del conjunto activo al Carrito y confirma con el nombre del producto y el total actualizado del Carrito |
| CA-RF07-02 | El Comprador está autenticado y solicita agregar un producto | El producto no tiene stock suficiente disponible | El Agente informa la disponibilidad real del producto y ofrece alternativas del conjunto de Resultados activo |
| CA-RF07-03 | El usuario no está autenticado (es Visitante) | Intenta agregar un producto al Carrito | El Agente informa que es necesario iniciar sesión y redirige al proceso de autenticación sin ejecutar la operación de Carrito |
| CA-RF07-04 | El Comprador está autenticado y tiene productos en el Carrito | El Comprador solicita "muéstrame mi carrito" | El Agente presenta todos los productos del Carrito con sus cantidades, precios individuales y el precio total |
| CA-RF07-05 | El Comprador tiene productos en el Carrito | El Comprador solicita eliminar un producto específico del Carrito | El Agente remueve el producto indicado y actualiza el total del Carrito |

---

### RF-08 — Ejecución de compra

| ID | Dado (Given) | Cuando (When) | Entonces (Then) |
|---|---|---|---|
| CA-RF08-01 | El Comprador está autenticado, el Carrito tiene productos con stock disponible | El Comprador indica "compra la más barata" y confirma explícitamente | El Marketplace registra la Orden, decrementa el stock, notifica al Comprador y al Vendedor, y presenta el número de confirmación único |
| CA-RF08-02 | El proceso de compra se inicia y el Agente ha verificado disponibilidad | El Agente presenta el resumen de la Orden al Comprador | El Comprador debe confirmar explícitamente antes de que se procese el pago; la acción no se ejecuta sin confirmación (RN-01) |
| CA-RF08-03 | Se envió la solicitud de pago a la Pasarela de Pago | La Pasarela retorna rechazo del pago | El Marketplace informa al Comprador el motivo del rechazo y ofrece la opción de utilizar otro método de pago |
| CA-RF08-04 | El Comprador inicia el proceso de compra con varios productos en el Carrito | Un producto no tiene stock disponible al momento de confirmar | El Marketplace notifica al Comprador qué producto específico no está disponible y permite continuar la compra con los productos restantes |
| CA-RF08-05 | La Pasarela de Pago confirma la transacción | El Marketplace registra la Orden | La Orden es registrada, el stock de los productos comprados es decrementado y el número de confirmación es presentado al Comprador dentro de los 5 segundos posteriores a la confirmación del pago |

---

## 5. Módulo: Gestión de Publicaciones (Vendedor)

### RF-09 — Creación de Publicación

| ID | Dado (Given) | Cuando (When) | Entonces (Then) |
|---|---|---|---|
| CA-RF09-01 | El Vendedor está autenticado y completa todos los campos obligatorios con datos válidos | El Vendedor confirma la creación de la Publicación | El Marketplace crea la Publicación con un identificador único y la incluye en el Catálogo disponible para búsquedas dentro de 60 segundos |
| CA-RF09-02 | El Vendedor está autenticado y deja uno o más campos obligatorios vacíos | El Vendedor intenta crear la Publicación | El Marketplace señala específicamente los campos faltantes e impide la creación hasta que sean completados |
| CA-RF09-03 | El Vendedor ingresa un precio de cero o negativo | El Vendedor intenta crear la Publicación | El Marketplace rechaza la operación e informa al Vendedor que el precio debe ser un valor mayor que cero (RN-06) |

---

### RF-10 — Gestión de Órdenes por el Vendedor

| ID | Dado (Given) | Cuando (When) | Entonces (Then) |
|---|---|---|---|
| CA-RF10-01 | Una Orden con productos del Vendedor es registrada | El Vendedor accede a su panel de Órdenes | La Orden aparece en estado "pendiente" con todos sus datos: productos, cantidades, precios y datos del Comprador necesarios para la entrega |
| CA-RF10-02 | El Vendedor tiene una Orden en estado "pendiente" | El Vendedor actualiza el estado a "en preparación" | El Comprador recibe una notificación del cambio de estado dentro de los 60 segundos posteriores al cambio |
| CA-RF10-03 | Una Orden lleva 24 horas consecutivas en estado "pendiente" sin actualización del Vendedor | El sistema evalúa el estado de la Orden | La Orden es escalada automáticamente al Administrador y el estado cambia a "escalada" (RN-07) |

---

## 6. Módulo: Administración

### RF-11 — Administración de usuarios y publicaciones

| ID | Dado (Given) | Cuando (When) | Entonces (Then) |
|---|---|---|---|
| CA-RF11-01 | El Administrador está autenticado y selecciona la cuenta de un Vendedor activo | El Administrador confirma la suspensión de la cuenta | La cuenta del Vendedor queda suspendida y todas sus Publicaciones activas son deshabilitadas del Catálogo de forma inmediata (RN-10) |
| CA-RF11-02 | El Administrador identifica una Publicación que viola las políticas del Marketplace | El Administrador confirma la eliminación de la Publicación | La Publicación deja de aparecer en el Catálogo de forma inmediata |
| CA-RF11-03 | El Administrador accede a la sección de reportes | El Administrador consulta el reporte de ventas y actividad | El sistema presenta datos agregados cuya antigüedad máxima es de 24 horas |

---

## 7. Módulo: Autenticación y Usuarios

### RF-12 — Registro y autenticación de usuarios

| ID | Dado (Given) | Cuando (When) | Entonces (Then) |
|---|---|---|---|
| CA-RF12-01 | Un Visitante completa el formulario de registro con todos los datos válidos y una contraseña que cumple la política (RN-09) | El Visitante confirma el registro | El Marketplace crea la cuenta en estado pendiente de verificación y envía un correo de verificación al correo proporcionado |
| CA-RF12-02 | Un usuario recibió el correo de verificación de su cuenta | El usuario hace clic en el enlace de verificación | La cuenta queda activada y el usuario puede iniciar sesión |
| CA-RF12-03 | Un usuario intenta autenticarse con credenciales incorrectas por tercera vez consecutiva | El tercer intento falla | El Marketplace bloquea temporalmente la cuenta por 15 minutos e informa al usuario sobre el bloqueo y la duración (RN-08) |
| CA-RF12-04 | Un usuario registra una contraseña que no cumple la política de complejidad (ej. sin mayúscula) | El Marketplace valida la contraseña | El Marketplace rechaza la contraseña e indica al usuario los criterios de seguridad específicos que no se cumplen (RN-09) |
| CA-RF12-05 | Un usuario autenticado hace clic en "cerrar sesión" | La acción de cierre de sesión se ejecuta | La Sesión activa es invalidada, los tokens de acceso son eliminados y el usuario no puede acceder a funciones protegidas sin autenticarse nuevamente |
