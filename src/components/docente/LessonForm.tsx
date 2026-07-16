import { useState, type FormEvent } from "react";
import { Plus, Trash2, AlertCircle, RotateCcw, Edit3 } from "lucide-react";
import type { Leccion, EjercicioCalentamiento, PreguntaEvaluacion, VocabularioItem } from "../../types";
import { saveStoredLessons, PRESENT_SIMPLE_SVG, PRESENT_CONTINUOUS_SVG } from "../../data";
import { useAppContext } from "../../context/AppContext";

export default function LessonForm() {
  const {
    lessons, setLessons,
    formTitulo, setFormTitulo,
    formImagenGramatica, setFormImagenGramatica,
    formFormulaGramatica, setFormFormulaGramatica,
    formFrasesPronunciacion, setFormFrasesPronunciacion,
    formCalentamiento, setFormCalentamiento,
    formEvaluacion, setFormEvaluacion,
    editingLessonId, setEditingLessonId,
    teacherFormError, setTeacherFormError,
    formEjemploOracion, setFormEjemploOracion,
    formEjemploRoles, setFormEjemploRoles,
    formVocabularioDetallado, setFormVocabularioDetallado,
  } = useAppContext();

  const handleAddWarmupRow = () => {
    setFormCalentamiento([...formCalentamiento, { fraseMetaEn: "", fraseMetaEs: "" }]);
  };

  const handleRemoveWarmupRow = (idx: number) => {
    if (formCalentamiento.length <= 1) return;
    setFormCalentamiento(formCalentamiento.filter((_, i) => i !== idx));
  };

  const handleWarmupRowChange = (idx: number, field: "en" | "es", val: string) => {
    const updated = [...formCalentamiento];
    if (field === "en") updated[idx].fraseMetaEn = val;
    else updated[idx].fraseMetaEs = val;
    setFormCalentamiento(updated);
  };

  const handleAddEvaluationRow = () => {
    setFormEvaluacion([
      ...formEvaluacion,
      {
        pregunta: "",
        opciones: [
          { texto: "", correcta: true },
          { texto: "", correcta: false },
          { texto: "", correcta: false },
          { texto: "", correcta: false },
        ],
      },
    ]);
  };

  const handleRemoveEvaluationRow = (idx: number) => {
    if (formEvaluacion.length <= 1) return;
    setFormEvaluacion(formEvaluacion.filter((_, i) => i !== idx));
  };

  const handleEvaluationQuestionChange = (qIdx: number, val: string) => {
    const updated = [...formEvaluacion];
    updated[qIdx].pregunta = val;
    setFormEvaluacion(updated);
  };

  const handleEvaluationOptionTextChange = (qIdx: number, oIdx: number, val: string) => {
    const updated = [...formEvaluacion];
    updated[qIdx].opciones[oIdx].texto = val;
    setFormEvaluacion(updated);
  };

  const handleEvaluationOptionCorrectSet = (qIdx: number, correctOIdx: number) => {
    const updated = [...formEvaluacion];
    updated[qIdx].opciones.forEach((opt, oIdx) => {
      opt.correcta = oIdx === correctOIdx;
    });
    setFormEvaluacion(updated);
  };

  const handleAddPronunciacionRow = () => {
    setFormFrasesPronunciacion([...formFrasesPronunciacion, ""]);
  };

  const handleRemovePronunciacionRow = (idx: number) => {
    if (formFrasesPronunciacion.length <= 1) return;
    setFormFrasesPronunciacion(formFrasesPronunciacion.filter((_, i) => i !== idx));
  };

  const handlePronunciacionRowChange = (idx: number, val: string) => {
    const updated = [...formFrasesPronunciacion];
    updated[idx] = val;
    setFormFrasesPronunciacion(updated);
  };

  const resetTeacherForm = () => {
    setFormTitulo("");
    setFormImagenGramatica("present_simple.png");
    setFormFormulaGramatica("");
    setFormFrasesPronunciacion([""]);
    setFormCalentamiento([{ fraseMetaEn: "", fraseMetaEs: "" }]);
    setFormEvaluacion([
      {
        pregunta: "",
        opciones: [
          { texto: "", correcta: true },
          { texto: "", correcta: false },
          { texto: "", correcta: false },
          { texto: "", correcta: false },
        ],
      },
    ]);
    setEditingLessonId(null);
    setTeacherFormError(null);
    setFormEjemploOracion("");
    setFormEjemploRoles([]);
    setFormVocabularioDetallado([]);
  };

  const handleSaveLesson = (e: FormEvent) => {
    e.preventDefault();
    setTeacherFormError(null);

    if (!formTitulo.trim()) {
      setTeacherFormError("El título del tema es obligatorio.");
      return;
    }
    if (!formFormulaGramatica.trim()) {
      setTeacherFormError("La fórmula estructurada de gramática es obligatoria.");
      return;
    }

    const validatedFrasesPronunciacion = formFrasesPronunciacion.map(f => f.trim()).filter(Boolean);
    if (validatedFrasesPronunciacion.length === 0) {
      setTeacherFormError("Debe ingresar al menos una frase de pronunciación.");
      return;
    }

    for (let i = 0; i < formCalentamiento.length; i++) {
      if (!formCalentamiento[i].fraseMetaEn.trim() || !formCalentamiento[i].fraseMetaEs.trim()) {
        setTeacherFormError(`Faltan rellenar campos en el calentamiento nº ${i + 1}`);
        return;
      }
    }

    for (let i = 0; i < formEvaluacion.length; i++) {
      const q = formEvaluacion[i];
      if (!q.pregunta.trim()) {
        setTeacherFormError(`Falta escribir la pregunta del examen en la sección nº ${i + 1}`);
        return;
      }
      let correctCount = 0;
      for (let j = 0; j < q.opciones.length; j++) {
        if (!q.opciones[j].texto.trim()) {
          setTeacherFormError(`Falta la alternativa ${j + 1} de la pregunta nº ${i + 1}`);
          return;
        }
        if (q.opciones[j].correcta) correctCount++;
      }
      if (correctCount !== 1) {
        setTeacherFormError(`Marca exactamente una respuesta correcta para la pregunta nº ${i + 1}`);
        return;
      }
    }

    let inlineSVGSource = formImagenGramatica;
    if (formImagenGramatica === "present_simple.png") {
      inlineSVGSource = PRESENT_SIMPLE_SVG;
    } else if (formImagenGramatica === "present_continuous.png") {
      inlineSVGSource = PRESENT_CONTINUOUS_SVG;
    }

    if (editingLessonId) {
      const updatedLessons = lessons.map(les => {
        if (les.id === editingLessonId) {
          return {
            ...les,
            titulo: formTitulo.trim(),
            imagenGramatica: inlineSVGSource,
            formulaGramatica: formFormulaGramatica.trim(),
            calentamiento: formCalentamiento,
            evaluacion: formEvaluacion,
            frasesPronunciacion: validatedFrasesPronunciacion,
            ejemploOracion: formEjemploOracion.trim(),
            ejemploRoles: formEjemploRoles,
            vocabularioDetallado: formVocabularioDetallado,
            listaVocabulario: formVocabularioDetallado.length > 0
              ? formVocabularioDetallado.map(v => v.ingles.trim()).filter(Boolean)
              : les.listaVocabulario,
          };
        }
        return les;
      });
      setLessons(updatedLessons);
      saveStoredLessons(updatedLessons);
      alert("¡Cambios actualizados y guardados en memoria!");
    } else {
      const newLesson: Leccion = {
        id: "lesson_" + Date.now(),
        titulo: formTitulo.trim(),
        estado: lessons.length === 0 ? "activa" : "inactiva",
        listaVocabulario: formVocabularioDetallado.length > 0
          ? formVocabularioDetallado.map(v => v.ingles.trim()).filter(Boolean)
          : ["study", "practice", "speak", "write", "learn"],
        vocabularioDetallado: formVocabularioDetallado,
        imagenGramatica: inlineSVGSource,
        formulaGramatica: formFormulaGramatica.trim(),
        ejemploOracion: formEjemploOracion.trim(),
        ejemploRoles: formEjemploRoles,
        calentamiento: formCalentamiento,
        evaluacion: formEvaluacion,
        frasesPronunciacion: validatedFrasesPronunciacion,
      };

      const updatedLessons = [...lessons, newLesson];
      setLessons(updatedLessons);
      saveStoredLessons(updatedLessons);
      alert("¡Nueva lección creada de forma dinámica y guardada!");
    }

    resetTeacherForm();
  };

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

// ── Sub-componentes internos ────────────────────────────────────

function VocabTable({
  items,
  onAdd,
  onUpdate,
  onRemove,
}: {
  items: VocabularioItem[];
  onAdd: (item: VocabularioItem) => void;
  onUpdate: (idx: number, item: VocabularioItem) => void;
  onRemove: (idx: number) => void;
}) {
  return (
    <div className="bg-slate-50 p-5 md:p-6 rounded-2xl border-2 border-slate-200 space-y-4">
      <p className="text-sm md:text-base text-slate-500 font-medium leading-relaxed">
        Agrega y edita palabras clave de vocabulario que los alumnos deben aprender en el Paso 1 de esta lección.
      </p>

      <div className="bg-white p-4 rounded-xl border-2 border-slate-150 grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-end">
        <div className="sm:col-span-4">
          <label className="block text-sm font-bold text-slate-600 mb-1.5">Inglés</label>
          <input type="text" id="vocab-en-input" placeholder="ej: apple"
            className="w-full px-3 py-2.5 text-sm md:text-base font-bold border-2 border-slate-200 rounded-xl outline-none focus:border-sky-500 bg-white"
          />
        </div>
        <div className="sm:col-span-4">
          <label className="block text-sm font-bold text-slate-600 mb-1.5">Español</label>
          <input type="text" id="vocab-es-input" placeholder="ej: manzana"
            className="w-full px-3 py-2.5 text-sm md:text-base font-bold border-2 border-slate-200 rounded-xl outline-none focus:border-sky-500 bg-white"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-bold text-slate-600 mb-1.5">Categoría</label>
          <select id="vocab-cat-select"
            className="w-full h-[46px] px-3 py-2 text-sm md:text-base font-bold border-2 border-slate-200 rounded-xl bg-white outline-none focus:border-sky-500 cursor-pointer"
          >
            <option value="Sustantivo">Sustantivo</option>
            <option value="Verbo">Verbo</option>
            <option value="Adjetivo">Adjetivo</option>
            <option value="Pronombre">Pronombre</option>
            <option value="Adverbio">Adverbio</option>
            <option value="Otro">Otro</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <button type="button" onClick={() => {
            const enEl = document.getElementById("vocab-en-input") as HTMLInputElement;
            const esEl = document.getElementById("vocab-es-input") as HTMLInputElement;
            const catEl = document.getElementById("vocab-cat-select") as HTMLSelectElement;
            if (!enEl || !esEl || !catEl) return;
            const ingles = enEl.value.trim();
            const espanol = esEl.value.trim();
            const categoria = catEl.value;
            if (!ingles) { alert("Ingresa la palabra en inglés."); return; }
            const existingIdx = items.findIndex(v => v.ingles.toLowerCase() === ingles.toLowerCase());
            if (existingIdx !== -1) {
              const updated = [...items];
              updated[existingIdx] = { ingles, espanol, categoria };
              onUpdate(existingIdx, updated[existingIdx]);
            } else {
              onAdd({ ingles, espanol, categoria });
            }
            enEl.value = ""; esEl.value = ""; catEl.value = "Sustantivo";
          }}
            className="w-full py-3 px-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-sm md:text-base font-black tracking-wide transition-colors cursor-pointer active:scale-95 text-center shadow-xs"
          >
            + Guardar
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border-2 border-slate-200 shadow-xs">
        <table className="w-full text-left border-collapse bg-white overflow-hidden">
          <thead>
            <tr className="bg-slate-100/70 border-b-2 border-slate-200 text-slate-700">
              <th className="px-4 py-3.5 text-xs md:text-sm font-bold uppercase tracking-wider">Inglés</th>
              <th className="px-4 py-3.5 text-xs md:text-sm font-bold uppercase tracking-wider">Español</th>
              <th className="px-4 py-3.5 text-xs md:text-sm font-bold uppercase tracking-wider">Categoría</th>
              <th className="px-4 py-3.5 text-xs md:text-sm font-bold uppercase tracking-wider text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm md:text-base font-bold text-slate-700">
            {items.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-6 text-slate-400 text-sm">
                  No hay palabras añadidas para el Paso 1. Usa el formulario de arriba para agregar palabras.
                </td>
              </tr>
            ) : (
              items.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3.5 font-mono text-sky-700">{item.ingles}</td>
                  <td className="px-4 py-3.5 text-slate-600">{item.espanol || "—"}</td>
                  <td className="px-4 py-3.5">
                    <span className="text-xs font-bold tracking-wider px-2.5 py-1 rounded-lg bg-sky-50 text-sky-600 border border-sky-100">
                      {item.categoria}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button type="button" onClick={() => {
                        const enEl = document.getElementById("vocab-en-input") as HTMLInputElement;
                        const esEl = document.getElementById("vocab-es-input") as HTMLInputElement;
                        const catEl = document.getElementById("vocab-cat-select") as HTMLSelectElement;
                        if (enEl && esEl && catEl) {
                          enEl.value = item.ingles; esEl.value = item.espanol; catEl.value = item.categoria;
                          enEl.focus();
                        }
                      }}
                        className="text-sky-500 hover:text-sky-700 bg-sky-50 hover:bg-sky-100 p-2 rounded-xl border border-sky-100 transition-colors cursor-pointer"
                        title="Editar palabra"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button type="button" onClick={() => onRemove(idx)}
                        className="text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 p-2 rounded-xl border border-rose-100 transition-colors cursor-pointer"
                        title="Eliminar palabra"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function GrammarExampleSection() {
  const {
    formEjemploOracion, setFormEjemploOracion,
    formEjemploRoles, setFormEjemploRoles,
  } = useAppContext();

  return (
    <div className="bg-slate-50 p-5 md:p-6 rounded-2xl border-2 border-slate-200 space-y-4">
      <div>
        <label className="block text-base md:text-lg font-black text-slate-800 tracking-tight flex items-center gap-1.5">
          🎯 Ejemplo Práctico Interactivo (Paso 2)
        </label>
        <p className="text-sm md:text-base text-slate-500 font-medium leading-relaxed mt-1">
          Escribe una oración de ejemplo y asigna roles a sus palabras para que los estudiantes las exploren de manera interactiva.
        </p>
        <input type="text" value={formEjemploOracion}
          onChange={(e) => {
            const val = e.target.value;
            setFormEjemploOracion(val);
            const words = val.split(" ").filter(Boolean);
            const updatedRoles = [...formEjemploRoles];
            if (updatedRoles.length !== words.length) {
              while (updatedRoles.length < words.length) updatedRoles.push("Ninguno");
              updatedRoles.length = words.length;
              setFormEjemploRoles(updatedRoles);
            }
          }}
          placeholder="ej: She loves apples"
          className="w-full mt-3 px-4 py-3 border-2 border-slate-200 rounded-xl text-base font-bold font-mono outline-none focus:border-sky-500 bg-white"
        />
      </div>

      {formEjemploOracion.trim() && (
        <div className="space-y-3 pt-2 border-t border-slate-200">
          <label className="block text-sm md:text-base font-bold text-slate-600">
            Asignación de Roles por Palabra:
          </label>
          <div className="flex flex-wrap gap-3">
            {formEjemploOracion.split(" ").filter(Boolean).map((word, wordIdx) => {
              const currentRole = formEjemploRoles[wordIdx] || "Ninguno";
              return (
                <div key={wordIdx}
                  className="bg-white p-3.5 rounded-xl border-2 border-slate-200 flex flex-col items-center gap-2 min-w-[110px] shadow-xs"
                >
                  <span className="font-extrabold text-sm md:text-base text-slate-800 break-all text-center">{word}</span>
                  <select value={currentRole}
                    onChange={(e) => {
                      const updated = [...formEjemploRoles];
                      updated[wordIdx] = e.target.value;
                      setFormEjemploRoles(updated);
                    }}
                    className="p-2 text-xs md:text-sm bg-slate-50 border-2 border-slate-200 rounded-lg font-bold text-slate-700 outline-none w-full text-center cursor-pointer"
                  >
                    <option value="Ninguno">Ninguno</option>
                    <option value="Sujeto">👤 Sujeto</option>
                    <option value="Verbo">⚡ Verbo</option>
                    <option value="Complemento">📌 Complemento</option>
                  </select>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
