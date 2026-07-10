# Catálogo de Casos de Uso — Marketplace Inteligente Asistido por IA

## 1. Introducción

Este documento presenta el inventario completo de casos de uso del Marketplace Inteligente. Para cada caso de uso se indica su identificador único, nombre, actor principal, descripción breve y prioridad. Los casos de uso se detallan a nivel de flujo completo en el documento `07-RequisitosFuncionales.md`.

---

## 2. Módulo: Agente Inteligente

| Código | Nombre | Actor Principal | Descripción | Prioridad |
|---|---|---|---|---|
| CU-01 | Ingresar instrucción en texto | Comprador | El Comprador escribe una instrucción en lenguaje natural y el Agente Inteligente la interpreta y ejecuta. | Alta |
| CU-02 | Ingresar instrucción por voz | Comprador | El Comprador activa el modo de voz, habla una instrucción y el Agente la transcribe, interpreta y ejecuta. | Alta |
| CU-03 | Solicitar aclaración de instrucción ambigua | Agente Inteligente | Cuando la intención no puede determinarse con certeza, el Agente solicita al Comprador que aclare su instrucción. | Alta |
| CU-04 | Mantener contexto de Sesión | Agente Inteligente | El Agente preserva el estado de la conversación (resultados activos, filtros, historial) durante la Sesión activa del Comprador. | Alta |

---

## 3. Módulo: Catálogo y Exploración

| Código | Nombre | Actor Principal | Descripción | Prioridad |
|---|---|---|---|---|
| CU-05 | Buscar productos | Comprador | El Comprador instruye al Agente para buscar productos en el Catálogo usando entidades y restricciones en lenguaje natural. | Alta |
| CU-06 | Explorar Catálogo sin Agente | Comprador / Visitante | El usuario navega el Catálogo manualmente sin usar el Agente Inteligente. | Media |
| CU-07 | Filtrar resultados de búsqueda | Comprador | El Comprador instruye al Agente para aplicar uno o más filtros sobre el conjunto de Resultados activo. | Alta |
| CU-08 | Eliminar un filtro activo | Comprador | El Comprador instruye al Agente para remover un filtro específico del conjunto de Resultados activo. | Alta |
| CU-09 | Ordenar resultados de búsqueda | Comprador | El Comprador instruye al Agente para reordenar los Resultados activos según un criterio específico. | Alta |
| CU-10 | Comparar productos | Comprador | El Comprador instruye al Agente para presentar una vista comparativa de entre 2 y 5 productos del conjunto activo. | Alta |
| CU-11 | Ver detalle de un producto | Comprador / Visitante | El usuario accede a la página de detalle de una Publicación con toda la información del producto. | Alta |

---

## 4. Módulo: Carrito

| Código | Nombre | Actor Principal | Descripción | Prioridad |
|---|---|---|---|---|
| CU-12 | Agregar producto al Carrito mediante Agente | Comprador | El Comprador instruye al Agente para agregar un producto al Carrito, con resolución contextual del producto referenciado. | Alta |
| CU-13 | Ver contenido del Carrito | Comprador | El Comprador solicita al Agente o accede directamente al Carrito para ver los productos, cantidades, precios y total. | Alta |
| CU-14 | Modificar cantidad de un producto en el Carrito | Comprador | El Comprador modifica la cantidad de un producto en el Carrito mediante instrucción al Agente o interacción directa. | Alta |
| CU-15 | Eliminar un producto del Carrito | Comprador | El Comprador instruye al Agente o interactúa directamente para eliminar un producto del Carrito. | Alta |
| CU-16 | Vaciar el Carrito | Comprador | El Comprador elimina todos los productos del Carrito. | Media |

---

## 5. Módulo: Proceso de Compra

| Código | Nombre | Actor Principal | Descripción | Prioridad |
|---|---|---|---|---|
| CU-17 | Iniciar proceso de compra | Comprador | El Comprador instruye al Agente para iniciar la compra. El sistema verifica autenticación, stock y presenta el resumen de Orden. | Alta |
| CU-18 | Confirmar compra | Comprador | El Comprador confirma explícitamente la Orden tras revisar el resumen presentado por el Agente. | Alta |
| CU-19 | Seleccionar método de pago | Comprador | El Comprador elige el método de pago registrado con el que desea abonar la Orden. | Alta |
| CU-20 | Procesar pago | Marketplace / Pasarela de Pago | El Marketplace envía la solicitud de pago a la Pasarela y gestiona la respuesta (confirmación o rechazo). | Alta |
| CU-21 | Recibir confirmación de Orden | Comprador | El Comprador recibe el número de confirmación único de la Orden registrada. | Alta |

