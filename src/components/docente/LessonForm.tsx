import { Plus, Trash2, AlertCircle, RotateCcw } from "lucide-react";
import type { EjercicioCalentamiento, PreguntaEvaluacion } from "../../types";
import { useAppContext } from "../../context/AppContext";
import { useTeacherForm } from "../../hooks/useTeacherForm";
import VocabTable from "./VocabTable";
import GrammarExampleSection from "./GrammarExampleSection";

export default function LessonForm() {
  const {
    formTitulo, setFormTitulo,
    formFormulaGramatica, setFormFormulaGramatica,
    formFrasesPronunciacion,
    formCalentamiento,
    formEvaluacion,
    editingLessonId,
    teacherFormError,
    formEjemploOracion, setFormEjemploOracion,
    formEjemploRoles, setFormEjemploRoles,
    formVocabularioDetallado, setFormVocabularioDetallado,
  } = useAppContext();

  const {
    handleAddWarmupRow,
    handleRemoveWarmupRow,
    handleWarmupRowChange,
    handleAddEvaluationRow,
    handleRemoveEvaluationRow,
    handleEvaluationQuestionChange,
    handleEvaluationOptionTextChange,
    handleEvaluationOptionCorrectSet,
    handleAddPronunciacionRow,
    handleRemovePronunciacionRow,
    handlePronunciacionRowChange,
    resetTeacherForm,
    handleSaveLesson,
  } = useTeacherForm();

  return (
    <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
      <div className="flex justify-between items-center border-b-2 border-slate-100 pb-4">
        <div>
          <h4 className="text-lg md:text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            {editingLessonId ? "📝 Editar Lección" : "➕ Crear Nuevo Tema"}
          </h4>
        </div>
        {editingLessonId && (
          <button
            type="button"
            onClick={resetTeacherForm}
            className="py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" /> Cancelar Edición
          </button>
        )}
      </div>

      <form onSubmit={handleSaveLesson} className="space-y-6">
        {/* 1. General */}
        <div className="space-y-3">
          <span className="text-base md:text-lg font-extrabold text-[#1cb0f6] bg-sky-50 px-3 py-1 rounded-full border border-sky-100/50 inline-block">
            1. General
          </span>
          <div className="pt-2">
            <label className="block text-base md:text-lg font-bold text-slate-700 mb-2">
              Título de la Lección
            </label>
            <input
              type="text"
              required
              value={formTitulo}
              onChange={(e) => setFormTitulo(e.target.value)}
              placeholder="ej: Present Simple"
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-base md:text-lg font-bold outline-none focus:border-sky-500 bg-white text-slate-800 transition-colors shadow-xs"
            />
          </div>
        </div>

        {/* 2. Vocabulario */}
        <div className="space-y-4 pt-5 border-t-2 border-slate-100">
          <div className="flex justify-between items-center">
            <span className="text-base md:text-lg font-extrabold text-[#1cb0f6] bg-sky-50 px-3 py-1 rounded-full border border-sky-100/50 inline-block">
              2. Vocabulario Inicial (Paso 1)
            </span>
          </div>
          <VocabTable
            items={formVocabularioDetallado}
            onAdd={(item) => setFormVocabularioDetallado([...formVocabularioDetallado, item])}
            onUpdate={(idx, item) => {
              const updated = [...formVocabularioDetallado];
              updated[idx] = item;
              setFormVocabularioDetallado(updated);
            }}
            onRemove={(idx) => setFormVocabularioDetallado(formVocabularioDetallado.filter((_, i) => i !== idx))}
          />
        </div>

        {/* 3. Gramática */}
        <div className="space-y-4 pt-5 border-t-2 border-slate-100">
          <span className="text-base md:text-lg font-extrabold text-[#1cb0f6] bg-sky-50 px-3 py-1 rounded-full border border-sky-100/50 inline-block">
            3. Estructura Gramatical (Paso 2)
          </span>
          <div className="space-y-1.5">
            <label className="block text-base md:text-lg font-bold text-slate-700 mb-1.5">
              Fórmula Gramatical general
            </label>
            <input
              type="text"
              required
              value={formFormulaGramatica}
              onChange={(e) => setFormFormulaGramatica(e.target.value)}
              placeholder="ej: Subject + Verb (-s/-es) + Complement"
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-base md:text-lg font-bold font-mono outline-none focus:border-sky-500 text-sky-700 bg-sky-50/20 transition-colors shadow-xs"
            />
          </div>
          <GrammarExampleSection />
        </div>

        {/* 4. Calentamiento */}
        <div className="space-y-4 pt-5 border-t-2 border-slate-100">
          <div className="flex justify-between items-center bg-sky-50/40 p-3 rounded-2xl border border-sky-100/50">
            <span className="text-base md:text-lg font-extrabold text-[#1cb0f6] px-1 inline-block">
              4. Calentamiento de Traducción (Paso 3)
            </span>
            <button
              type="button"
              onClick={handleAddWarmupRow}
              className="py-2 px-4 bg-sky-100 text-sky-700 hover:bg-sky-200 rounded-xl text-sm font-black flex items-center gap-1.5 transition-all cursor-pointer border border-sky-200/50"
            >
              <Plus className="w-4 h-4" /> Añadir Frase
            </button>
          </div>
          <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
            {formCalentamiento.map((warm, idx) => (
              <div key={idx} className="bg-slate-50/50 p-4 rounded-2xl border-2 border-slate-150 relative flex items-center gap-4">
                <span className="text-base font-black text-slate-400 w-6 text-center">{idx + 1}</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-500 block">En inglés</span>
                    <input
                      type="text" required
                      value={warm.fraseMetaEn}
                      onChange={(e) => handleWarmupRowChange(idx, "en", e.target.value)}
                      placeholder="ej: He plays tennis"
                      className="w-full px-3.5 py-2.5 border-2 border-slate-200 rounded-xl text-sm md:text-base font-bold text-slate-700 outline-none bg-white focus:border-sky-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-500 block">Traducción español</span>
                    <input
                      type="text" required
                      value={warm.fraseMetaEs}
                      onChange={(e) => handleWarmupRowChange(idx, "es", e.target.value)}
                      placeholder="ej: Él juega tenis"
                      className="w-full px-3.5 py-2.5 border-2 border-slate-200 rounded-xl text-sm md:text-base font-bold text-slate-700 outline-none bg-white focus:border-sky-500"
                    />
                  </div>
                </div>
                {formCalentamiento.length > 1 && (
                  <button type="button" onClick={() => handleRemoveWarmupRow(idx)}
                    className="text-rose-500 hover:bg-rose-50 p-2 rounded-xl transition-colors cursor-pointer shrink-0 border-2 border-transparent hover:border-rose-100"
                    title="Eliminar ítem"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 5. Pronunciación */}
        <div className="space-y-4 pt-5 border-t-2 border-slate-100">
          <div className="flex justify-between items-center bg-sky-50/40 p-3 rounded-2xl border border-sky-100/50">
            <span className="text-base md:text-lg font-extrabold text-[#1cb0f6] px-1 inline-block">
              5. Práctica de Pronunciación (Paso 4)
            </span>
            <button type="button" onClick={handleAddPronunciacionRow}
              className="py-2 px-4 bg-sky-100 text-sky-700 hover:bg-sky-200 rounded-xl text-sm font-black flex items-center gap-1.5 transition-all cursor-pointer border border-sky-200/50"
            >
              <Plus className="w-4 h-4" /> Añadir Frase
            </button>
          </div>
          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
            {formFrasesPronunciacion.map((frase, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-slate-50/35 p-3 rounded-2xl border border-slate-100">
                <span className="text-sm font-extrabold text-slate-400 w-6 text-right">{idx + 1}.</span>
                <input type="text" required value={frase}
                  onChange={(e) => handlePronunciacionRowChange(idx, e.target.value)}
                  placeholder="ej: She runs fast in the morning"
                  className="flex-1 px-3.5 py-2.5 border-2 border-slate-200 rounded-xl text-sm md:text-base font-bold outline-none focus:border-sky-500 text-sky-700 transition-colors bg-white shadow-xs"
                />
                {formFrasesPronunciacion.length > 1 && (
                  <button type="button" onClick={() => handleRemovePronunciacionRow(idx)}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl border-2 border-transparent hover:border-rose-100 transition-colors cursor-pointer"
                    title="Eliminar frase"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 6. Evaluación */}
        <div className="space-y-4 pt-5 border-t-2 border-slate-100">
          <div className="flex justify-between items-center bg-sky-50/40 p-3 rounded-2xl border border-sky-100/50">
            <span className="text-base md:text-lg font-extrabold text-[#1cb0f6] px-1 inline-block">
              6. Examen / Evaluación (Paso 5)
            </span>
            <button type="button" onClick={handleAddEvaluationRow}
              className="py-2 px-4 bg-sky-100 text-sky-700 hover:bg-sky-200 rounded-xl text-sm font-black flex items-center gap-1.5 transition-all cursor-pointer border border-sky-200/50"
            >
              <Plus className="w-4 h-4" /> Añadir Pregunta
            </button>
          </div>
          <div className="space-y-6 max-h-[450px] overflow-y-auto pr-1">
            {formEvaluacion.map((evalu, qIdx) => (
              <div key={qIdx} className="bg-slate-50/30 p-5 rounded-2xl border-2 border-slate-200 relative space-y-4">
                <div className="flex items-center justify-between border-b pb-2 mb-1">
                  <span className="text-sm md:text-base font-extrabold text-sky-700">Pregunta {qIdx + 1}</span>
                  {formEvaluacion.length > 1 && (
                    <button type="button" onClick={() => handleRemoveEvaluationRow(qIdx)}
                      className="text-rose-500 hover:bg-rose-50 py-1.5 px-3 rounded-xl border border-rose-100 hover:border-rose-200 transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
                    >
                      <Trash2 className="w-4 h-4" /> Eliminar Pregunta
                    </button>
                  )}
                </div>
                <div className="space-y-3">
                  <label className="block text-sm md:text-base font-bold text-slate-700">
                    Enunciado principal o frase incompleta
                  </label>
                  <input type="text" required value={evalu.pregunta}
                    onChange={(e) => handleEvaluationQuestionChange(qIdx, e.target.value)}
                    placeholder="ej: Complete: 'She ____ a good novel'"
                    className="w-full px-3.5 py-2.5 border-2 border-slate-200 rounded-xl text-sm md:text-base font-bold text-slate-800 outline-none focus:border-sky-500 bg-white shadow-xs"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {evalu.opciones.map((opt, oIdx) => (
                      <div key={oIdx}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border-2 transition-all ${
                          opt.correcta
                            ? "bg-emerald-50/50 border-emerald-350 text-emerald-900"
                            : "border-slate-200 bg-white hover:border-slate-300 text-slate-700"
                        }`}
                      >
                        <input type="radio" name={`correct-radio-q${qIdx}`}
                          checked={opt.correcta}
                          onChange={() => handleEvaluationOptionCorrectSet(qIdx, oIdx)}
                          className="w-5 h-5 text-emerald-600 cursor-pointer accent-emerald-500 ml-1 shrink-0"
                        />
                        <input type="text" required value={opt.texto}
                          onChange={(e) => handleEvaluationOptionTextChange(qIdx, oIdx, e.target.value)}
                          placeholder={`Opción ${oIdx + 1}`}
                          className="flex-1 bg-transparent border-0 outline-none text-xs md:text-sm font-extrabold py-1"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {teacherFormError && (
          <div className="bg-red-50 border-2 border-red-200 text-red-600 p-4 rounded-xl text-sm font-bold flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{teacherFormError}</span>
          </div>
        )}

        <button type="submit"
          className="w-full py-4 text-base md:text-lg font-black tracking-wide rounded-2xl cursor-pointer shadow-md btn-3d-blue uppercase active:scale-99 transition-all"
        >
          {editingLessonId ? "💾 Guardar Cambios" : "💾 Registrar Lección"}
        </button>
      </form>
    </div>
  );
}

