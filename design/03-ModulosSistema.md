# Módulos del Sistema — Aura Marketplace

## Introducción

Este documento describe los veinte módulos funcionales del sistema. Cada módulo tiene responsabilidades delimitadas, interfaces conceptuales claras y dependencias explícitas. Ningún módulo accede directamente al estado interno de otro; toda colaboración ocurre a través de interfaces publicadas.

---

## Módulo 1 — Autenticación

**Objetivo:** Gestionar el ciclo de vida de las identidades de usuario y las sesiones activas, garantizando que solo usuarios legítimos accedan a las funcionalidades según su rol.

**Responsabilidades:**
- Registrar nuevos usuarios con validación de contraseña (RN-09).
- Enviar correo de verificación y activar cuentas confirmadas.
- Autenticar usuarios mediante credenciales válidas y emitir tokens de sesión.
- Controlar intentos de autenticación fallidos y aplicar bloqueo temporal de 15 minutos tras 3 intentos consecutivos (RN-08).
- Invalidar tokens al cerrar sesión.
- Garantizar que las contraseñas se almacenen siempre cifradas con sal (RNF-07).

**Entradas:** Datos de registro (nombre, correo, contraseña), credenciales de acceso, solicitud de cierre de sesión.

**Salidas:** Cuenta creada, token de acceso emitido, confirmación de cierre de sesión, mensajes de error de validación.

**Dependencias:** Módulo de Usuarios (para persistir datos de cuenta), Módulo de Notificaciones (para enviar correo de verificación).

**Eventos que produce:** UsuarioRegistrado, SesionIniciada, SesionCerrada.

**Restricciones:** Las contraseñas nunca se almacenan ni transmiten en texto plano. Los Access Tokens expiran en 15 minutos y los Refresh Tokens en 7 días (RNF-09).

**Interfaces conceptuales que expone:** Registrar usuario, autenticar usuario, cerrar sesión, verificar validez de token, obtener rol del usuario autenticado.

---

## Módulo 2 — Usuarios

**Objetivo:** Gestionar los datos de perfil de los usuarios del Marketplace y sus preferencias de notificación.

**Responsabilidades:**
- Almacenar y proveer datos de perfil de Compradores, Vendedores y Administradores.
- Permitir la actualización de datos personales, dirección y método de pago referenciado.
- Almacenar y gestionar las preferencias de notificación de cada usuario (RN-12).
- Proveer el estado de la cuenta (activo, suspendido, pendiente) a los módulos que lo requieran.

**Entradas:** Solicitudes de actualización de perfil, cambios de preferencias, cambios de estado de cuenta.

**Salidas:** Datos de perfil actualizados, preferencias de notificación, estado de cuenta.

**Dependencias:** Módulo de Autenticación (para identidad del usuario).

**Eventos que produce:** Ninguno directo; responde a eventos de Autenticación y Administración.

**Restricciones:** Los datos de tarjeta completos nunca se almacenan; solo identificadores de referencia (RNF-10).

**Interfaces conceptuales que expone:** Obtener perfil de usuario, actualizar perfil, obtener preferencias de notificación, actualizar preferencias.


---

## Módulo 3 — Compradores

**Objetivo:** Representar las capacidades y el estado específico del actor Comprador dentro del Marketplace.

**Responsabilidades:**
- Mantener el historial de Órdenes del Comprador.
- Proveer acceso al Carrito asociado al Comprador.
- Gestionar la lista de favoritos y reseñas del Comprador.
- Coordinar la verificación de estado de autenticación para las operaciones que lo requieren (RN-02).

**Entradas:** Solicitudes del Comprador autenticado para consultar historial de órdenes, favoritos y carrito.

**Salidas:** Historial de órdenes, carrito activo, lista de favoritos.

**Dependencias:** Módulo de Usuarios, Módulo de Autenticación, Módulo de Carrito, Módulo de Pedidos, Módulo de Favoritos.

**Restricciones:** Solo usuarios con rol Comprador pueden acceder a estas capacidades. No pueden ver órdenes de otros Compradores.

**Interfaces conceptuales que expone:** Obtener historial de órdenes del Comprador, obtener carrito activo, verificar si el Comprador está autenticado.

---

## Módulo 4 — Vendedores

**Objetivo:** Representar las capacidades y el estado específico del actor Vendedor dentro del Marketplace.

