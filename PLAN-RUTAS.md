# Plan de Implementación de Rutas URL

## Problema Actual

La app es una SPA (Single Page Application) que **no usa URLs reales**. Todo el "routing" se maneja con una variable de estado `currentView` en un `useReducer`. Esto significa que:

- **Siempre** ves `http://localhost:3000/` sin importar en qué pantalla estés
- No puedes compartir enlaces (`/docente`, `/estudiante/leccion/abc`)
- No funciona el botón "Atrás" del navegador
- No puedes recargar la página en una vista específica

### Vistas actuales (estado → componente)

| Estado `currentView` | Componente | Ruta que DEBERÍA tener |
|---|---|---|
| `"welcome"` | `<WelcomeView />` | `/` |
| `"login"` | `<LoginView />` | `/login` |
| `"docente"` | `<DocenteView />` | `/docente` |
| `"estudiante_home"` | `<EstudianteHomeView />` | `/estudiante` |
| `"estudiante_leccion"` | `<EstudianteLeccionView />` | `/estudiante/leccion/:id` |

---

## Fase 1 — Instalar React Router y definir rutas base

### Qué hacer

1. Instalar `react-router-dom`
2. Crear un archivo `src/router.tsx` con las rutas
3. Envolver `<App />` con `<BrowserRouter>` en `main.tsx`
4. Reemplazar el render condicional en `App.tsx` con `<Routes>` y `<Route>`

### Archivos a modificar

- `package.json` — agregar dependencia
- `src/main.tsx` — agregar `<BrowserRouter>`
- `src/App.tsx` — reemplazar `if currentView === ...` por `<Routes>`
- Crear `src/router.tsx` — configuración de rutas

### Código resultante clave

```tsx
// src/router.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import WelcomeView from "./views/WelcomeView";
import LoginView from "./views/LoginView";
import DocenteView from "./views/DocenteView";
import EstudianteHomeView from "./views/EstudianteHomeView";
import EstudianteLeccionView from "./views/EstudianteLeccionView";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<WelcomeView />} />
      <Route path="/login" element={<LoginView />} />
      <Route path="/docente" element={<DocenteView />} />
      <Route path="/estudiante" element={<EstudianteHomeView />} />
      <Route path="/estudiante/leccion/:id" element={<EstudianteLeccionView />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
```

```tsx
// src/main.tsx (modificado)
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AppProvider>
      <App />
    </AppProvider>
  </BrowserRouter>
);
```

```tsx
// src/App.tsx (simplificado)
export default function App() {
  return <AppRouter />;
}
```

### ✅ Resultado de Fase 1

- `http://localhost:3000/` → WelcomeView
- `http://localhost:3000/login` → LoginView
- `http://localhost:3000/docente` → DocenteView
- `http://localhost:3000/estudiante` → EstudianteHomeView
- `http://localhost:3000/estudiante/leccion/123` → EstudianteLeccionView

---

## Fase 2 — Migrar navegación de estado a React Router

### Qué hacer

Actualmente la navegación se hace con `setCurrentView(VIEWS.ALGO)`. Hay que reemplazar CADA llamada a `setCurrentView` con `navigate("/ruta")`.

Buscar en todos los archivos:

- `setCurrentView(VIEWS.WELCOME)` → `navigate("/")`
- `setCurrentView(VIEWS.LOGIN)` → `navigate("/login")`
- `setCurrentView(VIEWS.DOCENTE)` → `navigate("/docente")`
- `setCurrentView(VIEWS.ESTUDIANTE_HOME)` → `navigate("/estudiante")`
- `setCurrentView(VIEWS.ESTUDIANTE_LECCION)` → `navigate("/estudiante/leccion/${lessonId}")`

### Archivos a buscar (contienen `setCurrentView`)

| Archivo | Lo que hace |
|---|---|
| `src/App.tsx` | `handleLogout` → ir a welcome |
| `src/views/WelcomeView.tsx` | Botón "Comenzar" → login |
| `src/views/LoginView.tsx` | Login exitoso → docente o estudiante_home |
| `src/views/DocenteView.tsx` | Crear lección, etc. |
| `src/views/EstudianteHomeView.tsx` | Seleccionar lección → estudiante_leccion |
| `src/views/EstudianteLeccionView.tsx` | Terminar lección → estudiante_home |

