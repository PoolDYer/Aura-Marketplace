# Especificación de Diagramas del Sistema — Marketplace Inteligente Asistido por IA

> Este documento especifica qué debe representar cada diagrama del sistema.
> No renderiza diagramas ejecutables. Incluye representaciones textuales esquemáticas
> para ilustrar la estructura esperada de cada diagrama.

---

## 1. Diagrama de Contexto del Sistema

**Propósito:** Mostrar el sistema como una caja negra, sus actores externos y sus límites.

**Qué debe representar:**

- El sistema central: "Marketplace Inteligente" como bloque principal
- Actores humanos externos que interactúan con el sistema:
  - Comprador (entrada: instrucciones texto/voz, búsquedas, compras; salida: resultados, confirmaciones, respuestas del agente)
  - Vendedor (entrada: publicaciones, gestión de órdenes; salida: panel de gestión, notificaciones)
  - Administrador (entrada: acciones de moderación, gestión; salida: reportes, panel de administración)
  - Visitante (entrada: consultas de catálogo; salida: resultados de búsqueda)
- Sistemas externos que se integran:
  - Proveedor de NLP (interpretación de lenguaje natural)
  - Servicio STT — convertidor de voz a texto (transcripción de voz)
  - Servicio TTS — convertidor de texto a voz (síntesis de voz)
  - Pasarela de Pago (procesamiento de transacciones)
  - Servicio de Notificaciones (entrega de avisos)
- Límites del sistema: qué es interno (dominio, aplicación, infraestructura) y qué es externo (integraciones, actores)

**Representación textual esquemática:**

```
[Comprador]      ──texto/voz────► [MARKETPLACE INTELIGENTE] ──consulta NLP──► [Proveedor NLP]
[Vendedor]       ──publicaciones► [MARKETPLACE INTELIGENTE] ──audio──────────► [Servicio STT]
[Administrador]  ───────────────► [MARKETPLACE INTELIGENTE] ──respuesta voz──► [Servicio TTS]
[Visitante]      ──búsqueda─────► [MARKETPLACE INTELIGENTE] ──cobro──────────► [Pasarela Pago]
                                                             ──avisos─────────► [Notificaciones]
```

**Trazabilidad:** /specs/02-Stakeholders.md, /specs/04-Alcance.md, /design/08-Integraciones.md


---

## 2. Diagrama de Casos de Uso

**Propósito:** Representar todas las funciones que el sistema ofrece a cada actor, con sus relaciones.

**Qué debe representar:**

Los 4 actores internos del sistema: Visitante, Comprador, Vendedor, Administrador.
Los 40 casos de uso agrupados por módulo funcional (derivados de /specs/10-CasosUsoResumen.md):

**Módulo: Agente Inteligente (CU-01 a CU-04)**
- CU-01: Ingresar instrucción en texto — Actor: Comprador
- CU-02: Ingresar instrucción por voz — Actor: Comprador
- CU-03: Solicitar aclaración de instrucción ambigua — Actor: Agente (sistema)
- CU-04: Mantener contexto de sesión — Actor: Agente (sistema)

**Módulo: Catálogo y Búsqueda (CU-05 a CU-11)**
- CU-05: Buscar productos — Actor: Comprador, Visitante
- CU-06: Explorar catálogo sin agente — Actor: Comprador, Visitante
- CU-07: Filtrar resultados — Actor: Comprador
- CU-08: Eliminar filtro activo — Actor: Comprador
- CU-09: Ordenar resultados — Actor: Comprador
- CU-10: Comparar productos — Actor: Comprador
- CU-11: Ver detalle de un producto — Actor: Comprador, Visitante

**Módulo: Carrito (CU-12 a CU-16)**
- CU-12 a CU-16: Gestión completa del carrito — Actor: Comprador

**Módulo: Compra (CU-17 a CU-21)**
- CU-17 a CU-21: Flujo de compra completo — Actor: Comprador

**Módulo: Publicaciones del Vendedor (CU-22 a CU-25)**
- CU-22 a CU-25: Alta, edición, pausa y baja de publicaciones — Actor: Vendedor

**Módulo: Gestión de Órdenes del Vendedor (CU-26 a CU-28)**
- CU-26 a CU-28: Consulta y actualización de estado de órdenes — Actor: Vendedor