**Responsabilidades:**
- Proveer acceso a las Publicaciones creadas por el Vendedor.
- Mantener el acceso al panel de Órdenes recibidas del Vendedor.
- Aplicar la restricción de que las Publicaciones de un Vendedor suspendido se deshabilitan (RN-10).
- Gestionar el perfil de vendedor y sus preferencias de notificación.

**Entradas:** Solicitudes del Vendedor autenticado para gestionar publicaciones y órdenes.

**Salidas:** Lista de publicaciones del Vendedor, panel de órdenes recibidas.

**Dependencias:** Módulo de Usuarios, Módulo de Autenticación, Módulo de Productos, Módulo de Pedidos.

**Eventos que consume:** VendedorSuspendido (para desencadenar la deshabilitación de publicaciones).

**Restricciones:** Solo usuarios con rol Vendedor acceden a estas capacidades. No pueden ver publicaciones ni órdenes de otros Vendedores.

**Interfaces conceptuales que expone:** Obtener publicaciones del Vendedor, obtener órdenes recibidas, verificar estado de cuenta del Vendedor.

---

## Módulo 5 — Administración

**Objetivo:** Proveer las herramientas de supervisión y moderación del Marketplace al actor Administrador.

**Responsabilidades:**
- Gestionar cuentas de Compradores y Vendedores (suspensión, reactivación).
- Eliminar Publicaciones por incumplimiento de políticas del Marketplace.
- Resolver Órdenes escaladas (RN-07).
- Proveer reportes agregados de ventas, usuarios y Órdenes con actualización máxima de 24 horas.
- Recibir notificaciones de escalamientos automáticos.

**Entradas:** Acciones del Administrador (suspender usuario, reactivar cuenta, eliminar publicación, resolver escalamiento), solicitudes de reportes.

**Salidas:** Estado actualizado de cuentas y publicaciones, resolución de escalamientos, reportes agregados.

**Dependencias:** Módulo de Usuarios, Módulo de Vendedores, Módulo de Compradores, Módulo de Productos, Módulo de Pedidos, Módulo de Notificaciones, Módulo de Auditoría.

**Eventos que produce:** VendedorSuspendido, PublicacionesDeshabilitadas.

**Restricciones:** Solo usuarios con rol Administrador acceden a estas capacidades. No puede modificar publicaciones, solo eliminarlas. No puede ejecutar compras en nombre de un Comprador.

**Interfaces conceptuales que expone:** Suspender cuenta, reactivar cuenta, eliminar publicación, resolver orden escalada, consultar reportes.


---

## Módulo 6 — Productos

**Objetivo:** Gestionar la información de los productos publicados en el Catálogo y su ciclo de vida.

**Responsabilidades:**
- Crear, modificar y gestionar el ciclo de vida de las Publicaciones (RF-09).
- Validar que las Publicaciones tengan todos los campos obligatorios (RN-05) y precio mayor que cero (RN-06).
- Asignar identificadores únicos a las nuevas Publicaciones.
- Garantizar que los cambios sean visibles en el Catálogo dentro de 60 segundos (RNF-04).
- Gestionar los atributos de los productos (nombre, descripción, precio, imágenes, marca).

**Entradas:** Datos de nueva Publicación, solicitudes de modificación, solicitudes de desactivación o reactivación.

**Salidas:** Publicación creada o actualizada con identificador único, errores de validación.

**Dependencias:** Módulo de Categorías, Módulo de Inventario, Módulo de Vendedores.

**Eventos que produce:** PublicacionCreada, Publicación modificada, Publicación desactivada, Publicación eliminada.

**Restricciones:** Solo Vendedores autenticados pueden crear o modificar sus propias Publicaciones. El Administrador solo puede eliminarlas.

**Interfaces conceptuales que expone:** Crear publicación, modificar publicación, desactivar publicación, reactivar publicación, obtener detalle de publicación, buscar publicaciones en el Catálogo.

---

## Módulo 7 — Categorías

**Objetivo:** Proveer la estructura de clasificación de productos del Catálogo.

**Responsabilidades:**
- Mantener el árbol de categorías disponibles en el Marketplace.
- Asociar Publicaciones a sus categorías correspondientes.
- Proveer la lista de categorías para filtrado y navegación.

**Entradas:** Solicitudes de lista de categorías, asociación de publicación a categoría.

**Salidas:** Lista de categorías activas, categoría de una publicación.

**Dependencias:** Módulo de Productos.

**Restricciones:** Solo el Administrador puede crear o modificar categorías del sistema. Los Vendedores solo seleccionan de las categorías existentes.