### Detalle importante para `estudiante_leccion`

Cuando se navega a una lección, también se necesita pasar el `lessonId`. En la ruta sería:

```tsx
navigate(`/estudiante/leccion/${lessonId}`);
```

Y en `EstudianteLeccionView` se obtiene con `useParams()`:

```tsx
const { id } = useParams();
```

Esto reemplaza `setActiveLesson()` del contexto (o lo complementa — la lección se puede buscar por ID desde el hook).

### ✅ Resultado de Fase 2

- Toda la navegación usa URLs reales
- Botón "Atrás" del navegador funciona
- Se pueden compartir enlaces

---

## Fase 3 — Proteger rutas según autenticación

### Qué hacer

Crear un componente `<ProtectedRoute>` que verifique si hay usuario logueado y redirija a `/login` si no. Aplicarlo a:

- `/docente`
- `/estudiante`
- `/estudiante/leccion/:id`

```tsx
// src/components/ProtectedRoute.tsx
import { Navigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAppContext();
  if (!currentUser) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
```

Y en el router:

```tsx
<Route path="/docente" element={<ProtectedRoute><DocenteView /></ProtectedRoute>} />
```

### ✅ Resultado de Fase 3

- Usuarios no autenticados no pueden acceder a rutas protegidas
- Redirección automática a `/login`

---

## Fase 4 — Limpiar estado de routing del contexto

### Qué hacer

Una vez que React Router maneja la navegación, `currentView`, `setCurrentView`, y `selectedRole` (para routing) ya no son necesarios en el contexto. SE PUEDEN ELIMINAR para reducir el tamaño del estado global.

Cosas a revisar antes de eliminar:

1. ¿Algún componente LEE `currentView` para saber dónde está? Si es así, se reemplaza con `useLocation()` de React Router
2. `selectedRole` se usa en `LoginView` para decidir a dónde redirigir — eso se mueve a lógica local, no necesita estar en el contexto global

### Archivos afectados

- `src/context/AppContext.tsx` — eliminar `currentView`, `setCurrentView`, `selectedRole`, `setSelectedRole` del state, actions, reducer y context type
- `src/constants.ts` — eliminar `VIEWS` si ya no se usa en ningún lado (buscar referencias)
- Todos los archivos que importen `VIEWS` o usen `setCurrentView`

### ✅ Resultado de Fase 4

- Estado global más pequeño y enfocado
- Una sola fuente de verdad para routing: React Router

---

## Fase 5 — Verificar servidor Express (opcional, pero importante)

### Qué hacer

El servidor Express actualmente ya sirve el catch-all correctamente:

- En **desarrollo**: Vite middleware maneja todo (funciona sin cambios)
- En **producción**: `app.get("*", ...)` sirve `index.html` para cualquier ruta — **esto ya es correcto** para una SPA

Solo verificar que el catch-all esté funcionando. No necesita cambios, pero es bueno confirmar que rutas como `/estudiante/leccion/abc` en producción devuelvan `index.html` y no 404.

---

## Resumen del plan

| Fase | Descripción | Archivos clave | Depende de |
|---|---|---|---|
| 1 | Instalar React Router, definir rutas base | `package.json`, `main.tsx`, `App.tsx`, nuevo `router.tsx` | Nada |
| 2 | Migrar navegación a `navigate()` | `WelcomeView`, `LoginView`, `DocenteView`, `EstudianteHomeView`, `EstudianteLeccionView` | Fase 1 |
| 3 | Proteger rutas con `ProtectedRoute` | Nuevo `ProtectedRoute.tsx`, `router.tsx` | Fase 1 |
| 4 | Limpiar estado de routing del contexto | `AppContext.tsx`, `constants.ts` | Fase 2 |
| 5 | Verificar servidor Express | `server.ts` (solo verificar) | Ninguna |

**Orden recomendado:** Fase 1 → Fase 2 → Fase 3 → Fase 4 → Fase 5

La Fase 2 es la más tediosa porque toca casi todas las vistas. La Fase 4 es opcional pero muy recomendada para mantener el código limpio.
