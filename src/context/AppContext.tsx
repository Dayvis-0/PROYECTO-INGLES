import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  type ReactNode,
} from "react";
import type {
  Leccion,
  Calificacion,
  EjercicioCalentamiento,
  PreguntaEvaluacion,
  VocabularioItem,
} from "../types";
import {
  getStoredLessons,
  getStoredCalificaciones,
} from "../data";

// ─── Type Helpers ────────────────────────────────────────
type ViewType =
  | "welcome"
  | "login"
  | "docente"
  | "estudiante_home"
  | "estudiante_leccion";

type RoleType = "STUDENT" | "TEACHER" | null;
type FeedbackType = "idle" | "correct" | "incorrect";

// ─── State shape (internal) ──────────────────────────────
interface AppState {
  // View & Routing
  currentView: ViewType;
  selectedRole: RoleType;
  // Auth
  usernameInput: string;
  passwordInput: string;
  loginError: string | null;
  currentUser: string | null;
  // Database
  lessons: Leccion[];
  calificaciones: Calificacion[];
  // Teacher Form
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
  // Student Walkthrough
  walkthroughActive: boolean;
  activeLesson: Leccion | null;
  flatScreens: any[];
  flatScreenIndex: number;
  vistosVocabulario: string[];
  keyboardMode: boolean;
  userTypedTranslation: string;
  selectedBubbles: string[];
  scrambleBubbles: string[];
  activeHoverGrammarWord: number;
  selectedExamOptionIndex: number | null;
  feedbackState: FeedbackType;
  feedbackMessage: string;
  correctAnswerReveal: string;
  examCorrectCount: number;
  // Speech Recognition
  isListeningVoice: boolean;
  voiceTranscript: string;
  voiceSimilarity: number | null;
  speechError: string | null;
  // Congratulations Screen
  gainedGrade: number | null;
  gainedCorrect: number | null;
}

// ─── Initial state ────────────────────────────────────────
const initialState: AppState = {
  // View & Routing
  currentView: "welcome",
  selectedRole: null,
  // Auth
  usernameInput: "",
  passwordInput: "",
  loginError: null,
  currentUser: null,
  // Database
  lessons: [],
  calificaciones: [],
  // Teacher Form
  formTitulo: "",
  formImagenGramatica: "present_simple.png",
  formFormulaGramatica: "",
  formFrasesPronunciacion: [""],
  formCalentamiento: [{ fraseMetaEn: "", fraseMetaEs: "" }],
  formEvaluacion: [
    {
      pregunta: "",
      opciones: [
        { texto: "", correcta: true },
        { texto: "", correcta: false },
        { texto: "", correcta: false },
        { texto: "", correcta: false },
      ],
    },
  ],
  editingLessonId: null,
  teacherFormError: null,
  teacherTab: "avance",
  expandedStudents: {},
  formEjemploOracion: "",
  formEjemploRoles: [],
  formVocabularioDetallado: [],
  // Student Walkthrough
  walkthroughActive: false,
  activeLesson: null,
  flatScreens: [],
  flatScreenIndex: 0,
  vistosVocabulario: [],
  keyboardMode: false,
  userTypedTranslation: "",
  selectedBubbles: [],
  scrambleBubbles: [],
  activeHoverGrammarWord: 0,
  selectedExamOptionIndex: null,
  feedbackState: "idle",
  feedbackMessage: "",
  correctAnswerReveal: "",
  examCorrectCount: 0,
  // Speech Recognition
  isListeningVoice: false,
  voiceTranscript: "",
  voiceSimilarity: null,
  speechError: null,
  // Congratulations Screen
  gainedGrade: null,
  gainedCorrect: null,
};

