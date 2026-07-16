/**
 * Browser SpeechRecognition API wrapper.
 * Pure functions — no React dependencies. Only uses browser APIs.
 */

/**
 * Check if the browser supports the Web Speech Recognition API.
 */
export function isSpeechRecognitionSupported(): boolean {
  return !!(
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition
  );
}

/**
 * Create a configured SpeechRecognition instance.
 * Returns null if the API is not supported in this browser.
 */
export function createSpeechRecognition(): any | null {
  const SpeechRecognition =
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) return null;

  const rec = new SpeechRecognition();
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
      return "El acceso al micrófono está restringido. Por favor, asegúrate de dar permisos en tu navegador ó haz clic en el botón 'Permitir'. Si estás en un iframe, abre en una ventana nueva.";
    case "no-speech":
      return "No se detectó sonido. Intenta hablar más alto o verifica la conexión de tu micrófono.";
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
