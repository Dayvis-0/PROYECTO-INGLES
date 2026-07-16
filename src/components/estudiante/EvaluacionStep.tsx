import { GraduationCap } from "lucide-react";
import { speakWord } from "../../utils/tts";
import { useAppContext } from "../../context/AppContext";

export default function EvaluacionStep({ subIndex }: { subIndex: number }) {
  const { activeLesson, selectedExamOptionIndex, setSelectedExamOptionIndex } = useAppContext();
  if (!activeLesson) return null;

  const questionObj = activeLesson.evaluacion[subIndex];

  return (
    <div className="space-y-4 w-full">
      <div className="text-center space-y-1">
        <span className="text-[10px] font-extrabold uppercase text-[#1cb0f6] tracking-widest bg-sky-50 px-2 py-0.5 rounded">
          PASO 5 DE 5: EVALUACIÓN CALIFICADA ({subIndex + 1}/{activeLesson.evaluacion.length})
        </span>
        <h4 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
          Elige la Alternativa Correcta
        </h4>
      </div>

      <div className="bg-white p-4 rounded-xl border-2 border-slate-200 text-center max-w-2xl w-full mx-auto shadow-sm">
        <GraduationCap className="w-8 h-8 text-emerald-500 mx-auto mb-1.5" />
        <h4 className="text-base md:text-lg font-extrabold text-slate-800 leading-snug">{questionObj.pregunta}</h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-2xl w-full mx-auto">
        {questionObj.opciones.map((opt, oIdx) => {
          const isSelected = selectedExamOptionIndex === oIdx;
          return (
            <button key={oIdx} onClick={() => { setSelectedExamOptionIndex(oIdx); speakWord(opt.texto); }}
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
