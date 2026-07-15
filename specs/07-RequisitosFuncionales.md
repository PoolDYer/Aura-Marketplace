# Requisitos Funcionales — Aura Marketplace

## 1. Introducción

Este documento describe con detalle todos los requisitos funcionales de Aura Marketplace. Cada requisito está identificado con un código único, e incluye actor principal, prioridad, descripción, entradas, salidas, precondiciones, postcondiciones, flujo principal, flujos de excepción, dependencias y criterios de aceptación en formato Given/When/Then.

---

## 2. Módulo: Agente Inteligente — Procesamiento de Lenguaje Natural

### RF-01 — Interpretación de instrucciones en texto

| Campo | Descripción |
|---|---|
| **ID** | RF-01 |
| **Nombre** | Interpretación de instrucciones en lenguaje natural mediante texto |
| **Actor principal** | Comprador |
| **Prioridad** | Alta |
| **Descripción** | El Agente Inteligente recibe instrucciones escritas en lenguaje natural del Comprador, identifica la intención y extrae entidades y restricciones para ejecutar la acción correspondiente. |
| **Entradas** | Texto libre ingresado por el Comprador |
| **Salidas** | Acción ejecutada y confirmación de resultado al Comprador |
| **Precondiciones** | El Comprador tiene una Sesión activa en el Marketplace |
| **Postcondiciones** | La acción identificada es ejecutada y el resultado es presentado al Comprador. El Contexto de Sesión es actualizado. |
| **Flujo principal** | 1. El Comprador ingresa una instrucción en el campo de texto. 2. El Agente recibe el texto y lo envía al servicio de NLP. 3. El servicio retorna la intención identificada y las entidades extraídas. 4. El Agente ejecuta la acción correspondiente. 5. El resultado es presentado al Comprador. 6. El Contexto de Sesión es actualizado. |
| **Flujos de excepción** | E1: El servicio NLP no puede identificar la intención con certeza suficiente → El Agente solicita aclaración al Comprador. E2: El servicio NLP no responde dentro del tiempo límite → El Agente informa el error y solicita reintento. |
| **Dependencias** | RN-01, RN-14 |

#### Criterios de Aceptación — RF-01

| ID | Criterio |
|---|---|
| CA-RF01-01 | **Given** el Comprador tiene una Sesión activa, **When** ingresa la instrucción "Busca pantalones negros", **Then** el Agente ejecuta una búsqueda en el Catálogo con las entidades "pantalones" y "negros" y presenta los resultados dentro de 2 segundos. |
| CA-RF01-02 | **Given** el Comprador tiene una Sesión activa, **When** ingresa una instrucción cuya intención no puede ser determinada, **Then** el Agente solicita aclaración sin ejecutar ninguna acción. |
| CA-RF01-03 | **Given** el Agente ejecutó una búsqueda previa, **When** el Comprador ingresa "ordénalos por precio", **Then** el Agente aplica el ordenamiento al conjunto de resultados activo sin perder el contexto previo. |

---

### RF-02 — Interpretación de instrucciones por voz

| Campo | Descripción |
|---|---|
| **ID** | RF-02 |
| **Nombre** | Interpretación de instrucciones en lenguaje natural mediante voz |
| | **Descripción** | El Agente Inteligente captura el audio del Comprador, lo envía al servicio STT para obtener la transcripción, y luego procesa la transcripción con las mismas reglas que una instrucción de texto. La respuesta es sintetizada en el frontend utilizando la API nativa Web Speech (window.speechSynthesis) del navegador. |
| **Entradas** | Audio capturado del micrófono del Comprador |
| **Salidas** | Acción ejecutada, respuesta en texto y respuesta en audio al Comprador |
| **Precondiciones** | El Comprador tiene una Sesión activa. El Comprador ha activado el modo de voz. El servicio STT (Gemini AI) y la API de síntesis de voz del navegador están disponibles. |
| **Postcondiciones** | La acción identificada es ejecutada. El resultado es presentado en texto y audio. El Contexto de Sesión es actualizado. |
| **Flujo principal** | 1. El Comprador activa el modo de voz. 2. El sistema muestra el indicador visual de escucha activa. 3. El Comprador habla su instrucción. 4. El audio es capturado y enviado al backend, el cual utiliza Gemini AI para STT. 5. El backend retorna la transcripción con su nivel de confianza. 6. El Agente verifica que el nivel de confianza supera el umbral (RN-11). 7. El Agente procesa la transcripción como si fuera una instrucción de texto. 8. La respuesta es enviada al módulo Web Speech en el frontend. 9. El audio de respuesta es reproducido al Comprador. |
| **Flujos de excepción** | E1: El nivel de confianza del STT está por debajo del umbral → El Agente informa al Comprador y solicita que repita o escriba la instrucción. E2: El servicio STT no responde → El Agente informa el error y sugiere usar el modo texto. E3: La API Web Speech del navegador no está disponible o no responde → El Agente presenta la respuesta solo en texto. |
| **Dependencias** | RF-01, RN-11 |
 
