import { LogOut, GraduationCap } from "lucide-react";

interface Props {
  title: string;
  subtitle?: string;
  onLogout?: () => void;
  icon?: "teacher" | "student";
}

export default function HeaderBar({ title, subtitle, onLogout, icon = "teacher" }: Props) {
  return (
    <header className="bg-white border-b-2 border-slate-200 py-4 px-6 md:px-10 shadow-xs">
      <div className="max-w-[1600px] w-full mx-auto flex justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          {icon === "teacher" && (
            <div className="bg-sky-100 p-3 rounded-2xl text-sky-600 shadow-sm shrink-0">
              <GraduationCap className="w-7 h-7" />
            </div>
          )}
          <div>
            <h3 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">{title}</h3>
            {subtitle && (
              <p className="text-sm md:text-base font-semibold text-slate-500">{subtitle}</p>
            )}
          </div>
        </div>

        {onLogout && (
          <button
            onClick={onLogout}
            className="py-3 px-5 rounded-2xl text-base font-black flex items-center gap-2 text-rose-600 hover:bg-rose-50 border-2 border-rose-100 hover:border-rose-200 transition-all cursor-pointer shadow-xs"
          >
            <LogOut className="w-5 h-5" /> Cerrar Sesión
          </button>
        )}
      </div>
    </header>
  );
}