**Módulo: Administración (CU-29 a CU-33)**
- CU-29 a CU-33: Moderación de contenido y reportes — Actor: Administrador

**Módulo: Autenticación y Perfil (CU-34 a CU-40)**
- CU-34 a CU-40: Registro, inicio de sesión, cierre de sesión y gestión de perfil — Actor: Comprador, Vendedor, Administrador


**Relaciones entre casos de uso:**

- CU-01 «include» CU-03: cuando la intención es ambigua, el agente solicita aclaración
- CU-01 «include» CU-04: toda instrucción siempre mantiene el contexto activo
- CU-02 «include» CU-01: la voz se transcribe y se procesa como texto tras el servicio de transcripción
- CU-05 «extend» CU-07, CU-08, CU-09: la búsqueda puede extenderse con filtros y ordenamiento
- CU-05 «extend» CU-10: la búsqueda puede extenderse con la comparación de productos
- CU-12 «include» CU-34: agregar al carrito requiere autenticación previa
- CU-17 «include» CU-34: iniciar proceso de compra requiere autenticación previa

**Trazabilidad:** /specs/10-CasosUsoResumen.md, /specs/07-RequisitosFuncionales.md

---

## 3. Diagrama de Dominio

**Propósito:** Representar las entidades del dominio, sus agregados, relaciones y cardinalidades.

**Qué debe representar:**

**Agregados y sus raíces:**
- Agregado Usuario (raíz: Usuario) — contiene: Credenciales, TokenAcceso, PreferenciasUsuario
- Agregado Publicación (raíz: Publicacion) — contiene: Inventario, referencias a imágenes, relación con Categoría
- Agregado Carrito (raíz: Carrito) — contiene: ItemCarrito (1..N)
- Agregado Orden (raíz: Orden) — contiene: LineaOrden (1..N), Pago (1:1)
- Agregado Sesión del Agente (raíz: Sesion) — contiene: ContextoSesion, HistorialInstrucciones, Conversacion

**Relaciones entre agregados:**
- Usuario (rol Vendedor) ──1:N──► Publicacion
- Usuario (rol Comprador) ──1:1──► Carrito
- Carrito ──1:N──► ItemCarrito ──N:1──► Publicacion
- Usuario (rol Comprador) ──1:N──► Orden
- Orden ──1:N──► LineaOrden ──N:1──► Publicacion
- Orden ──1:1──► Pago
- Publicacion ──N:1──► Categoria
- Publicacion ──1:1──► Inventario
- Usuario ──1:1──► PreferenciasUsuario
- Usuario ──1:N──► Notificacion
- Usuario ──1:N──► Direccion
- Sesion ──1:1──► Conversacion ──1:N──► Mensaje
- Mensaje ──1:1──► Intencion (solo mensajes de usuario)
- Mensaje ──1:N──► EntidadExtraida

**Invariantes clave a anotar en el diagrama:**
- Publicacion.precio debe ser mayor que cero (RN-06)
- Inventario.stock nunca puede ser negativo (RN-04)
- Una Orden es inmutable una vez creada (RN-01)
- Una Sesion expira a los 30 minutos de inactividad (RN-14)
- Solo Compradores autenticados pueden modificar el Carrito (RN-02)

**Trazabilidad:** /design/02-ModeloDominio.md


---

## 4. Diagrama de Componentes

**Propósito:** Representar los 20 módulos funcionales, sus interfaces conceptuales y sus dependencias.

**Qué debe representar:**

**Capa de Frontera (L-01):** Punto de entrada del sistema
- Componente: Interfaz de Interacción (texto y voz)
- Expone interfaces hacia: Módulo Agente Inteligente, Módulo Autenticación

**Capa del Agente (L-02):**
- Componente: Agente Inteligente
  - Depende de: Módulo Conversaciones, Módulo Búsquedas, Módulo Carrito, Módulo Pedidos
  - Usa adaptadores de: Proveedor NLP, Servicio de transcripción, Servicio de síntesis de voz

