import { useAppContext } from "../../context/AppContext";

export default function GrammarExampleSection() {
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
