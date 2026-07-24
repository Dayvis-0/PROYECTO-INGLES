import { Leccion, Calificacion, GramaticaColumna } from "./types";

// Base64 SVGs to simulate static physical images in high visual fidelity
export const PRESENT_SIMPLE_SVG = "data:image/svg+xml;utf8," + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 300" width="100%" height="100%">
  <defs>
    <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1cb0f6" />
      <stop offset="100%" stop-color="#0079b8" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g1)" rx="20"/>
  
  <!-- Title -->
  <text x="30" y="50" font-family="'Nunito', 'Segoe UI', sans-serif" font-size="26" font-weight="900" fill="#ffffff">Grammar Guide: PRESENT SIMPLE</text>
  <text x="30" y="80" font-family="'Nunito', 'Segoe UI', sans-serif" font-size="14" fill="#e0f2fe" font-weight="600">Habits, routines and permanent facts</text>
  
  <!-- Schema block -->
  <g transform="translate(30, 110)">
    <!-- Positive -->
    <rect x="0" y="0" width="150" height="150" rx="12" fill="rgba(255,255,255,0.15)"/>
    <text x="75" y="35" font-family="'Nunito', 'Segoe UI', sans-serif" font-size="18" font-weight="800" fill="#ffffff" text-anchor="middle">I / You / We / They</text>
    <text x="75" y="80" font-family="'Nunito', 'Segoe UI', sans-serif" font-size="28" font-weight="900" fill="#58cc02" text-anchor="middle">PLAY</text>
    <text x="75" y="125" font-family="'Nunito', 'Segoe UI', sans-serif" font-size="12" fill="#d1fae5" font-weight="600" text-anchor="middle">Every Saturday</text>
    
    <!-- He/She/It -->
    <rect x="170" y="0" width="150" height="150" rx="12" fill="rgba(255,255,255,0.15)"/>
    <text x="245" y="35" font-family="'Nunito', 'Segoe UI', sans-serif" font-size="18" font-weight="800" fill="#ffffff" text-anchor="middle">He / She / It</text>
    <text x="245" y="80" font-family="'Nunito', 'Segoe UI', sans-serif" font-size="28" font-weight="900" fill="#ffc800" text-anchor="middle">PLAYS</text>
    <text x="245" y="110" font-family="'Nunito', 'Segoe UI', sans-serif" font-size="12" fill="#fef3c7" font-weight="800" text-anchor="middle">Adds -s / -es</text>
    <text x="245" y="130" font-family="'Nunito', 'Segoe UI', sans-serif" font-size="11" fill="#fef3c7" text-anchor="middle">e.g. works, studies</text>

    <!-- Formula hint badge -->
    <rect x="340" y="0" width="200" height="150" rx="12" fill="#0284c7" />
    <text x="440" y="35" font-family="'Nunito', 'Segoe UI', sans-serif" font-size="16" font-weight="800" fill="#ffffff" text-anchor="middle">FORMULA</text>
    <rect x="355" y="55" width="170" height="40" rx="6" fill="#0369a1" />
    <text x="440" y="80" font-family="'Nunito', 'Segoe UI', sans-serif" font-size="13" font-weight="900" fill="#22c55e" text-anchor="middle">S + Verb(-s) + Complement</text>
    <text x="440" y="120" font-family="'Nunito', 'Segoe UI', sans-serif" font-size="11" fill="#e0f2fe" text-anchor="middle" font-weight="600">e.g. She eats an apple.</text>
  </g>
