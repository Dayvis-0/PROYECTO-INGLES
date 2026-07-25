import { useRef, useCallback } from "react";
import { isWordSimilarityMatch } from "../utils/similarity";
import { cleanCompare } from "../utils/cleaners";
import {
  isSpeechRecognitionSupported,
  createSpeechRecognition,
  getSpeechErrorMessage,
} from "../utils/speech";
import { useAppContext } from "../context/AppContext";

/** Type for SpeechRecognition (webkit prefix included) */
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

  const recognitionRef = useRef<SpeechRecognition | null>(null);

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

  /**
   * Compara un texto ingresado manualmente contra la frase objetivo
   * y asigna un puntaje de similitud (usado cuando la API de voz falla).
   */
  const checkManualInput = useCallback(
    (targetSentence: string, typedText: string) => {
      const tWords = cleanCompare(targetSentence)
        .split(" ")
        .filter(Boolean);
      const rWords = cleanCompare(typedText)
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
      setVoiceTranscript(typedText);
      setVoiceSimilarity(Math.min(pct, 100));
    },
    [setVoiceTranscript, setVoiceSimilarity]
  );

  const startVoiceRecording = useCallback(
    (targetSentence: string) => {
      // Abort any previous recognition session
      stopVoiceRecording();

      if (!isSpeechRecognitionSupported()) {
        setSpeechError(
          "La API de reconocimiento de voz no está soportada en tu navegador (usa Chrome, Edge o Safari). Escribí la frase manualmente abajo."
        );
        setIsListeningVoice(false);
        return;
      }

      try {
        setSpeechError(null);
        const rec = createSpeechRecognition();
        if (!rec) return;
        recognitionRef.current = rec;

        rec.onstart = () => {
          setIsListeningVoice(true);
          setVoiceTranscript("Escuchando... ¡Hablá ahora fuerte y claro en inglés!");
          setVoiceSimilarity(null);
        };

        rec.onresult = (event: SpeechRecognitionEvent) => {
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

        rec.onerror = (err: SpeechRecognitionErrorEvent) => {
          console.error("Speech Recognition Error", err);
          setIsListeningVoice(false);
          setSpeechError(getSpeechErrorMessage(err.error || "unknown"));
          // NO simular — el usuario escribe manualmente
        };

        rec.onend = () => {
          setIsListeningVoice(false);
        };

        rec.start();
      } catch (e) {
        console.error(e);
        setSpeechError(
          "No se pudo conectar con el servicio de voz. Escribí la frase manualmente abajo."
        );
        // NO simular — el usuario escribe manualmente
      }
    },
    [
      setIsListeningVoice,
      setVoiceTranscript,
      setVoiceSimilarity,
      setSpeechError,
      stopVoiceRecording,
    ]
  );

  return { recognitionRef, startVoiceRecording, stopVoiceRecording, checkManualInput };
}