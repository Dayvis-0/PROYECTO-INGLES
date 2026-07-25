import { supabase } from "./supabase";
import type { Calificacion } from "../types";
import type { ResultadoRow } from "./tipos";
import { PASS_THRESHOLD } from "../constants";

/** Busca el id_estudiante desde el nombre de usuario */
export async function getEstudianteId(username: string): Promise<number | null> {
  const { data } = await supabase
    .from("usuario")
    .select("id_usuario")
    .eq("nombre_usuario", username)
    .maybeSingle();

  if (!data) return null;

  const { data: estu } = await supabase
    .from("estudiante")
    .select("id_estudiante")
    .eq("id_usuario", data.id_usuario)
    .maybeSingle();

  return estu?.id_estudiante ?? null;
}

/** Busca el id_docente desde el nombre de usuario */
export async function getDocenteId(username: string): Promise<number | null> {
  const { data } = await supabase
    .from("usuario")
    .select("id_usuario")
    .eq("nombre_usuario", username)
    .maybeSingle();

  if (!data) return null;

  const { data: doc } = await supabase
    .from("docente")
    .select("id_docente")
    .eq("id_usuario", data.id_usuario)
    .maybeSingle();

  return doc?.id_docente ?? null;
}

/** Mapea un ResultadoRow + metadata a Calificacion del dominio */
function mapResultadoToCalificacion(
  r: ResultadoRow,
  username: string,
  leccionTitulo: string
): Calificacion {
  return {
    id: String(r.id_leccion_estudiante),
    estudiante: username,
    leccionId: String(r.id_leccion),
    leccionTitulo,
    nota: Number(r.nota_obtenida),
    fecha: r.fecha_realizacion
      ? new Date(r.fecha_realizacion).toISOString().replace("T", " ").substring(0, 16)
      : "",
    aciertos: r.aciertos ?? 0,
    totalPreguntas: r.total_preguntas ?? 0,
  };
}

/** Obtiene calificaciones de un estudiante específico */
export async function fetchCalificaciones(username: string): Promise<Calificacion[]> {
  const estuId = await getEstudianteId(username);
  if (!estuId) return [];

  const { data: resultados, error } = await supabase
    .from("resultado")
    .select(`
      id_leccion_estudiante,
      id_estudiante,
      id_leccion,
      fecha_realizacion,
      nota_obtenida,
      aciertos,
      total_preguntas,
      estado,
      completada
    `)
    .eq("id_estudiante", estuId)
    .order("fecha_realizacion", { ascending: false });

  if (error || !resultados) return [];

  // Obtener títulos de lecciones en una sola query
  const leccionIds = [...new Set(resultados.map((r) => r.id_leccion))];
  const tituloMap: Record<string, string> = {};

  if (leccionIds.length > 0) {
    const { data: lecciones } = await supabase
      .from("leccion")
      .select("id_leccion, titulo")
      .in("id_leccion", leccionIds);

    if (lecciones) {
      for (const l of lecciones) {
        tituloMap[l.id_leccion] = l.titulo;
      }
    }
  }

  return resultados.map((r) =>
    mapResultadoToCalificacion(r, username, tituloMap[r.id_leccion] || "")
  );
}

/** Guarda una calificación (solo si no existe - primera nota se conserva) */
export async function saveCalificacion(
  grade: Omit<Calificacion, "id">,
  username: string
): Promise<void> {
  const estuId = await getEstudianteId(username);
  if (!estuId) throw new Error("Estudiante no encontrado");

  // Verificar si ya existe un resultado para este estudiante + lección
  const { data: existing } = await supabase
    .from("resultado")
    .select("id_leccion_estudiante")
    .eq("id_estudiante", estuId)
    .eq("id_leccion", grade.leccionId)
    .limit(1);

  // ❗ Si ya existe, NO pisamos (primera nota se conserva)
  if (existing && existing.length > 0) return;

  const estado = grade.nota >= PASS_THRESHOLD ? "aprobado" : "desaprobado";

  const { error } = await supabase.from("resultado").insert({
    id_estudiante: estuId,
    id_leccion: grade.leccionId,
    nota_obtenida: grade.nota,
    aciertos: grade.aciertos,
    total_preguntas: grade.totalPreguntas,
    estado,
    completada: true,
  });

  if (error) {
    console.error("Error al guardar calificación:", error);
    throw error;
  }
}

/** Obtiene TODAS las calificaciones (para el monitoreo del docente) */
export async function fetchAllCalificaciones(): Promise<Calificacion[]> {
  const { data, error } = await supabase
    .from("resultado")
    .select(`
      id_leccion_estudiante,
      id_estudiante,
      id_leccion,
      fecha_realizacion,
      nota_obtenida,
      aciertos,
      total_preguntas
    `)
    .order("fecha_realizacion", { ascending: false });

  if (error || !data) return [];

  // Obtener mapeo estudiante -> username en 2 queries (estudiante + usuario)
  const estuIds = [...new Set(data.map((r) => r.id_estudiante))];
  const estuUserMap: Record<number, string> = {};

  if (estuIds.length > 0) {
    const { data: estudiantes } = await supabase
      .from("estudiante")
      .select("id_estudiante, id_usuario")
      .in("id_estudiante", estuIds);

    const usuarioIds = (estudiantes || []).map((e) => e.id_usuario);
    const usuarioMap: Record<number, string> = {};

    if (usuarioIds.length > 0) {
      const { data: usuarios } = await supabase
        .from("usuario")
        .select("id_usuario, nombre_usuario")
        .in("id_usuario", usuarioIds);

      if (usuarios) {
        for (const u of usuarios) {
          usuarioMap[u.id_usuario] = u.nombre_usuario;
        }
      }
    }

    if (estudiantes) {
      for (const e of estudiantes) {
        estuUserMap[e.id_estudiante] = usuarioMap[e.id_usuario] || "desconocido";
      }
    }
  }

  // Obtener títulos de lecciones
  const leccionIds = [...new Set(data.map((r) => r.id_leccion))];
  const tituloMap: Record<string, string> = {};

  if (leccionIds.length > 0) {
    const { data: lecciones } = await supabase
      .from("leccion")
      .select("id_leccion, titulo")
      .in("id_leccion", leccionIds);

    if (lecciones) {
      for (const l of lecciones) {
        tituloMap[l.id_leccion] = l.titulo;
      }
    }
  }

  return data.map((r) => ({
    id: String(r.id_leccion_estudiante),
    estudiante: estuUserMap[r.id_estudiante] || "desconocido",
    leccionId: String(r.id_leccion),
    leccionTitulo: tituloMap[r.id_leccion] || "",
    nota: Number(r.nota_obtenida),
    fecha: r.fecha_realizacion
      ? new Date(r.fecha_realizacion).toISOString().replace("T", " ").substring(0, 16)
      : "",
    aciertos: r.aciertos ?? 0,
    totalPreguntas: r.total_preguntas ?? 0,
  }));
}