# Diseño del Agente Inteligente — Aura Marketplace

## 1. Objetivos

Derivados de los objetivos estratégicos del sistema:

| Objetivo | Descripción | Origen |
|---|---|---|
| OBJ-01 | Permitir que el Comprador exprese sus necesidades mediante instrucciones en lenguaje natural en texto y voz, sin necesidad de aprender comandos ni navegar manualmente la interfaz. | OBJ-01 |
| OBJ-02 | Ejecutar búsquedas, filtros, ordenamientos y comparaciones sobre el Catálogo manteniendo el contexto entre instrucciones sucesivas. | OBJ-02 |
| OBJ-03 | Permitir la gestión del Carrito y la ejecución completa del proceso de compra mediante instrucciones en lenguaje natural, coordinando con la Pasarela de Pago de Mercado Pago. | OBJ-03 |
| OBJ-04 | Garantizar que todas las funciones del Agente son igualmente accesibles mediante la modalidad de voz, cumpliendo WCAG 2.1 nivel AA. | OBJ-04 |

---

## 2. Responsabilidades

| Requisito | Responsabilidad del Agente |
|---|---|
| RF-01 | Interpretar instrucciones en texto, identificar intención, extraer entidades y restricciones, y ejecutar la acción correspondiente. |
| RF-02 | Capturar audio, coordinarse con STT, verificar el umbral de confianza, procesar la transcripción y reproducir la respuesta con la síntesis de voz nativa del navegador. |
| RF-03 | Coordinar la búsqueda de productos en el Catálogo con las entidades y restricciones extraídas. |
| RF-04 | Aplicar filtros sobre el conjunto de resultados activo sin perder el contexto previo. |
| RF-05 | Reordenar el conjunto de resultados activo según el criterio indicado, conservando los filtros activos. |
| RF-06 | Presentar una vista comparativa de 2 a 5 productos del conjunto activo con sus atributos. |
| RF-07 | Agregar, modificar y eliminar productos del Carrito, verificando autenticación y disponibilidad. |
| RF-08 | Orquestar el proceso de compra: verificar stock, presentar resumen, solicitar confirmación, coordinar el pago y registrar la Orden. |

---

## 3. Arquitectura Conceptual — Capas del Agente

El Agente Inteligente se organiza internamente en cinco capas funcionales:

| Capa | Nombre | Función |
|---|---|---|
| CA-01 | Capa de Entrada | Recibe la instrucción del usuario en texto escrito o en audio. Para audio, coordina con el servicio STT del backend para obtener la transcripción. Verifica el umbral de confianza (RN-11). |
| CA-02 | Capa de Comprensión (NLP) | Procesa el texto de la instrucción para identificar la intención, extraer entidades y restricciones. Coordina con la API de NLP (Gemini). |
| CA-03 | Capa de Gestión de Contexto | Mantiene el ContextoSesion activo: historial de instrucciones, conjunto de resultados activo, filtros activos, referencias a objetos anteriores. |
| CA-04 | Capa de Ejecución de Acciones | Coordina con los módulos funcionales del sistema (Búsquedas, Carrito, Pedidos) para ejecutar la acción identificada. |
| CA-05 | Capa de Respuesta | Formula la respuesta en lenguaje natural a partir del resultado. En modo voz, coordina con la API nativa de síntesis de voz del navegador (window.speechSynthesis) en el cliente. |

---

## 4. Componentes Conceptuales