**Interfaces conceptuales que expone:** Obtener lista de categorías, obtener categoría por identificador, validar que una categoría existe.

---

## Módulo 8 — Inventario

**Objetivo:** Gestionar el stock disponible de cada Publicación y garantizar su consistencia ante operaciones de compra.

**Responsabilidades:**
- Mantener el nivel de stock de cada Publicación.
- Verificar disponibilidad de stock antes del pago (RN-03).
- Decrementar el stock de forma atómica al registrar una Orden (RN-04).
- Actualizar el stock cuando el Vendedor modifica la Publicación.
- Reflejar cambios de stock en el Catálogo dentro de 60 segundos (RNF-04).

**Entradas:** Solicitud de verificación de stock, solicitud de decremento de stock, actualización de stock por el Vendedor.

**Salidas:** Disponibilidad de stock, confirmación de decremento, stock actualizado.

**Dependencias:** Módulo de Productos, Módulo de Pedidos.

**Eventos que produce:** StockDecrementado.

**Restricciones:** El decremento de stock y el registro de la Orden son una operación atómica e indivisible (RN-04). No puede quedar stock en estado negativo.

**Interfaces conceptuales que expone:** Verificar disponibilidad de stock, decrementar stock atómicamente, actualizar nivel de stock.


---

## Módulo 9 — Carrito

**Objetivo:** Mantener el estado temporal de los productos seleccionados por el Comprador antes de iniciar el proceso de compra.

**Responsabilidades:**
- Agregar, modificar cantidad y eliminar productos del Carrito (RF-07).
- Verificar que el Comprador está autenticado antes de cualquier operación (RN-02).
- Presentar el contenido del Carrito con productos, cantidades, precios individuales y total.
- Vaciar el Carrito tras la confirmación de una Orden.
- Consultar disponibilidad de stock al agregar un producto.

**Entradas:** Instrucción de agregar, modificar o eliminar producto del Carrito, solicitud de visualización del Carrito.

**Salidas:** Confirmación de la operación con nombre del producto y total actualizado, contenido del Carrito.

**Dependencias:** Módulo de Compradores (autenticación), Módulo de Productos, Módulo de Inventario.

**Eventos que produce:** ProductoAgregadoAlCarrito, CarritoActualizado.

**Restricciones:** Solo Compradores autenticados pueden operar el Carrito (RN-02). Si el producto no tiene stock, el módulo informa la disponibilidad real y ofrece alternativas.

**Interfaces conceptuales que expone:** Agregar ítem al carrito, modificar cantidad de ítem, eliminar ítem, vaciar carrito, obtener contenido del carrito.

---

## Módulo 10 — Pedidos (Órdenes)

**Objetivo:** Gestionar el ciclo de vida completo de las Órdenes desde su creación hasta su entrega o escalamiento.

**Responsabilidades:**
- Registrar una Orden tras confirmación explícita y pago confirmado (RN-01).
- Generar un número de confirmación único para cada Orden.
- Coordinar con el Módulo de Inventario el decremento atómico de stock (RN-04).
- Gestionar el ciclo de vida de la Orden (pendiente → confirmada → en preparación → despachada → entregada).
- Escalar automáticamente Órdenes con más de 24 horas en estado pendiente (RN-07).
- Notificar al Comprador y al Vendedor sobre cambios de estado.

**Entradas:** Solicitud de registro de Orden (con Carrito validado y pago confirmado), actualización de estado por el Vendedor, resolución de escalamiento por el Administrador.

**Salidas:** Orden registrada con número de confirmación único, estado de Orden actualizado, notificaciones.

**Dependencias:** Módulo de Carrito, Módulo de Inventario, Módulo de Pagos, Módulo de Notificaciones, Módulo de Auditoría.

**Eventos que produce:** OrdenRegistrada, OrdenEscalada.
**Eventos que consume:** PagoConfirmado (para iniciar el registro de la Orden).

**Restricciones:** La Orden no se puede registrar sin confirmación explícita del Comprador (RN-01) y sin pago confirmado. El registro y el decremento de stock son atómicos (RN-04).

**Interfaces conceptuales que expone:** Registrar orden, obtener orden por identificador, actualizar estado de orden, obtener órdenes por vendedor, obtener historial de órdenes del comprador.

---

## Módulo 11 — Pagos

**Objetivo:** Coordinar el proceso de pago entre el Marketplace y la Pasarela de Pago externa.

