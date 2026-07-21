# Homepage Text Correction Bugfix Design

## Overview

Este bugfix elimina la palabra "reales" del texto principal del hero en la página de inicio (HomePage). El cambio convierte el texto de "Explora productos reales publicados en Aura." a "Explora productos publicados en Aura." para hacer el mensaje más conciso y alineado con la estrategia de marketing. Es un cambio puramente cosmético que afecta una única línea de texto JSX sin modificar estilos, funcionalidad o estructura del componente.

**Impacto:** Bajo - modificación de string de presentación sin cambios funcionales.

## Glossary

- **Bug_Condition (C)**: La condición que identifica el bug - cuando el texto del hero contiene la palabra "reales"
- **Property (P)**: El comportamiento deseado - el texto del hero debe ser "Explora productos publicados en Aura." sin la palabra "reales"
- **Preservation**: Todos los estilos CSS, comportamiento responsive y funcionalidad de la HomePage deben permanecer idénticos
- **Hero Section**: La sección principal de la página con el encabezado grande (`h1`) y texto descriptivo
- **HomePage Component**: Componente React ubicado en `frontend/src/pages/HomePage.tsx` que renderiza la página principal

## Bug Details

### Bug Condition

El bug se manifiesta cuando el usuario accede a la página principal y el encabezado hero muestra un texto más largo de lo deseado. El texto actual incluye la palabra "reales" que añade redundancia al mensaje principal.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type ReactElement (rendered HomePage)
  OUTPUT: boolean
  
  RETURN input.heroHeading.textContent == "Explora productos reales publicados en Aura."
         AND input.heroHeading.includes("reales")
