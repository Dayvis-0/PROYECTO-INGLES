import type { ReactNode } from "react";

type ButtonColor = "green" | "blue" | "orange" | "danger" | "gray";

interface Props {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  color?: ButtonColor;
  disabled?: boolean;
  className?: string;
}

const colorMap: Record<ButtonColor, string> = {
  green: "btn-3d-green text-white",
  blue: "btn-3d-blue text-white",
  orange: "bg-orange-500 hover:bg-orange-600 border-b-4 border-orange-700 text-white",
  danger: "btn-3d-danger text-white",
  gray: "bg-slate-300 border-b-4 border-slate-400 text-slate-500 cursor-not-allowed opacity-75",
};

export default function Button3D({
  children,
  onClick,
  type = "button",
  color = "green",
  disabled = false,
  className = "",
}: Props) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`py-2.5 px-6 text-sm font-black tracking-wider uppercase rounded-xl cursor-pointer active:scale-95 transition-transform ${colorMap[color]} ${className}`}
    >
      {children}
    </button>
  );
}
