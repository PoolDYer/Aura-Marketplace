# 05 — Diseño de Base de Datos: Modelo Conceptual de Datos
# Intelligent Marketplace

---

## 1. Objetivo del Modelo de Datos

El modelo de datos del Intelligent Marketplace tiene como propósito representar, de forma estructurada y coherente, toda la información que el sistema necesita gestionar para operar correctamente. Este modelo define las entidades del dominio, sus atributos esenciales, las relaciones entre ellas y las restricciones que garantizan la integridad del negocio. Su diseño refleja los requisitos funcionales y no funcionales establecidos en la especificación del sistema, asegurando que la información sea almacenada de manera segura, trazable, escalable y consistente a lo largo del ciclo de vida de cada transacción, interacción con el agente de inteligencia artificial y operación de gestión de usuarios, publicaciones e inventario.

---

## 2. Principios de Diseño

1. **Integridad referencial**: Toda relación entre entidades se mantiene mediante vínculos explícitos y verificables. Ninguna entidad dependiente puede existir sin su entidad padre correspondiente.

2. **Consistencia transaccional**: Las operaciones que afectan múltiples entidades de forma simultánea (como registrar una orden y decrementar el inventario) se tratan como unidades atómicas indivisibles, garantizando que el sistema nunca quede en un estado inconsistente.

3. **Separación de datos sensibles**: Los datos de alta sensibilidad (contraseñas, tokens de autenticación, referencias de pago) se almacenan de forma aislada, cifrada o en forma de hash, y nunca se mezclan con datos operacionales de acceso general.

4. **Inmutabilidad de registros críticos**: Los registros que representan hechos consumados del negocio (órdenes, líneas de orden, pagos, auditoría) no pueden ser modificados ni eliminados una vez confirmados. Solo se permite agregar nuevos registros de estado o eventos.

5. **Trazabilidad**: Toda acción relevante del sistema genera un registro de auditoría con suficiente contexto para reconstruir el historial operacional sin exponer datos personales ni sensibles.

6. **Escalabilidad**: El modelo está diseñado para soportar un crecimiento sostenido en el volumen de publicaciones (hasta 1 millón según RNF-12), usuarios concurrentes (hasta 2000 según RNF-11) y transacciones, sin requerir reestructuraciones fundamentales del esquema.

7. **Mínima redundancia con máxima cohesión**: Cada dato se almacena en un único lugar canónico. Las relaciones se usan para acceder a datos relacionados, evitando duplicación que pueda generar inconsistencias.

8. **Separación de responsabilidades por entidad**: Cada entidad del modelo tiene una responsabilidad única y bien definida, evitando entidades "dios" que concentren información de múltiples dominios.

---

## 3. Modelo Conceptual de Información

### 3.1 Usuario

**Propósito**: Representa a toda persona que interactúa con el sistema, ya sea como comprador, vendedor o administrador.

**Responsabilidad**: Centralizar la identidad digital del actor humano, sus credenciales de acceso, su estado dentro del sistema y sus asociaciones con las demás entidades del dominio.

**Atributos esenciales**: identificador único, nombre completo, correo electrónico (único), contraseña en formato hash, estado, fecha de registro, fecha de última modificación.

**Relaciones**:
- Se le asignan uno o más Roles (N:M con Rol).
- Posee un único Carrito activo (1:1 con Carrito).
- Crea múltiples Publicaciones en su rol de Vendedor (1:N con Publicacion).
- Realiza múltiples Órdenes en su rol de Comprador (1:N con Orden).
- Tiene múltiples Direcciones registradas (1:N con Direccion).
- Tiene un único registro de PreferenciasUsuario (1:1).
- Recibe múltiples Notificaciones (1:N con Notificacion).

**Cardinalidades**:
- Usuario → Rol: N:M
- Usuario → Carrito: 1:1 (obligatorio para compradores autenticados)
- Usuario → Publicacion (como Vendedor): 1:N
- Usuario → Orden (como Comprador): 1:N
- Usuario → Direccion: 1:N
- Usuario → PreferenciasUsuario: 1:1
- Usuario → Notificacion: 1:N

**Restricciones**:
- El correo electrónico debe ser único en todo el sistema.
- La contraseña nunca se almacena en texto plano (RNF-07).
- El estado puede ser: `pendiente`, `activo`, `suspendido`.
- Un usuario suspendido no puede operar, pero sus registros históricos se conservan.

**Reglas**:
- Un Vendedor suspendido provoca la deshabilitación automática de todas sus Publicaciones activas (RN-10).
- El estado `pendiente` corresponde a usuarios registrados que aún no han verificado su identidad.

---

### 3.2 Rol

**Propósito**: Agrupa un conjunto de permisos que define qué acciones puede realizar un Usuario dentro del sistema.

**Responsabilidad**: Establecer el perfil de acceso y capacidades operacionales de cada tipo de actor.

**Atributos esenciales**: identificador único, nombre del rol (ej. Comprador, Vendedor, Administrador), descripción.

