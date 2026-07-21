# Matriz de Trazabilidad — Aura Marketplace

## 1. Introducción

La matriz de trazabilidad establece las relaciones entre los elementos de la especificación de Aura Marketplace: **Objetivos → Requisitos Funcionales → Reglas de Negocio → Historias de Usuario**. Esta trazabilidad garantiza que cada requisito tiene un objetivo que lo justifica, que cada regla de negocio está vinculada a los requisitos que rige, y que cada historia de usuario está cubierta por al menos un requisito funcional.

---

## 2. Trazabilidad: Objetivos → Requisitos Funcionales

| Objetivo | Nombre del Objetivo | Requisitos Funcionales |
|---|---|---|
| OBJ-01 | Habilitar la interacción mediante lenguaje natural | RF-01, RF-02 |
| OBJ-02 | Proveer capacidades completas de exploración del Catálogo | RF-03, RF-04, RF-05, RF-06 |
| OBJ-03 | Permitir la gestión del Carrito y ejecución de compras mediante el Agente | RF-07, RF-08 |
| OBJ-04 | Garantizar la accesibilidad del Marketplace para todos los usuarios | RF-02, RF-14, RNF-15, RNF-16 |
| OBJ-05 | Proveer herramientas de gestión para Vendedores y Administradores | RF-09, RF-10, RF-11, RF-15 |
| OBJ-06 | Garantizar la seguridad y confiabilidad del sistema | RF-12, RF-13, RNF-07, RNF-08, RNF-09, RNF-10 |

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
| RF-13 | Gestión de Sesión del Agente | RN-14 |
| RF-14 | Accesibilidad e Inclusión | RNF-15, RNF-16 |
| RF-15 | Notificaciones al Usuario | RN-12 |

---

## 4. Trazabilidad: Requisitos Funcionales → Historias de Usuario

| Requisito | Nombre del Requisito | Historias de Usuario |
|---|---|---|
| RF-01 | Interpretación de instrucciones en texto | HU-01, HU-02 |
| RF-02 | Interpretación de instrucciones por voz | HU-01, HU-02 |
| RF-03 | Búsqueda de productos | HU-03, HU-05 |
| RF-04 | Filtrado de resultados | HU-03 |
| RF-05 | Ordenamiento de resultados | HU-03 |
| RF-06 | Comparación de productos | HU-04 |
| RF-07 | Gestión del Carrito | HU-06 |
| RF-08 | Ejecución de compra | HU-07, HU-08, HU-09, HU-10 |
| RF-09 | Creación de Publicación | HU-11, HU-12 |
| RF-10 | Gestión de Órdenes por el Vendedor | HU-13, HU-14 |
| RF-11 | Administración de usuarios y publicaciones | HU-21, HU-22, HU-23, HU-24, HU-25 |
| RF-12 | Registro y autenticación de usuarios | HU-15, HU-16, HU-17, HU-18, HU-19 |
| RF-13 | Gestión de Sesión del Agente | HU-02 |
| RF-14 | Accesibilidad e Inclusión | HU-03 |
| RF-15 | Notificaciones al Usuario | HU-10, HU-20 |

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
| RN-12 | Obligatoriedad de respetar preferencias de notificación | RF-08, RF-10, RF-15 |
| RN-13 | Límite de productos en vista comparativa | RF-06 |
| RN-14 | Expiración del Contexto de Sesión por inactividad | RF-01, RF-02, RF-03, RF-04, RF-05, RF-13 |

---

## 6. Trazabilidad: Historias de Usuario → Requisitos Funcionales

| Historia de Usuario | Nombre de la Historia de Usuario | Requisito Funcional |
|---|---|---|
| HU-01 | Interactuar con el Agente Inteligente mediante texto o voz | RF-01, RF-02 |
| HU-02 | Interpretar instrucciones, pedir aclaraciones y mantener contexto | RF-01, RF-02, RF-13 |
| HU-03 | Explorar y buscar productos mediante catálogo, filtros y ordenamientos | RF-03, RF-04, RF-05, RF-14 |
| HU-04 | Comparar productos para evaluar diferencias | RF-06 |
| HU-05 | Ver el detalle de una publicación, imágenes, descripción y reputación | RF-03 |
| HU-06 | Agregar, modificar, eliminar o vaciar productos del carrito | RF-07 |
| HU-07 | Iniciar el checkout, elegir dirección y confirmar orden | RF-08 |
| HU-08 | Seleccionar método de pago, aplicar cupones y completar transacción | RF-08 |
| HU-09 | Procesar pagos, webhooks y estados de orden en tiempo real | RF-08 |
| HU-10 | Recibir y consultar número de orden, historial y detalle de compras | RF-08, RF-15 |
| HU-11 | Publicar productos con datos e imágenes | RF-09 |
| HU-12 | Editar, pausar, reactivar o eliminar publicaciones | RF-09 |
| HU-13 | Consultar órdenes y actualizar sus estados (Vendedor) | RF-10 |
| HU-14 | Consultar clientes vinculados a ventas | RF-10 |
| HU-15 | Registrarse como comprador o vendedor y verificar correo | RF-12 |
| HU-16 | Iniciar sesión, cerrar sesión y recuperar contraseña | RF-12 |
| HU-17 | Gestionar datos personales, direcciones y preferencias | RF-12 |
| HU-18 | Guardar, consultar y eliminar favoritos | RF-12 |
| HU-19 | Consultar y registrar reseñas | RF-12 |
| HU-20 | Recibir, consultar y marcar notificaciones | RF-15 |
| HU-21 | Suspender, reactivar y supervisar cuentas (Administrador) | RF-11 |
| HU-22 | Moderar publicaciones retirando contenido no permitido | RF-11 |
| HU-23 | Gestionar órdenes escaladas para resolver incidencias | RF-11 |
| HU-24 | Consultar reportes y estadísticas globales | RF-11 |
| HU-25 | Gestionar categorías para organizar publicaciones | RF-11 |

---

## 7. Resumen de Cobertura

| Elemento | Total | Cubiertos | Cobertura |
|---|---|---|---|
| Objetivos con al menos un requisito funcional | 6 | 6 | 100% |
| Requisitos funcionales con al menos un objetivo | 15 | 15 | 100% |
| Requisitos funcionales con al menos una regla de negocio | 15 | 15 | 100% |
| Requisitos funcionales con al menos una historia de usuario | 15 | 15 | 100% |
| Reglas de negocio con al menos un requisito que rigen | 14 | 14 | 100% |
| Historias de usuario con al menos un requisito funcional | 25 | 25 | 100% |
| Requisitos funcionales con criterios de aceptación | 15 | 15 | 100% |