| Componente | Descripción |
|---|---|
| Receptor de Entrada | Acepta texto escrito o audio. Para audio, invoca al backend para STT y recibe la transcripción con su nivel de confianza. |
| Verificador de Confianza | Evalúa el nivel de confianza de la transcripción contra el umbral configurado (RN-11). |
| Clasificador de Intención | Determina el propósito del usuario a partir del texto: buscar, filtrar, ordenar, comparar, agregar al carrito, comprar, ver carrito. |
| Extractor de Entidades | Identifica los elementos de información de la instrucción: nombre de producto, marca, categoría, precio, condición de envío. |
| Extractor de Restricciones | Identifica las condiciones limitantes de la instrucción: "menor a $50", "con envío gratis", "solo Nike". |
| Gestor de Contexto | Mantiene y actualiza el ContextoSesion. Resuelve referencias contextuales ("ordénalos", "la primera"). |
| Resolvedor de Ambigüedad | Detecta instrucciones cuya intención no puede determinarse con certeza y formula solicitudes de aclaración específicas. |
| Orquestador de Acciones | Coordina con los módulos funcionales del sistema para ejecutar la acción identificada. |
| Gestor de Confirmaciones | Presenta el resumen de acciones irreversibles y espera la confirmación explícita del usuario antes de ejecutar. |
| Formateador de Respuesta | Genera la respuesta en lenguaje natural claro, informando qué acción se ejecutó y cuál fue el resultado (RNF-13). |
| Sintetizador de Voz | Cuando el modo de voz está activo, utiliza la API nativa Web Speech (window.speechSynthesis) en el navegador del cliente. |


---

## 5. Pipeline Conceptual — Flujo Completo desde Instrucción hasta Respuesta

```
Instrucción del usuario (texto o audio)
  │
  ▼
[CA-01] Capa de Entrada
  ├─ Texto escrito → pasa directamente
  └─ Audio → adaptador STT → texto transcrito + nivel de confianza
              └─ si confianza < umbral → solicitar repetición / modo texto
  │
  ▼
[CA-02] Capa de Comprensión (NLP)
  ├─ Clasificación de intención
  ├─ Extracción de entidades
  └─ Extracción de restricciones
              └─ si intención no determinable → solicitar aclaración
  │
  ▼
[CA-03] Capa de Gestión de Contexto
  ├─ Actualizar ContextoSesion con la instrucción
  ├─ Resolver referencias contextuales usando historial
  └─ Verificar estado de expiración de sesión
  │
  ▼
[CA-04] Capa de Ejecución de Acciones
  ├─ buscar → Módulo de Búsquedas
  ├─ filtrar / ordenar → Módulo de Búsquedas
  ├─ comparar → Módulo de Búsquedas + atributos
  ├─ agregar al carrito → Módulo de Carrito (verificar autenticación RN-02)
  └─ comprar → Módulo de Pedidos (verificar stock RN-03, pedir confirmación RN-01)
  │
  ▼
[CA-05] Capa de Respuesta
  ├─ Formatear resultado en lenguaje natural
  ├─ Texto → presentar al usuario
  └─ Voz → API nativa Web Speech (cliente) → audio de respuesta
              └─ si API no disponible → presentar solo texto (RNF-06)
```

---

## 6. Procesamiento por Texto (RF-01)

1. El Comprador ingresa una instrucción en el campo de texto con una Sesión activa.
2. La Capa de Entrada recibe el texto y lo pasa directamente a la Capa de Comprensión.
3. El Clasificador de Intención determina el propósito (buscar, filtrar, comprar, etc.).
4. El Extractor de Entidades identifica los elementos de información relevantes.
5. El Extractor de Restricciones identifica las condiciones limitantes.
6. El Gestor de Contexto actualiza el ContextoSesion con la instrucción y resuelve referencias.
7. El Orquestador de Acciones coordina con el módulo funcional correspondiente.
8. La Capa de Respuesta formula la respuesta y la presenta al Comprador.
9. El Gestor de Contexto actualiza el ContextoSesion con el resultado.
10. El tiempo total del proceso no debe superar 2 segundos en el P95 (RNF-01).

---

## 7. Procesamiento por Voz (RF-02)

1. El Comprador activa el modo de voz; el sistema muestra el indicador visual de escucha activa (RNF-14).
2. El Comprador habla su instrucción.
3. El audio es capturado y enviado al backend, el cual invoca el adaptador STT (Gemini AI).
4. El adaptador STT retorna la transcripción en texto y el nivel de confianza.
5. El Verificador de Confianza compara el nivel con el umbral configurado (RN-11).
   - Si el nivel es inferior al umbral: el Agente informa al Comprador y solicita que repita la instrucción o cambie al modo texto. No se ejecuta ninguna acción.
   - Si el nivel supera el umbral: la transcripción pasa a la Capa de Comprensión.