**Relaciones**:
- Asignado a múltiples Usuarios (N:M con Usuario).
- Agrupa múltiples Permisos (N:M con Permiso).

**Cardinalidades**:
- Rol → Usuario: N:M
- Rol → Permiso: N:M

**Restricciones**:
- El nombre del rol debe ser único.
- Un rol sin permisos asociados no otorga capacidades operacionales.

**Reglas**:
- Un usuario puede tener múltiples roles simultáneamente.
- Los roles son definidos por el administrador del sistema y no por los usuarios finales.

---

### 3.3 Permiso

**Propósito**: Representa una capacidad atómica e indivisible del sistema (ej. "crear publicación", "ver órdenes", "gestionar usuarios").

**Responsabilidad**: Ser la unidad mínima de control de acceso que, agrupada en Roles, determina lo que cada Usuario puede hacer.

**Atributos esenciales**: identificador único, nombre del permiso, módulo al que pertenece, descripción.

**Relaciones**:
- Pertenece a uno o más Roles (N:M con Rol).

**Cardinalidades**:
- Permiso → Rol: N:M

**Restricciones**:
- El nombre del permiso debe ser único dentro de su módulo.
- Un permiso no puede existir sin estar asociado a al menos un rol activo.

**Reglas**:
- Los permisos son inmutables una vez creados; para modificar el acceso se asignan o desvinculan roles.

---

### 3.4 Publicacion

**Propósito**: Representa un producto o servicio ofertado por un Vendedor dentro del marketplace.

**Responsabilidad**: Contener toda la información descriptiva y comercial de un artículo disponible para la venta, manteniendo su estado y vínculo con el inventario.

**Atributos esenciales**: identificador único, nombre, descripción, precio (mayor que cero), estado, fecha de creación, referencias a imágenes (mínimo una), identificador del vendedor (Usuario), identificador de categoría.

**Relaciones**:
- Pertenece a una Categoría (N:1 con Categoria).
- Tiene un único registro de Inventario (1:1 con Inventario).
- Fue creada por un Vendedor/Usuario (N:1 con Usuario).
- Aparece en múltiples LineaOrden (1:N con LineaOrden).
- Puede estar referenciada en múltiples ItemCarrito (1:N con ItemCarrito).

**Cardinalidades**:
- Publicacion → Categoria: N:1
- Publicacion → Inventario: 1:1 (obligatorio)
- Publicacion → Usuario (Vendedor): N:1
- Publicacion → LineaOrden: 1:N
- Publicacion → ItemCarrito: 1:N

**Restricciones**:
- Debe tener nombre, descripción, precio mayor a cero, categoría, stock inicial y al menos una imagen (RN-05, RN-06).
- Los estados válidos son: `borrador`, `activa`, `inactiva`, `eliminada`.
- Una publicación en estado `eliminada` no puede pasar a ningún otro estado.

**Reglas**:
- Solo publicaciones en estado `activa` son visibles para los compradores.
- El precio reflejado en una LineaOrden es el precio vigente al momento de la compra y es inmutable.
- Si el Vendedor es suspendido, todas sus publicaciones activas pasan a estado `inactiva` (RN-10).

---

### 3.5 Categoria

**Propósito**: Organiza las publicaciones en una estructura jerárquica de árbol para facilitar la navegación y búsqueda.

**Responsabilidad**: Proveer un sistema de clasificación de productos que permita a los compradores filtrar y explorar el catálogo de forma intuitiva.

**Atributos esenciales**: identificador único, nombre, descripción, identificador de categoría padre (opcional, nulo si es raíz).

**Relaciones**:
- Agrupa múltiples Publicaciones (1:N con Publicacion).
- Puede tener una Categoría padre (N:1 con Categoria, autoreferencia).
- Puede tener múltiples Categorías hijas (1:N con Categoria, autoreferencia).

**Cardinalidades**:
- Categoria → Publicacion: 1:N
- Categoria → Categoria (padre): N:1 (opcional)
- Categoria → Categoria (hijas): 1:N

**Restricciones**:
- El nombre debe ser único dentro del mismo nivel jerárquico.
- No se permiten referencias circulares en la jerarquía.
- Una categoría no puede ser eliminada si tiene publicaciones activas asociadas.

**Reglas**:
- La jerarquía puede tener múltiples niveles de profundidad.
- Las categorías raíz (sin padre) representan los grandes grupos temáticos del marketplace.

---

### 3.6 Inventario

**Propósito**: Registra y controla la cantidad de stock disponible para una Publicación específica.

**Responsabilidad**: Garantizar que el stock nunca sea negativo y que los decrementos por órdenes se realicen de forma atómica y consistente.

**Atributos esenciales**: identificador único, cantidad disponible (entero no negativo), cantidad reservada, fecha de última actualización, identificador de publicación.

**Relaciones**:
- Vinculado exclusivamente a una Publicacion (1:1 con Publicacion).

