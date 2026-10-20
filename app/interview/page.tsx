"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SpotlightCard } from "@/components/aceternity/SpotlightCard";

const CIQ_SEQUENCES = [
  {
    id: "ciq-1",
    badge: "CIQ-1 • ACADEMICS & PEERS",
    title: "Education, Teachers, Achievements & Close Friends",
    prompt:
      "Tell me about your educational journey starting from Class 10th to your graduation — percentage variation, favorite subjects, teachers you admired most, teachers you didn't get along with, close friends and why you value them, and your extra-curricular participation.",
    checkpoints: [
      "10th, 12th & Graduation percentage trend (explain any dip honestly)",
      "Favorite subjects & practical application of concepts",
      "Best teacher vs teacher you disagreed with (avoid negative blame)",
      "2–3 genuine close friends & specific instances of mutual support",
      "Positions of responsibility held in school/college",
    ],
  },
  {
    id: "ciq-2",
    badge: "CIQ-2 • FAMILY & DAILY ROUTINE",
    title: "Family Dynamics, Finances, Support System & 24-Hour Routine",
    prompt:
      "Now tell me about your family members, their occupations, how you spend time with your parents and siblings, whom you approach when facing a tough problem, how you manage your monthly expenses, and walk me through your exact weekday and weekend schedule.",
    checkpoints: [
      "Occupation & role of Father, Mother, and Siblings",
      "Your specific contribution to household chores and family responsibilities",
      "Who are you closer to and why? Whom do you confide in during crisis?",
      "Financial awareness: how pocket money/earnings are budgeted",
      "Realistic weekday & Sunday routine (wake-up, physical fitness, newspaper reading)",
    ],
  },
  {
    id: "ciq-3",
    badge: "CIQ-3 • HOBBIES, SPORTS & DEFENSE AWARENESS",
    title: "Spare Time Interests, Sports Rules, Service Knowledge & Current Affairs",
    prompt:
      "How do you utilize your spare time? Tell me in detail about the sports you play, ground dimensions and recent tournaments, your hobbies, why you want to join the Armed Forces, alternative career plan if not recommended this time, and 3 major national/international news events from this week.",
    checkpoints: [
      "Technical rules, dimensions & recent matches of the sport listed in your PIQ",
      "Depth of knowledge in declared hobbies (books read, projects built)",
      "Clear, non-scripted motivation for joining Army / Navy / Air Force",
      "Regimental / Command / Rank structure & weapon systems of your chosen service",
      "Concrete backup career plan showing maturity and resilience",
    ],
  },
];

export default function PersonalInterviewPage() {
  const [activeCiqIdx, setActiveCiqIdx] = useState(0);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const activeCiq = CIQ_SEQUENCES[activeCiqIdx] ?? CIQ_SEQUENCES[0]!;

  function toggleCheckpoint(key: string) {
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl border border-zinc-200/90 bg-white dark:border-white/[0.08] dark:bg-[#0b0f17] p-6 sm:p-10 shadow-sm">
        <div className="absolute inset-0 bg-grid-pattern opacity-60 pointer-events-none" />
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-wider text-sky-800 dark:text-sky-300">
              STAGE-II • INTERVIEWING OFFICER (IO)
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
              Personal Interview &amp; Rapid-Fire CIQ Practice
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              The Personal Interview evaluates{" "}
              <strong className="font-semibold text-zinc-900 dark:text-zinc-200">
                Vacha (Spoken Alignment &amp; Honesty)
              </strong>{" "}
              against your Personal Information Questionnaire (PIQ) and
              Self-Description Test (SDT). Practice retaining and answering 7–10
              bundled questions in sequence.
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

      {/* Rapid-Fire CIQ Simulator */}
      <SpotlightCard accent="sky" className="p-6 sm:p-7" dataTestId="interview-ciq-simulator">
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="font-mono text-xs font-bold text-sky-700 dark:text-sky-300">
                {activeCiq.badge}
              </span>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {activeCiq.title}
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {CIQ_SEQUENCES.map((c, idx) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setActiveCiqIdx(idx)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                    activeCiqIdx === idx
                      ? "border-sky-600 bg-sky-600 text-white dark:border-sky-400 dark:bg-sky-400 dark:text-zinc-950"
                      : "border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
                  }`}
                >
                  {c.id.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-sky-500/25 bg-sky-500/5 p-5 dark:bg-sky-500/10">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-sky-700 dark:text-sky-300 mb-1.5">
              INTERVIEWING OFFICER RAPID-FIRE PROMPT (READ ONCE, THEN SPEAK ALOUD):
            </p>
            <p className="text-sm sm:text-base font-medium leading-relaxed text-zinc-900 dark:text-zinc-100">
              “{activeCiq.prompt}”
            </p>
          </div>

          <div className="space-y-2.5">
            <p className="font-mono text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              Self-Check: Did you cover every sub-question in chronological order?
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {activeCiq.checkpoints.map((cp, idx) => {
                const key = `${activeCiq.id}-${idx}`;
                const checked = Boolean(checkedItems[key]);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleCheckpoint(key)}
                    className={`flex items-start gap-2.5 rounded-lg border p-3 text-left text-xs transition-colors ${
                      checked
                        ? "border-emerald-500/40 bg-emerald-500/10 text-zinc-900 dark:text-zinc-100"
                        : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {}}
                      className="mt-0.5 rounded border-zinc-300 text-emerald-600"
                    />
                    <span>{cp}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </SpotlightCard>

      {/* Alignment with SDT & Psychology */}
      <SpotlightCard accent="emerald" className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              CROSS-VERIFICATION TIP
            </span>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Align Your Interview Answers with Your Self-Description Test (SDT)
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-2xl">
              Your Interviewing Officer and Psychologist cross-match the strengths,
              weaknesses, and parent/friend opinions you write in the 15-minute SDT.
            </p>
          </div>
          <Link
            href="/sdt"
            className="shrink-0 rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-emerald-500 dark:bg-emerald-500 dark:text-zinc-950"
          >
            Practice 15-Min SDT →
          </Link>
        </div>
      </SpotlightCard>
    </div>
  );
}
