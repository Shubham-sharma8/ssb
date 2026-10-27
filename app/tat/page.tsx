"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  BookOpen,
  Check,
  CheckSquare,
  Clock,
  Eye,
  Keyboard,
  Maximize2,
  Play,
  RotateCcw,
  ShieldCheck,
  Shuffle,
  Sliders,
  Square,
} from "lucide-react";
import {
  createSessionRecord,
  getAllManifestOverrides,
  getAllStimulusProgress,
  resetStimulusProgress,
} from "@/lib/storage/db";
import { loadUserPreferences } from "@/lib/storage/preferences";
import {
  buildSessionSequence,
  getPracticeSetById,
  getPracticeSets,
  getStimuliForSet,
  type ResolvedStimulus,
} from "@/lib/tat/catalog";
import { formatDurationSeconds, generateId } from "@/lib/utils";
import { ExamBriefingSlides } from "@/components/psych/ExamBriefingSlides";
import type {
  ManifestOverrideRecord,
  PracticeMode,
  SelectionMode,
  SessionRecord,
  StimulusCompletionStatus,
  StimulusProgressRecord,
  WritingMode,
} from "@/lib/validation/schemas";

const STATUS_BADGE_STYLES: Record<
  StimulusCompletionStatus,
  { label: string; className: string }
> = {
  not_attempted: {
    label: "Not Attempted",
    className:
      "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700",
  },
  in_progress: {
    label: "In Progress",
    className:
      "bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800",
  },
  completed: {
    label: "Completed",
    className:
      "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800",
  },
  skipped: {
    label: "Skipped",
    className:
      "bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800",
  },
  reviewed: {
    label: "Reviewed",
    className:
      "bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 border-zinc-300 dark:border-zinc-600",
  },
};

