# Matriz de Trazabilidad — Marketplace Inteligente Asistido por IA

## 1. Introducción

La matriz de trazabilidad establece las relaciones entre los elementos de la especificación: **Objetivos → Requisitos Funcionales → Reglas de Negocio → Casos de Uso**. Esta trazabilidad garantiza que cada requisito tiene un objetivo que lo justifica, que cada regla de negocio está vinculada a los requisitos que rige, y que cada caso de uso está cubierto por al menos un requisito funcional.

---

## 2. Trazabilidad: Objetivos → Requisitos Funcionales

| Objetivo | Nombre del Objetivo | Requisitos Funcionales |
|---|---|---|
| OBJ-01 | Habilitar la interacción mediante lenguaje natural | RF-01, RF-02 |
| OBJ-02 | Proveer capacidades completas de exploración del Catálogo | RF-03, RF-04, RF-05, RF-06 |
| OBJ-03 | Permitir la gestión del Carrito y ejecución de compras mediante el Agente | RF-07, RF-08 |
| OBJ-04 | Garantizar la accesibilidad del Marketplace para todos los usuarios | RF-02, RNF-15, RNF-16 |
| OBJ-05 | Proveer herramientas de gestión para Vendedores y Administradores | RF-09, RF-10, RF-11 |
| OBJ-06 | Garantizar la seguridad y confiabilidad del sistema | RF-12, RNF-07, RNF-08, RNF-09, RNF-10 |

---

## 3. Trazabilidad: Requisitos Funcionales → Reglas de Negocio

| Requisito | Nombre del Requisito | Reglas de Negocio Aplicables |
|---|---|---|
| RF-01 | Interpretación de instrucciones en texto | RN-14 |
| RF-02 | Interpretación de instrucciones por voz | RN-11, RN-14 |
| RF-03 | Búsqueda de productos | RN-14 |
| RF-04 | Filtrado de resultados | RN-14 |
| RF-05 | Ordenamiento de resultados | RN-14 |
| RF-06 | Comparación de productos | RN-13 |
| RF-07 | Gestión del Carrito | RN-02 |
| RF-08 | Ejecución de compra | RN-01, RN-02, RN-03, RN-04 |
| RF-09 | Creación de Publicación | RN-05, RN-06 |
| RF-10 | Gestión de Órdenes por el Vendedor | RN-07 |
| RF-11 | Administración de usuarios y publicaciones | RN-10 |
| RF-12 | Registro y autenticación de usuarios | RN-08, RN-09, RN-12 |

---

## 4. Trazabilidad: Requisitos Funcionales → Casos de Uso

| Requisito | Nombre del Requisito | Casos de Uso |
|---|---|---|
| RF-01 | Interpretación de instrucciones en texto | CU-01, CU-03, CU-04 |
| RF-02 | Interpretación de instrucciones por voz | CU-02, CU-03, CU-04 |
| RF-03 | Búsqueda de productos | CU-05, CU-06, CU-11 |
| RF-04 | Filtrado de resultados | CU-07, CU-08 |
| RF-05 | Ordenamiento de resultados | CU-09 |
| RF-06 | Comparación de productos | CU-10 |
| RF-07 | Gestión del Carrito | CU-12, CU-13, CU-14, CU-15, CU-16 |
| RF-08 | Ejecución de compra | CU-17, CU-18, CU-19, CU-20, CU-21 |
| RF-09 | Creación de Publicación | CU-22, CU-23, CU-24, CU-25 |
| RF-10 | Gestión de Órdenes por el Vendedor | CU-26, CU-27, CU-28 |
| RF-11 | Administración de usuarios y publicaciones | CU-29, CU-30, CU-31, CU-32, CU-33 |
| RF-12 | Registro y autenticación de usuarios | CU-34, CU-35, CU-36, CU-37, CU-38, CU-39, CU-40 |

---

## 5. Trazabilidad: Reglas de Negocio → Requisitos Funcionales

