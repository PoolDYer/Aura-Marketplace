# Objetivos del Sistema — Marketplace Inteligente Asistido por IA

## 1. Objetivo General

Desarrollar un Marketplace de comercio electrónico que incorpore un Agente Inteligente capaz de comprender instrucciones en lenguaje natural —mediante texto y voz— y de ejecutar acciones funcionales dentro de la plataforma, con el propósito de reducir la fricción en el proceso de compra, ampliar la accesibilidad del sistema y aumentar la tasa de conversión de usuarios exploradores a compradores.

---

## 2. Objetivos Específicos

### OBJ-01 — Habilitar la interacción mediante lenguaje natural

**Descripción:** El sistema debe permitir que el Comprador exprese sus necesidades de compra mediante instrucciones en lenguaje natural en texto y voz, sin necesidad de aprender comandos específicos ni navegar manualmente por la interfaz.

**Motivación:** La interfaz conversacional reduce la carga cognitiva del usuario y hace accesible el Marketplace a personas con diferentes niveles de experiencia digital.

**Indicadores de éxito:**
- El Agente Inteligente reconoce correctamente la intención en al menos el 85% de las instrucciones recibidas en condiciones normales de uso.
- El tiempo de respuesta del Agente desde la recepción de la instrucción hasta la ejecución de la Acción es menor o igual a 2 segundos en el percentil 95 de las solicitudes.

---

### OBJ-02 — Proveer capacidades completas de exploración del Catálogo

**Descripción:** El sistema debe permitir que el Agente Inteligente ejecute búsquedas, aplique filtros, ordene resultados y presente comparaciones de productos del Catálogo, manteniendo el contexto entre instrucciones sucesivas.

**Motivación:** La exploración del Catálogo es el flujo más frecuente del Marketplace. Una exploración eficiente aumenta la probabilidad de que el Comprador encuentre el producto adecuado y complete la compra.

**Indicadores de éxito:**
- El sistema retorna resultados de búsqueda dentro de 3 segundos desde la recepción de la consulta en el percentil 95.
- El Agente Inteligente aplica correctamente filtros y ordenamiento sin pérdida del contexto de resultados previos.
- El Comprador puede comparar entre 2 y 5 productos en una vista estructurada.

---

### OBJ-03 — Permitir la gestión del Carrito y la ejecución de compras mediante el Agente

**Descripción:** El sistema debe permitir que el Agente Inteligente agregue productos al Carrito, los gestione y complete el proceso de compra mediante instrucciones en lenguaje natural, coordinando con la Pasarela de Pago para procesar la transacción.

**Motivación:** Reducir los pasos entre la intención de compra y la orden completada elimina puntos de abandono en el embudo de conversión.

**Indicadores de éxito:**
- El Comprador puede completar una compra desde la instrucción inicial hasta la confirmación de la Orden con un máximo de 3 instrucciones al Agente.
- El Marketplace procesa y registra la Orden dentro de los 5 segundos posteriores a la confirmación del pago.

---

### OBJ-04 — Garantizar la accesibilidad del Marketplace para todos los usuarios

**Descripción:** El sistema debe cumplir el nivel AA de las WCAG 2.1 y ofrecer la modalidad de voz como alternativa equivalente a la modalidad de texto para todas las funciones del Agente Inteligente.

**Motivación:** La accesibilidad es tanto un imperativo ético como un requisito regulatorio en muchos mercados. La modalidad de voz amplía el acceso a personas con limitaciones visuales o motoras.

**Indicadores de éxito:**
- El sistema supera la verificación automatizada de accesibilidad sin errores de nivel AA según WCAG 2.1.
- Todas las funciones disponibles en modalidad de texto son accesibles en modalidad de voz.

---

### OBJ-05 — Proveer herramientas de gestión para Vendedores y Administradores

**Descripción:** El sistema debe permitir que los Vendedores gestionen su catálogo de publicaciones y sus órdenes, y que los Administradores supervisen y moderen la operación del Marketplace.

**Motivación:** Sin una oferta de productos curada y gestionada, el Marketplace no puede generar valor para los Compradores. La administración garantiza la calidad y confianza de la plataforma.

**Indicadores de éxito:**
- Un Vendedor puede crear, modificar y desactivar Publicaciones sin intervención del Administrador.
- El Administrador recibe notificación de órdenes escaladas dentro de los 60 segundos posteriores al escalamiento.
- Los reportes del Administrador se actualizan con una frecuencia mínima de 24 horas.

---

### OBJ-06 — Garantizar la seguridad y confiabilidad del sistema

**Descripción:** El sistema debe proteger los datos de los usuarios, gestionar sesiones de forma segura y manejar los errores de integraciones externas sin degradar la experiencia del usuario.

**Motivación:** La confianza es un factor determinante en la adopción de plataformas de comercio electrónico. Un sistema inseguro o poco confiable genera abandono inmediato.

**Indicadores de éxito:**
- Las contraseñas de usuario se almacenan siempre en forma cifrada y nunca se transmiten en texto plano.
- El sistema bloquea cuentas temporalmente ante intentos de autenticación fallidos repetidos.
- El sistema gestiona los errores de la Pasarela de Pago sin dejar Órdenes en estado inconsistente.

---

## 3. Resultados Esperados

Al completar la implementación del sistema conforme a estos objetivos, se esperan los siguientes resultados:

1. **Reducción de la tasa de abandono** en el flujo de exploración y compra, medible por la comparación de sesiones completadas antes y después de la implementación del Agente Inteligente.
2. **Incremento en la tasa de conversión** de Visitantes a Compradores activos, gracias a la reducción de la fricción en el proceso de registro y primera compra.
3. **Ampliación del segmento de usuarios** al incorporar personas con limitaciones físicas o con baja experiencia digital que pueden interactuar por voz.
4. **Reducción del tiempo promedio de exploración hasta la compra**, como resultado de la eficiencia del Agente en la ejecución de flujos de búsqueda, filtrado y compra.
5. **Mayor confianza en la plataforma** por parte de Vendedores y Compradores, derivada de una gestión transparente de órdenes y notificaciones oportunas.

---

## 4. Indicadores de Éxito Consolidados

| ID | Indicador | Valor Objetivo | Método de Medición |
|---|---|---|---|
| KPI-01 | Tasa de reconocimiento de intención por el Agente Inteligente | ≥ 85% | Registro de sesiones clasificadas por resultado |
| KPI-02 | Tiempo de respuesta del Agente (texto) | ≤ 2 segundos (P95) | Monitoreo de tiempos de respuesta |
| KPI-03 | Tiempo de retorno de resultados de búsqueda | ≤ 3 segundos (P95) | Monitoreo de tiempos de consulta |
| KPI-04 | Tiempo de procesamiento y registro de Orden | ≤ 5 segundos desde confirmación de pago | Registro de tiempos de transacción |
| KPI-05 | Pasos del Comprador desde intención hasta Orden completada | ≤ 3 instrucciones al Agente | Análisis de flujo de sesión |
| KPI-06 | Cumplimiento de accesibilidad WCAG 2.1 AA | Sin errores de nivel AA | Verificación automatizada de accesibilidad |
| KPI-07 | Tiempo de notificación de Orden al Vendedor | ≤ 60 segundos desde registro | Registro de tiempos de notificación |
| KPI-08 | Actualización de Publicación en el Catálogo | ≤ 60 segundos desde modificación | Monitoreo de latencia de actualización |
