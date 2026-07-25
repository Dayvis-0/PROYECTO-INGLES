import { createContext, useContext, useReducer, type ReactNode } from "react";
import type { EjercicioCalentamiento, PreguntaEvaluacion, VocabularioItem, GramaticaColumna } from "../types";
import { DEFAULT_GRAMATICA_COLUMNAS, DEFAULT_GRAMATICA_TITULO, DEFAULT_GRAMATICA_DESC } from "../data";

// ─── State ────────────────────────────────────────────────
interface TeacherFormState {
  formTitulo: string;
  formImagenGramatica: string;
  formFormulaGramatica: string;
  formFrasesPronunciacion: string[];
  formCalentamiento: EjercicioCalentamiento[];
  formEvaluacion: PreguntaEvaluacion[];
  editingLessonId: string | null;
  teacherFormError: string | null;
  teacherTab: "avance" | "notas";
  expandedStudents: Record<string, boolean>;
  formEjemploOracion: string;
  formEjemploRoles: string[];
  formVocabularioDetallado: VocabularioItem[];
  formGramaticaColumnas: GramaticaColumna[];
  formGramaticaTitulo: string;
  formGramaticaDesc: string;
}

const initialTeacherFormState: TeacherFormState = {
  formTitulo: "",
  formImagenGramatica: "present_simple.png",
  formFormulaGramatica: "",
  formFrasesPronunciacion: [""],
  formCalentamiento: [{ fraseMetaEn: "", fraseMetaEs: "" }],
  formEvaluacion: [
    { pregunta: "", opciones: [{ texto: "", correcta: true }, { texto: "", correcta: false }, { texto: "", correcta: false }, { texto: "", correcta: false }] },
  ],
  editingLessonId: null,
  teacherFormError: null,
  teacherTab: "avance",
  expandedStudents: {},
  formEjemploOracion: "",
  formEjemploRoles: [],
  formVocabularioDetallado: [],
  formGramaticaColumnas: DEFAULT_GRAMATICA_COLUMNAS,
  formGramaticaTitulo: DEFAULT_GRAMATICA_TITULO,
  formGramaticaDesc: DEFAULT_GRAMATICA_DESC,
};

// ─── Actions ──────────────────────────────────────────────
type TeacherFormAction =
  | { type: "SET_FORM_TITULO"; payload: string }
  | { type: "SET_FORM_IMAGEN_GRAMATICA"; payload: string }
  | { type: "SET_FORM_FORMULA_GRAMATICA"; payload: string }
  | { type: "SET_FORM_FRASES_PRONUNCIACION"; payload: string[] | ((prev: string[]) => string[]) }
  | { type: "SET_FORM_CALENTAMIENTO"; payload: EjercicioCalentamiento[] | ((prev: EjercicioCalentamiento[]) => EjercicioCalentamiento[]) }
  | { type: "SET_FORM_EVALUACION"; payload: PreguntaEvaluacion[] | ((prev: PreguntaEvaluacion[]) => PreguntaEvaluacion[]) }
  | { type: "SET_EDITING_LESSON_ID"; payload: string | null }
  | { type: "SET_TEACHER_FORM_ERROR"; payload: string | null }
  | { type: "SET_TEACHER_TAB"; payload: "avance" | "notas" }
  | { type: "SET_EXPANDED_STUDENTS"; payload: Record<string, boolean> | ((prev: Record<string, boolean>) => Record<string, boolean>) }
  | { type: "SET_FORM_EJEMPLO_ORACION"; payload: string }
  | { type: "SET_FORM_EJEMPLO_ROLES"; payload: string[] | ((prev: string[]) => string[]) }
  | { type: "SET_FORM_VOCABULARIO_DETALLADO"; payload: VocabularioItem[] | ((prev: VocabularioItem[]) => VocabularioItem[]) }
  | { type: "SET_FORM_GRAMATICA_COLUMNAS"; payload: GramaticaColumna[] | ((prev: GramaticaColumna[]) => GramaticaColumna[]) }
  | { type: "SET_FORM_GRAMATICA_TITULO"; payload: string }
  | { type: "SET_FORM_GRAMATICA_DESC"; payload: string };

