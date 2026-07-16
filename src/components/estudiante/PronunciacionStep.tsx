import { useRef } from "react";
import { Volume2, Mic, MicOff } from "lucide-react";
import { speakWord } from "../../utils/tts";
import { isWordSimilarityMatch } from "../../utils/similarity";
import { useAppContext } from "../../context/AppContext";

export default function PronunciacionStep({ subIndex }: { subIndex: number }) {
  const {
    activeLesson,
    isListeningVoice, setIsListeningVoice,
    voiceTranscript, setVoiceTranscript,
    voiceSimilarity, setVoiceSimilarity,
    speechError, setSpeechError,
  } = useAppContext();

  const recognitionRef = useRef<any>(null);
  if (!activeLesson) return null;

  const phrases = activeLesson.frasesPronunciacion && activeLesson.frasesPronunciacion.length > 0
    ? activeLesson.frasesPronunciacion
    : [activeLesson.calentamiento[0]?.fraseMetaEn || "English is practical and beautiful"];
  const speechTarget = phrases[subIndex] || "English is practical and beautiful";

  const startVoiceRecording = (targetSentence: string) => {
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch (err) { console.warn("Error aborting previous recognition:", err); }
      recognitionRef.current = null;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechError("La API de reconocimiento de voz no está soportada en tu navegador (usa Chrome, Edge o Safari). Iniciando práctica simulada para que continúes sin detenerte.");
      setIsListeningVoice(true);
      setTimeout(() => { setIsListeningVoice(false); setVoiceTranscript(targetSentence); setVoiceSimilarity(100); setSpeechError(null); }, 2000);
      return;
    }

    try {
      setSpeechError(null);
      const rec = new SpeechRecognition();
      rec.lang = "en-US";
      rec.continuous = false;
      rec.interimResults = false;
      recognitionRef.current = rec;

      rec.onstart = () => { setIsListeningVoice(true); setVoiceTranscript("Escuchando... ¡Habla ahora fuerte y claro en inglés!"); setVoiceSimilarity(null); };

      rec.onresult = (event: any) => {
        const transcriptText: string = event.results[0][0].transcript;
        setVoiceTranscript(transcriptText);
        const cleanStr = (s: string) => s.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").replace(/\s+/g, " ").trim();
        const tWords = cleanStr(targetSentence).split(" ").filter(Boolean);
        const rWords = cleanStr(transcriptText).split(" ").filter(Boolean);
        let matchCount = 0;
        tWords.forEach((tWord) => { const hasMatch = rWords.some((rWord) => isWordSimilarityMatch(tWord, rWord)); if (hasMatch) matchCount++; });
        const pct = Math.round((matchCount / Math.max(tWords.length, rWords.length || 1)) * 100);
        setVoiceSimilarity(Math.min(pct, 100));
      };

      rec.onerror = (err: any) => {
        console.error("Speech Recognition Error", err);
        if (err.error === "not-allowed") {
          setSpeechError("El acceso al micrófono está restringido. Por favor, asegúrate de dar permisos en tu navegador ó haz clic en el botón 'Permitir'. Si estás en un iframe, abre en una ventana nueva.");
        } else if (err.error === "no-speech") {
          setSpeechError("No se detectó sonido. Intenta hablar más alto o verifica la conexión de tu micrófono.");
        } else {
          setSpeechError(`Error al acceder al micrófono (${err.error || "desconocido"}). Iniciando simulación automática.`);
        }
        setIsListeningVoice(true);
        setTimeout(() => { setIsListeningVoice(false); setVoiceTranscript(targetSentence); setVoiceSimilarity(95); }, 1800);
      };

      rec.onend = () => { setIsListeningVoice(false); };
      rec.start();
    } catch (e) {
      console.error(e);
      setSpeechError("No se pudo conectar con el servicio de voz. Iniciando simulación.");
      setIsListeningVoice(true);
      setTimeout(() => { setIsListeningVoice(false); setVoiceTranscript(targetSentence); setVoiceSimilarity(95); }, 1500);
    }
  };

  return (
    <div className="space-y-4 text-center w-full">
      <div className="space-y-1">
        <span className="text-[10px] font-extrabold uppercase text-[#1cb0f6] tracking-widest bg-sky-50 px-2 py-0.5 rounded">
          PASO 4 DE 5: PRÁCTICA DE PRONUNCIACIÓN (Frase {subIndex + 1} de {phrases.length})
        </span>
        <h4 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">Habla Frente al Micrófono Obtenido</h4>
        <p className="text-slate-500 text-xs font-bold max-w-md mx-auto">
          Toca el icono del parlante para escuchar el acento nativo, y presiona el micro de abajo para grabarte.
        </p>
      </div>

      <div className="max-w-2xl w-full mx-auto duo-card p-4 bg-slate-50 border-b-4 flex flex-col items-center justify-center space-y-2 rounded-xl shadow-sm">
        <div className="flex gap-2 justify-center items-center">
          <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#1cb0f6]">Frase Objetivo</span>
          <button onClick={() => speakWord(speechTarget)}
            className="text-sky-600 hover:bg-sky-200 p-1.5 rounded-full transition-colors bg-sky-100 cursor-pointer shadow-sm"
            title="Reproducir frase nativa"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
        <h3 className="text-xl md:text-2xl font-black text-slate-800 leading-tight tracking-wide text-center">
          &ldquo;{speechTarget}&rdquo;
        </h3>
      </div>

      <div className="max-w-2xl w-full mx-auto space-y-4">
        <div className="flex flex-col items-center justify-center space-y-3">
          <button onClick={() => startVoiceRecording(speechTarget)}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md border-2 border-white outline-none active:scale-95 ${
              isListeningVoice
                ? "bg-rose-600 hover:bg-rose-500 text-white animate-pulse shadow-rose-200"
                : "bg-sky-500 hover:bg-sky-400 text-white hover:shadow-lg hover:shadow-sky-100"
            }`}
          >
            {isListeningVoice ? <Mic className="w-8 h-8 fill-current" /> : <MicOff className="w-8 h-8 fill-current" />}
          </button>

          {isListeningVoice && (
            <div className="flex justify-center items-center gap-1.5 h-6 mt-1 bg-rose-50 px-3 py-1 rounded-full border border-rose-100">
              <span className="text-[10px] font-black text-rose-600 uppercase tracking-wider mr-1 animate-pulse">Grabando Voz:</span>
              <span className="w-1 bg-rose-500 rounded animate-bounce [animation-delay:0.1s]" style={{ height: "14px" }} />
              <span className="w-1 bg-pink-500 rounded animate-bounce [animation-delay:0.25s]" style={{ height: "22px" }} />
              <span className="w-1 bg-red-500 rounded animate-bounce [animation-delay:0.15s]" style={{ height: "10px" }} />
              <span className="w-1 bg-rose-500 rounded animate-bounce [animation-delay:0.35s]" style={{ height: "18px" }} />
              <span className="w-1 bg-pink-500 rounded animate-bounce [animation-delay:0.2s]" style={{ height: "12px" }} />
            </div>
          )}
        </div>

        {isListeningVoice ? (
          <p className="text-rose-600 font-extrabold text-xs animate-pulse">¡Escuchando tu pronunciación en inglés... Habla ahora! 🎙️</p>
        ) : (
          <p className="text-slate-600 font-extrabold text-xs">Haz click en el micrófono circular azul para iniciar la grabación</p>
        )}

        {voiceTranscript && (
          <div className="bg-sky-50/70 p-4 rounded-xl border border-sky-100 max-w-md mx-auto space-y-2 shadow-sm">
            <span className="text-[10px] uppercase font-extrabold text-sky-600 tracking-wider block">Transcripción Escuchada:</span>
            <p className="text-base font-black text-sky-950 italic">&ldquo;{voiceTranscript}&rdquo;</p>
            {voiceSimilarity !== null && (
              <div className="mt-2 pt-2 border-t border-sky-200/40">
                <span className="text-[10px] uppercase font-extrabold text-slate-500 block">Precisión de Pronunciación</span>
                <div className="flex justify-center items-center gap-2 mt-1">
                  <span className={`text-2xl font-black ${voiceSimilarity >= 70 ? "text-emerald-600" : "text-rose-500"}`}>{voiceSimilarity}%</span>
                  <span className="text-xs text-slate-500 font-bold">de coincidencia con el patrón</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 font-bold">
                  {voiceSimilarity >= 70 ? "¡Excelente trabajo! Pronunciado como un nativo." : "¡Buen intento! Presiona de nuevo el micro para perfeccionarlo."}
                </p>
              </div>
            )}
          </div>
        )}

        {speechError && (
          <div className="text-[11px] bg-amber-50 text-amber-800 p-3 rounded-lg font-bold border border-amber-200 max-w-md mx-auto shadow-sm space-y-1">
            <p>{speechError}</p>
            <p className="text-[10px] text-amber-600 font-medium">
              Nota: El sistema simulará automáticamente un resultado correcto para que no te estanques si hay restricciones de hardware en este dispositivo.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
