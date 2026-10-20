"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  EyeOff,
  Layers,
  RotateCcw,
  Volume2,
  VolumeX,
} from "lucide-react";
import { AttemptedBookletExportCard } from "@/components/psych/AttemptedBookletExportCard";
import { ExamBriefingSlides } from "@/components/psych/ExamBriefingSlides";
import {
  getPracticeSetById,
  getPracticeSets,
  getSlidesForSet,
  type ResolvedStimulus,
} from "@/lib/tat/catalog";
import {
  getSdtDefaultDurationMs,
  getSdtPrompts,
  getSrtSets,
  getWatSets,
  resolveSrtQuestionsForSet,
  resolveWatWordsForSet,
  type SrtQuestionItem,
  type SrtSetDefinition,
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

type FullTestStage =
  | "SETUP"
  | "BRIEFING"
  | "TAT_OBSERVATION"
  | "TAT_WRITING"
  | "BREAK_TO_WAT"
  | "WAT_WORD"
  | "WAT_PAGE_TURN"
  | "BREAK_TO_SRT"
  | "SRT_ACTIVE"
  | "BREAK_TO_SDT"
  | "SDT_ACTIVE"
  | "COMPLETED";

export default function FullPsychTestPage() {
  const tatSets = getPracticeSets();
  const watSets = getWatSets();
  const srtSets = getSrtSets();
  const sdtPrompts = getSdtPrompts();

  // Selections
  const [selectedTatSetId, setSelectedTatSetId] = useState<string>(
    tatSets[0]?.id ?? "set-1"
  );
  const [selectedWatSetId, setSelectedWatSetId] = useState<string>(
    watSets[0]?.id ?? "wat-allahabad"
  );
  const [selectedSrtSetId, setSelectedSrtSetId] =
    useState<string>("srt-random");
  const [soundAlerts, setSoundAlerts] = useState<boolean>(true);

  // Active battery state
  const [stage, setStage] = useState<FullTestStage>("SETUP");
  const [tatSlides, setTatSlides] = useState<ResolvedStimulus[]>([]);
  const [tatIndex, setTatIndex] = useState<number>(0);

  const [watSet, setWatSet] = useState<WatSetDefinition | null>(null);
  const [watWords, setWatWords] = useState<WatWordItem[]>([]);
  const [watIndex, setWatIndex] = useState<number>(0);

  const [srtSet, setSrtSet] = useState<SrtSetDefinition | null>(null);
  const [srtQuestions, setSrtQuestions] = useState<SrtQuestionItem[]>([]);
  const [srtSheetIndex, setSrtSheetIndex] = useState<number>(0);

  const [remainingMs, setRemainingMs] = useState<number>(0);
  const [startedAtIso, setStartedAtIso] = useState<string>("");
  const [completedAtIso, setCompletedAtIso] = useState<string>("");
  const [finishedAtStage, setFinishedAtStage] =
    useState<FullTestStage>("SDT_ACTIVE");

  // Refs for clock loop
  const stageRef = useRef<FullTestStage>("SETUP");
  const tatIndexRef = useRef<number>(0);
  const tatSlidesRef = useRef<ResolvedStimulus[]>([]);
  const watIndexRef = useRef<number>(0);
  const watWordsRef = useRef<WatWordItem[]>([]);
  const srtSheetRef = useRef<number>(0);
  const phaseStartedMonoRef = useRef<number>(0);
  const phaseDurationMsRef = useRef<number>(0);
  const soundEnabledRef = useRef<boolean>(true);

  useEffect(() => {
    const prefs = loadUserPreferences();
    setSoundAlerts(prefs.soundAlerts ?? true);
    soundEnabledRef.current = prefs.soundAlerts ?? true;
  }, []);

  const enterPhase = useCallback(
    (
      nextStage: FullTestStage,
      durationMs: number,
      beepKind?:
        | "observation"
        | "writing"
        | "word-beep"
        | "page-turn"
        | "sheet-advance"
        | "completed"
    ) => {
      stageRef.current = nextStage;
      phaseStartedMonoRef.current = systemClock.nowMono();
      phaseDurationMsRef.current = durationMs;
      setStage(nextStage);
      setRemainingMs(durationMs);
      if (beepKind) {
        playSsbHallBeep(beepKind, soundEnabledRef.current);
      }
    },
    []
  );

  const advanceBatteryPhase = useCallback(() => {
    const cur = stageRef.current;

    if (cur === "TAT_OBSERVATION") {
      // 30s observation elapsed -> 4m (240s) writing in notebook
      enterPhase("TAT_WRITING", 240 * 1000, "writing");
      return;
    }

    if (cur === "TAT_WRITING") {
      const nextIdx = tatIndexRef.current + 1;
      if (nextIdx < tatSlidesRef.current.length) {
        tatIndexRef.current = nextIdx;
        setTatIndex(nextIdx);
        enterPhase("TAT_OBSERVATION", 30 * 1000, "observation");
      } else {
        enterPhase("BREAK_TO_WAT", 30 * 1000, "page-turn");
      }
      return;
    }

    if (cur === "BREAK_TO_WAT") {
      watIndexRef.current = 0;
      setWatIndex(0);
      enterPhase("WAT_WORD", 15 * 1000, "word-beep");
      return;
    }

    if (cur === "WAT_WORD") {
      const completedWords = watIndexRef.current + 1;
      if (completedWords >= watWordsRef.current.length) {
        enterPhase("BREAK_TO_SRT", 30 * 1000, "page-turn");
        return;
      }
      if (completedWords % 20 === 0) {
        enterPhase("WAT_PAGE_TURN", 30 * 1000, "page-turn");
        return;
      }
      watIndexRef.current = completedWords;
      setWatIndex(completedWords);
      enterPhase("WAT_WORD", 15 * 1000, "word-beep");
      return;
    }

    if (cur === "WAT_PAGE_TURN") {
      const nextWordIdx = watIndexRef.current + 1;
      watIndexRef.current = nextWordIdx;
      setWatIndex(nextWordIdx);
      enterPhase("WAT_WORD", 15 * 1000, "word-beep");
      return;
    }

    if (cur === "BREAK_TO_SRT") {
      srtSheetRef.current = 0;
      setSrtSheetIndex(0);
      // 60 SRTs * 30s = 30 minutes (1,800,000 ms)
      enterPhase("SRT_ACTIVE", 30 * 60 * 1000, "sheet-advance");
      return;
    }

    if (cur === "SRT_ACTIVE") {
      enterPhase("BREAK_TO_SDT", 30 * 1000, "page-turn");
      return;
    }

    if (cur === "BREAK_TO_SDT") {
      enterPhase("SDT_ACTIVE", getSdtDefaultDurationMs(), "writing");
      return;
    }

    if (cur === "SDT_ACTIVE") {
      setCompletedAtIso(new Date(systemClock.nowWall()).toISOString());
      enterPhase("COMPLETED", 0, "completed");
    }
  }, [enterPhase]);

  useEffect(() => {
    if (stage === "SETUP" || stage === "BRIEFING" || stage === "COMPLETED")
      return;

    const tick = () => {
      if (
        stageRef.current === "SETUP" ||
        stageRef.current === "BRIEFING" ||
        stageRef.current === "COMPLETED"
      ) {
        return;
      }
      const elapsed = systemClock.nowMono() - phaseStartedMonoRef.current;
      const rem = Math.max(0, phaseDurationMsRef.current - elapsed);
      setRemainingMs(rem);

      // During SRT_ACTIVE, auto-advance 5-SRT sheet every 2m 30s (150,000 ms)
      if (stageRef.current === "SRT_ACTIVE") {
        const totalSheets = Math.max(1, Math.ceil(srtQuestions.length / 5));
        const computedSheet = Math.min(
          totalSheets - 1,
          Math.floor(elapsed / (150 * 1000))
        );
        if (computedSheet > srtSheetRef.current) {
          srtSheetRef.current = computedSheet;
          setSrtSheetIndex(computedSheet);
          playSsbHallBeep("sheet-advance", soundEnabledRef.current);
        }
      }

      if (rem <= 0) {
        advanceBatteryPhase();
      }
    };

    const unsub = systemClock.subscribe ? systemClock.subscribe(tick) : () => {};
    const interval = setInterval(tick, 100);
    return () => {
      unsub();
      clearInterval(interval);
    };
  }, [stage, srtQuestions.length, advanceBatteryPhase]);

  function handleOpenFullBriefing() {
    stageRef.current = "BRIEFING";
    setStage("BRIEFING");
  }

  function handleStartFullBattery() {
    const slides = getSlidesForSet(selectedTatSetId);
    const resolvedWat = resolveWatWordsForSet(selectedWatSetId);
    const resolvedSrt = resolveSrtQuestionsForSet(selectedSrtSetId, 60);

    tatSlidesRef.current = slides;
    tatIndexRef.current = 0;
    watWordsRef.current = resolvedWat.words;
    watIndexRef.current = 0;
    srtSheetRef.current = 0;

    setTatSlides(slides);
    setTatIndex(0);
    setWatSet(resolvedWat.set);
    setWatWords(resolvedWat.words);
    setWatIndex(0);
    setSrtSet(resolvedSrt.set);
    setSrtQuestions(resolvedSrt.questions);
    setSrtSheetIndex(0);
    setFinishedAtStage("SDT_ACTIVE");
    setStartedAtIso(new Date(systemClock.nowWall()).toISOString());

    enterPhase("TAT_OBSERVATION", 30 * 1000, "observation");
  }

  function handleJumpToNextModule() {
    const cur = stageRef.current;
    if (cur === "TAT_OBSERVATION" || cur === "TAT_WRITING") {
      enterPhase("BREAK_TO_WAT", 30 * 1000, "page-turn");
    } else if (
      cur === "BREAK_TO_WAT" ||
      cur === "WAT_WORD" ||
      cur === "WAT_PAGE_TURN"
    ) {
      enterPhase("BREAK_TO_SRT", 30 * 1000, "page-turn");
    } else if (cur === "BREAK_TO_SRT" || cur === "SRT_ACTIVE") {
      enterPhase("BREAK_TO_SDT", 30 * 1000, "page-turn");
    } else if (cur === "BREAK_TO_SDT" || cur === "SDT_ACTIVE") {
      setFinishedAtStage("SDT_ACTIVE");
      setCompletedAtIso(new Date(systemClock.nowWall()).toISOString());
      enterPhase("COMPLETED", 0, "completed");
    }
  }

  function handleFinishFullTestEarly() {
    setFinishedAtStage(stageRef.current);
    setCompletedAtIso(new Date(systemClock.nowWall()).toISOString());
    enterPhase("COMPLETED", 0, "completed");
  }

  function handleToggleSound() {
    const next = !soundAlerts;
    setSoundAlerts(next);
    soundEnabledRef.current = next;
    saveUserPreferences({ soundAlerts: next });
  }

  const tatSetRecord = getPracticeSetById(selectedTatSetId);

  if (stage === "BRIEFING") {
    const watLabel =
      watSets.find((w) => w.id === selectedWatSetId)?.label ?? "WAT";
    const srtLabel =
      srtSets.find((s) => s.id === selectedSrtSetId)?.label ?? "SRT";
    return (
      <ExamBriefingSlides
        examType="full-test"
        setLabel={`${tatSetRecord?.title ?? "SET 1"} + ${watLabel} + ${srtLabel} + SDT`}
        onCancel={() => {
          stageRef.current = "SETUP";
          setStage("SETUP");
        }}
        onStartExam={handleStartFullBattery}
      />
    );
  }

  // COMPLETED SCREEN
  if (stage === "COMPLETED") {
    const isFinishedInTat =
      finishedAtStage === "TAT_OBSERVATION" ||
      finishedAtStage === "TAT_WRITING";
    const isFinishedInWat =
      finishedAtStage === "BREAK_TO_WAT" ||
      finishedAtStage === "WAT_WORD" ||
      finishedAtStage === "WAT_PAGE_TURN";
    const isFinishedInSrt =
      finishedAtStage === "BREAK_TO_SRT" || finishedAtStage === "SRT_ACTIVE";

    const attemptedTatSlides = isFinishedInTat
      ? tatSlides.slice(0, Math.max(1, tatIndex + 1))
      : tatSlides;
    const attemptedWatWords = isFinishedInTat
      ? []
      : isFinishedInWat
        ? finishedAtStage === "BREAK_TO_WAT"
          ? []
          : watWords.slice(0, Math.max(1, watIndex + 1))
        : watWords;
    const attemptedSrtQuestions =
      isFinishedInTat || isFinishedInWat
        ? []
        : isFinishedInSrt
          ? finishedAtStage === "BREAK_TO_SRT"
            ? []
            : srtQuestions.slice(0, Math.max(5, (srtSheetIndex + 1) * 5))
          : srtQuestions;
    const includeSdt =
      !isFinishedInTat && !isFinishedInWat && !isFinishedInSrt;

    return (
      <div
        data-testid="full-test-completed-screen"
        className="fixed inset-0 z-50 overflow-y-auto bg-zinc-950 text-zinc-100 py-8 sm:py-12 px-4 sm:px-6"
      >
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-5 sm:p-8 space-y-6">
            <div className="flex items-start sm:items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-md bg-zinc-800 text-zinc-100 shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                    COMPLETE SSB STAGE-2 PSYCHOLOGICAL BATTERY FINISHED
                  </span>
                  <h1 className="text-xl sm:text-2xl font-semibold text-zinc-100">
                    Full Psychological Test Completed (TAT + WAT + SRT + SDT)
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStage("SETUP")}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-100"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>New Full Battery</span>
                </button>
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold"
                >
                  <span>Dashboard</span>
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-zinc-800">
              <div className="p-3 rounded-md bg-zinc-950 border border-zinc-800/80">
                <span className="text-[11px] text-zinc-400 block">
                  1. TAT Set
                </span>
                <span className="text-sm font-semibold text-zinc-100 mt-0.5 block">
                  {tatSetRecord?.title ?? "SET 1"} ({attemptedTatSlides.length}{" "}
                  Slides)
                </span>
              </div>
              <div className="p-3 rounded-md bg-zinc-950 border border-zinc-800/80">
                <span className="text-[11px] text-zinc-400 block">
                  2. WAT Set
                </span>
                <span className="text-sm font-semibold text-zinc-100 mt-0.5 block">
                  {watSet?.label ?? "WAT"} ({attemptedWatWords.length} Words)
                </span>
              </div>
              <div className="p-3 rounded-md bg-zinc-950 border border-zinc-800/80">
                <span className="text-[11px] text-zinc-400 block">
                  3. SRT Set
                </span>
                <span className="text-sm font-semibold text-zinc-100 mt-0.5 block">
                  {srtSet?.label ?? "SRT"} ({attemptedSrtQuestions.length}{" "}
                  Situations)
                </span>
              </div>
              <div className="p-3 rounded-md bg-zinc-950 border border-zinc-800/80">
                <span className="text-[11px] text-zinc-400 block">
                  4. SDT Section
                </span>
                <span className="text-sm font-semibold text-zinc-100 mt-0.5 block">
                  {includeSdt ? "5 Self-Description Prompts" : "Not Attempted"}
                </span>
              </div>
            </div>

            {/* Unified Complete Booklet PDF + Pin-Point AI Psychologist Prompt */}
            <AttemptedBookletExportCard
              data={{
                title: `Complete SSB Psychological Test Question Booklet (${
                  tatSetRecord?.title ?? "TAT"
                } + ${watSet?.label ?? "WAT"} + ${srtSet?.label ?? "SRT"} + SDT)`,
                subtitle:
                  "Attempted Stage-2 SSB Psychology Dossier for your completed session.",
                startedAtIso,
                completedAtIso,
                tat: {
                  setLabel: tatSetRecord?.title ?? "SET 1",
                  slides: attemptedTatSlides.map((s, idx) => ({
                    number: idx + 1,
                    stimulusId: s.stimulusId,
                    assetPath: s.setFolderAssetPath || s.assetPath,
                    isBlankSlide: Boolean(s.isBlankSlide),
                    description: s.description,
                  })),
                },
                wat:
                  watSet && attemptedWatWords.length > 0
                    ? {
                        setLabel: watSet.label,
                        board: watSet.board,
                        words: attemptedWatWords,
                      }
                    : undefined,
                srt:
                  srtSet && attemptedSrtQuestions.length > 0
                    ? {
                        setLabel: srtSet.label,
                        isRealtimeRandom: srtSet.isRandom,
                        questions: attemptedSrtQuestions,
                      }
                    : undefined,
                sdt: includeSdt
                  ? {
                      prompts: sdtPrompts,
                      durationSeconds: 900,
                    }
                  : undefined,
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  // ACTIVE FULL BATTERY HALL RUNNER
  if (stage !== "SETUP") {
    const activeSlide = tatSlides[tatIndex];
    const activeWord = watWords[watIndex];
    const srtStartIdx = srtSheetIndex * 5;
    const currentFiveSrts = srtQuestions.slice(srtStartIdx, srtStartIdx + 5);
    const totalSrtSheets = Math.max(1, Math.ceil(srtQuestions.length / 5));

    return (
      <div
        data-testid="full-test-runner"
        onContextMenu={preventStimulusExtraction}
        className="fixed inset-0 z-50 overflow-y-auto bg-zinc-950 text-zinc-100 flex flex-col select-none"
      >
        <header className="border-b border-zinc-900 bg-zinc-950/90 px-3 sm:px-6 py-2.5">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="px-2.5 py-1 rounded text-xs font-mono font-semibold bg-zinc-900 text-zinc-100 border border-zinc-800">
                FULL PSYCHOLOGICAL TEST
              </span>
              <span
                data-testid="full-test-stage-indicator"
                className="text-xs sm:text-sm font-mono font-semibold text-zinc-200"
              >
                {stage.startsWith("TAT") &&
                  `Stage 1/4: TAT (${tatSetRecord?.title}) — Slide ${
                    tatIndex + 1
                  } of ${tatSlides.length}`}
                {(stage.startsWith("WAT") || stage === "BREAK_TO_WAT") &&
                  `Stage 2/4: WAT (${watSet?.label}) — Live Word Projection`}
                {(stage.startsWith("SRT") || stage === "BREAK_TO_SRT") &&
                  `Stage 3/4: SRT (${srtSet?.label}) — Sheet ${
                    srtSheetIndex + 1
                  } of ${totalSrtSheets}`}
                {(stage.startsWith("SDT") || stage === "BREAK_TO_SDT") &&
                  `Stage 4/4: SDT (5 Paragraphs · 15m)`}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-400">
                <EyeOff className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Real SSB Hall Mode</span>
              </div>

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
                data-testid="full-test-next-step-btn"
                onClick={() => advanceBatteryPhase()}
                className="px-2.5 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-medium"
              >
                Next Step
              </button>

              <button
                type="button"
                data-testid="full-test-next-module-btn"
                onClick={handleJumpToNextModule}
                className="px-3 py-1.5 rounded bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold"
              >
                {stage === "SDT_ACTIVE" ? "Finish Full Test" : "Next Section →"}
              </button>

              <button
                type="button"
                data-testid="full-test-finish-btn"
                onClick={handleFinishFullTestEarly}
                title="Finish test now and export PDF/AI prompt for attempted sections only"
                className="px-3 py-1.5 rounded border border-emerald-500/40 bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-300 text-xs font-semibold"
              >
                Finish Test
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
          {/* STAGE 1: TAT OBSERVATION */}
          {stage === "TAT_OBSERVATION" && activeSlide && (
            <div className="w-full max-w-5xl flex flex-col items-center gap-4">
              {activeSlide.isBlankSlide ? (
                <div className="w-full max-w-3xl rounded-xl border border-zinc-800 bg-zinc-900/80 p-10 text-center space-y-3">
                  <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">
                    PICTURE 12 OF 12 — BLANK SLIDE (30s OBSERVATION)
                  </span>
                  <h2 className="text-2xl font-semibold text-white">
                    12th Blank Slide — Imagine Your Own Picture
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-300">
                    Visualize a scene of your choice for 30 seconds before writing
                    Story #12 in your booklet.
                  </p>
                </div>
              ) : (
                <div className="w-full rounded-lg border border-zinc-800 bg-black p-2 sm:p-4 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={activeSlide.setFolderAssetPath || activeSlide.assetPath}
                    alt={`SSB Full Battery TAT Picture ${tatIndex + 1} Stimulus`}
                    width={800}
                    height={600}
                    decoding="async"
                    onContextMenu={preventStimulusExtraction}
                    onDragStart={preventStimulusExtraction}
                    className="max-h-[76dvh] w-auto object-contain rounded select-none pointer-events-none"
                  />
                </div>
              )}
              <p className="text-xs font-mono text-zinc-400">
                Observe silently for 30 seconds. Picture will vanish automatically
                for 4 minutes of notebook writing.
              </p>
            </div>
          )}

          {/* STAGE 1: TAT WRITING (PICTURE VANISHED FOR 4 MIN) */}
          {stage === "TAT_WRITING" && (
            <div className="w-full max-w-2xl rounded-xl border border-zinc-800 bg-zinc-900/80 p-6 sm:p-10 text-center space-y-4">
              <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">
                PICTURE {tatIndex + 1} VANISHED — 4 MINUTES WRITING
              </span>
              <h2 className="text-2xl sm:text-3xl font-semibold text-white">
                Write Story #{tatIndex + 1} in Your Physical Booklet
              </h2>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                Keep writing in your notebook. When 4 minutes elapse, a bell will
                sound and Picture #{tatIndex + 2} will appear automatically.
              </p>
            </div>
          )}

          {/* TRANSITION BREAK TO WAT */}
          {stage === "BREAK_TO_WAT" && (
            <div className="w-full max-w-xl rounded-xl border border-amber-500/40 bg-zinc-900 p-6 sm:p-10 text-center space-y-5">
              <span className="text-xs font-mono uppercase tracking-widest text-amber-300">
                TAT COMPLETED — NEXT SECTION: WORD ASSOCIATION TEST (WAT)
              </span>
              <h2 className="text-2xl font-bold text-white">
                Turn Your Booklet to the WAT Section
              </h2>
              <p className="text-xs sm:text-sm text-zinc-300">
                60 words will be projected one by one for 15 seconds each with a
                beep sound, and a 30-second page-turn timer after every 20 words.
              </p>
              <div className="text-3xl font-mono font-bold text-amber-300">
                {formatClockMs(remainingMs)}
              </div>
              <button
                type="button"
                onClick={() => advanceBatteryPhase()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-zinc-100 text-zinc-950 text-xs font-semibold"
              >
                <span>Start WAT Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* STAGE 2: WAT WORD */}
          {stage === "WAT_WORD" && activeWord && (
            <div className="w-full max-w-4xl rounded-xl border border-zinc-800 bg-black min-h-[60dvh] flex flex-col items-center justify-between p-8 sm:p-12 text-center">
              <div className="w-full flex justify-between text-xs font-mono text-zinc-400">
                <span>LIVE WAT STIMULUS</span>
                <span>BOOKLET PAGE {Math.floor(watIndex / 20) + 1}</span>
              </div>
              <h1
                data-testid="full-test-wat-word"
                className="text-5xl sm:text-7xl md:text-8xl font-bold tracking-wide text-white uppercase font-mono my-auto py-10"
              >
                {activeWord.word}
              </h1>
              <div className="text-xs text-zinc-400">
                15 seconds per word + Beep · 30s page turn after every 20 words
              </div>
            </div>
          )}

          {/* STAGE 2: WAT 30s PAGE TURN */}
          {stage === "WAT_PAGE_TURN" && (
            <div className="w-full max-w-xl rounded-xl border border-amber-500/40 bg-zinc-900 p-6 sm:p-10 text-center space-y-4">
              <span className="text-xs font-mono uppercase tracking-widest text-amber-300">
                20 WORDS COMPLETED — TURN BOOKLET PAGE (30s)
              </span>
              <h2 className="text-2xl font-bold text-white">
                Turn to Next WAT Page in Your Booklet
              </h2>
              <div className="text-4xl font-mono font-bold text-amber-300">
                {formatClockMs(remainingMs)}
              </div>
              <button
                type="button"
                onClick={() => advanceBatteryPhase()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-zinc-100 text-zinc-950 text-xs font-semibold"
              >
                <span>Continue Immediately</span>
              </button>
            </div>
          )}

          {/* TRANSITION BREAK TO SRT */}
          {stage === "BREAK_TO_SRT" && (
            <div className="w-full max-w-xl rounded-xl border border-amber-500/40 bg-zinc-900 p-6 sm:p-10 text-center space-y-5">
              <span className="text-xs font-mono uppercase tracking-widest text-amber-300">
                WAT COMPLETED — NEXT SECTION: SITUATION REACTION TEST (SRT)
              </span>
              <h2 className="text-2xl font-bold text-white">
                Turn Your Booklet to the SRT Section
              </h2>
              <p className="text-xs sm:text-sm text-zinc-300">
                60 Situations displayed 5 per booklet page with an invisible
                30-minute timer.
              </p>
              <div className="text-3xl font-mono font-bold text-amber-300">
                {formatClockMs(remainingMs)}
              </div>
              <button
                type="button"
                onClick={() => advanceBatteryPhase()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-zinc-100 text-zinc-950 text-xs font-semibold"
              >
                <span>Start SRT Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* STAGE 3: SRT (5 SRTs AT A TIME + INSTRUCTIONS + INVISIBLE TIMER) */}
          {stage === "SRT_ACTIVE" && (
            <div className="w-full max-w-4xl space-y-5">
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-4 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono text-zinc-300">
                  <span>
                    OFFICIAL SRT INSTRUCTIONS — SHEET {srtSheetIndex + 1} OF{" "}
                    {totalSrtSheets}
                  </span>
                  <span>INVISIBLE TIMER: 30 MINUTES (60 SRTs)</span>
                </div>
                <p className="text-xs text-zinc-300">
                  Write your immediate action for each of the 5 situations below
                  in your physical Psychological Test Booklet.
                </p>
              </div>

              <div className="space-y-3">
                {currentFiveSrts.map((q, idx) => (
                  <div
                    key={q.id}
                    className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 flex items-start gap-3"
                  >
                    <span className="px-2.5 py-1 rounded bg-zinc-950 border border-zinc-800 font-mono text-xs font-bold text-zinc-200 shrink-0">
                      SRT #{srtStartIdx + idx + 1}
                    </span>
                    <p className="text-sm font-medium text-zinc-100">
                      {q.situation}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  disabled={srtSheetIndex === 0}
                  onClick={() => setSrtSheetIndex((p) => Math.max(0, p - 1))}
                  className="px-3 py-1.5 rounded border border-zinc-800 bg-zinc-900 disabled:opacity-40 text-xs text-zinc-200"
                >
                  Previous 5 SRTs
                </button>
                <button
                  type="button"
                  disabled={srtSheetIndex >= totalSrtSheets - 1}
                  onClick={() =>
                    setSrtSheetIndex((p) => Math.min(totalSrtSheets - 1, p + 1))
                  }
                  className="px-3.5 py-1.5 rounded bg-zinc-100 text-zinc-950 disabled:opacity-40 text-xs font-semibold"
                >
                  Next 5 SRTs (Turn Page) →
                </button>
              </div>
            </div>
          )}

          {/* TRANSITION BREAK TO SDT */}
          {stage === "BREAK_TO_SDT" && (
            <div className="w-full max-w-xl rounded-xl border border-amber-500/40 bg-zinc-900 p-6 sm:p-10 text-center space-y-5">
              <span className="text-xs font-mono uppercase tracking-widest text-amber-300">
                SRT COMPLETED — FINAL SECTION: SELF-DESCRIPTION TEST (SDT)
              </span>
              <h2 className="text-2xl font-bold text-white">
                Turn Your Booklet to the Self-Description Section
              </h2>
              <p className="text-xs sm:text-sm text-zinc-300">
                Write 5 paragraphs (Parents, Teachers, Friends, Self, Qualities
                to Develop) in 15 minutes.
              </p>
              <div className="text-3xl font-mono font-bold text-amber-300">
                {formatClockMs(remainingMs)}
              </div>
              <button
                type="button"
                onClick={() => advanceBatteryPhase()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-zinc-100 text-zinc-950 text-xs font-semibold"
              >
                <span>Start SDT Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* STAGE 4: SDT */}
          {stage === "SDT_ACTIVE" && (
            <div className="w-full max-w-4xl space-y-4">
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono text-zinc-200">
                  <BookOpen className="w-4 h-4 text-zinc-400" />
                  <span>
                    SELF-DESCRIPTION TEST (SDT) — 15 MINUTES INVISIBLE TIMER
                  </span>
                </div>
              </div>
              <div className="space-y-2.5">
                {sdtPrompts.map((p) => (
                  <div
                    key={p.id}
                    className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 space-y-1"
                  >
                    <span className="text-xs font-mono font-bold text-zinc-200">
                      {p.number}. {p.title}
                    </span>
                    <p className="text-xs sm:text-sm text-zinc-300">
                      {p.prompt}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }

  // SETUP SCREEN FOR COMPLETE PSYCHOLOGICAL TEST
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6">
      <div className="rounded-2xl border border-zinc-200/90 dark:border-white/[0.08] bg-white dark:bg-[#0b0f17] p-5 sm:p-6 space-y-1 shadow-sm">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Tests</span>
          </Link>
          <span className="text-zinc-400 dark:text-zinc-600">·</span>
          <span className="text-xs font-mono uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-semibold">
            FULL STAGE-2 PSYCHOLOGICAL BATTERY (~2 HOURS 05 MINS)
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
          Complete SSB Psychological Test Battery (TAT + WAT + SRT + SDT)
        </h1>
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Print and keep the official SSB Psychological Test Booklet ready on
          your desk before starting the full continuous battery.
        </p>
      </div>

      {/* Select Sets for Each Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. TAT Set */}
        <div className="rounded-2xl border border-zinc-200/90 dark:border-white/[0.08] bg-white dark:bg-[#0b0f17] p-5 sm:p-6 space-y-3 shadow-sm">
          <span className="text-xs font-mono uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-semibold">
            PART 1 · TAT (54 MIN)
          </span>
          <h2 className="text-sm font-bold text-zinc-900 dark:text-white">
            Select TAT Set (11 Pics + 1 Blank)
          </h2>
          <select
            aria-label="Select TAT Set"
            value={selectedTatSetId}
            onChange={(e) => setSelectedTatSetId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 font-medium"
          >
            {tatSets.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title} — 11 Pictures + 1 Blank
              </option>
            ))}
          </select>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
            30s picture projection + 4m notebook writing per story (no
            on-screen timer).
          </p>
        </div>

        {/* 2. WAT Set */}
        <div className="rounded-2xl border border-zinc-200/90 dark:border-white/[0.08] bg-white dark:bg-[#0b0f17] p-5 sm:p-6 space-y-3 shadow-sm">
          <span className="text-xs font-mono uppercase tracking-wider text-cyan-700 dark:text-cyan-400 font-semibold">
            PART 2 · WAT (16 MIN)
          </span>
          <h2 className="text-sm font-bold text-zinc-900 dark:text-white">
            Select SSB Board / WAT Set (60 Words)
          </h2>
          <select
            aria-label="Select WAT Set"
            value={selectedWatSetId}
            onChange={(e) => setSelectedWatSetId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 font-medium"
          >
            {watSets.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label} ({s.wordCount} Words)
              </option>
            ))}
          </select>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
            15s per word with beep sound + 30s booklet page-turn timer after
            every 20 words.
          </p>
        </div>

        {/* 3. SRT Set */}
        <div className="rounded-2xl border border-zinc-200/90 dark:border-white/[0.08] bg-white dark:bg-[#0b0f17] p-5 sm:p-6 space-y-3 shadow-sm">
          <span className="text-xs font-mono uppercase tracking-wider text-amber-700 dark:text-amber-400 font-semibold">
            PART 3 & 4 · SRT (30M) + SDT (15M)
          </span>
          <h2 className="text-sm font-bold text-zinc-900 dark:text-white">
            Select SRT Set (60 Situations)
          </h2>
          <select
            aria-label="Select SRT Set"
            value={selectedSrtSetId}
            onChange={(e) => setSelectedSrtSetId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 font-medium"
          >
            {srtSets.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label} {s.isRandom ? "(Real-Time Random)" : "(Predefined)"}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Displays 5 SRTs per booklet sheet (30m invisible timer), followed
            automatically by SDT (15m invisible timer).
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200/90 dark:border-white/[0.08] bg-white dark:bg-[#0b0f17] p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
            Ready for Complete SSB Psychology Hall Simulation?
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            At the end of the test, you can download your complete attempted
            Question Booklet (TAT + WAT + SRT + SDT) as a PDF along with a
            Pin-Point AI Psychologist Evaluation Prompt.
          </p>
        </div>

        <button
          type="button"
          data-testid="start-full-psych-test-btn"
          onClick={handleOpenFullBriefing}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm shrink-0 transition-colors shadow-sm"
        >
          <Layers className="w-4 h-4" />
          <span>Start Complete Psychological Test</span>
        </button>
      </div>
    </div>
  );
}
