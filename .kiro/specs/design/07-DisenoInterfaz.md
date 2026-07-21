# Diseño de Interfaz — Aura Marketplace

## 1. Objetivo

Definir la especificación visual y de interacción de todas las pantallas del sistema Aura Marketplace, documentando los prototipos generados en Google Stitch como fuente de verdad del diseño de interfaz. Este documento establece la estructura de navegación, el inventario de pantallas por módulo funcional, el sistema de diseño adoptado y las reglas de composición visual que garantizan consistencia, accesibilidad y alineación con la identidad de marca.

---

## 2. Fuente de Diseño

| Atributo | Valor |
|---|---|
| Herramienta de prototipado | Google Stitch (Text-to-UI Pro) |
| Proyecto | Automated System Prototyper |
| ID del Proyecto | `14760269208940461002` |
| Dispositivo objetivo | Desktop (1280px viewport) |
| Modo de color | Light (Catálogo) / Dark (Modo Voz) |
| Fecha de última actualización | 2026-07-21 |

---

## 3. Sistema de Diseño

### 3.1 Identidad Visual

**Nombre del sistema de diseño:** Vibrant Voice Ecommerce

**Narrativa de marca:** El sistema se construye sobre la narrativa de *"un asistente calmado que escucha, no una máquina que procesa."* Se aleja de la estética fría de IA hacia una experiencia de comercio electrónico cálida y centrada en el humano. La personalidad de marca es acogedora, sofisticada e intuitiva.

**Estilo visual:** Modern Tactile Minimalism con acentos Glassmorphic. Utiliza tipografía de alta calidad y generoso espacio en blanco para crear una sensación premium. El elemento firma, la "Onda Viva" (Live Wave), proporciona un movimiento fluido y orgánico que conecta la interfaz digital con la conversación humana.

### 3.2 Paleta de Colores

El sistema opera en dos estados visuales distintos para proporcionar cambio de contexto claro:

| Estado | Color de fondo | Propósito |
|---|---|---|
| Modo Catálogo (Default) | `#FAF6F8` | Legibilidad alta, experiencia de compra clásica |
| Modo Voz Activa | `#211527` | Enfoque en la interacción auditiva y feedback del asistente |

**Colores primarios del sistema:**

| Token | Valor | Uso |
|---|---|---|
| `primary` | `#845400` | Elementos de marca principales |
| `primary-container` | `#FFB347` (Amber) | Acciones del usuario, botones primarios, estado "escuchando" |
| `secondary` | `#006B5B` | Confirmaciones de sistema |
| `secondary-container` | `#96F0DB` (Mint) | Procesamiento exitoso, disponibilidad de inventario |
| `tertiary` | `#6C5774` | Acentos complementarios |
| `tertiary-container` | `#D4B9DB` | Contenedores secundarios |
| `error` | `#BA1A1A` | Errores del sistema |
| `error-warm` | `#E8927C` | Alertas suaves (coral cálido para evitar rojo agresivo) |
| `surface` | `#FCF8FA` | Superficie principal |
| `on-surface` | `#1C1B1D` | Texto sobre superficie |
| `outline` | `#847463` | Bordes y separadores |

### 3.3 Tipografía

Estrategia de tres fuentes para equilibrar carácter, legibilidad y precisión técnica:

| Fuente | Rol | Uso |
|---|---|---|
| **Bricolage Grotesque** | Display / Headlines | Encabezados, mensajes del asistente, momentos de alto impacto |
| **General Sans** | Body | Texto de UI estándar, descripciones de productos, formularios |
| **IBM Plex Mono** | Utility / Monospace | Transcripciones de voz en vivo, SKUs en panel admin, metadatos técnicos |

**Escala tipográfica:**

| Token | Familia | Tamaño | Peso | Interlineado |
|---|---|---|---|---|
| `display-xl` | Bricolage Grotesque | 56px | 700 | 64px |
| `display-lg` | Bricolage Grotesque | 40px | 700 | 48px |
| `headline-md` | Bricolage Grotesque | 28px | 600 | 36px |
| `headline-sm` | Bricolage Grotesque | 20px | 600 | 28px |
| `body-lg` | General Sans | 16px | 400 | 24px |
| `body-md` | General Sans | 14px | 400 | 20px |
| `body-sm` | General Sans | 12px | 400 | 16px |
| `util-mono` | IBM Plex Mono | 14px | 400 | 20px |
| `util-mono-sm` | IBM Plex Mono | 12px | 500 | 16px |

### 3.4 Espaciado y Layout

**Ritmo de espaciado:** Base de 8px.

| Token | Valor | Uso |
|---|---|---|
| `xs` | 4px | Micro-separaciones internas |
| `sm` | 8px | Separaciones entre elementos relacionados |
| `md` | 12px | Dentro de cards y product tiles |
| `base` | 16px | Padding estándar de contenedores |
| `lg` | 24px | Separación entre secciones internas |
| `xl` | 32px | Separación entre componentes principales |
| `xxl` | 48px | Separación entre secciones de página |
| `huge` | 64px | Separación entre secciones mayores del home |

