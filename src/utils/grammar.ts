import type { Leccion } from "../types";

export interface GrammarSegment {
  word: string;
  role: string;
  desc: string;
  emoji?: string;
  badgeColor: string;
  wordColor: string;
}

/**
 * Computes interactive grammar segments for a lesson's example sentence.
 * Uses teacher-defined roles if available, otherwise falls back to
 * handcrafted segments for default lessons (id="1", id="2"),
 * or an automated heuristic classification.
 */
export function getInteractiveGrammarSegments(
  lesson: Leccion
): GrammarSegment[] {
  // Check if lesson has teacher-defined interactive grammar segments
  if (lesson.ejemploOracion && Array.isArray(lesson.ejemploRoles)) {
    const words = lesson.ejemploOracion.split(" ").filter(Boolean);
    return words.map((word, index) => {
      const role = lesson.ejemploRoles?.[index] || "Ninguno";
      let mappedRole = "Componente 💎";
      if (role === "Sujeto") mappedRole = "Sujeto / Subject 👤";
      else if (role === "Verbo") mappedRole = "Verbo / Verb ⚡";
      else if (role === "Complemento")
        mappedRole = "Complemento / Complement 📌";

      return {
        word,
        role: mappedRole,
        desc: "",
        badgeColor: "bg-sky-500 text-white",
        wordColor:
          "hover:bg-sky-50 border-sky-305 text-sky-700 bg-sky-50/20",
      };
    });
  }

  // Handcrafted premium segments for default lessons
  if (lesson.id === "1") {
    return [
      {
        word: "She",
        role: "Subject (Sujeto)",
        desc: "El pronombre o sujeto de la oración que realiza la acción.",
        emoji: "👤",
        badgeColor: "bg-emerald-500 text-white",
        wordColor:
          "hover:bg-emerald-50 border-emerald-300 text-emerald-700 bg-emerald-50/20",
      },
      {
        word: "works",
        role: "Verb (Verbo con -s)",
        desc: "La acción principal. En el presente simple, los verbos llevan '-s' o '-es' cuando el sujeto es singular ('He', 'She', 'It').",
        emoji: "⚡",
        badgeColor: "bg-sky-500 text-white",
        wordColor:
          "hover:bg-sky-50 border-sky-300 text-sky-700 bg-sky-50/20",
      },
      {
        word: "every day",
        role: "Complement (Complemento)",
        desc: "La información añadida que expresa la frecuencia, el tiempo o las circunstancias de la actividad.",
        emoji: "📌",
        badgeColor: "bg-amber-500 text-slate-800",
        wordColor:
          "hover:bg-amber-50 border-amber-300 text-amber-700 bg-amber-50/20",
      },
    ];
  }

  if (lesson.id === "2") {
    return [
      {
        word: "They",
        role: "Subject (Sujeto)",
        desc: "El pronombre personal o grupo de personas que realiza la acción.",
        emoji: "👤",
        badgeColor: "bg-emerald-500 text-white",
        wordColor:
          "hover:bg-emerald-50 border-emerald-300 text-emerald-700 bg-emerald-50/20",
      },
      {
        word: "are",
        role: "Auxiliary Verb (Verbo Auxiliar)",
        desc: "El verbo auxiliar 'to be' conjugado para la persona correspondiente ('They are' = Ellos están).",
        emoji: "⚙️",
        badgeColor: "bg-orange-500 text-white",
        wordColor:
          "hover:bg-orange-50 border-orange-300 text-orange-700 bg-orange-50/20",
      },
      {
        word: "learning",
        role: "Main Verb (Verbo principal con -ing)",
        desc: "La acción principal continuada. Lleva el sufijo '-ing' para denotar que el proceso está ocurriendo en tiempo real.",
        emoji: "⚡",
        badgeColor: "bg-sky-500 text-white",
        wordColor:
          "hover:bg-sky-50 border-sky-300 text-sky-700 bg-sky-50/20",
      },
      {
        word: "English",
        role: "Complement (Complemento)",
        desc: "El objeto o elemento sobre el cual recae el verbo principal de la acción (Inglés).",
        emoji: "📌",
        badgeColor: "bg-amber-500 text-slate-800",
        wordColor:
          "hover:bg-amber-50 border-amber-300 text-amber-700 bg-amber-50/20",
      },
    ];
  }

  // Generic automated mapping fallback for custom teacher lessons
  const fallbackSentence =
    lesson.calentamiento && lesson.calentamiento[0]
      ? lesson.calentamiento[0].fraseMetaEn
      : "I study English";

  const words = fallbackSentence.split(" ").filter(Boolean);

  if (words.length <= 1) {
    return [
      {
        word: fallbackSentence,
        role: "Sentence Unit (Componente)",
        desc: "La expresión gramatical interactiva de la lección.",
        emoji: "💎",
        badgeColor: "bg-purple-500 text-white",
        wordColor:
          "hover:bg-purple-50 border-purple-300 text-purple-700 bg-purple-50/20",
      },
    ];
  }

  // Auto classify 3 blocks
  if (words.length === 3) {
    return [
      {
        word: words[0],
        role: "Subject (Sujeto)",
        desc: "El sujeto principal o actor de la oración en inglés.",
        emoji: "👤",
        badgeColor: "bg-emerald-500 text-white",
        wordColor:
          "hover:bg-emerald-50 border-emerald-300 text-emerald-700 bg-emerald-50/20",
      },
      {
        word: words[1],
        role: "Verb / Action (Verbo/Acción)",
        desc: "El verbo conjugado que representa la acción principal.",
        emoji: "⚡",
        badgeColor: "bg-sky-500 text-white",
        wordColor:
          "hover:bg-sky-50 border-sky-300 text-sky-700 bg-sky-50/20",
      },
      {
        word: words[2],
        role: "Complement / Object (Complemento)",
        desc: "La información o destino que complementa la lógica de la acción.",
        emoji: "📌",
        badgeColor: "bg-amber-500 text-slate-800",
        wordColor:
          "hover:bg-amber-50 border-amber-300 text-amber-700 bg-amber-50/20",
      },
    ];
  }

  // 4 or more words (e.g., "I am writing an essay")
  const auxVerbs = [
    "am",
    "is",
    "are",
    "do",
    "does",
    "did",
    "have",
    "has",
    "will",
    "would",
    "can",
    "should",
  ];
  const includesAux = words.some((w) => auxVerbs.includes(w.toLowerCase()));

  if (includesAux && words.length >= 4) {
    const auxIndex = words.findIndex((w) => auxVerbs.includes(w.toLowerCase()));
    const subjectPart = words.slice(0, auxIndex).join(" ") || words[0];
    const auxPart = words[auxIndex];
    const verbPart = words[auxIndex + 1] || "verb";
    const complementPart = words.slice(auxIndex + 2).join(" ") || "complement";

    return [
      {
        word: subjectPart,
        role: "Subject (Sujeto)",
        desc: "El sujeto o frase nominal que realiza la acción.",
        emoji: "👤",
        badgeColor: "bg-emerald-500 text-white",
        wordColor:
          "hover:bg-emerald-50 border-emerald-300 text-emerald-700 bg-emerald-50/20",
      },
      {
        word: auxPart,
        role: "Auxiliary Verb (Auxiliar)",
        desc: "Modificador verbal o enlace temporal de la estructura.",
        emoji: "⚙️",
        badgeColor: "bg-orange-500 text-white",
        wordColor:
          "hover:bg-orange-50 border-orange-300 text-orange-700 bg-orange-50/20",
      },
      {
        word: verbPart,
        role: "Verb / Action (Verbo principal)",
        desc: "La acción o estado fundamental representado por el verbo.",
        emoji: "⚡",
        badgeColor: "bg-sky-500 text-white",
        wordColor:
          "hover:bg-sky-50 border-sky-300 text-sky-700 bg-sky-50/20",
      },
      {
        word: complementPart,
        role: "Complement (Complemento)",
        desc: "La información detallada de lugar, tiempo, o modo que completa el sentido.",
        emoji: "📌",
        badgeColor: "bg-amber-500 text-slate-800",
        wordColor:
          "hover:bg-amber-50 border-amber-300 text-amber-700 bg-amber-50/20",
      },
    ];
  } else {
    const subj = words[0];
    const vrb = words[1];
    const compl = words.slice(2).join(" ");
    return [
      {
        word: subj,
        role: "Subject (Sujeto)",
        desc: "El sujeto de la oración.",
        emoji: "👤",
        badgeColor: "bg-emerald-500 text-white",
        wordColor:
          "hover:bg-emerald-50 border-emerald-300 text-emerald-700 bg-emerald-50/20",
      },
      {
        word: vrb,
        role: "Verb / Action (Verbo principal)",
        desc: "La acción principal de la oración.",
        emoji: "⚡",
        badgeColor: "bg-sky-500 text-white",
        wordColor:
          "hover:bg-sky-50 border-sky-300 text-sky-700 bg-sky-50/20",
      },
      {
        word: compl,
        role: "Complement (Complemento)",
        desc: "El complemento verbal con información adicional de la oración.",
        emoji: "📌",
        badgeColor: "bg-amber-500 text-slate-800",
        wordColor:
          "hover:bg-amber-50 border-amber-300 text-amber-700 bg-amber-50/20",
      },
    ];
  }
}