**Responsabilidades:**
- Enviar la solicitud de cobro a la Pasarela de Pago con el importe y el método referenciado.
- Recibir y procesar la respuesta de la Pasarela (confirmación o rechazo).
- Informar al flujo de compra el resultado del pago.
- Manejar el rechazo de pago y ofrecer la opción de cambiar el método (RF-08, E1).
- Garantizar que los datos completos de tarjeta nunca son almacenados en el sistema (RNF-10).

**Entradas:** Solicitud de cobro (importe, método de pago referenciado), respuesta de la Pasarela de Pago.

**Salidas:** Confirmación de pago con referencia de transacción, rechazo de pago con motivo.

**Dependencias:** Módulo de Pedidos, adaptador externo de Pasarela de Pago.

**Eventos que produce:** PagoConfirmado, PagoRechazado.

**Restricciones:** Solo almacena identificadores de referencia de la Pasarela, nunca datos completos de tarjeta (RNF-10). El tiempo de procesamiento de la Pasarela no se incluye en el límite de 5 segundos (RNF-03).

**Interfaces conceptuales que expone:** Procesar pago, consultar resultado de transacción.


---

## Módulo 12 — Promociones

**Objetivo:** Gestionar las promociones de precio aplicables a los productos del Catálogo.

**Responsabilidades:**
- Definir y almacenar las promociones activas (descuentos por producto o categoría).
- Proveer el precio efectivo de un producto al módulo de Búsquedas y al Carrito.
- Controlar la vigencia temporal de las promociones.

**Entradas:** Definición de promociones por el Vendedor o Administrador, solicitudes de precio efectivo.

**Salidas:** Precio efectivo con descuento aplicado, lista de promociones activas.

**Dependencias:** Módulo de Productos, Módulo de Categorías, Módulo de Vendedores.

**Restricciones:** El precio final con promoción nunca puede ser menor o igual a cero (RN-06 aplicado al precio efectivo).

**Interfaces conceptuales que expone:** Obtener precio efectivo de un producto, consultar promociones activas.

---

## Módulo 13 — Cupones

**Objetivo:** Gestionar los cupones de descuento que los Compradores pueden aplicar durante el proceso de compra.

**Responsabilidades:**
- Validar la existencia, vigencia y condiciones de uso de un cupón.
- Aplicar el descuento del cupón al total del Carrito.
- Controlar el uso de cupones por usuario y por período.

**Entradas:** Código de cupón ingresado por el Comprador, solicitud de aplicación al Carrito.

**Salidas:** Confirmación de aplicación del cupón con nuevo total, mensaje de error si el cupón no es válido.

**Dependencias:** Módulo de Carrito, Módulo de Compradores.

**Restricciones:** Un cupón no puede reducir el total del Carrito por debajo del precio mínimo de compra. El cupón expira según su vigencia y límite de usos.

**Interfaces conceptuales que expone:** Validar cupón, aplicar cupón al carrito, consultar descuento disponible.

---

## Módulo 14 — Favoritos

**Objetivo:** Permitir al Comprador guardar productos de interés para revisitarlos en sesiones futuras.

**Responsabilidades:**
- Agregar y eliminar Publicaciones de la lista de favoritos del Comprador.
- Presentar la lista de favoritos del Comprador con la información actualizada de cada producto.
- Indicar cuando un producto favorito ya no está disponible en el Catálogo.

**Entradas:** Solicitud de agregar o eliminar un favorito, solicitud de consultar la lista de favoritos.

**Salidas:** Lista de favoritos actualizada, confirmación de operación.

**Dependencias:** Módulo de Compradores, Módulo de Productos.

**Restricciones:** Solo Compradores autenticados pueden gestionar favoritos.

**Interfaces conceptuales que expone:** Agregar favorito, eliminar favorito, obtener lista de favoritos del Comprador.

---

## Módulo 15 — Reseñas

**Objetivo:** Gestionar las valoraciones y reseñas de productos realizadas por Compradores que completaron una compra.

**Responsabilidades:**
- Registrar reseñas de Compradores para productos que efectivamente compraron.
- Calcular la calificación promedio de cada Publicación.
- Proveer calificaciones al módulo de Búsquedas para filtrado y ordenamiento por calificación.

**Entradas:** Reseña del Comprador (calificación numérica y texto), solicitud de calificación de un producto.

**Salidas:** Reseña registrada, calificación promedio del producto.