#### Criterios de Aceptación — RF-02
 
| ID | Criterio |
|---|---|
| CA-RF02-01 | **Given** el modo de voz está activo, **When** el Comprador dice "Muéstrame zapatillas Nike", **Then** el sistema transcribe el audio, ejecuta la búsqueda y reproduce la confirmación en audio. |
| CA-RF02-02 | **Given** el modo de voz está activo, **When** el STT retorna una transcripción con confianza inferior al umbral, **Then** el Agente no ejecuta ninguna acción y solicita repetir o escribir la instrucción. |
| CA-RF02-03 | **Given** el modo de voz está activo, **When** la API Web Speech del navegador no está disponible o no tiene soporte, **Then** el Agente presenta la respuesta solo en texto sin interrumpir el flujo funcional. |le, **Then** el Agente presenta la respuesta solo en texto sin interrumpir el flujo funcional. |

---

## 3. Módulo: Catálogo y Exploración

### RF-03 — Búsqueda de productos

| Campo | Descripción |
|---|---|
| **ID** | RF-03 |
| **Nombre** | Búsqueda de productos en el Catálogo |
| **Actor principal** | Comprador |
| **Prioridad** | Alta |
| **Descripción** | El Agente Inteligente ejecuta una búsqueda en el Catálogo utilizando las entidades y restricciones extraídas de la instrucción del Comprador, y presenta los resultados. |
| **Entradas** | Entidades y restricciones extraídas por el Agente de la instrucción del Comprador |
| **Salidas** | Lista de productos del Catálogo que coinciden con los criterios de búsqueda |
| **Precondiciones** | El Comprador tiene una Sesión activa. Las entidades de búsqueda han sido extraídas por el Agente. |
| **Postcondiciones** | El conjunto de Resultados activo de la Sesión es actualizado. El Comprador visualiza los resultados. |
| **Flujo principal** | 1. El Agente envía la consulta al módulo de búsqueda con entidades y restricciones. 2. El módulo consulta el Catálogo y retorna los productos coincidentes. 3. El Agente presenta los resultados con nombre, precio, imagen y vendedor. 4. El Contexto de Sesión es actualizado con el nuevo conjunto de Resultados. |
| **Flujos de excepción** | E1: La búsqueda no retorna resultados → El Agente informa al Comprador y sugiere ampliar los criterios. E2: El tiempo de respuesta excede 3 segundos → El Agente muestra un indicador de carga e informa si la demora persiste. |
| **Dependencias** | RF-01, RF-02 |

#### Criterios de Aceptación — RF-03

| ID | Criterio |
|---|---|
| CA-RF03-01 | **Given** el Catálogo tiene productos, **When** el Agente ejecuta la búsqueda con entidades válidas, **Then** los resultados se presentan dentro de 3 segundos con nombre, precio, imagen y vendedor. |
| CA-RF03-02 | **Given** una instrucción de búsqueda válida, **When** no existen productos que coincidan, **Then** el Agente informa que no se encontraron resultados y sugiere ampliar los criterios. |
| CA-RF03-03 | **Given** una búsqueda retorna resultados, **When** el Comprador da una instrucción de seguimiento, **Then** el Agente resuelve la referencia usando el conjunto de Resultados activo. |

