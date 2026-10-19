import type {
  PracticeMode,
  SelectionMode,
  SessionPhase,
  SessionRecord,
} from "@/lib/validation/schemas";
import { type ClockSource, systemClock } from "./clock";

export interface SessionEngineState {
  sessionId: string;
  phase: SessionPhase;
  currentIndex: number;
  stimulusIds: string[];
  canonicalNumbersMap: Record<string, number>;
  practiceMode: PracticeMode;
  selectionMode: SelectionMode;
  observationDurationMs: number;
  writingDurationMs: number;
  phaseStartedAtMono: number | null;
  phaseDeadlineMono: number | null;
  phaseStartedAtWall: number | null;
  phaseDeadlineWall: number | null;
  pausedRemainingMs: number | null;
  pausedFromPhase: "OBSERVATION" | "WRITING" | null;
  interruptedAtWall: number | null;
  interruptedFromPhase: "OBSERVATION" | "WRITING" | null;
  interruptionReason: string | null;
  completedCount: number;
  skippedCount: number;
  interruptedCount: number;
  /**
   * Monotonically increasing transition sequence token to guarantee idempotency
   * across React Strict Mode double-invocations and overlapping timer ticks.
   */
  processedTransitionTokens: Set<string>;
}

export type SessionTransitionEvent =
  | {
      type: "PHASE_STARTED";
      phase: "OBSERVATION" | "WRITING";
      stimulusId: string;
      index: number;
      deadlineWall: number;
    }
  | {
      type: "OBSERVATION_ELAPSED_TO_WRITING";
      stimulusId: string;
      index: number;
      deadlineWall: number;
    }
  | {
      type: "WRITING_ELAPSED_ADVANCE";
      completedStimulusId: string;
      completedIndex: number;
      nextStimulusId: string | null;
      nextIndex: number;
      nextPhase: "OBSERVATION" | "COMPLETED";
    }
  | {
      type: "SESSION_PAUSED";
      remainingMs: number;
      pausedFromPhase: "OBSERVATION" | "WRITING";
    }
  | {
      type: "SESSION_RESUMED";
      phase: "OBSERVATION" | "WRITING";
      deadlineWall: number;
    }
  | {
      type: "SESSION_INTERRUPTED";
      reason: string;
      interruptedFromPhase: "OBSERVATION" | "WRITING";
      stimulusId: string;
      index: number;
    }
  | {
      type: "SESSION_COMPLETED";
      completedAtWall: number;
    };

/**
 * Authoritative TAT Session State Machine.
 * - Uses monotonic time (`clock.nowMono()`) while active, reconciled against persisted wall-clock deadlines (`clock.nowWall()`).
 * - Guarantees idempotent transitions so React Strict Mode remounts or duplicate interval ticks never skip a phase or double-advance.
 * - Never grants extra time across reloads or tab suspensions.
 */
export class TatSessionStateMachine {
  private state: SessionEngineState;
  private clock: ClockSource;
  private listeners = new Set<
    (state: SessionEngineState, event?: SessionTransitionEvent) => void
  >();

  constructor(record: SessionRecord, clock: ClockSource = systemClock) {
    this.clock = clock;
    this.state = {
      sessionId: record.id,
      phase: record.phase,
      currentIndex: record.currentIndex,
      stimulusIds: [...record.stimulusIds],
      canonicalNumbersMap: { ...record.canonicalNumbersMap },
      practiceMode: record.practiceMode,
      selectionMode: record.selectionMode,
      observationDurationMs: record.observationDurationMs,
      writingDurationMs: record.writingDurationMs,
      phaseStartedAtMono: null,
      phaseDeadlineMono: null,
      phaseStartedAtWall: record.phaseStartedAtWall,
      phaseDeadlineWall: record.phaseDeadlineWall,
      pausedRemainingMs: record.pausedRemainingMs,
      pausedFromPhase: null,
      interruptedAtWall: record.interruptedAtWall,
      interruptedFromPhase: null,
      interruptionReason: record.interruptionReason,
      completedCount: record.completedCount,
      skippedCount: record.skippedCount,
      interruptedCount: record.interruptedCount,
      processedTransitionTokens: new Set<string>(),
    };

    // Reconcile initial state if loaded mid-phase from persisted storage
    this.reconcileOnLoad();
  }