export default function TatSetupPage() {
  const router = useRouter();

  const sets = useMemo(() => getPracticeSets(), []);

  const [setId, setSetId] = useState<string>("set-1");
  const [subsetMode, setSubsetMode] = useState<"full" | "selected">("full");
  const [selectedStimulusIds, setSelectedStimulusIds] = useState<string[]>([]);
  const [initialStimulusParam, setInitialStimulusParam] = useState<string | null>(
    null
  );
  const [orderingMode, setOrderingMode] = useState<"sequential" | "random">(
    "sequential"
  );
  const [includeCompleted, setIncludeCompleted] = useState<boolean>(true);
  const [practiceMode, setPracticeMode] = useState<PracticeMode>("realistic");
  const [writingMode, setWritingMode] = useState<WritingMode>("notebook");
  const [fullscreenRequested, setFullscreenRequested] =
    useState<boolean>(false);

  // Default 30s observation, 4m (240s) story writing
  const [observationSeconds, setObservationSeconds] = useState<number>(30);
  const [writingSeconds, setWritingSeconds] = useState<number>(240);

  const [progressMap, setProgressMap] = useState<
    Record<string, StimulusProgressRecord>
  >({});
  const [overrides, setOverrides] = useState<ManifestOverrideRecord[]>([]);
  const [confirmResetOpen, setConfirmResetOpen] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [starting, setStarting] = useState<boolean>(false);
  const [showBriefing, setShowBriefing] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const querySet = params.get("setId") ?? params.get("set");
      const queryMode = params.get("mode");
      const querySubset = params.get("subset");
      const queryStimulus = params.get("stimulusId");

      if (querySet) {
        const found = getPracticeSetById(querySet);
        if (found) setSetId(found.id);
      }
      if (queryMode === "random") {
        setOrderingMode("random");
      } else if (queryMode === "realistic") {
        setPracticeMode("realistic");
      } else if (queryMode === "practice") {
        setPracticeMode("practice");
      }
      if (querySubset === "selected" || queryStimulus) {
        setSubsetMode("selected");
      }
      if (queryStimulus) {
        setInitialStimulusParam(queryStimulus);
        setSelectedStimulusIds([queryStimulus]);
      }
    }

    const prefs = loadUserPreferences();
    setObservationSeconds(prefs.defaultObservationSeconds);
    setWritingSeconds(prefs.defaultWritingSeconds);

    Promise.all([getAllStimulusProgress(), getAllManifestOverrides()]).then(
      ([prog, ov]) => {
        setProgressMap(prog);
        setOverrides(ov);
      }
    );
  }, []);

  const visibleSets = sets;

  const setStimuli: ResolvedStimulus[] = useMemo(
    () => getStimuliForSet(setId, overrides),
    [setId, overrides]
  );

  useEffect(() => {
    if (
      initialStimulusParam &&
      setStimuli.some((s) => s.stimulusId === initialStimulusParam)
    ) {
      setSelectedStimulusIds([initialStimulusParam]);
      return;
    }
    setSelectedStimulusIds((prev) => {
      const validIds = new Set(setStimuli.map((s) => s.stimulusId));
      const filtered = prev.filter((id) => validIds.has(id));
      if (filtered.length > 0) return filtered;
      return setStimuli.map((s) => s.stimulusId);
    });
  }, [setId, setStimuli, initialStimulusParam]);

  const progressStatusByStimulusId = useMemo(() => {
    const map: Record<string, StimulusCompletionStatus> = {};
    for (const [id, rec] of Object.entries(progressMap)) {
      map[id] = rec.status;
    }
    return map;
  }, [progressMap]);

  const effectiveSelectionMode: SelectionMode =
    subsetMode === "selected" && orderingMode === "sequential"
      ? "selected"
      : orderingMode;

  const previewSequence = useMemo(() => {
    try {
      return buildSessionSequence({
        setId,
        selectionMode: effectiveSelectionMode,
        selectedStimulusIds:
          subsetMode === "selected" ? selectedStimulusIds : undefined,
        includeCompleted,
        includeBlankSlide: subsetMode === "full",
        progressStatusByStimulusId,
        overrides,
      });
    } catch {
      return null;
    }
  }, [
    setId,
    effectiveSelectionMode,
    subsetMode,
    selectedStimulusIds,
    includeCompleted,
    progressStatusByStimulusId,
    overrides,
  ]);

  const completedInCurrentSetCount = useMemo(() => {
    return setStimuli.filter((s) => {
      const st = progressStatusByStimulusId[s.stimulusId];
      return st === "completed" || st === "reviewed";
    }).length;
  }, [setStimuli, progressStatusByStimulusId]);

  function toggleStimulusSelection(stimulusId: string) {
    setSelectedStimulusIds((prev) =>
      prev.includes(stimulusId)
        ? prev.filter((id) => id !== stimulusId)
        : [...prev, stimulusId]
    );
  }

  function handleSelectUnfinishedInSet() {
    setSubsetMode("selected");
    const unfinishedIds = setStimuli
      .filter((s) => {
        const st = progressStatusByStimulusId[s.stimulusId] ?? "not_attempted";
        return st !== "completed" && st !== "reviewed";
      })
      .map((s) => s.stimulusId);
    setSelectedStimulusIds(unfinishedIds);
  }

  async function handleConfirmResetSetProgress() {
    const ids = setStimuli.map((s) => s.stimulusId);
    await resetStimulusProgress(ids);
    const updated = await getAllStimulusProgress();
    setProgressMap(updated);
    setConfirmResetOpen(false);
  }

  function handleStartTest(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    if (!previewSequence || previewSequence.stimulusIds.length === 0) {
      setErrorMessage(
        "No eligible pictures match the current selection. Enable 'Include completed pictures' or select at least one picture."
      );
      return;
    }

    setShowBriefing(true);
  }

  async function launchConfirmedSession() {
    if (!previewSequence || previewSequence.stimulusIds.length === 0) return;

    const obsSec =
      practiceMode === "realistic" ? 30 : Math.max(5, observationSeconds);
    const wrtSec =
      practiceMode === "realistic" ? 240 : Math.max(15, writingSeconds);

    try {
      setStarting(true);

      if (
        fullscreenRequested &&
        typeof document !== "undefined" &&
        document.documentElement.requestFullscreen &&
        !document.fullscreenElement
      ) {
        try {
          await document.documentElement.requestFullscreen();
        } catch {
          // Ignore fullscreen error in restricted browsers
        }
      }

      const built = buildSessionSequence({
        setId,
        selectionMode: effectiveSelectionMode,
        selectedStimulusIds:
          subsetMode === "selected" ? selectedStimulusIds : undefined,
        includeCompleted,
        includeBlankSlide: subsetMode === "full",
        progressStatusByStimulusId,
        overrides,
      });

      const nowIso = new Date().toISOString();
      const session: SessionRecord = {
        id: generateId("tat-sess"),
        moduleId: "tat",
        setId: built.set.id,
        setTitle: built.set.shortTitle,
        sourceId: built.set.sourceId,
        selectionMode: effectiveSelectionMode,
        practiceMode,
        writingMode,
        includeCompleted,
        fullscreenRequested,
        observationDurationMs: obsSec * 1000,
        writingDurationMs: wrtSec * 1000,
        stimulusIds: built.stimulusIds,
        canonicalNumbersMap: built.canonicalNumbersMap,
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
      };

      await createSessionRecord(session);
      router.push(`/tat/session?sessionId=${encodeURIComponent(session.id)}`);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to initialize session."
      );
      setStarting(false);
      setShowBriefing(false);
    }
  }

  const effectiveObsSec =
    practiceMode === "realistic" ? 30 : observationSeconds;
  const effectiveWrtSec = practiceMode === "realistic" ? 240 : writingSeconds;
  const totalCount = previewSequence?.stimulusIds.length ?? 0;
  const estimatedTotalSec = totalCount * (effectiveObsSec + effectiveWrtSec);

  if (showBriefing) {
    return (
      <ExamBriefingSlides
        examType="tat"
        configSummary={`${previewSequence?.set.shortTitle ?? setId.toUpperCase()} · ${totalCount} slide(s) · ${
          practiceMode === "realistic" ? "Real SSB Hall Mode" : "Practice Mode"
        }`}
        onComplete={() => {
          void launchConfirmedSession();
        }}
        onCancel={() => setShowBriefing(false)}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24 lg:pb-10">
      <div className="mb-6 rounded-2xl border border-zinc-200/90 dark:border-white/[0.08] bg-white dark:bg-[#0b0f17] p-5 sm:p-6 shadow-sm">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200/70 dark:border-indigo-500/25 text-indigo-700 dark:text-indigo-300 text-[11px] font-semibold tracking-wide mb-2.5">
          <span>STAGE-II PSYCHOLOGY — THEMATIC APPERCEPTION TEST (TAT)</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
          TAT Practice Setup
        </h1>
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
          Each TAT set contains 11 sequential pictures + 1 Blank Slide (12
          slides total). In Real SSB Mode, no timer is shown: each picture
          appears for 30s, then vanishes for 4m while you write in your
          notebook.
        </p>
      </div>

      <form
        onSubmit={handleStartTest}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Left 2 Columns: Configuration Controls */}
        <div className="lg:col-span-2 space-y-5">
          {/* 1. Select Set (SET 1 – SET 10) */}
          <section className="rounded-2xl border border-zinc-200/90 dark:border-white/[0.08] bg-white dark:bg-[#0b0f17] p-4 sm:p-6 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white">
                  1. Select TAT Set (SET 1 – SET 10)
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Divided in strict PDF image sequence — 11 Approved Pictures + 1 Blank Slide per set.
                </p>
              </div>
              <span className="rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200/70 dark:border-indigo-500/25 px-3 py-1 font-mono text-[11px] font-semibold text-indigo-700 dark:text-indigo-300">
                All 10 Sets Approved
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {visibleSets.map((set) => {
                const isSelected = set.id === setId;
                return (
                  <button
                    key={set.id}
                    type="button"
                    data-testid={`select-set-${set.id}`}
                    onClick={() => setSetId(set.id)}
                    className={`text-left rounded-xl border p-3.5 transition flex flex-col justify-between ${
                      isSelected
                        ? "border-indigo-500 dark:border-indigo-400 bg-indigo-50/70 dark:bg-indigo-500/15"
                        : "border-zinc-200/90 dark:border-white/[0.08] bg-zinc-50/40 dark:bg-white/[0.02] hover:border-indigo-300 dark:hover:border-indigo-500/40"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                          {set.shortTitle}
                        </span>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 shrink-0">
                          {set.hasBlankSlide
                            ? `${set.stimulusIds.length} pics + 1 blank`
                            : `${set.stimulusIds.length} pics`}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">
                        {set.description}
                      </p>
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500">
                      <span>PDF: {set.sourceFilename}</span>
                      <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                        12 Approved Slides
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* 2. Sequence & Picture Selection */}
          <section className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 sm:p-5 space-y-4">
            <h2 className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-zinc-100">
              2. Sequence &amp; Picture Selection
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">
                  Set Scope
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    data-testid="scope-full-btn"
                    onClick={() => setSubsetMode("full")}
                    className={`px-3 py-2 rounded-md border text-xs font-medium transition ${
                      subsetMode === "full"
                        ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                        : "border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    Full Set ({setStimuli.length} + 1 Blank)
                  </button>
                  <button
                    type="button"
                    data-testid="scope-selected-btn"
                    onClick={() => setSubsetMode("selected")}
                    className={`px-3 py-2 rounded-md border text-xs font-medium transition ${
                      subsetMode === "selected"
                        ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                        : "border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    Selected ({selectedStimulusIds.length})
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1.5">
                  Presentation Order
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    data-testid="order-sequential-btn"
                    onClick={() => setOrderingMode("sequential")}
                    className={`px-3 py-2 rounded-md border text-xs font-medium transition flex items-center justify-center gap-1.5 ${
                      orderingMode === "sequential"
                        ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                        : "border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    <Sliders className="w-3.5 h-3.5 shrink-0" />
                    <span>Sequential</span>
                  </button>
                  <button
                    type="button"
                    data-testid="order-random-btn"
                    onClick={() => setOrderingMode("random")}
                    className={`px-3 py-2 rounded-md border text-xs font-medium transition flex items-center justify-center gap-1.5 ${
                      orderingMode === "random"
                        ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                        : "border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    <Shuffle className="w-3.5 h-3.5 shrink-0" />
                    <span>Random Order</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3">
              <label className="inline-flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  data-testid="include-completed-checkbox"
                  checked={includeCompleted}
                  onChange={(e) => setIncludeCompleted(e.target.checked)}
                  className="rounded border-zinc-300 dark:border-zinc-700"
                />
                <span>
                  Include previously completed pictures (
                  {completedInCurrentSetCount} completed in this set)
                </span>
              </label>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIncludeCompleted(false)}
                  className="px-2.5 py-1.5 rounded border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-700 dark:text-zinc-300"
                >
                  Practice Unfinished
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmResetOpen(true)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded border border-rose-300 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Set Progress</span>
                </button>
              </div>
            </div>

            {confirmResetOpen && (
              <div className="rounded-md border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/30 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p className="text-xs text-rose-800 dark:text-rose-200">
                  Reset completion status for all {setStimuli.length} pictures
                  in this set?
                </p>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleConfirmResetSetProgress}
                    className="px-3 py-1.5 rounded bg-rose-600 text-white font-medium text-xs"
                  >
                    Confirm Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmResetOpen(false)}
                    className="px-3 py-1.5 rounded border border-zinc-300 dark:border-zinc-700 text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {subsetMode === "selected" && (
              <div
                data-testid="selected-picture-picker"
                className="pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    Select pictures to include (canonical numbering preserved):
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <button
                      type="button"
                      data-testid="picker-select-all"
                      onClick={() =>
                        setSelectedStimulusIds(
                          setStimuli.map((s) => s.stimulusId)
                        )
                      }
                      className="px-2.5 py-1 rounded border border-zinc-200 dark:border-zinc-700"
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      data-testid="picker-select-unfinished"
                      onClick={handleSelectUnfinishedInSet}
                      className="px-2.5 py-1 rounded border border-zinc-200 dark:border-zinc-700"
                    >
                      Unfinished Only
                    </button>
                    <button
                      type="button"
                      data-testid="picker-clear-all"
                      onClick={() => setSelectedStimulusIds([])}
                      className="px-2.5 py-1 rounded border border-zinc-200 dark:border-zinc-700"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-96 overflow-y-auto p-1">
                  {setStimuli.map((stim) => {
                    const checked = selectedStimulusIds.includes(
                      stim.stimulusId
                    );
                    const status =
                      progressStatusByStimulusId[stim.stimulusId] ??
                      "not_attempted";
                    const badge = STATUS_BADGE_STYLES[status];

                    return (
                      <button
                        key={stim.stimulusId}
                        type="button"
                        data-testid={`pick-stimulus-${stim.stimulusId}`}
                        onClick={() =>
                          toggleStimulusSelection(stim.stimulusId)
                        }
                        className={`rounded-md border p-2 text-left transition flex flex-col justify-between ${
                          checked
                            ? "border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-800"
                            : "border-zinc-200 dark:border-zinc-800 opacity-70 hover:opacity-100"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1.5">
                            <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                              Picture {stim.canonicalNumber}
                            </span>
                            {checked ? (
                              <CheckSquare className="w-4 h-4" />
                            ) : (
                              <Square className="w-4 h-4 text-zinc-400" />
                            )}
                          </div>
                          <div className="aspect-[4/3] w-full rounded bg-zinc-100 dark:bg-zinc-950 overflow-hidden mb-2 border border-zinc-200 dark:border-zinc-800">
                            <img
                              src={stim.setFolderAssetPath ?? stim.assetPath}
                              alt={`SSB TAT ${setId.toUpperCase()} Picture ${stim.canonicalNumber} Stimulus Preview`}
                              width={320}
                              height={240}
                              decoding="async"
                              loading="lazy"
                              className="w-full h-full object-contain"
                            />
                          </div>
                        </div>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded border text-center truncate ${badge.className}`}
                        >
                          {badge.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </section>

          {/* 3. Real SSB Mode vs Practice Mode & Notebook vs Digital Writing */}
          <section className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 sm:p-5 space-y-4">
            <h2 className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-zinc-100">
              3. SSB Hall Mode &amp; Story Writing Method
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                data-testid="mode-realistic-btn"
                onClick={() => {
                  setPracticeMode("realistic");
                  setWritingMode("notebook");
                  setObservationSeconds(30);
                  setWritingSeconds(240);
                }}
                className={`text-left rounded-md border p-3.5 transition ${
                  practiceMode === "realistic"
                    ? "border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-800/70"
                    : "border-zinc-200 dark:border-zinc-800"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>Real SSB Hall Mode (Default)</span>
                  </span>
                  {practiceMode === "realistic" && (
                    <Check className="w-4 h-4 shrink-0" />
                  )}
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  <strong>No visible countdown timer.</strong> Picture is shown
                  for 30 seconds, then vanishes for 4 minutes while you write
                  in your physical notebook / printed booklet.
                </p>
              </button>

              <button
                type="button"
                data-testid="mode-practice-btn"
                onClick={() => setPracticeMode("practice")}
                className={`text-left rounded-md border p-3.5 transition ${
                  practiceMode === "practice"
                    ? "border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-800/70"
                    : "border-zinc-200 dark:border-zinc-800"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 shrink-0" />
                    <span>Configurable Practice Mode</span>
                  </span>
                  {practiceMode === "practice" && (
                    <Check className="w-4 h-4 shrink-0" />
                  )}
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  Displays countdown timer on screen, allows custom observation
                  and writing durations, plus pause/resume controls.
                </p>
              </button>
            </div>

            {/* Writing Method: Physical Notebook (Default) vs On-Screen Textbox */}
            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Story Writing Medium (During 4-Minute Interval)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  data-testid="writing-mode-notebook-btn"
                  onClick={() => setWritingMode("notebook")}
                  className={`text-left rounded-md border p-3 transition flex items-start gap-2.5 ${
                    writingMode === "notebook"
                      ? "border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-800/70"
                      : "border-zinc-200 dark:border-zinc-800"
                  }`}
                >
                  <BookOpen className="w-4 h-4 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      Physical Notebook / Printed Booklet (Real SSB)
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                      Picture vanishes after 30s and screen stays calm for 4m
                      while you write on paper.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  data-testid="writing-mode-digital-btn"
                  onClick={() => setWritingMode("digital")}
                  className={`text-left rounded-md border p-3 transition flex items-start gap-2.5 ${
                    writingMode === "digital"
                      ? "border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-800/70"
                      : "border-zinc-200 dark:border-zinc-800"
                  }`}
                >
                  <Keyboard className="w-4 h-4 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                      On-Screen Digital Textbox (Optional)
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                      Type stories on computer/phone during the 4m window with
                      local IndexedDB autosave.
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {practiceMode === "practice" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <div>
                  <label
                    htmlFor="obs-seconds-input"
                    className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1"
                  >
                    Observation Duration (seconds)
                  </label>
                  <input
                    id="obs-seconds-input"
                    type="number"
                    min={5}
                    max={300}
                    value={observationSeconds}
                    onChange={(e) =>
                      setObservationSeconds(
                        Math.max(5, Number(e.target.value) || 30)
                      )
                    }
                    className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label
                    htmlFor="wrt-seconds-input"
                    className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1"
                  >
                    Story Writing Duration (seconds)
                  </label>
                  <input
                    id="wrt-seconds-input"
                    type="number"
                    min={15}
                    max={1800}
                    value={writingSeconds}
                    onChange={(e) =>
                      setWritingSeconds(
                        Math.max(15, Number(e.target.value) || 240)
                      )
                    }
                    className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <label className="inline-flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={fullscreenRequested}
                  onChange={(e) => setFullscreenRequested(e.target.checked)}
                  className="rounded border-zinc-300 dark:border-zinc-700"
                />
                <Maximize2 className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                <span>
                  Enter fullscreen projector mode automatically when test starts
                </span>
              </label>
            </div>
          </section>
        </div>

        {/* Right Column: Session Summary & Start CTA */}
        <div className="space-y-5">
          <div className="sticky top-20 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-4">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">
                SSB Hall Briefing
              </span>
              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mt-0.5">
                Session Summary
              </h2>
            </div>

            <dl className="space-y-2.5 text-xs border-y border-zinc-200 dark:border-zinc-800 py-3.5">
              <div className="flex items-center justify-between gap-2">
                <dt className="text-zinc-500">Selected Set</dt>
                <dd
                  data-testid="summary-set-title"
                  className="font-semibold text-zinc-900 dark:text-zinc-100 text-right"
                >
                  {previewSequence?.set.shortTitle ?? "—"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-zinc-500">Slides in Session</dt>
                <dd
                  data-testid="summary-picture-count"
                  className="font-mono font-semibold text-zinc-900 dark:text-zinc-100"
                >
                  {totalCount} {totalCount === 1 ? "picture" : "pictures"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-zinc-500">Sequence Policy</dt>
                <dd className="font-mono text-zinc-800 dark:text-zinc-200 capitalize">
                  {effectiveSelectionMode}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-zinc-500">Hall Mode</dt>
                <dd className="font-mono text-zinc-800 dark:text-zinc-200">
                  {practiceMode === "realistic"
                    ? "Real SSB (No Timer)"
                    : "Practice (Timer Visible)"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-zinc-500">Writing Method</dt>
                <dd className="font-mono text-zinc-800 dark:text-zinc-200">
                  {writingMode === "notebook"
                    ? "Physical Notebook"
                    : "On-Screen Textbox"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-zinc-500">Picture Projection</dt>
                <dd
                  data-testid="summary-observation-duration"
                  className="font-mono text-zinc-800 dark:text-zinc-200"
                >
                  {formatDurationSeconds(effectiveObsSec)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-zinc-500">Writing Wait / Slide</dt>
                <dd
                  data-testid="summary-writing-duration"
                  className="font-mono text-zinc-800 dark:text-zinc-200"
                >
                  {formatDurationSeconds(effectiveWrtSec)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-zinc-500">Total Set Duration</dt>
                <dd className="font-mono text-zinc-900 dark:text-zinc-100 font-semibold">
                  {formatDurationSeconds(estimatedTotalSec)}
                </dd>
              </div>
            </dl>

            <div className="rounded-md bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-3 text-xs text-zinc-600 dark:text-zinc-400 space-y-1">
              <div className="font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" />
                <span>Real SSB Hall Procedure</span>
              </div>
              <p>• Keep your printed SSB Booklet &amp; pen ready before starting.</p>
              <p>
                • Each picture appears for 30s, then vanishes for 4m while you
                write in your booklet.
              </p>
              <p>
                • Slide 12 is the Blank Slide — imagine your own picture and
                write Story #12.
              </p>
            </div>

            {errorMessage && (
              <div
                role="alert"
                className="rounded-md border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/30 p-3 text-xs text-rose-800 dark:text-rose-200 flex items-start gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={starting || totalCount === 0}
              data-testid="start-test-btn"
              className="w-full py-3 px-4 rounded-md bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 disabled:opacity-50 text-white dark:text-zinc-900 font-semibold text-sm transition flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{starting ? "Initializing Session…" : "Start Test"}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Static SSR SEO Guide: SSB TAT Procedure, OLQ Evaluation & FAQs */}
      <section
        aria-labelledby="tat-seo-guide-heading"
        className="rounded-2xl border border-zinc-200/90 dark:border-white/[0.08] bg-white dark:bg-[#0b0f17] p-5 sm:p-8 space-y-6 shadow-sm"
      >
        <div className="space-y-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-semibold">
            DIPR STAGE-2 PSYCHOLOGY GUIDE
          </span>
          <h2
            id="tat-seo-guide-heading"
            className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white"
          >
            How the SSB Thematic Apperception Test (TAT) Works &amp; How Psychologists Evaluate Stories
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            The Thematic Apperception Test (TAT) is the first and most decisive test in the Stage-2 SSB Psychological Battery. Candidates are projected 11 hazy black-and-white pictures followed by 1 Blank Slide (12th picture). Each slide is projected for <strong>30 seconds</strong> for observation, after which the screen goes blank for <strong>4 minutes</strong> while candidates write a 100–120 word story in their physical Psychological Test Booklet.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-zinc-200/80 dark:border-white/[0.08] bg-zinc-50/70 dark:bg-white/[0.02] p-4 space-y-1.5">
            <h3 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white">
              1. Four-Part TAT Story Structure
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Every SSB TAT response should clearly establish: (1) What led to the situation (2 lines), (2) What is currently happening and the central character&apos;s role, (3) Concrete actions taken using practical resources (5–6 lines), and (4) A realistic, constructive outcome (1–2 lines).
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200/80 dark:border-white/[0.08] bg-zinc-50/70 dark:bg-white/[0.02] p-4 space-y-1.5">
            <h3 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white">
              2. OLQ Factor Mapping in TAT
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              DIPR assessors evaluate your protagonist&apos;s subconscious problem-solving across Factor I (Effective Intelligence, Organizing Ability), Factor II (Sense of Responsibility, Cooperation), Factor III (Initiative, Speed of Decision), and Factor IV (Determination, Courage).
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200/80 dark:border-white/[0.08] bg-zinc-50/70 dark:bg-white/[0.02] p-4 space-y-1.5">
            <h3 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white">
              3. The 12th Blank Slide Strategy
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Slide 12 is completely blank so you can project a situation aligned with your Personal Information Questionnaire (PIQ) — such as organizing an inter-college tournament, resolving a technical project bottleneck, or leading a community initiative.
            </p>
          </div>
        </div>

        <div className="space-y-2.5 pt-2 border-t border-zinc-200/80 dark:border-white/[0.08]">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
            Frequently Asked Questions — SSB TAT Practice
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-zinc-600 dark:text-zinc-400">
            <div className="rounded-lg border border-zinc-200/70 dark:border-white/[0.06] p-3 space-y-1">
              <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                Why is there no visible countdown timer in Real SSB Hall Mode?
              </p>
              <p className="leading-relaxed">
                In actual SSB Selection Centers (Allahabad, Bhopal, Bangalore, Kapurthala, AFSBs), candidates have no wall clock or stopwatch during TAT. Training without a visible timer builds natural 4-minute story pacing.
              </p>
            </div>
            <div className="rounded-lg border border-zinc-200/70 dark:border-white/[0.06] p-3 space-y-1">
              <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                Should I write TAT stories on paper or type on screen?
              </p>
              <p className="leading-relaxed">
                Always prioritize writing with a blue/black ballpoint pen in the printable 16-page SSB Booklet PDF so your handwriting speed matches the 4-minute hall window (~100–120 words per story).
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