---

### RF-04 — Filtrado de resultados

| Campo | Descripción |
|---|---|
| **ID** | RF-04 |
| **Nombre** | Filtrado de resultados mediante el Agente Inteligente |
| **Actor principal** | Comprador |
| **Prioridad** | Alta |
| **Descripción** | El Agente aplica un filtro expresado por el Comprador sobre el conjunto de Resultados activo en la Sesión, sin eliminar el historial. |
| **Entradas** | Instrucción de filtrado del Comprador con la restricción a aplicar |
| **Salidas** | Conjunto de Resultados reducido según el filtro aplicado |
| **Precondiciones** | Existe un conjunto de Resultados activo en la Sesión. |
| **Postcondiciones** | El conjunto de Resultados activo es reemplazado por el subconjunto filtrado. El historial de la Sesión conserva los resultados anteriores. |
| **Flujo principal** | 1. El Agente extrae la restricción de filtrado de la instrucción. 2. El Agente aplica el filtro al conjunto de Resultados activo. 3. El Agente presenta el conjunto filtrado al Comprador. |
| **Flujos de excepción** | E1: El filtro resulta en un conjunto vacío → El Agente informa al Comprador e indica los filtros activos. E2: El tipo de filtro no es reconocido → El Agente presenta los filtros disponibles. |
| **Dependencias** | RF-03, RN-14 |

#### Criterios de Aceptación — RF-04

| ID | Criterio |
|---|---|
| CA-RF04-01 | **Given** hay resultados activos, **When** el Comprador indica "filtra solo las que tengan envío gratis", **Then** el Agente aplica el filtro y actualiza los resultados visibles. |
| CA-RF04-02 | **Given** se aplica un filtro, **When** el resultado del filtro es un conjunto vacío, **Then** el Agente informa al Comprador y muestra los filtros activos que produjeron ese resultado. |
| CA-RF04-03 | **Given** hay filtros activos, **When** el Comprador solicita eliminar un filtro específico, **Then** el Agente remueve únicamente ese filtro y actualiza los resultados. |

---

### RF-05 — Ordenamiento de resultados

| Campo | Descripción |
|---|---|
| **ID** | RF-05 |
| **Nombre** | Ordenamiento de resultados mediante el Agente Inteligente |
| **Actor principal** | Comprador |
| **Prioridad** | Alta |
| **Descripción** | El Agente reordena el conjunto de Resultados activo según el criterio indicado por el Comprador, manteniendo los filtros activos. |
| **Entradas** | Instrucción de ordenamiento del Comprador con el criterio deseado |
| **Salidas** | Conjunto de Resultados reordenado según el criterio |
| **Precondiciones** | Existe un conjunto de Resultados activo en la Sesión. |
| **Postcondiciones** | El conjunto de Resultados activo es presentado en el nuevo orden. Los filtros activos se conservan. |
| **Flujo principal** | 1. El Agente extrae el criterio de ordenamiento de la instrucción. 2. El Agente aplica el ordenamiento al conjunto activo. 3. El Agente presenta los resultados reordenados. |
| **Flujos de excepción** | E1: El criterio no es reconocido → El Agente presenta los criterios disponibles y solicita confirmación. |
| **Dependencias** | RF-03, RF-04 |

#### Criterios de Aceptación — RF-05

| ID | Criterio |
|---|---|
| CA-RF05-01 | **Given** hay resultados activos, **When** el Comprador indica "ordénalas por precio", **Then** el Agente aplica el ordenamiento y los resultados se presentan en orden de precio ascendente. |
| CA-RF05-02 | **Given** hay filtros activos y resultados visibles, **When** se aplica un nuevo ordenamiento, **Then** los filtros activos se conservan y solo el orden cambia. |
| CA-RF05-03 | **Given** una instrucción de ordenamiento no reconocible, **When** el Agente no puede determinar el criterio, **Then** el Agente presenta los criterios disponibles sin modificar el orden actual. |

---

### RF-06 — Comparación de productos