**Cardinalidades**:
- Inventario → Publicacion: 1:1 (obligatorio y único)

**Restricciones**:
- La cantidad disponible nunca puede ser menor a cero (RN-04).
- Solo existe un registro de Inventario por Publicacion.
- El decremento de stock y el registro de una Orden son operaciones atómicas.

**Reglas**:
- Cuando el stock llega a cero, la publicación puede pasar a estado `inactiva` automáticamente.
- Los incrementos de stock (reposición) solo pueden realizarlos el Vendedor propietario o un Administrador.

---

### 3.7 Carrito

**Propósito**: Actúa como área de trabajo temporal donde el Comprador acumula los productos que desea comprar antes de confirmar una Orden.

**Responsabilidad**: Mantener la lista de intenciones de compra del usuario autenticado, con la capacidad de ser modificada libremente antes de generar una Orden.

**Atributos esenciales**: identificador único, identificador del usuario (Comprador), fecha de creación, fecha de última modificación, estado.

**Relaciones**:
- Pertenece a un único Usuario/Comprador (1:1 con Usuario).
- Contiene múltiples ItemCarrito (1:N con ItemCarrito).

**Cardinalidades**:
- Carrito → Usuario: 1:1
- Carrito → ItemCarrito: 1:N

**Restricciones**:
- Solo usuarios autenticados con rol Comprador pueden tener un Carrito (RN-02).
- Cada usuario tiene exactamente un Carrito activo en todo momento.
- El Carrito se vacía automáticamente tras la confirmación exitosa de una Orden.

**Reglas**:
- Un Carrito puede contener ítems de distintos Vendedores.
- Los ítems en el Carrito no reservan stock hasta que se confirma la Orden.

---

### 3.8 ItemCarrito

**Propósito**: Representa la inclusión de una Publicación específica con una cantidad determinada dentro del Carrito de un Comprador.

**Responsabilidad**: Registrar qué producto y en qué cantidad el comprador desea adquirir antes de finalizar la compra.

**Atributos esenciales**: identificador único, identificador del carrito, identificador de la publicación, cantidad solicitada (entero positivo), fecha de adición.

**Relaciones**:
- Pertenece a un Carrito (N:1 con Carrito).
- Referencia a una Publicacion (N:1 con Publicacion).

**Cardinalidades**:
- ItemCarrito → Carrito: N:1
- ItemCarrito → Publicacion: N:1

**Restricciones**:
- La cantidad debe ser un entero mayor a cero.
- No pueden existir dos ItemCarrito para la misma Publicacion dentro del mismo Carrito; en ese caso se actualiza la cantidad.
- Si la Publicacion referenciada pasa a estado `inactiva` o `eliminada`, el ítem debe notificarse al comprador.

**Reglas**:
- El precio que figura en el ItemCarrito es referencial y puede cambiar; el precio definitivo se fija en la LineaOrden al confirmar la compra.

---

### 3.9 Orden

**Propósito**: Representa el compromiso comercial firme entre un Comprador y uno o más Vendedores para la adquisición de productos.

**Responsabilidad**: Registrar de forma inmutable el acuerdo de compra, incluyendo los productos, precios, estado de la transacción y la referencia al pago correspondiente.

**Atributos esenciales**: identificador único, identificador del comprador (Usuario), identificador de dirección de entrega, fecha y hora de creación, estado actual, referencia al pago, monto total calculado.

**Relaciones**:
- Pertenece a un Comprador/Usuario (N:1 con Usuario).
- Contiene múltiples LineaOrden (1:N con LineaOrden).
- Tiene un único Pago asociado (1:1 con Pago).
- Utiliza una Direccion del comprador (N:1 con Direccion).

**Cardinalidades**:
- Orden → Usuario (Comprador): N:1
- Orden → LineaOrden: 1:N (mínimo una línea)
- Orden → Pago: 1:1
- Orden → Direccion: N:1

**Restricciones**:
- Una Orden debe tener al menos una LineaOrden.
- El contenido de una Orden es inmutable una vez creada (RN-01).
- Los estados válidos son: `pendiente`, `confirmada`, `en_preparacion`, `despachada`, `entregada`, `cancelada`, `escalada`.
- Las transiciones de estado siguen una secuencia definida; no se permiten retrocesos arbitrarios.

**Reglas**:
- La creación de una Orden y el decremento del stock son operaciones atómicas (RN-04).
- Si el pago no se confirma en el tiempo definido, la Orden puede cancelarse automáticamente y el stock se restituye (RN-03).
- Una Orden `entregada` no puede cancelarse (RN-01).

---

### 3.10 LineaOrden

**Propósito**: Representa el detalle individual de un producto incluido en una Orden, con el precio vigente al momento exacto de la compra.

**Responsabilidad**: Conservar de forma inmutable el registro de qué se compró, en qué cantidad y a qué precio, independientemente de cambios futuros en la Publicacion.

**Atributos esenciales**: identificador único, identificador de la orden, identificador de la publicación, nombre del producto (copia al momento de compra), precio unitario al momento de compra, cantidad, subtotal calculado.

