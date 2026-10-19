import React from "react";
import Link from "next/link";
import { SpotlightCard } from "@/components/aceternity/SpotlightCard";

export default function AboutSsbPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-10">
      <section className="rounded-2xl border border-emerald-500/25 bg-gradient-to-br from-emerald-500/10 via-sky-500/5 to-transparent p-6 sm:p-8 dark:border-emerald-400/25">
        <div className="space-y-3 max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
            ABOUT SSB.COGIFY.ME • DIPR METHODOLOGY
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Authentic Services Selection Board (SSB) Practice Platform
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Built by{" "}
            <a
              href="https://cogify.me"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-emerald-700 underline underline-offset-2 dark:text-emerald-400"
            >
              cogify.me
            </a>
            , <strong className="font-semibold text-zinc-900 dark:text-zinc-200">ssb.cogify.me</strong> replicates real Stage-II Selection Center testing halls (Allahabad, Bhopal, Bangalore, Jalandhar, Kapurthala, Dehradun, Mysuru, Varanasi &amp; Visakhapatnam) so defence aspirants practice with handwritten notebooks under exact projector timings.
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <SpotlightCard accent="emerald" className="p-6 space-y-2.5">
          <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400">
            01 • MANSIK (PSYCHOLOGY)
          </span>
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            Subconscious Personality Projection
          </h2>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Evaluates subconscious thought patterns through TAT (11 Pictures + 1
            Blank Slide), WAT (60 Words × 15s), SRT (60 Situations × 30m), and
            SDT (5 Self-Description paragraphs × 15m).
          </p>
        </SpotlightCard>

        <SpotlightCard accent="amber" className="p-6 space-y-2.5">
          <span className="font-mono text-xs font-bold text-amber-700 dark:text-amber-400">
            02 • KARMAN (GTO TASKS)
          </span>
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            Group Effectiveness &amp; Ground Action
          </h2>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Evaluates real-time teamwork, practical intelligence, and physical
            courage across Group Discussions, Group Planning Exercise, PGT/HGT,
            Lecturette, and Command Task.
          </p>
        </SpotlightCard>

        <SpotlightCard accent="sky" className="p-6 space-y-2.5">
          <span className="font-mono text-xs font-bold text-sky-700 dark:text-sky-400">
            03 • VACHA (PERSONAL INTERVIEW)
          </span>
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            Conscious Expression &amp; PIQ Integrity
          </h2>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Conducted by the Interviewing Officer using Rapid-Fire Comprehensive
            Information Questionnaires (CIQ 1–3) to assess self-awareness,
            honesty, and social adaptability.
          </p>
        </SpotlightCard>
      </div>

      <SpotlightCard accent="violet" className="p-6 sm:p-8 space-y-4">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
          The 15 Officer Like Qualities (OLQs) Across 4 Factors
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 text-xs">
          <div className="rounded-lg border border-zinc-200/80 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-950/60 space-y-1.5">
            <p className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
              Factor I • Planning &amp; Organizing
            </p>
            <ul className="space-y-1 text-zinc-600 dark:text-zinc-400">
              <li>1. Effective Intelligence</li>
              <li>2. Reasoning Ability</li>
              <li>3. Organizing Ability</li>
              <li>4. Power of Expression</li>
            </ul>
          </div>
          <div className="rounded-lg border border-zinc-200/80 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-950/60 space-y-1.5">
            <p className="font-mono font-bold text-sky-700 dark:text-sky-400">
              Factor II • Social Adjustment
            </p>
            <ul className="space-y-1 text-zinc-600 dark:text-zinc-400">
              <li>5. Social Adaptability</li>
              <li>6. Cooperation</li>
              <li>7. Sense of Responsibility</li>
            </ul>
          </div>
          <div className="rounded-lg border border-zinc-200/80 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-950/60 space-y-1.5">
            <p className="font-mono font-bold text-amber-700 dark:text-amber-400">
              Factor III • Social Effectiveness
            </p>
            <ul className="space-y-1 text-zinc-600 dark:text-zinc-400">
              <li>8. Initiative</li>
              <li>9. Self-Confidence</li>
              <li>10. Speed of Decision</li>
              <li>11. Ability to Influence the Group</li>
              <li>12. Liveliness</li>
            </ul>
          </div>
          <div className="rounded-lg border border-zinc-200/80 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-950/60 space-y-1.5">
            <p className="font-mono font-bold text-rose-700 dark:text-rose-400">
              Factor IV • Dynamic
            </p>
            <ul className="space-y-1 text-zinc-600 dark:text-zinc-400">
              <li>13. Determination</li>
              <li>14. Courage</li>
              <li>15. Stamina</li>
            </ul>
          </div>
        </div>
        <div className="pt-2 flex flex-wrap gap-3">
          <Link
            href="/full-test"
            className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 dark:bg-emerald-500 dark:text-zinc-950"
          >
            Start Complete Psychological Test →
          </Link>
          <Link
            href="/gto"
            className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold text-zinc-800 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
          >
            Explore GTO Tasks →
          </Link>
          <Link
            href="/interview"
            className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold text-zinc-800 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
          >
            Practice Personal Interview →
          </Link>
        </div>
      </SpotlightCard>
    </div>
  );
}
