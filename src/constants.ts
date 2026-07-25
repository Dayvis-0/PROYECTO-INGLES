/**
 * User roles.
 */
export const ROLES = {
  STUDENT: "STUDENT",
  TEACHER: "TEACHER",
} as const;

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
  | "construccion-de-oraciones"
  | "pronunciacion"
  | "evaluacion";

export interface WalkthroughScreen {
  type: ScreenType;
  subIndex?: number;
}

/**
 * Umbral de aprobación para lecciones (nota sobre 20).
 * Se usa tanto en UI como en BD para que sean consistentes.
 */
export const PASS_THRESHOLD = 14;
export const MAX_SCORE = 20;
