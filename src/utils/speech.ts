/**
 * Browser SpeechRecognition API wrapper.
 * Pure functions — no React dependencies. Only uses browser APIs.
 */

interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

interface WindowWithSpeechRecognition extends Window {
  SpeechRecognition: SpeechRecognitionConstructor;
  webkitSpeechRecognition: SpeechRecognitionConstructor;
}

const win = window as unknown as WindowWithSpeechRecognition;

/**
 * Check if the browser supports the Web Speech Recognition API.
 */
export function isSpeechRecognitionSupported(): boolean {
  return !!(win.SpeechRecognition || win.webkitSpeechRecognition);
}

/**
 * Create a configured SpeechRecognition instance.
 * Returns null if the API is not supported in this browser.
 */
export function createSpeechRecognition(): SpeechRecognition | null {
  const SpeechRecognitionCtor = win.SpeechRecognition || win.webkitSpeechRecognition;

  if (!SpeechRecognitionCtor) return null;

  const rec = new SpeechRecognitionCtor();
  rec.lang = "en-US";
  rec.continuous = false;
  rec.interimResults = false;
  return rec;
}

/**
 * Map SpeechRecognition error codes to user-friendly messages in Spanish.
 */
export function getSpeechErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case "not-allowed":
      return "El acceso al micrófono está restringido. Por favor, aseguráte de dar permisos en tu navegador o hacé clic en el botón 'Permitir'. Si estás en un iframe, abrí en una ventana nueva.";
    case "no-speech":
      return "No se detectó sonido. Intentá hablar más alto o verificá la conexión de tu micrófono.";
    default:
      return `Error al acceder al micrófono (${errorCode || "desconocido"}). Iniciando simulación automática.`;
  }
}

/**
 * Simulate a successful voice recognition result.
 * Used as fallback when the browser API is unavailable or fails.
 */
export function createSimulatedResult(
  targetSentence: string,
  similarity: number = 95
): { transcript: string; similarity: number } {
  return {
    transcript: targetSentence,
    similarity,
  };
}