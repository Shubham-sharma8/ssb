import { z } from "zod";

export const PageTypeSchema = z.enum([
  "picture",
  "title",
  "blank",
  "instruction",
  "stop-writing",
  "duplicate",
  "needs-review",
]);
export type PageType = z.infer<typeof PageTypeSchema>;

export const ReviewStatusSchema = z.enum([
  "approved",
  "needs-review",
  "rejected",
]);
export type ReviewStatus = z.infer<typeof ReviewStatusSchema>;

export const ConfidenceLevelSchema = z.enum(["high", "medium", "low"]);
export type ConfidenceLevel = z.infer<typeof ConfidenceLevelSchema>;

export const StimulusCompletionStatusSchema = z.enum([
  "not_attempted",
  "in_progress",
  "completed",
  "skipped",
  "reviewed",
]);
export type StimulusCompletionStatus = z.infer<
  typeof StimulusCompletionStatusSchema
>;

export const SessionPhaseSchema = z.enum([
  "READY",
  "OBSERVATION",
  "WRITING",
  "ADVANCING",
  "COMPLETED",
  "PAUSED",
  "INTERRUPTED",
]);
export type SessionPhase = z.infer<typeof SessionPhaseSchema>;

export const SelectionModeSchema = z.enum([
  "sequential",
  "random",
  "selected",
]);
export type SelectionMode = z.infer<typeof SelectionModeSchema>;

export const PracticeModeSchema = z.enum(["realistic", "practice"]);
export type PracticeMode = z.infer<typeof PracticeModeSchema>;

export interface ManifestSourceInfo {
  sourceId: string;
  sourceFilename: string;
  physicalPageCount: number;
  picturePageCount: number;
  nonPicturePageCount: number;
  notes: string;
}

export interface ManifestPageRecord {
  sourceId: string;
  sourceFilename: string;
  sourcePageNumber: number;
  pageType: PageType;
  sectionLabel: string | null;
  sourceSequence: number | null;
  sectionSequence: number | null;
  stimulusId: string | null;
  assetPath: string | null;
  originalAssetPath?: string | null;
  width?: number | null;
  height?: number | null;
  phash?: string | null;
  duplicateOf: string | null;
  crossSourceDuplicates?: string[];
  reviewStatus: ReviewStatus;
  confidence?: ConfidenceLevel;
  hasScanArtifacts?: boolean;
  ocrText?: string;
  description?: string;
  notes: string;
}

export interface TatManifestData {
  schemaVersion: number;
  generatedAt: string;
  sources: ManifestSourceInfo[];
  totalPhysicalPages: number;
  totalStimulusPages: number;
  pages: ManifestPageRecord[];
}

export interface PracticeSetRecord {
  id: string;
  title: string;
  shortTitle: string;
  sourceId: string;
  sourceFilename: string;
  sectionLabel: string | null;
  description: string;
  folderPath?: string;
  hasBlankSlide?: boolean;
  isApprovedDefault: boolean;
  includesUnverified: boolean;
  stimulusIds: string[];
}

export interface StimulusRecord {
  sourceId: string;
  sourceFilename: string;
  sourcePageNumber: number;
  pageType: PageType;
  sectionLabel: string | null;
  sourceSequence: number;
  sectionSequence: number;
  stimulusId: string;
  assetPath: string;
  setFolderAssetPath?: string;
  assignedSetId?: string;
  assignedSetTitle?: string;
  setSequenceNumber?: number;
  isBlankSlide?: boolean;
  originalAssetPath: string;
  width: number;
  height: number;
  phash: string;
  duplicateOf: string | null;
  crossSourceDuplicates: string[];
  reviewStatus: ReviewStatus;
  confidence: ConfidenceLevel;
  hasScanArtifacts: boolean;
  ocrText: string;
  description: string;
  notes: string;
}

export interface TatCatalogData {
  schemaVersion: number;
  generatedAt: string;
  sets: PracticeSetRecord[];
  stimuli: StimulusRecord[];
}

export const ManifestOverrideSchema = z.object({
  pageKey: z.string().min(1), // `${sourceId}:${sourcePageNumber}`
  sourceId: z.string().min(1),
  sourcePageNumber: z.number().int().positive(),
  pageType: PageTypeSchema,
  reviewStatus: ReviewStatusSchema,
  sectionLabel: z.string().nullable(),
  notes: z.string(),
  updatedAt: z.string(),
});
export type ManifestOverrideRecord = z.infer<typeof ManifestOverrideSchema>;

export const StorySelfReviewSchema = z.object({
  mainCharacterEstablished: z.boolean().nullable().default(null),
  plausibleSituation: z.boolean().nullable().default(null),
  concreteCourseOfAction: z.boolean().nullable().default(null),
  outcomeExplained: z.boolean().nullable().default(null),
  fitsPicture: z.boolean().nullable().default(null),
  improvementNotes: z.string().default(""),
  reviewedAt: z.string().nullable().default(null),
});
export type StorySelfReview = z.infer<typeof StorySelfReviewSchema>;

