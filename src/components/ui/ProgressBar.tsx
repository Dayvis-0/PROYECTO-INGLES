interface Props {
  current: number;
  total: number;
}

export default function ProgressBar({ current, total }: Props) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="flex-1 h-5 bg-[#e5e5e5] rounded-full overflow-hidden relative border border-slate-200">
      <div
        className="h-full bg-[#58cc02] rounded-full progress-bar-fill duration-300"
        style={{ width: `${pct}%` }}
      />
      <div className="absolute top-0.5 left-1 right-1 h-1 bg-white/20 rounded-full" />
    </div>
  );
}