**Relaciones**:
- Pertenece a una Orden (N:1 con Orden).
- Referencia a una Publicacion (N:1 con Publicacion).

**Cardinalidades**:
- LineaOrden → Orden: N:1
- LineaOrden → Publicacion: N:1

**Restricciones**:
- El precio unitario almacenado es inmutable: representa el precio en el instante de la compra y no varía aunque el precio de la Publicacion cambie posteriormente.
- La cantidad debe ser un entero mayor a cero.
- No pueden existir dos LineaOrden para la misma Publicacion dentro de la misma Orden.

**Reglas**:
- Al crear la LineaOrden se copia el precio vigente de la Publicacion para garantizar trazabilidad histórica.
- El subtotal se calcula como precio unitario × cantidad y no puede ser modificado.

---

### 3.11 Pago

**Propósito**: Registra la información del proceso de pago asociado a una Orden, vinculando el resultado del procesador externo con la transacción interna.

**Responsabilidad**: Almacenar únicamente la referencia del procesador de pagos, el monto y el estado del pago, sin retener ningún dato financiero sensible como números de tarjeta.

**Atributos esenciales**: identificador único, identificador de la orden, referencia externa del procesador de pagos (token o ID externo), monto total, estado del pago, fecha y hora del pago, método de pago (tipo genérico).

**Relaciones**:
- Vinculado de forma exclusiva a una Orden (1:1 con Orden).

**Cardinalidades**:
- Pago → Orden: 1:1

**Restricciones**:
- Nunca se almacenan números de tarjeta, CVV ni datos bancarios completos (RNF-10).
- Solo se guarda el identificador o token proporcionado por el procesador de pagos externo.
- El estado del pago puede ser: `pendiente`, `aprobado`, `rechazado`, `reembolsado`.

**Reglas**:
- Un Pago aprobado activa la transición de la Orden al estado `confirmada`.
- Un Pago rechazado mantiene la Orden en estado `pendiente` o la cancela según las reglas de negocio (RN-03).
- El registro de Pago es inmutable una vez creado; los cambios de estado se agregan como eventos.

---

### 3.12 Direccion

**Propósito**: Almacena una dirección física registrada por un Usuario para ser utilizada como destino de entrega en sus Órdenes.

**Responsabilidad**: Proveer un repositorio de direcciones reutilizables vinculadas al usuario, evitando el re-ingreso manual en cada compra.

**Atributos esenciales**: identificador único, identificador del usuario, calle y número, ciudad, estado o provincia, código postal, país, referencia adicional (opcional), estado (activa/inactiva).

**Relaciones**:
- Pertenece a un Usuario (N:1 con Usuario).
- Es utilizada en múltiples Órdenes (1:N con Orden).

**Cardinalidades**:
- Direccion → Usuario: N:1
- Direccion → Orden: 1:N

**Restricciones**:
- Los campos de calle, ciudad, código postal y país son obligatorios.
- Una dirección no puede eliminarse físicamente si está referenciada en una Orden existente; solo puede desactivarse.

**Reglas**:
- Al usarse en una Orden, los datos de la dirección se capturan en ese momento para preservar la información histórica aunque la dirección sea modificada posteriormente.

---

### 3.13 Conversacion

**Propósito**: Agrupa todos los mensajes intercambiados en una sesión de interacción entre el usuario y el agente de inteligencia artificial.

**Responsabilidad**: Mantener el contexto conversacional activo de una sesión, permitiendo al agente mantener coherencia a lo largo del diálogo.

**Atributos esenciales**: identificador único, identificador de sesión, fecha y hora de inicio, fecha y hora de última actividad, estado (activa/expirada).

**Relaciones**:
- Pertenece a una Sesión (1:1 con Sesion).
- Contiene múltiples Mensajes (1:N con Mensaje).

**Cardinalidades**:
- Conversacion → Sesion: 1:1
- Conversacion → Mensaje: 1:N

**Restricciones**:
- Una Conversacion expira automáticamente tras 30 minutos de inactividad (RN-14).
- No puede existir más de una Conversacion activa por Sesion.

**Reglas**:
- Al expirar la sesión, la Conversacion y todos sus Mensajes asociados se marcan como expirados.
- El historial de la conversación expirada no está disponible para el usuario en sesiones posteriores.

---

### 3.14 Mensaje

**Propósito**: Representa una unidad individual de comunicación dentro de una Conversacion, emitida ya sea por el usuario o por el agente de IA.

**Responsabilidad**: Preservar el contenido textual de cada turno del diálogo con su rol, orden cronológico e intenciones detectadas.

**Atributos esenciales**: identificador único, identificador de conversación, rol del emisor (usuario/agente), contenido textual, número de orden dentro de la conversación, fecha y hora de emisión.

**Relaciones**:
- Pertenece a una Conversacion (N:1 con Conversacion).
- Puede tener una Intencion asociada (1:1 con Intencion, solo en mensajes de rol `usuario`).
- Puede tener múltiples EntidadesExtraidas (1:N con EntidadExtraida).

