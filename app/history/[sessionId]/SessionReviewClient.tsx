"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Info,
  RotateCcw,
  Save,
} from "lucide-react";
import {
  getAllManifestOverrides,
  getSessionById,
  getStoriesForSession,
  saveStoryAndProgress,
} from "@/lib/storage/db";
import { getSlidesForSet, type ResolvedStimulus } from "@/lib/tat/catalog";
import {
  countCharacters,
  countWords,
  formatDurationSeconds,
} from "@/lib/utils";
import { AttemptedBookletExportCard } from "@/components/psych/AttemptedBookletExportCard";
import type {
  ManifestOverrideRecord,
  SessionRecord,
  StoryRecord,
  StorySelfReview,
} from "@/lib/validation/schemas";

const DEFAULT_CHECKLIST: StorySelfReview = {
  mainCharacterEstablished: false,
  plausibleSituation: false,
  concreteCourseOfAction: false,
  outcomeExplained: false,
  fitsPicture: false,
  improvementNotes: "",
  reviewedAt: null,
};

export default function SessionReviewClient() {
  const params = useParams<{ sessionId: string }>();
  const [sessionId, setSessionId] = useState<string>(() => {
    const raw = params?.sessionId ? decodeURIComponent(params.sessionId) : "";
    if (raw && raw !== "placeholder") return raw;
    if (typeof window !== "undefined") {
      const seg =
        window.location.pathname.split("/").filter(Boolean).pop() ?? "";
      if (seg && seg !== "history") {
        return decodeURIComponent(seg);
      }
    }
    return raw;
  });

  useEffect(() => {
    const raw = params?.sessionId ? decodeURIComponent(params.sessionId) : "";
    if (raw && raw !== "placeholder") {
      setSessionId(raw);
    } else if (typeof window !== "undefined") {
      const seg =
        window.location.pathname.split("/").filter(Boolean).pop() ?? "";
      if (seg && seg !== "history") {
        setSessionId(decodeURIComponent(seg));
      }
    }
  }, [params?.sessionId]);

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<SessionRecord | null>(null);
  const [stories, setStories] = useState<Record<string, StoryRecord>>({});
  const [overrides, setOverrides] = useState<ManifestOverrideRecord[]>([]);
  const [activeStimulusIndex, setActiveStimulusIndex] = useState<number>(0);

  // Editor & self-review state for the currently selected stimulus
  const [editedText, setEditedText] = useState<string>("");
  const [checklist, setChecklist] =
    useState<StorySelfReview>(DEFAULT_CHECKLIST);
  const [saveBanner, setSaveBanner] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    if (!sessionId || sessionId === "placeholder") {
      setLoading(false);
      return;
    }
    let mounted = true;
    async function load() {
      try {
        const [loadedSession, loadedStories, loadedOverrides] =
          await Promise.all([
            getSessionById(sessionId),
            getStoriesForSession(sessionId),
            getAllManifestOverrides(),
          ]);

        if (!mounted) return;
        setSession(loadedSession ?? null);
        setOverrides(loadedOverrides);

        const storyMap: Record<string, StoryRecord> = {};
        for (const s of loadedStories) {
          storyMap[s.stimulusId] = s;
        }
        setStories(storyMap);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    void load();
    return () => {
      mounted = false;
    };
  }, [sessionId]);

  const setStimuliMap = useMemo(() => {
    if (!session) return new Map<string, ResolvedStimulus>();
    const list = getSlidesForSet(session.setId, overrides);
    const map = new Map<string, ResolvedStimulus>();
    for (const item of list) {
      map.set(item.stimulusId, item);
    }
    return map;
  }, [session, overrides]);

  const activeStimulusId =
    session?.stimulusIds[activeStimulusIndex] ?? undefined;
  const activeStimulus = activeStimulusId
    ? setStimuliMap.get(activeStimulusId)
    : undefined;
  const activeStory = activeStimulusId ? stories[activeStimulusId] : undefined;

  useEffect(() => {
    if (!activeStimulusId || loading) return;
    const existing = stories[activeStimulusId];
    setEditedText(existing?.draftText ?? "");
    setChecklist(existing?.selfReview ?? DEFAULT_CHECKLIST);
    setSaveBanner(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStimulusId, loading]);

  const handleSaveReviewAndStory = async (markAsReviewed: boolean) => {
    if (!session || !activeStimulusId) return;
    setSaving(true);
    setSaveBanner(null);

    const nowIso = new Date().toISOString();
    const existing = stories[activeStimulusId];
    const trimmed = editedText.trim();
    const canonicalNum =
      activeStimulus?.canonicalNumber ??
      session.canonicalNumbersMap[activeStimulusId] ??
      existing?.canonicalNumber ??
      activeStimulusIndex + 1;

    try {
      const updatedStory = await saveStoryAndProgress({
        sessionId: session.id,
        stimulusId: activeStimulusId,
        canonicalNumber: canonicalNum,
        sessionPosition: activeStimulusIndex + 1,
        draftText: editedText,
        completionStatus: markAsReviewed
          ? "reviewed"
          : trimmed.length > 0
          ? "completed"
          : existing?.completionStatus ?? "skipped",
        selfReview: {
          ...checklist,
          reviewedAt: markAsReviewed ? nowIso : checklist.reviewedAt,
        },
      });

      setStories((prev) => ({
        ...prev,
        [activeStimulusId]: updatedStory,
      }));
      setSaveBanner(
        markAsReviewed
          ? "Saved story edits & self-review reflection."
          : "Saved post-session story changes."
      );
    } catch (err) {
      setSaveBanner(
        err instanceof Error ? err.message : "Failed to save changes."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 text-center text-sm text-zinc-500">
        Loading session review...
      </div>
    );
  }

  if (!session) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Session Not Found
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          The requested session could not be found in local storage.
        </p>
        <Link
          href="/history"
          className="mt-6 inline-flex items-center gap-2 rounded-md bg-zinc-900 px-4 py-2 text-xs font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Session History</span>
        </Link>
      </div>
    );
  }

  const obsSeconds = Math.round(session.observationDurationMs / 1000);
  const writeSeconds = Math.round(session.writingDurationMs / 1000);
  const currentCanonicalNum =
    activeStimulus?.canonicalNumber ??
    (activeStimulusId
      ? session.canonicalNumbersMap[activeStimulusId]
      : undefined) ??
    activeStimulusIndex + 1;
  const isBlankSlide =
    currentCanonicalNum === 12 || activeStimulusId?.endsWith("-blank");

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8 sm:px-6">
      {/* Top breadcrumb and header */}
      <div className="mb-6 flex flex-col justify-between gap-4 border-b border-zinc-200 pb-5 dark:border-zinc-800 sm:flex-row sm:items-center">
        <div>
          <Link
            href="/history"
            className="mb-2 inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Session History</span>
          </Link>
          <h1
            data-testid="review-session-title"
            className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-2xl"
          >
            Review: {session.setTitle}
          </h1>
          <p className="mt-1 text-xs text-zinc-500">
            Started {new Date(session.startedAt).toLocaleString()} •{" "}
            {session.stimulusIds.length} slides in sequence •{" "}
            {session.practiceMode === "realistic"
              ? "Real SSB Mode"
              : "Practice Mode"}
          </p>
        </div>

        {activeStimulusId && !isBlankSlide && (
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/tat?setId=${encodeURIComponent(
                session.setId
              )}&subset=selected&stimulusId=${encodeURIComponent(
                activeStimulusId
              )}`}
              data-testid="repeat-stimulus-button"
              className="inline-flex items-center gap-2 rounded-md border border-zinc-300 bg-white px-3.5 py-2 text-xs font-medium text-zinc-800 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Practice This Picture Again</span>
            </Link>
          </div>
        )}
      </div>

      {/* Export Attempted Question Booklet PDF + AI Evaluation Prompt */}
      <div className="mb-6">
        <AttemptedBookletExportCard
          data={{
            title: `TAT Question Booklet — ${session.setTitle}`,
            subtitle: `${session.stimulusIds.length} TAT Slides (${obsSeconds}s observation + ${writeSeconds}s writing per slide)`,
            startedAtIso: session.startedAt,
            completedAtIso: session.completedAt ?? session.updatedAt,
            tat: {
              setLabel: session.setTitle,
              slides: session.stimulusIds.map((stimId, idx) => {
                const stim = setStimuliMap.get(stimId);
                const num =
                  stim?.canonicalNumber ??
                  session.canonicalNumbersMap[stimId] ??
                  idx + 1;
                return {
                  number: num,
                  stimulusId: stimId,
                  assetPath:
                    stim?.setFolderAssetPath ||
                    stim?.assetPath ||
                    "/tat-assets/blank-slide.webp",
                  isBlankSlide:
                    Boolean(stim?.isBlankSlide) ||
                    num === 12 ||
                    stimId.endsWith("-blank"),
                  description: stim?.description,
                };
              }),
            },
          }}
        />
      </div>

      {/* Horizontal sequence selector */}
      <div className="mb-6">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Session Sequence Order (Click to inspect slide & story)
        </div>
        <div
          className="flex overflow-x-auto no-scrollbar sm:flex-wrap gap-1.5 pb-1"
          data-testid="review-stimulus-tabs"
        >
          {session.stimulusIds.map((stimId, idx) => {
            const stim = setStimuliMap.get(stimId);
            const story = stories[stimId];
            const isSelected = idx === activeStimulusIndex;
            const status = story?.completionStatus ?? "not_attempted";
            const canonicalNum =
              stim?.canonicalNumber ??
              session.canonicalNumbersMap[stimId] ??
              idx + 1;

            return (
              <button
                key={stimId}
                type="button"
                data-testid={`review-tab-${idx + 1}`}
                onClick={() => setActiveStimulusIndex(idx)}
                className={`flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-medium transition shrink-0 ${
                  isSelected
                    ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                    : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
                }`}
              >
                <span className="font-mono text-[11px] opacity-70">
                  #{idx + 1}
                </span>
                <span>
                  {canonicalNum === 12
                    ? "Slide 12 (Blank)"
                    : `Picture ${canonicalNum}`}
                </span>
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    status === "reviewed"
                      ? "bg-sky-500"
                      : status === "completed"
                      ? "bg-emerald-500"
                      : status === "in_progress"
                      ? "bg-amber-500"
                      : "bg-zinc-400"
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Two-Column Review Workspace */}
      {activeStimulusId && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column: Original Picture Stimulus & Metadata */}
          <div className="space-y-4 lg:col-span-5">
            <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
                <div>
                  <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    Session Position #{activeStimulusIndex + 1} •{" "}
                    {isBlankSlide
                      ? "Slide 12 (Blank Slide)"
                      : `Canonical Picture ${currentCanonicalNum}`}
                  </span>
                </div>
                <span className="rounded border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[11px] text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                  {activeStory?.completionStatus === "reviewed"
                    ? "Reviewed"
                    : activeStory?.completionStatus === "completed"
                    ? "Completed"
                    : activeStory?.completionStatus === "skipped"
                    ? "Skipped"
                    : activeStory?.completionStatus === "in_progress"
                    ? "In Progress"
                    : "Not Attempted"}
                </span>
              </div>

              <div className="flex min-h-[220px] sm:min-h-[260px] items-center justify-center bg-zinc-950 p-3 sm:p-4">
                {isBlankSlide ? (
                  <div className="flex h-44 w-60 flex-col items-center justify-center rounded border border-zinc-300 bg-white p-4 text-center text-zinc-900">
                    <p className="text-xs font-semibold uppercase tracking-wider">
                      12. BLANK SLIDE
                    </p>
                    <p className="mt-1 text-[11px] text-zinc-500">
                      Self-chosen situation & story
                    </p>
                  </div>
                ) : activeStimulus?.assetPath ? (
                  <img
                    src={
                      activeStimulus.setFolderAssetPath ??
                      activeStimulus.assetPath
                    }
                    alt={`SSB TAT Canonical Picture ${activeStimulus.canonicalNumber} Review`}
                    width={640}
                    height={480}
                    decoding="async"
                    loading="lazy"
                    className="max-h-[300px] sm:max-h-[360px] w-auto rounded object-contain"
                  />
                ) : (
                  <div className="text-xs text-zinc-500">
                    Stimulus preview unavailable
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 divide-x divide-zinc-200 border-t border-zinc-200 bg-zinc-50 text-center text-xs dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">
                <div className="p-2.5">
                  <div className="text-[11px] text-zinc-500">Observation</div>
                  <div className="mt-0.5 font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                    {formatDurationSeconds(obsSeconds)}
                  </div>
                </div>
                <div className="p-2.5">
                  <div className="text-[11px] text-zinc-500">
                    Writing Window
                  </div>
                  <div className="mt-0.5 font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                    {formatDurationSeconds(writeSeconds)}
                  </div>
                </div>
                <div className="p-2.5">
                  <div className="text-[11px] text-zinc-500">Word Count</div>
                  <div className="mt-0.5 font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                    {countWords(editedText)} words
                  </div>
                </div>
              </div>
            </div>

            {/* Grounded Non-Deceptive Guidance Notice */}
            <div className="rounded-lg border border-zinc-200 bg-white p-4 text-xs text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
              <div className="mb-1 flex items-center gap-2 font-semibold text-zinc-900 dark:text-zinc-100">
                <Info className="h-4 w-4 text-zinc-500 shrink-0" />
                <span>Post-Test Self-Review</span>
              </div>
              <p className="leading-relaxed">
                If you wrote your story in your physical SSB Psychology Booklet
                during Real SSB Mode, look at your handwritten story alongside
                the picture above and use the checklist on the right to evaluate
                its structure. You can also transcribe or refine your story in
                the box if desired.
              </p>
            </div>
          </div>

          {/* Right Column: Post-Test Story Editor & Self-Review Checklist */}
          <div className="space-y-5 lg:col-span-7">
            {/* Story Text Editor */}
            <div className="rounded-lg border border-zinc-200 bg-white p-4 sm:p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-zinc-600 dark:text-zinc-400 shrink-0" />
                  <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    Story Notes / Transcription (Optional)
                  </h2>
                </div>
                <span className="font-mono text-xs text-zinc-500">
                  {countWords(editedText)} words •{" "}
                  {countCharacters(editedText)} chars
                </span>
              </div>

              <textarea
                data-testid="review-story-textarea"
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                rows={8}
                placeholder="If you wrote in your physical notebook during Real SSB Mode, you can optionally type or summarize your story here for digital archiving..."
                className="w-full rounded-md border border-zinc-300 bg-zinc-50 p-3.5 text-base sm:text-sm leading-relaxed text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              />
            </div>

            {/* Structured Self-Review Reflection Prompts */}
            <div className="rounded-lg border border-zinc-200 bg-white p-4 sm:p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-4 flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4 text-zinc-600 dark:text-zinc-400 shrink-0" />
                <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  SSB TAT Story Self-Review Checklist
                </h2>
              </div>

              <div className="space-y-2">
                {[
                  {
                    key: "mainCharacterEstablished" as const,
                    label:
                      "Did the story establish a clear main character (age, mood, role)?",
                  },
                  {
                    key: "plausibleSituation" as const,
                    label:
                      "Was the situation leading up to the scene plausible and realistic?",
                  },
                  {
                    key: "concreteCourseOfAction" as const,
                    label:
                      "Did the character take a concrete, systematic course of action?",
                  },
                  {
                    key: "outcomeExplained" as const,
                    label:
                      "Was the final outcome clearly explained and constructive?",
                  },
                  {
                    key: "fitsPicture" as const,
                    label:
                      "Did the story fit the visual stimulus without overcomplicating it?",
                  },
                ].map((item) => (
                  <label
                    key={item.key}
                    className="flex cursor-pointer items-start gap-3 rounded-md border border-zinc-200 bg-zinc-50/60 p-3 text-xs text-zinc-800 transition hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200"
                  >
                    <input
                      type="checkbox"
                      data-testid={`checklist-${item.key}`}
                      checked={Boolean(checklist[item.key])}
                      onChange={(e) =>
                        setChecklist((prev) => ({
                          ...prev,
                          [item.key]: e.target.checked,
                        }))
                      }
                      className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-zinc-900 shrink-0"
                    />
                    <span className="leading-relaxed">{item.label}</span>
                  </label>
                ))}
              </div>

              <div className="mt-4">
                <label
                  htmlFor="improvement-notes"
                  className="mb-1.5 block text-xs font-medium text-zinc-700 dark:text-zinc-300"
                >
                  What would you improve on the next attempt?
                </label>
                <textarea
                  id="improvement-notes"
                  data-testid="review-improvement-notes"
                  value={checklist.improvementNotes}
                  onChange={(e) =>
                    setChecklist((prev) => ({
                      ...prev,
                      improvementNotes: e.target.value,
                    }))
                  }
                  rows={3}
                  placeholder="E.g., Keep the past brief (1 sentence) and spend more lines on specific field actions..."
                  className="w-full rounded-md border border-zinc-300 bg-zinc-50 p-3 text-base sm:text-xs text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                />
              </div>

              {saveBanner && (
                <div
                  data-testid="review-save-banner"
                  className="mt-4 flex items-center gap-2 rounded-md border border-emerald-300 bg-emerald-50 px-3.5 py-2.5 text-xs text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{saveBanner}</span>
                </div>
              )}

              <div className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5">
                <button
                  type="button"
                  disabled={saving}
                  data-testid="save-story-edits-btn"
                  onClick={() => void handleSaveReviewAndStory(false)}
                  className="inline-flex items-center justify-center gap-1.5 rounded-md border border-zinc-300 bg-white px-4 py-2 text-xs font-medium text-zinc-800 transition hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>Save Story Edits</span>
                </button>

                <button
                  type="button"
                  disabled={saving}
                  data-testid="mark-reviewed-btn"
                  onClick={() => void handleSaveReviewAndStory(true)}
                  className="inline-flex items-center justify-center gap-1.5 rounded-md bg-zinc-900 px-4 py-2 text-xs font-medium text-white transition hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>Save & Mark Picture Reviewed</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
