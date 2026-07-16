import { useState, useRef } from "react";
import { Edit3, Trash2 } from "lucide-react";
import type { VocabularioItem } from "../../types";

interface Props {
  items: VocabularioItem[];
  onAdd: (item: VocabularioItem) => void;
  onUpdate: (idx: number, item: VocabularioItem) => void;
  onRemove: (idx: number) => void;
}

export default function VocabTable({ items, onAdd, onUpdate, onRemove }: Props) {
  const [vocabIngles, setVocabIngles] = useState("");
  const [vocabEspanol, setVocabEspanol] = useState("");
  const [vocabCategoria, setVocabCategoria] = useState("Sustantivo");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSaveVocab = () => {
    const ingles = vocabIngles.trim();
    if (!ingles) { alert("Ingresa la palabra en inglés."); return; }
    const existingIdx = items.findIndex(v => v.ingles.toLowerCase() === ingles.toLowerCase());
    if (existingIdx !== -1) {
      onUpdate(existingIdx, { ingles, espanol: vocabEspanol.trim(), categoria: vocabCategoria });
    } else {
      onAdd({ ingles, espanol: vocabEspanol.trim(), categoria: vocabCategoria });
    }
    setVocabIngles("");
    setVocabEspanol("");
    setVocabCategoria("Sustantivo");
    inputRef.current?.focus();
  };

  const handleEditVocab = (item: VocabularioItem) => {
    setVocabIngles(item.ingles);
    setVocabEspanol(item.espanol);
    setVocabCategoria(item.categoria);
    inputRef.current?.focus();
  };

  return (
    <div className="bg-slate-50 p-5 md:p-6 rounded-2xl border-2 border-slate-200 space-y-4">
      <p className="text-sm md:text-base text-slate-500 font-medium leading-relaxed">
        Agrega y edita palabras clave de vocabulario que los alumnos deben aprender en el Paso 1 de esta lección.
      </p>

      <div className="bg-white p-4 rounded-xl border-2 border-slate-150 grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-end">
        <div className="sm:col-span-4">
          <label className="block text-sm font-bold text-slate-600 mb-1.5">Inglés</label>
          <input ref={inputRef} type="text" value={vocabIngles}
            onChange={(e) => setVocabIngles(e.target.value)}
            placeholder="ej: apple"
            className="w-full px-3 py-2.5 text-sm md:text-base font-bold border-2 border-slate-200 rounded-xl outline-none focus:border-sky-500 bg-white"
          />
        </div>
        <div className="sm:col-span-4">
          <label className="block text-sm font-bold text-slate-600 mb-1.5">Español</label>
          <input type="text" value={vocabEspanol}
            onChange={(e) => setVocabEspanol(e.target.value)}
            placeholder="ej: manzana"
            className="w-full px-3 py-2.5 text-sm md:text-base font-bold border-2 border-slate-200 rounded-xl outline-none focus:border-sky-500 bg-white"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-bold text-slate-600 mb-1.5">Categoría</label>
          <select value={vocabCategoria}
            onChange={(e) => setVocabCategoria(e.target.value)}
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
          <button type="button" onClick={handleSaveVocab}
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
                      <button type="button" onClick={() => handleEditVocab(item)}
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