**Capa de Aplicación y Módulos Funcionales (L-03):**
- Grupo Identidad: Autenticación ↔ Usuarios ↔ Compradores ↔ Vendedores ↔ Administración
- Grupo Catálogo: Productos ↔ Categorías ↔ Inventario ↔ Búsquedas
- Grupo Transaccional: Carrito ↔ Pedidos ↔ Pagos
- Grupo Social: Reseñas ↔ Favoritos ↔ Promociones ↔ Cupones
- Grupo Conversacional: Conversaciones ↔ Agente Inteligente
- Grupo Soporte: Notificaciones ↔ Auditoría

**Dependencias entre módulos (sin circularidades):**
- Búsquedas depende de: Productos, Categorías, Inventario, Reseñas, Promociones
- Carrito depende de: Compradores, Productos, Inventario
- Pedidos depende de: Carrito, Inventario, Pagos, Notificaciones, Auditoría
- Pagos depende de: adaptador externo Pasarela de Pago
- Notificaciones depende de: Usuarios (preferencias de contacto), adaptador externo de Notificaciones
- Auditoría: recibe eventos de todos los módulos; no depende de ninguno
- Administración depende de: Usuarios, Vendedores, Compradores, Productos, Pedidos

**Verificación de ausencia de dependencias circulares:**
- Auditoría no depende de ningún módulo (solo recibe eventos)
- La dirección de dependencia siempre va de módulos externos hacia módulos de dominio interno
- Ningún módulo de infraestructura es invocado directamente por el dominio

**Trazabilidad:** /design/03-ModulosSistema.md

---

## 5. Diagramas de Secuencia

### 5.1 Búsqueda mediante texto (RF-01, RF-03)

**Actor:** Comprador
**Componentes involucrados:** Interfaz → Agente Inteligente → Proveedor NLP → Módulo Búsquedas → Módulo Conversaciones

**Flujo:**
1. Comprador ingresa instrucción en texto ("Busca pantalones negros")
2. Interfaz envía texto al Agente Inteligente
3. Agente envía texto más contexto de sesión al Proveedor NLP
4. NLP retorna: intención=buscar, entidades=[pantalones, negros], confianza=alta
5. Agente delega al Módulo Búsquedas: buscar con las entidades extraídas
6. Módulo Búsquedas consulta el catálogo y retorna lista de publicaciones coincidentes
7. Agente actualiza ContextoSesion con los resultados activos
8. Agente registra el turno en el Módulo Conversaciones
9. Agente formula respuesta en lenguaje natural
10. Interfaz presenta los resultados al Comprador

**Respuesta:** Lista de productos con nombre, precio, imagen y vendedor. Mensaje: "Encontré N pantalones negros."
**Tiempo máximo:** 2 segundos para interpretación (RNF-01) y 3 segundos para búsqueda (RNF-02)


---

### 5.2 Búsqueda mediante voz (RF-02)

**Actor:** Comprador con modo de voz activo
**Componentes involucrados:** Interfaz → Servicio de Transcripción → Agente Inteligente → Proveedor NLP → Módulo Búsquedas

**Flujo:**
1. Comprador activa modo de voz; Interfaz muestra indicador de escucha activa
2. Comprador pronuncia instrucción; Interfaz captura el audio
3. Interfaz envía el audio al adaptador del Servicio de Transcripción
4. El Servicio de Transcripción retorna texto transcrito más nivel de confianza
5. Agente verifica el nivel de confianza contra el umbral definido (RN-11)
   - Si confianza por debajo del umbral: Agente informa al Comprador y solicita repetir o escribir. Fin.
   - Si confianza igual o superior al umbral: continúa en el paso 6
6. Agente procesa la transcripción exactamente como una instrucción de texto (flujo 5.1, pasos 3 a 9)
7. Agente envía la respuesta formulada al adaptador del Servicio de Síntesis de Voz
8. El Servicio de Síntesis retorna el audio sintetizado
   - Si el servicio no está disponible: la respuesta se entrega solo en texto (RNF-06)
9. Interfaz reproduce el audio de respuesta al Comprador

**Respuesta:** Resultado presentado en texto más audio sintetizado (si el servicio está disponible)

---

### 5.3 Filtrado de productos (RF-04)

**Actor:** Comprador con resultados activos en sesión
**Componentes involucrados:** Interfaz → Agente Inteligente → Proveedor NLP → Módulo Búsquedas → Módulo Conversaciones