**Cardinalidades**:
- Mensaje → Conversacion: N:1
- Mensaje → Intencion: 1:1 (opcional, solo mensajes de usuario)
- Mensaje → EntidadExtraida: 1:N

**Restricciones**:
- El rol del emisor solo puede ser `usuario` o `agente`.
- El contenido textual es obligatorio y no puede estar vacío.
- Los mensajes son inmutables una vez registrados.

**Reglas**:
- Cada mensaje de usuario debe procesarse para detectar intención y extraer entidades antes de generar la respuesta del agente.

---

### 3.15 Intencion

**Propósito**: Registra la intención semántica identificada por el motor de procesamiento de lenguaje natural en un mensaje del usuario.

**Responsabilidad**: Almacenar qué acción o propósito se detectó en el mensaje del usuario (ej. buscar producto, consultar orden, solicitar ayuda) junto con el nivel de certeza de esa detección.

**Atributos esenciales**: identificador único, identificador del mensaje, tipo de intención (categoría identificada), nivel de confianza (valor decimal entre 0 y 1), fecha de registro.

**Relaciones**:
- Asociada de forma exclusiva a un Mensaje de rol `usuario` (1:1 con Mensaje).

**Cardinalidades**:
- Intencion → Mensaje: 1:1

**Restricciones**:
- Solo puede existir una Intencion por Mensaje.
- El nivel de confianza debe estar entre 0.0 y 1.0.
- El tipo de intención debe pertenecer al catálogo de intenciones definido en el diseño del agente.

**Reglas**:
- Intenciones con nivel de confianza por debajo del umbral mínimo definido deben tratarse como ambiguas y el agente debe solicitar clarificación al usuario.

---

### 3.16 EntidadExtraida

**Propósito**: Registra los fragmentos de información específica extraídos de un mensaje del usuario por el motor de procesamiento de lenguaje natural.

**Responsabilidad**: Almacenar las entidades semánticas identificadas (ej. nombre de producto, rango de precio, categoría, número de orden) para que el agente las utilice en la resolución de la intención detectada.

**Atributos esenciales**: identificador único, identificador del mensaje, tipo de entidad (ej. producto, precio, categoría, identificador de orden), valor extraído (texto), posición de inicio y fin en el texto original, nivel de confianza.

**Relaciones**:
- Asociada a un Mensaje (N:1 con Mensaje).

**Cardinalidades**:
- EntidadExtraida → Mensaje: N:1

**Restricciones**:
- Puede existir cero o más EntidadesExtraidas por Mensaje.
- El tipo de entidad debe pertenecer al catálogo de tipos definido en el diseño del agente.
- El valor extraído no puede estar vacío.

**Reglas**:
- Las entidades extraídas complementan la Intencion para construir la respuesta contextualizada del agente.
- Una misma entidad de tipo distinto puede aparecer múltiples veces en un mismo mensaje.

---

### 3.17 PreferenciasUsuario

**Propósito**: Almacena las preferencias personalizadas de notificación de cada Usuario para los distintos tipos de eventos del sistema.

**Responsabilidad**: Controlar qué tipos de notificaciones desea recibir el usuario y a través de qué canales, respetando las reglas de notificación del sistema (RN-12).

**Atributos esenciales**: identificador único, identificador del usuario, canal preferido para notificaciones de nuevas órdenes, canal preferido para actualizaciones de estado de órdenes, canal preferido para alertas de seguridad, canal preferido para comunicaciones de marketing, estado de opt-in global.

**Relaciones**:
- Vinculada de forma exclusiva a un Usuario (1:1 con Usuario).

**Cardinalidades**:
- PreferenciasUsuario → Usuario: 1:1

**Restricciones**:
- Debe existir exactamente un registro de PreferenciasUsuario por Usuario.
- Las alertas de seguridad no pueden ser desactivadas por el usuario.

**Reglas**:
- El sistema de notificaciones consulta este registro antes de enviar cualquier comunicación al usuario (RN-12).
- Las preferencias pueden ser actualizadas por el usuario en cualquier momento desde su perfil.

---

### 3.18 HistorialBusqueda

**Propósito**: Registra los términos de búsqueda introducidos por un usuario durante una sesión activa, junto con el número de resultados obtenidos.

**Responsabilidad**: Proveer contexto histórico de búsqueda dentro de la sesión para que el agente de IA pueda refinar recomendaciones y sugerir refinamientos relevantes.

**Atributos esenciales**: identificador único, identificador de sesión, término de búsqueda, número de resultados obtenidos, fecha y hora de la búsqueda.

**Relaciones**:
- Pertenece a una Sesión (N:1 con Sesion).

**Cardinalidades**:
- HistorialBusqueda → Sesion: N:1

**Restricciones**:
- El historial de búsqueda expira junto con la sesión a la que pertenece.
- El término de búsqueda no puede estar vacío.

