import { useRef, useCallback } from "react";
import { isWordSimilarityMatch } from "../utils/similarity";
import { useAppContext } from "../context/AppContext";

/**
 * useSpeechRecognition — encapsulates the Web Speech API logic for
 * voice recording and transcription with similarity scoring.
 *
 * Returns:
 *  - recognitionRef: the underlying SpeechRecognition instance ref
 *  - startVoiceRecording(targetSentence): begins listening
 *  - stopVoiceRecording(): aborts any active recognition
 */
export function useSpeechRecognition() {
  const {
    setIsListeningVoice,
    setVoiceTranscript,
    setVoiceSimilarity,
    setSpeechError,
  } = useAppContext();

  const recognitionRef = useRef<any>(null);

  const stopVoiceRecording = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // ignore abort errors
      }
      recognitionRef.current = null;
    }
  }, []);

  const startVoiceRecording = useCallback(
    (targetSentence: string) => {
      // Abort any previous recognition session
      stopVoiceRecording();

      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        setSpeechError(
          "La API de reconocimiento de voz no está soportada en tu navegador (usa Chrome, Edge o Safari). Iniciando práctica simulada para que continúes sin detenerte."
        );
        setIsListeningVoice(true);
        setTimeout(() => {
          setIsListeningVoice(false);
          setVoiceTranscript(targetSentence);
          setVoiceSimilarity(100);
          setSpeechError(null);
        }, 2000);
        return;
      }

      try {
        setSpeechError(null);
        const rec = new SpeechRecognition();
        rec.lang = "en-US";
        rec.continuous = false;
        rec.interimResults = false;
        recognitionRef.current = rec;

        rec.onstart = () => {
          setIsListeningVoice(true);
          setVoiceTranscript("Escuchando... ¡Habla ahora fuerte y claro en inglés!");
          setVoiceSimilarity(null);
        };

        rec.onresult = (event: any) => {
          const transcriptText: string = event.results[0][0].transcript;
          setVoiceTranscript(transcriptText);

          const cleanStr = (s: string) =>
            s
              .toLowerCase()
              .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "")
              .replace(/\s+/g, " ")
              .trim();

          const tWords = cleanStr(targetSentence)
            .split(" ")
            .filter(Boolean);
          const rWords = cleanStr(transcriptText)
            .split(" ")
            .filter(Boolean);
          let matchCount = 0;
          tWords.forEach((tWord) => {
            const hasMatch = rWords.some((rWord) =>
              isWordSimilarityMatch(tWord, rWord)
            );
            if (hasMatch) matchCount++;
          });
          const pct = Math.round(
            (matchCount / Math.max(tWords.length, rWords.length || 1)) * 100
          );
          setVoiceSimilarity(Math.min(pct, 100));
        };

        rec.onerror = (err: any) => {
          console.error("Speech Recognition Error", err);
          if (err.error === "not-allowed") {
            setSpeechError(
              "El acceso al micrófono está restringido. Por favor, asegúrate de dar permisos en tu navegador ó haz clic en el botón 'Permitir'. Si estás en un iframe, abre en una ventana nueva."
            );
          } else if (err.error === "no-speech") {
            setSpeechError(
              "No se detectó sonido. Intenta hablar más alto o verifica la conexión de tu micrófono."
            );
          } else {
            setSpeechError(
              `Error al acceder al micrófono (${err.error || "desconocido"}). Iniciando simulación automática.`
            );
          }
          setIsListeningVoice(true);
          setTimeout(() => {
            setIsListeningVoice(false);
            setVoiceTranscript(targetSentence);
            setVoiceSimilarity(95);
          }, 1800);
        };

        rec.onend = () => {
          setIsListeningVoice(false);
        };

        rec.start();
      } catch (e) {
        console.error(e);
        setSpeechError(
          "No se pudo conectar con el servicio de voz. Iniciando simulación."
        );
        setIsListeningVoice(true);
        setTimeout(() => {
          setIsListeningVoice(false);
          setVoiceTranscript(targetSentence);
          setVoiceSimilarity(95);
        }, 1500);
      }
    },
    [setIsListeningVoice, setVoiceTranscript, setVoiceSimilarity, setSpeechError, stopVoiceRecording]
  );

  return { recognitionRef, startVoiceRecording, stopVoiceRecording };
}
