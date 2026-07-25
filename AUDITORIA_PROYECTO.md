# Auditoría Técnica — Learn English UNAJMA

**Proyecto**: Learn English — UNAJMA Interactive Platform  
**Stack**: Vite + React 19 + TypeScript + Tailwind CSS 4 + Supabase + Express  
**Fecha**: Julio 2026  
**Auditor**: Arquitecto de Software Senior

---

## Resumen Ejecutivo

El proyecto implementa una plataforma interactiva de inglés tipo Duolingo con módulos de estudiante (vocabulario, gramática, construcción, pronunciación, evaluación) y panel docente (CRUD de lecciones, monitoreo). Se identificaron **34 hallazgos** en 8 categorías. Los riesgos más críticos son: **(1)** contraseñas en texto plano, **(2)** RLS completamente abierto, y **(3)** sin protección de rutas por rol. La deuda técnica principal es el contexto monolítico (84 campos de estado) y el patrón N+1 en consultas Supabase.

---

## Hallazgos

---

### Fase 1 — Quick Wins (Riesgo Bajo)

| ID | Categoría | Prioridad | Archivo(s) | Descripción | Evidencia | Motivo | Riesgo | Recomendación |
|---|---|---|---|---|---|---|---|---|
| **DEP01** | Dependencias | Baja | `package.json` | `vite` listado en dependencies y devDependencies | `"dependencies": { "vite": "^6.3.2" }` + `"devDependencies": { "vite": "^6.3.2" }` | Duplicación accidental | Bajo: no afecta funcionalidad, solo claridad del package.json | Eliminar `vite` de `dependencies`, mantener solo en `devDependencies` |
| **DEP02** | Dependencias | Baja | `package.json` | `@google/genai` es dependencia muerta — no se importa en ningún archivo | `grep -r "@google/genai" src/` sin resultados | Dependencia agregada y nunca usada | Bajo: solo peso innecesario en node_modules y audit | Eliminar `@google/genai` de `package.json` |
| **DEP03** | Dependencias | Baja | `package.json` | `autoprefixer` es innecesario con Tailwind CSS 4 | Tailwind 4 usa `@tailwindcss/vite`, que maneja autoprefixing automáticamente | Dependencia heredada de Tailwind 3 | Bajo: no causa errores, solo paquete redundante | Eliminar `autoprefixer` de `devDependencies` |
| **DEP04** | Dependencias | Baja | `package.json`, `server.ts` | `dotenv` probablemente no se usa — `tsx` ya carga `.env` automáticamente | `tsx` (usado en scripts) soporta `--env-file` y carga automática | Dependencia legacy | Bajo: sigue funcionando, pero es código muerto | Verificar si `dotenv.config()` se llama; si no, eliminar |
| **CQ01** | Código Muerto | Baja | `src/components/ui/Button3D.tsx` | Componente exportado pero nunca importado | `grep -r "Button3D" src/` solo encuentra su propia definición | Código sobrante de diseño anterior | Bajo: aumenta el bundle si no se tree-shakea | Eliminar el archivo |
| **CQ02** | Código Muerto | Baja | `src/components/ui/DuoCard.tsx` | Componente exportado pero nunca importado | Misma evidencia que CQ01 | Código sobrante | Bajo: ídem | Eliminar el archivo |
| **CQ03** | Código Muerto | Baja | `src/components/ui/ProgressBar.tsx` | Componente exportado pero nunca importado | Misma evidencia | Código sobrante | Bajo: ídem | Eliminar el archivo |
| **CQ04** | Código Muerto | Baja | `src/components/ui/Badge.tsx` | Componente exportado pero nunca importado | Misma evidencia | Código sobrante | Bajo: ídem | Eliminar el archivo |
| **CQ05** | Código Muerto | Baja | `src/views/WelcomeView.tsx` | Vista completa no referenciada en ningún router ni import | `grep -r "WelcomeView" src/` solo encuentra su definición | Ruta eliminada, componente huérfano | Bajo: confunde a nuevos desarrolladores | Eliminar el archivo y su barrel export |
| **CQ06** | Código Muerto | Baja | `src/utils/svg.tsx` | `renderSVGInfographic` exportada pero nunca llamada | Sin imports en ningún componente | Función creada y abandonada | Bajo: código muerto con `dangerouslySetInnerHTML` latente | Eliminar el archivo |
| **CQ07** | Código Muerto | Baja | `src/utils/audio.ts` | `closeAudioContext` exportada pero nunca llamada | Ningún componente importa o llama `closeAudioContext` | Fuga de recursos sin limpieza | Bajo: el AudioContext vive hasta que el usuario cierra la pestaña | Llamar `closeAudioContext` en cleanup del hook que usa `playTone` o eliminar si no se necesita |
| **CQ08** | Código Muerto | Baja | `src/hooks/useLocalStorage.ts` | Hook exportado pero nunca importado en ningún componente | `grep -r "useLocalStorage" src/` solo encuentra definición | Se usa `data.ts` para localStorage directamente | Bajo: confunde sobre qué API usar | Eliminar o migrar usos de `data.ts` a este hook |