| Regla | Nombre de la Regla | Requisitos que Rigen |
|---|---|---|
| RN-01 | Confirmación antes de acciones irreversibles | RF-08 |
| RN-02 | Autenticación obligatoria para transacciones | RF-07, RF-08 |
| RN-03 | Verificación de disponibilidad previa al pago | RF-08 |
| RN-04 | Decremento de stock al registrar Orden | RF-08 |
| RN-05 | Completitud mínima de una Publicación | RF-09 |
| RN-06 | Precio mínimo de Publicación | RF-09 |
| RN-07 | Escalamiento de Orden no confirmada en 24 horas | RF-10 |
| RN-08 | Bloqueo por intentos de autenticación fallidos | RF-12 |
| RN-09 | Política de contraseña segura | RF-12 |
| RN-10 | Suspensión de Publicaciones al suspender al Vendedor | RF-11 |
| RN-11 | Umbral de confianza en transcripción STT | RF-02 |
| RN-12 | Obligatoriedad de respetar preferencias de notificación | RF-08, RF-10 |
| RN-13 | Límite de productos en vista comparativa | RF-06 |
| RN-14 | Expiración del Contexto de Sesión por inactividad | RF-01, RF-02, RF-03, RF-04, RF-05 |

---

## 6. Trazabilidad: Casos de Uso → Requisitos Funcionales

| Caso de Uso | Nombre del Caso de Uso | Requisito Funcional |
|---|---|---|
| CU-01 | Ingresar instrucción en texto | RF-01 |
| CU-02 | Ingresar instrucción por voz | RF-02 |
| CU-03 | Solicitar aclaración de instrucción ambigua | RF-01, RF-02 |
| CU-04 | Mantener contexto de Sesión | RF-01, RF-02, RF-03, RF-04, RF-05 |
| CU-05 | Buscar productos | RF-03 |
| CU-06 | Explorar Catálogo sin Agente | RF-03 |
| CU-07 | Filtrar resultados de búsqueda | RF-04 |
| CU-08 | Eliminar un filtro activo | RF-04 |
| CU-09 | Ordenar resultados de búsqueda | RF-05 |
| CU-10 | Comparar productos | RF-06 |
| CU-11 | Ver detalle de un producto | RF-03 |
| CU-12 | Agregar producto al Carrito mediante Agente | RF-07 |
| CU-13 | Ver contenido del Carrito | RF-07 |
| CU-14 | Modificar cantidad de producto en el Carrito | RF-07 |
| CU-15 | Eliminar producto del Carrito | RF-07 |
| CU-16 | Vaciar el Carrito | RF-07 |
| CU-17 | Iniciar proceso de compra | RF-08 |
| CU-18 | Confirmar compra | RF-08 |
| CU-19 | Seleccionar método de pago | RF-08 |
| CU-20 | Procesar pago | RF-08 |
| CU-21 | Recibir confirmación de Orden | RF-08 |
| CU-22 | Crear Publicación de producto | RF-09 |
| CU-23 | Modificar Publicación existente | RF-09 |
| CU-24 | Desactivar Publicación | RF-09 |
| CU-25 | Reactivar Publicación | RF-09 |
| CU-26 | Ver Órdenes recibidas | RF-10 |
| CU-27 | Actualizar estado de Orden | RF-10 |
| CU-28 | Recibir notificación de nueva Orden | RF-10 |
| CU-29 | Suspender cuenta de usuario | RF-11 |
| CU-30 | Reactivar cuenta de usuario | RF-11 |
| CU-31 | Eliminar Publicación por incumplimiento | RF-11 |
| CU-32 | Gestionar Orden escalada | RF-11 |
| CU-33 | Consultar reportes del Marketplace | RF-11 |
| CU-34 | Registrarse como Comprador | RF-12 |
| CU-35 | Registrarse como Vendedor | RF-12 |
| CU-36 | Verificar correo electrónico | RF-12 |
| CU-37 | Iniciar sesión | RF-12 |
| CU-38 | Cerrar sesión | RF-12 |
| CU-39 | Configurar preferencias de notificación | RF-12 |
| CU-40 | Gestionar perfil de usuario | RF-12 |

---

## 7. Resumen de Cobertura

| Elemento | Total | Cubiertos | Cobertura |
|---|---|---|---|
| Objetivos con al menos un requisito funcional | 6 | 6 | 100% |
| Requisitos funcionales con al menos un objetivo | 12 | 12 | 100% |
| Requisitos funcionales con al menos una regla de negocio | 12 | 12 | 100% |
| Requisitos funcionales con al menos un caso de uso | 12 | 12 | 100% |
| Reglas de negocio con al menos un requisito que rigen | 14 | 14 | 100% |
| Casos de uso con al menos un requisito funcional | 40 | 40 | 100% |
| Requisitos funcionales con criterios de aceptación | 12 | 12 | 100% |