| Campo | Descripción |
|---|---|
| **ID** | RF-06 |
| **Nombre** | Comparación de productos mediante el Agente Inteligente |
| **Actor principal** | Comprador |
| **Prioridad** | Alta |
| **Descripción** | El Agente presenta una vista comparativa de entre 2 y 5 productos del conjunto de Resultados activo, destacando las diferencias de atributos relevantes. |
| **Entradas** | Instrucción de comparación del Comprador con indicación de productos a comparar |
| **Salidas** | Vista comparativa estructurada con los atributos de los productos seleccionados |
| **Precondiciones** | Existe un conjunto de Resultados activo en la Sesión. El conjunto contiene al menos 2 productos. |
| **Postcondiciones** | La vista comparativa es presentada al Comprador. El conjunto de Resultados activo no es modificado. |
| **Flujo principal** | 1. El Agente extrae los productos a comparar de la instrucción o del Contexto de Sesión. 2. El Agente verifica que la cantidad es entre 2 y 5 (RN-13). 3. El Agente recupera los atributos de cada producto. 4. El Agente presenta la vista comparativa destacando las diferencias. |
| **Flujos de excepción** | E1: Los productos tienen categorías distintas → El Agente advierte al Comprador antes de mostrar la comparación. E2: La cantidad de productos supera 5 → El Agente informa el límite. |
| **Dependencias** | RF-03, RN-13 |

#### Criterios de Aceptación — RF-06

| ID | Criterio |
|---|---|
| CA-RF06-01 | **Given** hay al menos 2 productos en el conjunto activo, **When** el Comprador indica "compáralas", **Then** el Agente presenta la vista comparativa con los atributos de los primeros productos del conjunto. |
| CA-RF06-02 | **Given** se solicita comparar productos de categorías distintas, **When** el Agente detecta la diferencia, **Then** el Agente advierte al Comprador antes de mostrar la comparación. |
| CA-RF06-03 | **Given** se solicita comparar más de 5 productos, **When** el Agente detecta que se supera el límite, **Then** el Agente informa que el máximo es 5 productos y solicita selección. |

---

## 4. Módulo: Carrito y Proceso de Compra

### RF-07 — Gestión del Carrito

| Campo | Descripción |
|---|---|
| **ID** | RF-07 |
| **Nombre** | Gestión del Carrito mediante el Agente Inteligente |
| **Actor principal** | Comprador |
| **Prioridad** | Alta |
| **Descripción** | El Agente Inteligente agrega, modifica o elimina productos del Carrito del Comprador según las instrucciones recibidas. También presenta el contenido del Carrito cuando se solicita. |
| **Entradas** | Instrucción del Comprador relativa al Carrito |
| **Salidas** | Confirmación de la operación sobre el Carrito y estado actualizado del mismo |
| **Precondiciones** | El Comprador está autenticado (RN-02). Existe un conjunto de Resultados activo o el Comprador especifica el producto. |
| **Postcondiciones** | El Carrito refleja los cambios solicitados. El Comprador es informado del estado actualizado. |
| **Flujo principal** | 1. El Agente extrae el producto y la operación de la instrucción o del Contexto de Sesión. 2. El Agente verifica la disponibilidad del producto. 3. El Agente aplica la operación al Carrito. 4. El Marketplace confirma la operación al Comprador con el nombre del producto y el total actualizado. |
| **Flujos de excepción** | E1: El Comprador no está autenticado → El Agente redirige al proceso de autenticación (RN-02). E2: El producto no tiene stock suficiente → El Agente informa la disponibilidad real y ofrece alternativas. |
| **Dependencias** | RF-01, RF-03, RN-02 |

#### Criterios de Aceptación — RF-07

| ID | Criterio |
|---|---|
| CA-RF07-01 | **Given** el Comprador está autenticado, **When** indica "agrega la primera al carrito", **Then** el Agente agrega el primer producto del conjunto activo y confirma con nombre y total actualizado. |
| CA-RF07-02 | **Given** el Comprador está autenticado, **When** el producto solicitado no tiene stock, **Then** el Agente informa la disponibilidad real y ofrece alternativas del conjunto activo. |
| CA-RF07-03 | **Given** el Comprador no está autenticado, **When** intenta agregar al Carrito, **Then** el Agente solicita autenticación sin ejecutar la operación. |
| CA-RF07-04 | **Given** el Comprador solicita ver el Carrito, **When** el Agente presenta el contenido, **Then** se muestran todos los productos, cantidades, precios individuales y total. |

