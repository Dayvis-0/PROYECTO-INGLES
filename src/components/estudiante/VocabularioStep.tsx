import { Volume2, Sparkles } from "lucide-react";
import { speakWord } from "../../utils/tts";
import { useAppContext } from "../../context/AppContext";

export default function VocabularioStep() {
  const { activeLesson, vistosVocabulario, setVistosVocabulario } = useAppContext();
  if (!activeLesson) return null;

  return (
    <div className="space-y-4 text-center w-full">
      <div className="space-y-1">
        <span className="text-xs md:text-sm font-extrabold uppercase text-[#1cb0f6] tracking-widest bg-sky-50 px-3 py-1 rounded">
          VOCABULARIO INICIAL
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
                <button key={idx} onClick={() => {
                  speakWord(item.ingles);
                  if (!vistosVocabulario.includes(item.ingles)) {
                    setVistosVocabulario([...vistosVocabulario, item.ingles]);
                  }
                }}
                  className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-1.5 transition-colors duration-200 shadow-sm active:scale-95 cursor-pointer text-center w-full group ${
                    isVisto ? "bg-emerald-50/50 border-emerald-300 hover:border-emerald-500" : "bg-white border-slate-200 hover:border-[#1cb0f6] hover:shadow"
                  }`}
                >
                  {item.categoria && (
                    <span className={`text-[8px] uppercase font-black tracking-widest px-2 py-0.5 rounded-full border ${
                      isVisto ? "text-emerald-700 bg-emerald-100/50 border-emerald-200" : "text-[#1cb0f6] bg-sky-50 border-sky-100"
                    }`}>
                      {item.categoria}
                    </span>
                  )}
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                    isVisto ? "bg-emerald-100 text-emerald-600 group-hover:bg-emerald-200" : "bg-sky-50 text-sky-600 group-hover:bg-sky-100"
                  }`}>
                    <Volume2 className="w-4 h-4" />
                  </div>
                  <span className="font-black text-sm md:text-base text-slate-800 leading-tight">
                    {item.ingles} {isVisto && <span className="text-emerald-500 text-xs">✓</span>}
                  </span>
                  {item.espanol && (
                    <span className="font-bold text-xs text-slate-500 italic block">&ldquo;{item.espanol}&rdquo;</span>
                  )}
                  <span className={`text-[8px] uppercase font-extrabold tracking-wider mt-0.5 ${
                    isVisto ? "text-emerald-600" : "text-[#1cb0f6]"
                  }`}>
                    {isVisto ? "¡Escuchado! 🗣️" : "Vocalizar 🗣️"}
                  </span>
                </button>
              );
            })
          : activeLesson.listaVocabulario.map((word, i) => {
              const isVisto = vistosVocabulario.includes(word);
              return (
                <button key={word} onClick={() => {
                  speakWord(word);
                  if (!vistosVocabulario.includes(word)) {
                    setVistosVocabulario([...vistosVocabulario, word]);
                  }
                }}
                  className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-colors duration-200 shadow-sm active:scale-95 cursor-pointer text-center w-full group ${
                    isVisto ? "bg-emerald-50/50 border-emerald-300 hover:border-emerald-500" : "bg-white border-slate-200 hover:border-[#1cb0f6] hover:shadow"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                    isVisto ? "bg-emerald-100 text-emerald-600 group-hover:bg-emerald-200" : "bg-sky-50 text-sky-600 group-hover:bg-sky-100"
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
            })}
      </div>

      <div className="bg-sky-50 border border-sky-100 rounded-lg p-2.5 max-w-sm mx-auto text-[11px] text-sky-700 font-extrabold flex items-center justify-center gap-1.5 shadow-sm">
        <Sparkles className="w-4 h-4 text-sky-600 shrink-0" />
        <span>¡La pronunciación de audio nativo se activa al tocar cada elemento!</span>
      </div>
    </div>
  );
}
