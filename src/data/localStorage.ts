import { Leccion, Calificacion } from "../types";
import { LECCIONES_INICIALES, CALIFICACIONES_INICIALES } from "./defaultLessons";

export function getStoredLessons(): Leccion[] {
  const stored = localStorage.getItem("unajma_lessons");
  if (!stored) {
    localStorage.setItem("unajma_lessons", JSON.stringify(LECCIONES_INICIALES));
    return LECCIONES_INICIALES;
  }
  
  try {
    const parsed = JSON.parse(stored) as Leccion[];
    // Automatic migration to make sure we always have 10-questions lessons if user has outdated data
    const hasOldData = parsed.some(l => l.evaluacion.length < 10);
    if (hasOldData) {
      localStorage.setItem("unajma_lessons", JSON.stringify(LECCIONES_INICIALES));
      return LECCIONES_INICIALES;
    }
    return parsed;
  } catch (e) {
    localStorage.setItem("unajma_lessons", JSON.stringify(LECCIONES_INICIALES));
    return LECCIONES_INICIALES;
  }
}

export function saveStoredLessons(lessons: Leccion[]) {
  localStorage.setItem("unajma_lessons", JSON.stringify(lessons));
}

export function getStoredCalificaciones(): Calificacion[] {
  const stored = localStorage.getItem("unajma_grades");
  let list = CALIFICACIONES_INICIALES;
  if (stored) {
    try {
      list = JSON.parse(stored);
    } catch (e) {
      list = CALIFICACIONES_INICIALES;
    }
  }

  // Deduplicate: only keep the first occurrence of (estudiante + leccionId) which represents the most recent attempt
  // Also filter out any lingering mock history records that start with "hist_"
  const seen = new Set<string>();
  const deduplicated = list.filter((item) => {
    // Standardize IDs and guard against invalid entries
    if (!item || !item.estudiante || !item.leccionId) return false;
    if (item.id && String(item.id).startsWith("hist_")) return false;
    const key = `${item.estudiante}_${item.leccionId}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });

  // Persist the cleaned version back to storage
  if (deduplicated.length !== list.length) {
    localStorage.setItem("unajma_grades", JSON.stringify(deduplicated));
  }

  return deduplicated;
}

export function saveStoredCalificaciones(grades: Calificacion[]) {
  localStorage.setItem("unajma_grades", JSON.stringify(grades));
}