// ─── Actions ──────────────────────────────────────────────
type AppAction =
  | { type: "SET_CURRENT_VIEW"; payload: ViewType }
  | { type: "SET_SELECTED_ROLE"; payload: RoleType }
  | { type: "SET_USERNAME_INPUT"; payload: string }
  | { type: "SET_PASSWORD_INPUT"; payload: string }
  | { type: "SET_LOGIN_ERROR"; payload: string | null }
  | { type: "SET_CURRENT_USER"; payload: string | null }
  | { type: "SET_LESSONS"; payload: Leccion[] }
  | { type: "SET_CALIFICACIONES"; payload: Calificacion[] }
  | { type: "SET_FORM_TITULO"; payload: string }
  | { type: "SET_FORM_IMAGEN_GRAMATICA"; payload: string }
  | { type: "SET_FORM_FORMULA_GRAMATICA"; payload: string }
  | { type: "SET_FORM_FRASES_PRONUNCIACION"; payload: string[] }
  | { type: "SET_FORM_CALENTAMIENTO"; payload: EjercicioCalentamiento[] }
  | { type: "SET_FORM_EVALUACION"; payload: PreguntaEvaluacion[] }
  | { type: "SET_EDITING_LESSON_ID"; payload: string | null }
  | { type: "SET_TEACHER_FORM_ERROR"; payload: string | null }
  | { type: "SET_TEACHER_TAB"; payload: "avance" | "notas" }
  | { type: "SET_EXPANDED_STUDENTS"; payload: Record<string, boolean> | ((prev: Record<string, boolean>) => Record<string, boolean>) }
  | { type: "SET_FORM_EJEMPLO_ORACION"; payload: string }
  | { type: "SET_FORM_EJEMPLO_ROLES"; payload: string[] }
  | { type: "SET_FORM_VOCABULARIO_DETALLADO"; payload: VocabularioItem[] }
  | { type: "SET_WALKTHROUGH_ACTIVE"; payload: boolean }
  | { type: "SET_ACTIVE_LESSON"; payload: Leccion | null }
  | { type: "SET_FLAT_SCREENS"; payload: any[] }
  | { type: "SET_FLAT_SCREEN_INDEX"; payload: number }
  | { type: "SET_VISTOS_VOCABULARIO"; payload: string[] }
  | { type: "SET_KEYBOARD_MODE"; payload: boolean }
  | { type: "SET_USER_TYPED_TRANSLATION"; payload: string }
  | { type: "SET_SELECTED_BUBBLES"; payload: string[] }
  | { type: "SET_SCRAMBLE_BUBBLES"; payload: string[] }
  | { type: "SET_ACTIVE_HOVER_GRAMMAR_WORD"; payload: number }
  | { type: "SET_SELECTED_EXAM_OPTION_INDEX"; payload: number | null }
  | { type: "SET_FEEDBACK_STATE"; payload: FeedbackType }
  | { type: "SET_FEEDBACK_MESSAGE"; payload: string }
  | { type: "SET_CORRECT_ANSWER_REVEAL"; payload: string }
  | { type: "SET_EXAM_CORRECT_COUNT"; payload: number | ((prev: number) => number) }
  | { type: "SET_IS_LISTENING_VOICE"; payload: boolean }
  | { type: "SET_VOICE_TRANSCRIPT"; payload: string }
  | { type: "SET_VOICE_SIMILARITY"; payload: number | null }
  | { type: "SET_SPEECH_ERROR"; payload: string | null }
  | { type: "SET_GAINED_GRADE"; payload: number | null }
  | { type: "SET_GAINED_CORRECT"; payload: number | null };

