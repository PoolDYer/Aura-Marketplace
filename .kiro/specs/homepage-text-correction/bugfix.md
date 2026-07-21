# Bugfix Requirements Document

## Introduction

Este bugfix corrige el texto del encabezado principal en la página de inicio (HomePage) del sistema Aura Commerce. El texto actual incluye la palabra "reales" que debe ser eliminada para hacer el mensaje más conciso y alineado con la estrategia de marketing. El cambio afecta únicamente al contenido textual del componente hero de la página principal, sin modificar ninguna funcionalidad del sistema.

**Archivo afectado:** `frontend/src/pages/HomePage.tsx` (línea 154)

**Impacto:** Bajo - cambio cosmético en contenido de UI sin impacto funcional.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN un usuario accede a la página principal (HomePage) THEN el sistema muestra el texto "Explora productos reales publicados en Aura." en el encabezado hero

1.2 WHEN el contenido del encabezado se renderiza THEN la palabra "reales" aparece innecesariamente en el mensaje principal

### Expected Behavior (Correct)

2.1 WHEN un usuario accede a la página principal (HomePage) THEN el sistema SHALL mostrar el texto "Explora productos publicados en Aura." sin la palabra "reales"

2.2 WHEN el contenido del encabezado se renderiza THEN el mensaje principal SHALL ser más conciso y alineado con la estrategia de marketing

### Unchanged Behavior (Regression Prevention)

3.1 WHEN se realiza el cambio de texto THEN el sistema SHALL CONTINUE TO mantener todos los estilos CSS aplicados al elemento h1 (font-auth-display, text-[32px], font-bold, etc.)

3.2 WHEN se realiza el cambio de texto THEN el sistema SHALL CONTINUE TO renderizar correctamente todos los demás elementos de la página (badges, productos destacados, footer, etc.)

3.3 WHEN el usuario interactúa con la página THEN el sistema SHALL CONTINUE TO responder a las búsquedas, navegación y acciones del carrito de manera idéntica

3.4 WHEN el componente se renderiza en diferentes tamaños de pantalla THEN el sistema SHALL CONTINUE TO aplicar correctamente las clases responsive (md:text-[56px], md:leading-[64px])

3.5 WHEN se accede a otras páginas del sistema THEN el sistema SHALL CONTINUE TO funcionar sin cambios (CatalogPage, ProductDetailPage, CartPage, etc.)