export const StoryRecordSchema = z.object({
  id: z.string().min(1), // compound `${sessionId}__${stimulusId}`
  sessionId: z.string().min(1),
  stimulusId: z.string().min(1),
  canonicalNumber: z.number().int().positive(),
  sessionPosition: z.number().int().positive(), // 1-based position in session
  draftText: z.string(),
  wordCount: z.number().int().nonnegative(),
  characterCount: z.number().int().nonnegative(),
  startedAt: z.string(),
  lastSavedAt: z.string(),
  completionStatus: StimulusCompletionStatusSchema,
  selfReview: StorySelfReviewSchema.nullable().default(null),
});
export type StoryRecord = z.infer<typeof StoryRecordSchema>;

export const WritingModeSchema = z.enum(["notebook", "digital"]);
export type WritingMode = z.infer<typeof WritingModeSchema>;

export const SessionRecordSchema = z.object({
  id: z.string().min(1),
  moduleId: z.string().default("tat"),
  setId: z.string().min(1),
  setTitle: z.string().min(1),
  sourceId: z.string().min(1),
  selectionMode: SelectionModeSchema,
  practiceMode: PracticeModeSchema,
  writingMode: WritingModeSchema.optional(),
  includeCompleted: z.boolean(),
  fullscreenRequested: z.boolean(),
  observationDurationMs: z.number().int().positive(),
  writingDurationMs: z.number().int().positive(),
  stimulusIds: z.array(z.string().min(1)).min(1),
  canonicalNumbersMap: z.record(z.string(), z.number().int().positive()),
  currentIndex: z.number().int().nonnegative(),
  phase: SessionPhaseSchema,
  phaseStartedAtWall: z.number().nullable(),
  phaseDeadlineWall: z.number().nullable(),
  pausedRemainingMs: z.number().nullable(),
  interruptedAtWall: z.number().nullable(),
  interruptionReason: z.string().nullable(),
  startedAt: z.string(),
  completedAt: z.string().nullable(),
  updatedAt: z.string(),
  completedCount: z.number().int().nonnegative(),
  skippedCount: z.number().int().nonnegative(),
  interruptedCount: z.number().int().nonnegative(),
});
export type SessionRecord = z.infer<typeof SessionRecordSchema>;

export const StimulusProgressRecordSchema = z.object({
  stimulusId: z.string().min(1),
  status: StimulusCompletionStatusSchema,
  attemptCount: z.number().int().nonnegative(),
  completedCount: z.number().int().nonnegative(),
  lastSessionId: z.string().nullable(),
  lastAttemptedAt: z.string().nullable(),
  lastReviewedAt: z.string().nullable(),
});
export type StimulusProgressRecord = z.infer<
  typeof StimulusProgressRecordSchema
>;

export const UserPreferencesSchema = z.object({
  theme: z.enum(["dark", "light"]).default("light"),
  writingMode: WritingModeSchema.default("notebook"),
  soundAlerts: z.boolean().default(true),
  defaultObservationSeconds: z.number().int().min(5).max(300).default(30),
  defaultWritingSeconds: z.number().int().min(15).max(1800).default(240),
  showWordCounter: z.boolean().default(true),
  fullscreenShortcut: z.string().default("f"),
  brandName: z.string().min(1).max(60).default("SSB Practice"),
  reduceMotion: z.boolean().default(false),
});
export type UserPreferences = z.infer<typeof UserPreferencesSchema>;

export const ExportBundleSchema = z.object({
  schemaVersion: z.literal(1),
  application: z.literal("ssb-simulator"),
  exportedAt: z.string(),
  preferences: UserPreferencesSchema.optional(),
  sessions: z.array(SessionRecordSchema),
  stories: z.array(StoryRecordSchema),
  stimulusProgress: z.array(StimulusProgressRecordSchema),
  manifestOverrides: z.array(ManifestOverrideSchema).optional().default([]),
});
export type ExportBundle = z.infer<typeof ExportBundleSchema>;

export const TatSetupFormSchema = z.object({
  setId: z.string().min(1, "Please select a source or practice set"),
  subsetMode: z.enum(["full", "selected"]),
  selectedStimulusIds: z.array(z.string()),
  selectionMode: z.enum(["sequential", "random"]),
  includeCompleted: z.boolean(),
  practiceMode: z.enum(["realistic", "practice"]),
  writingMode: WritingModeSchema.default("notebook"),
  fullscreenRequested: z.boolean(),
  observationSeconds: z.number().int().min(5).max(300),
  writingSeconds: z.number().int().min(15).max(1800),
});
export type TatSetupFormValues = z.infer<typeof TatSetupFormSchema>;

