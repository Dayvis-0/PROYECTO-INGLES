export interface Opcion {
  texto: string;
  correcta: boolean;
}

export interface PreguntaEvaluacion {
  pregunta: string;
  opciones: Opcion[];
}

export interface EjercicioCalentamiento {
  fraseMetaEn: string;
  fraseMetaEs: string;
}

export interface VocabularioItem {
  ingles: string;
  espanol: string;
  categoria: string;
}

export interface Leccion {
  id: string;
  titulo: string;
  estado: "activa" | "inactiva";
  listaVocabulario: string[];
  vocabularioDetallado?: VocabularioItem[];
  imagenGramatica: string;
  formulaGramatica: string;
  ejemploOracion?: string;
  ejemploRoles?: string[];
  calentamiento: EjercicioCalentamiento[];
  evaluacion: PreguntaEvaluacion[];
  frasesPronunciacion: string[];
  gramaticaColumnas?: GramaticaColumna[];
  gramaticaTitulo?: string;
  gramaticaDesc?: string;
}

export interface GramaticaColumna {
  titulo: string;
  verbo: string;
  nota: string;
}

export interface Calificacion {
  id: string;
  estudiante: string;
  leccionId: string;
  leccionTitulo: string;
  nota: number; // 0 a 20
  fecha: string;
  aciertos: number;
  totalPreguntas: number;
}