**Grid:**

| Dispositivo | Columnas | Márgenes | Gutters |
|---|---|---|---|
| Mobile | 4 columnas | 16px | 12px |
| Desktop | 12 columnas | 32px | 24px |

### 3.5 Elevación y Profundidad

| Modo | Técnica | Descripción |
|---|---|---|
| Catálogo | Sombras sutiles light-grey | Cards blancos elevados sobre fondo `#FAF6F8` |
| Voz | Surface-on-Surface tiers | Fondo oscuro con cards en `#2E1C36` con inner glows sutiles |
| Glassmorphism | Backdrop blur (20px) | Drawer del Voice Panel con conexión visual al catálogo |

### 3.6 Formas y Bordes

| Variante | Radio | Uso |
|---|---|---|
| Standard (md) | 16px | Product cards, modals, contenedores primarios |
| Small (sm) | 8px | Tags, stock badges, input fields |
| Pill (full) | 999px | Voice Button, search bars, "Add to Cart" |

---

## 4. Inventario de Pantallas por Módulo

### 4.1 Módulo: Presentación Pública (Vitrina)

Pantallas destinadas a la navegación del Catálogo por cualquier usuario (Visitante, Comprador, Vendedor).

#### SCR-HOME — Home (Página Principal)

| Atributo | Valor |
|---|---|
| **Pantalla Stitch** | `Home - Aura Commerce` |
| **ID** | `44bfa64c78624067a57fad9b50602ac2` |
| **Dimensiones** | 1280 × 1915px |
| **Actor** | Visitante, Comprador |
| **Flujo relacionado** | Entrada al sistema, navegación al catálogo |

**Elementos principales:**
- Header con navegación global y barra de búsqueda (pill shape)
- Hero section con imagen promocional y CTA principal
- Sección de productos destacados con cards de producto (16px radius)
- Categorías principales con navegación visual
- Botón de Voz (Onda Viva) en posición fija inferior-derecha
- Footer con enlaces institucionales

**Reglas de composición:**
- Separación `huge` (64px) entre secciones mayores.
- Cards de producto con fondo blanco (`surface-container-lowest: #FFFFFF`) sobre fondo claro.
- Tipografía `display-lg` para título hero, `headline-md` para títulos de sección.

---

#### SCR-CATALOG — Catálogo de Productos

| Atributo | Valor |
|---|---|
| **Pantalla Stitch** | `Catálogo de Productos` |
| **ID** | `47e19301482b48a8838c9ab1e3c5333d` |
| **Dimensiones** | 1280 × 796px |
| **Actor** | Visitante, Comprador |
| **Flujo relacionado** | Exploración de productos, filtrado, búsqueda |

**Elementos principales:**
- Grid de productos con filtros laterales
- Barra de búsqueda con autocompletado
- Opciones de ordenamiento (precio, relevancia, recientes)
- Paginación o scroll infinito
- Indicadores de stock (Mint: disponible, Amber: bajo stock, Muted: agotado)

**Reglas de composición:**
- Layout de grid adaptable: 3-4 columnas en desktop, 1-2 en mobile.
- Badges de stock con radio `sm` (8px), tipografía `body-sm`.

---

#### SCR-PRODUCT — Detalle de Producto

| Atributo | Valor |
|---|---|
| **Pantalla Stitch** | `Detalle de Producto - Aura Pack Urban` |
| **ID** | `b0406e894d274f21a2fd02d02b5eaf72` |
| **Dimensiones** | 1280 × 1422px |
| **Actor** | Visitante, Comprador |
| **Flujo relacionado** | Visualización de detalle, agregar al carrito, agregar a favoritos |

**Elementos principales:**
- Galería de imágenes del producto con zoom
- Información de precio y disponibilidad
- Selector de cantidad
- Botón "Agregar al carrito" (pill shape, Amber)
- Botón "Agregar a favoritos" (ícono corazón)
- Descripción del producto con tipografía `body-lg`
- Productos relacionados

**Reglas de composición:**
- Layout de dos columnas: Galería (izquierda) | Información (derecha).
- Efecto glow Amber sutil en card cuando el Agente menciona el producto.

---

### 4.2 Módulo: Autenticación y Registro

Pantallas del flujo de ingreso y creación de cuenta.

#### SCR-LOGIN — Iniciar Sesión

| Atributo | Valor |
|---|---|
| **Pantalla Stitch** | `Iniciar Sesión - Detalle en Celular` |
| **ID** | `0f8b90c1c496486c8f2e8cd15233fe9f` |
| **Dimensiones** | 1280 × 894px (redimensionada) |
| **Actor** | Visitante |
| **Flujo relacionado** | HU-01: Registro e inicio de sesión |