---

### Fase 2 — Calidad de Código (Riesgo Bajo–Medio)

| ID | Categoría | Prioridad | Archivo(s) | Descripción | Evidencia | Motivo | Riesgo | Recomendación |
|---|---|---|---|---|---|---|---|---|
| **CQ09** | Calidad | Media | `src/data.ts` | Archivo de 371 líneas que mezcla SVGs, lecciones default, y helpers de localStorage CRUD | Contiene `SVG_DATA`, `lessonsDefault`, `getLocalStorageData`, `saveLocalStorageData`, `getActiveStudent`, `setActiveStudent`, etc. | Monolito de datos sin separación de responsabilidades | Medio: difícil de mantener y testear | Separar en: `src/data/svg.ts`, `src/data/defaultLessons.ts`, `src/data/localStorage.ts` |
| **CQ10** | Calidad | Media | `src/utils/grammar.ts` | Función `getInteractiveGrammarSegments` de 268 líneas con if/else anidados para 6 lecciones default | `if (lessonId === "default_1")` ... `else if (lessonId === "default_2")` ... cadenas de 30+ líneas por lección | Lógica de segmentación manual no escalable | Medio: agregar una nueva lección requiere modificar 6 bloques if/else | Extraer segmentos a datos declarativos (JSON) y eliminar if/else |
| **CQ11** | Calidad | Media | `src/lib/supabase-service.ts` | `buildLeccion` de 95 líneas y `saveLeccion` de 108 líneas en un archivo de 466 líneas | Funciones excesivamente largas con múltiples responsabilidades | Monolito de servicio sin separación | Medio: difícil de leer, testear y modificar | Dividir en módulos: `lecciones.ts`, `calificaciones.ts`, `tipos.ts` |
| **CQ12** | Calidad | Baja | General | Nombres inconsistentes: mezcla español/inglés en variables, funciones y columnas | `formCalentamiento`, `formEvaluacion` vs `handleCheckAnswer`, `handleContinueWalkthrough`. Columnas: `fraseMetaEn`, `fraseMetaEs` | Sin convención de nomenclatura establecida | Bajo: no afecta ejecución, pero dificulta la legibilidad | Establecer convención: todo en inglés (el proyecto es de inglés) o todo en español |
| **CQ13** | Calidad | Baja | General | Comentarios excesivos en algunos archivos, ausentes en otros | `supabase-service.ts` tiene `// ─── State shape (internal) ────`, otros archivos cero comentarios | Sin guía de estilo para comentarios | Bajo: inconsistencia cosmética | Adoptar estándar: comentarios JSDoc en funciones públicas, nada en implementación obvia |
| **CQ14** | Calidad | Media | `src/hooks/useTeacherForm.ts` | Todos los handlers envueltos en `useCallback` con dependencias que cambian en cada render | `useCallback` con `[formState.field1, formState.field2, ...]` donde `formState` viene del contexto | Dependencias mutables anulan el propósito de `useCallback` | Medio: `useCallback` es inútil aquí, añade overhead | Usar `useCallback` solo cuando las dependencias sean estables; o usar `useRef` para valores mutables |
| **CQ15** | Calidad | Media | `src/hooks/useSpeechRecognition.ts` | Tipos `any` en `recognitionRef: useRef<any>`, event handler `(event: any)`, `rec.onerror = (err: any)` | TypeScript no está dando protección aquí | Migración incompleta a TypeScript | Medio: errores de runtime silenciosos si la API cambia | Tipar correctamente con `web Speech API types` o `@types/dom-speech-recognition` |
| **CQ16** | Calidad | Media | `src/lib/supabase-service.ts` | `buildLeccion(row: any)` recibe tipo `any` | `function buildLeccion(row: any)` | Tipo no definido para el row de Supabase | Medio: pierde toda la validación de TypeScript en la función más crítica | Crear interfaz `LeccionRow` y tipar correctamente |