// ─── Reducer ──────────────────────────────────────────────
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_CURRENT_VIEW":
      return { ...state, currentView: action.payload };
    case "SET_SELECTED_ROLE":
      return { ...state, selectedRole: action.payload };
    case "SET_USERNAME_INPUT":
      return { ...state, usernameInput: action.payload };
    case "SET_PASSWORD_INPUT":
      return { ...state, passwordInput: action.payload };
    case "SET_LOGIN_ERROR":
      return { ...state, loginError: action.payload };
    case "SET_CURRENT_USER":
      return { ...state, currentUser: action.payload };
    case "SET_LESSONS":
      return { ...state, lessons: action.payload };
    case "SET_CALIFICACIONES":
      return { ...state, calificaciones: action.payload };
    case "SET_FORM_TITULO":
      return { ...state, formTitulo: action.payload };
    case "SET_FORM_IMAGEN_GRAMATICA":
      return { ...state, formImagenGramatica: action.payload };
    case "SET_FORM_FORMULA_GRAMATICA":
      return { ...state, formFormulaGramatica: action.payload };
    case "SET_FORM_FRASES_PRONUNCIACION":
      return { ...state, formFrasesPronunciacion: action.payload };
    case "SET_FORM_CALENTAMIENTO":
      return { ...state, formCalentamiento: action.payload };
    case "SET_FORM_EVALUACION":
      return { ...state, formEvaluacion: action.payload };
    case "SET_EDITING_LESSON_ID":
      return { ...state, editingLessonId: action.payload };
    case "SET_TEACHER_FORM_ERROR":
      return { ...state, teacherFormError: action.payload };
    case "SET_TEACHER_TAB":
      return { ...state, teacherTab: action.payload };
    case "SET_EXPANDED_STUDENTS":
      return {
        ...state,
        expandedStudents:
          typeof action.payload === "function"
            ? (action.payload as (prev: Record<string, boolean>) => Record<string, boolean>)(state.expandedStudents)
            : action.payload,
      };
    case "SET_FORM_EJEMPLO_ORACION":
      return { ...state, formEjemploOracion: action.payload };
    case "SET_FORM_EJEMPLO_ROLES":
      return { ...state, formEjemploRoles: action.payload };
    case "SET_FORM_VOCABULARIO_DETALLADO":
      return { ...state, formVocabularioDetallado: action.payload };
    case "SET_WALKTHROUGH_ACTIVE":
      return { ...state, walkthroughActive: action.payload };
    case "SET_ACTIVE_LESSON":
      return { ...state, activeLesson: action.payload };
    case "SET_FLAT_SCREENS":
      return { ...state, flatScreens: action.payload };
    case "SET_FLAT_SCREEN_INDEX":
      return { ...state, flatScreenIndex: action.payload };
    case "SET_VISTOS_VOCABULARIO":
      return { ...state, vistosVocabulario: action.payload };
    case "SET_KEYBOARD_MODE":
      return { ...state, keyboardMode: action.payload };
    case "SET_USER_TYPED_TRANSLATION":
      return { ...state, userTypedTranslation: action.payload };
    case "SET_SELECTED_BUBBLES":
      return { ...state, selectedBubbles: action.payload };
    case "SET_SCRAMBLE_BUBBLES":
      return { ...state, scrambleBubbles: action.payload };
    case "SET_ACTIVE_HOVER_GRAMMAR_WORD":
      return { ...state, activeHoverGrammarWord: action.payload };
    case "SET_SELECTED_EXAM_OPTION_INDEX":
      return { ...state, selectedExamOptionIndex: action.payload };
    case "SET_FEEDBACK_STATE":
      return { ...state, feedbackState: action.payload };
    case "SET_FEEDBACK_MESSAGE":
      return { ...state, feedbackMessage: action.payload };
    case "SET_CORRECT_ANSWER_REVEAL":
      return { ...state, correctAnswerReveal: action.payload };
    case "SET_EXAM_CORRECT_COUNT":
      return {
        ...state,
        examCorrectCount:
          typeof action.payload === "function"
            ? (action.payload as (prev: number) => number)(state.examCorrectCount)
            : action.payload,
      };
    case "SET_IS_LISTENING_VOICE":
      return { ...state, isListeningVoice: action.payload };
    case "SET_VOICE_TRANSCRIPT":
      return { ...state, voiceTranscript: action.payload };
    case "SET_VOICE_SIMILARITY":
      return { ...state, voiceSimilarity: action.payload };
    case "SET_SPEECH_ERROR":
      return { ...state, speechError: action.payload };
    case "SET_GAINED_GRADE":
      return { ...state, gainedGrade: action.payload };
    case "SET_GAINED_CORRECT":
      return { ...state, gainedCorrect: action.payload };
    default:
      return state;
  }
}

// ─── Context Type (PUBLIC interface — unchanged) ─────────
interface AppContextType {
  // View & Routing
  currentView: ViewType;
  setCurrentView: (v: ViewType) => void;
  selectedRole: RoleType;
  setSelectedRole: (r: RoleType) => void;

  // Auth
  usernameInput: string;
  setUsernameInput: (s: string) => void;
  passwordInput: string;
  setPasswordInput: (s: string) => void;
  loginError: string | null;
  setLoginError: (e: string | null) => void;
  currentUser: string | null;
  setCurrentUser: (u: string | null) => void;

  // Database
  lessons: Leccion[];
  setLessons: (l: Leccion[]) => void;
  calificaciones: Calificacion[];
  setCalificaciones: (c: Calificacion[]) => void;