**Elementos principales:**
- Formulario de email y contraseña
- Enlace "¿Olvidaste tu contraseña?"
- Botón "Iniciar Sesión" (pill shape, primario)
- Enlace a registro de nueva cuenta
- Opción de autenticación social (Google, etc.)

**Validaciones aplicables:** RN-09 (política de contraseña).

---

#### SCR-REGISTER — Crear Cuenta

| Atributo | Valor |
|---|---|
| **Pantalla Stitch** | `Crear Cuenta - Registro Lateral Alineado` |
| **ID** | `2c5a89b8560d435a8a4683f715dbd161` |
| **Dimensiones** | 1280 × 1024px (redimensionada) |
| **Actor** | Visitante |
| **Flujo relacionado** | HU-01: Registro e inicio de sesión |

**Elementos principales:**
- Formulario con campos: nombre, correo, contraseña, confirmar contraseña
- Selector de tipo de cuenta (Comprador / Vendedor)
- Aceptación de términos y condiciones
- Botón "Crear Cuenta" (pill shape, Amber)
- Enlace a inicio de sesión existente

**Validaciones aplicables:** RN-09 (contraseña: mínimo 8 caracteres, mayúscula, minúscula, dígito). Email único en el sistema.

---

### 4.3 Módulo: Carrito y Checkout

Pantallas del flujo de compra, desde el carrito hasta la confirmación del pedido.

#### SCR-CART — Carrito de Compras

| Atributo | Valor |
|---|---|
| **Pantalla Stitch** | `Tu Carrito de Compras` |
| **ID** | `9b1cb1471bee4b00a45edab6a0326078` |
| **Dimensiones** | 1280 × 1024px |
| **Actor** | Comprador |
| **Flujo relacionado** | HU-04: Gestión del carrito |

**Elementos principales:**
- Lista de productos con imagen miniatura, nombre, precio unitario, cantidad editable
- Botón de eliminar producto del carrito
- Subtotal por línea y total general
- Botón "Proceder al pago" (pill shape, Amber)
- Enlace "Continuar comprando"

**Reglas de negocio:** RN-06 (cálculo de totales), RN-03 (verificación de stock antes de checkout).

---

#### SCR-CHECKOUT-SHIPPING — Checkout - Envío

| Atributo | Valor |
|---|---|
| **Pantalla Stitch** | `Checkout - Envío Ajustado y Alineado` |
| **ID** | `c80ef4af55ae43a9b4b1b5bc2f580f31` |
| **Dimensiones** | 1280 × 1155px |
| **Actor** | Comprador |
| **Flujo relacionado** | HU-05: Proceso de compra |

**Elementos principales:**
- Formulario de dirección de envío
- Selector de método de envío con costos
- Resumen del pedido (columna derecha)
- Stepper de progreso: Envío > Pago > Confirmación
- Botón "Continuar al pago"

**Layout:** Dos columnas (Content | Summary) según especificación del grid desktop.

---

#### SCR-CHECKOUT-PAYMENT — Checkout - Pago

| Atributo | Valor |
|---|---|
| **Pantalla Stitch** | `Checkout - Paso de Pago - Aura` |
| **ID** | `7867424725644ece9c71f0771953118b` |
| **Dimensiones** | 1280 × 1157px |
| **Actor** | Comprador |
| **Flujo relacionado** | HU-05: Proceso de compra, HU-06: Integración de pagos |

**Elementos principales:**
- Selector de método de pago (tarjeta, Yape, transferencia)
- Formulario de datos de tarjeta (delegado a pasarela externa)
- Resumen del pedido con totales finales
- Botón "Confirmar y Pagar" (Amber, estado prominente)
- Iconos de seguridad y métodos de pago aceptados

**Reglas de seguridad:** RNF-10 (sistema nunca almacena datos completos de tarjeta). Integración vía tokenización con pasarela externa.

---

#### SCR-ORDER-CONFIRM — Confirmación de Pedido

| Atributo | Valor |
|---|---|
| **Pantalla Stitch** | `Confirmación de Pedido - Aura` |
| **ID** | `3718e67eed5f493f943c8d78d81a20f8` |
| **Dimensiones** | 1280 × 1024px |
| **Actor** | Comprador |
| **Flujo relacionado** | HU-05: Proceso de compra (estado final) |

**Elementos principales:**
- Ícono de confirmación con animación de éxito (Mint)
- Número de orden generado
- Resumen de productos adquiridos
- Dirección de envío confirmada
- Estimación de fecha de entrega
- Botón "Ver mis pedidos"
- Botón "Seguir comprando"

---

### 4.4 Módulo: Perfil de Usuario y Cuenta

Pantallas de gestión de perfil, favoritos e historial del Comprador.