**Reglas**:
- El historial de búsqueda de la sesión actual es accesible por el agente para ofrecer sugerencias contextualizadas.
- Al expirar la sesión, el historial de búsqueda asociado se considera obsoleto y no se transfiere a sesiones nuevas.

---

### 3.19 Notificacion

**Propósito**: Representa un mensaje de aviso o alerta generado por el sistema y dirigido a un Usuario específico sobre un evento relevante.

**Responsabilidad**: Registrar cada notificación generada, su contenido, estado de envío y fecha, para garantizar la trazabilidad de las comunicaciones enviadas al usuario.

**Atributos esenciales**: identificador único, identificador del usuario destinatario, tipo de notificación, contenido del mensaje, estado de envío (pendiente/enviada/fallida), canal de envío, fecha y hora de creación, fecha y hora de envío efectivo.

**Relaciones**:
- Pertenece a un Usuario (N:1 con Usuario).

**Cardinalidades**:
- Notificacion → Usuario: N:1

**Restricciones**:
- El tipo de notificación debe respetar las preferencias registradas en PreferenciasUsuario del destinatario (RN-12).
- Las alertas de seguridad se envían siempre, independientemente de las preferencias del usuario.
- El contenido de la notificación es inmutable una vez registrado.

**Reglas**:
- Las notificaciones fallidas deben reintentarse según la política de reintentos definida.
- Se deben registrar tanto el intento de envío como el resultado efectivo para fines de auditoría.

---

### 3.20 Auditoria

**Propósito**: Registra de forma inmutable cada evento relevante del sistema para garantizar la trazabilidad completa de las operaciones y cumplir con los requisitos de seguridad y responsabilidad.

**Responsabilidad**: Proveer un log de eventos que permita reconstruir el historial de acciones realizadas en el sistema, sin almacenar datos sensibles ni personales que no sean estrictamente necesarios para la trazabilidad.

**Atributos esenciales**: identificador único, fecha y hora exacta del evento (con precisión de milisegundos), identificador del usuario que realizó la acción (o indicador de sistema si es automatizado), módulo del sistema donde ocurrió el evento, tipo de acción (ej. CREAR, MODIFICAR, CANCELAR, AUTENTICAR, RECHAZAR), resultado de la acción (éxito/fallo), descripción contextual del evento, dirección IP del cliente (cuando aplica).

**Relaciones**:
- Referencia a un Usuario (N:1, opcional si la acción es del sistema).

**Cardinalidades**:
- Auditoria → Usuario: N:1 (referencia informativa, no restrictiva)

**Restricciones**:
- Los registros de auditoría son estrictamente inmutables: no pueden modificarse ni eliminarse (RNF-17).
- Nunca se almacenan contraseñas, números de tarjeta, tokens completos ni datos personales sensibles en los registros de auditoría (RNF-17).
- El módulo y el tipo de acción deben pertenecer a los catálogos definidos del sistema.

**Reglas**:
- Todo evento de seguridad, autenticación, transacción económica o modificación de datos críticos debe generar un registro de auditoría.
- Los registros de auditoría son accesibles únicamente por administradores del sistema con los permisos correspondientes.
- La retención de registros de auditoría se define por política administrativa y no puede ser inferior al mínimo regulatorio aplicable.

---

## 4. Modelo Lógico Conceptual

Esta sección describe las cadenas de dependencia y las reglas de integridad que estructuran el modelo de datos como un sistema coherente.

### 4.1 Cadena de Identidad y Acceso

El **Usuario** es la entidad raíz del sistema. Toda operación relevante se origina o tiene como destino un Usuario. Los **Roles** asignados al Usuario determinan sus capacidades a través de los **Permisos** atómicos agrupados en cada Rol. Esta cadena garantiza que ninguna acción del sistema pueda ejecutarse fuera del modelo de control de acceso.

### 4.2 Cadena de Catálogo de Productos

El **Vendedor** (Usuario con rol vendedor) crea **Publicaciones** que se clasifican en la jerarquía de **Categorías**. Cada Publicación tiene un **Inventario** asociado de forma exclusiva. La cadena completa es:

> **Usuario (Vendedor)** → **Publicacion** → **Categoria** (clasificación)
> **Publicacion** ↔ **Inventario** (1:1, control de stock)

La integridad de esta cadena implica que no puede existir una Publicación sin Categoría asignada, sin Inventario vinculado, ni sin un Vendedor propietario activo.

### 4.3 Cadena del Proceso de Compra

El flujo completo de compra sigue esta cadena de dependencias:

> **Usuario (Comprador)** → **Carrito** → **ItemCarrito** → **Publicacion**
>
> Al confirmar la compra:
>
> **Usuario (Comprador)** → **Orden** → **LineaOrden** → **Publicacion**
> **Orden** ↔ **Pago** (1:1)
> **Inventario** ← decremento atómico vinculado a la creación de la Orden

