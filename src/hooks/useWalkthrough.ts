import { useCallback } from "react";
import type { Calificacion } from "../types";
import { saveStoredCalificaciones } from "../data";
import { cleanCompare } from "../utils/cleaners";
import { useAppContext } from "../context/AppContext";

/**
 * useWalkthrough — encapsulates the student lesson walkthrough logic:
 * answer checking, navigation between steps, and final grade calculation.
 */
export function useWalkthrough() {
  const {
    flatScreens,
    flatScreenIndex,
    setFlatScreenIndex,
    vistosVocabulario,
    keyboardMode,
    userTypedTranslation,
    setUserTypedTranslation,
    selectedBubbles,
    setSelectedBubbles,
    voiceSimilarity,
    setVoiceSimilarity,
    selectedExamOptionIndex,
    setSelectedExamOptionIndex,
    setFeedbackState,
    setFeedbackMessage,
    correctAnswerReveal,
    setCorrectAnswerReveal,
    examCorrectCount,
    setExamCorrectCount,
    setVoiceTranscript,
    gainedGrade,
    setGainedGrade,
    gainedCorrect,
    setGainedCorrect,
    currentUser,
    calificaciones,
    setCalificaciones,
    setWalkthroughActive,
    setCurrentView,
    setActiveHoverGrammarWord,
    setScrambleBubbles,
    activeLesson,
  } = useAppContext();

  const handleCheckAnswer = useCallback(() => {
    const currentScreen = flatScreens[flatScreenIndex];
    if (!currentScreen || !activeLesson) return;

    if (currentScreen.type === "vocabulario") {
      const totalWords =
        activeLesson.vocabularioDetallado &&
        activeLesson.vocabularioDetallado.length > 0
          ? activeLesson.vocabularioDetallado.length
          : activeLesson.listaVocabulario?.length || 0;

      if (vistosVocabulario.length < totalWords) {
        alert(
          "Por favor repasa y presiona todas las palabras del vocabulario para escuchar su pronunciación antes de continuar."
        );
        return;
      }

      setFeedbackState("correct");
      setFeedbackMessage(
        "¡Vocabulario aprendido! Sigamos con la regla gramatical."
      );
    } else if (currentScreen.type === "gramatica") {
      // Play a subtle chime
      try {
        const ctx = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } catch {
        // Audio not available — silent
      }

      setFeedbackState("correct");
      setFeedbackMessage(
        "¡Estructura analizada con éxito! Iniciemos los retos prácticos de calentamiento."
      );
    } else if (currentScreen.type === "calentamiento") {
      const idx = currentScreen.subIndex;
      const targetWarmup = activeLesson.calentamiento[idx];
      const correctAns = targetWarmup.fraseMetaEn;
      const studentInput = keyboardMode
        ? userTypedTranslation
        : selectedBubbles.join(" ");
      const isCorrect =
        cleanCompare(studentInput) === cleanCompare(correctAns);

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
        activeLesson.frasesPronunciacion &&
        activeLesson.frasesPronunciacion.length > 0
          ? activeLesson.frasesPronunciacion
          : [
              activeLesson.calentamiento[0]?.fraseMetaEn ||
                "English is dynamic and fun",
            ];
      const subIdx = currentScreen.subIndex ?? 0;
      const targetSent =
        targetPhrases[subIdx] || "English is dynamic and fun";
      const similarity = voiceSimilarity !== null ? voiceSimilarity : 0;

      if (similarity >= 70) {
        setFeedbackState("correct");
        setFeedbackMessage(
          `¡Espectacular pronunciación! Lograste un ${similarity}% de coincidencia.`
        );
      } else {
        setFeedbackState("incorrect");
        setFeedbackMessage(
          `Coincidencia insuficiente (${similarity}%). Intenta hablar fuerte y claro.`
        );
        setCorrectAnswerReveal(targetSent);
      }
    } else if (currentScreen.type === "evaluacion") {
      const idx = currentScreen.subIndex;
      const targetEval = activeLesson.evaluacion[idx];

      if (selectedExamOptionIndex === null) {
        alert(
          "Por favor selecciona una alternativa antes de continuar."
        );
        return;
      }

      const isCorrect =
        targetEval.opciones[selectedExamOptionIndex].correcta;
      const correctOptText =
        targetEval.opciones.find((o) => o.correcta)?.texto || "";

      if (isCorrect) {
        setFeedbackState("correct");
        setFeedbackMessage(
          "¡Respuesta Correcta! Sigue sumando puntos."
        );
        setExamCorrectCount((prev: number) => prev + 1);
      } else {
        setFeedbackState("incorrect");
        setFeedbackMessage(
          "La respuesta seleccionada es incorrecta."
        );
        setCorrectAnswerReveal(correctOptText);
      }
    }
  }, [
    flatScreens,
    flatScreenIndex,
    activeLesson,
    vistosVocabulario,
    keyboardMode,
    userTypedTranslation,
    selectedBubbles,
    voiceSimilarity,
    selectedExamOptionIndex,
    setFeedbackState,
    setFeedbackMessage,
    setCorrectAnswerReveal,
    setExamCorrectCount,
  ]);

  const handleContinueWalkthrough = useCallback(() => {
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
          .map((w) =>
            w.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "")
          );
        const distractors = [
          "the",
          "at",
          "with",
          "coding",
          "everyday",
          "park",
          "always",
          "English",
        ];
        const filteredDistractors = distractors.filter(
          (d) =>
            !mainWords
              .map((w) => w.toLowerCase())
              .includes(d.toLowerCase())
        );
        const chosenDistractors = filteredDistractors
          .sort(() => 0.5 - Math.random())
          .slice(0, 2);
        const finalSelection = [...mainWords, ...chosenDistractors].sort(
          () => 0.5 - Math.random()
        );
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
        (c) =>
          c.estudiante === currentStudent &&
          c.leccionId === activeLesson.id
      );

      let updatedHistory: Calificacion[];
      if (existingIndex !== -1) {
        const updatedGrade = {
          ...calificaciones[existingIndex],
          nota: score,
          fecha: new Date()
            .toISOString()
            .replace("T", " ")
            .substring(0, 16),
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
          fecha: new Date()
            .toISOString()
            .replace("T", " ")
            .substring(0, 16),
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
  }, [
    flatScreenIndex,
    flatScreens,
    activeLesson,
    vistosVocabulario,
    keyboardMode,
    userTypedTranslation,
    selectedBubbles,
    voiceSimilarity,
    selectedExamOptionIndex,
    examCorrectCount,
    currentUser,
    calificaciones,
    gainedGrade,
    gainedCorrect,
    setFeedbackState,
    setFeedbackMessage,
    setCorrectAnswerReveal,
    setUserTypedTranslation,
    setSelectedBubbles,
    setVoiceSimilarity,
    setVoiceTranscript,
    setSelectedExamOptionIndex,
    setFlatScreenIndex,
    setActiveHoverGrammarWord,
    setScrambleBubbles,
    setCalificaciones,
    setGainedGrade,
    setGainedCorrect,
    setWalkthroughActive,
    setCurrentView,
  ]);

  return {
    handleCheckAnswer,
    handleContinueWalkthrough,
  };
}
