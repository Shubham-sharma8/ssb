"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { SpotlightCard } from "@/components/aceternity/SpotlightCard";
import { playSsbHallBeep } from "@/lib/psych/audio";

const LECTURETTE_CARDS = [
  {
    cardNo: 1,
    high: "India's Two-Front Theaterization Strategy",
    medium: "Cyber Warfare & Critical Infrastructure Defense",
    medium2: "Uniform Civil Code & Constitutional Harmony",
    low: "Importance of Sports in Armed Forces",
  },
  {
    cardNo: 2,
    high: "Indo-Pacific Maritime Security & QUAD",
    medium: "Indigenous Defense Manufacturing (Atmanirbhar Bharat)",
    medium2: "Climate Change & Himalayan Glacier Security",
    low: "My Favorite Book & Leadership Lessons",
  },
  {
    cardNo: 3,
    high: "Autonomous Drone Swarms in Modern Warfare",
    medium: "Space Militarization & ASAT Capabilities",
    medium2: "Women in Combat & Permanent Commission",
    low: "Role of NCC in Youth Discipline",
  },
  {
    cardNo: 4,
    high: "Semiconductor Supply Chain & National Security",
    medium: "Border Infrastructure Development (BRO)",
    medium2: "Artificial Intelligence in Defense Intelligence",
    low: "Time Management for Officer Candidates",
  },
];

const GTO_TASKS = [
  {
    code: "01 • GD",
    title: "Group Discussion (2 Rounds)",
    timing: "20–30 min per topic",
    description:
      "Lead 1 offers two geopolitical/social topics chosen by the group; Lead 2 is selected by the GTO. Evaluates reasoning, listening, and group cooperation without dominating.",
  },
  {
    code: "02 • GPE",
    title: "Group Planning Exercise",
    timing: "5 Stages • ~45 min",
    description:
      "Model briefing, 5 min silent map reading, 10 min written individual solution (priority matrix, resource allocation, time-distance math), followed by group consensus plan.",
  },
  {
    code: "03 • PGT / HGT",
    title: "Progressive & Half Group Tasks",
    timing: "40–45 min + 15 min",
    description:
      "Cross 4 outdoor obstacle structures using balli, plank, rope, and load while obeying Color Rule, Distance Rule, Group Rule, and Rigidity Rule.",
  },
  {
    code: "04 • LECTURETTE",
    title: "Individual Lecturette",
    timing: "3 min Prep • 3 min Speech",
    description:
      "Draw a card with 4 topics (High, Medium, Low difficulty), prepare silently for 3 minutes, and deliver an structured talk to the group with a warning bell at 2:30.",
  },
  {
    code: "05 • CT",
    title: "Command Task",
    timing: "15 min as Commander",
    description:
      "You are appointed Commander of an obstacle and call 2 subordinates of your choice. Tests command bearing, tactical adaptability under stress, and resourcefulness.",
  },
  {
    code: "06 • GOR / IOT / FGT",
    title: "Snake Race, Individual Obstacles & FGT",
    timing: "Day 3 & Day 4 Ground Series",
    description:
      "6-obstacle group race with load, 10 numbered individual obstacles (55 points total in 3 minutes), and the concluding Final Group Task.",
  },
];

