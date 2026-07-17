import { LogOut, AlertCircle, Check, GraduationCap, Award } from "lucide-react";
import type { Leccion, Calificacion } from "../types";
import type { WalkthroughScreen } from "../constants";
import { VIEWS } from "../constants";
import { useAppContext } from "../context/AppContext";

interface Props {
  onLogout: () => void;
}

export default function EstudianteHomeView({ onLogout }: Props) {
  const {
    currentUser,
    lessons,
    calificaciones,
    setActiveLesson,
    setFlatScreens,
    setFlatScreenIndex,
    setVistosVocabulario,
    setExamCorrectCount,
    setFeedbackState,
    setFeedbackMessage,
    setCorrectAnswerReveal,
    setUserTypedTranslation,
    setSelectedBubbles,
    setVoiceSimilarity,
    setVoiceTranscript,
    setSelectedExamOptionIndex,
    setGainedGrade,
    setWalkthroughActive,
    setCurrentView,
    setActiveHoverGrammarWord,
  } = useAppContext();

  const launchActiveLesson = (leccion: Leccion) => {
    setActiveLesson(leccion);

    const screens: WalkthroughScreen[] = [];
    screens.push({ type: "vocabulario" });
    screens.push({ type: "gramatica" });

    for (let i = 0; i < leccion.calentamiento.length; i++) {
      screens.push({ type: "calentamiento", subIndex: i });
    }

    const targetPhrases =
      leccion.frasesPronunciacion && leccion.frasesPronunciacion.length > 0
        ? leccion.frasesPronunciacion
        : [leccion.calentamiento[0]?.fraseMetaEn || "English is practical and beautiful"];

    for (let i = 0; i < targetPhrases.length; i++) {
      screens.push({ type: "pronunciacion", subIndex: i });
    }

    for (let i = 0; i < leccion.evaluacion.length; i++) {
      screens.push({ type: "evaluacion", subIndex: i });
    }

    setFlatScreens(screens);
    setFlatScreenIndex(0);
    resetWalkthroughState({
      setVistosVocabulario,
      setExamCorrectCount,
      setFeedbackState,
      setFeedbackMessage,
      setCorrectAnswerReveal,
      setUserTypedTranslation,
      setSelectedBubbles,
      setVoiceSimilarity,
      setVoiceTranscript,
      setSelectedExamOptionIndex,
      setGainedGrade,
    });
    setWalkthroughActive(true);
    setCurrentView(VIEWS.ESTUDIANTE_LECCION);

    if (leccion.formulaGramatica) {
      setActiveHoverGrammarWord(0);
    }
  };

  function resetWalkthroughState(s: ResetWalkthroughParams) {
    s.setVistosVocabulario([]);
    s.setExamCorrectCount(0);
    s.setFeedbackState("idle");
    s.setFeedbackMessage("");
    s.setCorrectAnswerReveal("");
    s.setUserTypedTranslation("");
    s.setSelectedBubbles([]);
    s.setVoiceSimilarity(null);
    s.setVoiceTranscript("");
    s.setSelectedExamOptionIndex(null);
    s.setGainedGrade(null);
  }

  type ResetWalkthroughParams = {
    setVistosVocabulario: (v: string[]) => void;
    setExamCorrectCount: (n: number | ((prev: number) => number)) => void;
    setFeedbackState: (f: "idle" | "correct" | "incorrect") => void;
    setFeedbackMessage: (s: string) => void;
    setCorrectAnswerReveal: (s: string) => void;
    setUserTypedTranslation: (s: string) => void;
    setSelectedBubbles: (s: string[]) => void;
    setVoiceSimilarity: (n: number | null) => void;
    setVoiceTranscript: (s: string) => void;
    setSelectedExamOptionIndex: (n: number | null) => void;
    setGainedGrade: (n: number | null) => void;
  };

  return (
    <div className="flex-1 flex flex-col bg-[#f7f7f7]">

      <header className="bg-white border-b-2 border-slate-200 py-4 px-6 flex justify-between items-center sm:px-12">
        <div className="flex items-center gap-3">
          <span className="text-2xl">⚡</span>
          <div>
            <h3 className="text-xl font-bold text-slate-800">
              Hi, <span className="text-[#58cc02]">{currentUser}</span>
            </h3>
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">
              ESTUDIANTE DE MANUEL VIVANCO ALTAMIRANO
            </p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="py-2.5 px-4 rounded-xl text-sm font-extrabold flex items-center gap-2 text-slate-500 hover:text-slate-800 border-2 border-slate-200 hover:bg-slate-50 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" /> Cerrar Sesión
        </button>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-8 flex flex-col justify-start space-y-8">

        <div className="bg-gradient-to-r from-[#1cb0f6] to-[#1489da] text-white p-6 md:p-8 rounded-3xl shadow-md flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-2 text-center md:text-left relative z-10">
            <span className="bg-yellow-400 text-slate-900 text-[10px] font-black uppercase px-2.5 py-1 rounded-full">
              IDIOMA-INGLES
            </span>
            <h4 className="text-3xl font-black">Aprende Hablando e Interactuando</h4>
            <p className="text-white/80 font-semibold text-sm max-w-lg">
              Estudia la teoría visual, traduce oraciones usando bloques y habla en inglés directo a tu micrófono para que el software autocalifique.
            </p>
          </div>
          <GraduationCap className="w-24 h-24 text-white/20 shrink-0 select-none absolute right-4 bottom-0 mr-4" />
        </div>

        <div>
          <h5 className="text-xs uppercase font-extrabold tracking-widest text-slate-400 mb-3">
            Tu Tarea Activa de Hoy
          </h5>

          {(() => {
            const active = lessons.find(l => l.estado === "activa");
            if (!active) {
              return (
                <div className="duo-card p-8 text-center bg-white border-2 border-slate-200">
                  <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
                  <h4 className="text-xl font-bold text-slate-700">No hay lecciones asignadas</h4>
                  <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
                    Actualmente el docente Farfán Inca Roca no ha habilitado ninguna lección de manera activa en el panel del administrador.
                  </p>
                </div>
              );
            }

            const studentGrade = calificaciones.find(
              c => c.estudiante === currentUser && c.leccionId === active.id
            );
            const hasCompleted = !!studentGrade && studentGrade.nota >= 15;

            return (
              <div className="duo-card p-6 md:p-8 bg-white border-b-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 hover:shadow-lg transition-all">
                <div className="space-y-4 flex-1 text-left">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-[#58cc02] text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded">
                      LECCIÓN ACTIVA
                    </span>
                    {hasCompleted && (
                      <span className="bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 stroke-[3px]" /> COMPLETADO (Nota {studentGrade.nota})
                      </span>
                    )}
                    <span className="text-xs text-slate-400 font-bold">
                      🔥 {active.calentamiento.length} Desafíos
                    </span>
                    <span className="text-xs text-slate-400 font-bold">•</span>
                    <span className="text-xs text-slate-400 font-bold">
                      📖 {active.evaluacion.length} Preguntas
                    </span>
                  </div>

                  <h4 className="text-2xl md:text-3xl font-black text-slate-800">{active.titulo}</h4>

                  <div className="flex gap-4 items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100 max-w-md">
                    <div className="text-xs font-black text-slate-400 uppercase tracking-widest text-[#1cb0f6]">
                      Teoría Gramatical
                    </div>
                    <p className="font-mono text-xs text-slate-600 font-extrabold truncate">
                      {active.formulaGramatica}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 flex items-center justify-center">
                  <button
                    onClick={() => launchActiveLesson(active)}
                    className={`py-5 px-10 text-xl font-black uppercase tracking-wider rounded-2xl w-full md:w-auto cursor-pointer ${
                      hasCompleted ? "btn-3d-blue" : "btn-3d-green"
                    }`}
                  >
                    {hasCompleted ? "REPETIR LECCIÓN" : "EMPEZAR LECCIÓN"}
                  </button>
                </div>
              </div>
            );
          })()}
        </div>

        <div>
          <h5 className="text-xs uppercase font-extrabold tracking-widest text-slate-400 mb-3">
            Tu Progreso Académico de Calificaciones
          </h5>

          <div className="bg-white duo-card p-6 shadow-sm">

            {calificaciones.filter(c => c.estudiante === currentUser).length === 0 ? (
              <div className="text-center py-6 text-slate-400">
                <Award className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold">Aún no has completado evaluaciones de examen.</p>
                <p className="text-[10px] mt-0.5">Las calificaciones de tus exámenes resueltos aparecerán aquí.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-wrap gap-4 items-center">
                  {calificaciones
                    .filter(c => c.estudiante === currentUser)
                    .map((cal, i) => {
                      const isApproved = cal.nota >= 11;
                      return (
                        <div
                          key={cal.id}
                          className={`w-14 h-14 rounded-full flex flex-col items-center justify-center border-b-4 transition-transform hover:scale-105 select-all ${
                            isApproved
                              ? "bg-emerald-100 border-emerald-500 text-emerald-800"
                              : "bg-red-100 border-red-500 text-red-800"
                          }`}
                          title={`${cal.leccionTitulo} - Grade: ${cal.nota}`}
                        >
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-tighter block leading-none">
                            Nº {i + 1}
                          </span>
                          <span className="text-base font-black leading-none mt-1">
                            {cal.nota}
                          </span>
                        </div>
                      );
                    })}
                </div>

                <div className="border-t border-slate-100 pt-4 space-y-2">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Historial Detallado</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {calificaciones
                      .filter(c => c.estudiante === currentUser)
                      .map((cal) => (
                        <div key={cal.id} className="p-3 border border-slate-100 rounded-xl bg-slate-50 flex items-center justify-between text-xs">
                          <div className="min-w-0 pr-2">
                            <p className="font-extrabold text-slate-700 truncate">{cal.leccionTitulo}</p>
                            <p className="text-[10px] text-slate-400">{cal.fecha}</p>
                          </div>
                          <span className={`font-black uppercase px-2 py-0.5 rounded text-[10px] ${
                            cal.nota >= 11 ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                          }`}>
                            Nota {cal.nota}
                          </span>
                        </div>
                      ))}
                  </div>

                </div>
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