  public getState(): SessionEngineState {
    return {
      ...this.state,
      stimulusIds: [...this.state.stimulusIds],
      canonicalNumbersMap: { ...this.state.canonicalNumbersMap },
      processedTransitionTokens: new Set(this.state.processedTransitionTokens),
    };
  }

  public getCurrentStimulusId(): string | null {
    return this.state.stimulusIds[this.state.currentIndex] ?? null;
  }

  public getCurrentCanonicalNumber(): number {
    const stimId = this.getCurrentStimulusId();
    if (!stimId) return this.state.currentIndex + 1;
    return (
      this.state.canonicalNumbersMap[stimId] ?? this.state.currentIndex + 1
    );
  }

  public subscribe(
    listener: (
      state: SessionEngineState,
      event?: SessionTransitionEvent
    ) => void
  ): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit(event?: SessionTransitionEvent): void {
    const snapshot = this.getState();
    for (const listener of Array.from(this.listeners)) {
      listener(snapshot, event);
    }
  }

  /**
   * Reconciles a persisted session when loaded after a refresh or browser reopen.
   * - If the persisted deadline is still in the future, resumes seamlessly with the exact remaining time (never granting extra time).
   * - If the persisted deadline already expired while the page was closed, marks the session as INTERRUPTED so the candidate can make a clear recovery decision.
   */
  private reconcileOnLoad(): void {
    const { phase, phaseDeadlineWall } = this.state;
    if (phase !== "OBSERVATION" && phase !== "WRITING") {
      return;
    }

    const nowWall = this.clock.nowWall();
    const nowMono = this.clock.nowMono();

    if (phaseDeadlineWall === null) {
      // No saved deadline; mark interrupted
      this.markInterrupted(
        phase,
        "Session reloaded without an active phase deadline."
      );
      return;
    }

    const remainingWallMs = phaseDeadlineWall - nowWall;
    if (remainingWallMs <= 0) {
      // Deadline passed while page was closed or suspended
      this.state.phase = "INTERRUPTED";
      this.state.interruptedAtWall = nowWall;
      this.state.interruptedFromPhase = phase;
      this.state.interruptionReason =
        phase === "OBSERVATION"
          ? "The 30-second observation deadline expired while the session was closed or suspended."
          : "The story-writing deadline expired while the session was closed or suspended.";
      this.state.interruptedCount += 1;
      this.state.phaseStartedAtMono = null;
      this.state.phaseDeadlineMono = null;
      return;
    }

    // Deadline is still in the future: anchor monotonic deadline to the exact remaining wall time
    const duration =
      phase === "OBSERVATION"
        ? this.state.observationDurationMs
        : this.state.writingDurationMs;
    const elapsedMs = Math.max(0, duration - remainingWallMs);
    this.state.phaseStartedAtMono = nowMono - elapsedMs;
    this.state.phaseDeadlineMono = nowMono + remainingWallMs;
  }

  /**
   * Starts the session from READY into OBSERVATION for picture index 0.
   * Idempotent: if already in OBSERVATION for index 0, does not reset the deadline.
   */
  public startSession(): SessionEngineState {
    if (this.state.phase !== "READY") {
      return this.getState();
    }

    const token = `START:0`;
    if (this.state.processedTransitionTokens.has(token)) {
      return this.getState();
    }
    this.state.processedTransitionTokens.add(token);

    this.enterObservationPhase(0);
    return this.getState();
  }

  private enterObservationPhase(index: number): void {
    const nowMono = this.clock.nowMono();
    const nowWall = this.clock.nowWall();
    const duration = this.state.observationDurationMs;

    this.state.currentIndex = index;
    this.state.phase = "OBSERVATION";
    this.state.phaseStartedAtMono = nowMono;
    this.state.phaseDeadlineMono = nowMono + duration;
    this.state.phaseStartedAtWall = nowWall;
    this.state.phaseDeadlineWall = nowWall + duration;
    this.state.pausedRemainingMs = null;
    this.state.pausedFromPhase = null;
    this.state.interruptedAtWall = null;
    this.state.interruptedFromPhase = null;
    this.state.interruptionReason = null;

    const stimId = this.state.stimulusIds[index];
    this.emit({
      type: "PHASE_STARTED",
      phase: "OBSERVATION",
      stimulusId: stimId,
      index,
      deadlineWall: this.state.phaseDeadlineWall,
    });
  }