**Flujo:**
1. Comprador ingresa instrucción de filtrado ("filtra solo las que tengan envío gratis")
2. Agente envía la instrucción más el contexto activo al Proveedor NLP
3. NLP retorna: intención=filtrar, restricción=[envío_gratis]
4. Agente aplica el filtro sobre el conjunto de resultados activo en ContextoSesion
5. Si el resultado es vacío: Agente informa al Comprador indicando los filtros activos que causaron el vacío
6. Si hay resultados: Agente actualiza ContextoSesion con el conjunto filtrado
7. Agente registra el turno y formula la respuesta

**Precondición:** Existe un conjunto de resultados activo en la sesión del Agente
**Respuesta:** Conjunto filtrado o mensaje de resultado vacío con los filtros activos indicados

---

### 5.4 Recomendación del Agente (Motor de Recomendaciones)

**Actor:** Comprador cuya búsqueda retornó cero resultados o cuyo producto elegido no tiene stock
**Componentes involucrados:** Agente Inteligente → Módulo Búsquedas → Módulo Inventario

**Flujo ante cero resultados:**
1. Módulo Búsquedas retorna cero resultados al Agente
2. Agente activa el Motor de Recomendaciones
3. Agente amplía los criterios de búsqueda de forma incremental, reduciendo las restricciones menos críticas
4. Agente ejecuta una nueva búsqueda con los criterios ampliados
5. Agente presenta los resultados explicando el ajuste realizado (RNF-13)

**Flujo ante producto sin stock:**
1. Módulo Inventario informa que el producto seleccionado no tiene stock suficiente
2. Agente extrae las características del producto: categoría, atributos relevantes y rango de precio
3. Agente busca alternativas con atributos similares en el catálogo
4. Agente presenta las alternativas con una explicación del criterio de selección

**Respuesta:** Lista de alternativas sugeridas acompañada de un mensaje explicativo del ajuste aplicado


---

### 5.5 Agregar producto al carrito (RF-07)

**Actor:** Comprador autenticado
**Componentes involucrados:** Interfaz → Agente Inteligente → Módulo Autenticación → Módulo Inventario → Módulo Carrito → Módulo Auditoría

**Flujo:**
1. Comprador ingresa instrucción ("agrega la primera al carrito")
2. Agente resuelve la referencia "la primera" usando el ContextoSesion (primer producto del conjunto activo)
3. Agente verifica que el Comprador esté autenticado (RN-02)
   - Si no está autenticado: Agente redirige al proceso de autenticación. Fin.
4. Agente consulta el Módulo Inventario sobre la disponibilidad del producto
   - Si el producto no tiene stock: Agente informa la disponibilidad real y ofrece alternativas. Fin.
5. Agente envía la operación de agregar ítem al Módulo Carrito
6. Módulo Carrito actualiza el carrito y retorna el total actualizado
7. Módulo Auditoría registra el evento de modificación de carrito
8. Agente confirma al Comprador: nombre del producto más total actualizado del carrito

**Respuesta:** "Agregué [nombre del producto] a tu carrito. Total del carrito: $X."

---

### 5.6 Confirmación de compra (RF-08 — Flujo de confirmación)

**Actor:** Comprador autenticado con carrito no vacío
**Componentes involucrados:** Interfaz → Agente Inteligente → Módulo Inventario → Módulo Pagos → Gestor de Confirmaciones

**Flujo:**
1. Comprador ingresa instrucción de compra ("compra la más barata")
2. Agente verifica que el Comprador esté autenticado (RN-02)
3. Agente resuelve la referencia "la más barata" a partir del ContextoSesion activo
4. Agente consulta el Módulo Inventario para verificar el stock disponible (RN-03)
   - Si el stock es insuficiente: Agente informa al Comprador. Fin, o continúa con los productos disponibles.
5. Agente compone el ResumenOrden: productos, cantidades, precios unitarios, total y método de pago
6. Agente presenta el ResumenOrden al Comprador y solicita confirmación explícita (RN-01)
7. El sistema entra en estado "Confirmando" — el flujo se detiene a la espera de respuesta del usuario
8. Si el Comprador responde con confirmación ("confirmar" / "sí"): el flujo continúa en la secuencia 5.7
9. Si el Comprador responde con cancelación ("cancelar" / "no"): el carrito se preserva y el Agente informa

