import { useState, useEffect } from "react";
import { fetchAllCalificaciones } from "../../lib/supabase-service";
import type { Calificacion } from "../../types";

export default function MonitoringPanel() {
  const [calificaciones, setCalificaciones] = useState<Calificacion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllCalificaciones()
      .then(setCalificaciones)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white rounded-[18px] p-5 md:p-6 w-full shadow-sm">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <span className="text-[22px] text-amber-500">🏅</span>
          <h3 className="text-lg font-extrabold text-[#1a1a2e]">
            Historial de Notas (Monitoreo)
          </h3>
        </div>
      </div>

      {/* ── Entries ── */}
      {loading ? (
        <div className="text-center py-10 text-slate-400 text-sm font-bold">
          Cargando...
        </div>
      ) : calificaciones.length === 0 ? (
        <div className="text-center py-10 text-slate-400 text-sm font-bold">
          No hay calificaciones registradas aún.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {calificaciones.map((cal) => {
            const aprobado = cal.nota >= 11;
            return (
              <div
                key={cal.id}
                className="bg-[#f8fafc] border border-[#e8ecf2] rounded-xl p-3.5 md:p-4 flex items-center justify-between gap-4"
              >
                {/* Info */}
                <div className="flex flex-col gap-0.5 min-w-0">
                  <div className="flex items-center gap-2 text-xs text-[#94a3b8]">
                    <span className="font-semibold text-[#64748b]">
                      {cal.estudiante}
                    </span>
                    {cal.fecha && (
                      <>
                        <span className="hidden sm:inline">·</span>
                        <span className="hidden sm:inline">{cal.fecha}</span>
                      </>
                    )}
                  </div>
                  <div className="text-sm font-semibold text-[#1e293b] truncate">
                    {cal.leccionTitulo}
                  </div>
                  <div className="text-xs text-[#94a3b8]">
                    Aciertos: {cal.aciertos} de {cal.totalPreguntas} preguntas
                  </div>
                </div>

                {/* Nota circular */}
                <div
                  className={`shrink-0 w-14 h-14 rounded-full flex items-center justify-center text-lg font-black tracking-tight ${
                    aprobado
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {cal.nota}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
