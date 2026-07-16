interface Props {
  state: "idle" | "correct" | "incorrect";
  message: string;
  correctAnswerReveal?: string;
  onContinue?: () => void;
}

export default function FeedbackBanner({
  state,
  message,
  correctAnswerReveal,
  onContinue,
}: Props) {
  if (state === "idle") return null;

  const isCorrect = state === "correct";

  return (
    <div
      className={`w-full max-w-2xl mx-auto rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 transition-all duration-200 border-2 ${
        isCorrect
          ? "bg-[#d7ffb7] border-[#58cc02] text-[#58cc02]"
          : "bg-[#ffdfe0] border-[#ff4b4b] text-[#ea2b2b]"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm font-black text-xl bg-white ${
            isCorrect ? "text-emerald-500" : "text-rose-500"
          }`}
        >
          {isCorrect ? "✓" : "✗"}
        </div>
        <div className="text-left">
          <h5 className="font-extrabold text-sm uppercase tracking-wide leading-none mb-0.5">
            {isCorrect ? "¡Excelente Trabajo!" : "Sigue Practicando"}
          </h5>
          <p className="text-slate-800 font-bold text-xs mt-0.5 leading-tight">{message}</p>
          {correctAnswerReveal && (
            <p className="text-slate-900 text-[10px] font-mono font-bold mt-1.5 py-0.5 px-1.5 bg-white/55 border border-white rounded inline-block">
              <b>Solución:</b> &ldquo;{correctAnswerReveal}&rdquo;
            </p>
          )}
        </div>
      </div>

      {onContinue && (
        <button
          onClick={onContinue}
          className={`py-2.5 px-6 text-xs font-black tracking-wider uppercase rounded-xl shrink-0 cursor-pointer active:scale-95 transition-transform ${
            isCorrect ? "btn-3d-green text-white" : "btn-3d-danger text-white"
          }`}
        >
          CONTINUAR PASO
        </button>
      )}
    </div>
  );
}
