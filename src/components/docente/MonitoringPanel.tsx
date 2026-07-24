import { useAppContext } from "../../context/AppContext";

export default function MonitoringPanel() {
  const { calificaciones } = useAppContext();

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
        <span className="text-[20px] text-emerald-500 cursor-pointer">↗</span>
      </div>

      {/* ── Entries ── */}
      {calificaciones.length === 0 ? (
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

                {/* Score badge */}
                <div className="flex flex-col items-center gap-1 min-w-[64px] shrink-0">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-extrabold ${
                      aprobado
                        ? "bg-[#dcfce7] text-[#16a34a]"
                        : "bg-[#ffe4e6] text-[#e11d48]"
                    }`}
                  >
                    {cal.nota}
                  </div>
                  <span
                    className={`text-[10px] font-extrabold tracking-wider uppercase ${
                      aprobado ? "text-[#16a34a]" : "text-[#e11d48]"
                    }`}
                  >
                    {aprobado ? "APROBADO" : "DESAPROBADO"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
