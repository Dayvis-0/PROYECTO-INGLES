/**
 * Text-To-Speech: plays pronunciation via server-side Google Translate proxy,
 * falls back to browser SpeechSynthesis API.
 */
export function speakWord(text: string): void {
  if (!text) return;
  const cleanText = text.trim();
  // Route through our Same-Origin custom server proxy which retrieves
  // premium voices safely without CORS and referrers blocking
  const ttsUrl = `/api/tts?text=${encodeURIComponent(cleanText)}`;

  const audio = new Audio(ttsUrl);
  // Play the natural stream from our back-end
  audio.play().catch((err) => {
    console.warn(
      "Could not play premium server-side TTS stream, falling back to offline SpeechSynthesis:",
      err
    );

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = "en-US";
      utterance.rate = 0.85;

      // Select high-quality native English voice to prevent fallback
      // Spanish system accent readouts
      const voices = window.speechSynthesis.getVoices();
      let selectedVoice = voices.find(
        (v) => v.lang === "en-US" && v.name.includes("Google")
      );
      if (!selectedVoice)
        selectedVoice = voices.find(
          (v) => v.lang === "en-US" && v.name.includes("Natural")
        );
      if (!selectedVoice)
        selectedVoice = voices.find((v) => v.lang === "en-US");
      if (!selectedVoice)
        selectedVoice = voices.find((v) => v.lang.startsWith("en-"));
      if (!selectedVoice)
        selectedVoice = voices.find((v) => v.lang.startsWith("en"));

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      window.speechSynthesis.speak(utterance);
    } else {
      console.warn("TTS not supported in this browser");
    }
  });
}
