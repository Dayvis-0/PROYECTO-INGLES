# Plan de Modularización — Plataforma de Inglés

## Objetivo

Dividir `App.tsx` (~2939 líneas) en componentes y módulos con responsabilidades claras, manteniendo la aplicación funcional en cada paso.

---

## Principios

- **Sin refactors masivos**: un paso a la vez, cada paso = app funcionando.
- **No cambiar lógica de negocio**: solo mover archivos. Si algo funciona, no se toca.
- **Primero estructura, después optimización**: primero separar archivos, luego mejorar si toca.
- **Commits pequeños y atómicos**: cada paso es un commit.

---

## Fase 0 — Preparación

### 0.1 Limpiar `node_modules/` del repo

Agregar `.gitignore` con `node_modules/`, `dist/`, `.env.local`.

### 0.2 Crear estructura de carpetas

```
src/
├── components/          # Componentes reutilizables
│   ├── ui/              # Botones, cards, badges (atómicos)
│   ├── docente/         # Componentes del panel docente
│   └── estudiante/      # Componentes del flujo estudiante
├── context/             # React Context para estado global
├── hooks/               # Custom hooks
├── utils/               # Funciones puras (Levenshtein, cleaners)
├── views/               # Las 5 vistas principales (cada una en su archivo)
│   ├── WelcomeView.tsx
│   ├── LoginView.tsx
│   ├── DocenteView.tsx
│   ├── EstudianteHomeView.tsx
│   └── EstudianteLeccionView.tsx
├── types.ts             # (ya existe)
├── data.ts              # (ya existe)
├── App.tsx              # Se reducirá a ~50 líneas
├── main.tsx
└── index.css
```

**Checkpoint:** estructura de carpetas creada, app sigue igual.

---

## Fase 1 — Extraer utilidades puras

De `App.tsx` a `src/utils/`:

| Función | Archivo destino |
|---------|----------------|
| `getWordLevenshtein(a, b)` | `utils/levenshtein.ts` |
| `isWordSimilarityMatch(wordA, wordB)` | `utils/similarity.ts` |
| `cleanCompare(s)` | `utils/cleaners.ts` |
| `speakWord(text)` (TTS) | `utils/tts.ts` |
| `startVoiceRecording(targetSentence)` (SpeechRecognition) | `utils/speech.ts` |
| `getInteractiveGrammarSegments(lesson)` | `utils/grammar.ts` |
| `renderSVGInfographic(imgStr)` | `utils/svg.ts` |

**Regla:** funciones puras o que solo usan APIs del browser (SpeechSynthesis, SpeechRecognition). Sin dependencia de estado de React.

**Checkpoint:** `App.tsx` importa funciones desde `utils/` en lugar de tenerlas inline. App funciona igual.

---

## Fase 2 — Extraer el context de estado global

Crear `src/context/AppContext.tsx` con un solo `AppProvider` que contenga **TODO el estado** que hoy vive en `useState` dentro de `App.tsx`.

Estado a mover:

```
// View & Routing
currentView, setCurrentView
selectedRole, setSelectedRole

// Auth
usernameInput, passwordInput, loginError, currentUser

// Database (lessons, calificaciones)
lessons, setLessons
calificaciones, setCalificaciones

// Teacher form state
formTitulo, formImagenGramatica, formFormulaGramatica, formFrasesPronunciacion
formCalentamiento, formEvaluacion, editingLessonId, teacherFormError, teacherTab
expandedStudents, formEjemploOracion, formEjemploRoles, formVocabularioDetallado

// Student walkthrough
walkthroughActive, activeLesson, flatScreens, flatScreenIndex
vistosVocabulario, keyboardMode, userTypedTranslation
selectedBubbles, scrambleBubbles, activeHoverGrammarWord
selectedExamOptionIndex, feedbackState, feedbackMessage, correctAnswerReveal
examCorrectCount, isListeningVoice, voiceTranscript, voiceSimilarity, speechError
gainedGrade, gainedCorrect

// Refs (NO van al context, se quedan en el componente que los usa)
recognitionRef  → se queda en utils/speech.ts o en el componente de voz
```

**NO** mover lógica — solo el estado. Los handlers (`handleLoginSubmit`, `handleCheckAnswer`, etc.) se quedan en `App.tsx` por ahora, pero acceden al estado via contexto.

**Checkpoint:** `App.tsx` envuelto en `<AppProvider>`, usa `useAppContext()` en lugar de `useState`. App funciona igual.

---

## Fase 3 — Extraer vistas en archivos separados

Cada vista condicional (`currentView === "welcome"`, etc.) se convierte en su propio archivo en `src/views/`.

| Vista | Archivo | Líneas aprox |
|-------|---------|-------------|
| Welcome | `views/WelcomeView.tsx` | ~60 |
| Login | `views/LoginView.tsx` | ~80 |
| Docente | `views/DocenteView.tsx` | ~740 |
| Estudiante Home | `views/EstudianteHomeView.tsx` | ~200 |
| Estudiante Lección | `views/EstudianteLeccionView.tsx` | ~800 |

### Reglas para la extracción:

1. Cada vista importa `useAppContext()` del context.
2. Cada vista recibe como props solo los handlers que necesita (si aplica).
3. **NO** tocar el JSX — solo moverlo a su archivo.
4. Los handlers **viajan con la vista** que los usa. Ej: `handleLoginSubmit` va con `LoginView`.

### Criterios para saber dónde va cada handler:

| Handler | Se queda en App o va con la vista |
|---------|----------------------------------|
| `handleLoginSubmit` | Va con `LoginView` |
| `handleLogout` | Se queda en App (lo usan Docente y Estudiante) → se pasa como prop |
| `handleSaveLesson` | Va con `DocenteView` |
| `handleEditLesson` | Va con `DocenteView` |
| `handleDeleteLesson` | Va con `DocenteView` |
| `handleToggleLesson` | Va con `DocenteView` |
| `handleAddWarmupRow` | Va con `DocenteView` |
| `launchActiveLesson` | Se queda en App o va a `EstudianteHomeView` |
| `handleCheckAnswer` | Va con `EstudianteLeccionView` |
| `handleContinueWalkthrough` | Va con `EstudianteLeccionView` |

### ¿Qué hacer con handlers compartidos?

Si un handler lo usan 2+ vistas → se queda en App como función normal y se pasa como prop al context o directamente.

**Checkpoint:** App.tsx reducido a:

```tsx
export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}

function AppShell() {
  const { currentView } = useAppContext();

  switch (currentView) {
    case "welcome": return <WelcomeView />;
    case "login": return <LoginView />;
    case "docente": return <DocenteView />;
    case "estudiante_home": return <EstudianteHomeView />;
    case "estudiante_leccion": return <EstudianteLeccionView />;
    default: return <WelcomeView />;
  }
}
```

App funciona igual. `App.tsx` pasó de 2939 a ~50 líneas.

---

## Fase 4 — Extraer componentes reutilizables

Del JSX actual, identificar elementos que se repiten:

### Componentes UI (`components/ui/`)

| Componente | Descripción | Origen en App.tsx |
|-----------|-------------|------------------|
| `Button3D` | Botón con efecto 3D (verde, azul, naranja, danger, gray) | Múltiples lugares |
| `DuoCard` | Contenedor con estilo Duolingo (border-bottom 6px, radius 20px) | Múltiples lugares |
| `ProgressBar` | Barra de progreso con porcentaje | EstudianteLeccion |
| `FeedbackBanner` | Panel verde/rojo de feedback | EstudianteLeccion |
| `Badge` | Badge pequeño (activa/inactiva, categoría) | Docente, Estudiante |
| `ModalConfirm` | Modal de confirmación (reemplazar `confirm()` de browser) | Múltiples |
| `HeaderBar` | Barra superior con título y botón de logout | Docente, EstudianteHome |

### Componentes de dominio (`components/docente/`, `components/estudiante/`)

| Componente | Descripción |
|-----------|-------------|
| `docente/LessonForm` | Formulario completo de creación/edición de lecciones |
| `docente/LessonList` | Lista de lecciones con toggle/editar/eliminar |
| `docente/MonitoringPanel` | Panel de monitoreo de alumnos |
| `estudiante/VocabularioStep` | Paso 1: tarjetas de vocabulario |
| `estudiante/GramaticaStep` | Paso 2: gramática interactiva |
| `estudiante/CalentamientoStep` | Paso 3: traducción burbujas/teclado |
| `estudiante/PronunciacionStep` | Paso 4: micrófono y pronunciación |
| `estudiante/EvaluacionStep` | Paso 5: examen de opción múltiple |
| `estudiante/GradeResult` | Pantalla de nota final (aprobado/reprobado) |

### Criterios para decidir si algo es componente:

1. **Se repite** visual o estructuralmente → componente UI
2. **Ocupa más de 50 líneas** de JSX → componente de dominio
3. **Tiene su propio estado local** (no del context) → componente
4. **Se puede probar de forma aislada** → componente

**Checkpoint:** App funciona igual, pero ahora los archivos son manejables y cada uno tiene una responsabilidad clara.

---

## Fase 5 — Extraer custom hooks

Para lógica compleja que hoy está mezclada con el render:

| Hook | Lógica | Origen |
|------|--------|--------|
| `useSpeechRecognition` | Manejo de Web Speech API, estado de grabación | `startVoiceRecording` |
| `useTeacherForm` | Validación y manejo del formulario docente | Handlers del form |
| `useWalkthrough` | Navegación entre pasos del estudiante | `handleCheckAnswer`, `handleContinueWalkthrough` |
| `useLocalStorage` | Sincronización con localStorage | `getStoredLessons`, `saveStoredLessons` |

**Checkpoint:** Lógica extraída, componentes más limpios.

---

## Fase 6 — Limpieza final

- Eliminar imports innecesarios en `App.tsx` (quedan solo los de vistas + context)
- Verificar que no haya fugas de estado (estado que debería estar en context pero está en un componente)
- Normalizar nombres de archivos (kebab-case vs PascalCase — elegir uno y mantener)
- Agregar barrel exports (`index.ts`) para imports limpios

---

## Resumen del plan

| Fase | Qué se hace | Impacto en App.tsx |
|------|------------|-------------------|
| 0 | Estructura de carpetas + .gitignore | Sin cambios |
| 1 | Extraer utilidades a `utils/` | -400 líneas |
| 2 | Crear AppContext | Sin cambios de líneas (se mueve el estado) |
| 3 | Extraer vistas a `views/` | -2500 líneas (~de 2939 a 50) |
| 4 | Extraer componentes reutilizables | Código más limpio en vistas |
| 5 | Extraer custom hooks | Lógica fuera del JSX |
| 6 | Limpieza y consistencia | Código profesional |

Cada fase **mantiene la app funcionando**. Se puede parar después de cualquier fase.

---

## Orden recomendado de ejecución

```
Fase 0 → Fase 1 → Fase 2 → Fase 3 → (opcional) Fase 4 → (opcional) Fase 5 → Fase 6
```

Las fases 4 y 5 son opcionales y se pueden hacer después. Con las fases 0-3 ya tienes el 80% del beneficio.
