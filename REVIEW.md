# Review del Proyecto — Plataforma de Inglés

## ¿Qué es?

Plataforma web interactiva de aprendizaje de inglés, estilo Duolingo, para la I.E. Manuel Vivanco Altamirano (UNAJMA). Dos roles:

- **Docente:** crea y edita lecciones, monitorea alumnos, revisa calificaciones.
- **Estudiante:** recorre lecciones con vocabulario, gramática interactiva, traducción por burbujas, pronunciación por micrófono, y examen calificado.

---

## Stack

| Tecnología | Versión |
|-----------|---------|
| React | 19 |
| TypeScript | ~5.8 |
| Vite | 6 |
| Tailwind CSS | 4 |
| Express | 4 |
| Google Gen AI | ^2.4 |
| Lucide React | iconos |
| Motion | animaciones |

---

## Estructura del proyecto

```
PROYECTO INGLES/
├── index.html              # Entry point HTML
├── package.json            # Dependencias
├── tsconfig.json           # Configuración TypeScript
├── vite.config.ts          # Configuración Vite
├── server.ts               # Express backend (proxy TTS)
├── README.md               # Instrucciones de uso
├── metadata.json           # Metadata para AI Studio
├── assets/
│   └── .aistudio/          # Archivos de AI Studio
├── node_modules/           # ⚠️ Commiteado — no debería estar
└── src/
    ├── main.tsx            # Entry point React (correcto, pequeño)
    ├── App.tsx             # ⚠️ 2939 líneas — TODO en un solo archivo
    ├── types.ts            # Interfaces TypeScript (bien aislado)
    ├── data.ts             # Datos iniciales + helpers localStorage
    └── index.css           # Tailwind + clases personalizadas
```

---

## Organización del código

### ✅ Aciertos

- **Tipos bien definidos** en `types.ts` — interfaces `Leccion`, `Calificacion`, `PreguntaEvaluacion`, etc.
- **Datos y persistencia separados** en `data.ts` — seed data + helpers de localStorage.
- **CSS limpio** con Tailwind v4 + clases utilitarias reutilizables (`.btn-3d-green`, `.btn-3d-blue`, `.duo-card`).
- **Diseño visual consistente** — inspiración Duolingo, botones 3D con `border-bottom`, tipografía Nunito, paleta verde/azul.
- **Servidor Express como proxy TTS** — buena solución para evitar CORS y referrer blocking.

### ❌ Problemas

| Problema | Detalle |
|----------|---------|
| **App.tsx monolítico** | 2939 líneas con 5 vistas, docenas de estados, helpers (Levenshtein, speech recognition, TTS), renders anidados. |
| **Sin componentes** | No existe carpeta `components/`. Todo es código inline en App.tsx. |
| **Sin store/context** | Todo el estado vive en `useState` dentro de App. Escala mal. |
| **`node_modules/` commiteado** | No debería estar en el repositorio. |
| **Mezcla de idiomas** | Comentarios y UI en español, identificadores en inglés, títulos mezclados. |
| **SVGs gramaticales hardcodeados** | Los SVG están como strings en `data.ts` con `encodeURIComponent`. |
| **Sin lazy loading** | Todo se carga en un solo bundle. |

---

## Estilos

### Clases personalizadas (CSS)

```css
.btn-3d-green   → #58cc02 + border-bottom 4px (Duolingo verde)
.btn-3d-blue    → #1cb0f6 + border-bottom 4px (Duolingo azul)
.btn-3d-orange  → #ff9600 + border-bottom 4px
.btn-3d-danger  → #ff4b4b + border-bottom 4px
.btn-3d-gray    → blanco con borde gris (deshabilitado)
.duo-card       → border + border-bottom 6px, border-radius 20px
.progress-bar-fill → transición suave para barra de progreso
.pulse-voice    → animación de pulso para grabación de voz
```

### Paleta de colores

| Color | Uso | Hex |
|-------|-----|-----|
| Verde Duolingo | Botones principales, éxito | `#58cc02` / `#46a302` |
| Azul Duolingo | Botones secundarios, acentos | `#1cb0f6` / `#1899d6` |
| Fondo | Body | `#f7f7f7` |
| Texto | Principal | `#3c3c3c` |

### Tipografía

- **Nunito** (900, 800, 700) de Google Fonts — misma que usa Duolingo.
- Sin serifas, bold extremo, tracking amplio en mayúsculas.

---

## Flujo de la aplicación

```
Welcome → Login → Docente (CRUD lecciones + monitoreo)
                → Estudiante Home → Lección Walkthrough (5 pasos)
                                    1. Vocabulario (escuchar pronunciación)
                                    2. Gramática (hover interactivo palabra por palabra)
                                    3. Calentamiento (burbujas o teclado)
                                    4. Pronunciación (micrófono + Web Speech API)
                                    5. Evaluación (4 alternativas, nota /20)
```

---

---

## Comparativa: `PROYECTO INGLES` (React) vs `Estatico` (Vanilla JS)

Ambos proyectos implementan la **misma aplicación** (plataforma de inglés Duolingo-like) pero con enfoques drásticamente distintos.

| Aspecto | `PROYECTO INGLES` (React) | `Estatico` (Vanilla JS) |
|---------|---------------------------|-------------------------|
| **Framework** | React 19 + TypeScript + Vite | HTML + CSS + JS plano |
| **Routing** | SPA — todo en `currentView` (useState) | Multi-page — archivos HTML separados |
| **Componentes** | ❌ No existe — 2939 líneas en `App.tsx` | ✅ Separados en `pages/` y `components/` |
| **JS lógica** | Un solo `App.tsx` monolítico | ✅ 6 archivos separados por responsabilidad: `app.js`, `data.js`, `student.js`, `teacher.js`, `speech.js`, `router.js` |
| **CSS** | Tailwind v4 inline + `index.css` | ✅ Organizado en 3 archivos: `base.css`, `components.css`, `pages.css` |
| **Build** | Vite + TypeScript + bundling | Sin build — HTML/CSS/JS directo |
| **Backend** | Express (proxy TTS en `server.ts`) | ❌ No tiene — el TTS fallaría al no haber servidor |
| **Tipos** | ✅ TypeScript con interfaces | ❌ Sin tipos — JS plano |
| **SVGs ilustrativos** | Hardcodeados en `data.ts` | ✅ Separados en `assets/svgs/` (en `index.html`) |
| **Mantenibilidad** | Baja — todo mezclado en un archivo | **Alta** — separación clara por archivo y responsabilidad |
| **node_modules** | ⚠️ Commiteado | ✅ Sin dependencies — no aplica |
| **Estado global** | `useState` en App (sin store) | Variables globales en `data.js` + closure |

### Conclusión de la comparación

**`Estatico` gana por goleada en organización.** Aunque usa tecnología más simple (Vanilla JS sin build), su estructura es muy superior: archivos separados por responsabilidad, CSS modulado, componentes HTML reutilizables. `PROYECTO INGLES` tiene mejor stack (React + TypeScript + Vite) pero la implementación es un desastre organizativo — justo al revés de lo que debería ser.

El proyecto React debería **tomar como modelo la estructura de `Estatico`**: separar vistas en archivos, dividir la lógica en módulos, y usar componentes. La tecnología más moderna es inútil si el código es un solo archivo de 3000 líneas.

---

## Resumen final

> **Buena idea, ejecución funcional, pero organización para refactorizar YA.** El archivo `App.tsx` necesita ser dividido en componentes antes de que el proyecto crezca más. La estructura visual y de estilos es sólida y consistente.