---

### RF-08 — Ejecución de compra

| Campo | Descripción |
|---|---|
| **ID** | RF-08 |
| **Nombre** | Ejecución de compra mediante el Agente Inteligente |
| **Actor principal** | Comprador |
| **Prioridad** | Alta |
| **Descripción** | El Agente inicia el proceso de compra, verifica la disponibilidad del Carrito, solicita confirmación explícita del Comprador, coordina el pago con la Pasarela de Pago y registra la Orden. |
| **Entradas** | Instrucción de compra del Comprador y confirmación explícita |
| **Salidas** | Número de confirmación de Orden, estado del pago |
| **Precondiciones** | El Comprador está autenticado. El Carrito tiene al menos un producto. El Comprador tiene un método de pago registrado. |
| **Postcondiciones** | La Orden es registrada. El Stock es decrementado (RN-04). El Comprador y el Vendedor son notificados. El Carrito es vaciado. |
| **Flujo principal** | 1. El Agente recibe la instrucción de compra. 2. El Agente verifica autenticación (RN-02). 3. El Marketplace verifica el stock de todos los productos del Carrito (RN-03). 4. El Agente presenta resumen de la Orden al Comprador. 5. El Agente solicita confirmación explícita (RN-01). 6. El Comprador confirma. 7. El Marketplace envía la solicitud a la Pasarela de Pago. 8. La Pasarela confirma el pago. 9. El Marketplace registra la Orden y genera número de confirmación único. 10. El Stock es decrementado (RN-04). 11. Se envían notificaciones al Comprador y al Vendedor. |
| **Flujos de excepción** | E1: La Pasarela rechaza el pago → El Agente informa el motivo y ofrece cambiar el método de pago. E2: Un producto no tiene stock al momento de confirmar → El Marketplace informa al Comprador y permite continuar con los demás. |
| **Dependencias** | RF-07, RN-01, RN-02, RN-03, RN-04 |

#### Criterios de Aceptación — RF-08

| ID | Criterio |
|---|---|
| CA-RF08-01 | **Given** el Carrito tiene productos con stock disponible, **When** el Comprador indica "compra la más barata" y confirma, **Then** el Marketplace registra la Orden y presenta el número de confirmación único. |
| CA-RF08-02 | **Given** el proceso de compra se inicia, **When** el Agente presenta el resumen, **Then** el Comprador debe confirmar explícitamente antes de que se procese el pago. |
| CA-RF08-03 | **Given** la Pasarela de Pago rechaza el pago, **When** el Marketplace recibe el rechazo, **Then** informa al Comprador el motivo y ofrece la opción de usar otro método de pago. |
| CA-RF08-04 | **Given** un producto del Carrito no tiene stock al confirmar, **When** el Marketplace detecta la falta de stock, **Then** notifica al Comprador e indica qué producto y permite continuar con los demás. |

---

## 5. Módulo: Gestión de Publicaciones (Vendedor)

### RF-09 — Creación de Publicación

| Campo | Descripción |
|---|---|
| **ID** | RF-09 |
| **Nombre** | Creación de Publicación de producto por el Vendedor |
| **Actor principal** | Vendedor |
| **Prioridad** | Alta |
| **Descripción** | El Vendedor crea una nueva Publicación en el Catálogo completando los campos obligatorios establecidos en la regla de negocio RN-05. |
| **Entradas** | Nombre, descripción, precio (>0, RN-06), categoría, stock, imágenes |
| **Salidas** | Publicación creada con identificador único y marca temporal |
| **Precondiciones** | El Vendedor está autenticado. |
| **Postcondiciones** | La Publicación es creada en el Catálogo con un identificador único. Es visible para búsquedas dentro de 60 segundos. |
| **Flujo principal** | 1. El Vendedor completa el formulario de Publicación. 2. El Marketplace valida todos los campos obligatorios (RN-05) y el precio (RN-06). 3. El Marketplace crea la Publicación con identificador único y marca temporal. 4. La Publicación queda activa en el Catálogo. |
| **Flujos de excepción** | E1: Campos obligatorios incompletos → El Marketplace señala los campos faltantes e impide la creación. E2: Precio igual o menor a cero → El Marketplace rechaza la Publicación. |
| **Dependencias** | RN-05, RN-06 |

