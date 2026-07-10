# Documento de Requisitos — Marketplace Inteligente Asistido por IA

## Introducción

El Marketplace Inteligente es una plataforma de comercio electrónico que incorpora un **Agente Inteligente** capaz de comprender instrucciones en lenguaje natural (texto y voz) y ejecutar acciones dentro del Marketplace en nombre del usuario. El agente interpreta la intención del usuario, identifica entidades relevantes (productos, categorías, filtros, restricciones), y opera directamente sobre las funciones del sistema: búsqueda, filtrado, ordenamiento, comparación, gestión de carrito y compra. A diferencia de un chatbot conversacional, el Agente Inteligente es un actor funcional que ejecuta flujos completos de negocio mediante instrucciones en lenguaje natural.

---

## Glosario

- **Marketplace**: Plataforma digital que conecta compradores y vendedores para realizar transacciones comerciales.
- **Agente_Inteligente**: Componente del sistema capaz de interpretar instrucciones en lenguaje natural (texto y voz), identificar intenciones y entidades, y ejecutar acciones funcionales dentro del Marketplace.
- **Comprador**: Usuario registrado que puede buscar, comparar y adquirir productos dentro del Marketplace.
- **Vendedor**: Usuario registrado que puede publicar, gestionar y vender productos dentro del Marketplace.
- **Administrador**: Usuario con privilegios elevados responsable de la gestión operativa del Marketplace.
- **Visitante**: Usuario no autenticado que puede explorar el Marketplace sin realizar transacciones.
- **Intención**: Propósito comunicado por el usuario mediante lenguaje natural que el Agente_Inteligente debe reconocer y ejecutar.
- **Entidad**: Elemento de información extraído de una instrucción (nombre de producto, categoría, marca, precio, restricción, etc.).
- **Restricción**: Condición limitante expresada en una instrucción de usuario (ej. "con envío gratis", "menor a $50").
- **Carrito**: Contenedor temporal que acumula productos seleccionados por el Comprador antes de finalizar una compra.
- **Orden**: Registro formal de una transacción de compra completada.
- **Catálogo**: Conjunto de productos disponibles publicados por Vendedores dentro del Marketplace.
- **Filtro**: Criterio aplicado para reducir el conjunto de resultados mostrados al usuario.
- **Sesión**: Contexto activo del Agente_Inteligente que conserva el estado de la conversación y las acciones previas.
- **STT** (Speech-to-Text): Servicio externo que convierte audio de voz en texto.
- **TTS** (Text-to-Speech): Servicio externo que convierte texto en audio de voz para responder al usuario.
- **Pasarela_de_Pago**: Servicio externo que procesa las transacciones financieras.
- **Publicación**: Registro de un producto en el Catálogo realizado por un Vendedor.
- **Prioridad**: Clasificación de importancia de un requisito — Alta, Media, Baja.

---

## Requisitos

### Requisito 1: Procesamiento de Instrucciones en Lenguaje Natural (Texto)

**User Story:** Como Comprador, quiero ingresar instrucciones en lenguaje natural mediante texto, para que el Agente_Inteligente entienda mi intención y ejecute la acción correspondiente sin necesidad de aprender comandos específicos.

#### Criterios de Aceptación

1. WHEN el Comprador ingresa una instrucción en texto, THE Agente_Inteligente SHALL identificar la intención principal de la instrucción dentro de un tiempo máximo de 2 segundos.
2. WHEN el Agente_Inteligente identifica la intención, THE Agente_Inteligente SHALL extraer todas las entidades y restricciones presentes en la instrucción.
3. IF el Agente_Inteligente no puede identificar la intención con certeza suficiente, THEN THE Agente_Inteligente SHALL solicitar una aclaración al Comprador indicando qué parte de la instrucción es ambigua.
4. WHEN el Agente_Inteligente ejecuta una acción, THE Agente_Inteligente SHALL informar al Comprador sobre la acción ejecutada y su resultado.
5. THE Agente_Inteligente SHALL mantener el contexto de la Sesión activa para interpretar instrucciones posteriores en función de acciones previas.

---

### Requisito 2: Procesamiento de Instrucciones por Voz

**User Story:** Como Comprador, quiero hablar con el Agente_Inteligente mediante voz, para interactuar con el Marketplace de forma más natural cuando no puedo o no quiero escribir.

#### Criterios de Aceptación

1. WHEN el Comprador activa el modo de voz, THE Agente_Inteligente SHALL capturar el audio y enviarlo al servicio STT para obtener la transcripción en texto.
2. WHEN el servicio STT retorna la transcripción, THE Agente_Inteligente SHALL procesar el texto resultante aplicando las mismas reglas de interpretación que para instrucciones escritas.
3. WHEN el Agente_Inteligente genera una respuesta, THE Agente_Inteligente SHALL enviar la respuesta al servicio TTS y reproducir el audio resultante al Comprador.
4. IF el servicio STT no puede transcribir el audio con suficiente confianza, THEN THE Agente_Inteligente SHALL informar al Comprador que la instrucción de voz no fue comprendida y solicitará que la repita o la escriba.
5. WHILE el modo de voz esté activo, THE Agente_Inteligente SHALL mantener el indicador visual de escucha activa visible para el Comprador.

