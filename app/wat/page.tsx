"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  EyeOff,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  Shuffle,
  Volume2,
  VolumeX,
  Zap,
} from "lucide-react";
import { AttemptedBookletExportCard } from "@/components/psych/AttemptedBookletExportCard";
import { ExamBriefingSlides } from "@/components/psych/ExamBriefingSlides";
import {
  getWatSets,
  getWatTotalWordsCount,
  resolveWatWordsForSet,
  type WatSetDefinition,
  type WatWordItem,
} from "@/lib/psych/catalog";
import { playSsbHallBeep } from "@/lib/psych/audio";
import { preventStimulusExtraction } from "@/lib/psych/hall-utils";
import { systemClock } from "@/lib/session/clock";
import { formatClockMs } from "@/lib/utils";
import {
  loadUserPreferences,
  saveUserPreferences,
} from "@/lib/storage/preferences";

type WatSessionPhase = "SETUP" | "BRIEFING" | "WORD" | "PAGE_TURN" | "COMPLETED";

export default function WatPage() {
  const sets = getWatSets();
  const totalMasterWords = getWatTotalWordsCount();

  const [selectedSetId, setSelectedSetId] = useState<string>(
    sets[0]?.id ?? "wat-allahabad"
  );
  const [practiceMode, setPracticeMode] = useState<"realistic" | "custom">(
    "realistic"
  );
  const [wordDurationSec, setWordDurationSec] = useState<number>(15);
  const [pageTurnDurationSec, setPageTurnDurationSec] = useState<number>(30);
  const [wordsPerPage, setWordsPerPage] = useState<number>(20);
  const [soundAlerts, setSoundAlerts] = useState<boolean>(true);

  // Active runner state
  const [phase, setPhase] = useState<WatSessionPhase>("SETUP");
  const [activeSet, setActiveSet] = useState<WatSetDefinition | null>(null);
  const [sessionWords, setSessionWords] = useState<WatWordItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [remainingMs, setRemainingMs] = useState<number>(15000);
  const [startedAtIso, setStartedAtIso] = useState<string>("");
  const [completedAtIso, setCompletedAtIso] = useState<string>("");
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Refs for deterministic high-precision clock loop
  const phaseRef = useRef<WatSessionPhase>("SETUP");
  const currentIndexRef = useRef<number>(0);
  const sessionWordsRef = useRef<WatWordItem[]>([]);
  const phaseStartedMonoRef = useRef<number>(0);
  const phaseDurationMsRef = useRef<number>(15000);
  const pausedRemainingMsRef = useRef<number | null>(null);
  const soundEnabledRef = useRef<boolean>(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const querySet = params.get("set") ?? params.get("setId");
      if (querySet && sets.some((s) => s.id === querySet)) {
        setSelectedSetId(querySet);
      }
    }
    const prefs = loadUserPreferences();
    setSoundAlerts(prefs.soundAlerts ?? true);
    soundEnabledRef.current = prefs.soundAlerts ?? true;
  }, [sets]);

  const startWordAt = useCallback(
    (index: number, wordsList: WatWordItem[], wordSec: number) => {
      const durationMs = Math.max(1, wordSec) * 1000;
      phaseRef.current = "WORD";
      currentIndexRef.current = index;
      phaseStartedMonoRef.current = systemClock.nowMono();
      phaseDurationMsRef.current = durationMs;
      pausedRemainingMsRef.current = null;

      setPhase("WORD");
      setCurrentIndex(index);
      setRemainingMs(durationMs);
      setIsPaused(false);
      playSsbHallBeep("word-beep", soundEnabledRef.current);
    },
    []
  );

  const startPageTurn = useCallback((pageTurnSec: number) => {
    const durationMs = Math.max(1, pageTurnSec) * 1000;
    phaseRef.current = "PAGE_TURN";
    phaseStartedMonoRef.current = systemClock.nowMono();
    phaseDurationMsRef.current = durationMs;
    pausedRemainingMsRef.current = null;

    setPhase("PAGE_TURN");
    setRemainingMs(durationMs);
    setIsPaused(false);
    playSsbHallBeep("page-turn", soundEnabledRef.current);
  }, []);

  const completeSession = useCallback(() => {
    phaseRef.current = "COMPLETED";
    pausedRemainingMsRef.current = null;
    setPhase("COMPLETED");
    setCompletedAtIso(new Date(systemClock.nowWall()).toISOString());
    setIsPaused(false);
    playSsbHallBeep("completed", soundEnabledRef.current);
  }, []);

  const advanceCurrentStep = useCallback(() => {
    const curPhase = phaseRef.current;
    const idx = currentIndexRef.current;
    const words = sessionWordsRef.current;
    const wordSec = practiceMode === "realistic" ? 15 : wordDurationSec;
    const turnSec = practiceMode === "realistic" ? 30 : pageTurnDurationSec;
    const perPage = Math.max(1, wordsPerPage);

    if (curPhase === "WORD") {
      const completedCount = idx + 1;
      const isLastWord = completedCount >= words.length;
      if (isLastWord) {
        completeSession();
        return;
      }
      // After every 20 words (e.g. Word 20, Word 40), trigger 30-second page turn break
      if (completedCount % perPage === 0) {
        startPageTurn(turnSec);
        return;
      }
      startWordAt(idx + 1, words, wordSec);
    } else if (curPhase === "PAGE_TURN") {
      startWordAt(idx + 1, words, wordSec);
    }
  }, [
    completeSession,
    pageTurnDurationSec,
    practiceMode,
    startPageTurn,
    startWordAt,
    wordDurationSec,
    wordsPerPage,
  ]);

  // High-precision clock loop + test clock subscription
  useEffect(() => {
    if (phase !== "WORD" && phase !== "PAGE_TURN") return;

    const tick = () => {
      if (pausedRemainingMsRef.current !== null) {
        setRemainingMs(pausedRemainingMsRef.current);
        return;
      }
      let safety = 0;
      while (
        (phaseRef.current === "WORD" || phaseRef.current === "PAGE_TURN") &&
        safety < 200
      ) {
        safety++;
        const now = systemClock.nowMono();
        const elapsed = now - phaseStartedMonoRef.current;
        const rem = Math.max(0, phaseDurationMsRef.current - elapsed);
        setRemainingMs(rem);
        if (rem <= 0) {
          const prevFinishMono =
            phaseStartedMonoRef.current + phaseDurationMsRef.current;
          advanceCurrentStep();
          if (
            phaseRef.current === "WORD" ||
            phaseRef.current === "PAGE_TURN"
          ) {
            phaseStartedMonoRef.current = prevFinishMono;
          }
        } else {
          break;
        }
      }
    };

    const unsub = systemClock.subscribe ? systemClock.subscribe(tick) : () => {};
    const interval = setInterval(tick, 80);
    return () => {
      unsub();
      clearInterval(interval);
    };
  }, [phase, advanceCurrentStep]);

  function handleStartWat() {
    const resolved = resolveWatWordsForSet(selectedSetId);
    sessionWordsRef.current = resolved.words;
    setActiveSet(resolved.set);
    setSessionWords(resolved.words);
    setStartedAtIso(new Date(systemClock.nowWall()).toISOString());
    const wordSec = practiceMode === "realistic" ? 15 : wordDurationSec;
    startWordAt(0, resolved.words, wordSec);
  }

  function handleTogglePause() {
    if (phase !== "WORD" && phase !== "PAGE_TURN") return;
    if (pausedRemainingMsRef.current === null) {
      const elapsed = systemClock.nowMono() - phaseStartedMonoRef.current;
      const rem = Math.max(0, phaseDurationMsRef.current - elapsed);
      pausedRemainingMsRef.current = rem;
      setRemainingMs(rem);
      setIsPaused(true);
    } else {
      const rem = pausedRemainingMsRef.current;
      phaseStartedMonoRef.current = systemClock.nowMono();
      phaseDurationMsRef.current = rem;
      pausedRemainingMsRef.current = null;
      setIsPaused(false);
    }
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
      // Ignore fullscreen errors
    }
  }

  // COMPLETED SCREEN
  if (phase === "COMPLETED" && activeSet) {
    const attemptedCount = Math.min(sessionWords.length, currentIndex + 1);
    const attemptedWords = sessionWords.slice(0, attemptedCount);
    return (
      <div
        data-testid="wat-completed-screen"
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
                    STOP WRITING — WAT COMPLETED
                  </span>
                  <h1 className="text-xl sm:text-2xl font-semibold text-zinc-100">
                    {activeSet.label} — {attemptedWords.length} Words Projected
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
                  <span>Attempt Another WAT Set</span>
                </button>
                <Link
                  href="/srt"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold transition-colors"
                >
                  <span>Proceed to SRT</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-zinc-800">
              <div className="p-3 rounded-md bg-zinc-950 border border-zinc-800/80">
                <span className="text-[11px] text-zinc-400 block">
                  Selection Board / Set
                </span>
                <span className="text-sm font-semibold text-zinc-100 mt-0.5 block">
                  {activeSet.board || activeSet.label}
                </span>
              </div>
              <div className="p-3 rounded-md bg-zinc-950 border border-zinc-800/80">
                <span className="text-[11px] text-zinc-400 block">
                  Words Projected
                </span>
                <span className="text-lg font-mono font-semibold text-zinc-100 mt-0.5 block">
                  {attemptedWords.length} / {sessionWords.length}
                </span>
              </div>
              <div className="p-3 rounded-md bg-zinc-950 border border-zinc-800/80">
                <span className="text-[11px] text-zinc-400 block">
                  Word Interval
                </span>
                <span className="text-sm font-mono font-semibold text-zinc-100 mt-0.5 block">
                  {practiceMode === "realistic"
                    ? "15s + Beep"
                    : `${wordDurationSec}s`}
                </span>
              </div>
              <div className="p-3 rounded-md bg-zinc-950 border border-zinc-800/80">
                <span className="text-[11px] text-zinc-400 block">
                  Page-Turn Breaks
                </span>
                <span className="text-sm font-mono font-semibold text-zinc-100 mt-0.5 block">
                  30s every 20 words
                </span>
              </div>
            </div>

            {/* Export Attempted Question Booklet PDF + AI Evaluation Prompt */}
            <AttemptedBookletExportCard
              data={{
                title: `WAT Question Booklet — ${activeSet.label}`,
                subtitle: `${activeSet.description} (${attemptedWords.length} Words · 15s each · 30s page turn after every 20 words)`,
                startedAtIso,
                completedAtIso,
                wat: {
                  setLabel: activeSet.label,
                  board: activeSet.board,
                  words: attemptedWords,
                },
              }}
            />

            {/* Complete 60-word reference list */}
            <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                  Attempted WAT Words ({attemptedWords.length})
                </h2>
                <span className="text-[11px] text-zinc-400">
                  Compare against your handwritten WAT sentences in your booklet
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-80 overflow-y-auto pr-1">
                {attemptedWords.map((w, idx) => (
                  <div
                    key={w.id}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded border border-zinc-800/90 bg-zinc-900/60 text-xs"
                  >
                    <span className="font-mono text-zinc-400 w-6 shrink-0">
                      #{idx + 1}
                    </span>
                    <span className="font-semibold text-zinc-100 truncate">
                      {w.word}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ACTIVE HALL PROJECTION (WORD OR 30s PAGE TURN)
  if ((phase === "WORD" || phase === "PAGE_TURN") && activeSet) {
    const currentWord = sessionWords[currentIndex];
    const isRealMode = practiceMode === "realistic";
    const currentBookletPage = Math.floor(currentIndex / wordsPerPage) + 1;
    const nextBookletPage = currentBookletPage + 1;

    return (
      <div
        data-testid="wat-session-runner"
        onContextMenu={preventStimulusExtraction}
        className="fixed inset-0 z-50 overflow-y-auto bg-zinc-950 text-zinc-100 flex flex-col select-none"
      >
        {/* Minimal Hall Top Bar */}
        <header className="border-b border-zinc-900 bg-zinc-950/90 px-3 sm:px-6 py-2.5">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="px-2.5 py-1 rounded text-xs font-mono font-semibold bg-zinc-900 text-zinc-100 border border-zinc-800">
                {activeSet.label}
              </span>
              <span className="hidden md:inline-flex items-center gap-1.5 text-xs text-zinc-400">
                <span>SSB Hall Projection</span>
                <span>·</span>
                <span>WAT Sheet {currentBookletPage}</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              {isRealMode && phase === "WORD" ? (
                <div
                  data-testid="wat-real-mode-badge"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-400"
                >
                  <EyeOff className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="hidden sm:inline">
                    Real Hall Mode (15s Beep)
                  </span>
                  <span className="sm:hidden">15s Beep</span>
                </div>
              ) : (
                <div
                  data-testid="wat-timer-display"
                  className="px-3 py-1 rounded font-mono text-sm font-semibold tabular-nums bg-zinc-900 text-zinc-100 border border-zinc-800"
                >
                  {formatClockMs(remainingMs)}
                </div>
              )}

              {!isRealMode && (
                <button
                  type="button"
                  onClick={handleTogglePause}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 text-xs"
                >
                  {isPaused ? (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span>Resume</span>
                    </>
                  ) : (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      <span>Pause</span>
                    </>
                  )}
                </button>
              )}

              <button
                type="button"
                onClick={handleToggleSound}
                aria-label={soundAlerts ? "Mute beep" : "Unmute beep"}
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
                data-testid="wat-skip-step-btn"
                onClick={() => advanceCurrentStep()}
                className="px-2.5 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-medium"
                title="Advance to next word"
              >
                Next
              </button>

              <button
                type="button"
                data-testid="wat-finish-early-btn"
                onClick={() => completeSession()}
                className="px-3 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-colors"
              >
                Finish Test
              </button>
            </div>
          </div>
        </header>

        {/* Main Hall Projection Stage */}
        <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
          {phase === "WORD" && currentWord ? (
            <div
              data-testid="wat-word-stage"
              className="w-full max-w-4xl rounded-xl border border-zinc-800/80 bg-black min-h-[65dvh] flex flex-col items-center justify-between p-6 sm:p-12 text-center shadow-2xl"
            >
              <div className="w-full flex items-center justify-between text-xs font-mono text-zinc-400">
                <span>WORD ASSOCIATION TEST (WAT)</span>
                <span>
                  WRITE SENTENCE IN WAT SHEET (PAGE {currentBookletPage})
                </span>
              </div>

              <div className="my-auto py-12">
                <h1
                  data-testid="wat-active-word"
                  className="text-5xl sm:text-7xl md:text-8xl font-bold tracking-wide text-white uppercase font-mono"
                >
                  {currentWord.word}
                </h1>
              </div>

              <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-zinc-400 border-t border-zinc-900 pt-4">
                <span>
                  15 seconds per word · Next word flashes automatically with a
                  beep
                </span>
                <span>
                  30s page-turn pause after every 20 words
                </span>
              </div>
            </div>
          ) : (
            <div
              data-testid="wat-page-turn-stage"
              className="w-full max-w-2xl rounded-xl border border-amber-500/40 bg-zinc-900/90 p-6 sm:p-10 text-center space-y-5"
            >
              <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center justify-center mx-auto">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <span className="text-xs font-mono uppercase tracking-widest text-amber-300">
                  SHEET COMPLETED — TURN BOOKLET PAGE
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-white">
                  Turn to WAT Page {nextBookletPage} in Your Booklet
                </h2>
                <p className="text-xs sm:text-sm text-zinc-300 max-w-md mx-auto leading-relaxed">
                  You have completed 20 words on this sheet. Turn the page of your
                  physical Psychological Test Booklet and get ready for the next
                  sheet.
                </p>
              </div>

              <div className="py-3">
                <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block">
                  NEXT WORD IN
                </span>
                <span
                  data-testid="wat-page-turn-countdown"
                  className="text-4xl sm:text-5xl font-mono font-bold text-amber-300 tabular-nums mt-1 block"
                >
                  {formatClockMs(remainingMs)}
                </span>
              </div>

              <button
                type="button"
                onClick={() => advanceCurrentStep()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold transition-colors"
              >
                <span>Resume Next Sheet Immediately</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </main>
      </div>
    );
  }

  // SETUP & BRIEFING SCREEN
  const selectedSet = sets.find((s) => s.id === selectedSetId) ?? sets[0];

  if (phase === "BRIEFING") {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <ExamBriefingSlides
          examType="wat"
          setLabel={`${selectedSet?.label ?? "WAT Set"} (60 Words · 15s + Beep)`}
          onComplete={handleStartWat}
          onCancel={() => {
            phaseRef.current = "SETUP";
            setPhase("SETUP");
          }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-zinc-200/90 dark:border-white/[0.08] bg-white dark:bg-[#0b0f17] p-5 sm:p-6 shadow-sm">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </Link>
            <span className="text-zinc-400">·</span>
            <span className="text-xs font-mono uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-semibold">
              STAGE 2 PSYCHOLOGY — WAT (60 WORDS)
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
            Word Association Test (WAT) Simulator
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Recent Selection Board WAT sets (SSB Allahabad, Bangalore,
            Jalandhar, Bhopal, 1 AFSB Dehradun) + Random sets. Displays each
            word for <strong>15 seconds</strong> with a{" "}
            <strong>beep sound</strong> and a{" "}
            <strong>30-second page-turn timer after every 20 words</strong>.
          </p>
        </div>
      </div>

      {/* SSB Selection Board & Set Picker */}
      <div className="rounded-2xl border border-zinc-200/90 dark:border-white/[0.08] bg-white dark:bg-[#0b0f17] p-5 sm:p-6 space-y-4 shadow-sm">
        <div>
          <h2 className="text-base font-bold text-zinc-900 dark:text-white">
            1. Select SSB Selection Board or Practice Set
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Every set contains 60 WAT words. Boards with fewer recent words
            automatically include unattempted words from the master pool (
            {totalMasterWords} total words).
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {sets.map((s) => {
            const active = selectedSetId === s.id;
            return (
              <button
                key={s.id}
                type="button"
                data-testid={`wat-set-card-${s.id}`}
                onClick={() => setSelectedSetId(s.id)}
                className={`text-left p-4 rounded-lg border transition-colors flex flex-col justify-between gap-2 ${
                  active
                    ? "border-zinc-900 dark:border-zinc-100 bg-zinc-100/80 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100"
                    : "border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-950/40 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-700"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {s.label}
                    </span>
                    {s.isRandom ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
                        <Shuffle className="w-3 h-3" />
                        LIVE
                      </span>
                    ) : (
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-200/80 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-300">
                        {s.wordCount} Words
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {s.description}
                  </p>
                </div>
                <div className="pt-2 border-t border-zinc-200/80 dark:border-zinc-800/60 flex items-center justify-between text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                  <span>15s / word + Beep</span>
                  <span>30s turn @ 20 &amp; 40</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mode & Timing Configuration */}
      <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 sm:p-6 space-y-4">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          2. Hall Timing &amp; Audio Configuration
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setPracticeMode("realistic")}
            className={`p-4 rounded-lg border text-left transition-colors ${
              practiceMode === "realistic"
                ? "border-zinc-900 dark:border-zinc-100 bg-zinc-100/80 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100"
                : "border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-950/40 text-zinc-700 dark:text-zinc-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Real SSB Hall Mode (Recommended)
              </span>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
                Default
              </span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1.5 leading-relaxed">
              Each word stays on screen for 15 seconds with no distracting
              countdown timer, transitions with a beep sound, and pauses for 30
              seconds after every 20 words to turn the booklet page.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setPracticeMode("custom")}
            className={`p-4 rounded-lg border text-left transition-colors ${
              practiceMode === "custom"
                ? "border-zinc-900 dark:border-zinc-100 bg-zinc-100/80 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100"
                : "border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-950/40 text-zinc-700 dark:text-zinc-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Practice Mode (Visible Timer)
              </span>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400">
                Configurable
              </span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1.5 leading-relaxed">
              Displays a visible countdown timer and allows pausing or
              customizing word interval and page-turn break duration.
            </p>
          </button>
        </div>

        {practiceMode === "custom" && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs text-zinc-600 dark:text-zinc-400 mb-1">
                Seconds per Word (Default 15s)
              </label>
              <input
                type="number"
                min={3}
                max={60}
                value={wordDurationSec}
                onChange={(e) =>
                  setWordDurationSec(Math.max(3, Number(e.target.value) || 15))
                }
                className="w-full px-3 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-100 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-600 dark:text-zinc-400 mb-1">
                Page-Turn Timer (Default 30s)
              </label>
              <input
                type="number"
                min={5}
                max={120}
                value={pageTurnDurationSec}
                onChange={(e) =>
                  setPageTurnDurationSec(
                    Math.max(5, Number(e.target.value) || 30)
                  )
                }
                className="w-full px-3 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-100 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-600 dark:text-zinc-400 mb-1">
                Words per Booklet Page (Default 20)
              </label>
              <input
                type="number"
                min={5}
                max={60}
                value={wordsPerPage}
                onChange={(e) =>
                  setWordsPerPage(Math.max(5, Number(e.target.value) || 20))
                }
                className="w-full px-3 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm text-zinc-900 dark:text-zinc-100 font-mono"
              />
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <div className="text-xs text-zinc-600 dark:text-zinc-400">
            Selected:{" "}
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
              {selectedSet?.label}
            </span>{" "}
            · 60 Words · Total Duration ~16m 00s (incl. two 30s page turns)
          </div>
          <button
            type="button"
            data-testid="start-wat-btn"
            onClick={() => {
              phaseRef.current = "BRIEFING";
              setPhase("BRIEFING");
            }}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 font-semibold text-xs sm:text-sm transition-colors"
          >
            <Zap className="w-4 h-4" />
            <span>Start {selectedSet?.label} (60 Words)</span>
          </button>
        </div>
      </div>

      {/* Static SSR SEO Guide: SSB WAT Rules, OLQ Sentence Framing & FAQs */}
      <section
        aria-labelledby="wat-seo-guide-heading"
        className="rounded-2xl border border-zinc-200/90 dark:border-white/[0.08] bg-white dark:bg-[#0b0f17] p-5 sm:p-8 space-y-6 shadow-sm"
      >
        <div className="space-y-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-semibold">
            DIPR STAGE-2 PSYCHOLOGY GUIDE
          </span>
          <h2
            id="wat-seo-guide-heading"
            className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white"
          >
            How the SSB Word Association Test (WAT) Works &amp; How to Frame OLQ Sentences
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Immediately after TAT, the SSB Word Association Test (WAT) projects <strong>60 words</strong> sequentially for <strong>15 seconds per word</strong> with an audio hall cue. Each page of the official SSB booklet holds 20 numbered lines, with a brief page-turn interval after words 20 and 40. Because 15 seconds leaves no room for artificial fabrication, WAT reveals your natural attitude, emotional stability, and sense of responsibility.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-zinc-200/80 dark:border-white/[0.08] bg-zinc-50/70 dark:bg-white/[0.02] p-4 space-y-1.5">
            <h3 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white">
              1. Action Over Preaching
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Avoid moralizing slogans (&ldquo;One should...&rdquo;, &ldquo;We must...&rdquo;) or dictionary definitions. Write observational or action-oriented sentences showing cause and constructive effect (8–12 words).
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200/80 dark:border-white/[0.08] bg-zinc-50/70 dark:bg-white/[0.02] p-4 space-y-1.5">
            <h3 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white">
              2. Handling Negative Trigger Words
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Words like <em>Fear</em>, <em>Defeat</em>, <em>Failure</em>, or <em>Blood</em> test Factor IV (Courage, Determination) and emotional maturity. Acknowledge the challenge and show how preparation or calm analysis overcomes it.
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200/80 dark:border-white/[0.08] bg-zinc-50/70 dark:bg-white/[0.02] p-4 space-y-1.5">
            <h3 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white">
              3. Recovery From Missed Words
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              If a word switches before you finish, immediately move to the next line number in your booklet. Never carry over a previous word&apos;s thought or mismatch your booklet numbering.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