</svg>
`);

export const PRESENT_CONTINUOUS_SVG = "data:image/svg+xml;utf8," + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 300" width="100%" height="100%">
  <defs>
    <linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#58cc02" />
      <stop offset="100%" stop-color="#46a302" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g2)" rx="20"/>
  
  <!-- Title -->
  <text x="30" y="50" font-family="'Nunito', 'Segoe UI', sans-serif" font-size="26" font-weight="900" fill="#ffffff">Present Continuous</text>
  <text x="30" y="80" font-family="'Nunito', 'Segoe UI', sans-serif" font-size="14" fill="#d1fae5" font-weight="600">Actions happening right now, at the moment</text>
  
  <!-- Schema block -->
  <g transform="translate(30, 110)">
    <!-- Subject + Auxiliary -->
    <rect x="0" y="0" width="160" height="150" rx="12" fill="rgba(255,255,255,0.15)"/>
    <text x="80" y="35" font-family="'Nunito', 'Segoe UI', sans-serif" font-size="16" font-weight="800" fill="#ffffff" text-anchor="middle">Sujeto + AM / IS / ARE</text>
    <text x="80" y="75" font-family="'Nunito', 'Segoe UI', sans-serif" font-size="12" fill="#ffffff" font-weight="600" text-anchor="middle">I → am</text>
    <text x="80" y="95" font-family="'Nunito', 'Segoe UI', sans-serif" font-size="12" fill="#ffffff" font-weight="600" text-anchor="middle">He / She / It → is</text>
    <text x="80" y="115" font-family="'Nunito', 'Segoe UI', sans-serif" font-size="12" fill="#ffffff" font-weight="600" text-anchor="middle">You / We / They → are</text>
    
    <!-- Verb + ING -->
    <rect x="180" y="0" width="160" height="150" rx="12" fill="rgba(255,255,255,0.15)"/>
    <text x="260" y="35" font-family="'Nunito', 'Segoe UI', sans-serif" font-size="16" font-weight="800" fill="#ffffff" text-anchor="middle">Verb + -ING</text>
    <text x="260" y="85" font-family="'Nunito', 'Segoe UI', sans-serif" font-size="28" font-weight="900" fill="#ffffff" text-anchor="middle">STUDYING</text>
    <text x="260" y="125" font-family="'Nunito', 'Segoe UI', sans-serif" font-size="12" fill="#d1fae5" font-weight="600" text-anchor="middle">learn → learning</text>

    <!-- Formula -->
    <rect x="360" y="0" width="180" height="150" rx="12" fill="#15803d"/>
    <text x="450" y="35" font-family="'Nunito', 'Segoe UI', sans-serif" font-size="16" font-weight="800" fill="#ffffff" text-anchor="middle">STRUCTURAL formula</text>
    <rect x="375" y="55" width="150" height="40" rx="6" fill="#166534" />
    <text x="450" y="80" font-family="'Nunito', 'Segoe UI', sans-serif" font-size="13" font-weight="900" fill="#ffc800" text-anchor="middle">S + Be + V(-ing) + C</text>
    <text x="450" y="120" font-family="'Nunito', 'Segoe UI', sans-serif" font-size="11" fill="#d1fae5" text-anchor="middle" font-weight="600">e.g. I am reading a book.</text>
  </g>
</svg>
`);

export const DEFAULT_GRAMATICA_TITULO = "PRESENT SIMPLE";
export const DEFAULT_GRAMATICA_DESC = "Rutinas Diarias";

export const DEFAULT_GRAMATICA_COLUMNAS: GramaticaColumna[] = [
  { titulo: "I / You / We / They", verbo: "PLAY", nota: "Every Saturday" },
  { titulo: "He / She / It", verbo: "PLAYS", nota: "Adds -s / -es\ne.g. works, studies" },
  { titulo: "FORMULA", verbo: "S + Verb(-s) + Complement", nota: "e.g. She eats an apple." },
];

