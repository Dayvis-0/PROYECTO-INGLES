import { Leccion, GramaticaColumna, Calificacion } from "../types";
import { PRESENT_SIMPLE_SVG, PRESENT_CONTINUOUS_SVG } from "./svg";

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