---

## 6. Módulo: Gestión de Publicaciones (Vendedor)

| Código | Nombre | Actor Principal | Descripción | Prioridad |
|---|---|---|---|---|
| CU-22 | Crear Publicación de producto | Vendedor | El Vendedor completa el formulario con los campos obligatorios para publicar un producto en el Catálogo. | Alta |
| CU-23 | Modificar Publicación existente | Vendedor | El Vendedor actualiza el precio, stock, descripción o imágenes de una Publicación activa. | Alta |
| CU-24 | Desactivar Publicación | Vendedor | El Vendedor retira una Publicación del Catálogo sin eliminarla permanentemente. | Alta |
| CU-25 | Reactivar Publicación | Vendedor | El Vendedor vuelve a poner activa una Publicación previamente desactivada. | Media |

---

## 7. Módulo: Gestión de Órdenes (Vendedor)

| Código | Nombre | Actor Principal | Descripción | Prioridad |
|---|---|---|---|---|
| CU-26 | Ver Órdenes recibidas | Vendedor | El Vendedor accede al listado de Órdenes que incluyen sus productos con su estado actual. | Alta |
| CU-27 | Actualizar estado de Orden | Vendedor | El Vendedor cambia el estado de una Orden (ej. de "pendiente" a "en preparación"). | Alta |
| CU-28 | Recibir notificación de nueva Orden | Vendedor | El Vendedor recibe una notificación automática cuando se registra una Orden con sus productos. | Alta |

---

## 8. Módulo: Administración

| Código | Nombre | Actor Principal | Descripción | Prioridad |
|---|---|---|---|---|
| CU-29 | Suspender cuenta de usuario | Administrador | El Administrador suspende la cuenta de un Comprador o Vendedor. En el caso del Vendedor, sus Publicaciones se deshabilitan (RN-10). | Alta |
| CU-30 | Reactivar cuenta de usuario | Administrador | El Administrador reactiva una cuenta de usuario previamente suspendida. | Alta |
| CU-31 | Eliminar Publicación por incumplimiento | Administrador | El Administrador elimina una Publicación que viola las políticas del Marketplace. | Alta |
| CU-32 | Gestionar Orden escalada | Administrador | El Administrador revisa y toma decisión sobre una Orden que fue escalada por falta de atención del Vendedor. | Alta |
| CU-33 | Consultar reportes del Marketplace | Administrador | El Administrador accede a reportes agregados de ventas, usuarios activos, Publicaciones y Órdenes. | Media |

---

## 9. Módulo: Autenticación y Usuarios

| Código | Nombre | Actor Principal | Descripción | Prioridad |
|---|---|---|---|---|
| CU-34 | Registrarse como Comprador | Visitante | El Visitante crea una cuenta de Comprador completando el formulario de registro con datos válidos. | Alta |
| CU-35 | Registrarse como Vendedor | Visitante | El Visitante crea una cuenta de Vendedor completando el formulario de registro. | Alta |
| CU-36 | Verificar correo electrónico | Comprador / Vendedor | El usuario confirma su correo electrónico mediante el enlace de verificación recibido al registrarse. | Alta |
| CU-37 | Iniciar sesión | Comprador / Vendedor / Administrador | El usuario autenticado accede al Marketplace con su correo y contraseña. | Alta |
| CU-38 | Cerrar sesión | Comprador / Vendedor / Administrador | El usuario finaliza su Sesión activa y el sistema invalida los tokens de acceso. | Alta |
| CU-39 | Configurar preferencias de notificación | Comprador / Vendedor | El usuario activa o desactiva los tipos de notificación disponibles según sus preferencias. | Media |
| CU-40 | Gestionar perfil de usuario | Comprador / Vendedor | El usuario actualiza sus datos personales, dirección o método de pago. | Media |