---

### Requisito 3: Búsqueda de Productos mediante el Agente Inteligente

**User Story:** Como Comprador, quiero indicarle al Agente_Inteligente qué producto deseo encontrar, para que realice la búsqueda en el Catálogo sin que yo tenga que navegar manualmente.

#### Criterios de Aceptación

1. WHEN el Comprador expresa una instrucción de búsqueda, THE Agente_Inteligente SHALL ejecutar una búsqueda en el Catálogo usando las entidades y restricciones extraídas.
2. WHEN la búsqueda retorna resultados, THE Agente_Inteligente SHALL presentar los resultados al Comprador con información suficiente para identificar cada producto (nombre, precio, imagen, vendedor).
3. WHEN la búsqueda no retorna resultados, THE Agente_Inteligente SHALL informar al Comprador que no se encontraron productos y sugerirá instrucciones alternativas.
4. THE Marketplace SHALL retornar los resultados de búsqueda al Agente_Inteligente dentro de un tiempo máximo de 3 segundos desde que se ejecuta la consulta.
5. WHEN el Agente_Inteligente presenta resultados, THE Agente_Inteligente SHALL mantener dichos resultados como contexto activo de la Sesión para instrucciones de seguimiento.

---

### Requisito 4: Filtrado de Resultados mediante el Agente Inteligente

**User Story:** Como Comprador, quiero indicarle al Agente_Inteligente que aplique filtros sobre los resultados actuales, para refinar la búsqueda sin perder el contexto de mi exploración.

#### Criterios de Aceptación

1. WHEN el Comprador indica una restricción de filtrado sobre resultados existentes, THE Agente_Inteligente SHALL aplicar el filtro correspondiente al conjunto de resultados activo en la Sesión.
2. WHEN se aplica un filtro, THE Agente_Inteligente SHALL actualizar los resultados visibles sin eliminar el historial de la Sesión.
3. IF el filtro aplicado resulta en un conjunto vacío de productos, THEN THE Agente_Inteligente SHALL informar al Comprador e indicará los filtros activos que produjeron ese resultado.
4. THE Agente_Inteligente SHALL soportar filtros por precio, categoría, marca, disponibilidad, calificación y condición de envío.
5. WHEN el Comprador solicita eliminar un filtro específico, THE Agente_Inteligente SHALL remover únicamente dicho filtro y actualizará los resultados.

---

### Requisito 5: Ordenamiento de Resultados mediante el Agente Inteligente

**User Story:** Como Comprador, quiero indicarle al Agente_Inteligente cómo ordenar los resultados actuales, para ver primero los productos más relevantes según mi criterio.

#### Criterios de Aceptación

1. WHEN el Comprador indica un criterio de ordenamiento, THE Agente_Inteligente SHALL reordenar los resultados activos en la Sesión según el criterio indicado.
2. THE Agente_Inteligente SHALL soportar ordenamiento por precio ascendente, precio descendente, calificación, relevancia y novedad.
3. WHEN se aplica un nuevo criterio de ordenamiento, THE Agente_Inteligente SHALL mantener todos los filtros activos previamente aplicados.
4. IF el criterio de ordenamiento expresado no es reconocible, THEN THE Agente_Inteligente SHALL presentar al Comprador los criterios de ordenamiento disponibles y solicitará confirmación.

---

### Requisito 6: Comparación de Productos mediante el Agente Inteligente

**User Story:** Como Comprador, quiero pedirle al Agente_Inteligente que compare productos de la lista actual, para tomar una decisión de compra informada.

#### Criterios de Aceptación

1. WHEN el Comprador solicita comparar productos, THE Agente_Inteligente SHALL presentar una vista comparativa con los atributos relevantes de cada producto seleccionado.
2. THE Agente_Inteligente SHALL permitir la comparación de entre 2 y 5 productos simultáneamente.
3. WHEN el Comprador no especifica qué productos comparar, THE Agente_Inteligente SHALL comparar los primeros productos del conjunto de resultados activo.
4. WHEN se presenta la comparación, THE Agente_Inteligente SHALL destacar visualmente los atributos donde un producto supera a los demás.
5. IF los productos seleccionados para comparar tienen categorías distintas, THEN THE Agente_Inteligente SHALL advertir al Comprador que los productos pertenecen a categorías diferentes antes de mostrar la comparación.

---

### Requisito 7: Gestión del Carrito mediante el Agente Inteligente

