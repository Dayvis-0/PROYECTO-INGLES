import { createContext, useContext, useReducer, type ReactNode } from "react";
import type { Leccion } from "../types";
import type { FeedbackType, WalkthroughScreen } from "../constants";

// ─── State ────────────────────────────────────────────────
interface WalkthroughState {
  walkthroughActive: boolean;
  activeLesson: Leccion | null;
  flatScreens: WalkthroughScreen[];
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
  isListeningVoice: boolean;
  voiceTranscript: string;
  voiceSimilarity: number | null;
  speechError: string | null;
  gainedGrade: number | null;
  gainedCorrect: number | null;
}

const initialWalkthroughState: WalkthroughState = {
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
  isListeningVoice: false,
  voiceTranscript: "",
  voiceSimilarity: null,
  speechError: null,
  gainedGrade: null,
  gainedCorrect: null,
};

// ─── Actions ──────────────────────────────────────────────
type WalkthroughAction =
  | { type: "SET_WALKTHROUGH_ACTIVE"; payload: boolean }
  | { type: "SET_ACTIVE_LESSON"; payload: Leccion | null }
  | { type: "SET_FLAT_SCREENS"; payload: WalkthroughScreen[] }
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

function walkthroughReducer(state: WalkthroughState, action: WalkthroughAction): WalkthroughState {
  switch (action.type) {
    case "SET_WALKTHROUGH_ACTIVE": return { ...state, walkthroughActive: action.payload };
    case "SET_ACTIVE_LESSON": return { ...state, activeLesson: action.payload };
    case "SET_FLAT_SCREENS": return { ...state, flatScreens: action.payload };
    case "SET_FLAT_SCREEN_INDEX": return { ...state, flatScreenIndex: action.payload };
    case "SET_VISTOS_VOCABULARIO": return { ...state, vistosVocabulario: action.payload };
    case "SET_KEYBOARD_MODE": return { ...state, keyboardMode: action.payload };
    case "SET_USER_TYPED_TRANSLATION": return { ...state, userTypedTranslation: action.payload };
    case "SET_SELECTED_BUBBLES": return { ...state, selectedBubbles: action.payload };
    case "SET_SCRAMBLE_BUBBLES": return { ...state, scrambleBubbles: action.payload };
    case "SET_ACTIVE_HOVER_GRAMMAR_WORD": return { ...state, activeHoverGrammarWord: action.payload };
    case "SET_SELECTED_EXAM_OPTION_INDEX": return { ...state, selectedExamOptionIndex: action.payload };
    case "SET_FEEDBACK_STATE": return { ...state, feedbackState: action.payload };
    case "SET_FEEDBACK_MESSAGE": return { ...state, feedbackMessage: action.payload };
    case "SET_CORRECT_ANSWER_REVEAL": return { ...state, correctAnswerReveal: action.payload };
    case "SET_EXAM_CORRECT_COUNT": return { ...state, examCorrectCount: typeof action.payload === "function" ? (action.payload as (prev: number) => number)(state.examCorrectCount) : action.payload };
    case "SET_IS_LISTENING_VOICE": return { ...state, isListeningVoice: action.payload };
    case "SET_VOICE_TRANSCRIPT": return { ...state, voiceTranscript: action.payload };
    case "SET_VOICE_SIMILARITY": return { ...state, voiceSimilarity: action.payload };
    case "SET_SPEECH_ERROR": return { ...state, speechError: action.payload };
    case "SET_GAINED_GRADE": return { ...state, gainedGrade: action.payload };
    case "SET_GAINED_CORRECT": return { ...state, gainedCorrect: action.payload };
    default: return state;
  }
}

// ─── Context type ─────────────────────────────────────────
export interface WalkthroughContextType {
  walkthroughActive: boolean;
  setWalkthroughActive: (b: boolean) => void;
  activeLesson: Leccion | null;
  setActiveLesson: (l: Leccion | null) => void;
  flatScreens: WalkthroughScreen[];
  setFlatScreens: (s: WalkthroughScreen[]) => void;
  flatScreenIndex: number;
  setFlatScreenIndex: (n: number) => void;
  vistosVocabulario: string[];
  setVistosVocabulario: (s: string[]) => void;
  initWalkthrough: (leccion: Leccion) => void;
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
  isListeningVoice: boolean;
  setIsListeningVoice: (b: boolean) => void;
  voiceTranscript: string;
  setVoiceTranscript: (s: string) => void;
  voiceSimilarity: number | null;
  setVoiceSimilarity: (n: number | null) => void;
  speechError: string | null;
  setSpeechError: (e: string | null) => void;
  gainedGrade: number | null;
  setGainedGrade: (n: number | null) => void;
  gainedCorrect: number | null;
  setGainedCorrect: (n: number | null) => void;
}

