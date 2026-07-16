import type { ReactNode } from "react";

type BadgeColor = "emerald" | "sky" | "slate" | "amber" | "red";

interface Props {
  children: ReactNode;
  color?: BadgeColor;
}

const colorMap: Record<BadgeColor, string> = {
  emerald: "bg-emerald-100 text-emerald-800",
  sky: "bg-sky-50 text-[#1cb0f6]",
  slate: "bg-slate-100 text-slate-500",
  amber: "bg-amber-50 text-amber-700",
  red: "bg-red-100 text-red-800",
};

export default function Badge({ children, color = "sky" }: Props) {
  return (
    <span
      className={`text-[10px] md:text-xs font-black uppercase px-2 py-0.5 rounded-lg ${colorMap[color]}`}
    >
      {children}
    </span>
  );
}