  // Teacher Form
  formTitulo: string;
  setFormTitulo: (s: string) => void;
  formImagenGramatica: string;
  setFormImagenGramatica: (s: string) => void;
  formFormulaGramatica: string;
  setFormFormulaGramatica: (s: string) => void;
  formFrasesPronunciacion: string[];
  setFormFrasesPronunciacion: (s: string[]) => void;
  formCalentamiento: EjercicioCalentamiento[];
  setFormCalentamiento: (e: EjercicioCalentamiento[]) => void;
  formEvaluacion: PreguntaEvaluacion[];
  setFormEvaluacion: (p: PreguntaEvaluacion[]) => void;
  editingLessonId: string | null;
  setEditingLessonId: (id: string | null) => void;
  teacherFormError: string | null;
  setTeacherFormError: (e: string | null) => void;
  teacherTab: "avance" | "notas";
  setTeacherTab: (t: "avance" | "notas") => void;
  expandedStudents: Record<string, boolean>;
  setExpandedStudents: (
    e: Record<string, boolean> | ((prev: Record<string, boolean>) => Record<string, boolean>)
  ) => void;
  formEjemploOracion: string;
  setFormEjemploOracion: (s: string) => void;
  formEjemploRoles: string[];
  setFormEjemploRoles: (s: string[]) => void;
  formVocabularioDetallado: VocabularioItem[];
  setFormVocabularioDetallado: (v: VocabularioItem[]) => void;

  // Student Walkthrough
  walkthroughActive: boolean;
  setWalkthroughActive: (b: boolean) => void;
  activeLesson: Leccion | null;
  setActiveLesson: (l: Leccion | null) => void;
  flatScreens: any[];
  setFlatScreens: (s: any[]) => void;
  flatScreenIndex: number;
  setFlatScreenIndex: (n: number) => void;
  vistosVocabulario: string[];
  setVistosVocabulario: (s: string[]) => void;
  keyboardMode: boolean;
  setKeyboardMode: (b: boolean) => void;
  userTypedTranslation: string;
  setUserTypedTranslation: (s: string) => void;
  selectedBubbles: string[];
  setSelectedBubbles: (s: string[]) => void;
  scrambleBubbles: string[];
  setScrambleBubbles: (s: string[]) => void;
  activeHoverGrammarWord: number;
  setActiveHoverGrammarWord: (n: number) => void;
  selectedExamOptionIndex: number | null;
  setSelectedExamOptionIndex: (n: number | null) => void;
  feedbackState: FeedbackType;
  setFeedbackState: (f: FeedbackType) => void;
  feedbackMessage: string;
  setFeedbackMessage: (s: string) => void;
  correctAnswerReveal: string;
  setCorrectAnswerReveal: (s: string) => void;
  examCorrectCount: number;
  setExamCorrectCount: (n: number | ((prev: number) => number)) => void;

  // Speech Recognition
  isListeningVoice: boolean;
  setIsListeningVoice: (b: boolean) => void;
  voiceTranscript: string;
  setVoiceTranscript: (s: string) => void;
  voiceSimilarity: number | null;
  setVoiceSimilarity: (n: number | null) => void;
  speechError: string | null;
  setSpeechError: (e: string | null) => void;

  // Congratulations Screen
  gainedGrade: number | null;
  setGainedGrade: (n: number | null) => void;
  gainedCorrect: number | null;
  setGainedCorrect: (n: number | null) => void;
}

// ─── Default values (placeholder, never used directly) ───
const AppContext = createContext<AppContextType | null>(null);

// ─── Hook ────────────────────────────────────────────────
export function useAppContext(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useAppContext must be used within <AppProvider>");
  }
  return ctx;
}