const WalkthroughCtx = createContext<WalkthroughContextType | null>(null);

export function useWalkthroughContext(): WalkthroughContextType {
  const ctx = useContext(WalkthroughCtx);
  if (!ctx) throw new Error("useWalkthroughContext must be used within <WalkthroughProvider>");
  return ctx;
}

export function WalkthroughProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(walkthroughReducer, initialWalkthroughState);

  const value: WalkthroughContextType = {
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
    initWalkthrough: (leccion) => {
      dispatch({ type: "SET_ACTIVE_LESSON", payload: leccion });

      const screens: WalkthroughScreen[] = [
        { type: "vocabulario" },
        { type: "gramatica" },
        ...leccion.calentamiento.map((_, i) => ({ type: "construccion-de-oraciones" as const, subIndex: i })),
        ...(leccion.frasesPronunciacion.length > 0
          ? leccion.frasesPronunciacion
          : [leccion.calentamiento[0]?.fraseMetaEn || "English is practical and beautiful"]
        ).map((_, i) => ({ type: "pronunciacion" as const, subIndex: i })),
        ...leccion.evaluacion.map((_, i) => ({ type: "evaluacion" as const, subIndex: i })),
      ];

      dispatch({ type: "SET_FLAT_SCREENS", payload: screens });
      dispatch({ type: "SET_FLAT_SCREEN_INDEX", payload: 0 });
      dispatch({ type: "SET_VISTOS_VOCABULARIO", payload: [] });
      dispatch({ type: "SET_EXAM_CORRECT_COUNT", payload: 0 });
      dispatch({ type: "SET_FEEDBACK_STATE", payload: "idle" });
      dispatch({ type: "SET_FEEDBACK_MESSAGE", payload: "" });
      dispatch({ type: "SET_CORRECT_ANSWER_REVEAL", payload: "" });
      dispatch({ type: "SET_USER_TYPED_TRANSLATION", payload: "" });
      dispatch({ type: "SET_SELECTED_BUBBLES", payload: [] });
      dispatch({ type: "SET_VOICE_SIMILARITY", payload: null });
      dispatch({ type: "SET_VOICE_TRANSCRIPT", payload: "" });
      dispatch({ type: "SET_SELECTED_EXAM_OPTION_INDEX", payload: null });
      dispatch({ type: "SET_GAINED_GRADE", payload: null });
      dispatch({ type: "SET_GAINED_CORRECT", payload: null });
      dispatch({ type: "SET_WALKTHROUGH_ACTIVE", payload: true });

      if (leccion.formulaGramatica) {
        dispatch({ type: "SET_ACTIVE_HOVER_GRAMMAR_WORD", payload: 0 });
      }
    },
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
    isListeningVoice: state.isListeningVoice,
    setIsListeningVoice: (b) => dispatch({ type: "SET_IS_LISTENING_VOICE", payload: b }),
    voiceTranscript: state.voiceTranscript,
    setVoiceTranscript: (s) => dispatch({ type: "SET_VOICE_TRANSCRIPT", payload: s }),
    voiceSimilarity: state.voiceSimilarity,
    setVoiceSimilarity: (n) => dispatch({ type: "SET_VOICE_SIMILARITY", payload: n }),
    speechError: state.speechError,
    setSpeechError: (e) => dispatch({ type: "SET_SPEECH_ERROR", payload: e }),
    gainedGrade: state.gainedGrade,
    setGainedGrade: (n) => dispatch({ type: "SET_GAINED_GRADE", payload: n }),
    gainedCorrect: state.gainedCorrect,
    setGainedCorrect: (n) => dispatch({ type: "SET_GAINED_CORRECT", payload: n }),
  };

  return <WalkthroughCtx.Provider value={value}>{children}</WalkthroughCtx.Provider>;
}
