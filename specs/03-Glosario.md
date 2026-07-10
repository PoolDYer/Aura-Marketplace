# Glosario del Dominio — Marketplace Inteligente Asistido por IA

## Propósito

Este documento define formalmente todos los términos del dominio utilizados en la especificación del Marketplace Inteligente. Cualquier término que aparezca en los documentos de requisitos, reglas de negocio o casos de uso debe estar definido aquí. Los términos se presentan en orden alfabético.

---

## Términos del Dominio

### A

**Acción**
Operación concreta ejecutada por el Agente Inteligente en respuesta a una instrucción del usuario. Ejemplos: buscar productos, aplicar un filtro, agregar al Carrito, iniciar la compra.

**Administrador**
Actor interno con privilegios elevados responsable de la supervisión operativa del Marketplace. Puede gestionar usuarios, publicaciones y órdenes.

**Agente Inteligente**
Componente central del sistema que interpreta instrucciones en lenguaje natural (texto y voz), identifica intenciones y entidades, y ejecuta Acciones funcionales dentro del Marketplace en nombre del usuario. No es un chatbot conversacional pasivo: opera como un actor funcional con capacidad de ejecución.

**Atributo de Producto**
Característica que describe un producto dentro del Catálogo. Ejemplos: nombre, precio, marca, categoría, calificación, disponibilidad, condición de envío.

### C

**Carrito**
Contenedor temporal que acumula los productos seleccionados por el Comprador antes de finalizar el proceso de compra. El Carrito persiste durante la Sesión activa del Comprador.

**Catálogo**
Conjunto de Publicaciones activas de productos disponibles en el Marketplace para ser exploradas y adquiridas por los Compradores.

**Categoría**
Clasificación temática de los productos dentro del Catálogo (ej. Calzado, Electrónica, Ropa, Deportes).

**Comprador**
Actor interno registrado en el Marketplace cuyo objetivo es buscar, explorar y adquirir productos. Es el usuario primario del Agente Inteligente.

**Confianza (STT)**
Nivel numérico que indica la certeza del servicio STT sobre la precisión de una transcripción de voz. El sistema establece un umbral mínimo de confianza por debajo del cual la transcripción no es procesada.

**Contexto de Sesión**
Estado interno mantenido por el Agente Inteligente durante una Sesión activa. Incluye el historial de instrucciones, los resultados activos, los filtros aplicados y las referencias a objetos previos.

**Criterio de Aceptación**
Condición verificable y medible que un requisito debe satisfacer para ser considerado cumplido. Se expresa en formato Given/When/Then.

### E

**Entidad**
Elemento de información extraído de una instrucción por el Agente Inteligente. Puede ser el nombre de un producto, una marca, una categoría, un rango de precio, una condición de envío u otro atributo relevante.

**Estado de Orden**
Fase en el ciclo de vida de una Orden. Los estados posibles son: pendiente, confirmada, en preparación, despachada, entregada, cancelada.

### F

**Filtro**
Criterio aplicado sobre el conjunto de resultados activo para reducirlo a los productos que cumplen una condición específica. Los filtros soportados incluyen: precio, categoría, marca, disponibilidad, calificación y condición de envío.

### I

**Identificador Único**
Código alfanumérico irrepetible asignado por el sistema a un registro (Publicación, Orden, usuario) para permitir su referencia unívoca.

**Intención**
Propósito comunicado por el usuario a través de una instrucción en lenguaje natural. El Agente Inteligente debe reconocer la intención para determinar qué Acción ejecutar. Ejemplos de intenciones: buscar, filtrar, ordenar, comparar, agregar al carrito, comprar.

### M

**Marketplace**
Plataforma digital que conecta Compradores y Vendedores para realizar transacciones comerciales de productos. El sistema objeto de esta especificación.

**Método de Pago**
Modalidad financiera utilizada por el Comprador para abonar el valor de una Orden (ej. tarjeta de crédito, tarjeta de débito, billetera digital).

**Modo de Voz**
Estado del Agente Inteligente en el que la entrada del usuario se recibe mediante audio y la respuesta se emite como audio sintetizado, en lugar de texto.

### N

**Notificación**
Mensaje enviado por el sistema a un usuario para informar sobre un evento relevante (nueva Orden, cambio de estado, etc.).

### O

**Orden**
Registro formal de una transacción de compra completada. Incluye los productos adquiridos, cantidades, precios, datos del Comprador, datos del Vendedor y estado de la transacción.

**Ordenamiento**
Criterio aplicado sobre el conjunto de resultados activo para organizarlos en una secuencia determinada. Los criterios soportados son: precio ascendente, precio descendente, calificación, relevancia y novedad.

### P

**Pasarela de Pago**
Servicio externo que procesa las transacciones financieras entre Compradores y Vendedores. Es un actor externo del sistema.

**Publicación**
Registro creado por un Vendedor en el Catálogo para poner un producto a disposición de los Compradores. Incluye nombre, descripción, precio, categoría, stock e imágenes.

### R

**Restricción**
Condición limitante expresada por el usuario en una instrucción que el Agente Inteligente debe aplicar al ejecutar la Acción. Ejemplos: "con envío gratis", "menor a $50", "solo Nike", "en stock".

**Resultado**
Conjunto de productos retornados por el sistema en respuesta a una instrucción de búsqueda. El Resultado activo es el último conjunto de productos sobre el que operan los filtros, el ordenamiento y la comparación.

**Rol**
Conjunto de permisos y responsabilidades asignados a un usuario dentro del Marketplace. Los roles son: Visitante, Comprador, Vendedor, Administrador.

### S

**Sesión**
Período activo de interacción de un usuario autenticado con el Marketplace. El Agente Inteligente mantiene el Contexto de Sesión durante este período.

**Stock**
Cantidad disponible de unidades de un producto registrada en una Publicación.

**STT (Speech-to-Text)**
Servicio externo que convierte el audio de voz del usuario en texto para ser procesado por el Agente Inteligente.

### T

**TTS (Text-to-Speech)**
Servicio externo que convierte el texto de las respuestas del Agente Inteligente en audio de voz para ser reproducido al usuario.

**Trazabilidad**
Capacidad de vincular cada requisito con los objetivos que lo motivan, las reglas de negocio que lo rigen, y los casos de uso que lo implementan.

### U

**Usuario**
Término genérico que engloba a todos los actores humanos que interactúan con el Marketplace: Visitante, Comprador, Vendedor y Administrador.

### V

**Vendedor**
Actor interno registrado en el Marketplace cuyo objetivo es publicar y vender productos a los Compradores.

**Verificación de Disponibilidad**
Proceso mediante el cual el Marketplace comprueba que los productos del Carrito tienen Stock suficiente antes de procesar el pago.

**Vista Comparativa**
Presentación estructurada que muestra los Atributos de Producto de dos o más productos en paralelo para facilitar la toma de decisión del Comprador.

**Visitante**
Actor interno no autenticado que puede explorar el Catálogo del Marketplace sin realizar transacciones.
