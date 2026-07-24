import { useState, type ReactNode } from "react";
import { Plus, Trash2, AlertCircle, RotateCcw, ChevronDown, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { EjercicioCalentamiento, PreguntaEvaluacion } from "../../types";
import { useAppContext } from "../../context/AppContext";
import { useTeacherForm } from "../../hooks/useTeacherForm";
import VocabTable from "./VocabTable";
import GrammarExampleSection from "./GrammarExampleSection";

// ── Section Accordion ──────────────────────────────────────────
function SectionAccordion({
  number,
  title,
  defaultOpen = false,
  children,
}: {
  number: string;
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="w-full flex items-center justify-between bg-sky-50/60 p-4 md:p-5 rounded-2xl border-2 border-sky-100 hover:border-sky-200 hover:bg-sky-50 transition-all cursor-pointer text-left group"
      >
        <span className="text-xl font-extrabold text-[#1cb0f6]">
          {number}. {title}
        </span>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-sky-400 font-bold uppercase tracking-wider">
            {open ? "Cerrar" : "Abrir"}
          </span>
          <ChevronDown
            className={`w-6 h-6 text-sky-400 transition-transform duration-200 ${
              open ? "rotate-0" : "-rotate-90"
            }`}
          />
        </div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pt-5 space-y-5">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

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
    formGramaticaColumnas, setFormGramaticaColumnas,
    formGramaticaTitulo, setFormGramaticaTitulo,
    formGramaticaDesc, setFormGramaticaDesc,
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

      <form onSubmit={handleSaveLesson} className="space-y-8">
        {/* ================================================================ */}
        {/* 1. GENERAL                                                       */}
        {/* ================================================================ */}
        <SectionAccordion number="1" title="General" defaultOpen={true}>
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
              className="w-full px-5 py-4 border-2 border-slate-200 rounded-xl text-base md:text-lg font-bold outline-none focus:border-sky-500 bg-white text-slate-800 transition-colors shadow-xs"
            />
          </div>
        </SectionAccordion>

        {/* ================================================================ */}
        {/* 2. VOCABULARIO                                                    */}
        {/* ================================================================ */}
        <SectionAccordion number="2" title="Vocabulario Inicial">
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
        </SectionAccordion>

        {/* ================================================================ */}
        {/* 3. ESTRUCTURA GRAMATICAL                                          */}
        {/* ================================================================ */}
        <SectionAccordion number="3" title="Estructura Gramatical">
          {/* Título y Descripción */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">
                Título de la Gramática
              </label>
              <input type="text" value={formGramaticaTitulo}
                onChange={(e) => setFormGramaticaTitulo(e.target.value)}
                placeholder="ej: PRESENT SIMPLE"
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-base font-extrabold uppercase outline-none focus:border-sky-500 bg-white"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">
                Descripción de la Gramática
              </label>
              <input type="text" value={formGramaticaDesc}
                onChange={(e) => setFormGramaticaDesc(e.target.value)}
                placeholder="ej: Rutinas Diarias"
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-base font-bold outline-none focus:border-sky-500 bg-white"
              />
            </div>
          </div>

          {/* Vista previa mini de la gramática */}
          <div
            className="w-full rounded-[14px] p-4 text-white text-sm"
            style={{
              background: "linear-gradient(135deg, #1a8fe3 0%, #0d6bbf 60%, #0a55a0 100%)",
              boxShadow: "0 4px 16px rgba(13, 107, 191, 0.2)",
            }}
          >
            <div className="font-extrabold tracking-wide">
              Grammar Guide: {formGramaticaTitulo || "TITLE"}
            </div>
            <div className="text-[10px] text-white/75 mb-3">
              {formGramaticaDesc || "Descripción del tema"}
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {formGramaticaColumnas.map((col, i) => (
                <div key={i}
                  className={`${i === 2 ? "bg-white/12 rounded-[8px] p-2 text-center flex flex-col items-center justify-center gap-1" : "bg-white/12 rounded-[8px] p-2 text-center"}`}
                >
                  <div className="text-[9px] text-white/70 leading-tight">{col.titulo}</div>
                  <div className={`text-sm font-extrabold ${i === 0 ? "text-[#4dff6e]" : i === 1 ? "text-[#ffe44d]" : "text-[#ffe44d]"}`}>
                    {col.verbo}
                  </div>
                  <div className="text-[8px] text-white/65 whitespace-pre-line">{col.nota}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Editor de columnas */}
          <DetailsCollapsible title="📊 Configurar Columnas de la Tarjeta" count={0}>
            <div className="space-y-5">
              {formGramaticaColumnas.map((col, i) => (
                <div key={i} className="p-3 border border-slate-200 rounded-xl bg-white space-y-2.5">
                  <span className="text-xs font-black text-sky-600 uppercase tracking-wider">
                    Columna {i + 1}{i === 0 ? " — I/You/We/They" : i === 1 ? " — He/She/It" : " — Fórmula"}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Título</label>
                      <input type="text" value={col.titulo}
                        onChange={(e) => {
                          const updated = [...formGramaticaColumnas];
                          updated[i] = { ...updated[i], titulo: e.target.value };
                          setFormGramaticaColumnas(updated);
                        }}
                        className="w-full px-2.5 py-2 border-2 border-slate-200 rounded-lg text-sm font-bold outline-none focus:border-sky-500 bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Verbo / Etiqueta</label>
                      <input type="text" value={col.verbo}
                        onChange={(e) => {
                          const updated = [...formGramaticaColumnas];
                          updated[i] = { ...updated[i], verbo: e.target.value };
                          setFormGramaticaColumnas(updated);
                        }}
                        className="w-full px-2.5 py-2 border-2 border-slate-200 rounded-lg text-sm font-mono font-bold outline-none focus:border-sky-500 bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Nota</label>
                      <input type="text" value={col.nota}
                        onChange={(e) => {
                          const updated = [...formGramaticaColumnas];
                          updated[i] = { ...updated[i], nota: e.target.value };
                          setFormGramaticaColumnas(updated);
                        }}
                        className="w-full px-2.5 py-2 border-2 border-slate-200 rounded-lg text-sm font-bold outline-none focus:border-sky-500 bg-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </DetailsCollapsible>

          {/* Fórmula Gramatical */}
          <div className="space-y-2">
            <label className="block text-base md:text-lg font-bold text-slate-700">
              Fórmula Gramatical general (para la caja oscura)
            </label>
            <input
              type="text"
              required
              value={formFormulaGramatica}
              onChange={(e) => setFormFormulaGramatica(e.target.value)}
              placeholder="ej: Subject + Verb (-s/-es) + Complement"
              className="w-full px-5 py-4 border-2 border-slate-200 rounded-xl text-base md:text-lg font-bold font-mono outline-none focus:border-sky-500 text-sky-700 bg-sky-50/20 transition-colors shadow-xs"
            />

            {/* Collapsible: Ejemplos */}
            <DetailsCollapsible
              title="Ejemplos de la Fórmula"
              count={formCalentamiento.filter(w => w.fraseMetaEn.trim()).length}
            >
              {formCalentamiento.filter(w => w.fraseMetaEn.trim()).length === 0 ? (
                <p className="text-sm text-slate-400 italic">
                  Aún no hay frases de ejemplo. Agrégalas en la sección "4. Construcción de Oraciones".
                </p>
              ) : (
                <ul className="space-y-1.5">
                  {formCalentamiento
                    .filter(w => w.fraseMetaEn.trim())
                    .map((w, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-700 text-[10px] font-black flex items-center justify-center shrink-0">
                          {i + 1}
                        </span>
                        <code className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          {w.fraseMetaEn}
                        </code>
                        <span className="text-slate-400 text-xs">→ {w.fraseMetaEs}</span>
                      </li>
                    ))}
                </ul>
              )}
            </DetailsCollapsible>
          </div>

          <GrammarExampleSection />
        </SectionAccordion>

        {/* ================================================================ */}
        {/* 4. CONSTRUCCIÓN DE ORACIONES                                      */}
        {/* ================================================================ */}
        <SectionAccordion number="4" title="Construcción de Oraciones">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleAddWarmupRow}
              className="py-2.5 px-5 bg-sky-100 text-sky-700 hover:bg-sky-200 rounded-xl text-sm font-black flex items-center gap-1.5 transition-all cursor-pointer border border-sky-200/50"
            >
              <Plus className="w-4 h-4" /> Añadir Frase
            </button>
          </div>
          <div className="space-y-3.5 max-h-[400px] overflow-y-auto pr-1">
            {formCalentamiento.map((warm, idx) => (
              <div key={idx} className="bg-slate-50/50 p-4 rounded-2xl border-2 border-slate-150 relative flex items-center gap-4">
                <span className="text-lg font-black text-slate-400 w-8 text-center">{idx + 1}</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-500 block">En inglés</span>
                    <input
                      type="text" required
                      value={warm.fraseMetaEn}
                      onChange={(e) => handleWarmupRowChange(idx, "en", e.target.value)}
                      placeholder="ej: He plays tennis"
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-base md:text-lg font-bold text-slate-700 outline-none bg-white focus:border-sky-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-500 block">Traducción español</span>
                    <input
                      type="text" required
                      value={warm.fraseMetaEs}
                      onChange={(e) => handleWarmupRowChange(idx, "es", e.target.value)}
                      placeholder="ej: Él juega tenis"
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-base md:text-lg font-bold text-slate-700 outline-none bg-white focus:border-sky-500"
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
        </SectionAccordion>

        {/* ================================================================ */}
        {/* 5. PRÁCTICA DE PRONUNCIACIÓN                                      */}
        {/* ================================================================ */}
        <SectionAccordion number="5" title="Práctica de Pronunciación">
          <div className="flex justify-end">
            <button type="button" onClick={handleAddPronunciacionRow}
              className="py-2.5 px-5 bg-sky-100 text-sky-700 hover:bg-sky-200 rounded-xl text-sm font-black flex items-center gap-1.5 transition-all cursor-pointer border border-sky-200/50"
            >
              <Plus className="w-4 h-4" /> Añadir Frase
            </button>
          </div>
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {formFrasesPronunciacion.map((frase, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-slate-50/35 p-3 rounded-2xl border border-slate-100">
                <span className="text-base font-extrabold text-slate-400 w-8 text-right">{idx + 1}.</span>
                <input type="text" required value={frase}
                  onChange={(e) => handlePronunciacionRowChange(idx, e.target.value)}
                  placeholder="ej: She runs fast in the morning"
                  className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-xl text-base md:text-lg font-bold outline-none focus:border-sky-500 text-sky-700 transition-colors bg-white shadow-xs"
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
        </SectionAccordion>

        {/* ================================================================ */}
        {/* 6. EXAMEN / EVALUACIÓN                                            */}
        {/* ================================================================ */}
        <SectionAccordion number="6" title="Examen / Evaluación">
          <div className="flex justify-end">
            <button type="button" onClick={handleAddEvaluationRow}
              className="py-2.5 px-5 bg-sky-100 text-sky-700 hover:bg-sky-200 rounded-xl text-sm font-black flex items-center gap-1.5 transition-all cursor-pointer border border-sky-200/50"
            >
              <Plus className="w-4 h-4" /> Añadir Pregunta
            </button>
          </div>
          <div className="space-y-6 max-h-[500px] overflow-y-auto pr-1">
            {formEvaluacion.map((evalu, qIdx) => (
              <div key={qIdx} className="bg-slate-50/30 p-5 rounded-2xl border-2 border-slate-200 relative space-y-4">
                <div className="flex items-center justify-between border-b pb-2 mb-1">
                  <span className="text-base md:text-lg font-extrabold text-sky-700">Pregunta {qIdx + 1}</span>
                  {formEvaluacion.length > 1 && (
                    <button type="button" onClick={() => handleRemoveEvaluationRow(qIdx)}
                      className="text-rose-500 hover:bg-rose-50 py-1.5 px-3 rounded-xl border border-rose-100 hover:border-rose-200 transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
                    >
                      <Trash2 className="w-4 h-4" /> Eliminar Pregunta
                    </button>
                  )}
                </div>
                <div className="space-y-3">
                  <label className="block text-base md:text-lg font-bold text-slate-700">
                    Enunciado principal o frase incompleta
                  </label>
                  <input type="text" required value={evalu.pregunta}
                    onChange={(e) => handleEvaluationQuestionChange(qIdx, e.target.value)}
                    placeholder="ej: Complete: 'She ____ a good novel'"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-base md:text-lg font-bold text-slate-800 outline-none focus:border-sky-500 bg-white shadow-xs"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {evalu.opciones.map((opt, oIdx) => (
                      <div key={oIdx}
                        className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${
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
                          className="flex-1 bg-transparent border-0 outline-none text-sm md:text-base font-extrabold py-1"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionAccordion>

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

// ── Collapsible details component ─────────────────────────────
function DetailsCollapsible({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-2 border border-slate-200 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer text-left"
      >
        <span className="text-sm font-bold text-slate-600 flex items-center gap-2">
          {open ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
          {title}
          {count > 0 && (
            <span className="bg-sky-100 text-sky-700 text-[10px] font-black px-1.5 py-0.5 rounded-full">
              {count}
            </span>
          )}
        </span>
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
          {open ? "Ocultar" : "Ver"}
        </span>
      </button>
      {open && <div className="px-4 py-3 border-t border-slate-200 bg-white">{children}</div>}
    </div>
  );
}