6. El flujo continúa exactamente igual al procesamiento por texto (pasos 3–9 de la sección 6).
7. La respuesta de texto del Agente es enviada a la API nativa de síntesis de voz en el frontend.
8. El audio de respuesta es reproducido al Comprador en el navegador.
9. Si la API Web Speech no está disponible o falla: el Agente presenta la respuesta solo en texto y continúa operando (RNF-06).

---

## 8. Comprensión del Lenguaje Natural

El Agente envía el texto de la instrucción al Proveedor de NLP externo con el contexto de la sesión activa (historial reciente, resultados activos). El Proveedor retorna:
- La intención identificada con su nivel de confianza.
- Las entidades extraídas con su tipo y valor.
- Las restricciones detectadas.

El Agente utiliza el historial de la conversación para proveer contexto al Proveedor de NLP, lo que mejora la precisión en instrucciones de seguimiento ("ordénalos por precio" → el NLP sabe que "ellos" son los resultados activos).

Si el Proveedor de NLP no está disponible, el Agente informa el estado al usuario y el Marketplace continúa operando mediante navegación manual (RNF-06).

---

## 9. Clasificación de Intención

El Clasificador de Intención reconoce las siguientes intenciones:

| Intención | Descripción | Ejemplo |
|---|---|---|
| buscar | El usuario quiere encontrar productos en el Catálogo. | "Busca pantalones negros" |
| filtrar | El usuario quiere reducir los resultados activos. | "Filtra solo los que tengan envío gratis" |
| ordenar | El usuario quiere reordenar los resultados activos. | "Ordénalos por precio de menor a mayor" |
| comparar | El usuario quiere ver los atributos de varios productos en paralelo. | "Compara los primeros tres" |
| agregar_al_carrito | El usuario quiere añadir un producto al Carrito. | "Agrega la primera al carrito" |
| comprar | El usuario quiere iniciar el proceso de compra. | "Compra la más barata" |
| ver_carrito | El usuario quiere ver el contenido del Carrito. | "¿Qué tengo en el carrito?" |

Cuando la intención tiene un nivel de confianza insuficiente, el Agente activa el Resolvedor de Ambigüedad en lugar de ejecutar una acción.


---

## 10. Extracción de Entidades

El Extractor de Entidades identifica los siguientes tipos de entidades en la instrucción:

| Tipo de Entidad | Descripción | Ejemplo |
|---|---|---|
| Producto | Nombre o descripción del producto buscado. | "pantalones negros", "zapatillas" |
| Marca | Fabricante o marca del producto. | "Nike", "Samsung", "Adidas" |
| Categoría | Categoría del producto. | "Electrónica", "Calzado", "Ropa" |
| Precio | Rango de precio o precio máximo/mínimo. | "menor a $50", "entre $20 y $100" |
| Condición de envío | Preferencia sobre el tipo de envío. | "con envío gratis", "envío rápido" |
| Calificación | Valoración mínima requerida. | "mejor calificado", "con 4 estrellas o más" |

Las entidades extraídas se convierten en los criterios de búsqueda que el Agente envía al Módulo de Búsquedas.

---

## 11. Extracción de Restricciones

Una restricción es una condición limitante que el usuario incluye en la instrucción para acotar los resultados. El Extractor de Restricciones identifica:

- **Restricciones de precio**: precio menor a, precio mayor a, rango de precio.
- **Restricciones de disponibilidad**: "en stock", "disponible para envío inmediato".
- **Restricciones de marca**: "solo Nike", "excepto…".
- **Restricciones de envío**: "con envío gratis", "con envío el mismo día".
- **Restricciones de calificación**: "con calificación mínima de 4".