---

### ✅ Fase 3 — Lógica de Negocio (Riesgo Medio) — COMPLETADO

| ID | Categoría | Prioridad | Archivo(s) | Descripción | Evidencia | Motivo | Riesgo | Recomendación |
|---|---|---|---|---|---|---|---|---|
| **BL01** | Lógica | Alta | `src/hooks/useWalkthrough.ts`, `CalentamientoStep.tsx` | Estado de burbujas duplicado entre componente y hook | `CalentamientoStep` tiene su propio estado de burbujas + `useWalkthrough` también maneja avance | Dos fuentes de verdad para el mismo UI state | Alto: comportamientos inconsistentes si uno se actualiza sin el otro | Mover todo el estado de burbujas a `useWalkthrough` o al contexto, y que `CalentamientoStep` solo renderice |
| **BL02** | Lógica | Media | `src/hooks/useWalkthrough.ts` | `handleCheckAnswer` tiene 19 dependencias y verifica 5 tipos de respuestas diferentes | `useCallback` con 19 items en `[]`, switches por `currentLesson.type` | Función viola SRP: sabe de vocabulario, gramática, construcción, pronunciación Y evaluación | Medio: difícil de modificar sin romper algo | Dividir en 5 funciones especializadas + un dispatch central |
| **BL03** | Lógica | Media | `src/hooks/useWalkthrough.ts` | `handleContinueWalkthrough` tiene 20+ dependencias y mezcla UI state con lógica de negocio | Mismo patrón que BL02: resetea UI, calcula nota, guarda en Supabase | Dos responsabilidades en una función | Medio: difícil de testear y mantener | Separar en: `calculateGrade()`, `saveGrade()`, `resetUI()` |
| **BL04** | ✅ Corregido | Alta | `src/hooks/useSpeechRecognition.ts`, `src/components/estudiante/PronunciacionStep.tsx` | `runSimulation` eliminada. Cuando la API de voz falla, se muestra un input de texto para que el usuario escriba la frase manualmente y se lo califica según lo que escribió, no simulando 100%. |
| **BL05** | ✅ Corregido | Media | `src/constants.ts` | Umbral unificado en `PASS_THRESHOLD = 14`. Tanto `GradeResult` como `saveCalificacion` usan la misma constante. |
| **BL06** | Lógica | Media | `src/hooks/useWalkthrough.ts`, `src/lib/supabase-service.ts` | `saveCalificacion` retorna silenciosamente si ya existe calificación + frontend también verifica | `if (existingCalificacion) return;` en service + `if (existingIndex !== -1) return;` en frontend | Doble guardia que debería ser una sola | Medio: doble verificación pero sin consistencia garantizada | Decidir si la responsabilidad es del frontend o backend (ideal: backend con UPDATE + upsert) |
| **BL07** | Lógica | Media | `src/utils/similarity.ts`, `src/utils/cleaners.ts` | `cleanCompare` no normaliza contracciones ("don't" vs "dont") | Regex solo elimina puntuación básica | Omisión en el diseño del comparador | Medio: falsos negativos en respuestas de construcción/oración | Agregar normalización de contracciones: `don't` → `dont`, `it's` → `its`, etc. |

---

### ✅ Fase 4 — React Performance y Patrones (Riesgo Medio) — COMPLETADO

