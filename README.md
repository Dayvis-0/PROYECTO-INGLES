# UNAJMA Learn English — Plataforma Interactiva de Aprendizaje

## Credenciales de Acceso (Prueba)

- **Docente:**
  - **Usuario:** `docente`
  - **Contraseña:** `1234`

- **Estudiante:**
  - **Usuario:** `estudiante`
  - **Contraseña:** `1234`


**Curso:** Análisis y Diseño de Sistemas  
**Universidad:** Universidad Nacional José María Arguedas (UNAJMA)

## Descripción del Proyecto

Plataforma web interactiva para el aprendizaje de inglés dirigida a estudiantes de la Institución educativa secundaria Colegio Manuel Vivanco Altamirano - Andahuaylas. Permite a los docentes crear y gestionar lecciones, y a los estudiantes realizar ejercicios de vocabulario, gramática, pronunciación y evaluación en un entorno guiado paso a paso.

## Roles del Sistema

### Docente
- Crear, editar y eliminar lecciones
- Gestionar vocabulario, gramática, construcción de oraciones y pronunciación por lección
- Monitorear el progreso de los estudiantes

### Estudiante
- Visualizar lecciones disponibles
- Realizar las 5 etapas de cada lección:
  1. **Calentamiento** — ejercicios introductorios
  2. **Vocabulario** — práctica de palabras y traducciones
  3. **Gramática** — explicación y ejercicios con fórmula y ejemplos
  4. **Pronunciación** — práctica con reconocimiento de voz y TTS
  5. **Evaluación** — preguntas tipo con alternativas y calificación automática
- Recibir calificación y retroalimentación al completar una lección

## Arquitectura

| Capa | Tecnología |
|------|-----------|
| Frontend | React 19 + TypeScript + Vite |
| Estilos | Tailwind CSS v4 |
| Backend API | Express (proxy TTS) |
| Base de Datos | Supabase (PostgreSQL) |
| Autenticación | Supabase Auth |

## Modelo de Datos

El sistema utiliza las siguientes entidades principales en Supabase:
- **usuarios** — credenciales de acceso
- **estudiantes** — perfil de estudiante vinculado a usuario
- **lecciones** — lecciones creadas por docentes
- **vocabulario** — palabras y traducciones por lección
- **gramatica** — temas gramaticales con fórmula y ejemplos
- **construcciones** — ejercicios de construcción de oraciones
- **pronunciacion** — oraciones para práctica de pronunciación
- **evaluaciones** — exámenes por lección
- **preguntas** — preguntas de opción múltiple
- **resultados** — calificaciones obtenidas por los estudiantes

## Tecnologías Clave

- **Reconocimiento de voz**: Web Speech API para práctica de pronunciación
- **Text-to-Speech**: Proxy TTS con Google Translate + StreamElements fallback
- **Similitud fonética**: Algoritmo de Levenshtein para evaluar pronunciación