#### Criterios de Aceptación — RF-09

| ID | Criterio |
|---|---|
| CA-RF09-01 | **Given** el Vendedor completa todos los campos obligatorios con datos válidos, **When** confirma la Publicación, **Then** el Marketplace crea la Publicación con identificador único y la incluye en el Catálogo. |
| CA-RF09-02 | **Given** el Vendedor omite un campo obligatorio, **When** intenta crear la Publicación, **Then** el Marketplace señala los campos faltantes e impide la creación. |
| CA-RF09-03 | **Given** el Vendedor ingresa un precio de cero, **When** intenta crear la Publicación, **Then** el Marketplace rechaza la operación e informa que el precio debe ser mayor que cero. |

---

### RF-10 — Gestión de Órdenes por el Vendedor

| Campo | Descripción |
|---|---|
| **ID** | RF-10 |
| **Nombre** | Visualización y gestión de Órdenes por el Vendedor |
| **Actor principal** | Vendedor |
| **Prioridad** | Alta |
| **Descripción** | El Vendedor visualiza las Órdenes recibidas que incluyen sus productos, actualiza el estado de cada Orden y es notificado de nuevas Órdenes. |
| **Entradas** | Actualización de estado de Orden por el Vendedor |
| **Salidas** | Estado de Orden actualizado; notificación al Comprador |
| **Precondiciones** | El Vendedor está autenticado. Existen Órdenes asociadas a sus productos. |
| **Postcondiciones** | El estado de la Orden es actualizado y el Comprador es notificado. |
| **Flujo principal** | 1. El Vendedor accede a su panel de Órdenes. 2. El Marketplace presenta las Órdenes con su estado actual. 3. El Vendedor selecciona una Orden y actualiza su estado. 4. El Marketplace notifica al Comprador sobre el cambio. |
| **Flujos de excepción** | E1: La Orden no es confirmada en 24 horas → El Marketplace escala la Orden al Administrador (RN-07). |
| **Dependencias** | RF-08, RN-07 |

#### Criterios de Aceptación — RF-10

| ID | Criterio |
|---|---|
| CA-RF10-01 | **Given** una Orden es registrada con productos del Vendedor, **When** el Vendedor accede a su panel, **Then** la Orden aparece con estado "pendiente" y todos sus datos. |
| CA-RF10-02 | **Given** el Vendedor actualiza el estado de una Orden, **When** el cambio es guardado, **Then** el Comprador recibe una notificación del cambio dentro de 60 segundos. |
| CA-RF10-03 | **Given** una Orden lleva 24 horas en estado "pendiente" sin atención, **When** el sistema evalúa el estado, **Then** la Orden es escalada al Administrador automáticamente. |

---

## 6. Módulo: Administración

### RF-11 — Administración de usuarios y publicaciones

| Campo | Descripción |
|---|---|
| **ID** | RF-11 |
| **Nombre** | Administración de usuarios y publicaciones |
| **Actor principal** | Administrador |
| **Prioridad** | Alta |
| **Descripción** | El Administrador gestiona cuentas de usuarios (Compradores y Vendedores) y modera las Publicaciones del Catálogo. |
| **Entradas** | Acción del Administrador (suspender, reactivar, eliminar Publicación) |
| **Salidas** | Estado actualizado de cuenta o Publicación; efecto cascada según RN-10 |
| **Precondiciones** | El Administrador está autenticado con rol de Administrador. |
| **Postcondiciones** | La cuenta o Publicación refleja el estado actualizado. Se aplican los efectos de cascada correspondientes. |
| **Flujo principal** | 1. El Administrador accede al panel de administración. 2. Selecciona un usuario o Publicación. 3. Ejecuta la acción de gestión. 4. El Marketplace aplica los efectos correspondientes. |
| **Flujos de excepción** | E1: El Administrador suspende un Vendedor → Todas sus Publicaciones activas se deshabilitan inmediatamente (RN-10). |
| **Dependencias** | RN-10 |

