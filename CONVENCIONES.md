# Convenciones de Código — Learn English UNAJMA

## Nomenclatura (CQ12)

**Regla general**: **Inglés** para todo código (variables, funciones, tipos, columnas DB). El proyecto enseña inglés; el código debe ser coherente.

| Elemento | Convención | Ejemplo |
|----------|------------|---------|
| Variables / funciones | `camelCase` inglés | `currentUser`, `handleSaveLesson` |
| Tipos / interfaces | `PascalCase` inglés | `Lesson`, `GrammarSegment` |
| Constantes | `UPPER_SNAKE_CASE` inglés | `PASS_THRESHOLD`, `DEFAULT_LESSONS` |
| Columnas BD | `snake_case` inglés | `lesson_title`, `student_name` |
| Archivos | `kebab-case` inglés | `supabase-service.ts`, `grammar-segments.ts` |
| Componentes React | `PascalCase` inglés | `TeacherForm.tsx`, `GradeResult.tsx` |
| Hooks | `use` + `PascalCase` inglés | `useTeacherForm`, `useSpeechRecognition` |

**Excepciones permitidas**: Strings visibles al usuario (labels, mensajes) en español.

---

## Comentarios JSDoc (CQ13)

**Estándar**: JSDoc en **funciones públicas exportadas** y **tipos/interfaces públicas**. Nada en implementación obvia.

### Qué documentar
- Funciones exportadas (`export function ...`)
- Tipos/interfaces exportados (`export interface ...`)
- Hooks personalizados (`export function useXxx()`)
- Componentes exportados
- Utilidades complejas con lógica no obvia

### Qué NO documentar
- Funciones privadas internas
- Setters/getters triviales
- Código autoexplicativo (`const x = y + 1`)

### Plantilla JSDoc

```ts
/**
 * Descripción breve (1 línea) de qué hace la función.
 *
 * Descripción extendida si la lógica no es obvia — parámetros, efectos secundarios,
 * valor de retorno, casos边缘.
 *
 * @param paramName - Descripción del parámetro
 * @returns Descripción del valor de retorno
 * @throws Descripción de errores que puede lanzar
 */
export function miFuncion(paramName: Tipo): Retorno { ... }
```

### Ejemplo aplicado en nuevos archivos (Fase 2)
- `src/lib/tipos.ts` — interfaces con JSDoc
- `src/lib/calificaciones.ts` — funciones exportadas con JSDoc
- `src/lib/lecciones.ts` — funciones exportadas con JSDoc
- `src/utils/speech.ts` — funciones exportadas con JSDoc
- `src/hooks/useTeacherForm.ts` — hook con JSDoc
- `src/hooks/useSpeechRecognition.ts` — hook con JSDoc

---

## Separación de Responsabilidades

- **Dominio** (`src/types.ts`) — tipos puros de la aplicación
- **Datos/Infra** (`src/lib/`) — mapeo BD ↔ dominio, sin lógica de negocio
- **UI/Estado** (`src/hooks/`, `src/context/`) — solo lógica de presentación
- **Utilidades** (`src/utils/`) — funciones puras, sin side effects

---

## React Patterns

- `useCallback` con **functional updates** (`setX(prev => ...)`) para evitar dependencias mutables
- `useMemo` / `React.memo` solo cuando hay beneficio medido
- Un hook = una responsabilidad (SRP)
- Contextos particionados por dominio (Auth, Lessons, TeacherForm, Walkthrough)

---

## Supabase

- Queries en batch (`.in()`) en lugar de N+1
- Tipos internos (`*Row`) separados de tipos de dominio
- Transacciones / RPC para escrituras multi-tabla críticas
- RLS habilitado en producción (fase 7)

---

## Git / Commits

- **Conventional Commits**: `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`
- No "Co-Authored-By" ni atribución IA
- No build automático en commit