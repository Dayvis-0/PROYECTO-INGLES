import { type ReactNode } from "react";
import { AlertTriangle, X } from "lucide-react";

interface ModalConfirmProps {
  isOpen: boolean;
  title?: string;
  message: ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: "danger" | "warning" | "info";
}

/**
 * ModalConfirm — replaces browser `confirm()` with a styled React modal.
 * Uses a dark backdrop overlay and centered card with confirm/cancel buttons.
 */
export default function ModalConfirm({
  isOpen,
  title = "Confirmar",
  message,
  confirmText = "Sí, continuar",
  cancelText = "Cancelar",
  onConfirm,
  onCancel,
  variant = "danger",
}: ModalConfirmProps) {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      icon: "text-rose-500 bg-rose-50 border-rose-100",
      btn: "bg-rose-500 hover:bg-rose-600 border-b-4 border-rose-700 text-white",
    },
    warning: {
      icon: "text-amber-500 bg-amber-50 border-amber-100",
      btn: "bg-amber-500 hover:bg-amber-600 border-b-4 border-amber-700 text-white",
    },
    info: {
      icon: "text-sky-500 bg-sky-50 border-sky-100",
      btn: "bg-sky-500 hover:bg-sky-600 border-b-4 border-sky-700 text-white",
    },
  };

  const colors = variantStyles[variant];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 p-6 md:p-8 border-2 border-slate-200 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 ${colors.icon}`}
          >
            <AlertTriangle className="w-6 h-6" />
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <h3 className="text-xl font-black text-slate-800 mb-2">{title}</h3>
        <p className="text-sm md:text-base text-slate-600 font-semibold leading-relaxed mb-6">
          {message}
        </p>

        <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end">
          <button
            onClick={onCancel}
            className="py-3 px-6 rounded-xl text-sm font-black border-2 border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer active:scale-95"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`py-3 px-6 rounded-xl text-sm font-black tracking-wide transition-all cursor-pointer active:scale-95 shadow-sm ${colors.btn}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