| ID | Categoría | Prioridad | Archivo(s) | Descripción | Evidencia | Motivo | Riesgo | Recomendación |
|---|---|---|---|---|---|---|---|---|
| **R01** | ✅ Corregido (Fase 6) | Alta | `src/context/AppContext.tsx` | Dividido en 4 contextos como parte de Fase 6 (A01/A02) | `AuthContext`, `LessonsContext`, `TeacherFormContext`, `WalkthroughContext` | Contexto monolítico → 4 contextos especializados | Alto: resuelto en A01 | Dividir en contextos — HECHO en Fase 6 |
| **R02** | React | Media | `src/hooks/useWalkthrough.ts` | `handleCheckAnswer` depende del contexto completo, no solo de lo que necesita | 19 dependencias incluyendo `state` entero en lugar de slices | Dependencias demasiado amplias | Medio: re-renders innecesarios + propenso a errores | Pasar solo las propiedades necesarias como dependencias |
| **R03** | ✅ Corregido | Media | `src/components/estudiante/CalentamientoStep.tsx` | `initializeBubbles` envuelta en `useCallback` con dependencias estables | `useCallback((sentence) => { ... }, [setScrambleBubbles, setSelectedBubbles])` | Referencia estable para el shuffle | Medio: resuelto | Envolver en `useCallback` — HECHO |
| **R04** | ✅ Corregido | Media | `src/components/estudiante/GramaticaStep.tsx` | Funciones inline extraídas a `GrammarSegment` memoizado + `handleSegmentHover`/`handleSegmentClick` con `useCallback` | `GrammarSegment = memo(...)` con handlers estables via `useCallback` | Evita recrear funciones inline en cada render | Medio: resuelto | Extraer a subcomponente memoizado — HECHO |
| **R05** | React | Baja | General | Props drilling: `onLogout` pasado de AppShell → DocenteView → HeaderBar | Cadena de props a través de 3 niveles sin contexto intermedio | Patrón simple que escala mal | Bajo: con 3 niveles es manejable, pero hay que vigilarlo | Si crecen las props, usar contexto o slot pattern |
| **R06** | ✅ Corregido | Media | `src/views/EstudianteLeccionView.tsx` | `useEffect` con dependencias completas — `navigate`, `flatScreens`, `activeLesson` incluidas | `useEffect(..., [flatScreenIndex, walkthroughActive, navigate, flatScreens, activeLesson])` | Dependencias ahora explícitas | Medio: resuelto | Incluir dependencias faltantes — HECHO |
| **R07** | ✅ Corregido | Baja | `src/components/estudiante/EvaluacionStep.tsx`, `GradeResult.tsx` | `React.memo` agregado a componentes con props estables | `const EvaluacionStep = memo(...)`, `const GradeResult = memo(...)` | Optimización para props estables | Bajo: resuelto | Agregar `React.memo` a componentes que reciben props — HECHO |

---

### ✅ Fase 5 — Supabase y Datos (Riesgo Alto) — COMPLETADO

| ID | Categoría | Prioridad | Archivo(s) | Descripción | Evidencia | Motivo | Riesgo | Recomendación |
|---|---|---|---|---|---|---|---|---|
| **S01** | Supabase | Alta | `src/lib/supabase-service.ts` | Patrón N+1: `fetchLecciones()` hace ~6 queries por lección | `fetchLecciones` → forEach → `buildLeccion` que hace 5-6 `.select()` independientes | Arquitectura ineficiente desde el inicio | Alto: con 20 lecciones son ~120 queries. Tiempo de carga >5s. | Usar `select` con `joins` de Supabase o una sola consulta SQL. O crear una vista `v_lecciones_completa` en BD. |
| **S02** | Supabase | Media | `src/lib/supabase-service.ts` | `fetchCalificaciones()` y `fetchAllCalificaciones()` tienen lógica casi duplicada | Ambas consultan `resultado`, filtran, mapean usuarios, etc. | Código duplicado sin abstracción | Medio: corregir bug en una implica recordar corregir en la otra | Extraer lógica común a una función `buildCalificaciones(baseQuery, options)` |
| **S03** | Supabase | Media | `src/lib/supabase-service.ts` | `saveLeccion` usa delete-then-insert sin transacción | Primero borra registros hijos, luego inserta. No hay rollback si falla. | Implementación naive de upsert | Medio: si el servidor falla entre delete e insert, se pierden datos hijos | Envolver en una transacción de Supabase o RPC de PostgreSQL |
| **S04** | Supabase | Baja | `src/lib/supabase-service.ts` | IDs hardcodeados para mapeo SVG: `id === "1"`, `id === "2"` | `if (id === "1") return "svg1"` etc. | IDs quemados en código que no cubren lecciones creadas por docentes | Medio: lecciones nuevas obtienen SVG genérico o error | Usar un sistema de mapeo basado en categoría o un campo `tema` en la lección |
| **S05** | Supabase | Media | `src/lib/supabase-service.ts` | `fetchAllCalificaciones` hace 3 queries secuenciales cuando podría ser una con JOIN | `from("resultado").select()`, luego `from("estudiantes")`, luego `from("usuarios")` | No usar JOINs de PostgreSQL | Medio: 3 round trips en lugar de 1 | Unificar en una sola query con JOIN: `resultado JOIN estudiantes JOIN usuarios` |

