import { describe, expect, it } from "vitest";
import { ControllableClock } from "@/lib/session/clock";
import {
  TatSessionStateMachine,
  type SessionTransitionEvent,
} from "@/lib/session/state-machine";
import type { SessionRecord } from "@/lib/validation/schemas";

function createTestSessionRecord(
  overrides: Partial<SessionRecord> = {}
): SessionRecord {
  const nowIso = new Date(1700000000000).toISOString();
  return {
    id: "sess-test-1",
    moduleId: "tat",
    setId: "set-tat-14",
    setTitle: "TAT Set 14",
    sourceId: "tat-pdf",
    selectionMode: "sequential",
    practiceMode: "realistic",
    includeCompleted: true,
    fullscreenRequested: false,
    observationDurationMs: 30_000,
    writingDurationMs: 240_000,
    stimulusIds: ["tat-pdf-p002", "tat-pdf-p004", "tat-pdf-p006"],
    canonicalNumbersMap: {
      "tat-pdf-p002": 1,
      "tat-pdf-p004": 2,
      "tat-pdf-p006": 3,
    },
    currentIndex: 0,
    phase: "READY",
    phaseStartedAtWall: null,
    phaseDeadlineWall: null,
    pausedRemainingMs: null,
    interruptedAtWall: null,
    interruptionReason: null,
    startedAt: nowIso,
    completedAt: null,
    updatedAt: nowIso,
    completedCount: 0,
    skippedCount: 0,
    interruptedCount: 0,
    ...overrides,
  };
}