#### SCR-PROFILE-VIEW — Mi Perfil (Visualización)

| Atributo | Valor |
|---|---|
| **Pantalla Stitch** | `Mi Perfil - Estado Guardado Profesional` |
| **ID** | `1bf22e4555ed4c21b0fc34fff8ad413c` |
| **Dimensiones** | 1280 × 1000px |
| **Actor** | Comprador, Vendedor |
| **Flujo relacionado** | HU-02: Gestión de perfil |

**Elementos principales:**
- Datos personales (nombre, email, teléfono)
- Dirección registrada
- Método de pago referenciado (sin datos sensibles visibles)
- Preferencias de notificación
- Indicador de "Cambios guardados" (feedback visual Mint)

---

#### SCR-PROFILE-EDIT — Mi Perfil (Edición)

| Atributo | Valor |
|---|---|
| **Pantalla Stitch** | `Mi Perfil - Variante Estructural Refinada` |
| **ID** | `287988a11d8143f59b8c773a3970bc08` |
| **Dimensiones** | 1280 × 928px |
| **Actor** | Comprador, Vendedor |
| **Flujo relacionado** | HU-02: Gestión de perfil |

**Elementos principales:**
- Formulario editable de datos personales
- Actualización de dirección
- Gestión de método de pago
- Botón "Guardar cambios" (Amber)
- Botón "Cancelar" (secundario)

---

#### SCR-FAVORITES — Mis Favoritos

| Atributo | Valor |
|---|---|
| **Pantalla Stitch** | `Mis Favoritos - Aura` |
| **ID** | `04121d5853704173abd87068afc10ee4` |
| **Dimensiones** | 1280 × 1534px |
| **Actor** | Comprador |
| **Flujo relacionado** | HU-03: Lista de favoritos |

**Elementos principales:**
- Grid de productos favoritos con cards de producto
- Botón de eliminar de favoritos (ícono corazón filled)
- Botón "Agregar al carrito" en cada card
- Estado vacío con ilustración y CTA hacia catálogo
- Ordenamiento por fecha de adición

---

#### SCR-ORDER-HISTORY — Historial de Pedidos

| Atributo | Valor |
|---|---|
| **Pantalla Stitch** | `Historial de Pedidos - Aura` |
| **ID** | `244666ab76674c8a862765ba8e1e2e2b` |
| **Dimensiones** | 1280 × 1174px |
| **Actor** | Comprador |
| **Flujo relacionado** | HU-07: Seguimiento de pedidos |

**Elementos principales:**
- Lista cronológica de pedidos con estado visual
- Filtro por estado (Pendiente, En camino, Entregado, Cancelado)
- Información resumida: número de orden, fecha, total, cantidad de artículos
- Enlace "Ver detalle" por cada pedido
- Badges de estado con colores semánticos

---

### 4.5 Módulo: Seguimiento de Pedidos

Pantallas de tracking y estado detallado del pedido.

#### SCR-TRACKING-TIMELINE — Seguimiento de Pedido (Timeline)

| Atributo | Valor |
|---|---|
| **Pantalla Stitch** | `Seguimiento de Pedido - Layout Horizontal y Reorganizado` |
| **ID** | `dbf8eb39b3264c0e9e471a6b3363914c` |
| **Dimensiones** | 1280 × 1069px |
| **Actor** | Comprador |
| **Flujo relacionado** | HU-07: Seguimiento de pedidos |

**Elementos principales:**
- Timeline horizontal con estados del pedido (stepper visual)
- Estado actual resaltado con color Amber
- Información de transportista y número de guía
- Estimación de fecha de entrega
- Mapa de seguimiento (si aplica)

---

#### SCR-TRACKING-STATUS — Seguimiento de Pedido (Estados Detallados)

| Atributo | Valor |
|---|---|
| **Pantalla Stitch** | `Seguimiento de Pedido - Estados Detallados` |
| **ID** | `78c846f5b9964c14838cbace34386775` |
| **Dimensiones** | 1280 × 1298px |
| **Actor** | Comprador |
| **Flujo relacionado** | HU-07: Seguimiento de pedidos |

**Elementos principales:**
- Lista detallada de cada cambio de estado con timestamp
- Iconografía por tipo de evento (procesado, empacado, enviado, en tránsito, entregado)
- Información del pedido con desglose de productos

---

#### SCR-TRACKING-PAYMENT — Seguimiento de Pedido (Detalles de Pago)

| Atributo | Valor |
|---|---|
| **Pantalla Stitch** | `Seguimiento de Pedido - Detalles de Pago y Orden` |
| **ID** | `7d7841b3721448979b0f0f29a1b08a37` |
| **Dimensiones** | 1280 × 1366px |
| **Actor** | Comprador |
| **Flujo relacionado** | HU-07: Seguimiento de pedidos |