**Respuesta en estado Confirmando:** ResumenOrden completo con pregunta explícita de confirmación al Comprador

---

### 5.7 Ejecución del pedido (RF-08 — Flujo de pago y registro)

**Actor:** Comprador (tras confirmar en la secuencia 5.6)
**Componentes involucrados:** Módulo Pagos → Pasarela de Pago → Módulo Pedidos → Módulo Inventario → Módulo Carrito → Módulo Notificaciones → Módulo Auditoría

**Flujo:**
1. Agente recibe la confirmación explícita del Comprador
2. Módulo Pagos envía la solicitud de cobro a la Pasarela de Pago con clave de idempotencia
3. La Pasarela de Pago retorna el resultado del cobro:
   - Si es rechazado: Agente informa el motivo y ofrece otro método de pago. Fin (carrito preservado).
   - Si hay tiempo de espera agotado: Agente informa el error, carrito preservado. Fin.
   - Si es aprobado: continúa en el paso 4
4. Se emite el evento de pago confirmado
5. Módulo Pedidos registra la Orden con número de confirmación único (inicio de operación atómica)
6. Módulo Inventario decrementa el stock de todos los productos comprados (cierre de operación atómica, RN-04)
7. Módulo Carrito vacía el carrito del Comprador
8. Módulo Notificaciones envía aviso al Comprador y al Vendedor de forma asíncrona
9. Módulo Auditoría registra el evento de creación de Orden
10. Agente presenta la confirmación al Comprador con el número de Orden generado

**Tiempo máximo desde confirmación de pago hasta entrega del número de Orden:** 5 segundos (RNF-03)
**Respuesta:** "Tu orden fue confirmada. Número: ORD-XXXXXXXX. Recibirás una notificación del Vendedor."


---

## 6. Diagrama de Estados del Agente Inteligente

**Propósito:** Representar todos los estados posibles del Agente, los eventos que provocan transiciones y el comportamiento en estados de error.

**Estados:**

| Estado | Descripción |
|---|---|
| Inactivo | Estado de espera. No hay instrucción en proceso. |
| Escuchando | Modo de voz activo. El sistema captura audio del Comprador. |
| Procesando | Instrucción recibida. El Agente interpreta la intención y extrae entidades. |
| Ejecutando | Acción identificada. El Agente coordina con los módulos funcionales. |
| Confirmando | Acción irreversible pendiente. El flujo espera confirmación explícita del Comprador. |
| Respondiendo | El Agente formula y presenta la respuesta al Comprador. |
| Error | Fallo en servicio externo o condición de error detectada. |
| Expirado | El ContextoSesion fue limpiado por 30 minutos de inactividad (RN-14). |

**Transiciones:**

```
Inactivo     ──[instrucción texto recibida]──────────► Procesando
Inactivo     ──[modo de voz activado]────────────────► Escuchando
Inactivo     ──[30 min de inactividad]───────────────► Expirado
Escuchando   ──[audio capturado con éxito]───────────► Procesando
Escuchando   ──[servicio de transcripción no disp.]──► Error
Procesando   ──[intención identificada, confianza OK]► Ejecutando
Procesando   ──[intención ambigua]─────────────────── Respondiendo (solicita aclaración)
Procesando   ──[proveedor NLP no disponible]─────────► Error
Ejecutando   ──[acción no irreversible completada]───► Respondiendo
Ejecutando   ──[acción irreversible detectada]───────► Confirmando
Ejecutando   ──[error en módulo funcional]───────────► Error
Confirmando  ──[Comprador confirma]──────────────────► Ejecutando
Confirmando  ──[Comprador cancela]──────────────────► Respondiendo
Respondiendo ──[respuesta presentada al usuario]─────► Inactivo
Error        ──[Agente informa y propone alternativa]► Inactivo
Expirado     ──[nueva instrucción recibida]──────────► Procesando (sin contexto previo)
```

**Comportamiento en el estado Error:**
- El Agente siempre informa al Comprador qué falló y qué puede hacer a continuación (RNF-13)
- El estado Error nunca deja al Agente bloqueado de forma permanente
- El Comprador siempre puede reintentar desde el estado Inactivo

