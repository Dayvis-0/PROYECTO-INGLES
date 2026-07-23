import { useState } from "react";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { useWalkthrough } from "../hooks/useWalkthrough";
import { ProgressBar, FeedbackBanner, ModalConfirm } from "../components/ui";
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
    vistosVocabulario,
    feedbackState,
    feedbackMessage,
    correctAnswerReveal,
    gainedGrade,
    setWalkthroughActive,
  } = useAppContext();
  const navigate = useNavigate();

  const { handleCheckAnswer, handleContinueWalkthrough } = useWalkthrough();
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  if (!walkthroughActive || !activeLesson) return null;

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
            setShowExitConfirm(true);
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

      <ModalConfirm
        isOpen={showExitConfirm}
        title="Salir de la lección"
        message="¿Estás seguro de que deseas salir y perder tu progreso actual?"
        confirmText="Sí, salir"
        cancelText="Seguir aquí"
        variant="warning"
        onConfirm={() => {
          setShowExitConfirm(false);
          setWalkthroughActive(false);
          navigate("/estudiante");
        }}
        onCancel={() => setShowExitConfirm(false)}
      />
    </div>
  );
}
