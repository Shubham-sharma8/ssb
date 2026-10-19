/**
 * Shared SSB Testing Hall Utilities
 *
 * Consolidates Web Audio API beep cues, countdown timer formatting,
 * and anti-extraction DOM event handlers across TAT, WAT, SRT, SDT,
 * and Complete Psychological Test modules to minimize bundle size.
 */

export function playHallBeep(frequency = 880, durationMs = 140): void {
  if (typeof window === "undefined") return;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      ctx.currentTime + durationMs / 1000
    );
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + durationMs / 1000);
    setTimeout(() => {
      void ctx.close().catch(() => {});
    }, durationMs + 60);
  } catch {
    // Ignore audio context autoplay restrictions in headless/restricted browsers
  }
}

export function formatHallCountdown(ms: number): string {
  const totalSec = Math.max(0, Math.ceil(ms / 1000));
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export function preventStimulusExtraction(e: { preventDefault: () => void }): void {
  e.preventDefault();
}
