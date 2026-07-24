import { type FormEvent, useCallback } from "react";
import type { Leccion } from "../types";
import { saveStoredLessons, PRESENT_SIMPLE_SVG, PRESENT_CONTINUOUS_SVG, DEFAULT_GRAMATICA_COLUMNAS, DEFAULT_GRAMATICA_TITULO, DEFAULT_GRAMATICA_DESC } from "../data";
import { useAppContext } from "../context/AppContext";

/**
 * useTeacherForm — encapsulates all form state manipulation and validation
 * for the teacher's lesson creation / editing form.
 */
export function useTeacherForm() {
  const {
    lessons,
    setLessons,
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

  const handleAddWarmupRow = useCallback(() => {
    setFormCalentamiento([
      ...formCalentamiento,
      { fraseMetaEn: "", fraseMetaEs: "" },
    ]);
  }, [formCalentamiento, setFormCalentamiento]);

  const handleRemoveWarmupRow = useCallback(
    (idx: number) => {
      if (formCalentamiento.length <= 1) return;
      setFormCalentamiento(formCalentamiento.filter((_, i) => i !== idx));
    },
    [formCalentamiento, setFormCalentamiento]
  );

  const handleWarmupRowChange = useCallback(
    (idx: number, field: "en" | "es", val: string) => {
      const updated = [...formCalentamiento];
      if (field === "en") updated[idx].fraseMetaEn = val;
      else updated[idx].fraseMetaEs = val;
      setFormCalentamiento(updated);
    },
    [formCalentamiento, setFormCalentamiento]
  );

  // ── Evaluation handlers ──────────────────────────────────

  const handleAddEvaluationRow = useCallback(() => {
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
  }, [formEvaluacion, setFormEvaluacion]);

  const handleRemoveEvaluationRow = useCallback(
    (idx: number) => {
      if (formEvaluacion.length <= 1) return;
      setFormEvaluacion(formEvaluacion.filter((_, i) => i !== idx));
    },
    [formEvaluacion, setFormEvaluacion]
  );

  const handleEvaluationQuestionChange = useCallback(
    (qIdx: number, val: string) => {
      const updated = [...formEvaluacion];
      updated[qIdx].pregunta = val;
      setFormEvaluacion(updated);
    },
    [formEvaluacion, setFormEvaluacion]
  );

  const handleEvaluationOptionTextChange = useCallback(
    (qIdx: number, oIdx: number, val: string) => {
      const updated = [...formEvaluacion];
      updated[qIdx].opciones[oIdx].texto = val;
      setFormEvaluacion(updated);
    },
    [formEvaluacion, setFormEvaluacion]
  );

  const handleEvaluationOptionCorrectSet = useCallback(
    (qIdx: number, correctOIdx: number) => {
      const updated = [...formEvaluacion];
      updated[qIdx].opciones.forEach((opt, oIdx) => {
        opt.correcta = oIdx === correctOIdx;
      });
      setFormEvaluacion(updated);
    },
    [formEvaluacion, setFormEvaluacion]
  );

  // ── Pronunciation handlers ───────────────────────────────

  const handleAddPronunciacionRow = useCallback(() => {
    setFormFrasesPronunciacion([...formFrasesPronunciacion, ""]);
  }, [formFrasesPronunciacion, setFormFrasesPronunciacion]);

  const handleRemovePronunciacionRow = useCallback(
    (idx: number) => {
      if (formFrasesPronunciacion.length <= 1) return;
      setFormFrasesPronunciacion(
        formFrasesPronunciacion.filter((_, i) => i !== idx)
      );
    },
    [formFrasesPronunciacion, setFormFrasesPronunciacion]
  );

  const handlePronunciacionRowChange = useCallback(
    (idx: number, val: string) => {
      const updated = [...formFrasesPronunciacion];
      updated[idx] = val;
      setFormFrasesPronunciacion(updated);
    },
    [formFrasesPronunciacion, setFormFrasesPronunciacion]
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
    (e: FormEvent) => {
      e.preventDefault();
      setTeacherFormError(null);

      // ── Validation ──
      if (!formTitulo.trim()) {
        setTeacherFormError("El título del tema es obligatorio.");
        return;
      }
      if (!formFormulaGramatica.trim()) {
        setTeacherFormError(
          "La fórmula estructurada de gramática es obligatoria."
        );
        return;
      }

      const validatedFrasesPronunciacion = formFrasesPronunciacion
        .map((f) => f.trim())
        .filter(Boolean);
      if (validatedFrasesPronunciacion.length === 0) {
        setTeacherFormError(
          "Debe ingresar al menos una frase de pronunciación."
        );
        return;
      }

      for (let i = 0; i < formCalentamiento.length; i++) {
        if (
          !formCalentamiento[i].fraseMetaEn.trim() ||
          !formCalentamiento[i].fraseMetaEs.trim()
        ) {
          setTeacherFormError(
            `Faltan rellenar campos en el calentamiento nº ${i + 1}`
          );
          return;
        }
      }

      for (let i = 0; i < formEvaluacion.length; i++) {
        const q = formEvaluacion[i];
        if (!q.pregunta.trim()) {
          setTeacherFormError(
            `Falta escribir la pregunta del examen en la sección nº ${i + 1}`
          );
          return;
        }
        let correctCount = 0;
        for (let j = 0; j < q.opciones.length; j++) {
          if (!q.opciones[j].texto.trim()) {
            setTeacherFormError(
              `Falta la alternativa ${j + 1} de la pregunta nº ${i + 1}`
            );
            return;
          }
          if (q.opciones[j].correcta) correctCount++;
        }
        if (correctCount !== 1) {
          setTeacherFormError(
            `Marca exactamente una respuesta correcta para la pregunta nº ${i + 1}`
          );
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

      let updatedLessons: Leccion[];

      if (editingLessonId) {
        updatedLessons = lessons.map((les) => {
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
              gramaticaColumnas: formGramaticaColumnas.map(c => ({ ...c })),
              gramaticaTitulo: formGramaticaTitulo.trim(),
              gramaticaDesc: formGramaticaDesc.trim(),
              listaVocabulario:
                formVocabularioDetallado.length > 0
                  ? formVocabularioDetallado
                      .map((v) => v.ingles.trim())
                      .filter(Boolean)
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
          listaVocabulario:
            formVocabularioDetallado.length > 0
              ? formVocabularioDetallado
                  .map((v) => v.ingles.trim())
                  .filter(Boolean)
              : ["study", "practice", "speak", "write", "learn"],
          vocabularioDetallado: formVocabularioDetallado,
          imagenGramatica: inlineSVGSource,
          formulaGramatica: formFormulaGramatica.trim(),
          ejemploOracion: formEjemploOracion.trim(),
          ejemploRoles: formEjemploRoles,
          gramaticaColumnas: formGramaticaColumnas.map(c => ({ ...c })),
          gramaticaTitulo: formGramaticaTitulo.trim(),
          gramaticaDesc: formGramaticaDesc.trim(),
          calentamiento: formCalentamiento,
          evaluacion: formEvaluacion,
          frasesPronunciacion: validatedFrasesPronunciacion,
        };

        updatedLessons = [...lessons, newLesson];
        setLessons(updatedLessons);
        saveStoredLessons(updatedLessons);
        alert("¡Nueva lección creada de forma dinámica y guardada!");
      }

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
