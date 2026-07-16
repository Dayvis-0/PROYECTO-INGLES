import {
  createContext,
  useContext,
  useState,
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

// ─── Context Type ────────────────────────────────────────
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
  // ── View & Routing ──
  const [currentView, setCurrentView] = useState<ViewType>("welcome");
  const [selectedRole, setSelectedRole] = useState<RoleType>(null);

  // ── Auth ──
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  // ── Database ──
  const [lessons, setLessons] = useState<Leccion[]>([]);
  const [calificaciones, setCalificaciones] = useState<Calificacion[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    setLessons(getStoredLessons());
    setCalificaciones(getStoredCalificaciones());
  }, []);

  // ── Teacher Form ──
  const [formTitulo, setFormTitulo] = useState("");
  const [formImagenGramatica, setFormImagenGramatica] =
    useState("present_simple.png");
  const [formFormulaGramatica, setFormFormulaGramatica] = useState("");
  const [formFrasesPronunciacion, setFormFrasesPronunciacion] = useState<
    string[]
  >([""]);
  const [formCalentamiento, setFormCalentamiento] = useState<
    EjercicioCalentamiento[]
  >([{ fraseMetaEn: "", fraseMetaEs: "" }]);
  const [formEvaluacion, setFormEvaluacion] = useState<PreguntaEvaluacion[]>([
    {
      pregunta: "",
      opciones: [
        { texto: "", correcta: true },
        { texto: "", correcta: false },
        { texto: "", correcta: false },
        { texto: "", correcta: false },
      ],
    },
  ]);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [teacherFormError, setTeacherFormError] = useState<string | null>(null);
  const [teacherTab, setTeacherTab] = useState<"avance" | "notas">("avance");
  const [expandedStudents, setExpandedStudents] = useState<
    Record<string, boolean>
  >({});
  const [formEjemploOracion, setFormEjemploOracion] = useState("");
  const [formEjemploRoles, setFormEjemploRoles] = useState<string[]>([]);
  const [formVocabularioDetallado, setFormVocabularioDetallado] = useState<
    VocabularioItem[]
  >([]);

  // ── Student Walkthrough ──
  const [walkthroughActive, setWalkthroughActive] = useState(false);
  const [activeLesson, setActiveLesson] = useState<Leccion | null>(null);
  const [flatScreens, setFlatScreens] = useState<any[]>([]);
  const [flatScreenIndex, setFlatScreenIndex] = useState(0);
  const [vistosVocabulario, setVistosVocabulario] = useState<string[]>([]);
  const [keyboardMode, setKeyboardMode] = useState(false);
  const [userTypedTranslation, setUserTypedTranslation] = useState("");
  const [selectedBubbles, setSelectedBubbles] = useState<string[]>([]);
  const [scrambleBubbles, setScrambleBubbles] = useState<string[]>([]);
  const [activeHoverGrammarWord, setActiveHoverGrammarWord] = useState(0);
  const [selectedExamOptionIndex, setSelectedExamOptionIndex] = useState<
    number | null
  >(null);
  const [feedbackState, setFeedbackState] =
    useState<FeedbackType>("idle");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [correctAnswerReveal, setCorrectAnswerReveal] = useState("");
  const [examCorrectCount, setExamCorrectCount] = useState(0);

  // ── Speech Recognition ──
  const [isListeningVoice, setIsListeningVoice] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [voiceSimilarity, setVoiceSimilarity] = useState<number | null>(null);
  const [speechError, setSpeechError] = useState<string | null>(null);

  // ── Congratulations Screen ──
  const [gainedGrade, setGainedGrade] = useState<number | null>(null);
  const [gainedCorrect, setGainedCorrect] = useState<number | null>(null);

  // ── Value ──
  const value: AppContextType = {
    // View & Routing
    currentView,
    setCurrentView,
    selectedRole,
    setSelectedRole,

    // Auth
    usernameInput,
    setUsernameInput,
    passwordInput,
    setPasswordInput,
    loginError,
    setLoginError,
    currentUser,
    setCurrentUser,

    // Database
    lessons,
    setLessons,
    calificaciones,
    setCalificaciones,

    // Teacher Form
    formTitulo,
    setFormTitulo,
    formImagenGramatica,
    setFormImagenGramatica,
    formFormulaGramatica,
    setFormFormulaGramatica,
    formFrasesPronunciacion,
    setFormFrasesPronunciacion,
    formCalentamiento,
    setFormCalentamiento,
    formEvaluacion,
    setFormEvaluacion,
    editingLessonId,
    setEditingLessonId,
    teacherFormError,
    setTeacherFormError,
    teacherTab,
    setTeacherTab,
    expandedStudents,
    setExpandedStudents,
    formEjemploOracion,
    setFormEjemploOracion,
    formEjemploRoles,
    setFormEjemploRoles,
    formVocabularioDetallado,
    setFormVocabularioDetallado,

    // Student Walkthrough
    walkthroughActive,
    setWalkthroughActive,
    activeLesson,
    setActiveLesson,
    flatScreens,
    setFlatScreens,
    flatScreenIndex,
    setFlatScreenIndex,
    vistosVocabulario,
    setVistosVocabulario,
    keyboardMode,
    setKeyboardMode,
    userTypedTranslation,
    setUserTypedTranslation,
    selectedBubbles,
    setSelectedBubbles,
    scrambleBubbles,
    setScrambleBubbles,
    activeHoverGrammarWord,
    setActiveHoverGrammarWord,
    selectedExamOptionIndex,
    setSelectedExamOptionIndex,
    feedbackState,
    setFeedbackState,
    feedbackMessage,
    setFeedbackMessage,
    correctAnswerReveal,
    setCorrectAnswerReveal,
    examCorrectCount,
    setExamCorrectCount,

    // Speech Recognition
    isListeningVoice,
    setIsListeningVoice,
    voiceTranscript,
    setVoiceTranscript,
    voiceSimilarity,
    setVoiceSimilarity,
    speechError,
    setSpeechError,

    // Congratulations Screen
    gainedGrade,
    setGainedGrade,
    gainedCorrect,
    setGainedCorrect,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
