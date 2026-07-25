import { createContext, useContext, useReducer, useEffect, type ReactNode } from "react";
import type { Leccion, Calificacion } from "../types";
import { fetchLecciones, fetchCalificaciones } from "../lib/supabase-service";

// ─── State ────────────────────────────────────────────────
interface LessonsState {
  loadingLessons: boolean;
  loadingGrades: boolean;
  lessons: Leccion[];
  calificaciones: Calificacion[];
}

const initialLessonsState: LessonsState = {
  loadingLessons: true,
  loadingGrades: true,
  lessons: [],
  calificaciones: [],
};

// ─── Actions ──────────────────────────────────────────────
type LessonsAction =
  | { type: "SET_LESSONS"; payload: Leccion[] }
  | { type: "SET_LOADING_LESSONS"; payload: boolean }
  | { type: "SET_CALIFICACIONES"; payload: Calificacion[] }
  | { type: "SET_LOADING_GRADES"; payload: boolean };

function lessonsReducer(state: LessonsState, action: LessonsAction): LessonsState {
  switch (action.type) {
    case "SET_LESSONS": return { ...state, lessons: action.payload, loadingLessons: false };
    case "SET_LOADING_LESSONS": return { ...state, loadingLessons: action.payload };
    case "SET_CALIFICACIONES": return { ...state, calificaciones: action.payload, loadingGrades: false };
    case "SET_LOADING_GRADES": return { ...state, loadingGrades: action.payload };
    default: return state;
  }
}

// ─── Context type ─────────────────────────────────────────
export interface LessonsContextType {
  loadingLessons: boolean;
  loadingGrades: boolean;
  lessons: Leccion[];
  setLessons: (l: Leccion[]) => void;
  calificaciones: Calificacion[];
  setCalificaciones: (c: Calificacion[]) => void;
}

const LessonsCtx = createContext<LessonsContextType | null>(null);

export function useLessonsContext(): LessonsContextType {
  const ctx = useContext(LessonsCtx);
  if (!ctx) throw new Error("useLessonsContext must be used within <LessonsProvider>");
  return ctx;
}

export function LessonsProvider({ currentUser, children }: { currentUser: string | null; children: ReactNode }) {
  const [state, dispatch] = useReducer(lessonsReducer, initialLessonsState);

  // Load lessons on mount
  useEffect(() => {
    fetchLecciones().then((lessons) => {
      dispatch({ type: "SET_LESSONS", payload: lessons });
    });
  }, []);

  // Load calificaciones when user changes
  useEffect(() => {
    if (!currentUser) {
      dispatch({ type: "SET_LOADING_GRADES", payload: false });
      return;
    }
    dispatch({ type: "SET_LOADING_GRADES", payload: true });
    fetchCalificaciones(currentUser).then((grades) => {
      dispatch({ type: "SET_CALIFICACIONES", payload: grades });
    });
  }, [currentUser]);

  const value: LessonsContextType = {
    loadingLessons: state.loadingLessons,
    loadingGrades: state.loadingGrades,
    lessons: state.lessons,
    setLessons: (l) => dispatch({ type: "SET_LESSONS", payload: l }),
    calificaciones: state.calificaciones,
    setCalificaciones: (c) => dispatch({ type: "SET_CALIFICACIONES", payload: c }),
  };

  return <LessonsCtx.Provider value={value}>{children}</LessonsCtx.Provider>;
}