**Dependencias:** Módulo de Compradores, Módulo de Pedidos (para verificar compra previa), Módulo de Productos.

**Restricciones:** Solo Compradores que completaron una compra del producto pueden dejar reseña. Una reseña no puede modificarse una vez publicada sin moderación del Administrador.

**Interfaces conceptuales que expone:** Registrar reseña, obtener calificación promedio de un producto, obtener reseñas de un producto.


---

## Módulo 16 — Búsquedas

**Objetivo:** Proveer capacidades de búsqueda, filtrado y ordenamiento de productos del Catálogo con tiempos de respuesta dentro de los límites establecidos (RNF-02).

**Responsabilidades:**
- Ejecutar consultas de búsqueda con entidades y restricciones extraídas por el Agente.
- Aplicar filtros sobre el conjunto de resultados (precio, categoría, marca, disponibilidad, calificación, condición de envío).
- Aplicar ordenamientos sobre el conjunto de resultados (precio asc./desc., calificación, relevancia, novedad).
- Retornar resultados dentro de 3 segundos en el percentil 95 (RNF-02).
- Mantener tiempos de respuesta con un Catálogo de hasta 1.000.000 de Publicaciones activas (RNF-12).

**Entradas:** Consulta de búsqueda con términos, entidades, restricciones, filtros y criterio de ordenamiento.

**Salidas:** Lista de Publicaciones coincidentes con nombre, precio, imagen, vendedor y calificación.

**Dependencias:** Módulo de Productos, Módulo de Categorías, Módulo de Inventario, Módulo de Reseñas, Módulo de Promociones.

**Restricciones:** El tiempo de búsqueda no debe degradarse más de un 20 % al crecer de 100.000 a 1.000.000 de publicaciones (RNF-12). No devuelve Publicaciones inactivas ni de Vendedores suspendidos.

**Interfaces conceptuales que expone:** Buscar productos, aplicar filtro, eliminar filtro, aplicar ordenamiento, obtener detalle de producto.

---

## Módulo 17 — Conversaciones

**Objetivo:** Registrar y gestionar el historial de interacciones entre el Comprador y el Agente Inteligente dentro de una Sesión.

**Responsabilidades:**
- Almacenar cada instrucción del Comprador y la respuesta correspondiente del Agente.
- Proveer el historial de la conversación activa al Agente para la resolución de referencias contextuales.
- Gestionar el ciclo de vida de la conversación (activa, expirada).
- Limpiar el historial al expirar la Sesión por inactividad (RN-14).

**Entradas:** Instrucción del Comprador, respuesta del Agente, señal de expiración de Sesión.

**Salidas:** Historial de conversación, estado de la conversación, instrucción anterior para referencia contextual.

**Dependencias:** Módulo de Agente Inteligente.

**Restricciones:** El historial no almacena datos personales ni de pago. Expira junto con la Sesión del Agente (RN-14).

**Interfaces conceptuales que expone:** Registrar turno de conversación, obtener historial de conversación activa, cerrar conversación.

---

## Módulo 18 — Notificaciones

**Objetivo:** Gestionar la entrega de notificaciones a usuarios sobre eventos relevantes del Marketplace.

**Responsabilidades:**
- Recibir solicitudes de notificación de otros módulos.
- Verificar las preferencias de notificación del usuario antes de enviar (RN-12).
- Coordinar el envío con el servicio externo de notificaciones.
- Garantizar la entrega de notificaciones de cambio de estado de Orden dentro de 60 segundos (RNF-04 / KPI-07).
- Enviar siempre las notificaciones de seguridad de cuenta, independientemente de las preferencias (RN-12).

**Entradas:** Solicitud de notificación (destinatario, tipo de evento, contenido).

**Salidas:** Confirmación de envío, registro de notificación enviada.

**Dependencias:** Módulo de Usuarios (preferencias), adaptador externo de servicio de notificaciones.

**Eventos que consume:** OrdenRegistrada, OrdenEscalada, cambio de estado de Orden, SesionIniciada (para notificaciones de seguridad).

**Restricciones:** No enviar tipos de notificación desactivados por el usuario, excepto notificaciones de seguridad (RN-12).

**Interfaces conceptuales que expone:** Enviar notificación, consultar preferencias de notificación del usuario.


---

## Módulo 19 — Auditoría

**Objetivo:** Registrar los eventos operativos relevantes del sistema para diagnóstico de incidentes y auditoría de operaciones críticas (RNF-17).