#### Criterios de Aceptación — RF-11

| ID | Criterio |
|---|---|
| CA-RF11-01 | **Given** el Administrador suspende una cuenta de Vendedor, **When** la acción se confirma, **Then** todas las Publicaciones activas del Vendedor son deshabilitadas del Catálogo de forma inmediata. |
| CA-RF11-02 | **Given** el Administrador elimina una Publicación por incumplimiento, **When** la acción se confirma, **Then** la Publicación deja de aparecer en el Catálogo inmediatamente. |
| CA-RF11-03 | **Given** el Administrador accede a los reportes, **When** consulta ventas y actividad, **Then** el sistema presenta datos agregados con actualización máxima de 24 horas de antigüedad. |

---

## 7. Módulo: Autenticación y Usuarios

### RF-12 — Registro y autenticación de usuarios

| Campo | Descripción |
|---|---|
| **ID** | RF-12 |
| **Nombre** | Registro y autenticación de usuarios |
| **Actor principal** | Comprador, Vendedor, Administrador |
| **Prioridad** | Alta |
| **Descripción** | El sistema permite el registro de nuevos usuarios con verificación de correo electrónico y la autenticación segura de usuarios registrados con control de intentos fallidos. |
| **Entradas** | Datos de registro (nombre, correo, contraseña); credenciales de acceso |
| **Salidas** | Cuenta creada y activada; Sesión iniciada; token de acceso |
| **Precondiciones** | Ninguna para registro. Cuenta activa para autenticación. |
| **Postcondiciones** | Para registro: cuenta creada pendiente de verificación. Para autenticación: Sesión activa con token válido. |
| **Flujo principal** | Registro: 1. Usuario completa el formulario con datos válidos. 2. El Marketplace valida la contraseña (RN-09). 3. Crea la cuenta. 4. Envía correo de verificación. 5. Usuario confirma. 6. Cuenta activada. Autenticación: 1. Usuario ingresa credenciales. 2. El Marketplace valida. 3. Inicia la Sesión y emite el token. |
| **Flujos de excepción** | E1: Contraseña no cumple política (RN-09) → El Marketplace indica los criterios incumplidos. E2: Tres intentos fallidos consecutivos → Bloqueo temporal 15 minutos (RN-08). |
| **Dependencias** | RN-08, RN-09 |

#### Criterios de Aceptación — RF-12

| ID | Criterio |
|---|---|
| CA-RF12-01 | **Given** un usuario completa el registro con datos válidos y contraseña segura, **When** confirma el correo, **Then** la cuenta queda activa y el usuario puede iniciar sesión. |
| CA-RF12-02 | **Given** un usuario intenta autenticarse con credenciales incorrectas tres veces consecutivas, **When** el tercer intento falla, **Then** el Marketplace bloquea la cuenta por 15 minutos e informa al usuario. |
| CA-RF12-03 | **Given** un usuario intenta registrar una contraseña sin mayúscula ni dígito, **When** el Marketplace valida, **Then** rechaza la contraseña e indica los criterios no cumplidos. |
| CA-RF12-04 | **Given** un usuario autenticado solicita cerrar sesión, **When** la acción se ejecuta, **Then** la Sesión es invalidada y los tokens de acceso son eliminados. |

---

## 8. Módulo: Contexto y Accesibilidad

### RF-13 — Gestión de Sesión del Agente

| Campo | Descripción |
|---|---|
| **ID** | RF-13 |
| **Nombre** | Gestión de Sesión y contexto del Agente Inteligente |
| **Actor principal** | Comprador |
| **Prioridad** | Alta |
| **Descripción** | El sistema gestiona la persistencia del Contexto de Sesión del Agente, limpiándolo tras 30 minutos de inactividad del usuario (RN-14). |
| **Entradas** | Acciones o mensajes del usuario; tiempo de inactividad |
| **Salidas** | Sesión expirada y contexto borrado o sesión renovada |
| **Precondiciones** | La Sesión está activa. |
| **Postcondiciones** | Tras 30 minutos de inactividad, el contexto se destruye automáticamente. |
| **Flujo principal** | 1. El usuario realiza una acción. 2. El temporizador de inactividad de la sesión se reinicia. 3. Si pasan 30 minutos sin interacciones, el sistema destruye el Contexto de Sesión. |
| **Flujos de excepción** | Ninguno. |
| **Dependencias** | RN-14 |