**Elementos principales:**
- Desglose de pago: subtotal, envío, impuestos, total
- Método de pago utilizado (enmascarado)
- Estado de pago (confirmado, pendiente, reembolsado)
- Detalle de la orden con productos, cantidades y precios

---

### 4.6 Módulo: Panel del Vendedor

Pantallas de gestión exclusivas para el rol Vendedor.

#### SCR-SELLER-CATALOG — Gestión de Catálogo

| Atributo | Valor |
|---|---|
| **Pantalla Stitch** | `Gestión de Catálogo - Sin Menú Lateral` |
| **ID** | `c13ddf32acba479bab981d460586323d` |
| **Dimensiones** | 1280 × 1024px |
| **Actor** | Vendedor |
| **Flujo relacionado** | HU-08: Publicación de productos |

**Elementos principales:**
- Tabla de productos publicados con columnas: imagen, nombre, precio, stock, estado
- Filtros y buscador de productos
- Botón "Agregar Producto" (Amber)
- Acciones por fila: editar, pausar, eliminar
- Indicadores de stock con colores semánticos

---

#### SCR-SELLER-ADD-PRODUCT — Agregar Producto

| Atributo | Valor |
|---|---|
| **Pantalla Stitch** | `Agregar Producto - Vista de Detalle Realista` |
| **ID** | `55f604b092d34e8eb3e52b16622b1408` |
| **Dimensiones** | 1280 × 1024px |
| **Actor** | Vendedor |
| **Flujo relacionado** | HU-08: Publicación de productos |

**Elementos principales:**
- Formulario completo: nombre, descripción, categoría, precio, stock
- Zona de carga de imágenes con drag & drop
- Preview de cómo se verá el producto en el catálogo
- Campos de variantes (talla, color, etc.)
- Botón "Publicar producto" (Amber)
- Botón "Guardar borrador" (secundario)

**Validaciones aplicables:** RN-01 (datos obligatorios de publicación), RN-02 (formato de imágenes), RN-03 (stock inicial ≥ 1).

---

#### SCR-SELLER-ORDERS — Gestión de Pedidos (Vendedor)

| Atributo | Valor |
|---|---|
| **Pantalla Stitch** | `Gestión de Pedidos - Consistencia Tipográfica Final` |
| **ID** | `264877e70ce4448cbaea5f5349c62090` |
| **Dimensiones** | 1280 × 752px (redimensionada) |
| **Actor** | Vendedor |
| **Flujo relacionado** | HU-09: Gestión de ventas |

**Elementos principales:**
- Tabla de pedidos recibidos con estados
- Filtros por estado, fecha, cliente
- Acciones: confirmar envío, marcar como despachado
- Detalle de cada pedido expandible
- Tipografía `util-mono` para códigos de orden

---

#### SCR-SELLER-CLIENTS — Gestión de Clientes (Vendedor)

| Atributo | Valor |
|---|---|
| **Pantalla Stitch** | `Gestión de Clientes - Panel Admin` |
| **ID** | `f082696c79e742829ebc276282412975` |
| **Dimensiones** | 1280 × 1090px |
| **Actor** | Vendedor |
| **Flujo relacionado** | HU-09: Gestión de ventas |

**Elementos principales:**
- Lista de clientes que han comprado al vendedor
- Información resumida: nombre, número de compras, monto total
- Filtros y búsqueda
- Acciones de contacto y seguimiento

---

### 4.7 Módulo: Panel de Administración

Pantallas de gestión exclusivas para el rol Administrador.

#### SCR-ADMIN-DASHBOARD — Panel de Administración

| Atributo | Valor |
|---|---|
| **Pantalla Stitch** | `Panel de Administración - Aura` |
| **ID** | `b738b9667cbf4a568527acfad6af5430` |
| **Dimensiones** | 1280 × 1024px |
| **Actor** | Administrador |
| **Flujo relacionado** | HU-11: Administración del sistema |

**Elementos principales:**
- Dashboard con métricas clave: ventas totales, usuarios activos, pedidos en proceso
- Gráficos de tendencia (ventas, tráfico, conversión)
- Accesos rápidos a gestión de usuarios, productos, pedidos
- Alertas y notificaciones del sistema
- Navegación lateral con secciones del panel

---

#### SCR-ADMIN-ORDERS — Gestión de Pedidos (Admin)

| Atributo | Valor |
|---|---|
| **Pantalla Stitch** | `Gestión de Pedidos - Panel Admin Unificado Full Ancho` |
| **ID** | `36adf0cf93c744068793ed39af913d67` |
| **Dimensiones** | 1280 × 1049px |
| **Actor** | Administrador |
| **Flujo relacionado** | HU-11: Administración del sistema |

**Elementos principales:**
- Tabla completa de pedidos del sistema con todos los estados
- Filtros avanzados: vendedor, comprador, estado, rango de fechas, monto
- Acciones administrativas: escalamiento, resolución de disputas
- Exportación de reportes
- Vista de detalle expandible por pedido

