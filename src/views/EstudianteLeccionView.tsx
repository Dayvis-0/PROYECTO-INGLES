import { useRef } from "react";
import {
  X,
  Volume2,
  Mic,
  MicOff,
  Award,
  AlertCircle,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import type { Calificacion } from "../types";
import { saveStoredCalificaciones } from "../data";
import { isWordSimilarityMatch } from "../utils/similarity";
import { cleanCompare } from "../utils/cleaners";
import { speakWord } from "../utils/tts";
import { getInteractiveGrammarSegments } from "../utils/grammar";
import { useAppContext } from "../context/AppContext";

export default function EstudianteLeccionView() {
  const {
    walkthroughActive,
    activeLesson,
    flatScreens,
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
    isListeningVoice,
    setIsListeningVoice,
    voiceTranscript,
    setVoiceTranscript,
    voiceSimilarity,
    setVoiceSimilarity,
    speechError,
    setSpeechError,
    gainedGrade,
    setGainedGrade,
    gainedCorrect,
    setGainedCorrect,
    currentUser,
    calificaciones,
    setCalificaciones,
    setWalkthroughActive,
    setCurrentView,
  } = useAppContext();

  const recognitionRef = useRef<any>(null);

  if (!walkthroughActive || !activeLesson) return null;

  // ── Handlers ────────────────────────────────────────────

  const startVoiceRecording = (targetSentence: string) => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (err) {
        console.warn("Error aborting previous recognition:", err);
      }
      recognitionRef.current = null;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechError(
        "La API de reconocimiento de voz no está soportada en tu navegador (usa Chrome, Edge o Safari). Iniciando práctica simulada para que continúes sin detenerte."
      );
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

        const cleanStr = (s: string) =>
          s
            .toLowerCase()
            .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "")
            .replace(/\s+/g, " ")
            .trim();
        const tWords = cleanStr(targetSentence).split(" ").filter(Boolean);
        const rWords = cleanStr(transcriptText).split(" ").filter(Boolean);

        let matchCount = 0;
        tWords.forEach((tWord) => {
          const hasMatch = rWords.some((rWord) => isWordSimilarityMatch(tWord, rWord));
          if (hasMatch) matchCount++;
        });

        const pct = Math.round(
          (matchCount / Math.max(tWords.length, rWords.length || 1)) * 100
        );
        setVoiceSimilarity(Math.min(pct, 100));
      };

      rec.onerror = (err: any) => {
        console.error("Speech Recognition Error", err);
        if (err.error === "not-allowed") {
          setSpeechError(
            "El acceso al micrófono está restringido. Por favor, asegúrate de dar permisos en tu navegador ó haz clic en el botón 'Permitir'. Si estás en un iframe, abre en una ventana nueva."
          );
        } else if (err.error === "no-speech") {
          setSpeechError(
            "No se detectó sonido. Intenta hablar más alto o verifica la conexión de tu micrófono."
          );
        } else {
          setSpeechError(
            `Error al acceder al micrófono (${err.error || "desconocido"}). Iniciando simulación automática.`
          );
        }

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

  const initializeBubbles = (sentence: string) => {
    const mainWords = sentence
      .split(/\s+/)
      .map((w) => w.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, ""));
    const distractors = ["the", "at", "with", "coding", "everyday", "park", "always", "English"];
    const filteredDistractors = distractors.filter(
      (d) => !mainWords.map((w) => w.toLowerCase()).includes(d.toLowerCase())
    );

    const chosenDistractors = filteredDistractors.sort(() => 0.5 - Math.random()).slice(0, 2);
    const finalSelection = [...mainWords, ...chosenDistractors].sort(() => 0.5 - Math.random());

    setScrambleBubbles(finalSelection);
    setSelectedBubbles([]);
  };

  const handleCheckAnswer = () => {
    const currentScreen = flatScreens[flatScreenIndex];
    if (!currentScreen || !activeLesson) return;

    if (currentScreen.type === "vocabulario") {
      const totalWords =
        activeLesson.vocabularioDetallado && activeLesson.vocabularioDetallado.length > 0
          ? activeLesson.vocabularioDetallado.length
          : activeLesson.listaVocabulario?.length || 0;

      if (vistosVocabulario.length < totalWords) {
        alert(
          "Por favor repasa y presiona todas las palabras del vocabulario para escuchar su pronunciación antes de continuar."
        );
        return;
      }

      setFeedbackState("correct");
      setFeedbackMessage("¡Vocabulario aprendido! Sigamos con la regla gramatical.");
    } else if (currentScreen.type === "gramatica") {
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } catch (_) {}

      setFeedbackState("correct");
      setFeedbackMessage("¡Estructura analizada con éxito! Iniciemos los retos prácticos de calentamiento.");
    } else if (currentScreen.type === "calentamiento") {
      const idx = currentScreen.subIndex;
      const targetWarmup = activeLesson.calentamiento[idx];
      const correctAns = targetWarmup.fraseMetaEn;

      const studentInput = keyboardMode ? userTypedTranslation : selectedBubbles.join(" ");

      const isCorrect = cleanCompare(studentInput) === cleanCompare(correctAns);

      if (isCorrect) {
        setFeedbackState("correct");
        setFeedbackMessage("¡Extraordinario! Traducido perfectamente.");
      } else {
        setFeedbackState("incorrect");
        setFeedbackMessage("¡Casi lo logras!");
        setCorrectAnswerReveal(correctAns);
      }
    } else if (currentScreen.type === "pronunciacion") {
      const targetPhrases =
        activeLesson.frasesPronunciacion && activeLesson.frasesPronunciacion.length > 0
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
    } else if (currentScreen.type === "evaluacion") {
      const idx = currentScreen.subIndex;
      const targetEval = activeLesson.evaluacion[idx];

      if (selectedExamOptionIndex === null) {
        alert("Por favor selecciona una alternativa antes de continuar.");
        return;
      }

      const isCorrect = targetEval.opciones[selectedExamOptionIndex].correcta;
      const correctOptText = targetEval.opciones.find((o) => o.correcta)?.texto || "";

      if (isCorrect) {
        setFeedbackState("correct");
        setFeedbackMessage("¡Respuesta Correcta! Sigue sumando puntos.");
        setExamCorrectCount((prev: number) => prev + 1);
      } else {
        setFeedbackState("incorrect");
        setFeedbackMessage("La respuesta seleccionada es incorrecta.");
        setCorrectAnswerReveal(correctOptText);
      }
    }
  };

  const handleContinueWalkthrough = () => {
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
      if (nextScreen.type === "gramatica" && activeLesson) {
        setActiveHoverGrammarWord(0);
      }
      if (nextScreen.type === "calentamiento" && activeLesson) {
        const item = activeLesson.calentamiento[nextScreen.subIndex];
        initializeBubbles(item.fraseMetaEn);
      }
    } else {
      if (!activeLesson) return;
      const totalExamsCount = activeLesson.evaluacion.length;

      const score =
        totalExamsCount > 0
          ? Math.round((examCorrectCount / totalExamsCount) * 20)
          : 20;

      const currentStudent = currentUser || "hitsuko.student";
      const existingIndex = calificaciones.findIndex(
        (c) => c.estudiante === currentStudent && c.leccionId === activeLesson.id
      );

      let updatedHistory;
      if (existingIndex !== -1) {
        const updatedGrade = {
          ...calificaciones[existingIndex],
          nota: score,
          fecha: new Date().toISOString().replace("T", " ").substring(0, 16),
          aciertos: examCorrectCount,
          totalPreguntas: totalExamsCount,
        };
        updatedHistory = [...calificaciones];
        updatedHistory[existingIndex] = updatedGrade;
      } else {
        const newGrade: Calificacion = {
          id: "eval_" + Date.now(),
          estudiante: currentStudent,
          leccionId: activeLesson.id,
          leccionTitulo: activeLesson.titulo,
          nota: score,
          fecha: new Date().toISOString().replace("T", " ").substring(0, 16),
          aciertos: examCorrectCount,
          totalPreguntas: totalExamsCount,
        };
        updatedHistory = [newGrade, ...calificaciones];
      }

      setCalificaciones(updatedHistory);
      saveStoredCalificaciones(updatedHistory);

      setGainedGrade(score);
      setGainedCorrect(examCorrectCount);
    }
  };

  // ── Render ──────────────────────────────────────────────

  return (
    <div className="flex-1 flex flex-col bg-white">

      <header className="py-4 px-6 md:px-12 flex items-center gap-4 border-b border-slate-100 bg-white">
        <button
          onClick={() => {
            if (gainedGrade !== null && gainedGrade < 15) {
              alert(
                "No has aprobado la lección con la nota mínima de 15. Debes reintentar la lección para poder completarla y salir."
              );
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

        <div className="flex-1 h-5 bg-[#e5e5e5] rounded-full overflow-hidden relative border border-slate-200">
          <div
            className="h-full bg-[#58cc02] rounded-full progress-bar-fill duration-300"
            style={{ width: `${((flatScreenIndex) / flatScreens.length) * 100}%` }}
          />
          <div className="absolute top-0.5 left-1 right-1 h-1 bg-white/20 rounded-full" />
        </div>

        <div className="text-xs md:text-sm font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">
          Paso {flatScreenIndex + 1} / {flatScreens.length}
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-3 md:py-4 flex flex-col justify-between overflow-y-auto space-y-4">

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
                <span
                  className={`text-6xl font-black tracking-tight ${
                    gainedGrade >= 15 ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
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
          <div className="flex-1 flex flex-col justify-center">
            {(() => {
              const scMin = flatScreens[flatScreenIndex];
              if (!scMin) return null;

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
                      {activeLesson.vocabularioDetallado && activeLesson.vocabularioDetallado.length > 0
                        ? activeLesson.vocabularioDetallado.map((item, idx) => {
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
                                  <span
                                    className={`text-[8px] uppercase font-black tracking-widest px-2 py-0.5 rounded-full border ${
                                      isVisto
                                        ? "text-emerald-700 bg-emerald-100/50 border-emerald-200"
                                        : "text-[#1cb0f6] bg-sky-50 border-sky-100"
                                    }`}
                                  >
                                    {item.categoria}
                                  </span>
                                )}
                                <div
                                  className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                                    isVisto
                                      ? "bg-emerald-100 text-emerald-600 group-hover:bg-emerald-200"
                                      : "bg-sky-50 text-sky-600 group-hover:bg-sky-100"
                                  }`}
                                >
                                  <Volume2 className="w-4 h-4" />
                                </div>
                                <span className="font-black text-sm md:text-base text-slate-800 leading-tight">
                                  {item.ingles} {isVisto && <span className="text-emerald-500 text-xs">✓</span>}
                                </span>
                                {item.espanol && (
                                  <span className="font-bold text-xs text-slate-500 italic block">
                                    &ldquo;{item.espanol}&rdquo;
                                  </span>
                                )}
                                <span
                                  className={`text-[8px] uppercase font-extrabold tracking-wider mt-0.5 ${
                                    isVisto ? "text-emerald-600" : "text-[#1cb0f6]"
                                  }`}
                                >
                                  {isVisto ? "¡Escuchado! 🗣️" : "Vocalizar 🗣️"}
                                </span>
                              </button>
                            );
                          })
                        : activeLesson.listaVocabulario.map((word, i) => {
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
                                <div
                                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                                    isVisto
                                      ? "bg-emerald-100 text-emerald-600 group-hover:bg-emerald-200"
                                      : "bg-sky-50 text-sky-600 group-hover:bg-sky-100"
                                  }`}
                                >
                                  <Volume2 className="w-5 h-5" />
                                </div>
                                <span className="font-black text-base text-slate-800">
                                  {word} {isVisto && <span className="text-emerald-500">✓</span>}
                                </span>
                                <span
                                  className={`text-[9px] uppercase font-extrabold tracking-wider ${
                                    isVisto ? "text-emerald-600" : "text-[#1cb0f6]"
                                  }`}
                                >
                                  {isVisto ? "¡Escuchado! 🗣️" : "Vocalizar 🗣️"}
                                </span>
                              </button>
                            );
                          })}
                    </div>

                    <div className="bg-sky-50 border border-sky-100 rounded-lg p-2.5 max-w-sm mx-auto text-[11px] text-sky-700 font-extrabold flex items-center justify-center gap-1.5 shadow-sm">
                      <Sparkles className="w-4 h-4 text-sky-600 shrink-0" />
                      <span>¡La pronunciación de audio nativo se activa al tocar cada elemento!</span>
                    </div>
                  </div>
                );
              }

              if (scMin.type === "gramatica") {
                const segments = getInteractiveGrammarSegments(activeLesson);

                const getSimpleRoleLabel = (role: string) => {
                  const lower = role.toLowerCase();
                  if (lower.includes("subject") || lower.includes("sujeto")) return "Sujeto / Subject 👤";
                  if (lower.includes("verb") || lower.includes("verbo")) return "Verbo / Verb ⚡";
                  if (lower.includes("complement") || lower.includes("complemento"))
                    return "Complemento / Complement 📌";
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

                    <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4.5 text-center space-y-1.5 select-none shadow-sm">
                      <span className="text-[9px] uppercase font-black tracking-widest text-[#1cb0f6] block">
                        Estructura Gramatical
                      </span>
                      <div className="text-base font-black text-slate-700 tracking-wide">
                        {activeLesson.formulaGramatica}
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200/60 rounded-xl p-6 shadow-sm space-y-5">
                      <span className="block text-[9px] uppercase font-black tracking-widest text-[#1cb0f6] text-center select-none">
                        EJEMPLO PRÁCTICO
                      </span>

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

                    <div className="duo-card p-4 bg-[#1cb0f6]/10 border-b-4 border-[#1cb0f6]/20 rounded-xl max-w-2xl w-full mx-auto flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow text-lg shrink-0">
                        🗣️
                      </div>
                      <div className="text-left flex-1">
                        <span className="text-[9px] uppercase font-extrabold text-sky-600 tracking-widest block mb-0.5">
                          Traduce esta frase al inglés:
                        </span>
                        <p className="text-lg font-black text-slate-800 leading-tight">{warmupObj.fraseMetaEs}</p>
                      </div>
                    </div>

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

                    <div className="max-w-2xl w-full mx-auto space-y-4">
                      {keyboardMode ? (
                        <textarea
                          value={userTypedTranslation}
                          onChange={(e) => setUserTypedTranslation(e.target.value)}
                          placeholder="Escribe tu traducción en inglés aquí..."
                          className="w-full min-h-[80px] p-3 text-base font-bold border-2 border-slate-250 focus:border-sky-500 outline-none rounded-xl bg-white select-all text-slate-800 shadow-inner"
                        />
                      ) : (
                        <div className="space-y-3">
                          <div className="min-h-[56px] p-3 border-2 border-dashed border-slate-200 flex flex-wrap gap-1.5 items-center bg-slate-50/50 rounded-xl">
                            {selectedBubbles.length === 0 ? (
                              <span className="text-xs font-bold text-slate-400 italic">
                                Haz click abajo en las palabras para ordenar la frase...
                              </span>
                            ) : (
                              selectedBubbles.map((word, bIdx) => (
                                <button
                                  key={bIdx}
                                  onClick={() => {
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

                          <div className="flex flex-wrap gap-1.5 justify-center py-3 bg-white p-3 rounded-lg border-2 border-dashed border-slate-200">
                            {scrambleBubbles.map((word, bIdx) => (
                              <button
                                key={bIdx}
                                onClick={() => {
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

              if (scMin.type === "pronunciacion") {
                const phrases =
                  activeLesson.frasesPronunciacion && activeLesson.frasesPronunciacion.length > 0
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
                        &ldquo;{speechTarget}&rdquo;
                      </h3>
                    </div>

                    <div className="max-w-2xl w-full mx-auto space-y-4">
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

                        {isListeningVoice && (
                          <div className="flex justify-center items-center gap-1.5 h-6 mt-1 bg-rose-50 px-3 py-1 rounded-full border border-rose-100">
                            <span className="text-[10px] font-black text-rose-600 uppercase tracking-wider mr-1 animate-pulse">
                              Grabando Voz:
                            </span>
                            <span className="w-1 bg-rose-500 rounded animate-bounce [animation-delay:0.1s]" style={{ height: "14px" }} />
                            <span className="w-1 bg-pink-500 rounded animate-bounce [animation-delay:0.25s]" style={{ height: "22px" }} />
                            <span className="w-1 bg-red-500 rounded animate-bounce [animation-delay:0.15s]" style={{ height: "10px" }} />
                            <span className="w-1 bg-rose-500 rounded animate-bounce [animation-delay:0.35s]" style={{ height: "18px" }} />
                            <span className="w-1 bg-pink-500 rounded animate-bounce [animation-delay:0.2s]" style={{ height: "12px" }} />
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

                      {voiceTranscript && (
                        <div className="bg-sky-50/70 p-4 rounded-xl border border-sky-100 max-w-md mx-auto space-y-2 shadow-sm">
                          <span className="text-[10px] uppercase font-extrabold text-sky-600 tracking-wider block">
                            Transcripción Escuchada:
                          </span>
                          <p className="text-base font-black text-sky-950 italic">&ldquo;{voiceTranscript}&rdquo;</p>

                          {voiceSimilarity !== null && (
                            <div className="mt-2 pt-2 border-t border-sky-200/40">
                              <span className="text-[10px] uppercase font-extrabold text-slate-500 block">
                                Precisión de Pronunciación
                              </span>
                              <div className="flex justify-center items-center gap-2 mt-1">
                                <span
                                  className={`text-2xl font-black ${
                                    voiceSimilarity >= 70 ? "text-emerald-600" : "text-rose-500"
                                  }`}
                                >
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
                          <p className="text-[10px] text-amber-600 font-medium">
                            Nota: El sistema simulará automáticamente un resultado correcto para que no te estanques si hay
                            restricciones de hardware en este dispositivo.
                          </p>
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

                    <div className="bg-white p-4 rounded-xl border-2 border-slate-200 text-center max-w-2xl w-full mx-auto shadow-sm">
                      <GraduationCap className="w-8 h-8 text-emerald-500 mx-auto mb-1.5" />
                      <h4 className="text-base md:text-lg font-extrabold text-slate-800 leading-snug">
                        {questionObj.pregunta}
                      </h4>
                    </div>

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
                              <div
                                className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs select-none border shrink-0 ${
                                  isSelected
                                    ? "bg-sky-500 border-sky-500 text-white shadow-sm"
                                    : "border-slate-300 text-slate-500 bg-slate-50"
                                }`}
                              >
                                {String.fromCharCode(65 + oIdx)}
                              </div>
                              <span className="flex-1 leading-snug text-slate-800 font-bold text-xs md:text-xs">
                                {opt.texto}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              }

              return null;
            })()}

            <div className="mt-6 pt-4 border-t-2 border-slate-100 w-full animate-fade-in">
              {(() => {
                const scMin = flatScreens[flatScreenIndex];
                const isVocab = scMin?.type === "vocabulario";
                const totalVocabCount = activeLesson
                  ? activeLesson.vocabularioDetallado && activeLesson.vocabularioDetallado.length > 0
                    ? activeLesson.vocabularioDetallado.length
                    : activeLesson.listaVocabulario?.length || 0
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
                              ? missingVocab > 0
                                ? `Vocabulario Inicial (${vistosVocabulario.length}/${totalVocabCount})`
                                : "¡Vocabulario completado!"
                              : "¿Tienes lista tu respuesta?"}
                          </p>
                          <p className="text-[10px] text-slate-500 font-bold mt-0.5">
                            {isVocab
                              ? missingVocab > 0
                                ? `Debes presionar las ${missingVocab} palabra(s) restante(s) para continuar.`
                                : "Haz click en comprobar para avanzar al siguiente paso."
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
                    <div
                      className={`w-full max-w-2xl mx-auto rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 transition-all duration-200 border-2 ${
                        feedbackState === "correct"
                          ? "bg-[#d7ffb7] border-[#58cc02] text-[#58cc02]"
                          : "bg-[#ffdfe0] border-[#ff4b4b] text-[#ea2b2b]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm font-black text-xl bg-white ${
                            feedbackState === "correct" ? "text-emerald-500" : "text-rose-500"
                          }`}
                        >
                          {feedbackState === "correct" ? "✓" : "✗"}
                        </div>
                        <div className="text-left">
                          <h5 className="font-extrabold text-sm uppercase tracking-wide leading-none mb-0.5">
                            {feedbackState === "correct" ? "¡Excelente Trabajo!" : "Sigue Practicando"}
                          </h5>
                          <p className="text-slate-800 font-bold text-xs mt-0.5 leading-tight">{feedbackMessage}</p>
                          {correctAnswerReveal && (
                            <p className="text-slate-900 text-[10px] font-mono font-bold mt-1.5 py-0.5 px-1.5 bg-white/55 border border-white rounded inline-block">
                              <b>Solución:</b> &ldquo;{correctAnswerReveal}&rdquo;
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={handleContinueWalkthrough}
                        className={`py-2.5 px-6 text-xs font-black tracking-wider uppercase rounded-xl shrink-0 cursor-pointer active:scale-95 transition-transform ${
                          feedbackState === "correct" ? "btn-3d-green text-white" : "btn-3d-danger text-white"
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
  );
}