// 2 Default lessons with 10 high-quality evaluation exercises each to satisfy scholastic evaluation criteria
export const LECCIONES_INICIALES: Leccion[] = [
  {
    id: "1",
    titulo: "Present Simple - Rutinas Diarias",
    estado: "activa",
    listaVocabulario: ["eat", "drink", "work", "run", "read", "write"],
    imagenGramatica: PRESENT_SIMPLE_SVG,
    formulaGramatica: "Subject + Verb (-s/-es) + Complement",
    calentamiento: [
      { fraseMetaEn: "He works every day", fraseMetaEs: "Él trabaja todos los días" },
      { fraseMetaEn: "She runs in the park", fraseMetaEs: "Ella corre en el parque" },
      { fraseMetaEn: "They study English", fraseMetaEs: "Ellos estudian inglés" }
    ],
    evaluacion: [
      {
        pregunta: "Elige el verbo correcto: 'She ____ English very well.'",
        opciones: [
          { texto: "studies", correcta: true },
          { texto: "study", correcta: false },
          { texto: "studying", correcta: false },
          { texto: "studis", correcta: false }
        ]
      },
      {
        pregunta: "Completa la oración: 'We ____ to the radio every morning.'",
        opciones: [
          { texto: "hears", correcta: false },
          { texto: "listens", correcta: false },
          { texto: "listen", correcta: true },
          { texto: "listening", correcta: false }
        ]
      },
      {
        pregunta: "Completa la oración: 'My father ____ coffee in the office.'",
        opciones: [
          { texto: "drinks", correcta: true },
          { texto: "drinking", correcta: false },
          { texto: "drink", correcta: false },
          { texto: "drinked", correcta: false }
        ]
      },
      {
        pregunta: "Selecciona la forma correcta: 'They ____ soccer on weekends.'",
        opciones: [
          { texto: "plays", correcta: false },
          { texto: "play", correcta: true },
          { texto: "playing", correcta: false },
          { texto: "playes", correcta: false }
        ]
      },
      {
        pregunta: "Completa la oración: 'He ____ to school at 7:30 AM.'",
        opciones: [
          { texto: "goes", correcta: true },
          { texto: "go", correcta: false },
          { texto: "going", correcta: false },
          { texto: "went", correcta: false }
        ]
      },
      {
        pregunta: "Completa el espacio: 'I ____ an apple every afternoon.'",
        opciones: [
          { texto: "eats", correcta: false },
          { texto: "eat", correcta: true },
          { texto: "eating", correcta: false },
          { texto: "ate", correcta: false }
        ]
      },
      {
        pregunta: "Escoge el correcto: 'The cat ____ under the table.'",
        opciones: [
          { texto: "sleeps", correcta: true },
          { texto: "sleep", correcta: false },
          { texto: "sleeping", correcta: false },
          { texto: "sleeped", correcta: false }
        ]
      },
      {
        pregunta: "Completa: 'You ____ books in the library.'",
        opciones: [
          { texto: "reads", correcta: false },
          { texto: "read", correcta: true },
          { texto: "reading", correcta: false },
          { texto: "reader", correcta: false }
        ]
      },
      {
        pregunta: "Elige la opción correcta con el Sol: 'The sun ____ in the east.'",
        opciones: [
          { texto: "rise", correcta: false },
          { texto: "rises", correcta: true },
          { texto: "rising", correcta: false },
          { texto: "rised", correcta: false }
        ]
      },
      {
        pregunta: "Completa la oración: 'We ____ letters to our friends.'",
        opciones: [
          { texto: "writes", correcta: false },
          { texto: "write", correcta: true },
          { texto: "writing", correcta: false },
          { texto: "writed", correcta: false }
        ]
      }
    ],
    frasesPronunciacion: ["He works every day", "She runs in the park"]
  },
  {
    id: "2",
    titulo: "Present Continuous - Acciones en Progreso",
    estado: "inactiva",
    listaVocabulario: ["teaching", "learning", "eating", "sleeping", "coding"],
    imagenGramatica: PRESENT_CONTINUOUS_SVG,
    formulaGramatica: "Subject + am/is/are + Verb(-ing) + Complement",
    calentamiento: [
      { fraseMetaEn: "I am writing an essay", fraseMetaEs: "Estoy escribiendo un ensayo" },
      { fraseMetaEn: "They are learning English", fraseMetaEs: "Ellos están aprendiendo inglés" }
    ],
    evaluacion: [
      {
        pregunta: "Completa: 'My teacher ____ talking right now.'",
        opciones: [
          { texto: "is", correcta: true },
          { texto: "are", correcta: false },
          { texto: "am", correcta: false },
          { texto: "be", correcta: false }
        ]
      },
      {
        pregunta: "What are they doing? 'They ____ soccer in the yard.'",
        opciones: [
          { texto: "is playing", correcta: false },
          { texto: "playing", correcta: false },
          { texto: "are playing", correcta: true },
          { texto: "are play", correcta: false }
        ]
      },
      {
        pregunta: "Completa la oración: 'I ____ learning how to cook Chinese food.'",
        opciones: [
          { texto: "am", correcta: true },
          { texto: "is", correcta: false },
          { texto: "are", correcta: false },
          { texto: "be", correcta: false }
        ]
      },
      {
        pregunta: "Completa: 'They are ____ a fantastic new book.'",
        opciones: [
          { texto: "read", correcta: false },
          { texto: "reading", correcta: true },
          { texto: "reads", correcta: false },
          { texto: "readed", correcta: false }
        ]
      },
      {
        pregunta: "Elige la forma correcta: 'Look! She ____ in the pool.'",
        opciones: [
          { texto: "is swimming", correcta: true },
          { texto: "swimming", correcta: false },
          { texto: "are swimming", correcta: false },
          { texto: "swim", correcta: false }
        ]
      },
      {
        pregunta: "Completa: 'Listen! The baby ____ right now.'",
        opciones: [
          { texto: "is crying", correcta: true },
          { texto: "are crying", correcta: false },
          { texto: "crying", correcta: false },
          { texto: "cry", correcta: false }
        ]
      },
      {
        pregunta: "Completa la oración: 'We ____ watching a funny movie.'",
        opciones: [
          { texto: "is", correcta: false },
          { texto: "are", correcta: true },
          { texto: "am", correcta: false },
          { texto: "be", correcta: false }
        ]
      },
      {
        pregunta: "Selecciona el verbo correcto: 'He is ____ some orange juice.'",
        opciones: [
          { texto: "drink", correcta: false },
          { texto: "drinking", correcta: true },
          { texto: "drinks", correcta: false },
          { texto: "drank", correcta: false }
        ]
      },
      {
        pregunta: "Completa la pregunta: 'Why are you ____?'",
        opciones: [
          { texto: "runs", correcta: false },
          { texto: "running", correcta: true },
          { texto: "run", correcta: false },
          { texto: "ran", correcta: false }
        ]
      },
      {
        pregunta: "Completa: 'The students ____ studying for the exam.'",
        opciones: [
          { texto: "is", correcta: false },
          { texto: "are", correcta: true },
          { texto: "am", correcta: false },
          { texto: "was", correcta: false }
        ]
      }
    ],
    frasesPronunciacion: ["They are learning English", "I am writing an essay"]
  }
];