---

#### SCR-ADMIN-PRODUCTS — Gestión de Productos (Admin)

| Atributo | Valor |
|---|---|
| **Pantalla Stitch** | `Gestión de Productos - Panel Admin Unificado Full Ancho` |
| **ID** | `1c585ed5874b44e7804f2387bf39e2d5` |
| **Dimensiones** | 1280 × 1110px |
| **Actor** | Administrador |
| **Flujo relacionado** | HU-11: Administración del sistema |

**Elementos principales:**
- Tabla de todos los productos del marketplace
- Filtros por vendedor, categoría, estado de publicación, stock
- Acciones: aprobar, rechazar, suspender publicación
- Métricas por producto: ventas, visualizaciones
- Búsqueda avanzada

---

#### SCR-ADMIN-SELLERS — Gestión de Vendedores (Admin)

| Atributo | Valor |
|---|---|
| **Pantalla Stitch** | `Gestión de Vendedores - Panel Admin Unificado Full Ancho` |
| **ID** | `b24130032a734c869c4794584c649e63` |
| **Dimensiones** | 1280 × 1088px |
| **Actor** | Administrador |
| **Flujo relacionado** | HU-11: Administración del sistema |

**Elementos principales:**
- Lista de vendedores registrados con estado de cuenta
- Métricas por vendedor: productos publicados, ventas, calificación
- Acciones: activar, suspender, verificar identidad
- Filtros por estado, fecha de registro, volumen de ventas

---

#### SCR-ADMIN-CLIENTS — Gestión de Clientes (Admin)

| Atributo | Valor |
|---|---|
| **Pantalla Stitch** | `Gestión de Clientes - Panel Admin Unificado Full Ancho` |
| **ID** | `4a06017c23c8424e9f19f06e70736fbf` |
| **Dimensiones** | 1280 × 1229px |
| **Actor** | Administrador |
| **Flujo relacionado** | HU-11: Administración del sistema |

**Elementos principales:**
- Lista completa de usuarios compradores
- Información: nombre, email, fecha de registro, estado, compras totales
- Acciones: activar, suspender, ver historial de actividad
- Filtros por estado, actividad reciente

---

#### SCR-ADMIN-CATEGORIES — Gestión de Categorías (Admin)

| Atributo | Valor |
|---|---|
| **Pantalla Stitch** | `Gestión de Categorías - Admin Aura` |
| **ID** | `5fde17f477e54b71ac83bb07b3149a59` |
| **Dimensiones** | 1280 × 984px |
| **Actor** | Administrador |
| **Flujo relacionado** | HU-11: Administración del sistema |

**Elementos principales:**
- Árbol jerárquico de categorías del marketplace
- Acciones: crear, editar, reordenar, eliminar categoría
- Drag & drop para reorganización
- Contador de productos por categoría
- Preview de categoría en catálogo público

---

#### SCR-ADMIN-VENDOR-MGMT — Gestión de Vendedores (Vista Detallada)

| Atributo | Valor |
|---|---|
| **Pantalla Stitch** | `Gestión de Vendedores - Admin Aura` |
| **ID** | `400e954597a04adba09ec63ecf4a0c08` |
| **Dimensiones** | 1280 × 1024px |
| **Actor** | Administrador |
| **Flujo relacionado** | HU-11: Administración del sistema |

**Elementos principales:**
- Vista detallada de administración de vendedores
- Panel de verificación de identidad del vendedor
- Historial de acciones administrativas
- Notas internas del administrador

---

### 4.8 Módulo: Analítica y Voz

Pantallas del panel de analítica del Agente Inteligente por voz.

#### SCR-VOICE-ANALYTICS — Analítica de Voz

| Atributo | Valor |
|---|---|
| **Pantalla Stitch** | `Analítica de Voz - Layout Unificado` |
| **ID** | `3be6028206684271a1dda2d7b20215be` |
| **Dimensiones** | 1280 × 1024px |
| **Actor** | Administrador |
| **Flujo relacionado** | HU-10: Agente Inteligente por voz |

**Elementos principales:**
- Dashboard de métricas del agente de voz
- Indicadores: sesiones de voz, tasa de éxito, productos encontrados por voz
- Gráficos de uso temporal (por hora, por día)
- Análisis de intenciones más frecuentes
- Detalle de sesiones recientes con transcripciones (`util-mono`)

---

## 5. Mapa de Navegación

