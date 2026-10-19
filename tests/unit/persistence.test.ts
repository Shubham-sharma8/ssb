import { beforeEach, describe, expect, it } from "vitest";
import {
  clearAllLocalData,
  createSessionRecord,
  exportAllPracticeData,
  getAllStimulusProgress,
  getSessionById,
  getStoriesForSession,
  getStoryForSessionStimulus,
  importPracticeData,
  saveStoryAndProgress,
  setSimulatedStorageError,
} from "@/lib/storage/db";
import { buildSessionSequence } from "@/lib/tat/catalog";
import type { SessionRecord } from "@/lib/validation/schemas";

function makeSampleSession(id = "sess-persist-1"): SessionRecord {
  const now = new Date().toISOString();
  return {
    id,
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
    stimulusIds: ["tat-pdf-p002", "tat-pdf-p004"],
    canonicalNumbersMap: { "tat-pdf-p002": 1, "tat-pdf-p004": 2 },
    currentIndex: 0,
    phase: "WRITING",
    phaseStartedAtWall: Date.now(),
    phaseDeadlineWall: Date.now() + 240_000,
    pausedRemainingMs: null,
    interruptedAtWall: null,
    interruptionReason: null,
    startedAt: now,
    completedAt: null,
    updatedAt: now,
    completedCount: 0,
    skippedCount: 0,
    interruptedCount: 0,
  };
}

describe("IndexedDB Persistence, Story Isolation, Repeatability, and Export/Import", () => {
  beforeEach(async () => {
    setSimulatedStorageError(null);
    await clearAllLocalData();
  });

  it("persists draft text across simulated refreshes and keeps stories strictly associated with the right picture", async () => {
    const session = makeSampleSession("sess-1");
    await createSessionRecord(session);

    await saveStoryAndProgress({
      sessionId: "sess-1",
      stimulusId: "tat-pdf-p002",
      canonicalNumber: 1,
      sessionPosition: 1,
      draftText: "Rohan noticed the flooding river near his village.",
      completionStatus: "in_progress",
    });

    await saveStoryAndProgress({
      sessionId: "sess-1",
      stimulusId: "tat-pdf-p004",
      canonicalNumber: 2,
      sessionPosition: 2,
      draftText: "Captain Arjun organized the mountain rescue party.",
      completionStatus: "completed",
    });

    const story1 = await getStoryForSessionStimulus("sess-1", "tat-pdf-p002");
    const story2 = await getStoryForSessionStimulus("sess-1", "tat-pdf-p004");

    expect(story1?.draftText).toBe(
      "Rohan noticed the flooding river near his village."
    );
    expect(story1?.stimulusId).toBe("tat-pdf-p002");
    expect(story1?.wordCount).toBe(8);

    expect(story2?.draftText).toBe(
      "Captain Arjun organized the mountain rescue party."
    );
    expect(story2?.stimulusId).toBe("tat-pdf-p004");
    expect(story2?.completionStatus).toBe("completed");
  });

  it("retains randomized session order in storage and allows repeating completed pictures", async () => {
    const built = buildSessionSequence({
      setId: "set-tat-14",
      selectionMode: "random",
      includeCompleted: true,
      rng: () => 0.25,
    });

    const randomSession = makeSampleSession("sess-random");
    randomSession.selectionMode = "random";
    randomSession.stimulusIds = built.stimulusIds;
    randomSession.canonicalNumbersMap = built.canonicalNumbersMap;
    await createSessionRecord(randomSession);

    const reloaded = await getSessionById("sess-random");
    expect(reloaded?.stimulusIds).toEqual(built.stimulusIds);
    expect(reloaded?.canonicalNumbersMap["tat-pdf-p008"]).toBe(4);

    // Mark tat-pdf-p002 completed in sess-random
    await saveStoryAndProgress({
      sessionId: "sess-random",
      stimulusId: "tat-pdf-p002",
      canonicalNumber: 1,
      sessionPosition: 1,
      draftText: "First completed attempt on picture 1.",
      completionStatus: "completed",
    });

    // Repeat tat-pdf-p002 in a second session when includeCompleted is true
    const repeatSeq = buildSessionSequence({
      setId: "set-tat-14",
      selectionMode: "sequential",
      includeCompleted: true,
      progressStatusByStimulusId: { "tat-pdf-p002": "completed" },
    });
    expect(repeatSeq.stimulusIds).toContain("tat-pdf-p002");

    await saveStoryAndProgress({
      sessionId: "sess-repeat-2",
      stimulusId: "tat-pdf-p002",
      canonicalNumber: 1,
      sessionPosition: 1,
      draftText: "Second completed attempt on picture 1.",
      completionStatus: "completed",
    });

    const progressMap = await getAllStimulusProgress();
    expect(progressMap["tat-pdf-p002"]?.completedCount).toBe(2);
    expect(progressMap["tat-pdf-p002"]?.attemptCount).toBe(2);
  });

  it("exports valid JSON bundles, rejects malformed imports without corrupting data, and prevents silent overwrites", async () => {
    const session = makeSampleSession("sess-export");
    await createSessionRecord(session);
    await saveStoryAndProgress({
      sessionId: "sess-export",
      stimulusId: "tat-pdf-p002",
      canonicalNumber: 1,
      sessionPosition: 1,
      draftText: "Original preserved story text.",
      completionStatus: "completed",
    });

    const exported = await exportAllPracticeData();
    expect(exported.sessions).toHaveLength(1);
    expect(exported.stories).toHaveLength(1);

    // Reject invalid JSON and invalid schema without corrupting existing records
    await expect(importPracticeData("{bad json")).rejects.toThrow(
      /Invalid JSON/i
    );
    await expect(
      importPracticeData({ schemaVersion: 999, application: "wrong" })
    ).rejects.toThrow(/Unsupported or malformed export schema/i);

    const stillIntact = await getStoriesForSession("sess-export");
    expect(stillIntact[0]?.draftText).toBe("Original preserved story text.");

    // Modify exported copy and import with overwriteExisting=false (default) -> must NOT overwrite existing story
    const modifiedBundle = structuredClone(exported);
    modifiedBundle.stories[0].draftText = "Modified text that should be skipped";

    const importRes = await importPracticeData(modifiedBundle, {
      overwriteExisting: false,
    });
    expect(importRes.skippedExistingStories).toBe(1);
    expect(importRes.importedStories).toBe(0);

    const afterSkippedOverwrite = await getStoriesForSession("sess-export");
    expect(afterSkippedOverwrite[0]?.draftText).toBe(
      "Original preserved story text."
    );

    // Clear DB and re-import -> restores everything cleanly
    await clearAllLocalData();
    const freshImport = await importPracticeData(JSON.stringify(exported));
    expect(freshImport.importedSessions).toBe(1);
    expect(freshImport.importedStories).toBe(1);

    const restoredStory = await getStoryForSessionStimulus(
      "sess-export",
      "tat-pdf-p002"
    );
    expect(restoredStory?.draftText).toBe("Original preserved story text.");
  });

  it("surfaces storage errors visibly and never silently succeeds when persistence fails", async () => {
    setSimulatedStorageError(new Error("QuotaExceededError: disk full"));

    await expect(
      saveStoryAndProgress({
        sessionId: "sess-err",
        stimulusId: "tat-pdf-p002",
        canonicalNumber: 1,
        sessionPosition: 1,
        draftText: "Should fail to save",
        completionStatus: "in_progress",
      })
    ).rejects.toThrow(/QuotaExceededError/);
  });
});
