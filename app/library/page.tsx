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
  getStimulusCleanDescription,
  getStimulusImageSrc,
  getStimulusSeoAlt,
  getStimulusSeoCaption,
  getStimulusSeoTitle,
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
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="mb-6 flex flex-col justify-between gap-4 rounded-2xl border border-zinc-200/90 dark:border-white/[0.08] bg-white dark:bg-[#0b0f17] p-5 sm:p-6 shadow-sm lg:flex-row lg:items-end">
        <div>
          <p className="font-mono text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            APPROVED SSB PPDT &amp; TAT PICTURE SETS (STAGE-1 &amp; STAGE-2)
          </p>
          <h1 className="mt-1 text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            SSB TAT &amp; PPDT Picture Library (SET 1 – SET 10)
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Each set contains 11 calibrated black-and-white SSB stimulus pictures in chronological sequence plus 1 Blank Slide (120 slides total) for Screening PPDT and Stage-2 TAT practice.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-xl border border-indigo-200/70 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10 px-3.5 py-2 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
          <FolderOpen className="h-3.5 w-3.5 shrink-0" />
          <span>10 Sets • 110 PPDT/TAT Pictures + 10 Blank Slides</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Set Selector & Filters */}
        <div className="space-y-4 lg:col-span-4">
          <div className="rounded-2xl border border-zinc-200/90 bg-white p-4 sm:p-5 dark:border-white/[0.08] dark:bg-[#0b0f17] shadow-sm">
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
              const setLabel = selectedSetRecord?.title ?? selectedSetId.toUpperCase();
              const cleanDesc = getStimulusCleanDescription(stim);
              const imgSrc = getStimulusImageSrc(stim);
              const imgAlt = getStimulusSeoAlt(stim, setLabel);
              const imgTitle = getStimulusSeoTitle(stim, setLabel);

              return (
                <figure
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
                      ) : imgSrc ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={imgSrc}
                          alt={imgAlt}
                          title={imgTitle}
                          width={stim.width || 320}
                          height={stim.height || 240}
                          decoding="async"
                          loading="lazy"
                          className="max-h-36 w-auto object-contain"
                        />
                      ) : null}
                    </div>

                    <figcaption className="border-t border-zinc-100 px-3.5 py-2 text-[11px] leading-snug text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                        {isBlankSlide ? "Self-Projected Blank Slide:" : "PPDT / TAT Scene:"}
                      </span>{" "}
                      {cleanDesc}
                    </figcaption>
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
                </figure>
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

      {/* Complete 10-Set SSB PPDT & TAT Visual Picture Directory (All 120 Slides Crawlable in SSR DOM) */}
      <section
        aria-labelledby="complete-tat-ppdt-image-directory-heading"
        className="mt-12 space-y-8 rounded-3xl border border-zinc-200/90 bg-white p-6 sm:p-8 shadow-sm dark:border-white/[0.08] dark:bg-[#0b0f17]"
      >
        <div className="flex flex-col justify-between gap-3 border-b border-zinc-200/80 pb-5 dark:border-white/[0.08] lg:flex-row lg:items-end">
          <div className="space-y-1.5 max-w-3xl">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              COMPLETE VISUAL ARCHIVE • STAGE-1 SCREENING PPDT &amp; STAGE-2 TAT
            </span>
            <h2
              id="complete-tat-ppdt-image-directory-heading"
              className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white"
            >
              All 10 SSB TAT &amp; PPDT Picture Sets (110 Stimulus Images + 10 Blank Slides)
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Every black-and-white ambiguity-calibrated scene below is used for both{" "}
              <strong className="font-semibold text-zinc-900 dark:text-zinc-200">
                Stage-1 Screening Picture Perception &amp; Description Test (PPDT)
              </strong>{" "}
              and{" "}
              <strong className="font-semibold text-zinc-900 dark:text-zinc-200">
                Stage-2 Psychological Thematic Apperception Test (TAT)
              </strong>{" "}
              across Indian Army (SSB Allahabad, Bhopal, Bangalore, Kapurthala), Indian Navy (NSB Visakhapatnam, Coimbatore, Kolkata), and Indian Air Force (AFSB Dehradun, Mysuru, Gandhinagar, Varanasi, Guwahati) boards.
            </p>
          </div>
          <Link
            href="/tat"
            className="inline-flex items-center gap-1.5 self-start rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-indigo-500"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>Launch Timed 30s/4m Simulator</span>
          </Link>
        </div>

        <div className="space-y-10">
          {sets.map((set) => {
            const setSlides = getSlidesForSet(set.id);
            return (
              <div
                key={`directory-${set.id}`}
                id={`directory-${set.id}`}
                className="space-y-4 rounded-2xl border border-zinc-200/80 bg-zinc-50/50 p-4 sm:p-5 dark:border-white/[0.08] dark:bg-white/[0.02]"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200/70 pb-3 dark:border-white/[0.08]">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white">
                      SSB {set.title} — {set.sectionLabel ?? "11 PPDT/TAT Pictures + 12th Blank Slide"}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {set.description} • Source: {set.sourceFilename}
                    </p>
                  </div>
                  <Link
                    href={`/tat?setId=${encodeURIComponent(set.id)}`}
                    className="inline-flex items-center gap-1 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-500/20 dark:text-indigo-300"
                  >
                    <span>Practice {set.title} (30s / 4m) →</span>
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                  {setSlides.map((stim) => {
                    const imgSrc = getStimulusImageSrc(stim);
                    const imgAlt = getStimulusSeoAlt(stim, set.title);
                    const imgTitle = getStimulusSeoTitle(stim, set.title);
                    const imgCaption = getStimulusSeoCaption(stim, set.title);
                    const cleanDesc = getStimulusCleanDescription(stim);

                    return (
                      <figure
                        key={`dir-${set.id}-${stim.stimulusId}`}
                        id={`${set.id}-pic-${stim.canonicalNumber}`}
                        itemScope
                        itemType="https://schema.org/ImageObject"
                        className="flex flex-col justify-between overflow-hidden rounded-xl border border-zinc-200/90 bg-white p-2 shadow-xs dark:border-zinc-800 dark:bg-zinc-900"
                      >
                        <div>
                          <div className="mb-1.5 flex items-center justify-between gap-1 text-[10px] font-mono font-semibold text-zinc-600 dark:text-zinc-400">
                            <span>
                              {set.title} #{String(stim.canonicalNumber).padStart(2, "0")}
                            </span>
                            <span className="text-indigo-600 dark:text-indigo-400">
                              {stim.isBlankSlide ? "Blank" : "PPDT/TAT"}
                            </span>
                          </div>
                          <div className="flex h-24 items-center justify-center overflow-hidden rounded-lg bg-zinc-950 p-1">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={imgSrc}
                              alt={imgAlt}
                              title={imgTitle}
                              width={stim.width || 320}
                              height={stim.height || 240}
                              loading="lazy"
                              decoding="async"
                              itemProp="contentUrl"
                              className="max-h-22 w-auto object-contain"
                            />
                          </div>
                          <meta itemProp="name" content={imgTitle} />
                          <meta itemProp="description" content={imgCaption} />
                          <figcaption
                            itemProp="caption"
                            className="mt-2 line-clamp-3 text-[11px] leading-snug text-zinc-600 dark:text-zinc-400"
                          >
                            {cleanDesc}
                          </figcaption>
                        </div>
                        {!stim.isBlankSlide && (
                          <Link
                            href={`/tat?setId=${encodeURIComponent(
                              set.id
                            )}&subset=selected&stimulusId=${encodeURIComponent(
                              stim.stimulusId
                            )}`}
                            className="mt-2 inline-flex items-center justify-center rounded-md bg-zinc-100 px-2 py-1 text-[10px] font-semibold text-zinc-800 hover:bg-indigo-600 hover:text-white dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-indigo-500"
                          >
                            Practice Slide #{stim.canonicalNumber}
                          </Link>
                        )}
                      </figure>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