La transición de Carrito a Orden es una operación atómica que incluye: validar el stock, crear la Orden con sus LineaOrden, decrementar el Inventario y crear el registro de Pago. Si cualquier paso falla, toda la operación se revierte.

### 4.4 Cadena de Interacción con el Agente de IA

> **Sesion** → **Conversacion** → **Mensaje** → **Intencion** (1:1 en mensajes de usuario)
> **Mensaje** → **EntidadExtraida** (1:N)
> **Sesion** → **HistorialBusqueda** (1:N)

La Conversacion y su contexto (Mensajes, Intenciones, EntidadesExtraidas, HistorialBusqueda) tienen como ciclo de vida la Sesión a la que pertenecen. Al expirar la Sesión por inactividad (30 minutos según RN-14), toda esta cadena se marca como expirada.

### 4.5 Cadena de Preferencias y Notificaciones

> **Usuario** ↔ **PreferenciasUsuario** (1:1)
> **Usuario** → **Notificacion** (1:N)

Las **PreferenciasUsuario** actúan como filtro entre los eventos del sistema y las **Notificaciones** que efectivamente se generan y envían al Usuario.

### 4.6 Reglas de Cascada e Integridad Estructural

- **Suspensión de Vendedor**: Cuando un Usuario con rol Vendedor pasa a estado `suspendido`, todas sus Publicaciones en estado `activa` pasan automáticamente a estado `inactiva`. Las Órdenes existentes no se ven afectadas por este cambio (RN-10).

- **Atomicidad de Orden e Inventario**: El registro de una nueva Orden y el decremento correspondiente del Inventario de cada Publicacion incluida son operaciones indivisibles. Si el Inventario no puede decrementarse (por stock insuficiente), la Orden no se crea (RN-04).

- **Preservación de historial de Orden**: Las LineaOrden almacenan copias de los datos relevantes de la Publicacion al momento de la compra. Esto garantiza que cambios posteriores en la Publicacion (precio, nombre, estado) no alteren el registro histórico de la transacción (RN-01).

- **Integridad de la Conversacion**: Al expirar la Sesion, todos los registros de Conversacion, Mensaje, Intencion, EntidadExtraida e HistorialBusqueda asociados quedan inaccesibles para el usuario, aunque pueden retenerse para análisis interno según la política de retención definida (RN-14).

---

## 5. Reglas de Datos

Las siguientes reglas son restricciones de integridad derivadas directamente de las reglas de negocio (RN) y requisitos no funcionales (RNF) del sistema. Estas reglas deben ser respetadas en todas las capas del sistema que interactúan con los datos.

**RD-01** — El precio de una Publicacion debe ser siempre un valor numérico positivo, mayor estrictamente que cero. No se permiten publicaciones con precio igual a cero o negativo (RN-06).

**RD-02** — Toda Publicacion debe tener los siguientes campos obligatorios antes de poder activarse: nombre, descripción, precio, categoría, stock inicial mayor o igual a uno, y al menos una imagen asociada. La ausencia de cualquiera de estos campos impide la activación (RN-05).

**RD-03** — La cantidad de stock en el Inventario nunca puede ser inferior a cero. Cualquier operación que intente decrementar el stock por debajo de cero debe ser rechazada y revertida (RN-04).

**RD-04** — El Carrito solo puede existir y ser operado por un Usuario autenticado con rol de Comprador activo. Un usuario no autenticado o con estado diferente a `activo` no puede acceder ni modificar el Carrito (RN-02).

**RD-05** — Una Orden, una vez creada con estado `pendiente` o superior, es inmutable en su contenido (LineaOrden). Ningún campo de la LineaOrden puede modificarse una vez registrado (RN-01).

**RD-06** — El precio unitario registrado en una LineaOrden corresponde al precio de la Publicacion en el instante de la creación de la Orden. Este valor no cambia aunque el precio de la Publicacion se modifique posteriormente.

**RD-07** — Bajo ninguna circunstancia se almacenará número de tarjeta de crédito/débito, CVV, fecha de vencimiento de tarjeta ni ningún dato bancario completo en ninguna entidad del sistema. Solo se guarda el token o referencia de transacción proporcionado por el procesador de pagos externo (RNF-10).

**RD-08** — Las contraseñas de Usuario nunca se almacenan en texto plano. Siempre se aplica un algoritmo de hash con sal antes del almacenamiento. La contraseña original nunca puede ser recuperada desde el sistema (RNF-07).

**RD-09** — Los tokens de autenticación generados por el sistema tienen una vigencia máxima de 24 horas. Transcurrido ese tiempo, el token expira automáticamente y el usuario debe autenticarse nuevamente (RNF-09).

**RD-10** — Los registros de la entidad Auditoria son inmutables. No existe operación de modificación ni eliminación sobre esta entidad. Solo se permiten operaciones de inserción y consulta (RNF-17).

**RD-11** — La entidad Auditoria nunca almacena contraseñas, tokens completos, números de tarjeta ni datos personales de alta sensibilidad. Solo almacena identificadores, módulos, tipos de acción y resultados (RNF-17).