  private enterWritingPhase(index: number, fromElapsedObservation: boolean): void {
    const nowMono = this.clock.nowMono();
    const nowWall = this.clock.nowWall();
    const duration = this.state.writingDurationMs;

    this.state.currentIndex = index;
    this.state.phase = "WRITING";
    this.state.phaseStartedAtMono = nowMono;
    this.state.phaseDeadlineMono = nowMono + duration;
    this.state.phaseStartedAtWall = nowWall;
    this.state.phaseDeadlineWall = nowWall + duration;
    this.state.pausedRemainingMs = null;
    this.state.pausedFromPhase = null;
    this.state.interruptedAtWall = null;
    this.state.interruptedFromPhase = null;
    this.state.interruptionReason = null;

    const stimId = this.state.stimulusIds[index];
    if (fromElapsedObservation) {
      this.emit({
        type: "OBSERVATION_ELAPSED_TO_WRITING",
        stimulusId: stimId,
        index,
        deadlineWall: this.state.phaseDeadlineWall,
      });
    } else {
      this.emit({
        type: "PHASE_STARTED",
        phase: "WRITING",
        stimulusId: stimId,
        index,
        deadlineWall: this.state.phaseDeadlineWall,
      });
    }
  }

  /**
   * Computes the remaining milliseconds in the current active phase.
   * Reconciles monotonic time with persisted wall-clock deadline to detect tab suspension/throttling.
   */
  public getRemainingMs(): number {
    const {
      phase,
      phaseDeadlineMono,
      phaseDeadlineWall,
      pausedRemainingMs,
    } = this.state;

    if (phase === "PAUSED") {
      return Math.max(0, pausedRemainingMs ?? 0);
    }

    if (phase !== "OBSERVATION" && phase !== "WRITING") {
      return 0;
    }

    const nowMono = this.clock.nowMono();
    const nowWall = this.clock.nowWall();

    const monoRemaining =
      phaseDeadlineMono !== null ? phaseDeadlineMono - nowMono : Infinity;
    const wallRemaining =
      phaseDeadlineWall !== null ? phaseDeadlineWall - nowWall : Infinity;

    // If wall clock indicates more time has elapsed than monotonic clock (e.g., background tab sleep),
    // resync monotonic deadline to wall clock so no extra time is ever granted.
    if (
      Number.isFinite(wallRemaining) &&
      Number.isFinite(monoRemaining) &&
      Math.abs(monoRemaining - wallRemaining) > 250
    ) {
      this.state.phaseDeadlineMono = nowMono + wallRemaining;
      return Math.max(0, wallRemaining);
    }

    const effective = Math.min(monoRemaining, wallRemaining);
    return Number.isFinite(effective) ? Math.max(0, effective) : 0;
  }

  /**
   * Evaluates whether the current phase deadline has been reached and performs an idempotent transition.
   * Safe to call from requestAnimationFrame, setInterval, visibilitychange, or tests.
   */
  public tick(): SessionEngineState {
    const { phase, currentIndex } = this.state;
    if (phase !== "OBSERVATION" && phase !== "WRITING") {
      return this.getState();
    }

    const remaining = this.getRemainingMs();
    if (remaining > 0) {
      return this.getState();
    }

    // Deadline reached! Ensure idempotent transition for (phase, currentIndex)
    const token = `ELAPSED:${phase}:${currentIndex}:${this.state.phaseStartedAtWall ?? 0}`;
    if (this.state.processedTransitionTokens.has(token)) {
      return this.getState();
    }
    this.state.processedTransitionTokens.add(token);

    if (phase === "OBSERVATION") {
      this.enterWritingPhase(currentIndex, true);
    } else if (phase === "WRITING") {
      this.advanceAfterWriting();
    }

    return this.getState();
  }

