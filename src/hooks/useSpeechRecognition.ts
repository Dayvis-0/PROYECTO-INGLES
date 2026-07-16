import { useRef, useCallback } from "react";
import { isWordSimilarityMatch } from "../utils/similarity";
import { cleanCompare } from "../utils/cleaners";
import {
  isSpeechRecognitionSupported,
  createSpeechRecognition,
  getSpeechErrorMessage,
  createSimulatedResult,
} from "../utils/speech";
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

  const runSimulation = useCallback(
    (targetSentence: string, delay: number, similarity: number = 95) => {
      setIsListeningVoice(true);
      setTimeout(() => {
        setIsListeningVoice(false);
        const result = createSimulatedResult(targetSentence, similarity);
        setVoiceTranscript(result.transcript);
        setVoiceSimilarity(result.similarity);
      }, delay);
    },
    [setIsListeningVoice, setVoiceTranscript, setVoiceSimilarity]
  );

  const startVoiceRecording = useCallback(
    (targetSentence: string) => {
      // Abort any previous recognition session
      stopVoiceRecording();

      if (!isSpeechRecognitionSupported()) {
        setSpeechError(
          "La API de reconocimiento de voz no está soportada en tu navegador (usa Chrome, Edge o Safari). Iniciando práctica simulada para que continúes sin detenerte."
        );
        runSimulation(targetSentence, 2000, 100);
        setTimeout(() => setSpeechError(null), 2500);
        return;
      }

      try {
        setSpeechError(null);
        const rec = createSpeechRecognition();
        if (!rec) return;
        recognitionRef.current = rec;

        rec.onstart = () => {
          setIsListeningVoice(true);
          setVoiceTranscript("Escuchando... ¡Habla ahora fuerte y claro en inglés!");
          setVoiceSimilarity(null);
        };

        rec.onresult = (event: any) => {
          const transcriptText: string = event.results[0][0].transcript;
          setVoiceTranscript(transcriptText);

          const tWords = cleanCompare(targetSentence)
            .split(" ")
            .filter(Boolean);
          const rWords = cleanCompare(transcriptText)
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
          setSpeechError(getSpeechErrorMessage(err.error || "unknown"));
          runSimulation(targetSentence, 1800);
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
        runSimulation(targetSentence, 1500);
      }
    },
    [
      setIsListeningVoice,
      setVoiceTranscript,
      setVoiceSimilarity,
      setSpeechError,
      stopVoiceRecording,
      runSimulation,
    ]
  );

  return { recognitionRef, startVoiceRecording, stopVoiceRecording };
}