**Responsabilidades:**
- Registrar autenticaciones exitosas y fallidas con marca temporal e identificador de cuenta.
- Registrar instrucciones al Agente Inteligente con intención identificada y resultado.
- Registrar creación, modificación y cambio de estado de Publicaciones.
- Registrar creación y cambios de estado de Órdenes.
- Registrar errores en integraciones con servicios externos.
- Garantizar que los registros no incluyan contraseñas, datos de tarjeta ni datos personales sensibles (RNF-17).

**Entradas:** Eventos operativos de todos los módulos del sistema.

**Salidas:** Registros estructurados con marca temporal, identificador de usuario, módulo origen y resultado.

**Dependencias:** Todos los módulos del sistema emiten eventos de auditoría; este módulo los recibe y persiste.

**Restricciones:** Los registros son inmutables una vez creados. No incluyen datos personales, contraseñas ni datos de pago.

**Interfaces conceptuales que expone:** Registrar evento de auditoría, consultar eventos por módulo, consultar eventos por usuario (solo para el Administrador).

---

## Módulo 20 — Agente Inteligente

**Objetivo:** Interpretar instrucciones en lenguaje natural del Comprador (texto y voz), identificar la intención y las entidades, mantener el contexto conversacional y coordinar la ejecución de acciones funcionales dentro del Marketplace (RF-01 a RF-08).

**Responsabilidades:**
- Recibir instrucciones en texto escrito y en audio transcrito por el servicio STT.
- Verificar el nivel de confianza de la transcripción STT antes de procesarla (RN-11).
- Identificar la intención del usuario y extraer entidades y restricciones.
- Mantener el Contexto de Sesión durante la interacción activa y gestionarlo expirando a los 30 minutos de inactividad (RN-14).
- Resolver referencias contextuales de instrucciones de seguimiento.
- Solicitar confirmación explícita antes de acciones irreversibles como la compra (RN-01).
- Coordinar con los módulos de Búsquedas, Carrito y Pedidos para ejecutar las acciones identificadas.
- Coordinar con la API nativa Web Speech (window.speechSynthesis) en el frontend para sintetizar las respuestas en audio cuando el modo de voz está activo.
- Informar al Comprador el resultado de cada acción ejecutada (RNF-13).
- Operar en modo degradado cuando servicios externos (NLP, STT) no están disponibles (RNF-06).
- Solicitar aclaración al Comprador cuando la intención no puede determinarse (RF-01, E1).

**Entradas:** Texto escrito del Comprador, transcripción de audio con nivel de confianza, respuestas de los módulos funcionales.

**Salidas:** Resultado de la acción ejecutada en texto y opcionalmente en audio, solicitud de aclaración, resumen de Orden para confirmación, mensajes de error en lenguaje natural.

**Dependencias:** Módulo de Búsquedas, Módulo de Carrito, Módulo de Pedidos, Módulo de Conversaciones, Módulo de Autenticación, adaptador externo de NLP (Gemini), STT (Gemini) y API de síntesis de voz en el navegador.

**Eventos que produce:** InstruccionRecibida, IntencionIdentificada, AccionEjecutada.

**Restricciones:**
- No ejecuta acciones irreversibles sin confirmación explícitamente (RN-01).
- No procesa transcripciones STT por debajo del umbral de confianza (RN-11).
- El Contexto de Sesión expira a los 30 minutos de inactividad (RN-14).
- La comparación de productos se limita a entre 2 y 5 productos (RN-13).
- Las operaciones de Carrito y compra requieren Comprador autenticado (RN-02).
- Tiempo de respuesta máximo de 2 segundos en el percentil 95 bajo carga normal (RNF-01).

**Interfaces conceptuales que expone:** Procesar instrucción en texto, procesar instrucción en voz, obtener estado de la sesión del Agente, solicitar aclaración, confirmar acción, cancelar acción en curso.

**Colaboraciones:**
- Con el Módulo de Búsquedas para ejecutar búsquedas, filtros y ordenamientos.
- Con el Módulo de Carrito para agregar, modificar y eliminar productos.
- Con el Módulo de Pedidos para iniciar el proceso de compra y presentar el resumen de Orden.
- Con el Módulo de Conversaciones para registrar el historial y resolver referencias contextuales.
- Con los adaptadores de NLP para la interpretación de lenguaje natural.
- Con el adaptador de STT en el backend y la síntesis en el frontend para la modalidad de voz.