**User Story:** Como Comprador, quiero indicarle al Agente_Inteligente que agregue productos al Carrito, para acumular mis selecciones sin interrumpir el flujo de exploración.

#### Criterios de Aceptación

1. WHEN el Comprador indica que desea agregar un producto al Carrito, THE Agente_Inteligente SHALL agregar el producto especificado al Carrito del Comprador.
2. WHEN el Comprador no especifica explícitamente qué producto agregar, THE Agente_Inteligente SHALL inferir el producto del contexto activo de la Sesión (ej. "el primero", "la más barata").
3. WHEN un producto es agregado al Carrito, THE Marketplace SHALL confirmar visualmente al Comprador la adición con el nombre del producto y el total actualizado del Carrito.
4. IF el producto indicado no está disponible en el stock requerido, THEN THE Agente_Inteligente SHALL informar al Comprador la disponibilidad real y ofrecerá alternativas del contexto activo.
5. WHEN el Comprador solicita ver el Carrito, THE Agente_Inteligente SHALL mostrar todos los productos agregados con sus cantidades, precios individuales y precio total.
6. WHEN el Comprador indica que desea eliminar un producto del Carrito, THE Agente_Inteligente SHALL remover el producto especificado y actualizará el total del Carrito.

---

### Requisito 8: Ejecución de Compra mediante el Agente Inteligente

**User Story:** Como Comprador, quiero indicarle al Agente_Inteligente que realice la compra, para completar una transacción sin necesidad de navegar por múltiples pantallas.

#### Criterios de Aceptación

1. WHEN el Comprador indica su intención de comprar, THE Agente_Inteligente SHALL verificar que el Comprador esté autenticado antes de iniciar el proceso de compra.
2. WHEN el proceso de compra se inicia, THE Marketplace SHALL verificar la disponibilidad de todos los productos del Carrito antes de proceder al pago.
3. WHEN el Comprador confirma la compra, THE Marketplace SHALL enviar la solicitud de pago a la Pasarela_de_Pago y esperará confirmación.
4. WHEN la Pasarela_de_Pago confirma el pago, THE Marketplace SHALL registrar la Orden, actualizar el stock de los productos comprados y notificar al Comprador y al Vendedor correspondiente.
5. IF la Pasarela_de_Pago rechaza el pago, THEN THE Marketplace SHALL informar al Comprador el motivo del rechazo y le ofrecerá la opción de intentar con otro método de pago.
6. IF algún producto del Carrito no está disponible al momento de confirmar la compra, THEN THE Marketplace SHALL notificar al Comprador qué productos no están disponibles y permitirá continuar con los productos restantes.
7. WHEN la Orden es registrada, THE Marketplace SHALL generar un número de confirmación único y lo presentará al Comprador.

---

### Requisito 9: Gestión de Sesión del Agente Inteligente

**User Story:** Como Comprador, quiero que el Agente_Inteligente recuerde el contexto de nuestra interacción durante la sesión, para poder dar instrucciones de seguimiento sin repetir información ya indicada.

#### Criterios de Aceptación

1. THE Agente_Inteligente SHALL mantener el historial de instrucciones y acciones ejecutadas durante la Sesión activa.
2. WHEN el Comprador da una instrucción de seguimiento que hace referencia a resultados previos, THE Agente_Inteligente SHALL resolver la referencia usando el contexto de la Sesión.
3. WHEN la Sesión del Comprador expira o es cerrada, THE Agente_Inteligente SHALL limpiar el estado de la Sesión y los datos temporales asociados.
4. IF el Comprador inicia una nueva búsqueda sin relación con el contexto anterior, THE Agente_Inteligente SHALL actualizar el contexto activo de la Sesión con los nuevos resultados, preservando el historial.
5. THE Agente_Inteligente SHALL mantener el contexto de la Sesión por un período mínimo de 30 minutos de inactividad antes de expirar.

---

### Requisito 10: Publicación de Productos por el Vendedor

**User Story:** Como Vendedor, quiero publicar productos en el Marketplace, para ponerlos a disposición de los Compradores en el Catálogo.

#### Criterios de Aceptación

1. WHEN el Vendedor completa el formulario de publicación con todos los campos obligatorios, THE Marketplace SHALL crear la Publicación y la incluirá en el Catálogo.
2. THE Marketplace SHALL requerir para cada Publicación: nombre, descripción, precio, categoría, cantidad disponible e imágenes.
3. IF el Vendedor omite un campo obligatorio, THEN THE Marketplace SHALL señalar los campos faltantes e impedirá la creación de la Publicación hasta que sean completados.
4. WHEN una Publicación es creada, THE Marketplace SHALL asignarle un identificador único y una marca temporal de publicación.
5. WHEN el Vendedor modifica el precio o la disponibilidad de una Publicación activa, THE Marketplace SHALL reflejar los cambios en el Catálogo dentro de un tiempo máximo de 60 segundos.