describe("TAT Projection State Machine and Deterministic Timer Engine", () => {
  it("1-4. starts observation at 30s deadline, transitions to 4m writing, and advances through sequence", () => {
    const clock = new ControllableClock(1700000000000, 1000);
    const engine = new TatSessionStateMachine(createTestSessionRecord(), clock);

    // Start session -> OBSERVATION for picture 0
    const s1 = engine.startSession();
    expect(s1.phase).toBe("OBSERVATION");
    expect(s1.currentIndex).toBe(0);
    expect(engine.getRemainingMs()).toBe(30_000);
    expect(s1.phaseDeadlineWall).toBe(1700000000000 + 30_000);

    // Advance 29,999ms -> still in OBSERVATION with 1ms left
    clock.advance(29_999);
    engine.tick();
    expect(engine.getState().phase).toBe("OBSERVATION");
    expect(engine.getRemainingMs()).toBe(1);

    // Advance 1ms -> transitions automatically to WRITING (240,000ms)
    clock.advance(1);
    const s2 = engine.tick();
    expect(s2.phase).toBe("WRITING");
    expect(s2.currentIndex).toBe(0);
    expect(engine.getRemainingMs()).toBe(240_000);

    // Advance 4 minutes -> transitions automatically to picture 1 OBSERVATION
    clock.advance(240_000);
    const s3 = engine.tick();
    expect(s3.phase).toBe("OBSERVATION");
    expect(s3.currentIndex).toBe(1);
    expect(s3.completedCount).toBe(1);
    expect(engine.getRemainingMs()).toBe(30_000);
  });

  it("5. grants no extra time under irregular interval jitter", () => {
    const clock = new ControllableClock(1700000000000, 1000);
    const engine = new TatSessionStateMachine(createTestSessionRecord(), clock);
    engine.startSession();

    // Simulate irregular ticks (e.g. 1137ms, 980ms, 1420ms...) totaling 25,000ms
    const steps = [1137, 980, 1420, 3100, 8363, 10000];
    for (const delta of steps) {
      clock.advance(delta);
      engine.tick();
    }
    expect(engine.getRemainingMs()).toBe(5_000);
  });

  it("6 & 9. prevents duplicate transitions across React Strict Mode double-invocations and starts next picture only once", () => {
    const clock = new ControllableClock(1700000000000, 1000);
    const engine = new TatSessionStateMachine(createTestSessionRecord(), clock);
    const events: SessionTransitionEvent[] = [];
    engine.subscribe((_state, ev) => {
      if (ev) events.push(ev);
    });

    // Strict mode double-call to startSession()
    engine.startSession();
    engine.startSession();
    expect(events.filter((e) => e.type === "PHASE_STARTED")).toHaveLength(1);

    // Reach observation deadline and call tick() multiple times at exact deadline
    clock.advance(30_000);
    engine.tick();
    engine.tick();
    engine.tick();
    expect(engine.getState().phase).toBe("WRITING");
    expect(engine.getState().currentIndex).toBe(0);
    expect(
      events.filter((e) => e.type === "OBSERVATION_ELAPSED_TO_WRITING")
    ).toHaveLength(1);

    // Reach writing deadline and call tick() multiple times
    clock.advance(240_000);
    engine.tick();
    engine.tick();
    expect(engine.getState().phase).toBe("OBSERVATION");
    expect(engine.getState().currentIndex).toBe(1);
    expect(
      events.filter((e) => e.type === "WRITING_ELAPSED_ADVANCE")
    ).toHaveLength(1);
  });

  it("7. follows persisted wall-clock deadline on reload and marks expired reloads as INTERRUPTED", () => {
    const initialWall = 1700000000000;
    const clock = new ControllableClock(initialWall, 1000);
    const engine1 = new TatSessionStateMachine(
      createTestSessionRecord(),
      clock
    );
    engine1.startSession();

    // Advance 12 seconds into 30s observation, then simulate browser refresh
    clock.advance(12_000);
    const persistedMidObservation = {
      ...createTestSessionRecord(),
      ...engine1.toSessionRecordPatch(),
    };

    // Reload 3 seconds later -> 15 seconds remaining (must NOT reset to 30 seconds!)
    clock.advance(3_000);
    const engineReloadedActive = new TatSessionStateMachine(
      persistedMidObservation,
      clock
    );
    expect(engineReloadedActive.getState().phase).toBe("OBSERVATION");
    expect(engineReloadedActive.getRemainingMs()).toBe(15_000);

    // Now simulate closing tab for 40 seconds so deadline expired while closed
    clock.advance(40_000);
    const engineReloadedExpired = new TatSessionStateMachine(
      persistedMidObservation,
      clock
    );
    expect(engineReloadedExpired.getState().phase).toBe("INTERRUPTED");
    expect(engineReloadedExpired.getState().interruptedCount).toBe(1);

    // Recover by advancing elapsed observation phase -> moves into WRITING
    const recovered = engineReloadedExpired.recoverByAdvancingElapsedPhase();
    expect(recovered.phase).toBe("WRITING");
    expect(recovered.currentIndex).toBe(0);
  });

  it("8. reconciles hidden-tab suspension deterministically without granting extra time", () => {
    const clock = new ControllableClock(1700000000000, 1000);
    const engine = new TatSessionStateMachine(createTestSessionRecord(), clock);
    engine.startSession();

    // Simulate background tab where wall clock advances 20s while monotonic clock is throttled
    clock.advanceWallOnly(20_000);
    expect(engine.getRemainingMs()).toBe(10_000);

    // Simulate background tab where wall clock advances another 15s past the deadline
    clock.advanceWallOnly(15_000);
    const stateAfterVisible = engine.reconcileVisibilityChange(true);
    expect(stateAfterVisible.phase).toBe("WRITING");
  });

  it("10. transitions final picture to COMPLETED instead of looping", () => {
    const clock = new ControllableClock(1700000000000, 1000);
    const engine = new TatSessionStateMachine(
      createTestSessionRecord({
        stimulusIds: ["tat-pdf-p002", "tat-pdf-p004"],
      }),
      clock
    );

    engine.startSession();
    // Picture 1 observation + writing
    clock.advance(30_000);
    engine.tick();
    clock.advance(240_000);
    engine.tick();
    expect(engine.getState().currentIndex).toBe(1);
    expect(engine.getState().phase).toBe("OBSERVATION");

    // Picture 2 (final) observation + writing
    clock.advance(30_000);
    engine.tick();
    expect(engine.getState().phase).toBe("WRITING");

    clock.advance(240_000);
    const finalState = engine.tick();
    expect(finalState.phase).toBe("COMPLETED");
    expect(finalState.completedCount).toBe(2);
    expect(finalState.currentIndex).toBe(1);

    // Subsequent ticks remain COMPLETED and never loop back to index 0
    clock.advance(60_000);
    expect(engine.tick().phase).toBe("COMPLETED");
    expect(engine.getState().currentIndex).toBe(1);
  });
});
