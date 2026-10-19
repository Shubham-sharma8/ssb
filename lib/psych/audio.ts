"use client";

export type HallAudioCueKind =
  | "word-beep"
  | "page-turn"
  | "sheet-advance"
  | "observation"
  | "writing"
  | "completed";

declare global {
  interface Window {
    __SSB_BEEP_HISTORY__?: Array<{ kind: HallAudioCueKind; timestamp: number }>;
  }
}

export function playSsbHallBeep(
  kind: HallAudioCueKind,
  enabled = true
): void {
  if (typeof window === "undefined") return;

  if (!window.__SSB_BEEP_HISTORY__) {
    window.__SSB_BEEP_HISTORY__ = [];
  }
  window.__SSB_BEEP_HISTORY__.push({
    kind,
    timestamp: Date.now(),
  });

  if (!enabled) return;

  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (kind === "word-beep") {
      // Crisp 800Hz SSB Hall projector beep for next WAT word (15s interval)
      osc.type = "sine";
      osc.frequency.setValueAtTime(820, now);
      gain.gain.setValueAtTime(0.085, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
      osc.start(now);
      osc.stop(now + 0.16);
    } else if (kind === "page-turn") {
      // Distinct two-tone chime signaling 30s Booklet Page Turn after 20 words
      osc.type = "triangle";
      osc.frequency.setValueAtTime(540, now);
      osc.frequency.setValueAtTime(720, now + 0.15);
      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.36);
      osc.start(now);
      osc.stop(now + 0.36);
    } else if (kind === "sheet-advance" || kind === "observation") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(660, now);
      osc.frequency.setValueAtTime(880, now + 0.14);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
      osc.start(now);
      osc.stop(now + 0.32);
    } else if (kind === "writing") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(520, now);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.start(now);
      osc.stop(now + 0.22);
    } else {
      // Test completed bell
      osc.type = "sine";
      osc.frequency.setValueAtTime(740, now);
      osc.frequency.setValueAtTime(980, now + 0.18);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.start(now);
      osc.stop(now + 0.45);
    }
  } catch {
    // Ignore audio context autoplay restrictions
  }
}
