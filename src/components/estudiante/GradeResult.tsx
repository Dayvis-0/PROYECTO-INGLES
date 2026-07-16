import { Award, AlertCircle } from "lucide-react";
import { useAppContext } from "../../context/AppContext";

interface Props {
  activeLessonTitle: string;
  totalExamQuestions: number;
}

export default function GradeResult({ activeLessonTitle, totalExamQuestions }: Props) {
  const {
    gainedGrade,
    gainedCorrect,
    setWalkthroughActive,
    setCurrentView,
    setFlatScreenIndex,
    setVistosVocabulario,
    setExamCorrectCount,
    setGainedGrade: setGainedGradeCtx,
    setGainedCorrect,
    setFeedbackState,
    setFeedbackMessage,
    setCorrectAnswerReveal,
    setUserTypedTranslation,
    setSelectedBubbles,
    setVoiceSimilarity,
    setVoiceTranscript,
    setSelectedExamOptionIndex,
  } = useAppContext();

  if (gainedGrade === null) return null;
  const isApproved = gainedGrade >= 15;

  return (
    <div className="text-center py-10 px-6 space-y-6 my-auto max-w-3xl mx-auto">
      {isApproved ? (
        <>
          <div className="inline-flex justify-center items-center w-24 h-24 bg-yellow-105 bg-yellow-100 rounded-full text-yellow-500 animate-bounce shadow-sm border border-yellow-200">
            <Award className="w-14 h-14" />
          </div>
          <div className="space-y-2">
            <span className="text-xs font-black uppercase text-emerald-700 tracking-widest bg-emerald-50 px-3 py-1 rounded">
              ¡LECCIÓN APROBADA CON ÉXITO! 🎉
            </span>
            <h3 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">{activeLessonTitle}</h3>
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
            <h3 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">{activeLessonTitle}</h3>
            <p className="text-red-650 text-sm md:text-base font-semibold max-w-2xl mx-auto">
              Según las directivas pedagógicas integradas, necesitas obtener al menos la nota académica de 15 para habilitar la compleción de esta sesión.
            </p>
          </div>
        </>
      )}

      <div className="max-w-xs mx-auto bg-slate-50 border-2 border-slate-250 rounded-3xl p-6 shadow-sm">
        <div className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-2">Tu Nota Final Obtenida</div>
        <div className="flex items-baseline justify-center gap-2">
          <span className={`text-6xl font-black tracking-tight ${isApproved ? "text-emerald-600" : "text-rose-600"}`}>
            {gainedGrade.toString().padStart(2, "0")}
          </span>
          <span className="text-xl font-bold text-slate-400">/ 20</span>
        </div>
        <div className="mt-4 border-t border-slate-200 pt-3 text-xs md:text-sm font-bold text-slate-500">
          Aciertos correctos: {gainedCorrect} de {totalExamQuestions}
        </div>
      </div>

      <div className="pt-6">
        {isApproved ? (
          <button onClick={() => { setWalkthroughActive(false); setCurrentView("estudiante_home"); }}
            className="py-4 px-12 text-lg font-black tracking-wider uppercase rounded-xl btn-3d-green w-64 cursor-pointer"
          >
            CONCLUIR LECCIÓN
          </button>
        ) : (
          <div className="space-y-4 flex flex-col items-center">
            <p className="text-xs md:text-sm text-rose-500 font-bold max-w-md mx-auto">
              Iniciaremos la lección de nuevo desde vocabulario para ayudarte a dominar las frases.
            </p>
            <button onClick={() => {
              setFlatScreenIndex(0);
              setVistosVocabulario([]);
              setExamCorrectCount(0);
              setGainedGradeCtx(null);
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
  );
}
