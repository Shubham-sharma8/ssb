"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Filter, FolderOpen, Play, RotateCcw } from "lucide-react";
import {
  getAllStimulusProgress,
  getStoriesForStimulus,
  resetStimulusProgress,
} from "@/lib/storage/db";
import {
  getPracticeSets,
  getSlidesForSet,
  type ResolvedStimulus,
} from "@/lib/tat/catalog";
import type {
  StimulusCompletionStatus,
  StimulusProgressRecord,
  StoryRecord,
} from "@/lib/validation/schemas";

const STATUS_BADGES: Record<
  StimulusCompletionStatus,
  { label: string; className: string }
> = {
  not_attempted: {
    label: "Not Attempted",
    className:
      "border-zinc-200 bg-zinc-100 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-400",
  },
  in_progress: {
    label: "In Progress",
    className:
      "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-700/50 dark:bg-amber-950/40 dark:text-amber-300",
  },
  completed: {
    label: "Completed",
    className:
      "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-700/50 dark:bg-emerald-950/40 dark:text-emerald-300",
  },
  skipped: {
    label: "Skipped",
    className:
      "border-zinc-300 bg-zinc-100 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  },
  reviewed: {
    label: "Reviewed",
    className:
      "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-200 dark:bg-zinc-100 dark:text-zinc-900",
  },
};

export default function LibraryPage() {
  const sets = useMemo(() => getPracticeSets(), []);

  const [selectedSetId, setSelectedSetId] = useState<string>("set-1");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [progressMap, setProgressMap] = useState<
    Record<string, StimulusProgressRecord>
  >({});
  const [activeStimulus, setActiveStimulus] =
    useState<ResolvedStimulus | null>(null);
  const [stimulusStories, setStimulusStories] = useState<StoryRecord[]>([]);

  const loadStorageData = async () => {
    const allProgress = await getAllStimulusProgress();
    setProgressMap(allProgress);
  };

  useEffect(() => {
    void loadStorageData();
  }, []);

  const currentSetSlides = useMemo(
    () => getSlidesForSet(selectedSetId),
    [selectedSetId]
  );

  const filteredStimuli = useMemo(() => {
    return currentSetSlides.filter((stim) => {
      const status =
        progressMap[stim.stimulusId]?.status ?? "not_attempted";
      if (statusFilter === "all") return true;
      return status === statusFilter;
    });
  }, [currentSetSlides, progressMap, statusFilter]);

  const handleInspectStimulus = async (stim: ResolvedStimulus) => {
    setActiveStimulus(stim);
    const stories = await getStoriesForStimulus(stim.stimulusId);
    setStimulusStories(stories);
  };

  const handleResetSingleStimulus = async (stimId: string) => {
    await resetStimulusProgress([stimId]);
    await loadStorageData();
  };

  const selectedSetRecord = useMemo(
    () => sets.find((s) => s.id === selectedSetId) ?? sets[0],
    [sets, selectedSetId]
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8 sm:px-6">
      <div className="mb-6 flex flex-col justify-between gap-4 border-b border-zinc-200 pb-5 dark:border-zinc-800 lg:flex-row lg:items-end">
        <div>
          <p className="font-mono text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            APPROVED SSB TAT PICTURE SETS
          </p>
          <h1 className="mt-1 text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            TAT Sets Library (SET 1 – SET 10)
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Each set contains 11 approved real SSB Pictures in chronological sequence plus 1 Blank Slide (12 slides total).
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
          <FolderOpen className="h-3.5 w-3.5 shrink-0" />
          <span>10 Sets • 110 Set Pictures + 10 Blank Slides</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Set Selector & Filters */}
        <div className="space-y-4 lg:col-span-4">
          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Select TAT Set (11 Pics + 1 Blank)
            </h2>
            <div className="space-y-1.5">
              {sets.map((set) => (
                <button
                  key={set.id}
                  type="button"
                  data-testid={`library-set-${set.id}`}
                  onClick={() => {
                    setSelectedSetId(set.id);
                    setActiveStimulus(null);
                  }}
                  className={`w-full rounded-lg border p-3 text-left transition ${
                    selectedSetId === set.id
                      ? "border-emerald-600 bg-emerald-500/10 text-zinc-900 dark:border-emerald-400 dark:bg-emerald-500/15 dark:text-zinc-100"
                      : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold">{set.title}</span>
                    <span className="rounded bg-emerald-500/15 px-2 py-0.5 font-mono text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                      11 + 1 Blank
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-zinc-500">
                    {set.sourceFilename} • {set.sectionLabel ?? "12 Slides"}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              <Filter className="h-3.5 w-3.5" />
              <span>Filter by Progress Status</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              {[
                { id: "all", label: "All Slides" },
                { id: "not_attempted", label: "Not Attempted" },
                { id: "completed", label: "Completed" },
                { id: "reviewed", label: "Reviewed" },
                { id: "in_progress", label: "In Progress" },
                { id: "skipped", label: "Skipped" },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setStatusFilter(opt.id)}
                  className={`rounded-lg border px-2.5 py-2 text-left font-medium transition ${
                    statusFilter === opt.id
                      ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-200 dark:bg-zinc-100 dark:text-zinc-900"
                      : "border-zinc-200 bg-white text-zinc-600 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Stimuli Grid + Detail Drawer */}
        <div className="space-y-6 lg:col-span-8">
          {selectedSetRecord && (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-xs dark:border-zinc-800 dark:bg-zinc-900">
              <div>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">
                  {selectedSetRecord.title}
                </span>{" "}
                <span className="text-zinc-500">
                  — {selectedSetRecord.description}
                </span>
              </div>
              <Link
                href={`/tat?setId=${encodeURIComponent(selectedSetRecord.id)}`}
                className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3.5 py-1.5 font-semibold text-white hover:bg-emerald-500 dark:bg-emerald-500 dark:text-zinc-950"
              >
                <Play className="h-3 w-3 fill-current" />
                <span>Start {selectedSetRecord.title}</span>
              </Link>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredStimuli.map((stim) => {
              const progress = progressMap[stim.stimulusId];
              const status: StimulusCompletionStatus =
                progress?.status ?? "not_attempted";
              const badge = STATUS_BADGES[status];
              const isBlankSlide = stim.canonicalNumber === 12;

              return (
                <div
                  key={stim.stimulusId}
                  data-testid={`library-stimulus-card-${stim.stimulusId}`}
                  className="flex flex-col justify-between overflow-hidden rounded-xl border border-zinc-200 bg-white transition hover:border-emerald-500/40 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div>
                    <div className="flex items-center justify-between border-b border-zinc-100 px-3.5 py-2.5 dark:border-zinc-800">
                      <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        {isBlankSlide
                          ? "Slide 12 (Blank Picture)"
                          : `Picture ${stim.canonicalNumber}`}
                      </span>
                      <span
                        className={`rounded border px-2 py-0.5 text-[10px] font-medium ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                    </div>

                    <div className="flex h-40 items-center justify-center bg-zinc-950 p-2">
                      {isBlankSlide ? (
                        <div className="flex h-32 w-44 flex-col items-center justify-center rounded border border-zinc-300 bg-white text-center text-zinc-900">
                          <span className="text-xs font-semibold">
                            12. BLANK SLIDE
                          </span>
                          <span className="mt-1 text-[10px] text-zinc-500">
                            Self-chosen story
                          </span>
                        </div>
                      ) : stim.assetPath ? (
                        <img
                          src={stim.setFolderAssetPath ?? stim.assetPath}
                          alt={`SSB TAT ${selectedSetId.toUpperCase()} Picture ${stim.canonicalNumber} Stimulus Slide`}
                          width={320}
                          height={240}
                          decoding="async"
                          loading="lazy"
                          className="max-h-36 w-auto object-contain"
                        />
                      ) : null}
                    </div>
                  </div>

                  <div className="border-t border-zinc-100 bg-zinc-50/60 p-3 dark:border-zinc-800 dark:bg-zinc-950/50">
                    <div className="mb-2 flex items-center justify-between text-[11px] text-zinc-500">
                      <span>Attempts: {progress?.attemptCount ?? 0}</span>
                      <span className="font-mono text-[10px] text-emerald-700 dark:text-emerald-400">
                        {isBlankSlide
                          ? "12-blank.webp"
                          : `Approved • p.${stim.sourcePageNumber}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => void handleInspectStimulus(stim)}
                        className="flex-1 rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
                      >
                        Inspect Stories
                      </button>
                      {!isBlankSlide && (
                        <Link
                          href={`/tat?setId=${encodeURIComponent(
                            selectedSetId
                          )}&subset=selected&stimulusId=${encodeURIComponent(
                            stim.stimulusId
                          )}`}
                          className="inline-flex items-center gap-1 rounded-lg bg-zinc-900 px-2.5 py-1.5 text-xs font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
                        >
                          <Play className="h-3 w-3 fill-current" />
                          <span>Practice</span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {activeStimulus && (
            <div
              data-testid="stimulus-story-drawer"
              className="rounded-xl border border-zinc-300 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-900"
            >
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 pb-3 dark:border-zinc-800">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    Past Stories for Picture {activeStimulus.canonicalNumber} (
                    {activeStimulus.stimulusId})
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Source: {activeStimulus.sourceFilename} • Folder:{" "}
                    {activeStimulus.setFolderAssetPath ??
                      activeStimulus.assetPath}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      void handleResetSingleStimulus(
                        activeStimulus.stimulusId
                      )
                    }
                    className="inline-flex items-center gap-1 rounded border border-zinc-300 bg-white px-3 py-1.5 text-xs text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Reset Status</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveStimulus(null)}
                    className="rounded border border-zinc-300 px-3 py-1.5 text-xs text-zinc-600 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-400"
                  >
                    Close
                  </button>
                </div>
              </div>

              {stimulusStories.length === 0 ? (
                <p className="text-xs text-zinc-500">
                  No digital stories saved for this picture yet. (In Real SSB
                  Mode, stories are handwritten in your SSB Psychology Booklet.)
                </p>
              ) : (
                <div className="space-y-3">
                  {stimulusStories.map((story) => (
                    <div
                      key={story.id}
                      className="rounded border border-zinc-200 bg-zinc-50 p-3.5 text-xs dark:border-zinc-800 dark:bg-zinc-950"
                    >
                      <div className="mb-1.5 flex items-center justify-between text-zinc-500">
                        <span>
                          Updated {new Date(story.lastSavedAt).toLocaleString()}
                        </span>
                        <span className="font-mono text-zinc-700 dark:text-zinc-300">
                          {story.wordCount} words • {story.completionStatus}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap text-zinc-800 dark:text-zinc-200">
                        {story.draftText ||
                          "(Completed in physical notebook / blank digital draft)"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
