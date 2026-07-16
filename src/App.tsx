import React, { useState, useEffect, useRef } from "react";
import { 
  Award, 
  GraduationCap, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Volume2, 
  Mic, 
  MicOff, 
  LogOut, 
  RefreshCw, 
  ChevronLeft, 
  ChevronDown,
  ChevronUp,
  Lock, 
  BookOpen, 
  Star, 
  Sparkles, 
  TrendingUp, 
  Calendar, 
  AlertCircle, 
  Play,
  RotateCcw,
  CheckCircle2,
  Users
} from "lucide-react";
import { Leccion, Calificacion, EjercicioCalentamiento, PreguntaEvaluacion, VocabularioItem } from "./types";
import { 
  getStoredLessons, 
  saveStoredLessons, 
  getStoredCalificaciones, 
  saveStoredCalificaciones,
  PRESENT_SIMPLE_SVG,
  PRESENT_CONTINUOUS_SVG
} from "./data";
import { isWordSimilarityMatch } from "./utils/similarity";
import { cleanCompare } from "./utils/cleaners";
import { speakWord } from "./utils/tts";
import { getInteractiveGrammarSegments } from "./utils/grammar";
export default function App() {
  // --- View and Routing State ---
  const [currentView, setCurrentView] = useState<"welcome" | "login" | "docente" | "estudiante_home" | "estudiante_leccion">("welcome");
  const [selectedRole, setSelectedRole] = useState<"STUDENT" | "TEACHER" | null>(null);
  
  // --- User State ---
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  // --- Database State (Reactive) ---
  const [lessons, setLessons] = useState<Leccion[]>([]);
  const [calificaciones, setCalificaciones] = useState<Calificacion[]>([]);

  // Load from database on startup
  useEffect(() => {
    setLessons(getStoredLessons());
    setCalificaciones(getStoredCalificaciones());
    
    // Warm up/prime the speech synthesis engine to avoid delayed load of voices returning empty representation
    if ("speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  // --- Teacher Form State (Dynamic) ---
  const [formTitulo, setFormTitulo] = useState("");
  const [formImagenGramatica, setFormImagenGramatica] = useState("present_simple.png");
  const [formFormulaGramatica, setFormFormulaGramatica] = useState("");
  const [formFrasesPronunciacion, setFormFrasesPronunciacion] = useState<string[]>([""]);
  const [formCalentamiento, setFormCalentamiento] = useState<EjercicioCalentamiento[]>([
    { fraseMetaEn: "", fraseMetaEs: "" }
  ]);
  const [formEvaluacion, setFormEvaluacion] = useState<PreguntaEvaluacion[]>([
    {
      pregunta: "",
      opciones: [
        { texto: "", correcta: true },
        { texto: "", correcta: false },
        { texto: "", correcta: false },
        { texto: "", correcta: false }
      ]
    }
  ]);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [teacherFormError, setTeacherFormError] = useState<string | null>(null);
  const [teacherTab, setTeacherTab] = useState<"avance" | "notas">("avance");
  const [expandedStudents, setExpandedStudents] = useState<Record<string, boolean>>({});

  // New form states for lesson example sentence and detailed vocabulary
  const [formEjemploOracion, setFormEjemploOracion] = useState("");
  const [formEjemploRoles, setFormEjemploRoles] = useState<string[]>([]);
  const [formVocabularioDetallado, setFormVocabularioDetallado] = useState<VocabularioItem[]>([]);

  // --- Student Walkthrough State ---
  const [walkthroughActive, setWalkthroughActive] = useState<boolean>(false);
  const [activeLesson, setActiveLesson] = useState<Leccion | null>(null);
  const [flatScreens, setFlatScreens] = useState<any[]>([]);
  const [flatScreenIndex, setFlatScreenIndex] = useState<number>(0);
  const [vistosVocabulario, setVistosVocabulario] = useState<string[]>([]);
  
  // Interactive Walkthrough States per Screen
  const [keyboardMode, setKeyboardMode] = useState<boolean>(false);
  const [userTypedTranslation, setUserTypedTranslation] = useState<string>("");
  const [selectedBubbles, setSelectedBubbles] = useState<string[]>([]);
  const [scrambleBubbles, setScrambleBubbles] = useState<string[]>([]);

  // Interactive grammar hover states
  const [activeHoverGrammarWord, setActiveHoverGrammarWord] = useState<number>(0);

  // Helper determining the interactive segments breakdown for Step 2 corresponding to any lesson
  // Selected option for exam question
  
  // Selected option for exam question
  const [selectedExamOptionIndex, setSelectedExamOptionIndex] = useState<number | null>(null);

  // Feedback banner state RNF01
  const [feedbackState, setFeedbackState] = useState<"idle" | "correct" | "incorrect">("idle");
  const [feedbackMessage, setFeedbackMessage] = useState<string>("");
  const [correctAnswerReveal, setCorrectAnswerReveal] = useState<string>("");

  // Score keeping
  const [examCorrectCount, setExamCorrectCount] = useState<number>(0);
  
  // Speech Recognition State
  const [isListeningVoice, setIsListeningVoice] = useState<boolean>(false);
  const [voiceTranscript, setVoiceTranscript] = useState<string>("");
  const [voiceSimilarity, setVoiceSimilarity] = useState<number | null>(null);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  
  // Congratulations Screen State
  
  // Congratulations Screen State
  const [gainedGrade, setGainedGrade] = useState<number | null>(null);
  const [gainedCorrect, setGainedCorrect] = useState<number | null>(null);

  // Sound recognition using web Speech Recognition API
  const startVoiceRecording = (targetSentence: string) => {
    // 1. Cancel previous pending recognition instance to prevent "Recognition already started" DOM exception
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (err) {
        console.warn("Error aborting previous recognition:", err);
      }
      recognitionRef.current = null;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechError("La API de reconocimiento de voz no está soportada en tu navegador (usa Chrome, Edge o Safari). Iniciando práctica simulada para que continúes sin detenerte.");
      // Fallback simulation for unsupported browsers
      setIsListeningVoice(true);
      setTimeout(() => {
        setIsListeningVoice(false);
        setVoiceTranscript(targetSentence);
        setVoiceSimilarity(100);
        setSpeechError(null);
      }, 2000);
      return;
    }

    try {
      setSpeechError(null);
      const rec = new SpeechRecognition();
      rec.lang = "en-US";
      rec.continuous = false;
      rec.interimResults = false;
      recognitionRef.current = rec;

      rec.onstart = () => {
        setIsListeningVoice(true);
        setVoiceTranscript("Escuchando... ¡Habla ahora fuerte y claro en inglés!");
        setVoiceSimilarity(null);
      };

      rec.onresult = (event: any) => {
        const transcriptText: string = event.results[0][0].transcript;
        setVoiceTranscript(transcriptText);

        // Similarity algorithm using fuzzy Levenshtein word matches (extremely robust and friendly to student accents)
        const cleanStr = (s: string) => s.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").replace(/\s+/g, " ").trim();
        const tWords = cleanStr(targetSentence).split(" ").filter(Boolean);
        const rWords = cleanStr(transcriptText).split(" ").filter(Boolean);
        
        let matchCount = 0;
        tWords.forEach(tWord => {
          const hasMatch = rWords.some(rWord => isWordSimilarityMatch(tWord, rWord));
          if (hasMatch) matchCount++;
        });

        // Similarity percentage calculation
        const pct = Math.round((matchCount / Math.max(tWords.length, rWords.length || 1)) * 100);
        setVoiceSimilarity(Math.min(pct, 100));
      };

      rec.onerror = (err: any) => {
        console.error("Speech Recognition Error", err);
        // Clean error messages depending on the browser code
        if (err.error === "not-allowed") {
          setSpeechError("El acceso al micrófono está restringido. Por favor, asegúrate de dar permisos en tu navegador ó haz clic en el botón 'Permitir'. Si estás en un iframe, abre en una ventana nueva.");
        } else if (err.error === "no-speech") {
          setSpeechError("No se detectó sonido. Intenta hablar más alto o verifica la conexión de tu micrófono.");
        } else {
          setSpeechError(`Error al acceder al micrófono (${err.error || "desconocido"}). Iniciando simulación automática.`);
        }

        // Auto-simulation fallback so the user is NEVER blocked from completing their lessons due to hardware restrictions!
        setIsListeningVoice(true);
        setTimeout(() => {
          setIsListeningVoice(false);
          setVoiceTranscript(targetSentence);
          setVoiceSimilarity(95);
        }, 1800);
      };

      rec.onend = () => {
        setIsListeningVoice(false);
      };

      rec.start();
    } catch (e) {
      console.error(e);
      setSpeechError("No se pudo conectar con el servicio de voz. Iniciando simulación.");
      setIsListeningVoice(true);
      setTimeout(() => {
        setIsListeningVoice(false);
        setVoiceTranscript(targetSentence);
        setVoiceSimilarity(95);
      }, 1500);
    }
  };

  // Setup bubble scramble word options
  const initializeBubbles = (sentence: string) => {
    const mainWords = sentence.split(/\s+/).map(w => w.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, ""));
    // Add distractors based on general active words
    const distractors = ["the", "at", "with", "coding", "everyday", "park", "always", "English"];
    const filteredDistractors = distractors.filter(d => !mainWords.map(w => w.toLowerCase()).includes(d.toLowerCase()));
    
    // Choose 2 random distractors
    const chosenDistractors = filteredDistractors.sort(() => 0.5 - Math.random()).slice(0, 2);
    const finalSelection = [...mainWords, ...chosenDistractors].sort(() => 0.5 - Math.random());
    
    setScrambleBubbles(finalSelection);
    setSelectedBubbles([]);
  };

  // --- Walkthrough Flow Controls ---
  const launchActiveLesson = (leccion: Leccion) => {
    setActiveLesson(leccion);
    
    // Flatten steps dynamically mirroring user parameters
    const screens: any[] = [];
    // Step 1: Vocabulary Intro card
    screens.push({ type: "vocabulario" });
    // Step 2: Grammar Theory Showcase
    screens.push({ type: "gramatica" });
    // Step 3: Dynamic Warm-up loops
    for (let i = 0; i < leccion.calentamiento.length; i++) {
      screens.push({ type: "calentamiento", subIndex: i });
    }
    // Step 4: Microphone pronunciation step
    const targetPhrases = leccion.frasesPronunciacion && leccion.frasesPronunciacion.length > 0 
      ? leccion.frasesPronunciacion 
      : [leccion.calentamiento[0]?.fraseMetaEn || "English is practical and beautiful"];

    for (let i = 0; i < targetPhrases.length; i++) {
      screens.push({ type: "pronunciacion", subIndex: i });
    }

    // Step 5: Dynamic evaluations questions
    for (let i = 0; i < leccion.evaluacion.length; i++) {
      screens.push({ type: "evaluacion", subIndex: i });
    }

    setFlatScreens(screens);
    setFlatScreenIndex(0);
    setVistosVocabulario([]);
    setExamCorrectCount(0);
    setFeedbackState("idle");
    setFeedbackMessage("");
    setCorrectAnswerReveal("");
    setUserTypedTranslation("");
    setSelectedBubbles([]);
    setVoiceSimilarity(null);
    setVoiceTranscript("");
    setSelectedExamOptionIndex(null);
    setGainedGrade(null);
    setWalkthroughActive(true);
    setCurrentView("estudiante_leccion");

    if (leccion.formulaGramatica) {
      setActiveHoverGrammarWord(0);
    }

    // Play TTS speech auto check for vocab automatically if needed on screen init
    // Removed autoplay to guarantee words only sound when clicked by user
  };

  // Triggers action check depending on the screen
  const handleCheckAnswer = () => {
    const currentScreen = flatScreens[flatScreenIndex];
    if (!currentScreen || !activeLesson) return;

    if (currentScreen.type === "vocabulario") {
      const totalWords = activeLesson.vocabularioDetallado && activeLesson.vocabularioDetallado.length > 0
        ? activeLesson.vocabularioDetallado.length
        : activeLesson.listaVocabulario?.length || 0;

      if (vistosVocabulario.length < totalWords) {
        alert("Por favor repasa y presiona todas las palabras del vocabulario para escuchar su pronunciación antes de continuar.");
        return;
      }

      // Just check proceed
      setFeedbackState("correct");
      setFeedbackMessage("¡Vocabulario aprendido! Sigamos con la regla gramatical.");
    }
    else if (currentScreen.type === "gramatica") {
      // Direct progression confirmation with pleasant chime sound effect
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.connect(gain);
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } catch (_) {}

      setFeedbackState("correct");
      setFeedbackMessage("¡Estructura analizada con éxito! Iniciemos los retos prácticos de calentamiento.");
    }
    else if (currentScreen.type === "calentamiento") {
      const idx = currentScreen.subIndex;
      const targetWarmup = activeLesson.calentamiento[idx];
      const correctAns = targetWarmup.fraseMetaEn;
      
      const studentInput = keyboardMode 
        ? userTypedTranslation 
        : selectedBubbles.join(" ");

      const isCorrect = cleanCompare(studentInput) === cleanCompare(correctAns);
      
      if (isCorrect) {
        setFeedbackState("correct");
        setFeedbackMessage("¡Extraordinario! Traducido perfectamente.");
      } else {
        setFeedbackState("incorrect");
        setFeedbackMessage("¡Casi lo logras!");
        setCorrectAnswerReveal(correctAns);
      }
    }
    else if (currentScreen.type === "pronunciacion") {
      // Pick the exact phrase of the current interactive subIndex step
      const targetPhrases = activeLesson.frasesPronunciacion && activeLesson.frasesPronunciacion.length > 0 
        ? activeLesson.frasesPronunciacion 
        : [activeLesson.calentamiento[0]?.fraseMetaEn || "English is dynamic and fun"];
      const subIdx = currentScreen.subIndex ?? 0;
      const targetSent = targetPhrases[subIdx] || "English is dynamic and fun";
      const similarity = voiceSimilarity !== null ? voiceSimilarity : 0;
      
      if (similarity >= 70) {
        setFeedbackState("correct");
        setFeedbackMessage(`¡Espectacular pronunciación! Lograste un ${similarity}% de coincidencia.`);
      } else {
        setFeedbackState("incorrect");
        setFeedbackMessage(`Coincidencia insuficiente (${similarity}%). Intenta hablar fuerte y claro.`);
        setCorrectAnswerReveal(targetSent);
      }
    }
    else if (currentScreen.type === "evaluacion") {
      const idx = currentScreen.subIndex;
      const targetEval = activeLesson.evaluacion[idx];

      if (selectedExamOptionIndex === null) {
        alert("Por favor selecciona una alternativa antes de continuar.");
        return;
      }

      const isCorrect = targetEval.opciones[selectedExamOptionIndex].correcta;
      const correctOptText = targetEval.opciones.find(o => o.correcta)?.texto || "";

      if (isCorrect) {
        setFeedbackState("correct");
        setFeedbackMessage("¡Respuesta Correcta! Sigue sumando puntos.");
        setExamCorrectCount(prev => prev + 1);
      } else {
        setFeedbackState("incorrect");
        setFeedbackMessage("La respuesta seleccionada es incorrecta.");
        setCorrectAnswerReveal(correctOptText);
      }
    }
  };

  const handleContinueWalkthrough = () => {
    // Reset inputs
    setFeedbackState("idle");
    setFeedbackMessage("");
    setCorrectAnswerReveal("");
    setUserTypedTranslation("");
    setSelectedBubbles([]);
    setVoiceSimilarity(null);
    setVoiceTranscript("");
    setSelectedExamOptionIndex(null);

    const nextIndex = flatScreenIndex + 1;
    if (nextIndex < flatScreens.length) {
      setFlatScreenIndex(nextIndex);
      
      const nextScreen = flatScreens[nextIndex];
      // Speak next step or prepare scramble
      if (nextScreen.type === "gramatica" && activeLesson) {
        setActiveHoverGrammarWord(0);
      }
      if (nextScreen.type === "calentamiento" && activeLesson) {
        const item = activeLesson.calentamiento[nextScreen.subIndex];
        initializeBubbles(item.fraseMetaEn);
      }
      if (nextScreen.type === "vocabulario" && activeLesson) {
        // Removed autoplay to guarantee words only sound when clicked by user
      }
    } else {
      // End of Lesson walkthrough! Calculate score out of 20
      if (!activeLesson) return;
      const totalExamsCount = activeLesson.evaluacion.length;
      
      // Calculate grade out of 20
      const score = totalExamsCount > 0 
        ? Math.round((examCorrectCount / totalExamsCount) * 20) 
        : 20;

      // Persist results: only one record per student per lesson
      const currentStudent = currentUser || "hitsuko.student";
      const existingIndex = calificaciones.findIndex(
        c => c.estudiante === currentStudent && c.leccionId === activeLesson.id
      );

      let updatedHistory;
      if (existingIndex !== -1) {
        // Update existing record with the new score and stats (keeping track of the latest attempt or best score)
        const updatedGrade = {
          ...calificaciones[existingIndex],
          nota: score,
          fecha: new Date().toISOString().replace("T", " ").substring(0, 16),
          aciertos: examCorrectCount,
          totalPreguntas: totalExamsCount
        };
        updatedHistory = [...calificaciones];
        updatedHistory[existingIndex] = updatedGrade;
      } else {
        // Create new record
        const newGrade: Calificacion = {
          id: "eval_" + Date.now(),
          estudiante: currentStudent,
          leccionId: activeLesson.id,
          leccionTitulo: activeLesson.titulo,
          nota: score,
          fecha: new Date().toISOString().replace("T", " ").substring(0, 16),
          aciertos: examCorrectCount,
          totalPreguntas: totalExamsCount
        };
        updatedHistory = [newGrade, ...calificaciones];
      }

      setCalificaciones(updatedHistory);
      saveStoredCalificaciones(updatedHistory);

      // Lock on Triumphant visual grade card
      setGainedGrade(score);
      setGainedCorrect(examCorrectCount);
    }
  };

  // --- Dynamic Input Row Utilities for the Teacher Form ---
  const handleAddWarmupRow = () => {
    setFormCalentamiento([...formCalentamiento, { fraseMetaEn: "", fraseMetaEs: "" }]);
  };

  const handleRemoveWarmupRow = (idx: number) => {
    if (formCalentamiento.length <= 1) return;
    setFormCalentamiento(formCalentamiento.filter((_, i) => i !== idx));
  };

  const handleWarmupRowChange = (idx: number, field: "en" | "es", val: string) => {
    const updated = [...formCalentamiento];
    if (field === "en") updated[idx].fraseMetaEn = val;
    else updated[idx].fraseMetaEs = val;
    setFormCalentamiento(updated);
  };

  const handleAddEvaluationRow = () => {
    setFormEvaluacion([
      ...formEvaluacion,
      {
        pregunta: "",
        opciones: [
          { texto: "", correcta: true },
          { texto: "", correcta: false },
          { texto: "", correcta: false },
          { texto: "", correcta: false }
        ]
      }
    ]);
  };

  const handleRemoveEvaluationRow = (idx: number) => {
    if (formEvaluacion.length <= 1) return;
    setFormEvaluacion(formEvaluacion.filter((_, i) => i !== idx));
  };

  const handleEvaluationQuestionChange = (qIdx: number, val: string) => {
    const updated = [...formEvaluacion];
    updated[qIdx].pregunta = val;
    setFormEvaluacion(updated);
  };

  const handleEvaluationOptionTextChange = (qIdx: number, oIdx: number, val: string) => {
    const updated = [...formEvaluacion];
    updated[qIdx].opciones[oIdx].texto = val;
    setFormEvaluacion(updated);
  };

  const handleEvaluationOptionCorrectSet = (qIdx: number, correctOIdx: number) => {
    const updated = [...formEvaluacion];
    updated[qIdx].opciones.forEach((opt, oIdx) => {
      opt.correcta = oIdx === correctOIdx;
    });
    setFormEvaluacion(updated);
  };

  // --- Dynamic Input Row Utilities for Pronunciation ---
  const handleAddPronunciacionRow = () => {
    setFormFrasesPronunciacion([...formFrasesPronunciacion, ""]);
  };

  const handleRemovePronunciacionRow = (idx: number) => {
    if (formFrasesPronunciacion.length <= 1) return;
    setFormFrasesPronunciacion(formFrasesPronunciacion.filter((_, i) => i !== idx));
  };

  const handlePronunciacionRowChange = (idx: number, val: string) => {
    const updated = [...formFrasesPronunciacion];
    updated[idx] = val;
    setFormFrasesPronunciacion(updated);
  };

  // Reset Lesson Creator fields back to fresh
  const resetTeacherForm = () => {
    setFormTitulo("");
    setFormImagenGramatica("present_simple.png");
    setFormFormulaGramatica("");
    setFormFrasesPronunciacion([""]);
    setFormCalentamiento([{ fraseMetaEn: "", fraseMetaEs: "" }]);
    setFormEvaluacion([
      {
        pregunta: "",
        opciones: [
          { texto: "", correcta: true },
          { texto: "", correcta: false },
          { texto: "", correcta: false },
          { texto: "", correcta: false }
        ]
      }
    ]);
    setEditingLessonId(null);
    setTeacherFormError(null);
    setFormEjemploOracion("");
    setFormEjemploRoles([]);
    setFormVocabularioDetallado([]);
  };

  // --- Submitting & Modifying Lessons Database ---
  const handleSaveLesson = (e: React.FormEvent) => {
    e.preventDefault();
    setTeacherFormError(null);

    // Validation checks
    if (!formTitulo.trim()) {
      setTeacherFormError("El título del tema es obligatorio.");
      return;
    }
    if (!formFormulaGramatica.trim()) {
      setTeacherFormError("La fórmula estructurada de gramática es obligatoria.");
      return;
    }

    // Pronunciation fields validations
    const validatedFrasesPronunciacion = formFrasesPronunciacion.map(f => f.trim()).filter(Boolean);
    if (validatedFrasesPronunciacion.length === 0) {
      setTeacherFormError("Debe ingresar al menos una frase de pronunciación.");
      return;
    }

    // Warm-up item validations
    for (let i = 0; i < formCalentamiento.length; i++) {
      if (!formCalentamiento[i].fraseMetaEn.trim() || !formCalentamiento[i].fraseMetaEs.trim()) {
        setTeacherFormError(`Faltan rellenar campos en el calentamiento nº ${i + 1}`);
        return;
      }
    }

    // Evaluator questions structural checks
    for (let i = 0; i < formEvaluacion.length; i++) {
      const q = formEvaluacion[i];
      if (!q.pregunta.trim()) {
        setTeacherFormError(`Falta escribir la pregunta del examen en la sección nº ${i + 1}`);
        return;
      }
      let correctCount = 0;
      for (let j = 0; j < q.opciones.length; j++) {
        if (!q.opciones[j].texto.trim()) {
          setTeacherFormError(`Falta la alternativa ${j + 1} de la pregunta nº ${i + 1}`);
          return;
        }
        if (q.opciones[j].correcta) correctCount++;
      }
      if (correctCount !== 1) {
        setTeacherFormError(`Marca exactamente una respuesta correcta para la pregunta nº ${i + 1}`);
        return;
      }
    }

    let inlineSVGSource = formImagenGramatica;
    // Map vector selectors neatly to native SVGs for gorgeous visual designs
    if (formImagenGramatica === "present_simple.png") {
      inlineSVGSource = PRESENT_SIMPLE_SVG;
    } else if (formImagenGramatica === "present_continuous.png") {
      inlineSVGSource = PRESENT_CONTINUOUS_SVG;
    }

    if (editingLessonId) {
      // OVERWRITE EXSTING OBJ - logic of editing fluidly
      const updatedLessons = lessons.map(les => {
        if (les.id === editingLessonId) {
          return {
            ...les,
            titulo: formTitulo.trim(),
            imagenGramatica: inlineSVGSource,
            formulaGramatica: formFormulaGramatica.trim(),
            calentamiento: formCalentamiento,
            evaluacion: formEvaluacion,
            frasesPronunciacion: validatedFrasesPronunciacion,
            ejemploOracion: formEjemploOracion.trim(),
            ejemploRoles: formEjemploRoles,
            vocabularioDetallado: formVocabularioDetallado,
            listaVocabulario: formVocabularioDetallado.length > 0 
              ? formVocabularioDetallado.map(v => v.ingles.trim()).filter(Boolean) 
              : les.listaVocabulario
          };
        }
        return les;
      });
      setLessons(updatedLessons);
      saveStoredLessons(updatedLessons);
      alert("¡Cambios actualizados y guardados en memoria!");
    } else {
      // SAVE FRESH NEW THEME
      const newLesson: Leccion = {
        id: "lesson_" + Date.now(),
        titulo: formTitulo.trim(),
        estado: lessons.length === 0 ? "activa" : "inactiva", // Auto-activate if it is the first lesson
        listaVocabulario: formVocabularioDetallado.length > 0
          ? formVocabularioDetallado.map(v => v.ingles.trim()).filter(Boolean)
          : ["study", "practice", "speak", "write", "learn"],
        vocabularioDetallado: formVocabularioDetallado,
        imagenGramatica: inlineSVGSource,
        formulaGramatica: formFormulaGramatica.trim(),
        ejemploOracion: formEjemploOracion.trim(),
        ejemploRoles: formEjemploRoles,
        calentamiento: formCalentamiento,
        evaluacion: formEvaluacion,
        frasesPronunciacion: validatedFrasesPronunciacion
      };

      const updatedLessons = [...lessons, newLesson];
      setLessons(updatedLessons);
      saveStoredLessons(updatedLessons);
      alert("¡Nueva lección creada de forma dinámica y guardada!");
    }

    resetTeacherForm();
  };

  // Load lesson info into creator dynamic inputs mapped dynamically
  const handleEditLesson = (les: Leccion) => {
    setEditingLessonId(les.id);
    setFormTitulo(les.titulo);
    
    // Fallback vector mapping
    if (les.imagenGramatica === PRESENT_SIMPLE_SVG) {
      setFormImagenGramatica("present_simple.png");
    } else if (les.imagenGramatica === PRESENT_CONTINUOUS_SVG) {
      setFormImagenGramatica("present_continuous.png");
    } else {
      setFormImagenGramatica(les.imagenGramatica);
    }

    setFormFormulaGramatica(les.formulaGramatica);
    setFormFrasesPronunciacion(les.frasesPronunciacion && les.frasesPronunciacion.length > 0 
      ? [...les.frasesPronunciacion] 
      : [""]);
    
    // Maps exact size array and pre-fills
    setFormCalentamiento(les.calentamiento.map(item => ({ ...item })));
    setFormEvaluacion(les.evaluacion.map(evalu => ({
      pregunta: evalu.pregunta,
      opciones: evalu.opciones.map(opt => ({ ...opt }))
    })));
    
    // Initialize custom teacher fields
    setFormEjemploOracion(les.ejemploOracion || les.frasesPronunciacion?.[0] || "");
    setFormEjemploRoles(les.ejemploRoles ? [...les.ejemploRoles] : []);
    setFormVocabularioDetallado(les.vocabularioDetallado && les.vocabularioDetallado.length > 0
      ? les.vocabularioDetallado.map(item => ({ ...item }))
      : les.listaVocabulario.map(w => ({ ingles: w, espanol: "", categoria: "General" }))
    );

    setTeacherFormError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteLesson = (id: string) => {
    if (confirm("¿Estás seguro que deseas eliminar este tema por completo?")) {
      const filtered = lessons.filter(l => l.id !== id);
      // Auto active another lesson if deleted became active
      const isDeletingActive = lessons.find(l => l.id === id)?.estado === "activa";
      if (isDeletingActive && filtered.length > 0) {
        filtered[0].estado = "activa";
      }
      setLessons(filtered);
      saveStoredLessons(filtered);
    }
  };

  // Toggle lesson active state (only one active at a time)
  const handleToggleLesson = (id: string, currentStatus: "activa" | "inactiva") => {
    const updated = lessons.map(l => {
      if (l.id === id) {
        return {
          ...l,
          estado: (currentStatus === "activa" ? "inactiva" : "activa") as "activa" | "inactiva"
        };
      }
      if (currentStatus === "inactiva") {
        return { ...l, estado: "inactiva" as const };
      }
      return l;
    });
    setLessons(updated);
    saveStoredLessons(updated);
  };

  // --- Login system credentials check ---
  const handleLoginSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoginError(null);

    const userClean = usernameInput.trim();

    if (selectedRole === "STUDENT") {
      // Ingresa con el usuario escrito o el de por defecto si está vacío
      const finalUsername = userClean || "hitsuko.student";
      setCurrentUser(finalUsername);
      setCurrentView("estudiante_home");
    } else if (selectedRole === "TEACHER") {
      // Ingresa con el usuario escrito o el de por defecto si está vacío
      const finalUsername = userClean || "profesor.farfan";
      setCurrentUser(finalUsername);
      setCurrentView("docente");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUsernameInput("");
    setPasswordInput("");
    setSelectedRole(null);
    setCurrentView("welcome");
    setWalkthroughActive(false);
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#f7f7f7] text-[#3c3c3c]">
      
      {/* 🔐 BIENVENIDA Y ACCESO (Pantalla de Selección de Rol) */}
      {currentView === "welcome" && (
        <main className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="text-center max-w-2xl px-6 py-12">
            
            {/* Elegant Header and Badge */}
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              I.E. Manuel Vivanco Altamirano
            </div>

            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-[#3c3c3c] mb-12">
              Learn English
            </h1>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              
              {/* STUDENT ROLE TRIGGER BUTTON - Duolingo Styled Green */}
              <button
                id="btn-role-student"
                onClick={() => {
                  setSelectedRole("STUDENT");
                  setCurrentView("login");
                }}
                className="w-full sm:w-64 py-5 px-8 text-xl font-black rounded-2xl btn-3d-green tracking-wide cursor-pointer flex flex-col items-center gap-2"
              >
                <Users className="w-8 h-8 text-white" />
                I AM STUDENT
              </button>

              {/* TEACHER ROLE TRIGGER BUTTON - Duolingo Styled Blue */}
              <button
                id="btn-role-teacher"
                onClick={() => {
                  setSelectedRole("TEACHER");
                  setCurrentView("login");
                }}
                className="w-full sm:w-64 py-5 px-8 text-xl font-black rounded-2xl btn-3d-blue tracking-wide cursor-pointer flex flex-col items-center gap-2"
              >
                <GraduationCap className="w-8 h-8 text-white" />
                I AM TEACHER
              </button>

            </div>

            {/* Institution credit footer replacement - Inside standard design container */}
            <div className="mt-16 text-xs font-bold text-gray-400 uppercase tracking-widest">
              UNIVERSIDAD NACIONAL JOSE MARIA ARGUEDAS - UNAJMA
            </div>

          </div>
        </main>
      )}

      {/* 🔐 PANTALLA DE FORMULARIO DE LOGIN */}
      {currentView === "login" && (
        <main className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-md bg-white duo-card p-8 shadow-xl relative">
            
            {/* Header back handler button */}
            <button
              onClick={() => {
                setUsernameInput("");
                setPasswordInput("");
                setLoginError(null);
                setCurrentView("welcome");
              }}
              className="absolute top-6 left-6 text-gray-400 hover:text-gray-900 flex items-center gap-1 text-sm font-bold transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" /> Volver
            </button>

            <div className="text-center mt-6 mb-8">
              <span className="text-xs font-black uppercase tracking-widest text-[#777777]">
                Ingreso al Portal
              </span>
              <h2 className="text-3xl font-black text-[#3c3c3c] mt-2">
                Acceso {selectedRole === "STUDENT" ? "Estudiante" : "Docente"}
              </h2>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-5">
              
              <div>
                <label className="block text-sm font-bold text-[#3c3c3c] mb-2 uppercase tracking-wide">
                  Usuario
                </label>
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder={selectedRole === "STUDENT" ? "Usuario de Estudiante" : "Usuario de Docente"}
                  className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl text-base font-bold text-[#3c3c3c] outline-none focus:border-sky-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#3c3c3c] mb-2 uppercase tracking-wide">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-xl text-base font-bold text-[#3c3c3c] outline-none focus:border-sky-500 transition-colors"
                />
              </div>

              {loginError && (
                <div className="bg-red-50 border-2 border-red-200 text-red-600 rounded-xl p-3 text-sm font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <button
                type="submit"
                className={`w-full py-4 font-black rounded-xl text-lg tracking-wider cursor-pointer ${
                  selectedRole === "STUDENT" ? "btn-3d-green" : "btn-3d-blue"
                }`}
              >
                INGRESAR AHORA
              </button>

            </form>

          </div>
        </main>
      )}

      {/* 💻 MÓDULO DEL DOCENTE: CREADOR DINÁMICO, EDICIÓN Y MONITOREO */}
      {currentView === "docente" && (
        <div className="flex-1 flex flex-col bg-slate-50/50">
          
          {/* Main Professional Header bar */}
          <header className="bg-white border-b-2 border-slate-200 py-5 px-6 md:px-10 shadow-xs">
            <div className="max-w-[1600px] w-full mx-auto flex justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-sky-100 p-3 rounded-2xl text-sky-600 shadow-sm shrink-0">
                  <GraduationCap className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Panel del Docente</h3>
                  <p className="text-sm md:text-base font-semibold text-slate-500">Prof. Farfán | UNAJMA - I.E. M.V.A.</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="py-3 px-5 rounded-2xl text-base font-black flex items-center gap-2 text-rose-600 hover:bg-rose-50 border-2 border-rose-100 hover:border-rose-200 transition-all cursor-pointer shadow-xs"
              >
                <LogOut className="w-5 h-5" /> Cerrar Sesión
              </button>
            </div>
          </header>

          <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10">
            
            {/* SIDE A: FORMULARIO DE REGISTRO/EDICIÓN COMPLETAMENTE DINÁMICO (lg-span-7) */}
            <section className="lg:col-span-7 space-y-8">
              
              <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
                
                <div className="flex justify-between items-center border-b-2 border-slate-100 pb-4">
                  <div>
                    <h4 className="text-lg md:text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                      {editingLessonId ? "📝 Editar Lección" : "➕ Crear Nuevo Tema"}
                    </h4>
                  </div>
                  {editingLessonId && (
                    <button
                      type="button"
                      onClick={resetTeacherForm}
                      className="py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" /> Cancelar Edición
                    </button>
                  )}
                </div>

                <form onSubmit={handleSaveLesson} className="space-y-6">
                  
                  {/* Part 1: General Details */}
                  <div className="space-y-3">
                    <span className="text-base md:text-lg font-extrabold text-[#1cb0f6] bg-sky-50 px-3 py-1 rounded-full border border-sky-100/50 inline-block">
                      1. General
                    </span>
                    
                    <div className="pt-2">
                      <label className="block text-base md:text-lg font-bold text-slate-700 mb-2">
                        Título de la Lección
                      </label>
                      <input
                        type="text"
                        required
                        value={formTitulo}
                        onChange={(e) => setFormTitulo(e.target.value)}
                        placeholder="ej: Present Simple"
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-base md:text-lg font-bold outline-none focus:border-sky-500 bg-white text-slate-800 transition-colors shadow-xs"
                      />
                    </div>
                  </div>

                  {/* Part 2: Vocabulario Inicial (Paso 1) */}
                  <div className="space-y-4 pt-5 border-t-2 border-slate-100">
                    <div className="flex justify-between items-center">
                      <span className="text-base md:text-lg font-extrabold text-[#1cb0f6] bg-sky-50 px-3 py-1 rounded-full border border-sky-100/50 inline-block">
                        2. Vocabulario Inicial (Paso 1)
                      </span>
                    </div>

                    <div className="bg-slate-50 p-5 md:p-6 rounded-2xl border-2 border-slate-200 space-y-4">
                      <p className="text-sm md:text-base text-slate-500 font-medium leading-relaxed">
                        Agrega y edita palabras clave de vocabulario que los alumnos deben aprender en el Paso 1 de esta lección.
                      </p>

                      {/* Formulario de registro rápido */}
                      <div className="bg-white p-4 rounded-xl border-2 border-slate-150 grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-end">
                        <div className="sm:col-span-4">
                          <label className="block text-sm font-bold text-slate-600 mb-1.5">Inglés</label>
                          <input
                            type="text"
                            id="vocab-en-input"
                            placeholder="ej: apple"
                            className="w-full px-3 py-2.5 text-sm md:text-base font-bold border-2 border-slate-200 rounded-xl outline-none focus:border-sky-500 bg-white"
                          />
                        </div>
                        <div className="sm:col-span-4">
                          <label className="block text-sm font-bold text-slate-600 mb-1.5">Español</label>
                          <input
                            type="text"
                            id="vocab-es-input"
                            placeholder="ej: manzana"
                            className="w-full px-3 py-2.5 text-sm md:text-base font-bold border-2 border-slate-200 rounded-xl outline-none focus:border-sky-500 bg-white"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-bold text-slate-600 mb-1.5">Categoría</label>
                          <select
                            id="vocab-cat-select"
                            className="w-full h-[46px] px-3 py-2 text-sm md:text-base font-bold border-2 border-slate-200 rounded-xl bg-white outline-none focus:border-sky-500 cursor-pointer"
                          >
                            <option value="Sustantivo">Sustantivo</option>
                            <option value="Verbo">Verbo</option>
                            <option value="Adjetivo">Adjetivo</option>
                            <option value="Pronombre">Pronombre</option>
                            <option value="Adverbio">Adverbio</option>
                            <option value="Otro">Otro</option>
                          </select>
                        </div>
                        <div className="sm:col-span-2">
                          <button
                            type="button"
                            onClick={() => {
                              const enEl = document.getElementById("vocab-en-input") as HTMLInputElement;
                              const esEl = document.getElementById("vocab-es-input") as HTMLInputElement;
                              const catEl = document.getElementById("vocab-cat-select") as HTMLSelectElement;
                              if (!enEl || !esEl || !catEl) return;
                              const ingles = enEl.value.trim();
                              const espanol = esEl.value.trim();
                              const categoria = catEl.value;
                              
                              if (!ingles) {
                                alert("Ingresa la palabra en inglés.");
                                return;
                              }
                              
                              // Check if editing or duplicate
                              const existingIdx = formVocabularioDetallado.findIndex(v => v.ingles.toLowerCase() === ingles.toLowerCase());
                              if (existingIdx !== -1) {
                                const updated = [...formVocabularioDetallado];
                                updated[existingIdx] = { ingles, espanol, categoria };
                                setFormVocabularioDetallado(updated);
                              } else {
                                setFormVocabularioDetallado([...formVocabularioDetallado, { ingles, espanol, categoria }]);
                              }
                              
                              // Clear inputs
                              enEl.value = "";
                              esEl.value = "";
                              catEl.value = "Sustantivo";
                            }}
                            className="w-full py-3 px-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-sm md:text-base font-black tracking-wide transition-colors cursor-pointer active:scale-95 text-center shadow-xs"
                          >
                            + Guardar
                          </button>
                        </div>
                      </div>

                      {/* Tabla Dinámica de Palabras Vocabulario */}
                      <div className="overflow-x-auto rounded-2xl border-2 border-slate-200 shadow-xs">
                        <table className="w-full text-left border-collapse bg-white overflow-hidden">
                          <thead>
                            <tr className="bg-slate-100/70 border-b-2 border-slate-200 text-slate-700">
                              <th className="px-4 py-3.5 text-xs md:text-sm font-bold uppercase tracking-wider">Inglés</th>
                              <th className="px-4 py-3.5 text-xs md:text-sm font-bold uppercase tracking-wider">Español</th>
                              <th className="px-4 py-3.5 text-xs md:text-sm font-bold uppercase tracking-wider">Categoría</th>
                              <th className="px-4 py-3.5 text-xs md:text-sm font-bold uppercase tracking-wider text-right">Acciones</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-sm md:text-base font-bold text-slate-700">
                            {formVocabularioDetallado.length === 0 ? (
                              <tr>
                                <td colSpan={4} className="text-center py-6 text-slate-400 text-sm">
                                  No hay palabras añadidas para el Paso 1. Usa el formulario de arriba para agregar palabras.
                                </td>
                              </tr>
                            ) : (
                              formVocabularioDetallado.map((item, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                  <td className="px-4 py-3.5 font-mono text-sky-700">{item.ingles}</td>
                                  <td className="px-4 py-3.5 text-slate-600">{item.espanol || "—"}</td>
                                  <td className="px-4 py-3.5">
                                    <span className="text-xs font-bold tracking-wider px-2.5 py-1 rounded-lg bg-sky-50 text-sky-600 border border-sky-100">
                                      {item.categoria}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3.5 text-right">
                                    <div className="inline-flex items-center gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const enEl = document.getElementById("vocab-en-input") as HTMLInputElement;
                                          const esEl = document.getElementById("vocab-es-input") as HTMLInputElement;
                                          const catEl = document.getElementById("vocab-cat-select") as HTMLSelectElement;
                                          if (enEl && esEl && catEl) {
                                            enEl.value = item.ingles;
                                            esEl.value = item.espanol;
                                            catEl.value = item.categoria;
                                            enEl.focus();
                                          }
                                        }}
                                        className="text-sky-500 hover:text-sky-700 bg-sky-50 hover:bg-sky-100 p-2 rounded-xl border border-sky-100 transition-colors cursor-pointer"
                                        title="Editar palabra"
                                      >
                                        <Edit3 className="w-4 h-4" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setFormVocabularioDetallado(
                                            formVocabularioDetallado.filter((_, i) => i !== idx)
                                          );
                                        }}
                                        className="text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 p-2 rounded-xl border border-rose-100 transition-colors cursor-pointer"
                                        title="Eliminar palabra"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Part 3: Estructura Gramatical (Paso 2) */}
                  <div className="space-y-4 pt-5 border-t-2 border-slate-100">
                    <span className="text-base md:text-lg font-extrabold text-[#1cb0f6] bg-sky-50 px-3 py-1 rounded-full border border-sky-100/50 inline-block">
                      3. Estructura Gramatical (Paso 2)
                    </span>

                    <div className="space-y-1.5">
                      <label className="block text-base md:text-lg font-bold text-slate-700 mb-1.5">
                        Fórmula Gramatical general
                      </label>
                      <input
                        type="text"
                        required
                        value={formFormulaGramatica}
                        onChange={(e) => setFormFormulaGramatica(e.target.value)}
                        placeholder="ej: Subject + Verb (-s/-es) + Complement"
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-base md:text-lg font-bold font-mono outline-none focus:border-sky-500 text-sky-700 bg-sky-50/20 transition-colors shadow-xs"
                      />
                    </div>

                    {/* Segmentador del Ejemplo Práctico (Paso 2) */}
                    <div className="bg-slate-50 p-5 md:p-6 rounded-2xl border-2 border-slate-200 space-y-4">
                      <div>
                        <label className="block text-base md:text-lg font-black text-slate-800 tracking-tight flex items-center gap-1.5">
                          🎯 Ejemplo Práctico Interactivo (Paso 2)
                        </label>
                        <p className="text-sm md:text-base text-slate-500 font-medium leading-relaxed mt-1">
                          Escribe una oración de ejemplo y asigna roles a sus palabras para que los estudiantes las exploren de manera interactiva.
                        </p>
                        <input
                          type="text"
                          value={formEjemploOracion}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormEjemploOracion(val);
                            // Auto split and adjust roles array length
                            const words = val.split(" ").filter(Boolean);
                            const updatedRoles = [...formEjemploRoles];
                            // Keep or truncate
                            if (updatedRoles.length !== words.length) {
                              while (updatedRoles.length < words.length) {
                                updatedRoles.push("Ninguno");
                              }
                              updatedRoles.length = words.length;
                              setFormEjemploRoles(updatedRoles);
                            }
                          }}
                          placeholder="ej: She loves apples"
                          className="w-full mt-3 px-4 py-3 border-2 border-slate-200 rounded-xl text-base font-bold font-mono outline-none focus:border-sky-500 bg-white"
                        />
                      </div>

                      {formEjemploOracion.trim() && (
                        <div className="space-y-3 pt-2 border-t border-slate-200">
                          <label className="block text-sm md:text-base font-bold text-slate-600">
                            Asignación de Roles por Palabra:
                          </label>
                          <div className="flex flex-wrap gap-3">
                            {formEjemploOracion.split(" ").filter(Boolean).map((word, wordIdx) => {
                              const currentRole = formEjemploRoles[wordIdx] || "Ninguno";
                              return (
                                <div key={wordIdx} className="bg-white p-3.5 rounded-xl border-2 border-slate-200 flex flex-col items-center gap-2 min-w-[110px] shadow-xs">
                                  <span className="font-extrabold text-sm md:text-base text-slate-800 break-all text-center">{word}</span>
                                  <select
                                    value={currentRole}
                                    onChange={(e) => {
                                      const updated = [...formEjemploRoles];
                                      updated[wordIdx] = e.target.value;
                                      setFormEjemploRoles(updated);
                                    }}
                                    className="p-2 text-xs md:text-sm bg-slate-50 border-2 border-slate-200 rounded-lg font-bold text-slate-700 outline-none w-full text-center cursor-pointer"
                                  >
                                    <option value="Ninguno">Ninguno</option>
                                    <option value="Sujeto">👤 Sujeto</option>
                                    <option value="Verbo">⚡ Verbo</option>
                                    <option value="Complemento">📌 Complemento</option>
                                  </select>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Part 4: Calentamiento de Traducción (Paso 3) */}
                  <div className="space-y-4 pt-5 border-t-2 border-slate-100">
                    <div className="flex justify-between items-center bg-sky-50/40 p-3 rounded-2xl border border-sky-100/50">
                      <span className="text-base md:text-lg font-extrabold text-[#1cb0f6] px-1 inline-block">
                        4. Calentamiento de Traducción (Paso 3)
                      </span>
                      <button
                        type="button"
                        onClick={handleAddWarmupRow}
                        className="py-2 px-4 bg-sky-100 text-sky-700 hover:bg-sky-200 rounded-xl text-sm font-black flex items-center gap-1.5 transition-all cursor-pointer border border-sky-200/50"
                      >
                        <Plus className="w-4 h-4" /> Añadir Frase
                      </button>
                    </div>

                    <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
                      {formCalentamiento.map((warm, idx) => (
                        <div key={idx} className="bg-slate-50/50 p-4 rounded-2xl border-2 border-slate-150 relative flex items-center gap-4">
                          <span className="text-base font-black text-slate-400 w-6 text-center">{idx + 1}</span>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                            <div className="space-y-1">
                              <span className="text-xs font-bold text-slate-500 block">En inglés</span>
                              <input
                                type="text"
                                required
                                value={warm.fraseMetaEn}
                                onChange={(e) => handleWarmupRowChange(idx, "en", e.target.value)}
                                placeholder="ej: He plays tennis"
                                className="w-full px-3.5 py-2.5 border-2 border-slate-200 rounded-xl text-sm md:text-base font-bold text-slate-700 outline-none bg-white focus:border-sky-500"
                              />
                            </div>
                            <div className="space-y-1">
                              <span className="text-xs font-bold text-slate-500 block">Traducción español</span>
                              <input
                                type="text"
                                required
                                value={warm.fraseMetaEs}
                                onChange={(e) => handleWarmupRowChange(idx, "es", e.target.value)}
                                placeholder="ej: Él juega tenis"
                                className="w-full px-3.5 py-2.5 border-2 border-slate-200 rounded-xl text-sm md:text-base font-bold text-slate-700 outline-none bg-white focus:border-sky-500"
                              />
                            </div>
                          </div>

                          {formCalentamiento.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveWarmupRow(idx)}
                              className="text-rose-500 hover:bg-rose-50 p-2 rounded-xl transition-colors cursor-pointer shrink-0 border-2 border-transparent hover:border-rose-100"
                              title="Eliminar ítem"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Part 5: Práctica de Pronunciación (Paso 4) */}
                  <div className="space-y-4 pt-5 border-t-2 border-slate-100">
                    <div className="flex justify-between items-center bg-sky-50/40 p-3 rounded-2xl border border-sky-100/50">
                      <span className="text-base md:text-lg font-extrabold text-[#1cb0f6] px-1 inline-block">
                        5. Práctica de Pronunciación (Paso 4)
                      </span>
                      <button
                        type="button"
                        onClick={handleAddPronunciacionRow}
                        className="py-2 px-4 bg-sky-100 text-sky-700 hover:bg-sky-200 rounded-xl text-sm font-black flex items-center gap-1.5 transition-all cursor-pointer border border-sky-200/50"
                      >
                        <Plus className="w-4 h-4" /> Añadir Frase
                      </button>
                    </div>

                    <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                      {formFrasesPronunciacion.map((frase, idx) => (
                        <div key={idx} className="flex items-center gap-3 bg-slate-50/35 p-3 rounded-2xl border border-slate-100">
                          <span className="text-sm font-extrabold text-slate-400 w-6 text-right">{idx + 1}.</span>
                          <input
                            type="text"
                            required
                            value={frase}
                            onChange={(e) => handlePronunciacionRowChange(idx, e.target.value)}
                            placeholder="ej: She runs fast in the morning"
                            className="flex-1 px-3.5 py-2.5 border-2 border-slate-200 rounded-xl text-sm md:text-base font-bold outline-none focus:border-sky-500 text-sky-700 transition-colors bg-white shadow-xs"
                          />
                          {formFrasesPronunciacion.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemovePronunciacionRow(idx)}
                              className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl border-2 border-transparent hover:border-rose-100 transition-colors cursor-pointer"
                              title="Eliminar frase"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Part 6: Evaluación Dinámica (Paso 5) */}
                  <div className="space-y-4 pt-5 border-t-2 border-slate-100">
                    <div className="flex justify-between items-center bg-sky-50/40 p-3 rounded-2xl border border-sky-100/50">
                      <span className="text-base md:text-lg font-extrabold text-[#1cb0f6] px-1 inline-block">
                        6. Examen / Evaluación (Paso 5)
                      </span>
                      <button
                        type="button"
                        onClick={handleAddEvaluationRow}
                        className="py-2 px-4 bg-sky-100 text-sky-700 hover:bg-sky-200 rounded-xl text-sm font-black flex items-center gap-1.5 transition-all cursor-pointer border border-sky-200/50"
                      >
                        <Plus className="w-4 h-4" /> Añadir Pregunta
                      </button>
                    </div>

                    <div className="space-y-6 max-h-[450px] overflow-y-auto pr-1">
                      {formEvaluacion.map((evalu, qIdx) => (
                        <div key={qIdx} className="bg-slate-50/30 p-5 rounded-2xl border-2 border-slate-200 relative space-y-4">
                          <div className="flex items-center justify-between border-b pb-2 mb-1">
                            <span className="text-sm md:text-base font-extrabold text-sky-700">Pregunta {qIdx + 1}</span>
                            {formEvaluacion.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveEvaluationRow(qIdx)}
                                className="text-rose-500 hover:bg-rose-50 py-1.5 px-3 rounded-xl border border-rose-100 hover:border-rose-200 transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
                              >
                                <Trash2 className="w-4 h-4" /> Eliminar Pregunta
                              </button>
                            )}
                          </div>

                          <div className="space-y-3">
                            <label className="block text-sm md:text-base font-bold text-slate-700">
                              Enunciado principal o frase incompleta
                            </label>
                            <input
                              type="text"
                              required
                              value={evalu.pregunta}
                              onChange={(e) => handleEvaluationQuestionChange(qIdx, e.target.value)}
                              placeholder="ej: Complete: 'She ____ a good novel'"
                              className="w-full px-3.5 py-2.5 border-2 border-slate-200 rounded-xl text-sm md:text-base font-bold text-slate-800 outline-none focus:border-sky-500 bg-white shadow-xs"
                            />

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                              {evalu.opciones.map((opt, oIdx) => (
                                <div 
                                  key={oIdx} 
                                  className={`flex items-center gap-2 p-2.5 rounded-xl border-2 transition-all ${
                                    opt.correcta 
                                      ? "bg-emerald-50/50 border-emerald-350 text-emerald-900" 
                                      : "border-slate-200 bg-white hover:border-slate-300 text-slate-700"
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    name={`correct-radio-q${qIdx}`}
                                    checked={opt.correcta}
                                    onChange={() => handleEvaluationOptionCorrectSet(qIdx, oIdx)}
                                    className="w-5 h-5 text-emerald-600 cursor-pointer accent-emerald-500 ml-1 shrink-0"
                                  />
                                  <input
                                    type="text"
                                    required
                                    value={opt.texto}
                                    onChange={(e) => handleEvaluationOptionTextChange(qIdx, oIdx, e.target.value)}
                                    placeholder={`Opción ${oIdx + 1}`}
                                    className="flex-1 bg-transparent border-0 outline-none text-xs md:text-sm font-extrabold py-1"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {teacherFormError && (
                    <div className="bg-red-50 border-2 border-red-200 text-red-600 p-4 rounded-xl text-sm font-bold flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      <span>{teacherFormError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-4 text-base md:text-lg font-black tracking-wide rounded-2xl cursor-pointer shadow-md btn-3d-blue uppercase active:scale-99 transition-all"
                  >
                    {editingLessonId ? "💾 Guardar Cambios" : "💾 Registrar Lección"}
                  </button>

                </form>

              </div>

            </section>

            {/* SIDE B: LISTA DE CONTROL DE TEMAS Y REPORTE DE NOTAS HISTÓRICO (lg-span-5) */}
            <section className="lg:col-span-5 space-y-8 lg:sticky lg:top-8 self-start">
              
              {/* Lecciones List Section */}
              <div className="bg-white border-2 border-slate-200 p-6 rounded-3xl shadow-sm space-y-4">
                <div className="flex justify-between items-center pb-3 border-b-2 border-slate-100">
                  <h4 className="text-base md:text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-sky-500" />
                    Lecciones Disponibles
                  </h4>
                  <span className="text-xs md:text-sm bg-sky-50 text-[#1cb0f6] font-extrabold px-3 py-1 rounded-xl border border-sky-100">
                    {lessons.length} temas
                  </span>
                </div>

                <div className="space-y-3.5">
                  {lessons.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                      <AlertCircle className="w-10 h-10 stroke-[1.5] mx-auto mb-2 text-slate-300" />
                      <p className="font-bold text-sm">No hay lecciones en la base de datos.</p>
                    </div>
                  ) : (
                    lessons.map((les) => {
                      const isActive = les.estado === "activa";
                      return (
                        <div 
                          key={les.id} 
                          className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 ${
                            isActive
                              ? "bg-emerald-50/20 border-emerald-300 shadow-xs"
                              : "bg-white border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-center gap-4 min-w-0 flex-1">
                            {/* Toggle Switch to Activate/Deactivate */}
                            <button
                              type="button"
                              onClick={() => handleToggleLesson(les.id, les.estado)}
                              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                isActive ? "bg-emerald-500" : "bg-slate-200"
                              }`}
                              title={isActive ? "Desactivar lección" : "Activar lección"}
                            >
                              <span
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                                  isActive ? "translate-x-5" : "translate-x-0"
                                }`}
                              />
                            </button>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h5 className="text-sm md:text-base font-black text-slate-800 truncate" title={les.titulo}>
                                  {les.titulo}
                                </h5>
                                <span className={`text-[10px] md:text-xs font-black uppercase px-2 py-0.5 rounded-lg ${
                                  isActive 
                                    ? "bg-emerald-100 text-emerald-800" 
                                    : "bg-slate-100 text-slate-500"
                                }`}>
                                  {isActive ? "Activa" : "Inactiva"}
                                </span>
                              </div>
                              <p className="text-xs md:text-sm text-slate-500 font-medium truncate mt-1">
                                <b>Estructura:</b> {les.formulaGramatica}
                              </p>
                              <p className="text-xs text-slate-400 mt-0.5 font-semibold">
                                {les.calentamiento.length} frases • {les.evaluacion.length} preg. examen
                              </p>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleEditLesson(les)}
                              className="text-sky-500 hover:text-sky-700 bg-sky-50 hover:bg-sky-100 p-2.5 rounded-xl border border-sky-100 transition-colors cursor-pointer"
                              title="Editar Lección"
                            >
                              <Edit3 className="w-5 h-5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteLesson(les.id)}
                              className="text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 p-2.5 rounded-xl border border-rose-100 transition-colors cursor-pointer"
                              title="Eliminar Lección"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Dynamic Monitoring Panel: Fulfills RF09, RF10, RF12 (Consolidated & Custom Clean Student List) */}
              <div className="bg-white border-2 border-slate-200 p-6 rounded-3xl shadow-sm space-y-4">
                <div className="flex flex-col gap-1 pb-3 border-b-2 border-slate-150">
                  <span className="font-extrabold text-sm md:text-base text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                    <Users className="w-5 h-5 text-sky-500" />
                    Monitoreo de Alumnos
                  </span>
                  <p className="text-xs md:text-sm text-slate-500 font-semibold leading-relaxed">
                    Haz clic en un estudiante para ver de manera detallada su progreso y sus calificaciones obtenidas.
                  </p>
                </div>

                <div className="space-y-3.5">
                  {(() => {
                    const totalAlumnos = ["hitsuko.student", "mario.quispe", "ana.huaman", "elena.condori", "juan.sanchez"];
                    
                    return totalAlumnos.map((alumno) => {
                      const isExpanded = !!expandedStudents[alumno];
                      const studentGrades = calificaciones.filter(c => c.estudiante === alumno);
                      const studentCompletedCount = studentGrades.length;
                      
                      const studentValidGrades = studentGrades.map(c => c.nota).filter(n => !isNaN(n));
                      const studentAvg = studentValidGrades.length > 0
                        ? (studentValidGrades.reduce((sum, val) => sum + val, 0) / studentValidGrades.length).toFixed(1)
                        : null;

                      // Calculate overall standing
                      let overallStanding = "Pendiente ⏳";
                      let overallColor = "bg-slate-50 text-slate-600 border-slate-200";
                      if (studentAvg !== null) {
                        const avg = parseFloat(studentAvg);
                        if (avg >= 17) {
                          overallStanding = "Dominado 🏆";
                          overallColor = "bg-emerald-50 text-emerald-700 border-emerald-150";
                        } else if (avg >= 11) {
                          overallStanding = "Aprobado ✅";
                          overallColor = "bg-sky-50 text-sky-700 border-sky-150";
                        } else {
                          overallStanding = "En Proceso ⚠️";
                          overallColor = "bg-amber-50 text-amber-700 border-amber-150";
                        }
                      }

                      return (
                        <div key={alumno} className="border-2 border-slate-200 rounded-2xl overflow-hidden bg-slate-50/20">
                          {/* Student Header row (Interactive) */}
                          <button
                            type="button"
                            onClick={() => {
                              setExpandedStudents(prev => ({
                                ...prev,
                                [alumno]: !prev[alumno]
                              }));
                            }}
                            className="w-full text-left p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors bg-white cursor-pointer"
                          >
                            <span className="font-extrabold text-sm md:text-base text-sky-600 flex items-center gap-1.5">
                              👤 {alumno}
                            </span>

                            <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm font-bold shrink-0">
                              <span className="text-xs md:text-sm text-slate-500 font-semibold">
                                Progreso: <b className="text-slate-800 font-extrabold">{studentCompletedCount} / {lessons.length}</b>
                              </span>
                              
                              <span className="text-xs md:text-sm text-slate-500 font-semibold">
                                Promedio: <b className="text-slate-800 font-extrabold">{studentAvg !== null ? `${studentAvg}` : "--"}</b>
                              </span>

                              <span className={`px-2.5 py-1 rounded inline-block border text-xs font-bold text-center ${overallColor}`}>
                                {overallStanding}
                              </span>

                              {isExpanded ? (
                                <ChevronUp className="w-5 h-5 text-slate-400 shrink-0" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                              )}
                            </div>
                          </button>

                          {/* Collapsible Details Body */}
                          {isExpanded && (
                            <div className="px-4 py-3 bg-white space-y-2 border-t-2 border-slate-100 text-xs md:text-sm">
                              {lessons.length === 0 ? (
                                <p className="text-slate-400 text-center py-2">
                                  No hay lecciones registradas.
                                </p>
                              ) : (
                                <div className="divide-y divide-slate-100 font-bold">
                                  {lessons.map((les) => {
                                    const gradObj = calificaciones.find(
                                      (c) => c.estudiante === alumno && c.leccionId === les.id
                                    );

                                    return (
                                      <div key={les.id} className="py-2.5 flex items-center justify-between text-slate-600 first:pt-0 last:pb-0 gap-3">
                                        <span className="text-sm font-bold text-slate-700 truncate max-w-sm" title={les.titulo}>
                                          📖 {les.titulo}
                                        </span>
                                        
                                        <div className="shrink-0 text-right">
                                          {gradObj ? (
                                            <span className="text-slate-850 font-extrabold text-xs md:text-sm flex items-center gap-1.5">
                                              Completado — <b className="text-[#58cc02] font-black">Nota: {gradObj.nota.toString().padStart(2, "0")}/20</b> ({gradObj.nota >= 17 ? "Dominado 🏆" : gradObj.nota >= 11 ? "Aprobado ✅" : "En Proceso ⚠️"})
                                            </span>
                                          ) : (
                                            <span className="text-slate-400 font-semibold italic">
                                              Pendiente
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

            </section>

          </main>
        </div>
      )}

      {/* 📱 MÓDULO DEL ESTUDIANTE: HOME PRINCIPAL */}
      {currentView === "estudiante_home" && (
        <div className="flex-1 flex flex-col bg-[#f7f7f7]">
          
          {/* Dashboard Header Bar */}
          <header className="bg-white border-b-2 border-slate-200 py-4 px-6 flex justify-between items-center sm:px-12">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚡</span>
              <div>
                <h3 className="text-xl font-bold text-slate-800">
                  Hi, <span className="text-[#58cc02]">{currentUser}</span>
                </h3>
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">
                  ESTUDIANTE DE MANUEL VIVANCO ALTAMIRANO
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="py-2.5 px-4 rounded-xl text-sm font-extrabold flex items-center gap-2 text-slate-500 hover:text-slate-800 border-2 border-slate-200 hover:bg-slate-50 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" /> Cerrar Sesión
            </button>
          </header>

          <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-8 flex flex-col justify-start space-y-8">
            
            {/* Banner Greeting Widget */}
            <div className="bg-gradient-to-r from-[#1cb0f6] to-[#1489da] text-white p-6 md:p-8 rounded-3xl shadow-md flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
              <div className="space-y-2 text-center md:text-left relative z-10">
                <span className="bg-yellow-400 text-slate-900 text-[10px] font-black uppercase px-2.5 py-1 rounded-full">
                  IDIOMA-INGLES
                </span>
                <h4 className="text-3xl font-black">Aprende Hablando e Interactuando</h4>
                <p className="text-white/80 font-semibold text-sm max-w-lg">
                  Estudia la teoría visual, traduce oraciones usando bloques y habla en inglés directo a tu micrófono para que el software autocalifique.
                </p>
              </div>
              <GraduationCap className="w-24 h-24 text-white/20 shrink-0 select-none absolute right-4 bottom-0 mr-4" />
            </div>

            {/* THE ONE GIANT ACTIVE LESSON WIDGET (BUSCA DINÁMICAMENTE LA MARCADA COMO ACTIVA) */}
            <div>
              <h5 className="text-xs uppercase font-extrabold tracking-widest text-slate-400 mb-3">
                Tu Tarea Activa de Hoy
              </h5>

              {(() => {
                const active = lessons.find(l => l.estado === "activa");
                if (!active) {
                  return (
                    <div className="duo-card p-8 text-center bg-white border-2 border-slate-200">
                      <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
                      <h4 className="text-xl font-bold text-slate-700">No hay lecciones asignadas</h4>
                      <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
                        Actualmente el docente Farfán Inca Roca no ha habilitado ninguna lección de manera activa en el panel del administrador.
                      </p>
                    </div>
                  );
                }

                const studentGrade = calificaciones.find(
                  c => c.estudiante === currentUser && c.leccionId === active.id
                );
                const hasCompleted = !!studentGrade && studentGrade.nota >= 15;

                return (
                  <div className="duo-card p-6 md:p-8 bg-white border-b-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 hover:shadow-lg transition-all">
                    <div className="space-y-4 flex-1 text-left">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="bg-[#58cc02] text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded">
                          LECCIÓN ACTIVA
                        </span>
                        {hasCompleted && (
                          <span className="bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5 stroke-[3px]" /> COMPLETADO (Nota {studentGrade.nota})
                          </span>
                        )}
                        <span className="text-xs text-slate-400 font-bold">
                          🔥 {active.calentamiento.length} Desafíos
                        </span>
                        <span className="text-xs text-slate-400 font-bold">•</span>
                        <span className="text-xs text-slate-400 font-bold">
                          📖 {active.evaluacion.length} Preguntas
                        </span>
                      </div>

                      <h4 className="text-2xl md:text-3xl font-black text-slate-800">{active.titulo}</h4>
                      
                      <div className="flex gap-4 items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100 max-w-md">
                        <div className="text-xs font-black text-slate-400 uppercase tracking-widest text-[#1cb0f6]">
                          Teoría Gramatical
                        </div>
                        <p className="font-mono text-xs text-slate-600 font-extrabold truncate">
                          {active.formulaGramatica}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center justify-center">
                      <button
                        onClick={() => launchActiveLesson(active)}
                        className={`py-5 px-10 text-xl font-black uppercase tracking-wider rounded-2xl w-full md:w-auto cursor-pointer ${
                          hasCompleted ? "btn-3d-blue" : "btn-3d-green"
                        }`}
                      >
                        {hasCompleted ? "COMPLETADO" : "EMPEZAR LECCIÓN"}
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* HISTORIAL PERSONAL DE NOTAS EN CÍRCULOS INDEXADOS */}
            <div>
              <h5 className="text-xs uppercase font-extrabold tracking-widest text-slate-400 mb-3">
                Tu Progreso Académico de Calificaciones
              </h5>

              <div className="bg-white duo-card p-6 shadow-sm">
                
                {calificaciones.filter(c => c.estudiante === currentUser).length === 0 ? (
                  <div className="text-center py-6 text-slate-400">
                    <Award className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-bold">Aún no has completado evaluaciones de examen.</p>
                    <p className="text-[10px] mt-0.5">Las calificaciones de tus exámenes resueltos aparecerán aquí.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex flex-wrap gap-4 items-center">
                      {calificaciones
                        .filter(c => c.estudiante === currentUser)
                        .map((cal, i) => {
                          const isApproved = cal.nota >= 11;
                          return (
                            <div 
                              key={cal.id} 
                              className={`w-14 h-14 rounded-full flex flex-col items-center justify-center border-b-4 transition-transform hover:scale-105 select-all ${
                                isApproved 
                                  ? "bg-emerald-100 border-emerald-500 text-emerald-800" 
                                  : "bg-red-100 border-red-500 text-red-800"
                              }`}
                              title={`${cal.leccionTitulo} - Grade: ${cal.nota}`}
                            >
                              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-tighter block leading-none">
                                Nº {i + 1}
                              </span>
                              <span className="text-base font-black leading-none mt-1">
                                {cal.nota}
                              </span>
                            </div>
                          );
                        })}
                    </div>

                    <div className="border-t border-slate-100 pt-4 space-y-2">
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Historial Detallado</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {calificaciones
                          .filter(c => c.estudiante === currentUser)
                          .map((cal) => (
                            <div key={cal.id} className="p-3 border border-slate-100 rounded-xl bg-slate-50 flex items-center justify-between text-xs">
                              <div className="min-w-0 pr-2">
                                <p className="font-extrabold text-slate-700 truncate">{cal.leccionTitulo}</p>
                                <p className="text-[10px] text-slate-400">{cal.fecha}</p>
                              </div>
                              <span className={`font-black uppercase px-2 py-0.5 rounded text-[10px] ${
                                cal.nota >= 11 ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                              }`}>
                                Nota {cal.nota}
                              </span>
                            </div>
                          ))}
                      </div>

                    </div>
                  </div>
                )}
              </div>
            </div>

          </main>
        </div>
      )}

      {/* 📱 MÓDULO DEL ESTUDIANTE: FLUX DE APRENDIZAJE ACTIVO COMPLETO */}
      {currentView === "estudiante_leccion" && walkthroughActive && activeLesson && (
        <div className="flex-1 flex flex-col bg-white">
          
          {/* BARRA DE PROGRESO SUPERIOR (AVANCE EN CADA PANTALLA EXTREMADAMENTE VISIBLE) */}
          <header className="py-4 px-6 md:px-12 flex items-center gap-4 border-b border-slate-100 bg-white">
            <button
              onClick={() => {
                if (gainedGrade !== null && gainedGrade < 15) {
                  alert("No has aprobado la lección con la nota mínima de 15. Debes reintentar la lección para poder completarla y salir.");
                  return;
                }
                if (confirm("¿Estás seguro de que deseas salir y perder tu progreso actual?")) {
                  setWalkthroughActive(false);
                  setCurrentView("estudiante_home");
                }
              }}
              className="p-2 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>

            {/* PROGRESS CALCULATION (SLIGHTLY THICKER FOR READABILITY BUT NOT OVERSIZED) */}
            <div className="flex-1 h-5 bg-[#e5e5e5] rounded-full overflow-hidden relative border border-slate-200">
              <div 
                className="h-full bg-[#58cc02] rounded-full progress-bar-fill duration-300"
                style={{ 
                  width: `${((flatScreenIndex) / flatScreens.length) * 100}%` 
                }}
              />
              <div className="absolute top-0.5 left-1 right-1 h-1 bg-white/20 rounded-full" />
            </div>

            <div className="text-xs md:text-sm font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">
              Paso {flatScreenIndex + 1} / {flatScreens.length}
            </div>
          </header>

          <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-3 md:py-4 flex flex-col justify-between overflow-y-auto space-y-4">
            
            {/* Triumphant Screen overlay instead of regular elements */}
            {gainedGrade !== null ? (
              <div className="text-center py-10 px-6 space-y-6 my-auto max-w-3xl mx-auto">
                {gainedGrade >= 15 ? (
                  <>
                    <div className="inline-flex justify-center items-center w-24 h-24 bg-yellow-105 bg-yellow-100 rounded-full text-yellow-500 animate-bounce shadow-sm border border-yellow-200">
                      <Award className="w-14 h-14" />
                    </div>
                    
                    <div className="space-y-2">
                      <span className="text-xs font-black uppercase text-emerald-700 tracking-widest bg-emerald-50 px-3 py-1 rounded">
                        ¡LECCIÓN APROBADA CON ÉXITO! 🎉
                      </span>
                      <h3 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">{activeLesson.titulo}</h3>
                      <p className="text-slate-500 text-sm md:text-base font-bold max-w-2xl mx-auto">
                        Unidad superada y dominada bajo el sistema de calificación oficial (mínimo de aprobación 15 / 20).
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="inline-flex justify-center items-center w-24 h-24 bg-red-100 rounded-full text-red-500 animate-pulse shadow-sm border border-red-200">
                      <AlertCircle className="w-14 h-14" />
                    </div>
                    
                    <div className="space-y-2">
                      <span className="text-xs font-black uppercase text-red-700 tracking-widest bg-red-100 px-3 py-1.5 rounded animate-bounce text-center inline-block">
                        REQUISITO ACADÉMICO NO ALCANZADO (NOTA MÍNIMA COMPILADA: 15 DE 20) ❌
                      </span>
                      <h3 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">{activeLesson.titulo}</h3>
                      <p className="text-red-650 text-sm md:text-base font-semibold max-w-2xl mx-auto">
                        Según las directivas pedagógicas integradas, necesitas obtener al menos la nota académica de 15 para habilitar la compleción de esta sesión.
                      </p>
                    </div>
                  </>
                )}

                <div className="max-w-xs mx-auto bg-slate-50 border-2 border-slate-250 rounded-3xl p-6 shadow-sm">
                  <div className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-2">Tu Nota Final Obtenida</div>
                  <div className="flex items-baseline justify-center gap-2">
                    <span className={`text-6xl font-black tracking-tight ${
                      gainedGrade >= 15 ? "text-emerald-600" : "text-rose-600"
                    }`}>
                      {gainedGrade.toString().padStart(2, "0")}
                    </span>
                    <span className="text-xl font-bold text-slate-400">/ 20</span>
                  </div>
                  <div className="mt-4 border-t border-slate-200 pt-3 text-xs md:text-sm font-bold text-slate-500">
                    Aciertos correctos: {gainedCorrect} de {activeLesson.evaluacion.length}
                  </div>
                </div>

                <div className="pt-6">
                  {gainedGrade >= 15 ? (
                    <button
                      onClick={() => {
                        setWalkthroughActive(false);
                        setCurrentView("estudiante_home");
                      }}
                      className="py-4 px-12 text-lg font-black tracking-wider uppercase rounded-xl btn-3d-green w-64 cursor-pointer"
                    >
                      CONCLUIR LECCIÓN
                    </button>
                  ) : (
                    <div className="space-y-4 flex flex-col items-center">
                      <p className="text-xs md:text-sm text-rose-500 font-bold max-w-md mx-auto">
                        Iniciaremos la lección de nuevo desde vocabulario para ayudarte a dominar las frases.
                      </p>
                      <button
                        onClick={() => {
                          setFlatScreenIndex(0);
                          setVistosVocabulario([]);
                          setExamCorrectCount(0);
                          setGainedGrade(null);
                          setGainedCorrect(0);
                          setFeedbackState("idle");
                          setFeedbackMessage("");
                          setCorrectAnswerReveal("");
                          setUserTypedTranslation("");
                          setSelectedBubbles([]);
                          setVoiceSimilarity(null);
                          setVoiceTranscript("");
                          setSelectedExamOptionIndex(null);
                          
                          // Removed autoplay on retry to guarantee words only sound when clicked by user
                        }}
                        className="py-4 px-8 text-sm md:text-base font-black tracking-wider uppercase rounded-xl bg-orange-500 hover:bg-orange-600 border-b-4 border-orange-700 text-white shadow-md w-72 cursor-pointer active:scale-95 transition-transform"
                      >
                        🔄 REINICIAR DESDE VOCABULARIO
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              
              /* WALKTROUGH SCREENS ROUTER */
              <div className="flex-1 flex flex-col justify-center">
                {(() => {
                  const scMin = flatScreens[flatScreenIndex];
                  if (!scMin) return null;

                  // PASO 1: VOCABULARIO
                  if (scMin.type === "vocabulario") {
                    return (
                      <div className="space-y-4 text-center w-full">
                        <div className="space-y-1">
                          <span className="text-[10px] font-extrabold uppercase text-[#1cb0f6] tracking-widest bg-sky-50 px-2 py-0.5 rounded">
                            PASO 1 DE 5: VOCABULARIO INICIAL
                          </span>
                          <h4 className="text-xl md:text-2xl font-black text-[#3c3c3c]">
                            Aprende la Pronunciación Clave
                          </h4>
                          <p className="text-slate-400 text-xs font-bold max-w-md mx-auto">
                            Toca las siguientes tarjetas para escuchar la pronunciación de inglés de forma nativa.
                          </p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl w-full mx-auto">
                          {activeLesson.vocabularioDetallado && activeLesson.vocabularioDetallado.length > 0 ? (
                            activeLesson.vocabularioDetallado.map((item, idx) => {
                              const isVisto = vistosVocabulario.includes(item.ingles);
                              return (
                                <button
                                  key={idx}
                                  onClick={() => {
                                    speakWord(item.ingles);
                                    if (!vistosVocabulario.includes(item.ingles)) {
                                      setVistosVocabulario([...vistosVocabulario, item.ingles]);
                                    }
                                  }}
                                  className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-1.5 transition-colors duration-200 shadow-sm active:scale-95 cursor-pointer text-center w-full group ${
                                    isVisto 
                                      ? "bg-emerald-50/50 border-emerald-300 hover:border-emerald-500" 
                                      : "bg-white border-slate-200 hover:border-[#1cb0f6] hover:shadow"
                                  }`}
                                >
                                  {item.categoria && (
                                    <span className={`text-[8px] uppercase font-black tracking-widest px-2 py-0.5 rounded-full border ${
                                      isVisto 
                                        ? "text-emerald-700 bg-emerald-100/50 border-emerald-200" 
                                        : "text-[#1cb0f6] bg-sky-50 border-sky-100"
                                    }`}>
                                      {item.categoria}
                                    </span>
                                  )}
                                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                                    isVisto 
                                      ? "bg-emerald-100 text-emerald-600 group-hover:bg-emerald-200" 
                                      : "bg-sky-50 text-sky-600 group-hover:bg-sky-100"
                                  }`}>
                                    <Volume2 className="w-4 h-4" />
                                  </div>
                                  <span className="font-black text-sm md:text-base text-slate-800 leading-tight">
                                    {item.ingles} {isVisto && <span className="text-emerald-500 text-xs">✓</span>}
                                  </span>
                                  {item.espanol && (
                                    <span className="font-bold text-xs text-slate-500 italic block">“{item.espanol}”</span>
                                  )}
                                  <span className={`text-[8px] uppercase font-extrabold tracking-wider mt-0.5 ${
                                    isVisto ? "text-emerald-600" : "text-[#1cb0f6]"
                                  }`}>
                                    {isVisto ? "¡Escuchado! 🗣️" : "Vocalizar 🗣️"}
                                  </span>
                                </button>
                              );
                            })
                          ) : (
                            activeLesson.listaVocabulario.map((word, i) => {
                              const isVisto = vistosVocabulario.includes(word);
                              return (
                                <button
                                  key={word}
                                  onClick={() => {
                                    speakWord(word);
                                    if (!vistosVocabulario.includes(word)) {
                                      setVistosVocabulario([...vistosVocabulario, word]);
                                    }
                                  }}
                                  className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-colors duration-200 shadow-sm active:scale-95 cursor-pointer text-center w-full group ${
                                    isVisto
                                      ? "bg-emerald-50/50 border-emerald-300 hover:border-emerald-500"
                                      : "bg-white border-slate-200 hover:border-[#1cb0f6] hover:shadow"
                                  }`}
                                >
                                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                                    isVisto
                                      ? "bg-emerald-100 text-emerald-600 group-hover:bg-emerald-200"
                                      : "bg-sky-50 text-sky-600 group-hover:bg-sky-100"
                                  }`}>
                                    <Volume2 className="w-5 h-5" />
                                  </div>
                                  <span className="font-black text-base text-slate-800">
                                    {word} {isVisto && <span className="text-emerald-500">✓</span>}
                                  </span>
                                  <span className={`text-[9px] uppercase font-extrabold tracking-wider ${
                                    isVisto ? "text-emerald-600" : "text-[#1cb0f6]"
                                  }`}>
                                    {isVisto ? "¡Escuchado! 🗣️" : "Vocalizar 🗣️"}
                                  </span>
                                </button>
                              );
                            })
                          )}
                        </div>

                        <div className="bg-sky-50 border border-sky-100 rounded-lg p-2.5 max-w-sm mx-auto text-[11px] text-sky-700 font-extrabold flex items-center justify-center gap-1.5 shadow-sm">
                          <Sparkles className="w-4 h-4 text-sky-600 shrink-0" />
                          <span>¡La pronunciación de audio nativo se activa al tocar cada elemento!</span>
                        </div>
                      </div>
                    );
                  }

                  // PASO 2: GRAMÁTICA (Interactive word-by-word hover example)
                  if (scMin.type === "gramatica") {
                    const segments = getInteractiveGrammarSegments(activeLesson);
                    
                    const getSimpleRoleLabel = (role: string) => {
                      const lower = role.toLowerCase();
                      if (lower.includes("subject") || lower.includes("sujeto")) {
                        return "Sujeto / Subject 👤";
                      }
                      if (lower.includes("verb") || lower.includes("verbo")) {
                        return "Verbo / Verb ⚡";
                      }
                      if (lower.includes("complement") || lower.includes("complemento")) {
                        return "Complemento / Complement 📌";
                      }
                      return "Componente 💎";
                    };

                    return (
                      <div className="space-y-6 text-center w-full max-w-md mx-auto">
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-extrabold uppercase text-[#1cb0f6] tracking-widest bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
                            PASO 2 DE 5: REGLA GRAMATICAL
                          </span>
                          <h2 className="text-2xl font-black text-slate-800 tracking-tight text-center animate-fade-in">
                            Fórmula de la Lección
                          </h2>
                          <p className="text-slate-500 font-bold text-xs text-center">
                            Pasa el cursor sobre las palabras para ver su función gramatical.
                          </p>
                        </div>
 
                        {/* SUPER MINIMALIST, HIGH-CONTRAST STATIC FORMULA CARD */}
                        <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4.5 text-center space-y-1.5 select-none shadow-sm">
                          <span className="text-[9px] uppercase font-black tracking-widest text-[#1cb0f6] block">
                            Estructura Gramatical
                          </span>
                          <div className="text-base font-black text-slate-700 tracking-wide">
                            {activeLesson.formulaGramatica}
                          </div>
                        </div>

                        {/* MINIMALIST COMPACT SENTENCE CARD */}
                        <div className="bg-white border border-slate-200/60 rounded-xl p-6 shadow-sm space-y-5">
                          <span className="block text-[9px] uppercase font-black tracking-widest text-[#1cb0f6] text-center select-none">
                            EJEMPLO PRÁCTICO
                          </span>

                          {/* NATURAL SENTENCE FLOW - NO CARDS, NO BORDERS, NO PLUS SIGNS */}
                          <div className="py-2 flex justify-center">
                            <div className="text-xl md:text-2xl font-black text-slate-800 tracking-normal select-none leading-relaxed flex flex-wrap justify-center items-center gap-x-2">
                              {segments.map((seg, sIdx) => {
                                const isActive = activeHoverGrammarWord === sIdx;
                                return (
                                  <span
                                    key={sIdx}
                                    onMouseEnter={() => {
                                      setActiveHoverGrammarWord(sIdx);
                                      try {
                                        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
                                        const osc = ctx.createOscillator();
                                        const gain = ctx.createGain();
                                        osc.frequency.setValueAtTime(420 + sIdx * 35, ctx.currentTime);
                                        osc.connect(gain);
                                        gain.connect(ctx.destination);
                                        gain.gain.setValueAtTime(0.012, ctx.currentTime);
                                        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
                                        osc.start();
                                        osc.stop(ctx.currentTime + 0.05);
                                      } catch (_) {}
                                    }}
                                    onClick={() => {
                                      setActiveHoverGrammarWord(sIdx);
                                      speakWord(seg.word);
                                    }}
                                    className={`px-1.5 py-0.5 rounded cursor-pointer transition-colors duration-150 ${
                                      isActive 
                                        ? "text-[#1cb0f6] underline decoration-3 underline-offset-4 font-black bg-sky-50/65" 
                                        : "text-slate-800 hover:text-[#1cb0f6] hover:bg-slate-50/40"
                                    }`}
                                  >
                                    {seg.word}
                                  </span>
                                );
                              })}
                            </div>
                          </div>

                          {/* ONLY SHOW ROLE TAG UPON HOVER - NO MORE WORD ANALYSIS OR DETAILS */}
                          <div className="h-8 flex items-center justify-center border-t border-slate-105/50 pt-3">
                            {activeHoverGrammarWord !== null && segments[activeHoverGrammarWord] ? (
                              <div className="text-xs font-black uppercase tracking-wider text-[#1cb0f6] bg-sky-50/70 px-3 py-1 rounded-full border border-sky-100/60 animate-fade-in shadow-xs">
                                {getSimpleRoleLabel(segments[activeHoverGrammarWord].role)}
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-bold">
                                Pasa el cursor sobre las palabras para analizar
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // PASO 3: CALENTAMIENTO REPETIBLE DINÁMICO
                  if (scMin.type === "calentamiento") {
                    const idx = scMin.subIndex;
                    const warmupObj = activeLesson.calentamiento[idx];
                    return (
                      <div className="space-y-4 w-full">
                        <div className="text-center space-y-1">
                          <span className="text-[10px] font-extrabold uppercase text-[#1cb0f6] tracking-widest bg-sky-50 px-2 py-0.5 rounded">
                            PASO 3 DE 5: CALENTAMIENTO TRADUCCIÓN ({idx + 1}/{activeLesson.calentamiento.length})
                          </span>
                          <h4 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
                            Construye la Frase
                          </h4>
                        </div>

                        {/* SOURCE SPANISH BOX - GREAT HEIGHT AND CONTRAST */}
                        <div className="duo-card p-4 bg-[#1cb0f6]/10 border-b-4 border-[#1cb0f6]/20 rounded-xl max-w-2xl w-full mx-auto flex items-center gap-3">
                          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow text-lg shrink-0">
                            🗣️
                          </div>
                          <div className="text-left flex-1">
                            <span className="text-[9px] uppercase font-extrabold text-sky-600 tracking-widest block mb-0.5">Traduce esta frase al inglés:</span>
                            <p className="text-lg font-black text-slate-800 leading-tight">{warmupObj.fraseMetaEs}</p>
                          </div>
                        </div>

                        {/* TOGGLE INPUT MODE SWITCHER (Burbujas vs Teclado) LARGER BAR */}
                        <div className="flex justify-center">
                          <div className="bg-slate-100 rounded-xl p-1 inline-flex items-center gap-1.5 border border-slate-200">
                            <button
                              onClick={() => {
                                setKeyboardMode(false);
                                initializeBubbles(warmupObj.fraseMetaEn);
                              }}
                              className={`py-1.5 px-4 text-xs font-black rounded-lg transition-all cursor-pointer ${
                                !keyboardMode ? "bg-white text-[#1cb0f6] shadow" : "text-slate-650 hover:text-slate-850"
                              }`}
                            >
                              Modo Burbujas
                            </button>
                            <button
                              onClick={() => setKeyboardMode(true)}
                              className={`py-1.5 px-4 text-xs font-black rounded-lg transition-all cursor-pointer ${
                                keyboardMode ? "bg-white text-[#1cb0f6] shadow" : "text-slate-650 hover:text-slate-850"
                              }`}
                            >
                              Modo Teclado
                            </button>
                          </div>
                        </div>

                        {/* DISPLAY ZONE */}
                        <div className="max-w-2xl w-full mx-auto space-y-4">
                          
                          {keyboardMode ? (
                            // TYPING MODE TEXTAREA
                            <textarea
                              value={userTypedTranslation}
                              onChange={(e) => setUserTypedTranslation(e.target.value)}
                              placeholder="Escribe tu traducción en inglés aquí..."
                              className="w-full min-h-[80px] p-3 text-base font-bold border-2 border-slate-250 focus:border-sky-500 outline-none rounded-xl bg-white select-all text-slate-800 shadow-inner"
                            />
                          ) : (
                            // BUBBLES MODE LAYOUT
                            <div className="space-y-3">
                              
                              {/* Selected row */}
                              <div className="min-h-[56px] p-3 border-2 border-dashed border-slate-200 flex flex-wrap gap-1.5 items-center bg-slate-50/50 rounded-xl">
                                {selectedBubbles.length === 0 ? (
                                  <span className="text-xs font-bold text-slate-400 italic">Haz click abajo en las palabras para ordenar la frase...</span>
                                ) : (
                                  selectedBubbles.map((word, bIdx) => (
                                    <button
                                      key={bIdx}
                                      onClick={() => {
                                        // Put word back inside pool
                                        const updatedSel = selectedBubbles.filter((_, i) => i !== bIdx);
                                        setSelectedBubbles(updatedSel);
                                        setScrambleBubbles([...scrambleBubbles, word]);
                                        speakWord(word);
                                      }}
                                      className="py-1.5 px-3 bg-white border border-slate-200 hover:border-slate-400 text-slate-800 font-extrabold rounded-lg text-xs shadow-sm bubble-item cursor-pointer"
                                    >
                                      {word}
                                    </button>
                                  ))
                                )}
                              </div>

                              {/* Target scramble pool */}
                              <div className="flex flex-wrap gap-1.5 justify-center py-3 bg-white p-3 rounded-lg border-2 border-dashed border-slate-200">
                                {scrambleBubbles.map((word, bIdx) => (
                                  <button
                                    key={bIdx}
                                    onClick={() => {
                                      // Push to selected list
                                      setSelectedBubbles([...selectedBubbles, word]);
                                      setScrambleBubbles(scrambleBubbles.filter((_, i) => i !== bIdx));
                                      speakWord(word);
                                    }}
                                    className="py-1.5 px-3 bg-slate-50 border border-slate-200 hover:border-sky-500 hover:bg-sky-50 text-slate-850 font-black rounded-lg text-sm shadow active:translate-y-0.5 transition-all cursor-pointer"
                                  >
                                    {word}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }

                  // PASO 4: PRONUNCIACIÓN DE GRABACIÓN DE VOZ REAL (DISEÑO ACCESIBLE AMPLIADO)
                  if (scMin.type === "pronunciacion") {
                    const phrases = activeLesson.frasesPronunciacion && activeLesson.frasesPronunciacion.length > 0
                      ? activeLesson.frasesPronunciacion
                      : [activeLesson.calentamiento[0]?.fraseMetaEn || "English is practical and beautiful"];
                    const subIdx = scMin.subIndex ?? 0;
                    const speechTarget = phrases[subIdx] || "English is practical and beautiful";
                    return (
                      <div className="space-y-4 text-center w-full">
                        <div className="space-y-1">
                          <span className="text-[10px] font-extrabold uppercase text-[#1cb0f6] tracking-widest bg-sky-50 px-2 py-0.5 rounded">
                            PASO 4 DE 5: PRÁCTICA DE PRONUNCIACIÓN (Frase {subIdx + 1} de {phrases.length})
                          </span>
                          <h4 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
                            Habla Frente al Micrófono Obtenido
                          </h4>
                          <p className="text-slate-500 text-xs font-bold max-w-md mx-auto">
                            Toca el icono del parlante para escuchar el acento nativo, y presiona el micro de abajo para grabarte.
                          </p>
                        </div>

                        {/* DISPLAY TEXT CARD TARGET (WIDESCREEN ACCESSIBLE) */}
                        <div className="max-w-2xl w-full mx-auto duo-card p-4 bg-slate-50 border-b-4 flex flex-col items-center justify-center space-y-2 rounded-xl shadow-sm">
                          
                          <div className="flex gap-2 justify-center items-center">
                            <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#1cb0f6]">
                              Frase Objetivo
                            </span>
                            <button
                              onClick={() => speakWord(speechTarget)}
                              className="text-sky-600 hover:bg-sky-200 p-1.5 rounded-full transition-colors bg-sky-100 cursor-pointer shadow-sm"
                              title="Reproducir frase nativa"
                            >
                              <Volume2 className="w-4 h-4" />
                            </button>
                          </div>

                          <h3 className="text-xl md:text-2xl font-black text-slate-800 leading-tight tracking-wide text-center">
                            "{speechTarget}"
                          </h3>

                        </div>

                        {/* SPEECH INTERACTION CONTROLLER */}
                        <div className="max-w-2xl w-full mx-auto space-y-4">
                          
                          {/* Giant mic trigger round button representing Duolingo colors */}
                          <div className="flex flex-col items-center justify-center space-y-3">
                            <button
                              onClick={() => startVoiceRecording(speechTarget)}
                              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md border-2 border-white outline-none active:scale-95 ${
                                isListeningVoice 
                                  ? "bg-rose-600 hover:bg-rose-500 text-white animate-pulse shadow-rose-200" 
                                  : "bg-sky-500 hover:bg-sky-400 text-white hover:shadow-lg hover:shadow-sky-100"
                              }`}
                            >
                              {isListeningVoice ? (
                                <Mic className="w-8 h-8 fill-current" />
                              ) : (
                                <MicOff className="w-8 h-8 fill-current" />
                              )}
                            </button>

                            {/* Animated digital wave when recording */}
                            {isListeningVoice && (
                              <div className="flex justify-center items-center gap-1.5 h-6 mt-1 bg-rose-50 px-3 py-1 rounded-full border border-rose-100">
                                <span className="text-[10px] font-black text-rose-600 uppercase tracking-wider mr-1 animate-pulse">Grabando Voz:</span>
                                <span className="w-1 bg-rose-500 rounded animate-bounce [animation-delay:0.1s]" style={{ height: '14px' }} />
                                <span className="w-1 bg-pink-500 rounded animate-bounce [animation-delay:0.25s]" style={{ height: '22px' }} />
                                <span className="w-1 bg-red-500 rounded animate-bounce [animation-delay:0.15s]" style={{ height: '10px' }} />
                                <span className="w-1 bg-rose-500 rounded animate-bounce [animation-delay:0.35s]" style={{ height: '18px' }} />
                                <span className="w-1 bg-pink-500 rounded animate-bounce [animation-delay:0.2s]" style={{ height: '12px' }} />
                              </div>
                            )}
                          </div>

                          <div className="space-y-1">
                            {isListeningVoice ? (
                              <p className="text-rose-600 font-extrabold text-xs animate-pulse">
                                ¡Escuchando tu pronunciación en inglés... Habla ahora! 🎙️
                              </p>
                            ) : (
                              <p className="text-slate-600 font-extrabold text-xs">
                                Haz click en el micrófono circular azul para iniciar la grabación
                              </p>
                            )}
                          </div>

                          {/* REVEAL TRANSCRIPT & ACCURACY SIMILARITY METERS */}
                          {voiceTranscript && (
                            <div className="bg-sky-50/70 p-4 rounded-xl border border-sky-100 max-w-md mx-auto space-y-2 shadow-sm">
                              <span className="text-[10px] uppercase font-extrabold text-sky-600 tracking-wider block">Transcripción Escuchada:</span>
                              <p className="text-base font-black text-sky-950 italic">"{voiceTranscript}"</p>
                              
                              {voiceSimilarity !== null && (
                                <div className="mt-2 pt-2 border-t border-sky-200/40">
                                  <span className="text-[10px] uppercase font-extrabold text-slate-500 block">Precisión de Pronunciación</span>
                                  <div className="flex justify-center items-center gap-2 mt-1">
                                    <span className={`text-2xl font-black ${
                                      voiceSimilarity >= 70 ? "text-emerald-600" : "text-rose-500"
                                    }`}>
                                      {voiceSimilarity}%
                                    </span>
                                    <span className="text-xs text-slate-500 font-bold">de coincidencia con el patrón</span>
                                  </div>
                                  <p className="text-[10px] text-slate-400 mt-1 font-bold">
                                    {voiceSimilarity >= 70 
                                      ? "¡Excelente trabajo! Pronunciado como un nativo." 
                                      : "¡Buen intento! Presiona de nuevo el micro para perfeccionarlo."}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}

                          {speechError && (
                            <div className="text-[11px] bg-amber-50 text-amber-800 p-3 rounded-lg font-bold border border-amber-200 max-w-md mx-auto shadow-sm space-y-1">
                              <p>{speechError}</p>
                              <p className="text-[10px] text-amber-600 font-medium">Nota: El sistema simulará automáticamente un resultado correcto para que no te estanques si hay restricciones de hardware en este dispositivo.</p>
                            </div>
                          )}

                        </div>
                      </div>
                    );
                  }

                  if (scMin.type === "evaluacion") {
                    const idx = scMin.subIndex;
                    const questionObj = activeLesson.evaluacion[idx];

                    return (
                      <div className="space-y-4 w-full">
                        <div className="text-center space-y-1">
                          <span className="text-[10px] font-extrabold uppercase text-[#1cb0f6] tracking-widest bg-sky-50 px-2 py-0.5 rounded">
                            PASO 5 DE 5: EVALUACIÓN CALIFICADA ({idx + 1}/{activeLesson.evaluacion.length})
                          </span>
                          <h4 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
                            Elige la Alternativa Correcta
                          </h4>
                        </div>

                        {/* THE WRITTEN ENUNCIADO OF EXAM QUESTION */}
                        <div className="bg-white p-4 rounded-xl border-2 border-slate-200 text-center max-w-2xl w-full mx-auto shadow-sm">
                          <GraduationCap className="w-8 h-8 text-emerald-500 mx-auto mb-1.5" />
                          <h4 className="text-base md:text-lg font-extrabold text-slate-800 leading-snug">
                            {questionObj.pregunta}
                          </h4>
                        </div>

                        {/* 4 CHOICE ALTERNATIVES VERTICAL LIST - GRID LAYOUT TO PREVENT OVERFLOWS */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-2xl w-full mx-auto">
                          {questionObj.opciones.map((opt, oIdx) => {
                            const isSelected = selectedExamOptionIndex === oIdx;
                            return (
                              <button
                                key={oIdx}
                                onClick={() => {
                                  setSelectedExamOptionIndex(oIdx);
                                  speakWord(opt.texto);
                                }}
                                className={`w-full p-3 text-left font-bold text-sm rounded-xl cursor-pointer transition-all border-2 select-none shadow-sm hover:translate-y-[-1px] active:translate-y-[0px] ${
                                  isSelected
                                    ? "bg-sky-50 border-sky-500 text-sky-900 ring-1 ring-sky-300"
                                    : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700"
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs select-none border shrink-0 ${
                                    isSelected 
                                      ? "bg-sky-500 border-sky-500 text-white shadow-sm" 
                                      : "border-slate-300 text-slate-500 bg-slate-50"
                                  }`}>
                                    {String.fromCharCode(65 + oIdx)}
                                  </div>
                                  <span className="flex-1 leading-snug text-slate-800 font-bold text-xs md:text-xs">{opt.texto}</span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }

                })() || <div className="p-4 text-center">Sin contenido</div>}

                {/* BOTONES DE CONTROL DE LECCIÓN INTEGRADOS DIRECTAMENTE EN EL CONTENIDO */}
                <div className="mt-6 pt-4 border-t-2 border-slate-100 w-full animate-fade-in">
                  {(() => {
                    const scMin = flatScreens[flatScreenIndex];
                    const isVocab = scMin?.type === "vocabulario";
                    const totalVocabCount = activeLesson
                      ? (activeLesson.vocabularioDetallado && activeLesson.vocabularioDetallado.length > 0
                          ? activeLesson.vocabularioDetallado.length
                          : activeLesson.listaVocabulario?.length || 0)
                      : 0;
                    const missingVocab = isVocab ? Math.max(0, totalVocabCount - vistosVocabulario.length) : 0;

                    if (feedbackState === "idle") {
                      return (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 max-w-2xl mx-auto">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xl shrink-0">
                              {isVocab ? "📝" : "💡"}
                            </div>
                            <div className="text-left">
                              <p className="text-slate-800 font-extrabold text-sm leading-tight">
                                {isVocab 
                                  ? (missingVocab > 0 
                                      ? `Vocabulario Inicial (${vistosVocabulario.length}/${totalVocabCount})` 
                                      : "¡Vocabulario completado!")
                                  : "¿Tienes lista tu respuesta?"}
                              </p>
                              <p className="text-[10px] text-slate-500 font-bold mt-0.5">
                                {isVocab
                                  ? (missingVocab > 0 
                                      ? `Debes presionar las ${missingVocab} palabra(s) restante(s) para continuar.` 
                                      : "Haz click en comprobar para avanzar al siguiente paso.")
                                  : "Haz click en el botón comprobar para calificar tu rendimiento."}
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={handleCheckAnswer}
                            disabled={isVocab && missingVocab > 0}
                            className={`py-2.5 px-6 text-sm font-black tracking-wider uppercase rounded-xl shrink-0 cursor-pointer active:scale-95 transition-transform ${
                              isVocab && missingVocab > 0
                                ? "bg-slate-300 border-b-4 border-slate-400 text-slate-500 cursor-not-allowed opacity-75 active:scale-100"
                                : "btn-3d-green"
                            }`}
                          >
                            {isVocab ? "COMPROBAR VOCABULARIO" : "COMPROBAR RESPUESTA"}
                          </button>
                        </div>
                      );
                    } else {
                      return (
                        /* Colored results feedback panel with scaled text */
                        <div className={`w-full max-w-2xl mx-auto rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 transition-all duration-200 border-2 ${
                          feedbackState === "correct" 
                            ? "bg-[#d7ffb7] border-[#58cc02] text-[#58cc02]" 
                            : "bg-[#ffdfe0] border-[#ff4b4b] text-[#ea2b2b]"
                        }`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm font-black text-xl bg-white ${
                              feedbackState === "correct" ? "text-emerald-500" : "text-rose-500"
                            }`}>
                              {feedbackState === "correct" ? "✓" : "✗"}
                            </div>
                            <div className="text-left">
                              <h5 className="font-extrabold text-sm uppercase tracking-wide leading-none mb-0.5">
                                {feedbackState === "correct" ? "¡Excelente Trabajo!" : "Sigue Practicando"}
                              </h5>
                              <p className="text-slate-800 font-bold text-xs mt-0.5 leading-tight">
                                {feedbackMessage}
                              </p>
                              {correctAnswerReveal && (
                                <p className="text-slate-900 text-[10px] font-mono font-bold mt-1.5 py-0.5 px-1.5 bg-white/55 border border-white rounded inline-block">
                                  <b>Solución:</b> "{correctAnswerReveal}"
                                </p>
                              )}
                            </div>
                          </div>

                          <button
                            onClick={handleContinueWalkthrough}
                            className={`py-2.5 px-6 text-xs font-black tracking-wider uppercase rounded-xl shrink-0 cursor-pointer active:scale-95 transition-transform ${
                              feedbackState === "correct" 
                                ? "btn-3d-green text-white" 
                                : "btn-3d-danger text-white"
                            }`}
                          >
                            CONTINUAR PASO
                          </button>
                        </div>
                      );
                    }
                  })()}
                </div>

              </div>
            )}

          </main>

        </div>
      )}

    </div>
  );
}
