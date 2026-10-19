"use client";

import React, {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  EyeOff,
  FileDown,
  FileText,
  Keyboard,
  Loader2,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  Save,
  Volume2,
  VolumeX,
  XCircle,
} from "lucide-react";
import {
  getAllManifestOverrides,
  getSessionById,
  getStoriesForSession,
  getStoryForSessionStimulus,
  saveStoryAndProgress,
  updateSessionRecord,
} from "@/lib/storage/db";
import {
  loadUserPreferences,
  saveUserPreferences,
} from "@/lib/storage/preferences";
import { getStimulusById } from "@/lib/tat/catalog";
import { systemClock } from "@/lib/session/clock";
import {
  TatSessionStateMachine,
  type SessionEngineState,
} from "@/lib/session/state-machine";
import { countCharacters, countWords, formatClockMs } from "@/lib/utils";
import { AttemptedBookletExportCard } from "@/components/psych/AttemptedBookletExportCard";
import { playSsbHallBeep } from "@/lib/psych/audio";
import { preventStimulusExtraction } from "@/lib/psych/hall-utils";
import type {
  ManifestOverrideRecord,
  SessionRecord,
  StoryRecord,
  UserPreferences,
} from "@/lib/validation/schemas";

type SaveStatus = "idle" | "saving" | "saved" | "error";

function TatSessionRunnerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sessionRecord, setSessionRecord] = useState<SessionRecord | null>(
    null
  );
  const [engineState, setEngineState] = useState<SessionEngineState | null>(
    null
  );
  const [remainingMs, setRemainingMs] = useState<number>(0);
  const [overrides, setOverrides] = useState<ManifestOverrideRecord[]>([]);
  const [prefs, setPrefs] = useState<UserPreferences>(() =>
    loadUserPreferences()
  );

  // Story editor state
  const [draftText, setDraftText] = useState<string>("");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveErrorMsg, setSaveErrorMsg] = useState<string | null>(null);
  const [completedStories, setCompletedStories] = useState<StoryRecord[]>([]);
  const [showOptionalNotepad, setShowOptionalNotepad] = useState<boolean>(false);

  // Confirmation modals
  const [confirmEarlyAdvance, setConfirmEarlyAdvance] = useState(false);
  const [confirmExitSession, setConfirmExitSession] = useState(false);

  // Fullscreen tracking
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenUnexpectedExit, setFullscreenUnexpectedExit] =
    useState(false);

  // Screen-reader announcement message
  const [srAnnouncement, setSrAnnouncement] = useState<string>("");

  const engineRef = useRef<TatSessionStateMachine | null>(null);
  const draftTextRef = useRef<string>("");
  const soundEnabledRef = useRef<boolean>(true);
  const currentStimulusStartedIsoRef = useRef<string>(new Date().toISOString());
  const saveDebounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const updateDraftText = useCallback((nextText: string) => {
    draftTextRef.current = nextText;
    setDraftText(nextText);
  }, []);

  const flushSaveDraft = useCallback(
    async (
      targetSessionId: string,
      targetStimulusId: string,
      canonicalNumber: number,
      sessionPosition: number,
      text: string,
      status: "in_progress" | "completed" | "skipped"
    ): Promise<boolean> => {
      if (saveDebounceTimerRef.current) {
        clearTimeout(saveDebounceTimerRef.current);
        saveDebounceTimerRef.current = null;
      }
      setSaveStatus("saving");
      setSaveErrorMsg(null);
      try {
        await saveStoryAndProgress({
          sessionId: targetSessionId,
          stimulusId: targetStimulusId,
          canonicalNumber,
          sessionPosition,
          draftText: text,
          completionStatus: status,
          startedAt: currentStimulusStartedIsoRef.current,
        });
        setSaveStatus("saved");
        return true;
      } catch (err) {
        setSaveStatus("error");
        setSaveErrorMsg(
          err instanceof Error
            ? err.message
            : "Failed to save story to IndexedDB"
        );
        return false;
      }
    },
    []
  );

  // Load session from IndexedDB and initialize state machine
  useEffect(() => {
    let mounted = true;
    if (!sessionId) {
      const legacySet = searchParams.get("set") ?? searchParams.get("setId");
      if (legacySet) {
        const modeParam = searchParams.get("mode");
        router.replace(
          `/tat?setId=${encodeURIComponent(legacySet)}${
            modeParam ? `&mode=${encodeURIComponent(modeParam)}` : ""
          }`
        );
        return;
      }
      setLoadError("No sessionId provided in URL.");
      setLoading(false);
      return;
    }

    async function init() {
      try {
        const loadedPrefs = loadUserPreferences();
        setPrefs(loadedPrefs);
        soundEnabledRef.current = loadedPrefs.soundAlerts ?? true;

        const [rec, ov] = await Promise.all([
          getSessionById(sessionId!),
          getAllManifestOverrides(),
        ]);

        if (!mounted) return;
        if (!rec) {
          setLoadError(`Session "${sessionId}" was not found in local storage.`);
          setLoading(false);
          return;
        }

        setOverrides(ov);
        setSessionRecord(rec);
        setShowOptionalNotepad(rec.writingMode === "digital");

        const machine = new TatSessionStateMachine(rec, systemClock);
        engineRef.current = machine;

        const isNotebookSession = rec.writingMode !== "digital";

        machine.subscribe(async (nextState, event) => {
          if (!mounted) return;
          setEngineState(nextState);
          setRemainingMs(machine.getRemainingMs());

          const patch = machine.toSessionRecordPatch();
          updateSessionRecord(rec.id, patch).catch(() => {});

          if (!event) return;

          if (event.type === "PHASE_STARTED" && event.phase === "OBSERVATION") {
            const picNum =
              nextState.canonicalNumbersMap[event.stimulusId] ??
              event.index + 1;
            playSsbHallBeep("observation", soundEnabledRef.current);
            setSrAnnouncement(
              `Picture ${picNum} projected on screen. Observe quietly for 30 seconds.`
            );
            setConfirmEarlyAdvance(false);
            currentStimulusStartedIsoRef.current = new Date().toISOString();

            const existing = await getStoryForSessionStimulus(
              rec.id,
              event.stimulusId
            );
            if (mounted) {
              updateDraftText(existing?.draftText ?? "");
              setSaveStatus(existing ? "saved" : "idle");
            }
          } else if (event.type === "OBSERVATION_ELAPSED_TO_WRITING") {
            const picNum =
              nextState.canonicalNumbersMap[event.stimulusId] ??
              event.index + 1;
            playSsbHallBeep("writing", soundEnabledRef.current);
            setSrAnnouncement(
              `Picture ${picNum} vanished. Write your story in your notebook for 4 minutes.`
            );
            currentStimulusStartedIsoRef.current = new Date().toISOString();
            const existing = await getStoryForSessionStimulus(
              rec.id,
              event.stimulusId
            );
            if (mounted) {
              const initialText = existing?.draftText ?? draftTextRef.current;
              updateDraftText(initialText);
              await flushSaveDraft(
                rec.id,
                event.stimulusId,
                picNum,
                event.index + 1,
                initialText,
                "in_progress"
              );
            }
          } else if (event.type === "WRITING_ELAPSED_ADVANCE") {
            const completedPicNum =
              nextState.canonicalNumbersMap[event.completedStimulusId] ??
              event.completedIndex + 1;
            const finalDraft = draftTextRef.current;
            // In notebook mode, candidates write in their physical booklet, so completed slides count as completed!
            const status =
              finalDraft.trim().length > 0 || isNotebookSession
                ? "completed"
                : "skipped";
            await flushSaveDraft(
              rec.id,
              event.completedStimulusId,
              completedPicNum,
              event.completedIndex + 1,
              finalDraft,
              status
            );
            updateDraftText("");
            setSaveStatus("idle");
            setConfirmEarlyAdvance(false);
            if (event.nextPhase === "COMPLETED") {
              playSsbHallBeep("completed", soundEnabledRef.current);
              const allSessionStories = await getStoriesForSession(rec.id);
              if (mounted) {
                setCompletedStories(allSessionStories);
              }
            }
          } else if (event.type === "SESSION_COMPLETED") {
            playSsbHallBeep("completed", soundEnabledRef.current);
            setSrAnnouncement("TAT Session completed.");
            const allSessionStories = await getStoriesForSession(rec.id);
            if (mounted) {
              setCompletedStories(allSessionStories);
            }
          }
        });

        if (machine.getState().phase === "READY") {
          machine.startSession();
          await updateSessionRecord(rec.id, machine.toSessionRecordPatch());
        } else {
          const initialState = machine.getState();
          setEngineState(initialState);
          setRemainingMs(machine.getRemainingMs());
          await updateSessionRecord(rec.id, machine.toSessionRecordPatch());

          const curStimId = machine.getCurrentStimulusId();
          if (curStimId) {
            const existingStory = await getStoryForSessionStimulus(
              rec.id,
              curStimId
            );
            if (mounted && existingStory) {
              updateDraftText(existingStory.draftText);
              setSaveStatus("saved");
            }
          }
          if (initialState.phase === "COMPLETED") {
            const allSessionStories = await getStoriesForSession(rec.id);
            if (mounted) setCompletedStories(allSessionStories);
          }
        }

        if (mounted) {
          setLoading(false);
        }
      } catch (err) {
        if (!mounted) return;
        setLoadError(
          err instanceof Error ? err.message : "Failed to load session."
        );
        setLoading(false);
      }
    }

    init();

    return () => {
      mounted = false;
      if (saveDebounceTimerRef.current) {
        clearTimeout(saveDebounceTimerRef.current);
      }
    };
  }, [sessionId, flushSaveDraft, updateDraftText, router, searchParams]);

  // High-precision timer loop + test clock subscription + visibilitychange listener
  useEffect(() => {
    const machine = engineRef.current;
    if (!machine) return;

    const handleClockUpdate = () => {
      machine.tick();
      setEngineState(machine.getState());
      setRemainingMs(machine.getRemainingMs());
    };

    const unsubClock = systemClock.subscribe
      ? systemClock.subscribe(handleClockUpdate)
      : () => {};

    const intervalId = setInterval(handleClockUpdate, 100);

    const handleVisibilityChange = () => {
      const visible = document.visibilityState === "visible";
      machine.reconcileVisibilityChange(visible);
      setEngineState(machine.getState());
      setRemainingMs(machine.getRemainingMs());
      if (sessionRecord) {
        updateSessionRecord(
          sessionRecord.id,
          machine.toSessionRecordPatch()
        ).catch(() => {});
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      unsubClock();
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [loading, sessionRecord]);

  // Focus textarea when digital editor is open in WRITING phase
  useEffect(() => {
    if (
      engineState?.phase === "WRITING" &&
      showOptionalNotepad &&
      textareaRef.current
    ) {
      textareaRef.current.focus();
    }
  }, [engineState?.phase, engineState?.currentIndex, showOptionalNotepad]);

  // Track fullscreen state and keyboard shortcuts
  useEffect(() => {
    if (typeof document === "undefined") return;
    setIsFullscreen(Boolean(document.fullscreenElement));

    const onFullscreenChange = () => {
      const active = Boolean(document.fullscreenElement);
      setIsFullscreen(active);
      if (
        !active &&
        sessionRecord?.fullscreenRequested &&
        engineRef.current &&
        engineRef.current.getState().phase !== "COMPLETED"
      ) {
        setFullscreenUnexpectedExit(true);
      } else if (active) {
        setFullscreenUnexpectedExit(false);
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput =
        target?.tagName === "TEXTAREA" ||
        target?.tagName === "INPUT" ||
        target?.isContentEditable;

      if (
        !isInput &&
        e.key.toLowerCase() === (prefs.fullscreenShortcut || "f").toLowerCase()
      ) {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === "Escape" && !document.fullscreenElement) {
        setConfirmExitSession(true);
      }
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [sessionRecord?.fullscreenRequested, prefs.fullscreenShortcut]);

  async function toggleFullscreen() {
    if (typeof document === "undefined") return;
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
        setFullscreenUnexpectedExit(false);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {
      // Ignore if browser blocks fullscreen
    }
  }

  function handleToggleSound() {
    const nextSound = !prefs.soundAlerts;
    soundEnabledRef.current = nextSound;
    const updated = saveUserPreferences({ soundAlerts: nextSound });
    setPrefs(updated);
  }

  function handleEditorChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const nextVal = e.target.value;
    updateDraftText(nextVal);

    const machine = engineRef.current;
    if (!machine || !sessionRecord) return;
    const curStimId = machine.getCurrentStimulusId();
    if (!curStimId) return;
    const canonicalNum = machine.getCurrentCanonicalNumber();
    const pos = machine.getState().currentIndex + 1;

    setSaveStatus("saving");
    if (saveDebounceTimerRef.current) {
      clearTimeout(saveDebounceTimerRef.current);
    }
    saveDebounceTimerRef.current = setTimeout(() => {
      flushSaveDraft(
        sessionRecord.id,
        curStimId,
        canonicalNum,
        pos,
        nextVal,
        "in_progress"
      );
    }, 220);
  }

  async function handleConfirmFinishWritingEarly() {
    const machine = engineRef.current;
    if (!machine || !sessionRecord) return;
    const curStimId = machine.getCurrentStimulusId();
    const isNotebookSession = sessionRecord.writingMode !== "digital";
    if (curStimId) {
      await flushSaveDraft(
        sessionRecord.id,
        curStimId,
        machine.getCurrentCanonicalNumber(),
        machine.getState().currentIndex + 1,
        draftTextRef.current,
        draftTextRef.current.trim().length > 0 || isNotebookSession
          ? "completed"
          : "skipped"
      );
    }
    machine.finishCurrentWritingPhaseEarly();
    const nextState = machine.getState();
    setEngineState(nextState);
    setRemainingMs(machine.getRemainingMs());
    await updateSessionRecord(sessionRecord.id, machine.toSessionRecordPatch());
    if (nextState.phase === "COMPLETED") {
      const allSessionStories = await getStoriesForSession(sessionRecord.id);
      setCompletedStories(allSessionStories);
    }
    setConfirmEarlyAdvance(false);
  }

  async function handleRecoverAdvance() {
    const machine = engineRef.current;
    if (!machine || !sessionRecord) return;
    const curStimId = machine.getCurrentStimulusId();
    const isNotebookSession = sessionRecord.writingMode !== "digital";
    if (
      curStimId &&
      (draftTextRef.current.trim().length > 0 || isNotebookSession)
    ) {
      await flushSaveDraft(
        sessionRecord.id,
        curStimId,
        machine.getCurrentCanonicalNumber(),
        machine.getState().currentIndex + 1,
        draftTextRef.current,
        "completed"
      );
    }
    machine.recoverByAdvancingElapsedPhase();
    const nextState = machine.getState();
    setEngineState(nextState);
    setRemainingMs(machine.getRemainingMs());
    await updateSessionRecord(sessionRecord.id, machine.toSessionRecordPatch());
    if (nextState.phase === "COMPLETED") {
      const allSessionStories = await getStoriesForSession(sessionRecord.id);
      setCompletedStories(allSessionStories);
    }
  }

  async function handleRecoverRestartPicture() {
    const machine = engineRef.current;
    if (!machine || !sessionRecord) return;
    machine.recoverByRestartingCurrentPicture();
    setEngineState(machine.getState());
    setRemainingMs(machine.getRemainingMs());
    await updateSessionRecord(sessionRecord.id, machine.toSessionRecordPatch());
  }

  async function handleFinishSessionEarly() {
    const machine = engineRef.current;
    if (!machine || !sessionRecord) return;
    const curStimId = machine.getCurrentStimulusId();
    const isNotebookSession = sessionRecord.writingMode !== "digital";
    if (curStimId) {
      await flushSaveDraft(
        sessionRecord.id,
        curStimId,
        machine.getCurrentCanonicalNumber(),
        machine.getState().currentIndex + 1,
        draftTextRef.current,
        draftTextRef.current.trim().length > 0 || isNotebookSession
          ? "completed"
          : "skipped"
      );
    }
    const nextState = machine.finishSessionEarly();
    setEngineState(nextState);
    setRemainingMs(0);
    await updateSessionRecord(sessionRecord.id, machine.toSessionRecordPatch());
    const allSessionStories = await getStoriesForSession(sessionRecord.id);
    setCompletedStories(allSessionStories);
  }

  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-zinc-950 text-zinc-300 px-4">
        <div className="flex items-center gap-3 text-sm">
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          <span>Preparing SSB Testing Hall…</span>
        </div>
      </div>
    );
  }

  if (loadError || !sessionRecord || !engineState) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-zinc-950 p-4 sm:p-6">
        <div className="max-w-md w-full rounded-lg border border-zinc-800 bg-zinc-900 p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 text-rose-400 font-semibold">
            <XCircle className="w-5 h-5 shrink-0" />
            <span>Session Unavailable</span>
          </div>
          <p className="text-sm text-zinc-300">{loadError}</p>
          <Link
            href="/tat"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-zinc-100 text-zinc-950 font-medium text-xs"
          >
            <span>Return to TAT Setup</span>
          </Link>
        </div>
      </div>
    );
  }

  const currentStimulusId =
    engineState.stimulusIds[engineState.currentIndex] ?? null;
  const currentStimulus = currentStimulusId
    ? getStimulusById(currentStimulusId, overrides)
    : undefined;
  const canonicalNumber = currentStimulusId
    ? engineState.canonicalNumbersMap[currentStimulusId] ??
      engineState.currentIndex + 1
    : engineState.currentIndex + 1;

  const isBlankSlide = Boolean(currentStimulus?.isBlankSlide);
  const totalPictures = engineState.stimulusIds.length;
  const currentStep = engineState.currentIndex + 1;
  const wordCount = countWords(draftText);
  const charCount = countCharacters(draftText);
  const isRealMode = engineState.practiceMode === "realistic";

  // COMPLETED SCREEN
  if (engineState.phase === "COMPLETED") {
    const totalWords = completedStories.reduce(
      (sum, s) => sum + s.wordCount,
      0
    );
    const attemptedSlideCount = Math.max(
      1,
      Math.min(
        engineState.stimulusIds.length,
        engineState.completedCount || engineState.stimulusIds.length
      )
    );
    const attemptedSlides = engineState.stimulusIds
      .slice(0, attemptedSlideCount)
      .map((stimId, idx) => {
        const stim = getStimulusById(stimId, overrides);
        const num = engineState.canonicalNumbersMap[stimId] ?? idx + 1;
        return {
          number: num,
          stimulusId: stimId,
          assetPath:
            stim?.setFolderAssetPath ||
            stim?.assetPath ||
            "/tat-assets/blank-slide.webp",
          isBlankSlide: Boolean(stim?.isBlankSlide),
          description: stim?.description,
        };
      });
    return (
      <div
        data-testid="session-completed-screen"
        className="min-h-[100dvh] bg-zinc-950 text-zinc-100 py-8 sm:py-12 px-4 sm:px-6"
      >
        <div className="max-w-3xl mx-auto rounded-lg border border-zinc-800 bg-zinc-900 p-5 sm:p-8 space-y-6">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2.5 rounded-md bg-zinc-800 text-zinc-100 shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                STOP WRITING — SET COMPLETED
              </span>
              <h1 className="text-xl sm:text-2xl font-semibold text-zinc-100">
                {sessionRecord.setTitle} Finished
              </h1>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            All {totalPictures} slides in{" "}
            <strong className="text-zinc-100">{sessionRecord.setTitle}</strong>{" "}
            have been completed. Export your attempted TAT Question Booklet PDF
            and copy the Pin-Point AI Psychologist Prompt below, or open Review
            Mode.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-md border border-zinc-800 bg-zinc-950 p-4">
              <div className="text-xs text-zinc-400">Slides Completed</div>
              <div
                data-testid="completed-screen-count"
                className="text-xl font-semibold text-zinc-100 mt-1 tabular-nums"
              >
                {engineState.completedCount} / {totalPictures}
              </div>
            </div>
            <div className="rounded-md border border-zinc-800 bg-zinc-950 p-4">
              <div className="text-xs text-zinc-400">Writing Mode</div>
              <div className="text-sm font-semibold text-zinc-100 mt-2">
                {sessionRecord.writingMode === "digital"
                  ? "On-Screen Digital"
                  : "Physical Notebook"}
              </div>
            </div>
            <div className="rounded-md border border-zinc-800 bg-zinc-950 p-4">
              <div className="text-xs text-zinc-400">Digital Words Typed</div>
              <div className="text-xl font-semibold text-zinc-100 mt-1 tabular-nums">
                {totalWords}
              </div>
            </div>
          </div>

          {/* Post-Test Question Booklet PDF + Pin-Point AI Prompt */}
          <AttemptedBookletExportCard
            data={{
              title: `TAT Question Booklet — ${sessionRecord.setTitle}`,
              subtitle: `${attemptedSlides.length} TAT Slides (30s observation + 4m notebook story writing per slide)`,
              startedAtIso: sessionRecord.startedAt,
              completedAtIso:
                sessionRecord.completedAt ?? new Date().toISOString(),
              tat: {
                setLabel: sessionRecord.setTitle,
                slides: attemptedSlides,
              },
            }}
          />

          <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 pt-4 border-t border-zinc-800">
            <Link
              href={`/history/${encodeURIComponent(sessionRecord.id)}`}
              data-testid="completed-review-session-link"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-sm transition"
            >
              <FileText className="w-4 h-4" />
              <span>Review Pictures &amp; Stories</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/wat"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-medium text-sm transition"
            >
              <span>Proceed to WAT (60 Words)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/"
              data-testid="completed-return-dashboard-link"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-medium text-sm transition"
            >
              <span>Return to Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // INTERRUPTED RECOVERY SCREEN
  if (engineState.phase === "INTERRUPTED") {
    return (
      <div
        data-testid="session-interrupted-screen"
        className="min-h-[100dvh] flex items-center justify-center bg-zinc-950 text-zinc-100 p-4 sm:p-6"
      >
        <div className="max-w-xl w-full rounded-lg border border-zinc-800 bg-zinc-900 p-5 sm:p-7 space-y-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-amber-400">
                Session Interrupted
              </span>
              <h1 className="text-lg sm:text-xl font-semibold text-zinc-100 mt-0.5">
                Interrupted During{" "}
                {isBlankSlide
                  ? "Slide 12 (Blank Slide)"
                  : `Picture ${canonicalNumber}`}
              </h1>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            {engineState.interruptionReason ??
              "The active phase deadline expired while the browser tab was closed or suspended."}
          </p>

          <div className="rounded-md border border-zinc-800 bg-zinc-950 p-3.5 space-y-2 text-xs">
            <div className="flex items-center justify-between gap-2 text-zinc-400">
              <span>Current Slide</span>
              <span className="font-mono text-zinc-200 text-right">
                {isBlankSlide
                  ? "Slide 12 (Blank Slide)"
                  : `Picture ${canonicalNumber}`}{" "}
                (Step {currentStep} of {totalPictures})
              </span>
            </div>
            <div className="flex items-center justify-between gap-2 text-zinc-400">
              <span>Mode</span>
              <span className="font-mono text-zinc-200 text-right">
                {isRealMode ? "Real SSB Mode" : "Practice Mode"}
              </span>
            </div>
          </div>

          <div className="space-y-2.5 pt-2">
            <button
              type="button"
              data-testid="recover-advance-btn"
              onClick={handleRecoverAdvance}
              className="w-full py-2.5 px-4 rounded-md bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs sm:text-sm transition flex items-center justify-center gap-2 text-center"
            >
              <ArrowRight className="w-4 h-4 shrink-0" />
              <span>
                {engineState.interruptedFromPhase === "OBSERVATION"
                  ? "Proceed to 4-Minute Story Writing Interval"
                  : "Mark Completed & Advance to Next Slide"}
              </span>
            </button>

            <button
              type="button"
              data-testid="recover-restart-picture-btn"
              onClick={handleRecoverRestartPicture}
              className="w-full py-2.5 px-4 rounded-md border border-zinc-700 bg-zinc-950 hover:bg-zinc-800 text-zinc-200 font-medium text-xs transition flex items-center justify-center gap-2 text-center"
            >
              <RotateCcw className="w-3.5 h-3.5 shrink-0" />
              <span>Restart Slide {canonicalNumber} Observation (30s)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ACTIVE EXAMINATION MODE (OBSERVATION, WRITING, PAUSED)
  return (
    <div
      data-testid="active-tat-session-surface"
      onContextMenu={preventStimulusExtraction}
      className="exam-projector-stage min-h-[100dvh] flex flex-col bg-[#111113] text-zinc-100 select-none font-sans"
    >
      {/* Screen-reader live region */}
      <div className="sr-only" role="status" aria-live="assertive">
        {srAnnouncement}
      </div>

      {/* Minimal Top Bar */}
      <header className="min-h-[3.25rem] py-1.5 sm:py-0 sm:h-12 border-b border-zinc-800/80 bg-[#111113] px-3 sm:px-5 flex flex-wrap sm:flex-nowrap items-center justify-between gap-x-2 gap-y-1">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <span className="text-xs font-medium text-zinc-400 hidden sm:inline">
            {sessionRecord.setTitle}
          </span>
          <span
            data-testid="active-picture-canonical-label"
            className="text-xs sm:text-sm font-semibold text-zinc-100 tracking-tight whitespace-nowrap"
          >
            {isBlankSlide
              ? "Picture 12 (Blank Slide)"
              : `Picture ${canonicalNumber}`}
          </span>
          <span
            data-testid="active-session-step-label"
            className="text-[11px] font-mono text-zinc-400 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 whitespace-nowrap"
          >
            {currentStep} of {totalPictures}
          </span>
          <span
            data-testid="active-phase-badge"
            className="text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800 whitespace-nowrap"
          >
            {engineState.phase === "OBSERVATION"
              ? "Observation"
              : engineState.phase === "WRITING"
                ? "Story Writing"
                : engineState.phase}
          </span>
        </div>

        {/* Center Status: NO visible timer in Real SSB Mode; Countdown clock only in Practice Mode */}
        <div className="flex items-center gap-2">
          {isRealMode ? (
            <span
              data-testid="real-mode-no-timer-indicator"
              className="text-[11px] font-mono text-zinc-500 hidden md:inline"
            >
              Real SSB Hall Mode · No Visible Timer
            </span>
          ) : (
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <span
                data-testid="session-countdown-timer"
                className="font-mono text-base sm:text-lg font-semibold tracking-wider tabular-nums text-zinc-100"
              >
                {formatClockMs(remainingMs)}
              </span>
            </div>
          )}
        </div>

        {/* Minimal Right Controls */}
        <div className="flex items-center gap-1.5">
          {engineState.practiceMode === "practice" &&
            (engineState.phase === "OBSERVATION" ||
              engineState.phase === "WRITING") && (
              <button
                type="button"
                data-testid="pause-session-btn"
                onClick={() => {
                  engineRef.current?.pause();
                  updateSessionRecord(
                    sessionRecord.id,
                    engineRef.current?.toSessionRecordPatch() ?? {}
                  ).catch(() => {});
                }}
                className="px-2.5 py-1 rounded border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-xs text-zinc-300 inline-flex items-center gap-1"
              >
                <Pause className="w-3.5 h-3.5" />
                <span>Pause</span>
              </button>
            )}

          <button
            type="button"
            onClick={handleToggleSound}
            title={
              prefs.soundAlerts
                ? "Audio bell on phase change (Enabled)"
                : "Audio bell muted"
            }
            className="p-1.5 rounded border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200"
          >
            {prefs.soundAlerts ? (
              <Volume2 className="w-3.5 h-3.5" />
            ) : (
              <VolumeX className="w-3.5 h-3.5" />
            )}
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            className="p-1.5 rounded border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200"
          >
            {isFullscreen ? (
              <Minimize2 className="w-3.5 h-3.5" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
          </button>

          <button
            type="button"
            data-testid="tat-finish-test-btn"
            onClick={handleFinishSessionEarly}
            title="Finish test now and export PDF/AI prompt for attempted slides only"
            className="px-2.5 py-1 rounded border border-emerald-500/40 bg-emerald-950/50 hover:bg-emerald-900/60 text-xs font-semibold text-emerald-300 transition-colors"
          >
            Finish Test
          </button>

          <button
            type="button"
            data-testid="exit-session-btn"
            onClick={() => setConfirmExitSession(true)}
            className="px-2.5 py-1 rounded border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-xs text-zinc-400 hover:text-zinc-200"
          >
            Exit
          </button>
        </div>
      </header>

      {fullscreenUnexpectedExit && (
        <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-300">
          <span>Fullscreen mode was exited.</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleFullscreen}
              className="px-2.5 py-0.5 rounded bg-zinc-100 text-zinc-900 font-medium"
            >
              Restore Fullscreen
            </button>
            <button
              type="button"
              onClick={() => setFullscreenUnexpectedExit(false)}
              className="text-zinc-400 hover:text-zinc-200"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Hall Stage */}
      <div className="flex-1 flex flex-col justify-center items-center p-3 sm:p-6 pb-safe">
        {/* PAUSED OVERLAY (Practice Mode Only) */}
        {engineState.phase === "PAUSED" && (
          <div
            data-testid="session-paused-overlay"
            className="max-w-md w-full rounded-lg border border-zinc-800 bg-zinc-900 p-6 text-center space-y-4"
          >
            <h2 className="text-base font-semibold text-zinc-100">
              Practice Session Paused
            </h2>
            <p className="text-xs text-zinc-400">
              Picture projection is hidden while paused.{" "}
              <span className="font-mono text-zinc-200">
                {formatClockMs(remainingMs)}
              </span>{" "}
              remaining in current phase.
            </p>
            <button
              type="button"
              data-testid="resume-paused-session-btn"
              onClick={() => {
                engineRef.current?.resume();
                updateSessionRecord(
                  sessionRecord.id,
                  engineRef.current?.toSessionRecordPatch() ?? {}
                ).catch(() => {});
              }}
              className="w-full py-2.5 px-4 rounded-md bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-sm inline-flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Resume Session</span>
            </button>
          </div>
        )}

        {/* OBSERVATION PHASE: 30-second picture projection */}
        {engineState.phase === "OBSERVATION" && currentStimulus && (
          <div
            data-testid="observation-projection-stage"
            className="w-full max-w-5xl flex-1 flex flex-col items-center justify-center gap-3"
          >
            <div className="relative w-full flex-1 min-h-[240px] sm:min-h-[340px] max-h-[calc(100dvh-7.5rem)] sm:max-h-[80vh] flex items-center justify-center rounded-md bg-black border border-zinc-800/80 p-2 sm:p-4">
              <img
                src={
                  currentStimulus.setFolderAssetPath ??
                  currentStimulus.assetPath
                }
                alt={`SSB TAT Stimulus Picture ${canonicalNumber} Projection`}
                width={800}
                height={600}
                decoding="async"
                data-testid="projected-stimulus-image"
                onContextMenu={preventStimulusExtraction}
                onDragStart={preventStimulusExtraction}
                className="max-w-full max-h-[calc(100dvh-9rem)] sm:max-h-[76vh] w-auto h-auto object-contain select-none pointer-events-none"
              />
            </div>
            {isBlankSlide ? (
              <p
                data-testid="blank-slide-caption"
                className="text-xs sm:text-sm text-zinc-300 font-medium text-center px-2"
              >
                SLIDE 12 — BLANK SLIDE · Imagine your own picture for 30
                seconds, then write Story #12 in your SSB Booklet.
              </p>
            ) : (
              <p className="text-[11px] sm:text-xs text-zinc-500 text-center px-2">
                Observe the picture quietly (30s). Picture will vanish
                automatically when the 4-minute writing period begins.
              </p>
            )}
          </div>
        )}

        {/* WRITING PHASE: Picture has vanished for 4 minutes */}
        {engineState.phase === "WRITING" && (
          <div
            data-testid="writing-editor-stage"
            className="w-full max-w-3xl flex-1 flex flex-col justify-center gap-4 select-text"
          >
            {!showOptionalNotepad ? (
              /* REAL SSB NOTEBOOK WRITING SCREEN (Default: Picture Vanished, Candidate Writes in Physical Notebook) */
              <div
                data-testid="notebook-writing-stage"
                className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-6 sm:p-10 text-center space-y-6 my-auto"
              >
                <div className="w-11 h-11 rounded-full border border-zinc-800 bg-zinc-950 mx-auto flex items-center justify-center text-zinc-400">
                  <EyeOff className="w-5 h-5" />
                </div>

                <div className="space-y-2 max-w-lg mx-auto">
                  <div className="text-[11px] font-mono uppercase tracking-widest text-zinc-400">
                    Picture Vanished · 4-Minute Story Writing Interval
                  </div>
                  <h2 className="text-lg sm:text-2xl font-semibold text-zinc-100">
                    {isBlankSlide
                      ? "Write Story #12 (Blank Story) in Your Booklet"
                      : `Write Story #${canonicalNumber} in Your Physical Notebook / Booklet`}
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                    Write your story on box{" "}
                    <strong className="text-zinc-200">
                      #{canonicalNumber}
                    </strong>{" "}
                    of your SSB Psychology Test Booklet covering: what led to
                    the situation, what is happening now, the thoughts and
                    actions of the central character, and the final outcome.
                  </p>
                </div>

                <div className="rounded-md border border-zinc-800/90 bg-zinc-950/80 p-3.5 max-w-md mx-auto text-xs text-zinc-400 space-y-1">
                  <div className="text-zinc-300 font-medium">
                    Next Slide Automatic Projection
                  </div>
                  <p>
                    {currentStep < totalPictures
                      ? `Slide ${currentStep + 1} of ${totalPictures} will appear automatically when the 4-minute writing time finishes.`
                      : "This is the final slide (Slide 12). The test will conclude automatically after 4 minutes."}
                  </p>
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5">
                  <button
                    type="button"
                    data-testid="toggle-digital-notepad-btn"
                    onClick={() => setShowOptionalNotepad(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-zinc-800 bg-zinc-950 hover:bg-zinc-800 text-xs text-zinc-300"
                  >
                    <Keyboard className="w-3.5 h-3.5" />
                    <span>Open On-Screen Notepad (Optional)</span>
                  </button>

                  <a
                    href="/Phys-Test-Booklet.pdf"
                    download="SSB-Psychology-Test-Booklet.pdf"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-zinc-800 bg-zinc-950 hover:bg-zinc-800 text-xs text-zinc-400 hover:text-zinc-200"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    <span>Booklet PDF</span>
                  </a>

                  {!confirmEarlyAdvance ? (
                    <button
                      type="button"
                      data-testid="request-early-advance-btn"
                      onClick={() => setConfirmEarlyAdvance(true)}
                      className="px-3 py-1.5 rounded border border-zinc-800 bg-zinc-950 hover:bg-zinc-800 text-xs text-zinc-400 hover:text-zinc-200"
                    >
                      Finish Slide Early…
                    </button>
                  ) : (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs text-amber-300">
                        Advance to next slide now?
                      </span>
                      <button
                        type="button"
                        data-testid="confirm-early-advance-btn"
                        onClick={handleConfirmFinishWritingEarly}
                        className="px-3 py-1.5 rounded bg-zinc-100 text-zinc-950 font-semibold text-xs"
                      >
                        Confirm Advance
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmEarlyAdvance(false)}
                        className="px-2.5 py-1.5 rounded border border-zinc-700 text-zinc-300 text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* OPTIONAL DIGITAL NOTEPAD (For Practice Mode or On-Screen Typing) */
              <div className="flex-1 flex flex-col gap-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-2.5">
                  <div className="min-w-0">
                    <h2 className="text-xs sm:text-sm font-semibold text-zinc-200">
                      {isBlankSlide
                        ? "Write your story for Slide 12 (Blank Slide)"
                        : `Write your story for Picture ${canonicalNumber}`}
                    </h2>
                    <p className="text-[11px] text-zinc-400">
                      Picture has vanished. Describe what led to the situation,
                      what is happening now, and the final outcome.
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 text-xs">
                    <button
                      type="button"
                      onClick={() => setShowOptionalNotepad(false)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 text-[11px]"
                    >
                      <BookOpen className="w-3 h-3" />
                      <span>Switch to Notebook View</span>
                    </button>

                    {prefs.showWordCounter && (
                      <span
                        data-testid="editor-word-counter"
                        className="font-mono text-[11px] text-zinc-400"
                      >
                        {wordCount} {wordCount === 1 ? "word" : "words"} ·{" "}
                        {charCount} chars
                      </span>
                    )}

                    <span
                      data-testid="save-status-indicator"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded font-mono text-[11px] border border-zinc-800 bg-zinc-900 text-zinc-300"
                    >
                      <Save className="w-3 h-3" />
                      <span>
                        {saveStatus === "saving"
                          ? "Saving…"
                          : saveStatus === "saved"
                            ? "Saved"
                            : saveStatus === "error"
                              ? "Save Error"
                              : "Ready"}
                      </span>
                    </span>
                  </div>
                </div>

                {saveStatus === "error" && saveErrorMsg && (
                  <div
                    role="alert"
                    data-testid="save-error-banner"
                    className="rounded-md border border-rose-500/40 bg-rose-950/40 px-3.5 py-2 text-xs text-rose-200 flex flex-wrap items-center justify-between gap-2"
                  >
                    <span>Storage error: {saveErrorMsg}</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (currentStimulusId) {
                          flushSaveDraft(
                            sessionRecord.id,
                            currentStimulusId,
                            canonicalNumber,
                            currentStep,
                            draftText,
                            "in_progress"
                          );
                        }
                      }}
                      className="px-2.5 py-1 rounded bg-rose-500 text-zinc-950 font-semibold"
                    >
                      Retry Save
                    </button>
                  </div>
                )}

                <textarea
                  ref={textareaRef}
                  value={draftText}
                  onChange={handleEditorChange}
                  data-testid="story-writing-textarea"
                  aria-label={`Story response for Picture ${canonicalNumber}`}
                  placeholder="Write your story here (or switch to Notebook View to write on paper)..."
                  spellCheck={false}
                  className="flex-1 w-full min-h-[220px] sm:min-h-[320px] rounded-md border border-zinc-800 bg-zinc-900 p-4 text-base text-zinc-100 placeholder:text-zinc-500 leading-relaxed focus:outline-none focus:border-zinc-600 resize-none font-sans"
                />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
                  <span className="text-[11px] text-zinc-400">
                    Next slide will be projected automatically after the
                    4-minute writing period.
                  </span>

                  {!confirmEarlyAdvance ? (
                    <button
                      type="button"
                      data-testid="request-early-advance-btn"
                      onClick={() => setConfirmEarlyAdvance(true)}
                      className="self-end sm:self-auto px-3 py-1.5 rounded border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-xs text-zinc-300 font-medium whitespace-nowrap"
                    >
                      Finish Picture Early…
                    </button>
                  ) : (
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <span className="text-xs text-amber-300">
                        Commit story &amp; advance now?
                      </span>
                      <button
                        type="button"
                        data-testid="confirm-early-advance-btn"
                        onClick={handleConfirmFinishWritingEarly}
                        className="px-3 py-1.5 rounded bg-zinc-100 text-zinc-950 font-semibold text-xs"
                      >
                        Confirm Advance
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmEarlyAdvance(false)}
                        className="px-2.5 py-1.5 rounded border border-zinc-700 text-zinc-300 text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Exit Session Confirmation Modal */}
      {confirmExitSession && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-lg border border-zinc-800 bg-zinc-900 p-5 space-y-4">
            <h3 className="text-base font-semibold text-zinc-100">
              Leave Active TAT Session?
            </h3>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Your session progress is saved locally. Leaving while a slide is
              in progress will keep the current deadline active.
            </p>
            <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmExitSession(false)}
                className="px-3.5 py-2 rounded border border-zinc-700 text-xs text-zinc-200 text-center"
              >
                Stay in Hall
              </button>
              <button
                type="button"
                data-testid="confirm-exit-session-btn"
                onClick={async () => {
                  if (
                    currentStimulusId &&
                    engineState.phase === "WRITING"
                  ) {
                    await flushSaveDraft(
                      sessionRecord.id,
                      currentStimulusId,
                      canonicalNumber,
                      currentStep,
                      draftTextRef.current,
                      "in_progress"
                    );
                  }
                  router.push("/");
                }}
                className="px-3.5 py-2 rounded bg-rose-600 text-white font-semibold text-xs text-center"
              >
                Save &amp; Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TatSessionPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[100dvh] bg-zinc-950 text-zinc-400 flex items-center justify-center text-sm px-4">
          Loading Examination Session…
        </div>
      }
    >
      <TatSessionRunnerContent />
    </Suspense>
  );
}
