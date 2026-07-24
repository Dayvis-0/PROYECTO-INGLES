import { useState } from "react";
import { BookOpen, AlertCircle, Edit3, Trash2 } from "lucide-react";
import type { Leccion, EjercicioCalentamiento, PreguntaEvaluacion, VocabularioItem, GramaticaColumna } from "../../types";
import { PRESENT_SIMPLE_SVG, PRESENT_CONTINUOUS_SVG, DEFAULT_GRAMATICA_COLUMNAS, DEFAULT_GRAMATICA_TITULO, DEFAULT_GRAMATICA_DESC, saveStoredLessons } from "../../data";
import { useAppContext } from "../../context/AppContext";
import { ModalConfirm } from "../ui";

export default function LessonList() {
  const {
    lessons,
    setLessons,
    calificaciones,
    setEditingLessonId,
    setFormTitulo,
    setFormImagenGramatica,
    setFormFormulaGramatica,
    setFormFrasesPronunciacion,
    setFormCalentamiento,
    setFormEvaluacion,
    setFormEjemploOracion,
    setFormEjemploRoles,
    setFormVocabularioDetallado,
    setFormGramaticaColumnas,
    setFormGramaticaTitulo,
    setFormGramaticaDesc,
    setTeacherFormError,
  } = useAppContext();

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const { handleEditLesson, handleDeleteLesson, handleToggleLesson } = useLessonHandlers(
    lessons, setLessons,
    setEditingLessonId,
    setFormTitulo, setFormImagenGramatica, setFormFormulaGramatica,
    setFormFrasesPronunciacion, setFormCalentamiento, setFormEvaluacion,
    setFormEjemploOracion, setFormEjemploRoles, setFormVocabularioDetallado,
    setFormGramaticaColumnas,
    setFormGramaticaTitulo,
    setFormGramaticaDesc,
    setTeacherFormError,
  );

  const confirmDelete = () => {
    if (deleteTargetId) {
      handleDeleteLesson(deleteTargetId);
      setDeleteTargetId(null);
    }
  };

  return (
    <div className="bg-white rounded-[18px] p-5 md:p-6 w-full shadow-sm space-y-4">
      <div className="flex justify-between items-center pb-3 border-b-2 border-slate-100">
        <h4 className="text-base md:text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-sky-500" />
          Lecciones Disponibles
        </h4>
        <span className="text-xs md:text-sm bg-sky-50 text-[#1cb0f6] font-extrabold px-3 py-1 rounded-xl border border-sky-100">
          {lessons.length} temas
        </span>
      </div>

      <div className="space-y-3.5">
        {lessons.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <AlertCircle className="w-10 h-10 stroke-[1.5] mx-auto mb-2 text-slate-300" />
            <p className="font-bold text-sm">No hay lecciones en la base de datos.</p>
          </div>
        ) : (
          lessons.map((les) => {
            const isActive = les.estado === "activa";
            return (
              <div key={les.id}
                className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 ${
                  isActive
                    ? "bg-emerald-50/20 border-emerald-300 shadow-xs"
                    : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <button type="button" onClick={() => handleToggleLesson(les.id, les.estado)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isActive ? "bg-emerald-500" : "bg-slate-200"
                    }`}
                    title={isActive ? "Desactivar lección" : "Activar lección"}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      isActive ? "translate-x-5" : "translate-x-0"
                    }`} />
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h5 className="text-sm md:text-base font-black text-slate-800 truncate" title={les.titulo}>
                        {les.titulo}
                      </h5>
                      <span className={`text-[10px] md:text-xs font-black uppercase px-2 py-0.5 rounded-lg ${
                        isActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"
                      }`}>
                        {isActive ? "Activa" : "Inactiva"}
                      </span>
                    </div>
                    <p className="text-xs md:text-sm text-slate-500 font-medium truncate mt-1">
                      <b>Estructura:</b> {les.formulaGramatica}
                    </p>

                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button type="button" onClick={() => handleEditLesson(les)}
                    className="text-sky-500 hover:text-sky-700 bg-sky-50 hover:bg-sky-100 p-2.5 rounded-xl border border-sky-100 transition-colors cursor-pointer"
                    title="Editar Lección"
                  >
                    <Edit3 className="w-5 h-5" />
                  </button>
                  <button type="button" onClick={() => setDeleteTargetId(les.id)}
                    className="text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 p-2.5 rounded-xl border border-rose-100 transition-colors cursor-pointer"
                    title="Eliminar Lección"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <ModalConfirm
        isOpen={deleteTargetId !== null}
        title="Eliminar lección"
        message="¿Estás seguro que deseas eliminar este tema por completo? Esta acción no se puede deshacer."
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
}

// ── Hook de handlers ───────────────────────────────────────────

function useLessonHandlers(
  lessons: Leccion[],
  setLessons: (l: Leccion[]) => void,
  setEditingLessonId: (id: string | null) => void,
  setFormTitulo: (v: string) => void,
  setFormImagenGramatica: (v: string) => void,
  setFormFormulaGramatica: (v: string) => void,
  setFormFrasesPronunciacion: (v: string[]) => void,
  setFormCalentamiento: (v: EjercicioCalentamiento[]) => void,
  setFormEvaluacion: (v: PreguntaEvaluacion[]) => void,
  setFormEjemploOracion: (v: string) => void,
  setFormEjemploRoles: (v: string[]) => void,
  setFormVocabularioDetallado: (v: VocabularioItem[]) => void,
  setFormGramaticaColumnas: (v: GramaticaColumna[]) => void,
  setFormGramaticaTitulo: (v: string) => void,
  setFormGramaticaDesc: (v: string) => void,
  setTeacherFormError: (v: string | null) => void,
) {
  const handleEditLesson = (les: Leccion) => {
    setEditingLessonId(les.id);
    setFormTitulo(les.titulo);

    if (les.imagenGramatica === PRESENT_SIMPLE_SVG) {
      setFormImagenGramatica("present_simple.png");
    } else if (les.imagenGramatica === PRESENT_CONTINUOUS_SVG) {
      setFormImagenGramatica("present_continuous.png");
    } else {
      setFormImagenGramatica(les.imagenGramatica);
    }

    setFormFormulaGramatica(les.formulaGramatica);
    setFormFrasesPronunciacion(
      les.frasesPronunciacion && les.frasesPronunciacion.length > 0 ? [...les.frasesPronunciacion] : [""]
    );
    setFormCalentamiento(les.calentamiento.map(item => ({ ...item })));
    setFormEvaluacion(
      les.evaluacion.map(evalu => ({
        pregunta: evalu.pregunta,
        opciones: evalu.opciones.map(opt => ({ ...opt })),
      }))
    );
    setFormEjemploOracion(les.ejemploOracion || les.frasesPronunciacion?.[0] || "");
    setFormEjemploRoles(les.ejemploRoles ? [...les.ejemploRoles] : []);
    setFormGramaticaColumnas(les.gramaticaColumnas ? les.gramaticaColumnas.map(c => ({ ...c })) : DEFAULT_GRAMATICA_COLUMNAS.map(c => ({ ...c })));
    setFormGramaticaTitulo(les.gramaticaTitulo || DEFAULT_GRAMATICA_TITULO);
    setFormGramaticaDesc(les.gramaticaDesc || DEFAULT_GRAMATICA_DESC);
    setFormVocabularioDetallado(
      les.vocabularioDetallado && les.vocabularioDetallado.length > 0
        ? les.vocabularioDetallado.map(item => ({ ...item }))
        : les.listaVocabulario.map(w => ({ ingles: w, espanol: "", categoria: "General" }))
    );
    setTeacherFormError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteLesson = (id: string) => {
    const filtered = lessons.filter(l => l.id !== id);
    const isDeletingActive = lessons.find(l => l.id === id)?.estado === "activa";
    if (isDeletingActive && filtered.length > 0) {
      filtered[0].estado = "activa";
    }
    setLessons(filtered);
    saveStoredLessons(filtered);
  };

  const handleToggleLesson = (id: string, currentStatus: "activa" | "inactiva") => {
    const updated = lessons.map(l => {
      if (l.id === id) {
        return { ...l, estado: (currentStatus === "activa" ? "inactiva" : "activa") as "activa" | "inactiva" };
      }
      if (currentStatus === "inactiva") {
        return { ...l, estado: "inactiva" as const };
      }
      return l;
    });
    setLessons(updated);
    saveStoredLessons(updated);
  };

  return { handleEditLesson, handleDeleteLesson, handleToggleLesson };
}
