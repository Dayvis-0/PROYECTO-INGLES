import { speakWord } from "../../utils/tts";
import { playTone } from "../../utils/audio";
import { getInteractiveGrammarSegments } from "../../utils/grammar";
import { DEFAULT_GRAMATICA_COLUMNAS, DEFAULT_GRAMATICA_TITULO, DEFAULT_GRAMATICA_DESC } from "../../data";
import { useAppContext } from "../../context/AppContext";

export default function GramaticaStep() {
  const { activeLesson, activeHoverGrammarWord, setActiveHoverGrammarWord } =
    useAppContext();
  if (!activeLesson) return null;

  const segments = getInteractiveGrammarSegments(activeLesson);

  // ── helpers ──────────────────────────────────────────────

  const grammarTitle = activeLesson.gramaticaTitulo || DEFAULT_GRAMATICA_TITULO;
  const grammarDesc = activeLesson.gramaticaDesc || DEFAULT_GRAMATICA_DESC;

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-md mx-auto">
      {/* ── Step eyebrow + title block ── */}
      <div className="text-center space-y-3">
        <span className="text-[11px] font-black uppercase tracking-[0.12em] text-[#7ab8d6] block">
          PASO 2 DE 5: TEORÍA Y FÓRMULA INTEGRADA
        </span>
        <div>
          <h1 className="text-[32px] font-semibold text-[#1a1a2e] leading-tight">
            Visualiza la Estructura Formal
          </h1>
          <p className="text-sm text-[#888] mt-1.5">
            Asocia la imagen teórica con la fórmula estructurada a continuación.
          </p>
        </div>
      </div>

      {/* ── Grammar Card (blue gradient) ── */}
      <div
        className="w-full max-w-[420px] rounded-[18px] p-6 text-white"
        style={{
          background: "linear-gradient(135deg, #1a8fe3 0%, #0d6bbf 60%, #0a55a0 100%)",
          boxShadow: "0 8px 32px rgba(13, 107, 191, 0.28)",
        }}
      >
        <div className="text-lg font-extrabold tracking-wide">
          Grammar Guide: {grammarTitle}
        </div>
        <div className="text-xs text-white/75 mb-5">{grammarDesc}</div>

        {/* Three columns — dynamic from lesson data */}
        <div className="grid grid-cols-3 gap-2.5">
          {(activeLesson.gramaticaColumnas || DEFAULT_GRAMATICA_COLUMNAS).map((col, i) => (
            <div key={i}
              className={`${
                i === 2
                  ? "bg-white/12 rounded-[10px] px-2.5 py-3.5 text-center flex flex-col items-center justify-center gap-2"
                  : "bg-white/12 rounded-[10px] px-2.5 py-3.5 text-center"
              }`}
            >
              <div className="text-[11px] text-white/70 leading-tight mb-2.5">{col.titulo}</div>

              {i === 2 ? (
                <div className="bg-[#0d5fa0] border border-white/30 rounded-md px-2.5 py-1.5 text-[11px] font-bold text-[#ffe44d] tracking-wide text-center leading-tight">
                  {col.verbo}
                </div>
              ) : (
                <div className={`text-[22px] font-extrabold tracking-wide ${i === 0 ? "text-[#4dff6e]" : "text-[#ffe44d]"}`}>
                  {col.verbo}
                </div>
              )}

              <div className={`text-[10px] text-white/65 ${i === 2 ? "" : "mt-1.5"} leading-relaxed whitespace-pre-line`}>{col.nota}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Formula section (dark box, cyan border) ── */}
      <div className="w-full max-w-[420px]">
        <div className="text-[10px] font-black uppercase tracking-[0.1em] text-[#aab8c8] text-center mb-2.5 select-none">
          FÓRMULA GRAMATICAL ESTRUCTURADA (RELACIÓN VISUAL)
        </div>
        <div
          className="bg-[#0e1726] border-2 border-[#22d3ee] rounded-xl px-7 py-5 text-center"
          onClick={() => {
            playTone(523.25, 0.04, 0.3);
          }}
        >
          <div className="text-[22px] font-bold text-[#22d3ee] leading-relaxed tracking-wide">
            {activeLesson.formulaGramatica}
          </div>
        </div>
      </div>

      {/* ── Interactive segments (enhancement) ── */}
      {segments.length > 0 && (
        <div className="w-full max-w-[420px] bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <span className="block text-[9px] uppercase font-black tracking-widest text-[#1cb0f6] text-center select-none">
            EJEMPLO PRÁCTICO INTERACTIVO
          </span>

          <div className="flex justify-center flex-wrap items-center gap-x-2 gap-y-1 text-xl md:text-2xl font-black text-slate-800 leading-relaxed select-none">
            {segments.map((seg, sIdx) => {
              const isActive = activeHoverGrammarWord === sIdx;
              return (
                <span
                  key={sIdx}
                  onMouseEnter={() => {
                    setActiveHoverGrammarWord(sIdx);
                    playTone(420 + sIdx * 35, 0.012, 0.05);
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

          <div className="h-8 flex items-center justify-center border-t border-slate-100 pt-3">
            {activeHoverGrammarWord !== null && segments[activeHoverGrammarWord] ? (
              <span className="text-xs font-black uppercase tracking-wider text-[#1cb0f6] bg-sky-50/70 px-3 py-1 rounded-full border border-sky-100/60 animate-fade-in shadow-xs">
                {segments[activeHoverGrammarWord].role}
              </span>
            ) : (
              <span className="text-[10px] text-slate-400 font-bold">
                Pasa el cursor sobre las palabras para analizar
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