END FUNCTION
```

### Examples

- **Actual behavior**: Usuario accede a HomePage → ve texto "Explora productos reales publicados en Aura."
- **Expected behavior**: Usuario accede a HomePage → ve texto "Explora productos publicados en Aura."
- **Context**: El texto aparece en un `<h1>` con clases Tailwind específicas en la línea 154 del archivo
- **Edge case**: El texto se renderiza correctamente en todos los tamaños de pantalla (mobile y desktop) pero con contenido redundante

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Todas las clases CSS del elemento `h1` deben permanecer idénticas: `max-w-4xl font-auth-display text-[32px] font-bold leading-tight tracking-tight text-[#845400] md:text-[56px] md:leading-[64px]`
- El elemento `p` con el subtítulo debe permanecer sin cambios
- El badge superior con "Catalogo conectado a la base de datos" debe permanecer sin cambios
- Todos los demás elementos de la página (hero product card, stats card, featured products, footer) deben renderizarse idénticamente

**Scope:**
Todos los elementos HTML, estilos, lógica de negocio y funcionalidad de la HomePage que NO sean el string de texto en línea 154 deben permanecer completamente inalterados. Esto incluye:
- Clics en botones y navegación
- Carga de productos desde la API
- Manejo del carrito de compras
- Búsqueda de productos
- Responsive design y media queries
- Efectos hover y transiciones

## Hypothesized Root Cause

El texto actual fue escrito con un enfoque más descriptivo pero resultó ser redundante. La palabra "reales" no añade valor significativo al mensaje y hace el texto menos conciso. 

**Análisis:**
1. **No es un error técnico**: El código funciona correctamente, es un ajuste de contenido
2. **Decision de marketing**: El equipo de marketing decidió que el mensaje debe ser más directo
3. **Ubicación precisa**: Línea 154 en el archivo `frontend/src/pages/HomePage.tsx`
4. **Modificación trivial**: Solo requiere eliminar una palabra del string JSX

## Correctness Properties

Property 1: Bug Condition - Hero Text Simplification

_For any_ render of the HomePage component, the hero heading text SHALL be "Explora productos publicados en Aura." without the word "reales", providing a more concise marketing message.

**Validates: Requirements 2.1, 2.2**

Property 2: Preservation - Styling and Functionality

_For any_ user interaction or page render that does NOT involve reading the hero heading text (styling application, product loading, navigation, search, cart operations), the HomePage SHALL produce exactly the same behavior as the original code, preserving all existing functionality, CSS classes, and responsive behavior.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**

## Fix Implementation

### Changes Required

Modificar únicamente el string de texto JSX en el elemento `h1` del hero.

**File**: `frontend/src/pages/HomePage.tsx`

**Location**: Línea 154

**Specific Changes**:

1. **Texto del Hero Heading**: Modificar el contenido del elemento `h1`
   - **Antes**: `Explora productos reales publicados en Aura.`
   - **Después**: `Explora productos publicados en Aura.`
   - **Implementación**: Eliminar la palabra "reales " (incluyendo el espacio siguiente)

**Código actual (línea 154):**
```tsx
<h1 className="max-w-4xl font-auth-display text-[32px] font-bold leading-tight tracking-tight text-[#845400] md:text-[56px] md:leading-[64px]">
  Explora productos reales publicados en Aura.
</h1>
```

**Código modificado:**
```tsx
<h1 className="max-w-4xl font-auth-display text-[32px] font-bold leading-tight tracking-tight text-[#845400] md:text-[56px] md:leading-[64px]">
  Explora productos publicados en Aura.
</h1>
```

**Nota importante**: NO modificar ningún atributo, clase o propiedad del elemento `h1`. Solo cambiar el texto interno.

## Testing Strategy

### Validation Approach

La estrategia de testing sigue un enfoque de dos fases: primero, verificar que el texto actual contiene la palabra "reales" (confirmar el bug), luego verificar que el texto corregido no la contiene y que toda la funcionalidad permanece idéntica.

### Exploratory Bug Condition Checking

**Goal**: Confirmar que el texto actual contiene la palabra "reales" ANTES de implementar el fix. Documentar el estado actual del hero heading.

**Test Plan**: Realizar una prueba visual y/o snapshot test para capturar el texto actual del hero. Esto servirá como baseline para comparar después del fix.

**Test Cases**:
1. **Visual Inspection Test**: Acceder a `http://localhost:5173/` (o URL de desarrollo) y verificar visualmente que el texto dice "Explora productos reales publicados en Aura."
2. **Snapshot Test**: Capturar el HTML renderizado del hero section y confirmar que incluye "reales"
3. **Text Content Test**: Query el elemento `h1` y verificar que `textContent` incluye la palabra "reales"
4. **Desktop/Mobile Test**: Verificar que el texto se muestra correctamente en ambos tamaños de pantalla (confirma que el bug existe en todas las resoluciones)

**Expected Counterexamples**:
- El texto del hero contiene "Explora productos reales publicados en Aura."
- La palabra "reales" aparece entre "productos" y "publicados"

### Fix Checking

**Goal**: Verificar que después del cambio, el texto del hero no contiene la palabra "reales" y muestra el mensaje correcto.

**Pseudocode:**
```
FOR ALL render of HomePage DO
  heroText := getHeroHeadingText()
  ASSERT heroText == "Explora productos publicados en Aura."
  ASSERT NOT heroText.includes("reales")
END FOR
```

### Preservation Checking

**Goal**: Verificar que todos los aspectos de la HomePage que NO son el texto del hero permanecen idénticos al código original.

**Pseudocode:**
```
FOR ALL interaction WITH HomePage WHERE interaction != readHeroText DO
  ASSERT HomePage_original(interaction) = HomePage_fixed(interaction)
END FOR
```

**Testing Approach**: Visual regression testing y functional testing son recomendados porque:
- Permiten comparar el renderizado completo antes/después del cambio
- Detectan cambios accidentales en estilos o layout
- Verifican que la funcionalidad (búsqueda, navegación, carrito) sigue funcionando

**Test Plan**: Antes de hacer el cambio, documentar el comportamiento actual de todos los elementos que NO son el texto del hero. Después del cambio, verificar que son idénticos.

**Test Cases**:

1. **CSS Classes Preservation**: Verificar que el elemento `h1` mantiene exactamente las mismas clases Tailwind
   - Before fix: capturar `className` del `h1`
   - After fix: verificar que es idéntico

2. **Responsive Behavior Preservation**: Verificar que el texto se adapta correctamente en diferentes tamaños de pantalla
   - Desktop (≥768px): texto debe usar `md:text-[56px] md:leading-[64px]`
   - Mobile (<768px): texto debe usar `text-[32px]`

3. **Other Hero Elements Preservation**: Verificar que badge y párrafo de descripción no cambian
   - Badge text: "Catalogo conectado a la base de datos."
   - Paragraph text: "Lo que ves aqui sale directamente de las publicaciones activas registradas."

4. **Page Functionality Preservation**: Verificar que todas las funciones de la página siguen trabajando
   - Búsqueda de productos
   - Navegación al catálogo
   - Click en productos destacados
   - Agregar productos al carrito
   - Login/logout

5. **Visual Regression Test**: Capturar screenshot completo de la HomePage antes y después
   - Comparar que solo el texto del hero cambió
   - Verificar que layout, colores, espaciado permanecen idénticos

### Unit Tests

- Test que verifica que el texto del hero es "Explora productos publicados en Aura."
- Test que verifica que el texto NO contiene la palabra "reales"
- Test que verifica que las clases CSS del `h1` son correctas

### Property-Based Tests

No son necesarios para este bugfix dado que:
- El cambio es determinístico (un string constante)
- No hay lógica de negocio o transformaciones de datos
- No hay inputs variables que generar

Un simple snapshot test o assertion de string es suficiente.

### Integration Tests

- **Full Page Render Test**: Renderizar HomePage completa y verificar que el hero muestra el texto correcto
- **Navigation Flow Test**: Navegar desde HomePage a otras páginas (Catalog, Product Detail) y verificar que la navegación funciona
- **Search Integration Test**: Usar la búsqueda desde HomePage y verificar que los resultados se muestran correctamente
- **Visual Regression Test**: Comparar screenshots antes/después para confirmar que solo el texto del hero cambió
