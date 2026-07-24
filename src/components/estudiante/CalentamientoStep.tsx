import { speakWord } from "../../utils/tts";
import { useAppContext } from "../../context/AppContext";

export default function CalentamientoStep({ subIndex }: { subIndex: number }) {
  const {
    activeLesson,
    keyboardMode, setKeyboardMode,
    userTypedTranslation, setUserTypedTranslation,
    selectedBubbles, setSelectedBubbles,
    scrambleBubbles, setScrambleBubbles,
  } = useAppContext();

  if (!activeLesson) return null;

  const warmupObj = activeLesson.calentamiento[subIndex];

  const initializeBubbles = (sentence: string) => {
    const mainWords = sentence.split(/\s+/).map((w) => w.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, ""));
    const distractors = ["the", "at", "with", "coding", "everyday", "park", "always", "English"];
    const filteredDistractors = distractors.filter(
      (d) => !mainWords.map((w) => w.toLowerCase()).includes(d.toLowerCase())
    );
    const chosenDistractors = filteredDistractors.sort(() => 0.5 - Math.random()).slice(0, 2);
    const finalSelection = [...mainWords, ...chosenDistractors].sort(() => 0.5 - Math.random());
    setScrambleBubbles(finalSelection);
    setSelectedBubbles([]);
  };

  return (
    <div className="space-y-4 w-full">
      <div className="text-center space-y-1">
        <span className="text-xs md:text-sm font-extrabold uppercase text-[#1cb0f6] tracking-widest bg-sky-50 px-3 py-1 rounded">
          CONSTRUCCIÓN DE ORACIONES ({subIndex + 1}/{activeLesson.calentamiento.length})
        </span>
        <h4 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
          Construye la Frase
        </h4>
      </div>

      <div className="duo-card p-4 bg-[#1cb0f6]/10 border-b-4 border-[#1cb0f6]/20 rounded-xl max-w-2xl w-full mx-auto flex items-center gap-3">
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow text-lg shrink-0">🗣️</div>
        <div className="text-left flex-1">
          <span className="text-[9px] uppercase font-extrabold text-sky-600 tracking-widest block mb-0.5">
            Traduce esta frase al inglés:
          </span>
          <p className="text-lg font-black text-slate-800 leading-tight">{warmupObj.fraseMetaEs}</p>
        </div>
      </div>

      <div className="flex justify-center">
        <div className="bg-slate-100 rounded-xl p-1 inline-flex items-center gap-1.5 border border-slate-200">
          <button onClick={() => { setKeyboardMode(false); initializeBubbles(warmupObj.fraseMetaEn); }}
            className={`py-1.5 px-4 text-xs font-black rounded-lg transition-all cursor-pointer ${
              !keyboardMode ? "bg-white text-[#1cb0f6] shadow" : "text-slate-650 hover:text-slate-850"
            }`}
          >
            Modo Burbujas
          </button>
          <button onClick={() => setKeyboardMode(true)}
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
          <textarea value={userTypedTranslation}
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
                  <button key={bIdx} onClick={() => {
                    setSelectedBubbles(selectedBubbles.filter((_, i) => i !== bIdx));
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
                <button key={bIdx} onClick={() => {
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