**RD-12** — Una Conversacion expira automáticamente tras 30 minutos de inactividad medidos desde el último Mensaje registrado. Una conversación expirada no puede recibir nuevos Mensajes (RN-14).

**RD-13** — Cuando un Usuario con rol Vendedor pasa a estado `suspendido`, todas sus Publicaciones en estado `activa` deben pasar automáticamente a estado `inactiva`. Este cambio es obligatorio y no puede omitirse (RN-10).

**RD-14** — La creación de una Orden y el decremento del stock en los Inventarios correspondientes es una operación atómica. Si el stock de cualquier Publicacion incluida en la Orden es insuficiente para cubrir la cantidad solicitada, la Orden completa no se crea y no se decrementa ningún stock (RN-04).

**RD-15** — El sistema solo debe enviar notificaciones del tipo y canal que el Usuario haya configurado en sus PreferenciasUsuario, con excepción de las alertas de seguridad que se envían siempre (RN-12).

**RD-16** — Una Dirección referenciada en una Orden existente no puede eliminarse físicamente. Solo puede marcarse como inactiva para el usuario. Esto preserva la integridad del historial de entregas.

**RD-17** — Una Publicacion en estado `eliminada` no puede transitar a ningún otro estado. El estado `eliminada` es el estado final absoluto para una publicación.

**RD-18** — La Orden en estado `entregada` no puede transitar a estado `cancelada`. Las transiciones de estado de la Orden siguen un flujo unidireccional definido (RN-01).

---

## 6. Consideraciones de Escalabilidad, Rendimiento, Seguridad, Auditoría y Recuperación

### 6.1 Escalabilidad

El modelo de datos está diseñado para soportar hasta 1 millón de publicaciones activas en el catálogo (RNF-12) y hasta 2000 usuarios concurrentes operando simultáneamente (RNF-11). Las entidades con mayor volumen de registros (Publicacion, Orden, LineaOrden, Auditoria, Mensaje) deben diseñarse considerando estrategias de particionamiento por criterios temporales o de estado para mantener el rendimiento a medida que el volumen crece. La jerarquía de Categorías permite agregar nuevos niveles y grupos sin reestructurar el modelo base. Las entidades de sesión (Conversacion, HistorialBusqueda) tienen ciclos de vida cortos, lo que limita su acumulación permanente.

### 6.2 Rendimiento

El modelo debe garantizar que las búsquedas de publicaciones en el catálogo retornen resultados en un tiempo máximo de 3 segundos (RNF-02). Para ello, los atributos utilizados frecuentemente en filtros (estado de publicación, categoría, precio, stock disponible) deben considerarse candidatos a estructuras de acceso rápido. Las operaciones de lectura del Carrito y sus ítems, que ocurren con alta frecuencia durante el proceso de compra, deben estar optimizadas para respuesta inmediata. Las consultas de historial de órdenes y estados de pago por parte de compradores y vendedores también representan patrones de acceso frecuente que el diseño físico deberá considerar.

### 6.3 Seguridad

Los datos de alta sensibilidad están aislados y protegidos por diseño: las contraseñas se almacenan únicamente en formato hash con sal (RNF-07), los datos de pago se reducen a tokens externos sin información bancaria directa (RNF-10), y los tokens de sesión tienen expiración automática máxima de 24 horas (RNF-09). El acceso a la entidad Auditoria está restringido a roles administrativos con permisos específicos, garantizando que los logs no sean accesibles por actores no autorizados. Las entidades que contienen información personal (Usuario, Direccion, PreferenciasUsuario) deben estar sujetas a controles de acceso estrictos que prevengan la exposición no autorizada de datos.

### 6.4 Auditoría

La entidad Auditoria está diseñada para ser la fuente de verdad sobre el historial de operaciones del sistema (RNF-17). Cada evento de autenticación, modificación de datos críticos, transacción económica, cambio de estado de orden y acción administrativa genera un registro de auditoría inmutable. El modelo garantiza que los registros no puedan ser alterados ni eliminados una vez insertados, preservando la integridad del log histórico. La estructura del registro incluye suficiente contexto (usuario, módulo, acción, resultado, marca de tiempo) para reconstruir la secuencia de eventos sin necesidad de acceder a datos sensibles.

### 6.5 Recuperación ante Fallos

El diseño del modelo favorece la recuperación ante fallos mediante la inmutabilidad de registros críticos y la atomicidad de operaciones compuestas. Si una operación de creación de Orden falla a mitad del proceso, el modelo garantiza que no queden registros parciales de Orden sin su Pago correspondiente ni decrementos de stock sin la Orden justificante. Los estados de Orden y Pago permiten identificar transacciones incompletas o en estado inconsistente para su resolución manual o automatizada. La retención de registros históricos (LineaOrden, Auditoria, Pago) permite reconstruir el estado del sistema en cualquier punto del tiempo pasado para fines de reconciliación y diagnóstico.
