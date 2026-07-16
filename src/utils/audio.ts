/**
 * Shared AudioContext singleton + utility tones.
 *
 * WHY a singleton?
 * Every `new AudioContext()` creates a separate audio processing graph that consumes
 * memory and CPU. Creating them in event handlers (hover, check answer) without closing
 * them causes a memory leak. This module creates ONE AudioContext and reuses it.
 */

let _audioCtx: AudioContext | null = null;

function getAudioCtx(): AudioContext {
  if (!_audioCtx) {
    _audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  // Resume if suspended (browser autoplay policy)
  if (_audioCtx.state === "suspended") {
    _audioCtx.resume();
  }
  return _audioCtx;
}

/**
 * Play a short sinusoidal tone.
 *
 * @param frequency - Pitch in Hz (e.g. 440 = A4)
 * @param volume    - Gain between 0 and 1 (typically 0.01–0.05)
 * @param duration  - Seconds before fade-out completes (e.g. 0.3)
 */
export function playTone(frequency: number, volume: number, duration: number): void {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Audio not available — silent
  }
}

/**
 * Close the shared AudioContext. Call on app unmount if desired, otherwise the
 * browser cleans it up on tab close.
 */
export function closeAudioContext(): void {
  if (_audioCtx) {
    _audioCtx.close();
    _audioCtx = null;
  }
}