Las restricciones se representan como objetos de valor de tipo Restriccion y se aplican como filtros sobre la consulta de búsqueda o sobre el conjunto de resultados activo.

---

## 12. Gestión de Contexto

El Gestor de Contexto mantiene el ContextoSesion durante toda la Sesión activa. El ContextoSesion incluye:

- **Historial de instrucciones**: las instrucciones procesadas y sus resultados en la sesión actual.
- **Conjunto de resultados activo**: la última lista de productos retornada por el Módulo de Búsquedas.
- **Filtros activos**: los filtros actualmente aplicados sobre el conjunto de resultados.
- **Criterio de ordenamiento activo**: el ordenamiento actualmente aplicado.
- **Referencias a objetos**: posiciones de productos en el conjunto activo ("la primera", "los dos últimos").

**Expiración del contexto (RN-14):**
El Gestor registra la marca temporal de la última actividad del usuario. Si transcurren 30 minutos sin nueva instrucción, el ContextoSesion se limpia y la Sesión se marca como expirada. Las instrucciones posteriores a la expiración no pueden referenciar resultados de la sesión anterior.

---

## 13. Gestión de Memoria Conversacional

El historial de instrucciones dentro de la Sesión permite al Agente resolver referencias de seguimiento:

- **Referencias posicionales**: "la primera", "los tres primeros", "el último". Se resuelven contra el conjunto de resultados activo.
- **Referencias pronominales**: "ellos", "esas", "esos productos". Se resuelven usando el conjunto o la entidad más reciente del contexto.
- **Referencias de continuación**: "ordénalos", "filtra esos", "compara las dos primeras". Se resuelven combinando el historial y el conjunto activo.

El Agente provee el historial reciente al Proveedor de NLP para mejorar la resolución de estas referencias en instrucciones ambiguas.

---

## 14. Resolución de Ambigüedad

El Agente activa el Resolvedor de Ambigüedad cuando:
- La intención tiene un nivel de confianza por debajo del umbral.
- La instrucción contiene múltiples intenciones posibles sin orden de prioridad claro.
- Una referencia contextual no puede resolverse con el ContextoSesion actual.

El Resolvedor formula una pregunta específica y mínima para aclarar la instrucción. No ejecuta ninguna acción hasta recibir la aclaración. La pregunta usa lenguaje natural sencillo e indica las opciones disponibles cuando es posible.

Ejemplo: "¿Quieres ordenar los resultados actuales por precio, o prefieres buscar otros productos?"

---

## 15. Manejo de Sinónimos

El Agente reconoce variantes léxicas para los mismos conceptos del dominio:

- "comprar" / "adquirir" / "pedir" / "ordenar" → intención: comprar.
- "agregar" / "añadir" / "meter" / "poner en el carrito" → intención: agregar_al_carrito.
- "busca" / "muéstrame" / "encuentra" / "quiero ver" → intención: buscar.
- "filtra" / "muestra solo" / "quita los que no" → intención: filtrar.
- "ordena" / "organiza" / "ordénalos" / "de menor a mayor" → intención: ordenar.

Esta capacidad se delega al Proveedor de NLP, que maneja el vocabulario de variantes lingüísticas del español.

---

## 16. Corrección Ortográfica

El Agente tolera errores tipográficos comunes en las instrucciones. La corrección se realiza en la Capa de Comprensión antes de clasificar la intención. El Proveedor de NLP aplica normalización de texto para manejar variantes como:

- Errores de acento: "busca pantaloens negros" → "pantalones".
- Errores de tipeo: "nike" / "Nike" / "NIKE" → normalizado a entidad de marca.
- Abreviaciones comunes: "pto." / "prod." → producto.


---

## 17. Motor de Búsqueda

El Agente actúa como coordinador entre el Comprador y el Módulo de Búsquedas:

1. El Agente envía al Módulo de Búsquedas las entidades extraídas (producto, marca, categoría) y las restricciones (precio, disponibilidad, envío, calificación).
2. El Módulo de Búsquedas ejecuta la consulta sobre el Catálogo y retorna la lista de resultados dentro de 3 segundos en el P95 (RNF-02).
3. El Agente recibe los resultados, los almacena como conjunto activo en el ContextoSesion y los presenta al Comprador.
4. Si no hay resultados: el Agente informa al Comprador e indica qué criterios no encontraron coincidencias, sugiriendo ampliar las entidades o reducir las restricciones.

---

## 18. Motor de Recomendaciones

Cuando una búsqueda no retorna resultados o un producto solicitado no tiene stock, el Agente activa el Motor de Recomendaciones:

- **Sin resultados**: el Agente amplía los criterios de búsqueda de forma incremental (primero elimina restricciones menos críticas) y presenta los nuevos resultados con una explicación del ajuste.
- **Producto sin stock**: el Agente extrae las características del producto solicitado y busca alternativas con atributos similares (misma categoría, marca similar, rango de precio equivalente).
- **El Agente informa siempre**: qué buscó, qué ajuste realizó y por qué, cumpliendo el principio de explicabilidad (RNF-13).

---

## 19. Comparación de Productos (RF-06)

**Flujo:**
1. El Comprador indica que quiere comparar productos (con referencia a posiciones o nombres).
2. El Agente extrae los identificadores de los productos del ContextoSesion o de la instrucción.
3. El Agente verifica que la cantidad esté entre 2 y 5 (RN-13).
   - Si son menos de 2: el Agente informa que necesita al menos 2 productos para comparar.
   - Si son más de 5: el Agente informa el límite e indica que debe seleccionarse un máximo de 5.
4. El Agente recupera los atributos de cada producto del Módulo de Búsquedas.
5. El Agente presenta la Vista Comparativa con los atributos destacando las diferencias.
6. Si los productos son de categorías distintas, el Agente advierte antes de mostrar la comparación (RF-06, E1).
7. El conjunto de resultados activo no se modifica.

---

## 20. Gestión del Carrito (RF-07)

**Flujo principal:**
1. El Comprador emite una instrucción de gestión del Carrito (agregar, modificar, eliminar, ver).
2. El Agente verifica que el Comprador está autenticado (RN-02). Si no lo está, redirige al proceso de autenticación.
3. El Agente identifica el producto referenciado (usando el ContextoSesion si se usa referencia posicional como "la primera").
4. El Agente verifica la disponibilidad del producto en el Módulo de Inventario.
   - Si no hay stock: el Agente informa la disponibilidad real y ofrece alternativas del conjunto activo.
5. El Agente ejecuta la operación en el Módulo de Carrito.
6. El Agente confirma la operación al Comprador con el nombre del producto y el total actualizado del Carrito.

---

## 21. Gestión del Pedido (RF-08)

**Flujo completo:**
1. El Comprador emite una instrucción de compra.
2. El Agente verifica autenticación (RN-02).
3. El Módulo de Inventario verifica el stock de todos los productos del Carrito (RN-03).
   - Si algún producto no tiene stock: el Agente informa al Comprador qué producto y permite continuar con los demás.
4. El Agente presenta el ResumenOrden al Comprador (productos, cantidades, precios, total, método de pago).
5. El Agente solicita confirmación explícita (RN-01). El flujo se detiene hasta recibir confirmación o cancelación.
6. El Comprador confirma.
7. El Módulo de Pagos envía la solicitud a la Pasarela de Pago.
8. La Pasarela confirma el pago.
9. El Módulo de Pedidos registra la Orden con número de confirmación único.
10. El Módulo de Inventario decrementa el stock de forma atómica (RN-04).
11. El Módulo de Notificaciones notifica al Comprador y al Vendedor.
12. El Carrito es vaciado.
13. El Agente confirma al Comprador con el número de Orden y el resumen de la transacción.
14. El proceso completo desde la confirmación del pago tarda máximo 5 segundos (RNF-03).


---

## 22. Confirmaciones

El Agente aplica el mecanismo de confirmación para toda acción que no pueda deshacerse (RN-01). El diseño del mecanismo:

