/**
 * Tipos internos para mapear filas de Supabase a modelos del dominio.
 * Separa la capa de datos de la capa de dominio.
 */

export interface LeccionRow {
  id_leccion: string;
  titulo: string;
  estado_activo: boolean;
  created_at: string;
  id_docente: string;
}

export interface VocabularioRow {
  id_vocabulario: number;
  id_leccion: string;
  palabra_ingles: string;
  traduccion_espanol: string;
  orden: number;
}

export interface GramaticaRow {
  id_gramatica: number;
  id_leccion: string;
  nombre_tema: string;
  explicacion: string;
  formula: string;
  ejemplo: string;
  gramatica_columnas: GramaticaColumnaRow[];
  ejemplo_roles: string[];
}

export interface GramaticaColumnaRow {
  titulo: string;
  verbo: string;
  nota: string;
}

export interface ConstruccionRow {
  id_construccion: number;
  id_leccion: string;
  oracion_espanol: string;
  respuesta_correcta: string;
  orden: number;
}

export interface PronunciacionRow {
  id_pronunciacion: number;
  id_leccion: string;
  oracion_ingles: string;
  orden: number;
}

export interface EvaluacionRow {
  id_evaluacion: number;
  id_leccion: string;
}

export interface PreguntaRow {
  id_pregunta: number;
  id_evaluacion: number;
  enunciado: string;
  alternativa_a: string;
  alternativa_b: string;
  alternativa_c: string;
  alternativa_d: string;
  respuesta_correcta: "A" | "B" | "C" | "D";
  orden: number;
}

export interface ResultadoRow {
  id_leccion_estudiante: number;
  id_estudiante: number;
  id_leccion: string;
  fecha_realizacion: string;
  nota_obtenida: number;
  aciertos: number;
  total_preguntas: number;
  estado: string;
  completada: boolean;
}

export interface EstudianteRow {
  id_estudiante: number;
  id_usuario: number;
}

export interface UsuarioRow {
  id_usuario: number;
  nombre_usuario: string;
}