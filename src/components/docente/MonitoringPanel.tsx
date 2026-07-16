import { Users, ChevronUp, ChevronDown } from "lucide-react";
import { useAppContext } from "../../context/AppContext";

export default function MonitoringPanel() {
  const { lessons, calificaciones, expandedStudents, setExpandedStudents } = useAppContext();

  const totalAlumnos = ["hitsuko.student", "mario.quispe", "ana.huaman", "elena.condori", "juan.sanchez"];

  return (
    <div className="bg-white border-2 border-slate-200 p-6 rounded-3xl shadow-sm space-y-4">
      <div className="flex flex-col gap-1 pb-3 border-b-2 border-slate-150">
        <span className="font-extrabold text-sm md:text-base text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
          <Users className="w-5 h-5 text-sky-500" />
          Monitoreo de Alumnos
        </span>
        <p className="text-xs md:text-sm text-slate-500 font-semibold leading-relaxed">
          Haz clic en un estudiante para ver de manera detallada su progreso y sus calificaciones obtenidas.
        </p>
      </div>

      <div className="space-y-3.5">
        {totalAlumnos.map((alumno) => {
          const isExpanded = !!expandedStudents[alumno];
          const studentGrades = calificaciones.filter(c => c.estudiante === alumno);
          const studentCompletedCount = studentGrades.length;
          const studentValidGrades = studentGrades.map(c => c.nota).filter(n => !isNaN(n));
          const studentAvg = studentValidGrades.length > 0
            ? (studentValidGrades.reduce((sum, val) => sum + val, 0) / studentValidGrades.length).toFixed(1)
            : null;

          let overallStanding = "Pendiente ⏳";
          let overallColor = "bg-slate-50 text-slate-600 border-slate-200";
          if (studentAvg !== null) {
            const avg = parseFloat(studentAvg);
            if (avg >= 17) { overallStanding = "Dominado 🏆"; overallColor = "bg-emerald-50 text-emerald-700 border-emerald-150"; }
            else if (avg >= 11) { overallStanding = "Aprobado ✅"; overallColor = "bg-sky-50 text-sky-700 border-sky-150"; }
            else { overallStanding = "En Proceso ⚠️"; overallColor = "bg-amber-50 text-amber-700 border-amber-150"; }
          }

          return (
            <div key={alumno} className="border-2 border-slate-200 rounded-2xl overflow-hidden bg-slate-50/20">
              <button type="button" onClick={() => setExpandedStudents(prev => ({ ...prev, [alumno]: !prev[alumno] }))}
                className="w-full text-left p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors bg-white cursor-pointer"
              >
                <span className="font-extrabold text-sm md:text-base text-sky-600 flex items-center gap-1.5">
                  👤 {alumno}
                </span>
                <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm font-bold shrink-0">
                  <span className="text-xs md:text-sm text-slate-500 font-semibold">
                    Progreso: <b className="text-slate-800 font-extrabold">{studentCompletedCount} / {lessons.length}</b>
                  </span>
                  <span className="text-xs md:text-sm text-slate-500 font-semibold">
                    Promedio: <b className="text-slate-800 font-extrabold">{studentAvg !== null ? `${studentAvg}` : "--"}</b>
                  </span>
                  <span className={`px-2.5 py-1 rounded inline-block border text-xs font-bold text-center ${overallColor}`}>
                    {overallStanding}
                  </span>
                  {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400 shrink-0" /> : <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />}
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 py-3 bg-white space-y-2 border-t-2 border-slate-100 text-xs md:text-sm">
                  {lessons.length === 0 ? (
                    <p className="text-slate-400 text-center py-2">No hay lecciones registradas.</p>
                  ) : (
                    <div className="divide-y divide-slate-100 font-bold">
                      {lessons.map((les) => {
                        const gradObj = calificaciones.find(c => c.estudiante === alumno && c.leccionId === les.id);
                        return (
                          <div key={les.id} className="py-2.5 flex items-center justify-between text-slate-600 first:pt-0 last:pb-0 gap-3">
                            <span className="text-sm font-bold text-slate-700 truncate max-w-sm" title={les.titulo}>
                              📖 {les.titulo}
                            </span>
                            <div className="shrink-0 text-right">
                              {gradObj ? (
                                <span className="text-slate-850 font-extrabold text-xs md:text-sm flex items-center gap-1.5">
                                  Completado — <b className="text-[#58cc02] font-black">Nota: {gradObj.nota.toString().padStart(2, "0")}/20</b>
                                  {" "}({gradObj.nota >= 17 ? "Dominado 🏆" : gradObj.nota >= 11 ? "Aprobado ✅" : "En Proceso ⚠️"})
                                </span>
                              ) : (
                                <span className="text-slate-400 font-semibold italic">Pendiente</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