export default function GtoPracticePage() {
  const [selectedCardIdx, setSelectedCardIdx] = useState(0);
  const [selectedTopic, setSelectedTopic] = useState(
    LECTURETTE_CARDS[0]!.high
  );
  const [mode, setMode] = useState<"IDLE" | "PREP" | "SPEAK">("IDLE");
  const [secondsLeft, setSecondsLeft] = useState(180);

  useEffect(() => {
    if (mode === "IDLE") return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          playSsbHallBeep("completed", true);
          if (mode === "PREP") {
            setMode("SPEAK");
            return 180;
          } else {
            setMode("IDLE");
            return 180;
          }
        }
        if (prev === 31 && mode === "SPEAK") {
          // 30-second warning bell at 2:30 elapsed
          playSsbHallBeep("word-beep", true);
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [mode]);

  const currentCard = LECTURETTE_CARDS[selectedCardIdx] ?? LECTURETTE_CARDS[0]!;
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-10">
      {/* Header */}
      <section className="rounded-2xl border border-amber-500/25 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent p-6 sm:p-8 dark:border-amber-400/25">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-300">
              STAGE-II • DAY 3 &amp; DAY 4 GROUND SERIES
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              GTO Officer Tasks &amp; Lecturette Simulator
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              The Group Testing Officer (GTO) evaluates your{" "}
              <strong className="font-semibold text-zinc-900 dark:text-zinc-200">
                Karman (Action &amp; Group Effectiveness)
              </strong>{" "}
              across 9 indoor and outdoor tasks. Practice timed Lecturette cards
              and review tactical frameworks for GD, GPE, PGT, and Command Task.
            </p>
          </div>
          <Link
            href="/"
            className="rounded-lg border border-zinc-300 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-800 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
          >
            ← All SSB Modules
          </Link>
        </div>
      </section>

      {/* Interactive Lecturette Card Simulator */}
      <SpotlightCard accent="amber" className="p-6 sm:p-7" dataTestId="gto-lecturette-simulator">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-amber-500/15 px-2.5 py-1 font-mono text-xs font-bold text-amber-700 dark:text-amber-300">
                LIVE LECTURETTE TIMER
              </span>
              <span className="font-mono text-xs text-zinc-500">
                3:00 Prep • 3:00 Speech • Bell at 2:30
              </span>
            </div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Draw an SSB Lecturette Card &amp; Practice with Real Bell Cues
            </h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Select a card below, pick one of the 4 topics, and start the 3-minute
              preparation timer followed automatically by the 3-minute speech timer.
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              {LECTURETTE_CARDS.map((c, idx) => (
                <button
                  key={c.cardNo}
                  type="button"
                  onClick={() => {
                    setSelectedCardIdx(idx);
                    setSelectedTopic(c.high);
                    setMode("IDLE");
                    setSecondsLeft(180);
                  }}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                    selectedCardIdx === idx
                      ? "border-amber-600 bg-amber-600 text-white dark:border-amber-400 dark:bg-amber-400 dark:text-zinc-950"
                      : "border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
                  }`}
                >
                  Card #{c.cardNo}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
              {[
                { level: "High Level", text: currentCard.high },
                { level: "Medium Level", text: currentCard.medium },
                { level: "Medium Level", text: currentCard.medium2 },
                { level: "Familiar Level", text: currentCard.low },
              ].map((t) => (
                <button
                  key={t.text}
                  type="button"
                  onClick={() => setSelectedTopic(t.text)}
                  className={`rounded-lg border p-3 text-left transition-all ${
                    selectedTopic === t.text
                      ? "border-amber-500 bg-amber-500/10 text-zinc-900 dark:text-zinc-100"
                      : "border-zinc-200/80 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950"
                  }`}
                >
                  <span className="block font-mono text-[10px] uppercase tracking-wider text-amber-700 dark:text-amber-400">
                    {t.level}
                  </span>
                  <span className="mt-0.5 block text-xs font-semibold">
                    {t.text}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Timer Display Box */}
          <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 p-6 min-w-[260px] dark:border-zinc-800 dark:bg-zinc-950">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-400">
              {mode === "IDLE"
                ? "READY TO START"
                : mode === "PREP"
                ? "SILENT PREPARATION (3 MIN)"
                : "DELIVERING SPEECH (3 MIN)"}
            </span>
            <div className="my-3 font-mono text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
            </div>
            <p className="mb-4 text-center text-xs font-medium text-zinc-600 dark:text-zinc-400 line-clamp-2 max-w-[220px]">
              {selectedTopic}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {mode === "IDLE" ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setSecondsLeft(180);
                      setMode("PREP");
                    }}
                    className="rounded-lg bg-amber-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-amber-500 dark:bg-amber-500 dark:text-zinc-950"
                  >
                    Start 3m Prep
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSecondsLeft(180);
                      setMode("SPEAK");
                    }}
                    className="rounded-lg border border-zinc-300 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-800 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                  >
                    Start 3m Speech Directly
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMode("IDLE");
                    setSecondsLeft(180);
                  }}
                  className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-500/20 dark:text-rose-300"
                >
                  Reset Timer
                </button>
              )}
            </div>
          </div>
        </div>
      </SpotlightCard>

      {/* 9 GTO Tasks Grid */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
          Complete 9-Task GTO Series Breakdown
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {GTO_TASKS.map((task) => (
            <SpotlightCard key={task.code} accent="amber" className="p-5 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-amber-700 dark:text-amber-400">
                    {task.code}
                  </span>
                  <span className="rounded bg-zinc-100 px-2 py-0.5 font-mono text-[10px] text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                    {task.timing}
                  </span>
                </div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  {task.title}
                </h3>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {task.description}
                </p>
              </div>
            </SpotlightCard>
          ))}
        </div>
      </section>
    </div>
  );
}