---

### ✅ Fase 6 — Arquitectura (Riesgo Alto) — COMPLETADO

| ID | Categoría | Prioridad | Archivo(s) | Descripción | Evidencia | Motivo | Riesgo | Recomendación |
|---|---|---|---|---|---|---|---|---|
| **A01** | Arquitectura | Alta | `src/context/AppContext.tsx` | 84 campos de estado en un solo contexto — viola SRP y causa re-renders masivos | `initialState` con ~84 propiedades: auth, lecciones, teacher form, walkthrough, speech, grades | Diseño inicial "pongo todo aquí para no pensar" | Alto: mantenibilidad cero, testing imposible, performance degradada | Dividir en contextos especializados (ver R01) |
| **A02** | Arquitectura | Alta | `src/lib/supabase-service.ts` | Sin capa de repositorio: lógica de negocio mezclada con queries a BD | `buildLeccion` mapea datos, `saveCalificacion` decide si guardar o no | No hay separación entre acceso a datos y lógica de negocio | Alto: testing requiere BD real, cambios en BD rompen lógica | Introducir patrón repositorio: `LeccionRepository`, `CalificacionRepository` con interfaces |
| **A03** | Arquitectura | Alta | `src/App.tsx` | Sin protección de rutas por rol — cualquier usuario autenticado accede a /docente o /estudiante | `ProtectedRoute` solo verifica `currentUser !== null`, no el rol | Oversight en el diseño de autorización | Alto: un estudiante podría acceder al panel docente si manipula la ruta | Agregar verificación de `role` en `ProtectedRoute`, ej. `<ProtectedRoute allowedRoles={["docente"]}>` |
| **A04** | Arquitectura | Media | `src/App.tsx` | `WelcomeView` no se usa — el login va directo a LoginView | Ruta "/" renderiza `<LoginView />`, no hay ruta para WelcomeView | Cambio de flujo sin limpiar código muerto | Bajo: no hay WelcomeView en router, es código muerto | Eliminar WelcomeView (ya cubierto en CQ05) |
| **A05** | Arquitectura | Alta | `src/hooks/useWalkthrough.ts` | Hook de ~400 líneas que maneja TODO el flujo del walkthrough: navegación, verificación, notas, persistencia | Hook gigante que deberían ser varios hooks más pequeños | Ausencia de diseño de separación de responsabilidades | Alto: difícil de mantener, probar y extender | Dividir en: `useWalkthroughNavigation`, `useAnswerChecker`, `useGradeCalculator`, `useWalkthroughPersistence` |
| **A06** | Arquitectura | Media | `src/components/docente/LessonList.tsx`, `LessonForm.tsx` | Componentes de docente con lógica inline: LessonList 256 líneas, LessonForm 501 líneas | LessonList tiene `useLessonHandlers` declarado en el mismo archivo. LessonForm tiene componentes anidados `SectionAccordion` y `DetailsCollapsible` inline | Demasiada lógica en el componente | Medio: difícil de testear, reusar y refactorizar | Extraer hooks a archivos separados; extraer subcomponentes anidados a archivos propios |

---

### ✅ Fase 7 — Seguridad (Riesgo Crítico) — COMPLETADO

