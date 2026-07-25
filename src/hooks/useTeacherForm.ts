import { type FormEvent, useCallback } from "react";
import type { Leccion } from "../types";
import {
  PRESENT_SIMPLE_SVG,
  PRESENT_CONTINUOUS_SVG,
  DEFAULT_GRAMATICA_COLUMNAS,
  DEFAULT_GRAMATICA_TITULO,
  DEFAULT_GRAMATICA_DESC,
} from "../data";
import { saveLeccion, fetchLecciones } from "../lib/supabase-service";
import { useAppContext } from "../context/AppContext";

/**
 * useTeacherForm — encapsulates all form state manipulation and validation
 * for the teacher's lesson creation / editing form.
 *
 * Uses functional setState updates to avoid stale dependencies in useCallback.
 */
export function useTeacherForm() {
  const {
    lessons,
    setLessons,
    currentUser,
    formTitulo,
    setFormTitulo,
    formImagenGramatica,
    setFormImagenGramatica,
    formFormulaGramatica,
    setFormFormulaGramatica,
    formFrasesPronunciacion,
    setFormFrasesPronunciacion,
    formCalentamiento,
    setFormCalentamiento,
    formEvaluacion,
    setFormEvaluacion,
    editingLessonId,
    setEditingLessonId,
    teacherFormError,
    setTeacherFormError,
    formEjemploOracion,
    setFormEjemploOracion,
    formEjemploRoles,
    setFormEjemploRoles,
    formVocabularioDetallado,
    setFormVocabularioDetallado,
    formGramaticaColumnas,
    setFormGramaticaColumnas,
    formGramaticaTitulo,
    setFormGramaticaTitulo,
    formGramaticaDesc,
    setFormGramaticaDesc,
  } = useAppContext();

  // ── Warmup handlers ──────────────────────────────────────
  // Using functional updates to avoid depending on formCalentamiento

  const handleAddWarmupRow = useCallback(() => {
    setFormCalentamiento((prev) => [...prev, { fraseMetaEn: "", fraseMetaEs: "" }]);
  }, [setFormCalentamiento]);

  const handleRemoveWarmupRow = useCallback(
    (idx: number) => {
      setFormCalentamiento((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx)));
    },
    [setFormCalentamiento]
  );

  const handleWarmupRowChange = useCallback(
    (idx: number, field: "en" | "es", val: string) => {
      setFormCalentamiento((prev) => {
        const updated = [...prev];
        if (field === "en") updated[idx].fraseMetaEn = val;
        else updated[idx].fraseMetaEs = val;
        return updated;
      });
    },
    [setFormCalentamiento]
  );

  // ── Evaluation handlers ──────────────────────────────────

  const handleAddEvaluationRow = useCallback(() => {
    setFormEvaluacion((prev) => [
      ...prev,
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
  }, [setFormEvaluacion]);

  const handleRemoveEvaluationRow = useCallback(
    (idx: number) => {
      setFormEvaluacion((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx)));
    },
    [setFormEvaluacion]
  );

  const handleEvaluationQuestionChange = useCallback(
    (qIdx: number, val: string) => {
      setFormEvaluacion((prev) => {
        const updated = [...prev];
        updated[qIdx].pregunta = val;
        return updated;
      });
    },
    [setFormEvaluacion]
  );

  const handleEvaluationOptionTextChange = useCallback(
    (qIdx: number, oIdx: number, val: string) => {
      setFormEvaluacion((prev) => {
        const updated = [...prev];
        updated[qIdx].opciones[oIdx].texto = val;
        return updated;
      });
    },
    [setFormEvaluacion]
  );

  const handleEvaluationOptionCorrectSet = useCallback(
    (qIdx: number, correctOIdx: number) => {
      setFormEvaluacion((prev) => {
        const updated = [...prev];
        updated[qIdx].opciones.forEach((opt, oIdx) => {
          opt.correcta = oIdx === correctOIdx;
        });
        return updated;
      });
    },
    [setFormEvaluacion]
  );

  // ── Pronunciation handlers ───────────────────────────────

  const handleAddPronunciacionRow = useCallback(() => {
    setFormFrasesPronunciacion((prev) => [...prev, ""]);
  }, [setFormFrasesPronunciacion]);

  const handleRemovePronunciacionRow = useCallback(
    (idx: number) => {
      setFormFrasesPronunciacion((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx)));
    },
    [setFormFrasesPronunciacion]
  );

  const handlePronunciacionRowChange = useCallback(
    (idx: number, val: string) => {
      setFormFrasesPronunciacion((prev) => {
        const updated = [...prev];
        updated[idx] = val;
        return updated;
      });
    },
    [setFormFrasesPronunciacion]
  );

  // ── Form lifecycle ───────────────────────────────────────

  const resetTeacherForm = useCallback(() => {
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
    setFormGramaticaColumnas(DEFAULT_GRAMATICA_COLUMNAS);
    setFormGramaticaTitulo(DEFAULT_GRAMATICA_TITULO);
    setFormGramaticaDesc(DEFAULT_GRAMATICA_DESC);
  }, [
    setFormTitulo,
    setFormImagenGramatica,
    setFormFormulaGramatica,
    setFormFrasesPronunciacion,
    setFormCalentamiento,
    setFormEvaluacion,
    setEditingLessonId,
    setTeacherFormError,
    setFormEjemploOracion,
    setFormEjemploRoles,
    setFormVocabularioDetallado,
    setFormGramaticaColumnas,
    setFormGramaticaTitulo,
    setFormGramaticaDesc,
  ]);

  const handleSaveLesson = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setTeacherFormError(null);

      // ── Validation ──
      if (!formTitulo.trim()) {
        setTeacherFormError("El título del tema es obligatorio.");
        return;
      }
      if (!formFormulaGramatica.trim()) {
        setTeacherFormError("La fórmula estructurada de gramática es obligatoria.");
        return;
      }

      const validatedFrasesPronunciacion = formFrasesPronunciacion
        .map((f) => f.trim())
        .filter(Boolean);
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

      // ── Build lesson ──
      let inlineSVGSource = formImagenGramatica;
      if (formImagenGramatica === "present_simple.png") {
        inlineSVGSource = PRESENT_SIMPLE_SVG;
      } else if (formImagenGramatica === "present_continuous.png") {
        inlineSVGSource = PRESENT_CONTINUOUS_SVG;
      }

      let lessonToSave: Leccion;

      if (editingLessonId) {
        const existing = lessons.find((l) => l.id === editingLessonId);
        if (!existing) return;
        lessonToSave = {
          ...existing,
          titulo: formTitulo.trim(),
          formulaGramatica: formFormulaGramatica.trim(),
          calentamiento: formCalentamiento,
          evaluacion: formEvaluacion,
          frasesPronunciacion: validatedFrasesPronunciacion,
          ejemploOracion: formEjemploOracion.trim(),
          ejemploRoles: formEjemploRoles,
          vocabularioDetallado: formVocabularioDetallado,
          gramaticaColumnas: formGramaticaColumnas.map((c) => ({ ...c })),
          gramaticaTitulo: formGramaticaTitulo.trim(),
          gramaticaDesc: formGramaticaDesc.trim(),
          listaVocabulario:
            formVocabularioDetallado.length > 0
              ? formVocabularioDetallado.map((v) => v.ingles.trim()).filter(Boolean)
              : existing.listaVocabulario,
        };
      } else {
        lessonToSave = {
          id: "lesson_" + Date.now(),
          titulo: formTitulo.trim(),
          estado: lessons.length === 0 ? "activa" : "inactiva",
          listaVocabulario:
            formVocabularioDetallado.length > 0
              ? formVocabularioDetallado.map((v) => v.ingles.trim()).filter(Boolean)
              : ["study", "practice", "speak", "write", "learn"],
          vocabularioDetallado: formVocabularioDetallado,
          imagenGramatica: inlineSVGSource,
          formulaGramatica: formFormulaGramatica.trim(),
          ejemploOracion: formEjemploOracion.trim(),
          ejemploRoles: formEjemploRoles,
          gramaticaColumnas: formGramaticaColumnas.map((c) => ({ ...c })),
          gramaticaTitulo: formGramaticaTitulo.trim(),
          gramaticaDesc: formGramaticaDesc.trim(),
          calentamiento: formCalentamiento,
          evaluacion: formEvaluacion,
          frasesPronunciacion: validatedFrasesPronunciacion,
        };
      }

      // Guardar en Supabase
      await saveLeccion(lessonToSave, currentUser || "");
      // Recargar lecciones desde Supabase
      const freshLessons = await fetchLecciones();
      setLessons(freshLessons);

      alert(editingLessonId ? "¡Cambios guardados en la base de datos!" : "¡Nueva lección creada y guardada!");
      resetTeacherForm();
    },
    [
      formTitulo,
      formFormulaGramatica,
      formFrasesPronunciacion,
      formCalentamiento,
      formEvaluacion,
      formImagenGramatica,
      formEjemploOracion,
      formEjemploRoles,
      formVocabularioDetallado,
      formGramaticaColumnas,
      formGramaticaTitulo,
      formGramaticaDesc,
      editingLessonId,
      lessons,
      currentUser,
      setLessons,
      setTeacherFormError,
      resetTeacherForm,
    ]
  );

  return {
    // Warmup
    handleAddWarmupRow,
    handleRemoveWarmupRow,
    handleWarmupRowChange,
    // Evaluation
    handleAddEvaluationRow,
    handleRemoveEvaluationRow,
    handleEvaluationQuestionChange,
    handleEvaluationOptionTextChange,
    handleEvaluationOptionCorrectSet,
    // Pronunciation
    handleAddPronunciacionRow,
    handleRemovePronunciacionRow,
    handlePronunciacionRowChange,
    // Lifecycle
    resetTeacherForm,
    handleSaveLesson,
  };
}