```
┌─────────────────────────────────────────────────────────┐
│                     VISITANTE                            │
│                                                         │
│  SCR-HOME ──→ SCR-CATALOG ──→ SCR-PRODUCT              │
│      │                             │                     │
│      └──→ SCR-LOGIN ──→ SCR-REGISTER                    │
└─────────────────────────────────────────────────────────┘
                         │
                    [Autenticación]
                         │
┌─────────────────────────────────────────────────────────┐
│                     COMPRADOR                            │
│                                                         │
│  SCR-HOME ──→ SCR-CATALOG ──→ SCR-PRODUCT              │
│                                    │                     │
│                               SCR-CART                   │
│                                    │                     │
│                         SCR-CHECKOUT-SHIPPING            │
│                                    │                     │
│                         SCR-CHECKOUT-PAYMENT             │
│                                    │                     │
│                         SCR-ORDER-CONFIRM                │
│                                                         │
│  SCR-PROFILE-VIEW ←→ SCR-PROFILE-EDIT                  │
│  SCR-FAVORITES                                          │
│  SCR-ORDER-HISTORY ──→ SCR-TRACKING-TIMELINE            │
│                    ──→ SCR-TRACKING-STATUS               │
│                    ──→ SCR-TRACKING-PAYMENT              │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                     VENDEDOR                             │
│                                                         │
│  SCR-SELLER-CATALOG ──→ SCR-SELLER-ADD-PRODUCT          │
│  SCR-SELLER-ORDERS                                      │
│  SCR-SELLER-CLIENTS                                     │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                    ADMINISTRADOR                         │
│                                                         │
│  SCR-ADMIN-DASHBOARD                                    │
│      ├──→ SCR-ADMIN-ORDERS                              │
│      ├──→ SCR-ADMIN-PRODUCTS                            │
│      ├──→ SCR-ADMIN-SELLERS / SCR-ADMIN-VENDOR-MGMT     │
│      ├──→ SCR-ADMIN-CLIENTS                             │
│      ├──→ SCR-ADMIN-CATEGORIES                          │
│      └──→ SCR-VOICE-ANALYTICS                           │
└─────────────────────────────────────────────────────────┘
```

---

## 6. Componentes Reutilizables

### 6.1 Componentes Globales

| Componente | Descripción | Presente en |
|---|---|---|
| **Header Navigation** | Barra superior con logo, búsqueda (pill), navegación, carrito, perfil | Todas las pantallas públicas y del comprador |
| **Voice Button (Onda Viva)** | Botón flotante con doble anillo y gradiente Amber-Mint reactivo a audio | Todas las pantallas del comprador |
| **Footer** | Enlaces institucionales, contacto, redes sociales | Pantallas públicas |
| **Product Card** | Card con imagen, nombre, precio, badge de stock (16px radius, fondo blanco) | SCR-HOME, SCR-CATALOG, SCR-FAVORITES |
| **Breadcrumb** | Navegación jerárquica con separadores | Pantallas internas del comprador |
| **Toast Notification** | Notificación temporal de confirmación o error | Global |

### 6.2 Componentes del Panel Admin / Vendedor

| Componente | Descripción | Presente en |
|---|---|---|
| **Sidebar Navigation** | Menú lateral con secciones del panel | Panel Admin y Vendedor |
| **Data Table** | Tabla con filtros, búsqueda, paginación, acciones por fila | Todas las pantallas de gestión |
| **Stat Card** | Card con métrica numérica, ícono y tendencia | SCR-ADMIN-DASHBOARD, SCR-VOICE-ANALYTICS |
| **Status Badge** | Indicador visual de estado con color semántico | Tablas de pedidos, productos, usuarios |
| **Action Menu** | Menú contextual de acciones por fila de tabla | Pantallas de gestión |

### 6.3 Componentes del Checkout

| Componente | Descripción | Presente en |
|---|---|---|
| **Stepper** | Indicador de progreso del checkout (Envío > Pago > Confirmación) | SCR-CHECKOUT-SHIPPING, SCR-CHECKOUT-PAYMENT |
| **Order Summary** | Resumen lateral del pedido con productos, subtotales y total | SCR-CART, SCR-CHECKOUT-*, SCR-ORDER-CONFIRM |
| **Payment Method Selector** | Selector con íconos de métodos de pago disponibles | SCR-CHECKOUT-PAYMENT |

---

## 7. Estados de Interacción

### 7.1 Botones

| Estado | Estilo |
|---|---|
| Default | Fondo Amber (`#FFB347`), texto blanco, pill shape |
| Hover | Ligero oscurecimiento del fondo, sombra Amber sutil |
| Active/Pressed | Fondo más oscuro, escala reducida (0.98) |
| Disabled | Fondo `outline-variant` (`#D6C3B0`), texto `outline`, sin cursor pointer |
| Loading | Spinner animado reemplaza texto, mismo tamaño de botón |

### 7.2 Inputs

| Estado | Estilo |
|---|---|
| Default | Borde `outline-variant`, fondo blanco, radio `sm` (8px) |
| Focus | Borde `primary` (`#845400`), sombra Amber sutil |
| Error | Borde `error` (`#BA1A1A`), mensaje de error en `body-sm` debajo del campo |
| Disabled | Fondo `surface-container`, borde `outline-variant`, texto `outline` |

