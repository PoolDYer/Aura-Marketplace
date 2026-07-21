# Aura Marketplace — Índice General de Especificaciones

## Descripción del Proyecto

El **Aura Marketplace** es una plataforma de comercio electrónico multidireccional de nueva generación que integra un Agente Inteligente capaz de comprender instrucciones en lenguaje natural (texto y voz) y ejecutar acciones funcionales dentro del sistema en nombre del usuario, tales como la búsqueda de productos, comparación, gestión de carrito y automatización de compras. Este repositorio de documentación contiene la especificación de requisitos del sistema.

---

## Estructura de Documentos

| Archivo | Título | Descripción |
|---|---|---|
| `00-README.md` | Índice General | Este documento. Mapa de navegación y relación entre documentos. |
| `01-Vision.md` | Visión del Producto | Problema, oportunidad, propuesta de valor, objetivos estratégicos y riesgos. |
| `02-Stakeholders.md` | Partes Interesadas | Todos los actores internos y externos con sus intereses y expectativas. |
| `03-Glosario.md` | Glosario del Dominio | Definición formal de todos los conceptos y términos utilizados en la especificación. |
| `04-Alcance.md` | Alcance del Sistema | Qué hace y qué no hace el sistema según la implementación actual. |
| `05-Objetivos.md` | Objetivos del Sistema | Objetivo general, objetivos específicos, resultados esperados e indicadores de éxito. |
| `06-ReglasNegocio.md` | Reglas de Negocio | Reglas que rigen el comportamiento transaccional y operativo del sistema. |
| `07-RequisitosFuncionales.md` | Requisitos Funcionales | Descripción detallada de todo lo que el sistema hace, por actor y módulo. |
| `08-RequisitosNoFuncionales.md` | Requisitos No Funcionales | Restricciones de calidad implementadas: rendimiento, seguridad, disponibilidad y más. |
| `09-Actores.md` | Actores del Sistema | Roles, permisos y responsabilidades de los actores (Comprador, Vendedor, Administrador). |
| `10-HistoriasUsuarioResumen.md` | Catálogo de Historias de Usuario | Inventario de todas las historias de usuario con sus prioridades. |
| `11-CriteriosAceptacion.md` | Criterios de Aceptación | Criterios en formato Given/When/Then basados en el comportamiento real del sistema. |
| `12-MatrizTrazabilidad.md` | Matriz de Trazabilidad | Relación entre Objetivos → Requisitos → Reglas de Negocio → Historias de Usuario. |

---

## Relación entre Documentos

```
01-Vision
    └── motiva →  05-Objetivos
                      └── se detallan en → 07-RequisitosFuncionales
                                               └── rigen → 06-ReglasNegocio
                                               └── ejecutan → 09-Actores
                                               └── se prueban → 11-CriteriosAceptacion
                                               └── se consolidan → 10-HistoriasUsuarioResumen
02-Stakeholders
    └── definen → 09-Actores
03-Glosario
    └── define términos usados en → todos los documentos
04-Alcance
    └── delimita → 07-RequisitosFuncionales y 08-RequisitosNoFuncionales
08-RequisitosNoFuncionales
    └── complementa → 07-RequisitosFuncionales
12-MatrizTrazabilidad
    └── consolida → todos los documentos anteriores
```

---

## Convenciones de Identificadores

| Prefijo | Tipo de elemento | Ejemplo |
|---|---|---|
| `OBJ-` | Objetivo | `OBJ-01` |
| `RF-` | Requisito Funcional | `RF-01` |
| `RNF-` | Requisito No Funcional | `RNF-01` |
| `RN-` | Regla de Negocio | `RN-01` |
| `HU-` | Historia de Usuario | `HU-01` |
| `CA-` | Criterio de Aceptación | `CA-RF01-01` |
| `ACT-` | Actor | `ACT-01` |

---

## Estado del Documento

| Campo | Valor |
|---|---|
| Versión | 1.0 |
| Estado | Alineado con la implementación real |
| Última actualización | 14 de Julio de 2026 |
| Idioma | Español |
| Propósito | Especificación técnica del sistema Aura Marketplace |
| Nivel de detalle | Requisitos (¿Qué?) — Basado en la implementación de producción |