export const CALIFICACIONES_INICIALES: Calificacion[] = [];

// Helper functions for localStorage persistence of our global in-memory DB
export function getStoredLessons(): Leccion[] {
  const stored = localStorage.getItem("unajma_lessons");
  if (!stored) {
    localStorage.setItem("unajma_lessons", JSON.stringify(LECCIONES_INICIALES));
    return LECCIONES_INICIALES;
  }
  
  try {
    const parsed = JSON.parse(stored) as Leccion[];
    // Automatic migration to make sure we always have 10-questions lessons if user has outdated data
    const hasOldData = parsed.some(l => l.evaluacion.length < 10);
    if (hasOldData) {
      localStorage.setItem("unajma_lessons", JSON.stringify(LECCIONES_INICIALES));
      return LECCIONES_INICIALES;
    }
    return parsed;
  } catch (e) {
    localStorage.setItem("unajma_lessons", JSON.stringify(LECCIONES_INICIALES));
    return LECCIONES_INICIALES;
  }
}

export function saveStoredLessons(lessons: Leccion[]) {
  localStorage.setItem("unajma_lessons", JSON.stringify(lessons));
}

export function getStoredCalificaciones(): Calificacion[] {
  const stored = localStorage.getItem("unajma_grades");
  let list = CALIFICACIONES_INICIALES;
  if (stored) {
    try {
      list = JSON.parse(stored);
    } catch (e) {
      list = CALIFICACIONES_INICIALES;
    }
  }

  // Deduplicate: only keep the first occurrence of (estudiante + leccionId) which represents the most recent attempt
  // Also filter out any lingering mock history records that start with "hist_"
  const seen = new Set<string>();
  const deduplicated = list.filter((item) => {
    // Standardize IDs and guard against invalid entries
    if (!item || !item.estudiante || !item.leccionId) return false;
    if (item.id && String(item.id).startsWith("hist_")) return false;
    const key = `${item.estudiante}_${item.leccionId}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });

  // Persist the cleaned version back to storage
  if (deduplicated.length !== list.length) {
    localStorage.setItem("unajma_grades", JSON.stringify(deduplicated));
  }

  return deduplicated;
}

export function saveStoredCalificaciones(grades: Calificacion[]) {
  localStorage.setItem("unajma_grades", JSON.stringify(grades));
}