**Trazabilidad:** /design/04-DisenoAgenteIA.md, sección de Máquina de Estados


---

## 7. Diagrama de Despliegue Conceptual

**Propósito:** Representar la distribución conceptual del sistema en zonas de despliegue sin especificar infraestructura concreta.

**Zonas conceptuales:**

**Zona de Usuarios (externos al sistema):**
- Dispositivo del Comprador: accede mediante la interfaz de texto y voz
- Dispositivo del Vendedor: accede mediante el panel de gestión de publicaciones y órdenes
- Dispositivo del Administrador: accede mediante el panel de administración y moderación
- Dispositivo del Visitante: accede de forma anónima al catálogo público

**Zona de Frontera (L-01):**
- Componente de Recepción de Solicitudes: recibe y valida todas las entradas del usuario
- Aplica los primeros controles de seguridad antes de pasar al interior del sistema
- Gestiona las conexiones de comunicación en tiempo real para el estado del Agente

**Zona de Procesamiento (L-02, L-03, L-04):**
- Componente del Agente Inteligente (L-02)
- Módulos Funcionales: Identidad, Catálogo, Transaccional, Conversacional, Soporte (L-03)
- Núcleo de Dominio: entidades, servicios de dominio e invariantes (L-04)
- Esta zona no es directamente accesible desde el exterior del sistema

**Zona de Persistencia e Integración (L-05):**
- Almacén de datos operacional: usuarios, publicaciones, órdenes, carritos
- Almacén de datos conversacional: sesiones, conversaciones, mensajes
- Almacén de auditoría: registros inmutables de eventos del sistema
- Adaptadores de integraciones con servicios externos

**Zona de Servicios Externos (fuera del límite del sistema):**
- Proveedor de interpretación de lenguaje natural
- Servicio de transcripción de voz a texto
- Servicio de síntesis de texto a voz
- Pasarela de Pago
- Servicio de Notificaciones

**Canales de comunicación entre zonas:**
- Usuario ↔ Zona de Frontera: canal cifrado (RNF-08)
- Zona de Frontera ↔ Zona de Procesamiento: comunicación interna protegida
- Zona de Procesamiento ↔ Zona de Persistencia: comunicación interna
- Zona de Persistencia ↔ Servicios Externos: canal cifrado saliente (RNF-08)

**Trazabilidad:** /design/01-ArquitecturaGeneral.md, secciones de Capas y Despliegue


---

## 8. Índice de Trazabilidad de Diagramas

| Diagrama | Documenta | Trazabilidad principal |
|---|---|---|
| Contexto del Sistema | Límites del sistema y actores externos | /specs/02-Stakeholders.md, /specs/04-Alcance.md |
| Casos de Uso | Funciones del sistema agrupadas por actor | /specs/10-CasosUsoResumen.md, /specs/07-RequisitosFuncionales.md |
| Dominio | Entidades, agregados, relaciones e invariantes | /design/02-ModeloDominio.md |
| Componentes | Módulos funcionales y sus dependencias | /design/03-ModulosSistema.md |
| Secuencia 5.1: Búsqueda por texto | Flujo completo RF-01, RF-03 | /specs/07-RequisitosFuncionales.md |
| Secuencia 5.2: Búsqueda por voz | Flujo completo RF-02 | /specs/07-RequisitosFuncionales.md |
| Secuencia 5.3: Filtrado | Flujo completo RF-04 | /specs/07-RequisitosFuncionales.md |
| Secuencia 5.4: Recomendación | Motor de recomendaciones RF-03, RF-07 | /specs/07-RequisitosFuncionales.md |
| Secuencia 5.5: Agregar al carrito | RF-07, RN-02, RN-03 | /specs/06-ReglasNegocio.md |
| Secuencia 5.6: Confirmación de compra | RF-08, RN-01 | /specs/06-ReglasNegocio.md |
| Secuencia 5.7: Ejecución del pedido | RF-08, RN-03, RN-04 | /specs/06-ReglasNegocio.md |
| Estados del Agente Inteligente | Máquina de estados del Agente | /design/04-DisenoAgenteIA.md |
| Despliegue Conceptual | Zonas de arquitectura y comunicación | /design/01-ArquitecturaGeneral.md |
