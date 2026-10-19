export interface ClockSource {
  nowMono(): number;
  nowWall(): number;
  subscribe?(listener: () => void): () => void;
}

export interface BrowserTestClockController extends ClockSource {
  isTestClock: true;
  advance(ms: number): void;
  setWallTime(wallMs: number): void;
}

declare global {
  interface Window {
    __SSB_TEST_CLOCK__?: BrowserTestClockController;
    __SSB_ENABLE_TEST_CLOCK__?: (initialWallMs?: number) => BrowserTestClockController;
  }
}

const globalClockListeners = new Set<() => void>();

export class ControllableClock implements BrowserTestClockController {
  public readonly isTestClock = true as const;
  private monoMs: number;
  private wallMs: number;
  private listeners = new Set<() => void>();

  constructor(initialWallMs = Date.now(), initialMonoMs = 1000) {
    this.wallMs = initialWallMs;
    this.monoMs = initialMonoMs;
  }

  nowMono(): number {
    return this.monoMs;
  }

  nowWall(): number {
    return this.wallMs;
  }

  advance(ms: number): void {
    const delta = Math.max(0, ms);
    this.monoMs += delta;
    this.wallMs += delta;
    this.notify();
  }

  /**
   * Simulates browser tab suspension where wall clock advances more than monotonic performance.now()
   */
  advanceWallOnly(ms: number): void {
    const delta = Math.max(0, ms);
    this.wallMs += delta;
    this.notify();
  }

  setWallTime(wallMs: number): void {
    this.wallMs = wallMs;
    this.notify();
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    for (const listener of Array.from(this.listeners)) {
      listener();
    }
    for (const listener of Array.from(globalClockListeners)) {
      listener();
    }
  }
}

export const systemClock: ClockSource = {
  nowMono(): number {
    if (typeof window !== "undefined" && window.__SSB_TEST_CLOCK__) {
      return window.__SSB_TEST_CLOCK__.nowMono();
    }
    if (typeof performance !== "undefined" && typeof performance.now === "function") {
      return performance.now();
    }
    return Date.now();
  },
  nowWall(): number {
    if (typeof window !== "undefined" && window.__SSB_TEST_CLOCK__) {
      return window.__SSB_TEST_CLOCK__.nowWall();
    }
    return Date.now();
  },
  subscribe(listener: () => void): () => void {
    globalClockListeners.add(listener);
    const unsubTest =
      typeof window !== "undefined" && window.__SSB_TEST_CLOCK__?.subscribe
        ? window.__SSB_TEST_CLOCK__.subscribe(listener)
        : null;
    return () => {
      globalClockListeners.delete(listener);
      if (unsubTest) unsubTest();
    };
  },
};

export function installBrowserTestClockHelper(): void {
  if (typeof window === "undefined") return;
  if (!window.__SSB_ENABLE_TEST_CLOCK__) {
    window.__SSB_ENABLE_TEST_CLOCK__ = (initialWallMs?: number) => {
      if (window.__SSB_TEST_CLOCK__ && initialWallMs === undefined) {
        return window.__SSB_TEST_CLOCK__;
      }
      const initialMono =
        typeof performance !== "undefined" && typeof performance.now === "function"
          ? performance.now()
          : 1000;
      const ctrl = new ControllableClock(initialWallMs ?? Date.now(), initialMono);
      window.__SSB_TEST_CLOCK__ = ctrl;
      return ctrl;
    };
  }
}

if (typeof window !== "undefined") {
  installBrowserTestClockHelper();
}
