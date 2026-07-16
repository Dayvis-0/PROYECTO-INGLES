import { speakWord } from "../../utils/tts";
import { getInteractiveGrammarSegments } from "../../utils/grammar";
import { useAppContext } from "../../context/AppContext";

export default function GramaticaStep() {
  const { activeLesson, activeHoverGrammarWord, setActiveHoverGrammarWord } = useAppContext();
  if (!activeLesson) return null;

  const segments = getInteractiveGrammarSegments(activeLesson);

  const getSimpleRoleLabel = (role: string) => {
    const lower = role.toLowerCase();
    if (lower.includes("subject") || lower.includes("sujeto")) return "Sujeto / Subject 👤";
    if (lower.includes("verb") || lower.includes("verbo")) return "Verbo / Verb ⚡";
    if (lower.includes("complement") || lower.includes("complemento")) return "Complemento / Complement 📌";
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
                <span key={sIdx}
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
                  onClick={() => { setActiveHoverGrammarWord(sIdx); speakWord(seg.word); }}
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