---

### Requisito 11: Gestión de Órdenes por el Vendedor

**User Story:** Como Vendedor, quiero visualizar y gestionar las órdenes de compra recibidas, para preparar y despachar los pedidos de mis Compradores.

#### Criterios de Aceptación

1. WHEN se registra una Orden que incluye productos del Vendedor, THE Marketplace SHALL notificar al Vendedor dentro de los 60 segundos posteriores al registro de la Orden.
2. THE Marketplace SHALL presentar al Vendedor el estado de cada Orden: pendiente, confirmada, en preparación, despachada, entregada o cancelada.
3. WHEN el Vendedor actualiza el estado de una Orden, THE Marketplace SHALL notificar al Comprador correspondiente sobre el cambio de estado.
4. IF el Vendedor no confirma una Orden dentro de las 24 horas siguientes a su recepción, THEN THE Marketplace SHALL escalar la Orden al Administrador para su revisión.

---

### Requisito 12: Administración del Marketplace

**User Story:** Como Administrador, quiero gestionar usuarios, publicaciones y órdenes del Marketplace, para garantizar el correcto funcionamiento de la plataforma.

#### Criterios de Aceptación

1. THE Marketplace SHALL permitir al Administrador suspender o reactivar la cuenta de cualquier Vendedor o Comprador.
2. THE Marketplace SHALL permitir al Administrador eliminar Publicaciones que incumplan las políticas del Marketplace.
3. WHEN el Administrador suspende una cuenta de Vendedor, THE Marketplace SHALL deshabilitar todas las Publicaciones activas de dicho Vendedor de forma inmediata.
4. THE Marketplace SHALL proveer al Administrador reportes agregados de ventas, usuarios activos, publicaciones y órdenes con una frecuencia mínima de actualización de 24 horas.
5. WHEN el Administrador recibe una Orden escalada, THE Marketplace SHALL presentar el historial completo de la Orden para permitir la toma de decisiones.

---

### Requisito 13: Registro y Autenticación de Usuarios

**User Story:** Como usuario del sistema (Comprador, Vendedor, Administrador), quiero registrarme y autenticarme en el Marketplace, para acceder a las funciones correspondientes a mi rol.

#### Criterios de Aceptación

1. WHEN un nuevo usuario completa el formulario de registro con datos válidos, THE Marketplace SHALL crear la cuenta y enviará un mensaje de verificación al correo electrónico proporcionado.
2. WHEN el usuario confirma su correo electrónico, THE Marketplace SHALL activar la cuenta y permitirá el inicio de sesión.
3. IF un usuario intenta iniciar sesión con credenciales incorrectas tres veces consecutivas, THEN THE Marketplace SHALL bloquear temporalmente el acceso a la cuenta por un período de 15 minutos.
4. WHEN un usuario autenticado solicita cerrar sesión, THE Marketplace SHALL invalidar la sesión activa y eliminará los tokens de acceso asociados.
5. THE Marketplace SHALL requerir contraseñas de mínimo 8 caracteres que incluyan al menos una letra mayúscula, una minúscula y un dígito numérico.

---

### Requisito 14: Accesibilidad e Inclusión

**User Story:** Como Comprador con necesidades de accesibilidad, quiero interactuar con el Marketplace mediante voz u otras modalidades de entrada, para acceder a todas las funciones sin barreras.

#### Criterios de Aceptación

1. THE Marketplace SHALL ofrecer la modalidad de interacción por voz como alternativa equivalente a la interacción por texto para todas las funciones del Agente_Inteligente.
2. THE Marketplace SHALL cumplir con los criterios de conformidad del nivel AA de las Pautas de Accesibilidad para el Contenido Web (WCAG 2.1).
3. WHEN el Comprador utiliza un lector de pantalla, THE Marketplace SHALL proveer etiquetas y descripciones textuales para todos los elementos visuales interactivos.

---

### Requisito 15: Notificaciones al Usuario

**User Story:** Como Comprador o Vendedor, quiero recibir notificaciones relevantes sobre mis transacciones y actividad, para mantenerme informado sin necesidad de acceder activamente al Marketplace.

#### Criterios de Aceptación

1. WHEN se registra una Orden, THE Marketplace SHALL enviar una notificación al Comprador y al Vendedor involucrado dentro de los 60 segundos posteriores al registro.
2. WHEN el estado de una Orden cambia, THE Marketplace SHALL notificar al Comprador afectado dentro de los 60 segundos posteriores al cambio.
3. THE Marketplace SHALL permitir al usuario configurar sus preferencias de notificación para activar o desactivar cada tipo de notificación disponible.
4. IF el usuario ha desactivado un tipo de notificación, THEN THE Marketplace SHALL respetar dicha preferencia y no enviará ese tipo de notificación hasta que el usuario la reactive.