function teacherFormReducer(state: TeacherFormState, action: TeacherFormAction): TeacherFormState {
  switch (action.type) {
    case "SET_FORM_TITULO": return { ...state, formTitulo: action.payload };
    case "SET_FORM_IMAGEN_GRAMATICA": return { ...state, formImagenGramatica: action.payload };
    case "SET_FORM_FORMULA_GRAMATICA": return { ...state, formFormulaGramatica: action.payload };
    case "SET_FORM_FRASES_PRONUNCIACION": return { ...state, formFrasesPronunciacion: typeof action.payload === "function" ? (action.payload as (prev: string[]) => string[])(state.formFrasesPronunciacion) : action.payload };
    case "SET_FORM_CALENTAMIENTO": return { ...state, formCalentamiento: typeof action.payload === "function" ? (action.payload as (prev: EjercicioCalentamiento[]) => EjercicioCalentamiento[])(state.formCalentamiento) : action.payload };
    case "SET_FORM_EVALUACION": return { ...state, formEvaluacion: typeof action.payload === "function" ? (action.payload as (prev: PreguntaEvaluacion[]) => PreguntaEvaluacion[])(state.formEvaluacion) : action.payload };
    case "SET_EDITING_LESSON_ID": return { ...state, editingLessonId: action.payload };
    case "SET_TEACHER_FORM_ERROR": return { ...state, teacherFormError: action.payload };
    case "SET_TEACHER_TAB": return { ...state, teacherTab: action.payload };
    case "SET_EXPANDED_STUDENTS": return { ...state, expandedStudents: typeof action.payload === "function" ? (action.payload as (prev: Record<string, boolean>) => Record<string, boolean>)(state.expandedStudents) : action.payload };
    case "SET_FORM_EJEMPLO_ORACION": return { ...state, formEjemploOracion: action.payload };
    case "SET_FORM_EJEMPLO_ROLES": return { ...state, formEjemploRoles: typeof action.payload === "function" ? (action.payload as (prev: string[]) => string[])(state.formEjemploRoles) : action.payload };
    case "SET_FORM_VOCABULARIO_DETALLADO": return { ...state, formVocabularioDetallado: typeof action.payload === "function" ? (action.payload as (prev: VocabularioItem[]) => VocabularioItem[])(state.formVocabularioDetallado) : action.payload };
    case "SET_FORM_GRAMATICA_COLUMNAS": return { ...state, formGramaticaColumnas: typeof action.payload === "function" ? (action.payload as (prev: GramaticaColumna[]) => GramaticaColumna[])(state.formGramaticaColumnas) : action.payload };
    case "SET_FORM_GRAMATICA_TITULO": return { ...state, formGramaticaTitulo: action.payload };
    case "SET_FORM_GRAMATICA_DESC": return { ...state, formGramaticaDesc: action.payload };
    default: return state;
  }
}

// ─── Context type ─────────────────────────────────────────
export interface TeacherFormContextType {
  formTitulo: string;
  setFormTitulo: (s: string) => void;
  formImagenGramatica: string;
  setFormImagenGramatica: (s: string) => void;
  formFormulaGramatica: string;
  setFormFormulaGramatica: (s: string) => void;
  formFrasesPronunciacion: string[];
  setFormFrasesPronunciacion: (s: string[] | ((prev: string[]) => string[])) => void;
  formCalentamiento: EjercicioCalentamiento[];
  setFormCalentamiento: (e: EjercicioCalentamiento[] | ((prev: EjercicioCalentamiento[]) => EjercicioCalentamiento[])) => void;
  formEvaluacion: PreguntaEvaluacion[];
  setFormEvaluacion: (p: PreguntaEvaluacion[] | ((prev: PreguntaEvaluacion[]) => PreguntaEvaluacion[])) => void;
  editingLessonId: string | null;
  setEditingLessonId: (id: string | null) => void;
  teacherFormError: string | null;
  setTeacherFormError: (e: string | null) => void;
  teacherTab: "avance" | "notas";
  setTeacherTab: (t: "avance" | "notas") => void;
  expandedStudents: Record<string, boolean>;
  setExpandedStudents: (e: Record<string, boolean> | ((prev: Record<string, boolean>) => Record<string, boolean>)) => void;
  formEjemploOracion: string;
  setFormEjemploOracion: (s: string) => void;
  formEjemploRoles: string[];
  setFormEjemploRoles: (s: string[] | ((prev: string[]) => string[])) => void;
  formVocabularioDetallado: VocabularioItem[];
  setFormVocabularioDetallado: (v: VocabularioItem[] | ((prev: VocabularioItem[]) => VocabularioItem[])) => void;
  formGramaticaColumnas: GramaticaColumna[];
  setFormGramaticaColumnas: (c: GramaticaColumna[] | ((prev: GramaticaColumna[]) => GramaticaColumna[])) => void;
  formGramaticaTitulo: string;
  setFormGramaticaTitulo: (s: string) => void;
  formGramaticaDesc: string;
  setFormGramaticaDesc: (s: string) => void;
}