- **Cuándo se activa**: antes de enviar cualquier solicitud de pago a la Pasarela.
- **Qué presenta**: el Gestor de Confirmaciones muestra el ResumenOrden completo en lenguaje natural, incluyendo todos los productos, cantidades, precios individuales, total y método de pago seleccionado.
- **Cómo solicita confirmación**: el Agente formula una pregunta directa y espera una respuesta explícita afirmativa ("sí", "confirmar", "proceder") o negativa ("no", "cancelar").
- **Si el usuario no responde**: el Agente mantiene el estado de espera sin timeout, ya que la confirmación es un acto volitivo del usuario.
- **Si el usuario cancela**: el Carrito se conserva intacto y el Agente informa que la compra fue cancelada.

---

## 23. Recuperación de Errores

El Agente implementa estrategias de recuperación controlada ante fallos de servicios externos (RNF-06):

| Servicio Falla | Comportamiento del Agente |
|---|---|
| Proveedor de NLP | Informa al usuario que la interpretación de lenguaje natural no está disponible. El Marketplace continúa operable mediante navegación manual. |
| Servicio STT | Informa que el reconocimiento de voz no está disponible y sugiere usar el modo texto. La modalidad de texto continúa funcionando con normalidad. |
| API de voz (frontend) | La API Web Speech del navegador no está disponible o no responde. La respuesta se presenta solo en texto. El flujo funcional no se interrumpe. |
| Pasarela de Pago | El Agente informa el motivo del rechazo o la indisponibilidad y ofrece la opción de usar otro método de pago o reintentar. El Carrito se conserva. |
| Módulo de Búsquedas (timeout) | Si la búsqueda supera el tiempo límite, el Agente muestra un indicador de carga (RNF-14) e informa si la demora persiste. |

---

## 24. Escalación

El Agente escala a atención humana (Administrador) en los siguientes casos:

- Una Orden permanece en estado "pendiente" por más de 24 horas sin atención del Vendedor (RN-07): el escalamiento es automático y el Agente notifica al Administrador.
- El proceso de pago falla repetidamente y el Comprador solicita asistencia.
- El Comprador expresa de forma explícita que desea hablar con una persona.

El Agente informa al Comprador cuando escala, indicando qué ocurrió y qué puede esperar.

---

## 25. Explicabilidad

El Agente siempre informa al usuario qué acción ejecutó y cuál fue el resultado (RNF-13):

- "Encontré 24 zapatillas Nike en el Catálogo. Las ordené por precio de menor a mayor."
- "Agregué 'Nike Air Max - talla 42' a tu carrito. Total del carrito: $89.900."
- "Tu orden fue confirmada. Número de confirmación: ORD-20240312-004821."
- "No pude procesar tu instrucción porque el servicio de interpretación no está disponible en este momento."

Cada mensaje de error incluye qué ocurrió y qué puede hacer el usuario para continuar.

---

## 26. Casos Límite

| Caso Límite | Comportamiento del Agente |
|---|---|
| Instrucciones contradictorias | El Agente detecta la contradicción, informa al usuario y solicita aclaración antes de ejecutar. |
| Sesión expirada (RN-14) | El Agente informa que la sesión expiró y que las referencias a resultados anteriores ya no están disponibles. Invita a iniciar una nueva búsqueda. |
| Catálogo vacío o sin resultados | El Agente informa que no encontró productos con esos criterios y sugiere ampliar la búsqueda. |
| STT por debajo del umbral de confianza (RN-11) | El Agente informa que no entendió la instrucción de voz con suficiente certeza y solicita repetirla o escribirla. No ejecuta ninguna acción. |
| TTS no disponible | El Agente responde en texto. Informa brevemente que la respuesta de voz no está disponible. |
| Pasarela rechaza el pago | El Agente informa el motivo del rechazo y ofrece la opción de usar otro método de pago. El Carrito se conserva intacto. |
| Más de 5 productos para comparar (RN-13) | El Agente informa el límite de 5 productos y solicita al Comprador que seleccione cuáles comparar. |
| Carrito vacío al intentar comprar | El Agente informa que el Carrito está vacío y ofrece iniciar una búsqueda. |
| Comprador no autenticado intenta comprar (RN-02) | El Agente informa que es necesario iniciar sesión y redirige al proceso de autenticación. |

