"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  RotateCcw,
  Shuffle,
  Volume2,
  VolumeX,
} from "lucide-react";
import { AttemptedBookletExportCard } from "@/components/psych/AttemptedBookletExportCard";
import { ExamBriefingSlides } from "@/components/psych/ExamBriefingSlides";
import {
  getSrtSets,
  getSrtTotalQuestionsCount,
  resolveSrtQuestionsForSet,
  type SrtQuestionItem,
  type SrtSetDefinition,
} from "@/lib/psych/catalog";
import { playSsbHallBeep } from "@/lib/psych/audio";
import { preventStimulusExtraction } from "@/lib/psych/hall-utils";
import { systemClock } from "@/lib/session/clock";
import { formatClockMs } from "@/lib/utils";
import {
  loadUserPreferences,
  saveUserPreferences,
} from "@/lib/storage/preferences";

type SrtPhase = "SETUP" | "BRIEFING" | "ACTIVE" | "COMPLETED";

const SECONDS_PER_SRT = 30; // Official SSB equivalent: 60 SRTs = 30 minutes (30s per SRT, 2m 30s per 5 SRTs)
const SRTS_PER_SHEET = 5; // Matches the 5 SRT response boxes per page in Phys Test booklet.pdf

export default function SrtPage() {
  const sets = getSrtSets();
  const totalPoolCount = getSrtTotalQuestionsCount();

  // Default to the real-time RANDOM SRT SET or SRT SET 1
  const [selectedSetId, setSelectedSetId] = useState<string>("srt-random");
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [showTimerInHall, setShowTimerInHall] = useState<boolean>(false);
  const [soundAlerts, setSoundAlerts] = useState<boolean>(true);

  // Active session state
  const [phase, setPhase] = useState<SrtPhase>("SETUP");
  const [activeSet, setActiveSet] = useState<SrtSetDefinition | null>(null);
  const [sessionQuestions, setSessionQuestions] = useState<SrtQuestionItem[]>(
    []
  );
  const [currentSheetIndex, setCurrentSheetIndex] = useState<number>(0);
  const [remainingMs, setRemainingMs] = useState<number>(0);
  const [totalDurationMs, setTotalDurationMs] = useState<number>(0);
  const [startedAtIso, setStartedAtIso] = useState<string>("");
  const [completedAtIso, setCompletedAtIso] = useState<string>("");
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const phaseRef = useRef<SrtPhase>("SETUP");
  const startedMonoRef = useRef<number>(0);
  const durationMsRef = useRef<number>(0);
  const soundEnabledRef = useRef<boolean>(true);
  const lastSheetIndexRef = useRef<number>(0);

  useEffect(() => {
    const prefs = loadUserPreferences();
    setSoundAlerts(prefs.soundAlerts ?? true);
    soundEnabledRef.current = prefs.soundAlerts ?? true;
  }, []);

  const completeSrtSession = useCallback(() => {
    phaseRef.current = "COMPLETED";
    setPhase("COMPLETED");
    setCompletedAtIso(new Date(systemClock.nowWall()).toISOString());
    playSsbHallBeep("completed", soundEnabledRef.current);
  }, []);

  useEffect(() => {
    if (phase !== "ACTIVE") return;

    const tick = () => {
      if (phaseRef.current !== "ACTIVE") return;
      const elapsed = systemClock.nowMono() - startedMonoRef.current;
      const rem = Math.max(0, durationMsRef.current - elapsed);
      setRemainingMs(rem);

      // Auto-advance the visible 5-SRT sheet every 2m 30s (150,000 ms) if there are multiple sheets
      const sheetDurationMs = SRTS_PER_SHEET * SECONDS_PER_SRT * 1000;
      const totalSheets = Math.max(
        1,
        Math.ceil(sessionQuestions.length / SRTS_PER_SHEET)
      );
      if (totalSheets > 1) {
        const computedSheet = Math.min(
          totalSheets - 1,
          Math.floor(elapsed / sheetDurationMs)
        );
        if (computedSheet > lastSheetIndexRef.current) {
          lastSheetIndexRef.current = computedSheet;
          setCurrentSheetIndex(computedSheet);
          playSsbHallBeep("sheet-advance", soundEnabledRef.current);
        }
      }

      if (rem <= 0) {
        completeSrtSession();
      }
    };

    const unsub = systemClock.subscribe ? systemClock.subscribe(tick) : () => {};
    const interval = setInterval(tick, 100);
    return () => {
      unsub();
      clearInterval(interval);
    };
  }, [phase, sessionQuestions.length, completeSrtSession]);

  function handleStartSrt() {
    const resolved = resolveSrtQuestionsForSet(selectedSetId, questionCount);
    const totalMs = resolved.questions.length * SECONDS_PER_SRT * 1000;

    phaseRef.current = "ACTIVE";
    startedMonoRef.current = systemClock.nowMono();
    durationMsRef.current = totalMs;
    lastSheetIndexRef.current = 0;

    setActiveSet(resolved.set);
    setSessionQuestions(resolved.questions);
    setCurrentSheetIndex(0);
    setTotalDurationMs(totalMs);
    setRemainingMs(totalMs);
    setStartedAtIso(new Date(systemClock.nowWall()).toISOString());
    setPhase("ACTIVE");
    playSsbHallBeep("sheet-advance", soundEnabledRef.current);
  }

  function handleToggleSound() {
    const next = !soundAlerts;
    setSoundAlerts(next);
    soundEnabledRef.current = next;
    saveUserPreferences({ soundAlerts: next });
  }

  async function toggleFullscreen() {
    if (typeof document === "undefined") return;
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {
      // Ignore
    }
  }

  // COMPLETED VIEW
  if (phase === "COMPLETED" && activeSet) {
    const attemptedQuestionsCount = Math.min(
      sessionQuestions.length,
      (currentSheetIndex + 1) * SRTS_PER_SHEET
    );
    const attemptedQuestions = sessionQuestions.slice(
      0,
      Math.max(1, attemptedQuestionsCount)
    );

    return (
      <div
        data-testid="srt-completed-screen"
        className="fixed inset-0 z-50 overflow-y-auto bg-zinc-950 text-zinc-100 py-8 sm:py-12 px-4 sm:px-6"
      >
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5 sm:p-8 space-y-6">
            <div className="flex items-start sm:items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-md bg-zinc-800 text-zinc-100 shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                    STOP WRITING — SRT COMPLETED
                  </span>
                  <h1 className="text-xl sm:text-2xl font-semibold text-zinc-100">
                    {activeSet.label} — {attemptedQuestions.length} Situations
                  </h1>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPhase("SETUP")}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-100 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>New SRT Set</span>
                </button>
                <Link
                  href="/sdt"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold transition-colors"
                >
                  <span>Proceed to SDT</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-zinc-800">
              <div className="p-3 rounded-md bg-zinc-950 border border-zinc-800/80">
                <span className="text-[11px] text-zinc-400 block">
                  SRT Set Mode
                </span>
                <span className="text-sm font-semibold text-zinc-100 mt-0.5 block">
                  {activeSet.isRandom ? "Live Random SRT Set" : activeSet.label}
                </span>
              </div>
              <div className="p-3 rounded-md bg-zinc-950 border border-zinc-800/80">
                <span className="text-[11px] text-zinc-400 block">
                  Situations Attempted
                </span>
                <span className="text-lg font-mono font-semibold text-zinc-100 mt-0.5 block">
                  {attemptedQuestions.length} / {sessionQuestions.length} SRTs
                </span>
              </div>
              <div className="p-3 rounded-md bg-zinc-950 border border-zinc-800/80">
                <span className="text-[11px] text-zinc-400 block">
                  Equivalent Hall Time
                </span>
                <span className="text-sm font-mono font-semibold text-zinc-100 mt-0.5 block">
                  {formatClockMs(totalDurationMs)} ({SECONDS_PER_SRT}s / SRT)
                </span>
              </div>
            </div>

            {/* Export Attempted Question Booklet PDF + AI Evaluation Prompt */}
            <AttemptedBookletExportCard
              data={{
                title: `SRT Question Booklet — ${activeSet.label}`,
                subtitle: `${attemptedQuestions.length} Attempted Situation Reaction Test items (${formatClockMs(
                  totalDurationMs
                )} invisible timer)`,
                startedAtIso,
                completedAtIso,
                srt: {
                  setLabel: activeSet.label,
                  isRealtimeRandom: activeSet.isRandom,
                  questions: attemptedQuestions,
                },
              }}
            />

            {/* Full list of attempted SRTs */}
            <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 sm:p-5 space-y-3">
              <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                Attempted SRT Situations ({attemptedQuestions.length})
              </h2>
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {attemptedQuestions.map((q, idx) => (
                  <div
                    key={`${q.id}-${idx}`}
                    className="p-3 rounded border border-zinc-800/90 bg-zinc-900/60 text-xs sm:text-sm text-zinc-200 flex items-start gap-2.5"
                  >
                    <span className="font-mono font-semibold text-zinc-400 shrink-0">
                      SRT #{idx + 1}.
                    </span>
                    <span className="leading-relaxed">{q.situation}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ACTIVE HALL RUNNER (Displays 5 SRTs + Official Instructions + Invisible Equivalent Timer)
  if (phase === "ACTIVE" && activeSet) {
    const totalSheets = Math.max(
      1,
      Math.ceil(sessionQuestions.length / SRTS_PER_SHEET)
    );
    const startIdx = currentSheetIndex * SRTS_PER_SHEET;
    const currentFiveQuestions = sessionQuestions.slice(
      startIdx,
      startIdx + SRTS_PER_SHEET
    );

    return (
      <div
        data-testid="srt-session-runner"
        onContextMenu={preventStimulusExtraction}
        className="fixed inset-0 z-50 overflow-y-auto bg-zinc-950 text-zinc-100 flex flex-col select-none"
      >
        <header className="border-b border-zinc-900 bg-zinc-950/90 px-3 sm:px-6 py-2.5">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="px-2.5 py-1 rounded text-xs font-mono font-semibold bg-zinc-900 text-zinc-100 border border-zinc-800">
                {activeSet.label}
              </span>
              <span
                data-testid="srt-sheet-indicator"
                className="text-xs sm:text-sm font-mono font-semibold text-zinc-200"
              >
                Booklet Sheet {currentSheetIndex + 1} of {totalSheets} (SRT #
                {startIdx + 1}–#
                {Math.min(sessionQuestions.length, startIdx + SRTS_PER_SHEET)})
              </span>
            </div>

            <div className="flex items-center gap-2">
              {!showTimerInHall ? (
                <button
                  type="button"
                  data-testid="srt-invisible-timer-badge"
                  onClick={() => setShowTimerInHall(true)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-300 hover:border-zinc-700"
                  title="Click to peek at remaining time"
                >
                  <EyeOff className="w-3.5 h-3.5 text-zinc-400" />
                  <span>
                    Invisible Timer Running ({formatClockMs(totalDurationMs)})
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  data-testid="srt-visible-timer"
                  onClick={() => setShowTimerInHall(false)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded font-mono text-sm font-semibold tabular-nums bg-zinc-900 text-zinc-100 border border-zinc-700"
                  title="Click to hide timer (Real SSB Mode)"
                >
                  <Eye className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{formatClockMs(remainingMs)}</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleToggleSound}
                aria-label="Toggle sound"
                className="p-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800"
              >
                {soundAlerts ? (
                  <Volume2 className="w-4 h-4" />
                ) : (
                  <VolumeX className="w-4 h-4 text-zinc-400" />
                )}
              </button>

              <button
                type="button"
                onClick={toggleFullscreen}
                aria-label="Toggle Fullscreen"
                className="p-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800"
              >
                {isFullscreen ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </button>

              <button
                type="button"
                data-testid="srt-finish-btn"
                onClick={() => completeSrtSession()}
                className="px-3 py-1.5 rounded bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold transition-colors"
              >
                Finish & Export
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-8 flex flex-col justify-between gap-6">
          {/* Official SSB SRT Instructions Banner */}
          <div
            data-testid="srt-instructions-banner"
            className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-4 sm:p-5 space-y-2"
          >
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-zinc-300">
                <BookOpen className="w-4 h-4 text-zinc-400" />
                <span>OFFICIAL SSB SRT INSTRUCTIONS — WRITE IN YOUR BOOKLET</span>
              </div>
              <span className="text-[11px] font-mono text-zinc-400">
                5 Situations per Booklet Page · Equivalent Timer:{" "}
                {formatClockMs(totalDurationMs)}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Below are <strong>5 real-life situations</strong> corresponding to
              one page of your physical Psychological Test Booklet. Write
              clearly and concisely <strong>what you would do</strong> in each
              situation inside the corresponding numbered SRT box in your
              notebook. An invisible timer equivalent to{" "}
              <strong>
                {sessionQuestions.length} SRTs ({formatClockMs(totalDurationMs)})
              </strong>{" "}
              is active and will signal &ldquo;STOP WRITING&rdquo; when time
              expires.
            </p>
          </div>

          {/* 5 SRT Situations Display */}
          <div
            data-testid="srt-five-questions-list"
            className="space-y-3 my-auto"
          >
            {currentFiveQuestions.map((item, idx) => {
              const srtNum = startIdx + idx + 1;
              return (
                <div
                  key={`${item.id}-${srtNum}`}
                  data-testid={`srt-question-card-${idx + 1}`}
                  className="rounded-lg border border-zinc-800 bg-zinc-900/90 p-4 sm:p-5 flex items-start gap-3.5 shadow-sm"
                >
                  <span className="px-2.5 py-1 rounded bg-zinc-950 border border-zinc-800 font-mono text-xs sm:text-sm font-bold text-zinc-200 shrink-0">
                    SRT #{srtNum}
                  </span>
                  <p className="text-sm sm:text-base font-medium text-zinc-100 leading-relaxed">
                    {item.situation}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Sheet Navigation Footer (for multi-sheet 15/30/60 SRT sessions) */}
          <div className="flex items-center justify-between gap-3 pt-4 border-t border-zinc-900">
            <div className="text-xs text-zinc-400 font-mono">
              Showing {startIdx + 1}–
              {Math.min(sessionQuestions.length, startIdx + SRTS_PER_SHEET)} of{" "}
              {sessionQuestions.length} SRTs
            </div>
            {totalSheets > 1 ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentSheetIndex === 0}
                  onClick={() =>
                    setCurrentSheetIndex((p) => Math.max(0, p - 1))
                  }
                  className="px-3 py-1.5 rounded border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 text-xs font-medium text-zinc-200"
                >
                  Previous 5 SRTs
                </button>
                <button
                  type="button"
                  data-testid="srt-next-sheet-btn"
                  disabled={currentSheetIndex >= totalSheets - 1}
                  onClick={() => {
                    const next = Math.min(totalSheets - 1, currentSheetIndex + 1);
                    lastSheetIndexRef.current = next;
                    setCurrentSheetIndex(next);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-zinc-100 hover:bg-white disabled:opacity-40 text-zinc-950 text-xs font-semibold"
                >
                  <span>Next 5 SRTs (Turn Page)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="text-xs text-zinc-400">
                Single 5-SRT Sheet · Invisible timer ends automatically after 2m 30s
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  // SETUP & BRIEFING VIEW
  const selectedSet =
    sets.find((s) => s.id === selectedSetId) ?? sets[0];
  const equivalentTimeMs = questionCount * SECONDS_PER_SRT * 1000;

  if (phase === "BRIEFING") {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <ExamBriefingSlides
          examType="srt"
          setLabel={`${selectedSet?.label ?? "SRT Set"} (${questionCount} Situations · ${formatClockMs(equivalentTimeMs)})`}
          onComplete={handleStartSrt}
          onCancel={() => {
            phaseRef.current = "SETUP";
            setPhase("SETUP");
          }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
      {/* Top Breadcrumb */}
      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/60 p-4 sm:p-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>All Tests</span>
            </Link>
            <span className="text-zinc-400 dark:text-zinc-600">·</span>
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              STAGE 2 PSYCHOLOGY — SRT ({totalPoolCount} SITUATIONS POOL)
            </span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Situation Reaction Test (SRT)
          </h1>
          <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
            Each page of the SSB Psychological Test Booklet contains 5 SRT
            response boxes. Write your reactions directly in your notebook.
          </p>
        </div>
      </div>

      {/* 1. Select Set (Real-time Random Set + Predefined Sets) */}
      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 p-4 sm:p-6 space-y-4">
        <div>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            1. Choose SRT Set (Live Random or Predefined Set)
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Select <strong>RANDOM SRT SET</strong> to draw fresh situations
            randomly in real time from all {totalPoolCount} situations, or
            pick a fixed predefined set (SRT SET 1–4).
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {sets.map((s) => {
            const active = selectedSetId === s.id;
            return (
              <button
                key={s.id}
                type="button"
                data-testid={`srt-set-card-${s.id}`}
                onClick={() => setSelectedSetId(s.id)}
                className={`text-left p-4 rounded-lg border transition-colors flex flex-col justify-between gap-2 ${
                  active
                    ? "border-zinc-900 dark:border-zinc-400 bg-zinc-100 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100"
                    : "border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/40 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-700"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {s.label}
                    </span>
                    {s.isRandom ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700">
                        <Shuffle className="w-3 h-3" />
                        REAL-TIME RANDOM
                      </span>
                    ) : (
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-200/80 dark:bg-zinc-800/90 text-zinc-700 dark:text-zinc-300">
                        Predefined Set
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    {s.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Choose Number of SRTs & Equivalent Invisible Timer */}
      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 p-4 sm:p-6 space-y-4">
        <div>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            2. Number of SRTs & Equivalent Invisible Timer
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Situations are displayed <strong>5 SRTs at a time</strong> (one
            booklet sheet) with an invisible timer equivalent to 30 seconds
            per SRT.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              count: 5,
              label: "5 SRTs (1 Sheet)",
              sub: "2m 30s Invisible Timer",
            },
            {
              count: 15,
              label: "15 SRTs (3 Sheets)",
              sub: "7m 30s Invisible Timer",
            },
            {
              count: 30,
              label: "30 SRTs (6 Sheets)",
              sub: "15m 00s Invisible Timer",
            },
            {
              count: 60,
              label: "60 SRTs (Full Test)",
              sub: "30m 00s Invisible Timer",
            },
          ].map((opt) => {
            const active = questionCount === opt.count;
            return (
              <button
                key={opt.count}
                type="button"
                data-testid={`srt-count-${opt.count}`}
                onClick={() => setQuestionCount(opt.count)}
                className={`p-3.5 rounded-lg border text-left transition-colors ${
                  active
                    ? "border-zinc-900 dark:border-zinc-400 bg-zinc-100 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100"
                    : "border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/40 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-700"
                }`}
              >
                <span className="text-sm font-semibold block text-zinc-900 dark:text-zinc-100">
                  {opt.label}
                </span>
                <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 mt-1 block">
                  {opt.sub}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-zinc-200 dark:border-zinc-800/80">
          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            Selected:{" "}
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
              {selectedSet?.label}
            </span>{" "}
            · {questionCount} SRTs ({Math.ceil(questionCount / 5)} Booklet{" "}
            {Math.ceil(questionCount / 5) === 1 ? "Sheet" : "Sheets"}) ·
            Invisible Timer:{" "}
            <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-200">
              {formatClockMs(equivalentTimeMs)}
            </span>
          </div>

          <button
            type="button"
            data-testid="start-srt-btn"
            onClick={() => {
              phaseRef.current = "BRIEFING";
              setPhase("BRIEFING");
            }}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-700 font-semibold text-xs sm:text-sm transition-colors"
          >
            <ClipboardList className="w-4 h-4" />
            <span>
              Start SRT ({questionCount} Situations ·{" "}
              {formatClockMs(equivalentTimeMs)})
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