  /**
   * Handles visibility changes (e.g., returning from a hidden or backgrounded tab).
   * In realistic mode, if the deadline expired while the tab was hidden by a large margin (>5s),
   * or if it expired, reconciles deterministically.
   */
  public reconcileVisibilityChange(isVisible: boolean): SessionEngineState {
    if (!isVisible) return this.getState();

    const { phase, phaseDeadlineWall } = this.state;
    if (phase !== "OBSERVATION" && phase !== "WRITING") {
      return this.getState();
    }

    if (phaseDeadlineWall !== null) {
      const nowWall = this.clock.nowWall();
      const nowMono = this.clock.nowMono();
      const wallRemaining = phaseDeadlineWall - nowWall;
      this.state.phaseDeadlineMono = nowMono + wallRemaining;

      if (wallRemaining <= 0) {
        return this.tick();
      }
    }

    return this.getState();
  }

  private advanceAfterWriting(): void {
    const completedIndex = this.state.currentIndex;
    const completedStimulusId = this.state.stimulusIds[completedIndex];

    // Enter transient ADVANCING state before immediately entering next OBSERVATION or COMPLETED
    this.state.phase = "ADVANCING";
    this.state.completedCount += 1;

    const nextIndex = completedIndex + 1;
    if (nextIndex < this.state.stimulusIds.length) {
      const nextStimulusId = this.state.stimulusIds[nextIndex];
      this.emit({
        type: "WRITING_ELAPSED_ADVANCE",
        completedStimulusId,
        completedIndex,
        nextStimulusId,
        nextIndex,
        nextPhase: "OBSERVATION",
      });
      this.enterObservationPhase(nextIndex);
    } else {
      const nowWall = this.clock.nowWall();
      this.state.phase = "COMPLETED";
      this.state.phaseStartedAtMono = null;
      this.state.phaseDeadlineMono = null;
      this.state.phaseStartedAtWall = null;
      this.state.phaseDeadlineWall = null;

      this.emit({
        type: "WRITING_ELAPSED_ADVANCE",
        completedStimulusId,
        completedIndex,
        nextStimulusId: null,
        nextIndex: completedIndex,
        nextPhase: "COMPLETED",
      });
      this.emit({
        type: "SESSION_COMPLETED",
        completedAtWall: nowWall,
      });
    }
  }

  /**
   * Allows manual early completion of the current writing phase (when user explicitly confirms finishing early in practice mode or finishes writing).
   * Requires explicit confirmation in UI so no accidental keystroke skips a picture.
   */
  public finishCurrentWritingPhaseEarly(): SessionEngineState {
    if (this.state.phase !== "WRITING") {
      return this.getState();
    }
    const token = `EARLY_FINISH:WRITING:${this.state.currentIndex}:${this.state.phaseStartedAtWall ?? 0}`;
    if (this.state.processedTransitionTokens.has(token)) {
      return this.getState();
    }
    this.state.processedTransitionTokens.add(token);
    this.advanceAfterWriting();
    return this.getState();
  }

  /**
   * Immediately finishes the entire TAT session in-between at the current slide,
   * counting slides up to and including the active slide as attempted.
   */
  public finishSessionEarly(): SessionEngineState {
    if (this.state.phase === "COMPLETED") {
      return this.getState();
    }
    const nowWall = this.clock.nowWall();
    this.state.completedCount = Math.min(
      this.state.stimulusIds.length,
      this.state.currentIndex + 1
    );
    this.state.phase = "COMPLETED";
    this.state.phaseStartedAtMono = null;
    this.state.phaseDeadlineMono = null;
    this.state.phaseStartedAtWall = null;
    this.state.phaseDeadlineWall = null;
    this.state.pausedRemainingMs = null;
    this.state.pausedFromPhase = null;

    this.emit({
      type: "SESSION_COMPLETED",
      completedAtWall: nowWall,
    });
    return this.getState();
  }

  /**
   * Pauses the timer (only permitted when `practiceMode === "practice"`).
   * In `realistic` mode, pausing is strictly disabled.
   */
  public pause(): SessionEngineState {
    if (this.state.practiceMode !== "practice") {
      return this.getState();
    }
    if (
      this.state.phase !== "OBSERVATION" &&
      this.state.phase !== "WRITING"
    ) {
      return this.getState();
    }

    const fromPhase = this.state.phase;
    const remainingMs = this.getRemainingMs();

    this.state.phase = "PAUSED";
    this.state.pausedRemainingMs = remainingMs;
    this.state.pausedFromPhase = fromPhase;
    this.state.phaseDeadlineMono = null;
    this.state.phaseDeadlineWall = null;

    this.emit({
      type: "SESSION_PAUSED",
      remainingMs,
      pausedFromPhase: fromPhase,
    });

    return this.getState();
  }