---

## 27. Restricciones del Agente

| ID | Restricción | Origen |
|---|---|---|
| RAG-01 | No ejecuta ninguna acción de compra sin confirmación explícita del Comprador. | RN-01 |
| RAG-02 | No procesa operaciones de Carrito ni de compra sin Comprador autenticado. | RN-02 |
| RAG-03 | No procesa transcripciones STT por debajo del umbral de confianza. | RN-11 |
| RAG-04 | No inicia una comparación con menos de 2 ni con más de 5 productos. | RN-13 |
| RAG-05 | No conserva el ContextoSesion tras 30 minutos de inactividad. | RN-14 |
| RAG-06 | Responde dentro de 2 segundos en el P95 bajo carga normal. | RNF-01 |
| RAG-07 | Siempre informa al usuario qué acción ejecutó y cuál fue el resultado. | RNF-13 |
| RAG-08 | Continúa operando en modo texto si STT o TTS no están disponibles. | RNF-06 |


---

## 28. Máquina de Estados Conceptual

El Agente Inteligente puede estar en uno de los siguientes estados:

| Estado | Descripción |
|---|---|
| Inactivo | El Agente no está procesando ninguna instrucción. Espera la próxima entrada del usuario. |
| Escuchando | El modo de voz está activo y el sistema está capturando audio del usuario. |
| Procesando | El Agente recibió una instrucción y está interpretando la intención, extrayendo entidades y coordinando con servicios externos. |
| Ejecutando | El Agente está coordinando con los módulos funcionales para ejecutar la acción identificada. |
| Confirmando | El Agente presentó el ResumenOrden y espera la confirmación explícita del Comprador antes de continuar. |
| Respondiendo | El Agente está formulando y presentando la respuesta al Comprador (en texto y/o voz). |
| Error | Ocurrió un fallo en un servicio externo o una condición de error. El Agente informa al usuario y ofrece alternativas. |
| Expirado | El ContextoSesion fue limpiado por 30 minutos de inactividad. La Sesión del Agente ha expirado. |

**Transiciones principales:**

```
Inactivo ──instrucción texto──► Procesando
Inactivo ──activar voz──► Escuchando
Escuchando ──audio capturado──► Procesando
Procesando ──intención identificada──► Ejecutando
Procesando ──intención ambigua──► Inactivo (solicita aclaración)
Procesando ──error de servicio──► Error
Ejecutando ──acción completada──► Respondiendo
Ejecutando ──acción irreversible──► Confirmando
Confirmando ──usuario confirma──► Ejecutando
Confirmando ──usuario cancela──► Respondiendo
Respondiendo ──respuesta presentada──► Inactivo
Error ──usuario reintenta──► Inactivo
Inactivo ──30 min inactividad──► Expirado
Expirado ──nueva instrucción──► Procesando (sin contexto previo)
```

---

## 29. Ciclo de Vida de una Conversación

1. **Activación**: el Comprador inicia sesión en el Marketplace y el Agente crea un ContextoSesion vacío.
2. **Primera instrucción**: el Comprador emite la primera instrucción. El Agente pasa al estado Procesando.
3. **Interacción continua**: el Comprador y el Agente intercambian instrucciones y respuestas. Cada instrucción actualiza el ContextoSesion. Los resultados activos y los filtros se acumulan en el contexto.
4. **Acciones transaccionales**: cuando el Comprador solicita una acción de Carrito o compra, el Agente verifica autenticación y ejecuta el flujo de confirmación si corresponde.
5. **Inactividad**: si el Comprador no emite ninguna instrucción durante 30 minutos, el ContextoSesion expira (RN-14).
6. **Expiración**: el Agente limpia el ContextoSesion. Las instrucciones posteriores no pueden referenciar resultados de la sesión anterior.
7. **Cierre de sesión**: el Comprador cierra sesión. El ContextoSesion es destruido y el token de acceso es invalidado (RNF-09).