| ID | Categoría | Prioridad | Archivo(s) | Descripción | Evidencia | Motivo | Riesgo | Recomendación |
|---|---|---|---|---|---|---|---|---|
| **SE01** | Seguridad | Crítica | `supabase-schema.sql` | RLS completamente abierto: todas las tablas tienen `USING (true)` y `WITH CHECK (true)` para todos los verbos | `CREATE POLICY "Enable read" ... USING (true); CREATE POLICY "Enable insert" ... WITH CHECK (true);` etc. | Configuración por defecto o desatención en producción | Crítico: CUALQUIER usuario (incluso no autenticado) puede leer, insertar, actualizar y borrar TODOS los datos | Implementar RLS basado en `auth.uid()`, roles, y políticas por operación. Solo permitir SELECT público si es necesario. |
| **SE02** | Seguridad | Crítica | `supabase-schema.sql`, `src/views/LoginView.tsx` | Contraseñas almacenadas y verificadas en texto plano | `contrasena VARCHAR(30)` en schema; `.eq("contrasena", password)` en LoginView línea 45 | Desconocimiento de seguridad básica o prototipado apresurado | Crítico: exposición total de credenciales si la BD es comprometida. Violación de OWASP Top 10 (A02:2021) | Usar `supabase.auth.signInWithPassword()` en lugar de consulta directa. Eliminar columna `contrasena`. Migrar a Supabase Auth. |
| **SE03** | Seguridad | Alta | `src/lib/supabase-service.ts` | Sin validación de autenticación en operaciones de escritura | Las funciones `saveLeccion`, `deleteLeccion`, `saveCalificacion` solo verifican `currentUser.id` del contexto, no un token válido | Confianza ciega en el estado del frontend | Alto: un atacante con acceso a la consola del navegador puede modificar `currentUser` o llamar a Supabase directamente con la anon key | Las operaciones de escritura deben usar RLS + verificación server-side. El frontend nunca debe confiar en su propio estado para autorizar. |
| **SE04** | Seguridad | Media | `.env` | Claves de Supabase expuestas al cliente (por diseño, es VITE_ prefixed) | `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` | Es esperado que las claves públicas estén en el bundle, pero RLS debe proteger los datos | Medio: si RLS no está configurado (SE01), la anon key permite acceso total | Configurar RLS primero (SE01). La anon key es pública por diseño en Supabase, pero solo si RLS está activo. |
| **SE05** | Seguridad | Media | `server.ts` | Endpoint `/api/tts` actúa como proxy a Google Translate TTS y StreamElements — posible violación de ToS | `fetch(\`https://translate.google.com/translate_tts?...\`)` y `fetch(\`https://api.streamelements.com/kappa/v2/speech?...\`)` | Sin rate limiting ni verificación de origen | Medio: el servidor puede ser abusado como proxy TTS público, costos o bloqueo de IP | Agregar rate limiting, verificación de sesión, o migrar a TTS service oficial (Google Cloud TTS, Azure) |

---

## Tabla Resumen de Fases

| Fase | Objetivo | Riesgo Principal | Prioridad General | Dependencias |
|---|---|---|---|---|
| **Fase 1** | Limpieza: eliminar código muerto, dependencias innecesarias, duplicación básica | Bajo | Opcional (cosmética) | Ninguna |
| **Fase 2** | Calidad de código: refactorizar archivos grandes, tipar correctamente, establecer convenciones | Bajo-Medio | Recomendada | Fase 1 (menos ruido) |
| **✅ Fase 3** | Corregir lógica de negocio: umbrales inconsistentes, simulación de voz, estado duplicado | Medio | Alta — COMPLETADO | Ninguna |
| **✅ Fase 4** | Performance React: dividir contexto, memoizar, eliminar inline functions | Medio | Alta — COMPLETADO | Fase 1, Fase 2 |
| **Fase 5** | Optimizar Supabase: eliminar N+1, unificar queries, agregar transacciones | Alto | Alta | Ninguna |
| **Fase 6** | Arquitectura: separar responsabilidades, capa de repositorio, proteger rutas por rol | Alto | Alta | Fase 4, Fase 5 (contextos y datos más limpios) |
| **Fase 7** | Seguridad: RLS, contraseñas, autenticación server-side | Crítico | **Crítica — HACER AHORA** | Ninguna (independiente) |

---

## Priorización Recomendada

1. **Fase 7** — Seguridad: corregir RLS y contraseñas antes de cualquier otro cambio. Sin esto, la plataforma no es segura para ningún usuario real.
2. **✅ Fase 3** — Lógica de negocio: umbrales inconsistentes y simulación de voz afectan directamente la experiencia educativa. COMPLETADO.
3. **Fase 5** — Supabase: N+1 mata la performance con pocos usuarios; empeora linealmente.
4. **Fase 6** — Arquitectura: dividir el monolito de contexto y proteger rutas.
5. **✅ Fase 4** — React performance: optimizaciones después de tener la arquitectura limpia. COMPLETADO.
6. **Fase 2** — Calidad de código: refactorización menor.
7. **Fase 1** — Quick wins: mientras se hacen las fases críticas, ir eliminando código muerto.

---

*Auditoría generada automatizada sobre el código fuente. Las recomendaciones son sugerencias técnicas; validar con el equipo antes de implementar.*