### 7.3 Voice Button (Onda Viva)

| Estado | Estilo |
|---|---|
| Idle | Anillo externo estático, color Amber sólido |
| Listening | Anillo externo con animación pulsante, gradiente Amber-Mint |
| Processing | Anillo con animación de rotación, color Mint dominante |
| Response | Anillo expandido con glow Mint, texto del asistente en `headline-sm` |
| Error | Anillo con pulso `error-warm` (`#E8927C`), mensaje de reintento |

---

## 8. Accesibilidad

| Requisito | Implementación |
|---|---|
| Contraste WCAG AA | Ratio mínimo 4.5:1 para texto normal, 3:1 para texto grande. Verificado en ambos modos (Catálogo y Voz). |
| Navegación por teclado | Todos los elementos interactivos accesibles con Tab. Focus visible con borde `primary`. |
| Lectores de pantalla | Textos alternativos en imágenes de producto. ARIA labels en botones de acción. Roles semánticos en navegación. |
| Badges de estado | Siempre acompañados de texto, no solo color, para usuarios con daltonismo. |
| Tamaño de toque | Mínimo 44×44px para elementos interactivos en mobile. |
| Indicadores de carga | Feedback visual y textual durante operaciones asíncronas. |

---

## 9. Responsive Design

| Breakpoint | Viewport | Adaptaciones principales |
|---|---|---|
| Mobile | < 768px | Grid 4 columnas, navegación hamburger, Voice Button en thumb zone inferior-derecha, cards a 1 columna, checkout de columna única |
| Tablet | 768px – 1024px | Grid 8 columnas, sidebar colapsable, cards a 2 columnas |
| Desktop | > 1024px | Grid 12 columnas, sidebar expandida, cards a 3-4 columnas, checkout dos columnas |

---

## 10. Trazabilidad con Requisitos

| Pantalla | Historias de Usuario | Requisitos No Funcionales |
|---|---|---|
| SCR-HOME | HU-03 (favoritos), HU-10 (voz) | RNF-11 (tiempo de respuesta < 3s) |
| SCR-CATALOG | HU-10 (búsqueda por voz) | RNF-12 (escalabilidad del catálogo) |
| SCR-PRODUCT | HU-04 (carrito), HU-03 (favoritos) | RNF-11 (carga de imágenes) |
| SCR-LOGIN / SCR-REGISTER | HU-01 (registro/login) | RNF-07 (autenticación), RNF-09 (sesiones) |
| SCR-CART | HU-04 (carrito) | RNF-11 (actualización en tiempo real) |
| SCR-CHECKOUT-* | HU-05 (compra), HU-06 (pagos) | RNF-10 (seguridad de pago), RNF-06 (degradación controlada) |
| SCR-ORDER-CONFIRM | HU-05 (compra) | RNF-17 (registro de auditoría) |
| SCR-PROFILE-* | HU-02 (perfil) | RNF-08 (protección de datos) |
| SCR-FAVORITES | HU-03 (favoritos) | RNF-11 (tiempo de respuesta) |
| SCR-ORDER-HISTORY | HU-07 (seguimiento) | RNF-11 (paginación eficiente) |
| SCR-TRACKING-* | HU-07 (seguimiento) | RNF-06 (degradación si falla tracking externo) |
| SCR-SELLER-* | HU-08 (publicación), HU-09 (ventas) | RNF-17 (auditoría de cambios) |
| SCR-ADMIN-* | HU-11 (administración) | RNF-05 (disponibilidad 99.5%), RNF-17 (observabilidad) |
| SCR-VOICE-ANALYTICS | HU-10 (agente de voz) | RNF-11 (procesamiento de analítica) |

---

## 11. Referencia de Proyecto Stitch

Para acceder a los prototipos interactivos y al código HTML generado de cada pantalla, utilizar el proyecto Stitch con la siguiente configuración:

```json
{
  "mcpServers": {
    "stitch": {
      "serverUrl": "https://stitch.googleapis.com/mcp",
      "headers": {
        "X-Goog-Api-Key": "<GOOGLE_API_KEY>"
      }
    }
  }
}
```

**Operaciones disponibles:**

| Operación MCP | Propósito |
|---|---|
| `list_projects` | Listar proyectos de diseño disponibles |
| `list_screens` | Listar todas las pantallas del proyecto `14760269208940461002` |
| `get_screen` | Obtener detalle de una pantalla específica (HTML, screenshot) |
| `generate_screen_from_text` | Generar nueva pantalla a partir de descripción textual |
| `edit_screens` | Editar pantallas existentes |
| `generate_variants` | Generar variantes de diseño de una pantalla |
| `create_design_system` | Crear sistema de diseño |
| `apply_design_system` | Aplicar sistema de diseño a pantallas |

---
