import Dexie, { type Table } from "dexie";
import {
  ExportBundleSchema,
  type ExportBundle,
  type ManifestOverrideRecord,
  type SessionRecord,
  type StimulusCompletionStatus,
  type StimulusProgressRecord,
  type StoryRecord,
  type StorySelfReview,
} from "@/lib/validation/schemas";
import { countCharacters, countWords } from "@/lib/utils";
import { loadUserPreferences, saveUserPreferences } from "./preferences";

export class SSBDatabase extends Dexie {
  sessions!: Table<SessionRecord, string>;
  stories!: Table<StoryRecord, string>;
  stimulusProgress!: Table<StimulusProgressRecord, string>;
  manifestOverrides!: Table<ManifestOverrideRecord, string>;

  constructor(dbName = "SSBSimulatorDB") {
    super(dbName);

    // Version 1 schema with compound and secondary indices
    this.version(1).stores({
      sessions: "id, moduleId, setId, sourceId, phase, startedAt, updatedAt",
      stories:
        "id, sessionId, stimulusId, [sessionId+stimulusId], completionStatus, lastSavedAt",
      stimulusProgress: "stimulusId, status, lastAttemptedAt",
      manifestOverrides: "pageKey, sourceId, reviewStatus, updatedAt",
    });
  }
}

export const db = new SSBDatabase();

let simulatedStorageError: Error | null = null;

/**
 * Test hook to simulate IndexedDB write failures and verify that UI never reports false "Saved" states.
 */
export function setSimulatedStorageError(err: Error | null): void {
  simulatedStorageError = err;
}

function checkSimulatedError(): void {
  if (simulatedStorageError) {
    throw simulatedStorageError;
  }
  if (
    typeof window !== "undefined" &&
    (window as unknown as { __SSB_FORCE_STORAGE_ERROR__?: boolean })
      .__SSB_FORCE_STORAGE_ERROR__
  ) {
    throw new Error("Simulated IndexedDB persistence error");
  }
}

export function makeStoryId(sessionId: string, stimulusId: string): string {
  return `${sessionId}__${stimulusId}`;
}

export async function createSessionRecord(
  session: SessionRecord
): Promise<SessionRecord> {
  checkSimulatedError();
  await db.sessions.put(session);
  return session;
}

