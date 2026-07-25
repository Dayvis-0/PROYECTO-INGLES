import { supabase } from "./supabase";
import type { Leccion, Calificacion, VocabularioItem, GramaticaColumna } from "../types";
import { PRESENT_SIMPLE_SVG, PRESENT_CONTINUOUS_SVG } from "../data";
import { PASS_THRESHOLD } from "../constants";

// ─── HELPERS ────────────────────────────────────────────────

/** Busca el id_estudiante desde el nombre de usuario */
async function getEstudianteId(username: string): Promise<number | null> {
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

// ─── LECCIONES ──────────────────────────────────────────────

/**
 * fetchLecciones — trae TODAS las lecciones con sus relaciones en 7 queries totales
 * (en lugar de 1 + 5*N). Escala aunque hayan 100 lecciones.
 */
export async function fetchLecciones(): Promise<Leccion[]> {
  // 1. Traer todas las lecciones
  const { data: lecciones, error } = await supabase
    .from("leccion")
    .select("*")
    .order("created_at", { ascending: true });

  if (error || !lecciones || lecciones.length === 0) {
    if (error) console.error("Error fetching lecciones:", error);
    return [];
  }

  const ids = lecciones.map((l: any) => l.id_leccion);

  // 2. Traer TODO el vocabulario de todas las lecciones (1 query)
  const { data: todosVocabulario } = await supabase
    .from("vocabulario")
    .select("*")
    .in("id_leccion", ids)
    .order("orden");

  // 3. Traer TODA la gramática de todas las lecciones (1 query)
  const { data: todaGramatica } = await supabase
    .from("gramatica")
    .select("*")
    .in("id_leccion", ids);

  // 4. Traer TODAS las construcciones de todas las lecciones (1 query)
  const { data: todasConstrucciones } = await supabase
    .from("construccion_oracion")
    .select("*")
    .in("id_leccion", ids)
    .order("orden");

  // 5. Traer TODA la pronunciación de todas las lecciones (1 query)
  const { data: todaPronunciacion } = await supabase
    .from("pronunciacion")
    .select("*")
    .in("id_leccion", ids)
    .order("orden");

  // 6. Traer TODAS las evaluaciones de todas las lecciones (1 query)
  const { data: todasEvaluaciones } = await supabase
    .from("evaluacion")
    .select("*")
    .in("id_leccion", ids);

  // 7. Traer TODAS las preguntas de todas las evaluaciones (1 query)
  const evalIds = (todasEvaluaciones || []).map((e: any) => e.id_evaluacion);
  let todasPreguntas: any[] = [];
  if (evalIds.length > 0) {
    const { data: preguntas } = await supabase
      .from("pregunta")
      .select("*")
      .in("id_evaluacion", evalIds)
      .order("orden");
    todasPreguntas = preguntas || [];
  }

  // Indexar por lección para ensamblaje rápido
  const vocPorLeccion = groupBy(todosVocabulario || [], "id_leccion");
  const gramPorLeccion = groupBy(todaGramatica || [], "id_leccion");
  const constrPorLeccion = groupBy(todasConstrucciones || [], "id_leccion");
  const pronPorLeccion = groupBy(todaPronunciacion || [], "id_leccion");
  const evalPorLeccion = groupBy(todasEvaluaciones || [], "id_leccion");
  const pregPorEvaluacion = groupBy(todasPreguntas, "id_evaluacion");

  // SVG mapping
  const svgMap: Record<string, string> = {
    "1": PRESENT_SIMPLE_SVG,
    "2": PRESENT_CONTINUOUS_SVG,
  };

  return lecciones.map((row: any) => {
    const id = row.id_leccion;
    const vocs = vocPorLeccion[id] || [];
    const grams = gramPorLeccion[id] || [];
    const constrs = constrPorLeccion[id] || [];
    const prons = pronPorLeccion[id] || [];
    const evals = evalPorLeccion[id] || [];

    const gramatica = grams[0];
    const evaluacionRow = evals[0];

    // Vocabulario
    const vocabularioDetallado: VocabularioItem[] = vocs.map((v: any) => ({
      ingles: v.palabra_ingles,
      espanol: v.traduccion_espanol,
      categoria: "",
    }));

    // Calentamiento
    const calentamiento = constrs.map((c: any) => ({
      fraseMetaEn: c.respuesta_correcta,
      fraseMetaEs: c.oracion_espanol,
    }));

    // Pronunciación
    const frasesPronunciacion = prons.map((p: any) => p.oracion_ingles);

    // Evaluación + preguntas
    let evaluacionPreguntas: Leccion["evaluacion"] = [];
    if (evaluacionRow) {
      const preguntas = pregPorEvaluacion[evaluacionRow.id_evaluacion] || [];
      evaluacionPreguntas = preguntas.map((p: any) => ({
        pregunta: p.enunciado,
        opciones: [
          { texto: p.alternativa_a, correcta: p.respuesta_correcta === "A" },
          { texto: p.alternativa_b, correcta: p.respuesta_correcta === "B" },
          { texto: p.alternativa_c, correcta: p.respuesta_correcta === "C" },
          { texto: p.alternativa_d, correcta: p.respuesta_correcta === "D" },
        ],
      }));
    }

    return {
      id,
      titulo: row.titulo,
      estado: row.estado_activo ? "activa" : "inactiva",
      listaVocabulario: vocs.map((v: any) => v.palabra_ingles),
      vocabularioDetallado,
      imagenGramatica: svgMap[id] || PRESENT_SIMPLE_SVG,
      formulaGramatica: gramatica?.formula || "",
      ejemploOracion: gramatica?.ejemplo || "",
      gramaticaTitulo: gramatica?.nombre_tema || "",
      gramaticaDesc: gramatica?.explicacion || "",
      gramaticaColumnas: (gramatica?.gramatica_columnas as any[]) || [],
      ejemploRoles: (gramatica?.ejemplo_roles as string[]) || [],
      calentamiento,
      evaluacion: evaluacionPreguntas,
      frasesPronunciacion,
    };
  });
}

/** Agrupa un array de objetos por una clave */
function groupBy<T extends Record<string, any>>(arr: T[], key: string): Record<string, T[]> {
  const map: Record<string, T[]> = {};
  for (const item of arr) {
    const k = item[key];
    if (!map[k]) map[k] = [];
    map[k].push(item);
  }
  return map;
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
      gramatica_columnas: lesson.gramaticaColumnas || [],
      ejemplo_roles: lesson.ejemploRoles || [],
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
  if (leccionIds.length === 0) return [];

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

async function del(table: string, column: string, value: string | number | (string | number)[]): Promise<void> {
  const query = supabase.from(table).delete();
  const { error } = Array.isArray(value)
    ? await query.in(column, value)
    : await query.eq(column, value);
  if (error) throw new Error(`Error al eliminar de ${table}: ${error.message}`);
}

export async function deleteLeccion(id: string): Promise<void> {
  // Delete in reverse dependency order
  const evalRes = await supabase.from("evaluacion").select("id_evaluacion").eq("id_leccion", id);
  if (evalRes.error) throw new Error(`Error al buscar evaluaciones: ${evalRes.error.message}`);
  const evalIds = evalRes.data?.map(e => e.id_evaluacion) ?? [];
  if (evalIds.length > 0) {
    await del("pregunta", "id_evaluacion", evalIds);
  }
  await del("evaluacion", "id_leccion", id);
  await del("pronunciacion", "id_leccion", id);

  const constrRes = await supabase.from("construccion_oracion").select("id_construccion").eq("id_leccion", id);
  if (constrRes.error) throw new Error(`Error al buscar construcciones: ${constrRes.error.message}`);
  const constrIds = constrRes.data?.map(c => c.id_construccion) ?? [];
  if (constrIds.length > 0) {
    await del("palabra_construccion", "id_construccion", constrIds);
  }
  await del("construccion_oracion", "id_leccion", id);
  await del("gramatica", "id_leccion", id);
  await del("vocabulario", "id_leccion", id);
  await del("resultado", "id_leccion", id);
  await del("leccion", "id_leccion", id);
}
