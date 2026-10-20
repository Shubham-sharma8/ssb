"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Eye,
  EyeOff,
  RotateCcw,
  UserCheck,
  Volume2,
  VolumeX,
} from "lucide-react";
import { AttemptedBookletExportCard } from "@/components/psych/AttemptedBookletExportCard";
import { ExamBriefingSlides } from "@/components/psych/ExamBriefingSlides";
import { getSdtDefaultDurationMs, getSdtPrompts } from "@/lib/psych/catalog";
import { playSsbHallBeep } from "@/lib/psych/audio";
import { preventStimulusExtraction } from "@/lib/psych/hall-utils";
import { systemClock } from "@/lib/session/clock";
import { formatClockMs } from "@/lib/utils";
import {
  loadUserPreferences,
  saveUserPreferences,
} from "@/lib/storage/preferences";

type SdtPhase = "SETUP" | "BRIEFING" | "ACTIVE" | "COMPLETED";

export default function SdtPage() {
  const prompts = getSdtPrompts();
  const defaultDurationMs = getSdtDefaultDurationMs();

  const [durationMinutes, setDurationMinutes] = useState<number>(15);
  const [showTimerInHall, setShowTimerInHall] = useState<boolean>(false);
  const [soundAlerts, setSoundAlerts] = useState<boolean>(true);

  const [phase, setPhase] = useState<SdtPhase>("SETUP");
  const [remainingMs, setRemainingMs] = useState<number>(defaultDurationMs);
  const [totalDurationMs, setTotalDurationMs] =
    useState<number>(defaultDurationMs);
  const [startedAtIso, setStartedAtIso] = useState<string>("");
  const [completedAtIso, setCompletedAtIso] = useState<string>("");

  const phaseRef = useRef<SdtPhase>("SETUP");
  const startedMonoRef = useRef<number>(0);
  const durationMsRef = useRef<number>(defaultDurationMs);
  const soundEnabledRef = useRef<boolean>(true);

  useEffect(() => {
    const prefs = loadUserPreferences();
    setSoundAlerts(prefs.soundAlerts ?? true);
    soundEnabledRef.current = prefs.soundAlerts ?? true;
  }, []);

  const completeSdtSession = useCallback(() => {
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
      if (rem <= 0) {
        completeSdtSession();
      }
    };

    const unsub = systemClock.subscribe ? systemClock.subscribe(tick) : () => {};
    const interval = setInterval(tick, 100);
    return () => {
      unsub();
      clearInterval(interval);
    };
  }, [phase, completeSdtSession]);

  function handleOpenSdtBriefing() {
    phaseRef.current = "BRIEFING";
    setPhase("BRIEFING");
  }

  function handleStartSdt() {
    const totalMs = Math.max(1, durationMinutes) * 60 * 1000;
    phaseRef.current = "ACTIVE";
    startedMonoRef.current = systemClock.nowMono();
    durationMsRef.current = totalMs;

    setTotalDurationMs(totalMs);
    setRemainingMs(totalMs);
    setStartedAtIso(new Date(systemClock.nowWall()).toISOString());
    setPhase("ACTIVE");
    playSsbHallBeep("writing", soundEnabledRef.current);
  }

  function handleToggleSound() {
    const next = !soundAlerts;
    setSoundAlerts(next);
    soundEnabledRef.current = next;
    saveUserPreferences({ soundAlerts: next });
  }

  if (phase === "BRIEFING") {
    return (
      <ExamBriefingSlides
        examType="sdt"
        setLabel={`Official 5 Self-Description Prompts (${durationMinutes}m Hall Duration)`}
        onCancel={() => {
          phaseRef.current = "SETUP";
          setPhase("SETUP");
        }}
        onStartExam={handleStartSdt}
      />
    );
  }

  if (phase === "COMPLETED") {
    return (
      <div
        data-testid="sdt-completed-screen"
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
                    STOP WRITING — SDT COMPLETED
                  </span>
                  <h1 className="text-xl sm:text-2xl font-semibold text-zinc-100">
                    Self-Description Test (5 Paragraphs) Completed
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
                  <span>Practice SDT Again</span>
                </button>
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold transition-colors"
                >
                  <span>Return to Dashboard</span>
                </Link>
              </div>
            </div>

            <AttemptedBookletExportCard
              data={{
                title: "SDT Question Booklet — Self-Description Test",
                subtitle: `5 Official SSB Self-Description Paragraphs (${formatClockMs(
                  totalDurationMs
                )} Hall Duration)`,
                startedAtIso,
                completedAtIso,
                sdt: {
                  prompts,
                  durationSeconds: Math.round(totalDurationMs / 1000),
                },
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (phase === "ACTIVE") {
    return (
      <div
        data-testid="sdt-session-runner"
        onContextMenu={preventStimulusExtraction}
        className="fixed inset-0 z-50 overflow-y-auto bg-zinc-950 text-zinc-100 flex flex-col select-none"
      >
        <header className="border-b border-zinc-900 bg-zinc-950/90 px-3 sm:px-6 py-2.5">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="px-2.5 py-1 rounded text-xs font-mono font-semibold bg-zinc-900 text-zinc-100 border border-zinc-800">
                SELF-DESCRIPTION TEST (SDT)
              </span>
              <span className="text-xs sm:text-sm font-mono text-zinc-300">
                5 Paragraphs · Write in SDT Section of Booklet
              </span>
            </div>

            <div className="flex items-center gap-2">
              {!showTimerInHall ? (
                <button
                  type="button"
                  data-testid="sdt-invisible-timer-badge"
                  onClick={() => setShowTimerInHall(true)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-300"
                >
                  <EyeOff className="w-3.5 h-3.5 text-zinc-400" />
                  <span>
                    Invisible Timer Running ({formatClockMs(totalDurationMs)})
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  data-testid="sdt-visible-timer"
                  onClick={() => setShowTimerInHall(false)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded font-mono text-sm font-semibold tabular-nums bg-zinc-900 text-zinc-100 border border-zinc-700"
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
                data-testid="sdt-finish-btn"
                onClick={() => completeSdtSession()}
                className="px-3 py-1.5 rounded bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold transition-colors"
              >
                Finish & Export
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-8 space-y-5">
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-4 sm:p-5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-zinc-300">
              <BookOpen className="w-4 h-4 text-zinc-400" />
              <span>OFFICIAL SSB SDT INSTRUCTIONS — 15 MINUTES TOTAL</span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Write 5 separate paragraphs in the Self-Description section of
              your physical Psychological Test Booklet covering each of the 5
              headings below. Be honest, specific, and balanced.
            </p>
          </div>

          <div className="space-y-3">
            {prompts.map((p) => (
              <div
                key={p.id}
                data-testid={`sdt-prompt-card-${p.number}`}
                className="rounded-lg border border-zinc-800 bg-zinc-900/90 p-4 sm:p-5 space-y-1.5"
              >
                <div className="flex items-center gap-2.5">
                  <span className="px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 font-mono text-xs font-bold text-zinc-200">
                    PARAGRAPH #{p.number}
                  </span>
                  <h2 className="text-sm sm:text-base font-semibold text-zinc-100">
                    {p.title}
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed pl-1">
                  {p.prompt}
                </p>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

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
            STAGE 2 PSYCHOLOGY — SDT (15 MINUTES)
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
          Self-Description Test (SDT)
        </h1>
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          Write your 5 Self-Description paragraphs in the final pages of your
          physical Psychological Test Booklet.
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200/90 dark:border-white/[0.08] bg-white dark:bg-[#0b0f17] p-5 sm:p-6 space-y-4 shadow-sm">
        <h2 className="text-base font-bold text-zinc-900 dark:text-white">
          Official 5 Self-Description Questions
        </h2>
        <div className="space-y-2.5">
          {prompts.map((p) => (
            <div
              key={p.id}
              className="p-4 rounded-xl border border-zinc-200/90 dark:border-white/[0.08] bg-zinc-50/70 dark:bg-white/[0.02] space-y-1"
            >
              <span className="text-xs font-mono font-bold text-zinc-900 dark:text-white">
                {p.number}. {p.title}
              </span>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">{p.prompt}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-zinc-200/80 dark:border-white/[0.08]">
          <div className="flex items-center gap-3">
            <label className="text-xs text-zinc-600 dark:text-zinc-400">
              Hall Timer Duration (Minutes):
            </label>
            <input
              type="number"
              min={1}
              max={30}
              value={durationMinutes}
              onChange={(e) =>
                setDurationMinutes(Math.max(1, Number(e.target.value) || 15))
              }
              className="w-20 px-2.5 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs font-mono text-zinc-900 dark:text-zinc-100"
            />
          </div>

          <button
            type="button"
            data-testid="start-sdt-btn"
            onClick={handleOpenSdtBriefing}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm transition-colors shadow-sm"
          >
            <UserCheck className="w-4 h-4" />
            <span>Start SDT ({durationMinutes}m Invisible Timer)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