// ─── Provider ────────────────────────────────────────────
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load from localStorage on mount
  useEffect(() => {
    dispatch({ type: "SET_LESSONS", payload: getStoredLessons() });
    dispatch({ type: "SET_CALIFICACIONES", payload: getStoredCalificaciones() });
  }, []);

  // ── Wrapper setters (keep the same public API) ──
  const value: AppContextType = {
    // View & Routing
    currentView: state.currentView,
    setCurrentView: (v) => dispatch({ type: "SET_CURRENT_VIEW", payload: v }),
    selectedRole: state.selectedRole,
    setSelectedRole: (r) => dispatch({ type: "SET_SELECTED_ROLE", payload: r }),

    // Auth
    usernameInput: state.usernameInput,
    setUsernameInput: (s) => dispatch({ type: "SET_USERNAME_INPUT", payload: s }),
    passwordInput: state.passwordInput,
    setPasswordInput: (s) => dispatch({ type: "SET_PASSWORD_INPUT", payload: s }),
    loginError: state.loginError,
    setLoginError: (e) => dispatch({ type: "SET_LOGIN_ERROR", payload: e }),
    currentUser: state.currentUser,
    setCurrentUser: (u) => dispatch({ type: "SET_CURRENT_USER", payload: u }),

    // Database
    lessons: state.lessons,
    setLessons: (l) => dispatch({ type: "SET_LESSONS", payload: l }),
    calificaciones: state.calificaciones,
    setCalificaciones: (c) => dispatch({ type: "SET_CALIFICACIONES", payload: c }),

    // Teacher Form
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

    // Student Walkthrough
    walkthroughActive: state.walkthroughActive,
    setWalkthroughActive: (b) => dispatch({ type: "SET_WALKTHROUGH_ACTIVE", payload: b }),
    activeLesson: state.activeLesson,
    setActiveLesson: (l) => dispatch({ type: "SET_ACTIVE_LESSON", payload: l }),
    flatScreens: state.flatScreens,
    setFlatScreens: (s) => dispatch({ type: "SET_FLAT_SCREENS", payload: s }),
    flatScreenIndex: state.flatScreenIndex,
    setFlatScreenIndex: (n) => dispatch({ type: "SET_FLAT_SCREEN_INDEX", payload: n }),
    vistosVocabulario: state.vistosVocabulario,
    setVistosVocabulario: (s) => dispatch({ type: "SET_VISTOS_VOCABULARIO", payload: s }),
    keyboardMode: state.keyboardMode,
    setKeyboardMode: (b) => dispatch({ type: "SET_KEYBOARD_MODE", payload: b }),
    userTypedTranslation: state.userTypedTranslation,
    setUserTypedTranslation: (s) => dispatch({ type: "SET_USER_TYPED_TRANSLATION", payload: s }),
    selectedBubbles: state.selectedBubbles,
    setSelectedBubbles: (s) => dispatch({ type: "SET_SELECTED_BUBBLES", payload: s }),
    scrambleBubbles: state.scrambleBubbles,
    setScrambleBubbles: (s) => dispatch({ type: "SET_SCRAMBLE_BUBBLES", payload: s }),
    activeHoverGrammarWord: state.activeHoverGrammarWord,
    setActiveHoverGrammarWord: (n) => dispatch({ type: "SET_ACTIVE_HOVER_GRAMMAR_WORD", payload: n }),
    selectedExamOptionIndex: state.selectedExamOptionIndex,
    setSelectedExamOptionIndex: (n) => dispatch({ type: "SET_SELECTED_EXAM_OPTION_INDEX", payload: n }),
    feedbackState: state.feedbackState,
    setFeedbackState: (f) => dispatch({ type: "SET_FEEDBACK_STATE", payload: f }),
    feedbackMessage: state.feedbackMessage,
    setFeedbackMessage: (s) => dispatch({ type: "SET_FEEDBACK_MESSAGE", payload: s }),
    correctAnswerReveal: state.correctAnswerReveal,
    setCorrectAnswerReveal: (s) => dispatch({ type: "SET_CORRECT_ANSWER_REVEAL", payload: s }),
    examCorrectCount: state.examCorrectCount,
    setExamCorrectCount: (n) => dispatch({ type: "SET_EXAM_CORRECT_COUNT", payload: n }),

    // Speech Recognition
    isListeningVoice: state.isListeningVoice,
    setIsListeningVoice: (b) => dispatch({ type: "SET_IS_LISTENING_VOICE", payload: b }),
    voiceTranscript: state.voiceTranscript,
    setVoiceTranscript: (s) => dispatch({ type: "SET_VOICE_TRANSCRIPT", payload: s }),
    voiceSimilarity: state.voiceSimilarity,
    setVoiceSimilarity: (n) => dispatch({ type: "SET_VOICE_SIMILARITY", payload: n }),
    speechError: state.speechError,
    setSpeechError: (e) => dispatch({ type: "SET_SPEECH_ERROR", payload: e }),

    // Congratulations Screen
    gainedGrade: state.gainedGrade,
    setGainedGrade: (n) => dispatch({ type: "SET_GAINED_GRADE", payload: n }),
    gainedCorrect: state.gainedCorrect,
    setGainedCorrect: (n) => dispatch({ type: "SET_GAINED_CORRECT", payload: n }),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