#### Criterios de Aceptación — RF-13

| ID | Criterio |
|---|---|
| CA-RF13-01 | **Given** una sesión activa del Agente, **When** transcurren 30 minutos de inactividad del usuario, **Then** el Contexto de Sesión es destruido automáticamente. |
| CA-RF13-02 | **Given** una sesión activa del Agente, **When** el usuario realiza una nueva consulta antes de los 30 minutos, **Then** el tiempo de inactividad se reinicia. |

---

### RF-14 — Accesibilidad e Inclusión

| Campo | Descripción |
|---|---|
| **ID** | RF-14 |
| **Nombre** | Accesibilidad e Inclusión conforme a WCAG 2.1 AA |
| **Actor principal** | Comprador, Vendedor, Administrador |
| **Prioridad** | Alta |
| **Descripción** | El Marketplace ofrece interfaces accesibles cumpliendo las WCAG 2.1 AA, incluyendo lectores de pantalla y alternativas visuales. |
| **Entradas** | Navegación del usuario, uso de lectores de pantalla |
| **Salidas** | Elementos UI estructurados semánticamente y con soporte de accesibilidad |
| **Precondiciones** | Ninguna. |
| **Postcondiciones** | La UI permite la correcta navegación para usuarios con capacidades diferentes. |
| **Flujo principal** | 1. El usuario con discapacidad accede al sitio. 2. Navega por las secciones utilizando teclado o lector de pantalla. 3. Los elementos y etiquetas semánticos exponen correctamente su estado e información. |
| **Flujos de excepción** | Ninguno. |
| **Dependencias** | RNF-15, RNF-16 |

#### Criterios de Aceptación — RF-14

| ID | Criterio |
|---|---|
| CA-RF14-01 | **Given** la interfaz de la plataforma, **When** se navega usando lector de pantalla, **Then** todos los elementos interactivos cuentan con etiquetas descriptivas accesibles. |
| CA-RF14-02 | **Given** el Marketplace, **When** el Agente está procesando una consulta, **Then** se muestran indicadores visuales claros del estado de procesamiento. |

---

### RF-15 — Notificaciones al Usuario

| Campo | Descripción |
|---|---|
| **ID** | RF-15 |
| **Nombre** | Envío de notificaciones al usuario por email |
| **Actor principal** | Comprador, Vendedor |
| **Prioridad** | Media |
| **Descripción** | El sistema envía notificaciones oportunas mediante correo electrónico (vía Resend) a los usuarios según sus preferencias (RN-12). |
| **Entradas** | Eventos del sistema (nueva orden, cambio de estado de orden, restablecimiento de contraseña) |
| **Salidas** | Correo electrónico enviado al usuario |
| **Precondiciones** | El usuario tiene sus preferencias de notificación activas (RN-12). |
| **Postcondiciones** | El correo es entregado con los datos de la notificación. |
| **Flujo principal** | 1. Ocurre un evento en el sistema (ej. confirmación de orden). 2. El sistema consulta las preferencias del usuario. 3. Si las notificaciones están permitidas, el sistema envía el correo transaccional utilizando el servicio Resend. |
| **Flujos de excepción** | E1: Falla el servicio de correo → Se encola el envío para reintento automático. |
| **Dependencias** | RN-12 |

#### Criterios de Aceptación — RF-15

| ID | Criterio |
|---|---|
| CA-RF15-01 | **Given** un Comprador completa una compra, **When** el pago es aprobado, **Then** el sistema envía una notificación por correo electrónico con los detalles de su orden. |
| CA-RF15-02 | **Given** un Vendedor recibe una nueva orden, **When** la transacción es confirmada, **Then** el Vendedor recibe un email de notificación dentro de 60 segundos. |
