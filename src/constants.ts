/**
 * View route names used across the application.
 * Centralized to eliminate magic strings and prevent typos.
 */
export const VIEWS = {
  WELCOME: "welcome",
  LOGIN: "login",
  DOCENTE: "docente",
  ESTUDIANTE_HOME: "estudiante_home",
  ESTUDIANTE_LECCION: "estudiante_leccion",
} as const;

export type ViewType = (typeof VIEWS)[keyof typeof VIEWS];

/**
 * User roles.
 */
export const ROLES = {
  STUDENT: "STUDENT",
  TEACHER: "TEACHER",
} as const;

export type RoleType = (typeof ROLES)[keyof typeof ROLES] | null;

/**
 * Hardcoded student list for the teacher monitoring panel.
 * In a production app, this would come from an API.
 */
export const STUDENT_LIST = [
  "hitsuko.student",
  "mario.quispe",
  "ana.huaman",
  "elena.condori",
  "juan.sanchez",
] as const;

/**
 * Feedback states for the answer checking flow.
 */
export type FeedbackType = "idle" | "correct" | "incorrect";

/**
 * Flat screen types in the student walkthrough.
 */
export type ScreenType =
  | "vocabulario"
  | "gramatica"
  | "calentamiento"
  | "pronunciacion"
  | "evaluacion";

export interface WalkthroughScreen {
  type: ScreenType;
  subIndex?: number;
}
