import { X } from "lucide-react";
import type { Calificacion } from "../types";
import { saveStoredCalificaciones } from "../data";
import { cleanCompare } from "../utils/cleaners";
import { useAppContext } from "../context/AppContext";
import { ProgressBar, FeedbackBanner } from "../components/ui";
import {
  VocabularioStep,
  GramaticaStep,
  CalentamientoStep,
  PronunciacionStep,
  EvaluacionStep,
  GradeResult,
} from "../components/estudiante";

export default function EstudianteLeccionView() {
  const {
    walkthroughActive,
    activeLesson,
    flatScreens,
    flatScreenIndex,
    setFlatScreenIndex,
    vistosVocabulario,
    keyboardMode,
    userTypedTranslation,
    selectedBubbles,
    voiceSimilarity,
    selectedExamOptionIndex,
    feedbackState,
    setFeedbackState,
    feedbackMessage,
    setFeedbackMessage,
    correctAnswerReveal,
    setCorrectAnswerReveal,
    examCorrectCount,
    setExamCorrectCount,
    voiceTranscript,
    voiceSimilarity: voiceSim,
    gainedGrade,
    setGainedGrade,
    gainedCorrect,
    setGainedCorrect,
    currentUser,
    calificaciones,
    setCalificaciones,
    setWalkthroughActive,
    setCurrentView,
    setUserTypedTranslation,
    setSelectedBubbles,
    setVoiceSimilarity,
    setVoiceTranscript,
    setSelectedExamOptionIndex,
    scrambleBubbles,
    setScrambleBubbles,
    setActiveHoverGrammarWord,
  } = useAppContext();

  if (!walkthroughActive || !activeLesson) return null;

  // ── Handlers ────────────────────────────────────────────

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
      const similarity = voiceSim !== null ? voiceSim : 0;

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
        const mainWords = item.fraseMetaEn
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

  // ── Helpers para la bottom bar ──────────────────────────

  const currentScreen = flatScreens[flatScreenIndex];
  const isVocab = currentScreen?.type === "vocabulario";
  const totalVocabCount = activeLesson
    ? activeLesson.vocabularioDetallado && activeLesson.vocabularioDetallado.length > 0
      ? activeLesson.vocabularioDetallado.length
      : activeLesson.listaVocabulario?.length || 0
    : 0;
  const missingVocab = isVocab ? Math.max(0, totalVocabCount - vistosVocabulario.length) : 0;

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

        <ProgressBar current={flatScreenIndex} total={flatScreens.length} />

        <div className="text-xs md:text-sm font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">
          Paso {flatScreenIndex + 1} / {flatScreens.length}
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-3 md:py-4 flex flex-col justify-between overflow-y-auto space-y-4">
        {gainedGrade !== null ? (
          <GradeResult
            activeLessonTitle={activeLesson.titulo}
            totalExamQuestions={activeLesson.evaluacion.length}
          />
        ) : (
          <div className="flex-1 flex flex-col justify-center">
            {(() => {
              const scMin = flatScreens[flatScreenIndex];
              if (!scMin) return null;

              switch (scMin.type) {
                case "vocabulario":
                  return <VocabularioStep />;
                case "gramatica":
                  return <GramaticaStep />;
                case "calentamiento":
                  return <CalentamientoStep subIndex={scMin.subIndex} />;
                case "pronunciacion":
                  return <PronunciacionStep subIndex={scMin.subIndex} />;
                case "evaluacion":
                  return <EvaluacionStep subIndex={scMin.subIndex} />;
                default:
                  return null;
              }
            })()}

            <div className="mt-6 pt-4 border-t-2 border-slate-100 w-full animate-fade-in">
              {feedbackState === "idle" ? (
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
              ) : (
                <FeedbackBanner
                  state={feedbackState}
                  message={feedbackMessage}
                  correctAnswerReveal={correctAnswerReveal}
                  onContinue={handleContinueWalkthrough}
                />
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