---

## 30. Criterios de Calidad

| KPI | Criterio | Valor Objetivo | Origen |
|---|---|---|---|
| KPI-01 | Tasa de reconocimiento correcto de intención | ≥ 85 % de las instrucciones en condiciones normales | OBJ-01 |
| KPI-02 | Tiempo de respuesta del Agente (texto) | ≤ 2 segundos en el P95 bajo carga normal (≤ 500 usuarios concurrentes) | RNF-01 |
| KPI-03 | Tiempo de retorno de resultados de búsqueda | ≤ 3 segundos en el P95 | RNF-02 |
| KPI-04 | Tiempo de procesamiento y registro de Orden | ≤ 5 segundos desde confirmación de pago | RNF-03 |
| KPI-05 | Pasos del Comprador desde intención hasta Orden completada | ≤ 3 instrucciones al Agente | OBJ-03 |
| RNF-13 | Claridad de respuestas | El Agente siempre informa acción ejecutada y resultado. Los mensajes de error indican qué ocurrió y qué hacer. | RNF-13 |
| RNF-06 | Degradación controlada | Si STT o TTS fallan, el modo texto continúa funcionando. Si NLP falla, el Marketplace opera mediante navegación manual. | RNF-06 |
| RNF-01 | Rendimiento bajo alta carga | Bajo 2.000 usuarios concurrentes, el tiempo de respuesta no supera 4 segundos en el P95 | RNF-11 |

---

## 31. Implementación Tecnológica del Agente Inteligente

### 31.1 Mapeo de Capas del Agente a Tecnologías

| Capa del Agente | Tecnología | Ubicación en la arquitectura |
|---|---|---|
| CA-01 — Entrada (texto) | NestJS controller + class-validator DTO | L-03 — validación de instrucción antes de procesamiento |
| CA-01 — Entrada (voz) | Adaptador SpeechToTextProvider | L-05 — transcripción; verificación de umbral en L-02 |
| CA-02 — Comprensión NLP | Adaptador LanguageModelProvider | L-05 — el dominio L-04 nunca conoce el proveedor NLP |
| CA-03 — Gestión de Contexto | Zustand (estado cliente) + Neon PostgreSQL (historial persistido vía Prisma) | L-01 (estado de sesión efímero) + L-05 (historial de conversaciones) |
| CA-04 — Ejecución de Acciones | NestJS AgentModule → llamadas a módulos funcionales (Búsquedas, Carrito, Pedidos) | L-02/L-03 |
| CA-05 — Respuesta (texto) | Zustand + React + Shadcn/ui | L-01 — presentación de respuesta |
| CA-05 — Respuesta (voz) | API nativa Web Speech (window.speechSynthesis) | L-01 — síntesis en el navegador del cliente |

### 31.2 Independencia del Proveedor de IA

El Agente en L-02 invoca únicamente las interfaces:
- `LanguageModelProvider.interpret(text, context)` — para NLP
- `SpeechToTextProvider.transcribe(audio)` — para STT

Ningún nombre de proveedor específico aparece en el código de L-02 o L-04. Esta restricción se formaliza como la restricción arquitectónica RA-09 (ver `01-ArquitecturaGeneral.md` sec. 19).

### 31.3 Estado Conversacional

El contexto de sesión del Agente se gestiona en dos niveles complementarios:
- **Estado efímero en cliente (L-01):** Zustand mantiene el ContextoSesion activo para resolución de referencias en el frontend; expira cuando el usuario cierra el navegador
- **Historial persistido (L-05):** la Conversacion y sus Mensajes se persisten en Neon PostgreSQL vía Prisma; expiran junto con la Sesion según RN-14 (30 minutos de inactividad)
