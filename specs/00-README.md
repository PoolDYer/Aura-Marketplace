# Marketplace Inteligente Asistido por IA — Índice General

## Descripción del Proyecto

El **Marketplace Inteligente** es una plataforma de comercio electrónico que incorpora un Agente Inteligente capaz de comprender instrucciones en lenguaje natural (texto y voz) y ejecutar acciones funcionales dentro del sistema en nombre del usuario. Este repositorio de documentación contiene la especificación completa de requisitos del sistema, organizada en archivos temáticos independientes.

---

## Estructura de Documentos

| Archivo | Título | Descripción |
|---|---|---|
| `00-README.md` | Índice General | Este documento. Mapa de navegación y relación entre documentos. |
| `01-Vision.md` | Visión del Producto | Problema, oportunidad, propuesta de valor, objetivos estratégicos y riesgos. |
| `02-Stakeholders.md` | Partes Interesadas | Todos los actores internos y externos con sus intereses y expectativas. |
| `03-Glosario.md` | Glosario del Dominio | Definición formal de todos los conceptos y términos utilizados en la especificación. |
| `04-Alcance.md` | Alcance del Sistema | Qué hará y qué no hará el sistema. Límites, fronteras y dependencias externas. |
| `05-Objetivos.md` | Objetivos del Sistema | Objetivo general, objetivos específicos, resultados esperados e indicadores de éxito. |
| `06-ReglasNegocio.md` | Reglas de Negocio | Reglas que rigen el comportamiento del sistema con identificador, justificación y prioridad. |
| `07-RequisitosFuncionales.md` | Requisitos Funcionales | Descripción detallada de todo lo que el sistema debe hacer, por actor y módulo. |
| `08-RequisitosNoFuncionales.md` | Requisitos No Funcionales | Restricciones de calidad: rendimiento, seguridad, disponibilidad, accesibilidad y más. |
| `09-Actores.md` | Actores del Sistema | Roles, permisos, responsabilidades y restricciones de cada actor. |
| `10-CasosUsoResumen.md` | Catálogo de Casos de Uso | Inventario de todos los casos de uso con código, actor, descripción y prioridad. |
| `11-CriteriosAceptacion.md` | Criterios de Aceptación | Criterios consolidados en formato Given/When/Then para todos los requisitos. |
| `12-MatrizTrazabilidad.md` | Matriz de Trazabilidad | Relación entre Objetivos → Requisitos → Reglas de Negocio → Casos de Uso. |

---

## Relación entre Documentos

```
01-Vision
    └── motiva →  05-Objetivos
                      └── se detallan en → 07-RequisitosFuncionales
                                               └── rigen → 06-ReglasNegocio
                                               └── ejecutan → 09-Actores
                                               └── se prueban → 11-CriteriosAceptacion
                                               └── se consolidan → 10-CasosUsoResumen
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
| `CU-` | Caso de Uso | `CU-01` |
| `CA-` | Criterio de Aceptación | `CA-RF01-01` |
| `ACT-` | Actor | `ACT-01` |

---

## Estado del Documento

| Campo | Valor |
|---|---|
| Versión | 1.0 |
| Estado | Borrador para revisión |
| Idioma | Español |
| Propósito | Tesis de grado — Ingeniería de Sistemas |
| Nivel de detalle | Requisitos (¿Qué?) — Sin diseño ni implementación |
