import { supabase } from "./supabase";
import type { Leccion, Calificacion, VocabularioItem, GramaticaColumna } from "../types";
import { PRESENT_SIMPLE_SVG, PRESENT_CONTINUOUS_SVG } from "../data";

// ─── HELPERS ────────────────────────────────────────────────

/** Busca el id_estudiante desde el nombre de usuario */
async function getEstudianteId(username: string): Promise<number | null> {
  const { data } = await supabase
    .from("usuario")
    .select("id_usuario")
    .eq("nombre_usuario", username)
    .single();
  if (!data) return null;
  const { data: estu } = await supabase
    .from("estudiante")
    .select("id_estudiante")
    .eq("id_usuario", data.id_usuario)
    .single();
  return estu?.id_estudiante ?? null;
}

/** Busca el id_docente desde el nombre de usuario */
export async function getDocenteId(username: string): Promise<number | null> {
  const { data } = await supabase
    .from("usuario")
    .select("id_usuario")
    .eq("nombre_usuario", username)
    .single();
  if (!data) return null;
  const { data: doc } = await supabase
    .from("docente")
    .select("id_docente")
    .eq("id_usuario", data.id_usuario)
    .single();
  return doc?.id_docente ?? null;
}

// ─── CALIFICACIONES (resultado) ──────────────────────────────

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
      total_preguntas
    `)
    .eq("id_estudiante", estuId)
    .order("fecha_realizacion", { ascending: false });

  if (error || !resultados) return [];

  // Fetch lesson titles for each resultado
  const leccionIds = [...new Set(resultados.map((r) => r.id_leccion))];
  const { data: lecciones } = await supabase
    .from("leccion")
    .select("id_leccion, titulo")
    .in("id_leccion", leccionIds);

  const tituloMap: Record<string, string> = {};
  if (lecciones) {
    for (const l of lecciones) {
      tituloMap[l.id_leccion] = l.titulo;
    }
  }

  return resultados.map((r) => ({
    id: String(r.id_leccion_estudiante),
    estudiante: username,
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

  const estado = grade.nota >= 11 ? "aprobado" : "desaprobado";

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

// ─── LECCIONES ──────────────────────────────────────────────

/** Reconstruye una Leccion completa desde las tablas relacionadas */
async function buildLeccion(row: any): Promise<Leccion | null> {
  const id = row.id_leccion;

  // Vocabulario
  const { data: vocabulario } = await supabase
    .from("vocabulario")
    .select("*")
    .eq("id_leccion", id)
    .order("orden");

  const listaVocabulario = (vocabulario || []).map((v) => v.palabra_ingles);
  const vocabularioDetallado: VocabularioItem[] = (vocabulario || []).map((v) => ({
    ingles: v.palabra_ingles,
    espanol: v.traduccion_espanol,
    categoria: "",
  }));

  // Gramática
  const { data: gramatica } = await supabase
    .from("gramatica")
    .select("*")
    .eq("id_leccion", id)
    .single();

  // Construcción de oraciones (calentamiento)
  const { data: construcciones } = await supabase
    .from("construccion_oracion")
    .select("*")
    .eq("id_leccion", id)
    .order("orden");

  const calentamiento = (construcciones || []).map((c) => ({
    fraseMetaEn: c.respuesta_correcta,
    fraseMetaEs: c.oracion_espanol,
  }));

  // Pronunciación
  const { data: pronunciaciones } = await supabase
    .from("pronunciacion")
    .select("*")
    .eq("id_leccion", id)
    .order("orden");

  const frasesPronunciacion = (pronunciaciones || []).map((p) => p.oracion_ingles);

  // Evaluación + preguntas
  const { data: evaluacion } = await supabase
    .from("evaluacion")
    .select("id_evaluacion")
    .eq("id_leccion", id)
    .single();

  let evaluacionPreguntas: Leccion["evaluacion"] = [];
  if (evaluacion) {
    const { data: preguntas } = await supabase
      .from("pregunta")
      .select("*")
      .eq("id_evaluacion", evaluacion.id_evaluacion)
      .order("orden");

    evaluacionPreguntas = (preguntas || []).map((p) => ({
      pregunta: p.enunciado,
      opciones: [
        { texto: p.alternativa_a, correcta: p.respuesta_correcta === "A" },
        { texto: p.alternativa_b, correcta: p.respuesta_correcta === "B" },
        { texto: p.alternativa_c, correcta: p.respuesta_correcta === "C" },
        { texto: p.alternativa_d, correcta: p.respuesta_correcta === "D" },
      ],
    }));
  }

  // Imagen SVG según el tema
  const imagenGramatica = id === "1"
    ? PRESENT_SIMPLE_SVG
    : id === "2"
    ? PRESENT_CONTINUOUS_SVG
    : PRESENT_SIMPLE_SVG;

  return {
    id,
    titulo: row.titulo,
    estado: row.estado_activo ? "activa" : "inactiva",
    listaVocabulario,
    vocabularioDetallado,
    imagenGramatica,
    formulaGramatica: gramatica?.formula || "",
    ejemploOracion: gramatica?.ejemplo || "",
    gramaticaColumnas: [],
    calentamiento,
    evaluacion: evaluacionPreguntas,
    frasesPronunciacion,
  };
}

export async function fetchLecciones(): Promise<Leccion[]> {
  const { data: lecciones, error } = await supabase
    .from("leccion")
    .select("*")
    .order("created_at", { ascending: true });

  if (error || !lecciones) {
    console.error("Error fetching lecciones:", error);
    return [];
  }

  const result: Leccion[] = [];
  for (const row of lecciones) {
    const leccion = await buildLeccion(row);
    if (leccion) result.push(leccion);
  }
  return result;
}

export async function saveLeccion(lesson: Leccion, docenteUsername: string): Promise<void> {
  const docenteId = await getDocenteId(docenteUsername);
  if (!docenteId) throw new Error("Docente no encontrado");

  const exists = lesson.id && !lesson.id.startsWith("lesson_");

  // Upsert leccion
  const { error: errLeccion } = await supabase.from("leccion").upsert(
    {
      id_leccion: lesson.id,
      id_docente: docenteId,
      titulo: lesson.titulo,
      estado_activo: lesson.estado === "activa",
    },
    { onConflict: "id_leccion" }
  );

  if (errLeccion) {
    console.error("Error guardando leccion:", errLeccion);
    throw errLeccion;
  }

  const id = lesson.id;

  // Vocabulario
  if (lesson.vocabularioDetallado && lesson.vocabularioDetallado.length > 0) {
    await supabase.from("vocabulario").delete().eq("id_leccion", id);
    const vocabs = lesson.vocabularioDetallado.map((v, i) => ({
      id_leccion: id,
      palabra_ingles: v.ingles,
      traduccion_espanol: v.espanol,
      orden: i + 1,
    }));
    if (vocabs.length > 0) {
      await supabase.from("vocabulario").insert(vocabs);
    }
  }

  // Gramática
  if (lesson.formulaGramatica) {
    await supabase.from("gramatica").delete().eq("id_leccion", id);
    await supabase.from("gramatica").insert({
      id_leccion: id,
      nombre_tema: lesson.gramaticaTitulo || lesson.titulo,
      explicacion: lesson.gramaticaDesc || "",
      formula: lesson.formulaGramatica,
      ejemplo: lesson.ejemploOracion || "",
    });
  }

  // Construcción de oraciones (calentamiento)
  if (lesson.calentamiento.length > 0) {
    await supabase.from("construccion_oracion").delete().eq("id_leccion", id);
    for (let i = 0; i < lesson.calentamiento.length; i++) {
      const c = lesson.calentamiento[i];
      await supabase.from("construccion_oracion").insert({
        id_leccion: id,
        oracion_espanol: c.fraseMetaEs,
        respuesta_correcta: c.fraseMetaEn,
        orden: i + 1,
      });
    }
  }

  // Pronunciación
  if (lesson.frasesPronunciacion.length > 0) {
    await supabase.from("pronunciacion").delete().eq("id_leccion", id);
    const frases = lesson.frasesPronunciacion.map((f, i) => ({
      id_leccion: id,
      oracion_ingles: f,
      orden: i + 1,
    }));
    await supabase.from("pronunciacion").insert(frases);
  }

  // Evaluación + preguntas
  if (lesson.evaluacion.length > 0) {
    await supabase.from("pregunta").delete().eq("id_evaluacion",
      // Need to get the evaluacion id first
      (await supabase.from("evaluacion").select("id_evaluacion").eq("id_leccion", id).single()).data
        ?.id_evaluacion ?? 0
    );
    await supabase.from("evaluacion").delete().eq("id_leccion", id);

    const { data: newEval } = await supabase
      .from("evaluacion")
      .insert({ id_leccion: id })
      .select("id_evaluacion")
      .single();

    if (newEval) {
      const preguntas = lesson.evaluacion.map((p, i) => {
        const correctIndex = p.opciones.findIndex((o) => o.correcta);
        return {
          id_evaluacion: newEval.id_evaluacion,
          enunciado: p.pregunta,
          alternativa_a: p.opciones[0]?.texto || "",
          alternativa_b: p.opciones[1]?.texto || "",
          alternativa_c: p.opciones[2]?.texto || "",
          alternativa_d: p.opciones[3]?.texto || "",
          respuesta_correcta: ["A", "B", "C", "D"][correctIndex] || "A",
          orden: i + 1,
        };
      });
      await supabase.from("pregunta").insert(preguntas);
    }
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

  // Obtener nombres de estudiantes
  const estuIds = [...new Set(data.map((r) => r.id_estudiante))];
  const { data: estudiantes } = await supabase
    .from("estudiante")
    .select("id_estudiante, id_usuario")
    .in("id_estudiante", estuIds);

  const { data: usuarios } = await supabase
    .from("usuario")
    .select("id_usuario, nombre_usuario")
    .in("id_usuario", (estudiantes || []).map((e) => e.id_usuario));

  const usuarioMap: Record<number, string> = {};
  if (usuarios) {
    for (const u of usuarios) {
      usuarioMap[u.id_usuario] = u.nombre_usuario;
    }
  }

  const estuUserMap: Record<number, string> = {};
  if (estudiantes) {
    for (const e of estudiantes) {
      estuUserMap[e.id_estudiante] = usuarioMap[e.id_usuario] || "desconocido";
    }
  }

  // Obtener títulos de lecciones
  const leccionIds = [...new Set(data.map((r) => r.id_leccion))];
  const { data: lecciones } = await supabase
    .from("leccion")
    .select("id_leccion, titulo")
    .in("id_leccion", leccionIds);

  const tituloMap: Record<string, string> = {};
  if (lecciones) {
    for (const l of lecciones) {
      tituloMap[l.id_leccion] = l.titulo;
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

export async function deleteLeccion(id: string): Promise<void> {
  // Delete in reverse dependency order
  await supabase.from("pregunta").delete().eq("id_evaluacion",
    (await supabase.from("evaluacion").select("id_evaluacion").eq("id_leccion", id).single()).data
      ?.id_evaluacion ?? 0
  );
  await supabase.from("evaluacion").delete().eq("id_leccion", id);
  await supabase.from("pronunciacion").delete().eq("id_leccion", id);
  await supabase.from("palabra_construccion").delete().eq("id_construccion",
    // Delete all related words first
    (await supabase.from("construccion_oracion").select("id_construccion").eq("id_leccion", id)).data
      ?.map(c => c.id_construccion) ?? []
  );
  await supabase.from("construccion_oracion").delete().eq("id_leccion", id);
  await supabase.from("gramatica").delete().eq("id_leccion", id);
  await supabase.from("vocabulario").delete().eq("id_leccion", id);
  await supabase.from("resultado").delete().eq("id_leccion", id);
  await supabase.from("leccion").delete().eq("id_leccion", id);
}