  /**
   * Resumes a paused practice session with the exact remaining time.
   */
  public resume(): SessionEngineState {
    if (this.state.phase !== "PAUSED") {
      return this.getState();
    }

    const targetPhase = this.state.pausedFromPhase ?? "WRITING";
    const remainingMs = Math.max(100, this.state.pausedRemainingMs ?? 1000);
    const nowMono = this.clock.nowMono();
    const nowWall = this.clock.nowWall();

    this.state.phase = targetPhase;
    this.state.phaseStartedAtMono = nowMono;
    this.state.phaseDeadlineMono = nowMono + remainingMs;
    this.state.phaseStartedAtWall = nowWall;
    this.state.phaseDeadlineWall = nowWall + remainingMs;
    this.state.pausedRemainingMs = null;
    this.state.pausedFromPhase = null;

    this.emit({
      type: "SESSION_RESUMED",
      phase: targetPhase,
      deadlineWall: this.state.phaseDeadlineWall,
    });

    return this.getState();
  }

  public markInterrupted(
    fromPhase: "OBSERVATION" | "WRITING",
    reason: string
  ): SessionEngineState {
    const nowWall = this.clock.nowWall();
    this.state.phase = "INTERRUPTED";
    this.state.interruptedAtWall = nowWall;
    this.state.interruptedFromPhase = fromPhase;
    this.state.interruptionReason = reason;
    this.state.interruptedCount += 1;
    this.state.phaseDeadlineMono = null;
    this.state.phaseDeadlineWall = null;

    const stimId = this.getCurrentStimulusId() ?? "";
    this.emit({
      type: "SESSION_INTERRUPTED",
      reason,
      interruptedFromPhase: fromPhase,
      stimulusId: stimId,
      index: this.state.currentIndex,
    });

    return this.getState();
  }

  /**
   * Deterministic recovery action 1:
   * If interrupted because the observation deadline expired while closed, proceed into WRITING for the current picture.
   * If interrupted because the writing deadline expired while closed, commit the saved story and advance to the next picture (or complete).
   */
  public recoverByAdvancingElapsedPhase(): SessionEngineState {
    if (this.state.phase !== "INTERRUPTED") {
      return this.getState();
    }

    const fromPhase = this.state.interruptedFromPhase ?? "WRITING";
    if (fromPhase === "OBSERVATION") {
      this.enterWritingPhase(this.state.currentIndex, true);
    } else {
      this.advanceAfterWriting();
    }
    return this.getState();
  }

  /**
   * Deterministic recovery action 2:
   * Explicitly restart the current picture's 30s observation period (retaining the incremented `interruptedCount` for audit honesty).
   */
  public recoverByRestartingCurrentPicture(): SessionEngineState {
    if (this.state.phase !== "INTERRUPTED") {
      return this.getState();
    }
    this.enterObservationPhase(this.state.currentIndex);
    return this.getState();
  }

  /**
   * Produces a partial SessionRecord patch suitable for persisting to IndexedDB.
   */
  public toSessionRecordPatch(): Partial<SessionRecord> {
    return {
      currentIndex: this.state.currentIndex,
      phase: this.state.phase,
      phaseStartedAtWall: this.state.phaseStartedAtWall,
      phaseDeadlineWall: this.state.phaseDeadlineWall,
      pausedRemainingMs: this.state.pausedRemainingMs,
      interruptedAtWall: this.state.interruptedAtWall,
      interruptionReason: this.state.interruptionReason,
      completedCount: this.state.completedCount,
      skippedCount: this.state.skippedCount,
      interruptedCount: this.state.interruptedCount,
      completedAt:
        this.state.phase === "COMPLETED" ? new Date().toISOString() : null,
      updatedAt: new Date().toISOString(),
    };
  }
}