export async function updateSessionRecord(
  sessionId: string,
  patch: Partial<SessionRecord>
): Promise<SessionRecord | undefined> {
  checkSimulatedError();
  return db.transaction("rw", db.sessions, async () => {
    const existing = await db.sessions.get(sessionId);
    if (!existing) return undefined;
    const updated: SessionRecord = {
      ...existing,
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    await db.sessions.put(updated);
    return updated;
  });
}

export async function getSessionById(
  sessionId: string
): Promise<SessionRecord | undefined> {
  return db.sessions.get(sessionId);
}

export async function getAllSessions(): Promise<SessionRecord[]> {
  const all = await db.sessions.toArray();
  return all.sort(
    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
  );
}

export interface UpsertStoryInput {
  sessionId: string;
  stimulusId: string;
  canonicalNumber: number;
  sessionPosition: number;
  draftText: string;
  completionStatus: StimulusCompletionStatus;
  startedAt?: string;
  selfReview?: StorySelfReview | null;
}

/**
 * Transactionally saves a story record by compound key `${sessionId}__${stimulusId}`
 * and updates the corresponding `stimulusProgress` record.
 */
export async function saveStoryAndProgress(
  input: UpsertStoryInput
): Promise<StoryRecord> {
  checkSimulatedError();
  const storyId = makeStoryId(input.sessionId, input.stimulusId);
  const nowIso = new Date().toISOString();

  return db.transaction("rw", db.stories, db.stimulusProgress, async () => {
    const existingStory = await db.stories.get(storyId);
    const wordCount = countWords(input.draftText);
    const characterCount = countCharacters(input.draftText);

    const record: StoryRecord = {
      id: storyId,
      sessionId: input.sessionId,
      stimulusId: input.stimulusId,
      canonicalNumber: input.canonicalNumber,
      sessionPosition: input.sessionPosition,
      draftText: input.draftText,
      wordCount,
      characterCount,
      startedAt: existingStory?.startedAt ?? input.startedAt ?? nowIso,
      lastSavedAt: nowIso,
      completionStatus: input.completionStatus,
      selfReview:
        input.selfReview !== undefined
          ? input.selfReview
          : (existingStory?.selfReview ?? null),
    };

    await db.stories.put(record);

    const existingProg = await db.stimulusProgress.get(input.stimulusId);
    const isNewCompletion =
      input.completionStatus === "completed" &&
      existingStory?.completionStatus !== "completed";
    const isFirstAttemptInSession = !existingStory;

    // Never downgrade a previously completed/reviewed stimulus to skipped or not_attempted
    let nextStatus: StimulusCompletionStatus = input.completionStatus;
    if (existingProg) {
      if (
        existingProg.status === "reviewed" &&
        input.completionStatus !== "reviewed"
      ) {
        nextStatus = "reviewed";
      } else if (
        existingProg.status === "completed" &&
        (input.completionStatus === "in_progress" ||
          input.completionStatus === "skipped" ||
          input.completionStatus === "not_attempted")
      ) {
        nextStatus = "completed";
      }
    }

    const nextProgress: StimulusProgressRecord = {
      stimulusId: input.stimulusId,
      status: nextStatus,
      attemptCount:
        (existingProg?.attemptCount ?? 0) + (isFirstAttemptInSession ? 1 : 0),
      completedCount:
        (existingProg?.completedCount ?? 0) + (isNewCompletion ? 1 : 0),
      lastSessionId: input.sessionId,
      lastAttemptedAt: nowIso,
      lastReviewedAt:
        input.completionStatus === "reviewed"
          ? nowIso
          : (existingProg?.lastReviewedAt ?? null),
    };

    await db.stimulusProgress.put(nextProgress);
    return record;
  });
}

export async function getStoryForSessionStimulus(
  sessionId: string,
  stimulusId: string
): Promise<StoryRecord | undefined> {
  return db.stories.get(makeStoryId(sessionId, stimulusId));
}

export async function getStoriesForSession(
  sessionId: string
): Promise<StoryRecord[]> {
  const list = await db.stories.where("sessionId").equals(sessionId).toArray();
  return list.sort((a, b) => a.sessionPosition - b.sessionPosition);
}

export async function getStoriesForStimulus(
  stimulusId: string
): Promise<StoryRecord[]> {
  const list = await db.stories
    .where("stimulusId")
    .equals(stimulusId)
    .toArray();
  return list.sort(
    (a, b) =>
      new Date(b.lastSavedAt).getTime() - new Date(a.lastSavedAt).getTime()
  );
}

export async function getAllStories(): Promise<StoryRecord[]> {
  return db.stories.toArray();
}

export async function getAllStimulusProgress(): Promise<
  Record<string, StimulusProgressRecord>
> {
  const rows = await db.stimulusProgress.toArray();
  const map: Record<string, StimulusProgressRecord> = {};
  for (const r of rows) {
    map[r.stimulusId] = r;
  }
  return map;
}

export async function resetStimulusProgress(
  stimulusIds?: string[]
): Promise<void> {
  checkSimulatedError();
  if (!stimulusIds) {
    await db.stimulusProgress.clear();
  } else {
    await db.stimulusProgress.bulkDelete(stimulusIds);
  }
}

export async function saveManifestOverride(
  override: ManifestOverrideRecord
): Promise<ManifestOverrideRecord> {
  checkSimulatedError();
  await db.manifestOverrides.put(override);
  return override;
}

export async function deleteManifestOverride(pageKey: string): Promise<void> {
  checkSimulatedError();
  await db.manifestOverrides.delete(pageKey);
}

export async function getAllManifestOverrides(): Promise<
  ManifestOverrideRecord[]
> {
  return db.manifestOverrides.toArray();
}

export async function clearAllLocalData(): Promise<void> {
  checkSimulatedError();
  await db.transaction(
    "rw",
    db.sessions,
    db.stories,
    db.stimulusProgress,
    db.manifestOverrides,
    async () => {
      await db.sessions.clear();
      await db.stories.clear();
      await db.stimulusProgress.clear();
      await db.manifestOverrides.clear();
    }
  );
}

export async function exportAllPracticeData(): Promise<ExportBundle> {
  const [sessions, stories, stimulusProgress, manifestOverrides] =
    await Promise.all([
      db.sessions.toArray(),
      db.stories.toArray(),
      db.stimulusProgress.toArray(),
      db.manifestOverrides.toArray(),
    ]);

  const bundle: ExportBundle = {
    schemaVersion: 1,
    application: "ssb-simulator",
    exportedAt: new Date().toISOString(),
    preferences: loadUserPreferences(),
    sessions,
    stories,
    stimulusProgress,
    manifestOverrides,
  };

  return ExportBundleSchema.parse(bundle);
}

export interface ImportResult {
  importedSessions: number;
  skippedExistingSessions: number;
  importedStories: number;
  skippedExistingStories: number;
  importedProgress: number;
  importedOverrides: number;
}

/**
 * Validates and imports an ExportBundle JSON payload.
 * Rejects malformed or unsupported schemas.
 * Never overwrites existing records silently unless `overwriteExisting` is explicitly set to true.
 */
export async function importPracticeData(
  rawPayload: string | unknown,
  options: { overwriteExisting?: boolean } = {}
): Promise<ImportResult> {
  checkSimulatedError();

  let parsedJson: unknown = rawPayload;
  if (typeof rawPayload === "string") {
    try {
      parsedJson = JSON.parse(rawPayload);
    } catch {
      throw new Error("Invalid JSON file: could not parse JSON syntax.");
    }
  }

  const validation = ExportBundleSchema.safeParse(parsedJson);
  if (!validation.success) {
    const firstIssue = validation.error.issues[0];
    const pathStr = firstIssue ? firstIssue.path.join(".") : "root";
    throw new Error(
      `Unsupported or malformed export schema at "${pathStr}": ${
        firstIssue?.message ?? "validation failed"
      }`
    );
  }

  const bundle = validation.data;
  const overwrite = options.overwriteExisting === true;

  let importedSessions = 0;
  let skippedExistingSessions = 0;
  let importedStories = 0;
  let skippedExistingStories = 0;
  let importedProgress = 0;
  let importedOverrides = 0;

  await db.transaction(
    "rw",
    db.sessions,
    db.stories,
    db.stimulusProgress,
    db.manifestOverrides,
    async () => {
      for (const session of bundle.sessions) {
        const exists = await db.sessions.get(session.id);
        if (exists && !overwrite) {
          skippedExistingSessions++;
        } else {
          await db.sessions.put(session);
          importedSessions++;
        }
      }

      for (const story of bundle.stories) {
        const exists = await db.stories.get(story.id);
        if (exists && !overwrite) {
          skippedExistingStories++;
        } else {
          await db.stories.put(story);
          importedStories++;
        }
      }

      for (const prog of bundle.stimulusProgress) {
        const exists = await db.stimulusProgress.get(prog.stimulusId);
        if (!exists || overwrite) {
          await db.stimulusProgress.put(prog);
          importedProgress++;
        }
      }

      for (const ov of bundle.manifestOverrides ?? []) {
        const exists = await db.manifestOverrides.get(ov.pageKey);
        if (!exists || overwrite) {
          await db.manifestOverrides.put(ov);
          importedOverrides++;
        }
      }
    }
  );

  if (bundle.preferences && overwrite) {
    saveUserPreferences(bundle.preferences);
  }

  return {
    importedSessions,
    skippedExistingSessions,
    importedStories,
    skippedExistingStories,
    importedProgress,
    importedOverrides,
  };
}

export interface DashboardStatistics {
  unfinishedSessions: SessionRecord[];
  recentCompletedSessions: SessionRecord[];
  totalSessionsCount: number;
  completedSessionsCount: number;
  interruptedSessionsCount: number;
  totalCatalogStimuli: number;
  completedStimuliCount: number;
  reviewedStimuliCount: number;
  inProgressStimuliCount: number;
  skippedStimuliCount: number;
  remainingStimuliCount: number;
  totalStoriesWritten: number;
  totalWordsWritten: number;
  practiceStreakDays: number;
}

function toLocalDateKey(isoString: string): string {
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Computes real practice streak in consecutive days ending today or yesterday,
 * based strictly on actual saved story/session timestamps.
 */
export function computePracticeStreakDays(
  activityDatesIso: string[],
  nowDate: Date = new Date()
): number {
  const dateKeys = new Set<string>();
  for (const iso of activityDatesIso) {
    const key = toLocalDateKey(iso);
    if (key) dateKeys.add(key);
  }
  if (dateKeys.size === 0) return 0;

  const cursor = new Date(
    nowDate.getFullYear(),
    nowDate.getMonth(),
    nowDate.getDate()
  );
  const todayKey = toLocalDateKey(cursor.toISOString());

  if (!dateKeys.has(todayKey)) {
    // Check yesterday
    cursor.setDate(cursor.getDate() - 1);
    const yesterdayKey = toLocalDateKey(cursor.toISOString());
    if (!dateKeys.has(yesterdayKey)) {
      return 0;
    }
  }

  let streak = 0;
  while (true) {
    const key = toLocalDateKey(cursor.toISOString());
    if (dateKeys.has(key)) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

export function computeDashboardStatistics(
  sessions: SessionRecord[],
  stories: StoryRecord[],
  progressMap: Record<string, StimulusProgressRecord>,
  totalCatalogStimuli: number,
  nowDate: Date = new Date()
): DashboardStatistics {
  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  const unfinishedSessions = sortedSessions.filter(
    (s) => s.phase !== "COMPLETED"
  );
  const completedSessions = sortedSessions.filter(
    (s) => s.phase === "COMPLETED"
  );
  const interruptedSessions = sortedSessions.filter(
    (s) => s.phase === "INTERRUPTED"
  );

  let completedStimuliCount = 0;
  let reviewedStimuliCount = 0;
  let inProgressStimuliCount = 0;
  let skippedStimuliCount = 0;

  for (const prog of Object.values(progressMap)) {
    if (prog.status === "completed") completedStimuliCount++;
    else if (prog.status === "reviewed") {
      reviewedStimuliCount++;
      completedStimuliCount++;
    } else if (prog.status === "in_progress") inProgressStimuliCount++;
    else if (prog.status === "skipped") skippedStimuliCount++;
  }

  const remainingStimuliCount = Math.max(
    0,
    totalCatalogStimuli - completedStimuliCount
  );

  const nonEmptyStories = stories.filter((s) => s.draftText.trim().length > 0);
  const totalStoriesWritten = nonEmptyStories.length;
  const totalWordsWritten = nonEmptyStories.reduce(
    (acc, s) => acc + s.wordCount,
    0
  );

  const activityDates: string[] = [
    ...nonEmptyStories.map((s) => s.lastSavedAt),
    ...completedSessions.map((s) => s.completedAt ?? s.updatedAt),
  ];

  const practiceStreakDays = computePracticeStreakDays(activityDates, nowDate);

  return {
    unfinishedSessions,
    recentCompletedSessions: completedSessions.slice(0, 8),
    totalSessionsCount: sessions.length,
    completedSessionsCount: completedSessions.length,
    interruptedSessionsCount: interruptedSessions.length,
    totalCatalogStimuli,
    completedStimuliCount,
    reviewedStimuliCount,
    inProgressStimuliCount,
    skippedStimuliCount,
    remainingStimuliCount,
    totalStoriesWritten,
    totalWordsWritten,
    practiceStreakDays,
  };
}