const TeacherFormCtx = createContext<TeacherFormContextType | null>(null);

export function useTeacherFormContext(): TeacherFormContextType {
  const ctx = useContext(TeacherFormCtx);
  if (!ctx) throw new Error("useTeacherFormContext must be used within <TeacherFormProvider>");
  return ctx;
}

export function TeacherFormProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(teacherFormReducer, initialTeacherFormState);

  const value: TeacherFormContextType = {
    formTitulo: state.formTitulo,
    setFormTitulo: (s) => dispatch({ type: "SET_FORM_TITULO", payload: s }),
    formImagenGramatica: state.formImagenGramatica,
    setFormImagenGramatica: (s) => dispatch({ type: "SET_FORM_IMAGEN_GRAMATICA", payload: s }),
    formFormulaGramatica: state.formFormulaGramatica,
    setFormFormulaGramatica: (s) => dispatch({ type: "SET_FORM_FORMULA_GRAMATICA", payload: s }),
    formFrasesPronunciacion: state.formFrasesPronunciacion,
    setFormFrasesPronunciacion: (s) => dispatch({ type: "SET_FORM_FRASES_PRONUNCIACION", payload: s }),
    formCalentamiento: state.formCalentamiento,
    setFormCalentamiento: (e) => dispatch({ type: "SET_FORM_CALENTAMIENTO", payload: e }),
    formEvaluacion: state.formEvaluacion,
    setFormEvaluacion: (p) => dispatch({ type: "SET_FORM_EVALUACION", payload: p }),
    editingLessonId: state.editingLessonId,
    setEditingLessonId: (id) => dispatch({ type: "SET_EDITING_LESSON_ID", payload: id }),
    teacherFormError: state.teacherFormError,
    setTeacherFormError: (e) => dispatch({ type: "SET_TEACHER_FORM_ERROR", payload: e }),
    teacherTab: state.teacherTab,
    setTeacherTab: (t) => dispatch({ type: "SET_TEACHER_TAB", payload: t }),
    expandedStudents: state.expandedStudents,
    setExpandedStudents: (e) => dispatch({ type: "SET_EXPANDED_STUDENTS", payload: e }),
    formEjemploOracion: state.formEjemploOracion,
    setFormEjemploOracion: (s) => dispatch({ type: "SET_FORM_EJEMPLO_ORACION", payload: s }),
    formEjemploRoles: state.formEjemploRoles,
    setFormEjemploRoles: (s) => dispatch({ type: "SET_FORM_EJEMPLO_ROLES", payload: s }),
    formVocabularioDetallado: state.formVocabularioDetallado,
    setFormVocabularioDetallado: (v) => dispatch({ type: "SET_FORM_VOCABULARIO_DETALLADO", payload: v }),
    formGramaticaColumnas: state.formGramaticaColumnas,
    setFormGramaticaColumnas: (c) => dispatch({ type: "SET_FORM_GRAMATICA_COLUMNAS", payload: c }),
    formGramaticaTitulo: state.formGramaticaTitulo,
    setFormGramaticaTitulo: (s) => dispatch({ type: "SET_FORM_GRAMATICA_TITULO", payload: s }),
    formGramaticaDesc: state.formGramaticaDesc,
    setFormGramaticaDesc: (s) => dispatch({ type: "SET_FORM_GRAMATICA_DESC", payload: s }),
  };

  return <TeacherFormCtx.Provider value={value}>{children}</TeacherFormCtx.Provider>;
}
