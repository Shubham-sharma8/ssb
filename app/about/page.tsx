import React from "react";
import Link from "next/link";
import { SpotlightCard } from "@/components/aceternity/SpotlightCard";

export default function AboutSsbPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      <section className="relative overflow-hidden rounded-3xl border border-zinc-200/90 bg-white dark:border-white/[0.08] dark:bg-[#0b0f17] p-6 sm:p-10 shadow-sm">
        <div className="absolute inset-0 bg-grid-pattern opacity-60 pointer-events-none" />
        <div className="relative z-10 space-y-3 max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
            ABOUT SSB.COGIFY.ME • DIPR METHODOLOGY
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Authentic Services Selection Board (SSB) Practice Platform
          </h1>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 leading-relaxed">
            Built by{" "}
            <a
              href="https://cogify.me"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-indigo-600 underline underline-offset-2 dark:text-indigo-400"
            >
              cogify.me
            </a>
            ,{" "}
            <strong className="font-semibold text-zinc-900 dark:text-white">
              ssb.cogify.me
            </strong>{" "}
            replicates real Stage-II Selection Center testing halls (Allahabad,
            Bhopal, Bangalore, Jalandhar, Kapurthala, Dehradun, Mysuru, Varanasi
            &amp; Visakhapatnam) so defence aspirants practice with handwritten
            notebooks under exact projector timings.
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <SpotlightCard accent="indigo" className="p-6 space-y-2.5">
          <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
            01 • MANSIK (PSYCHOLOGY)
          </span>
          <h2 className="text-base font-bold text-zinc-900 dark:text-white">
            Subconscious Personality Projection
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Evaluates subconscious thought patterns through TAT (11 Pictures + 1
            Blank Slide), WAT (60 Words × 15s), SRT (60 Situations × 30m), and
            SDT (5 Self-Description paragraphs × 15m).
          </p>
        </SpotlightCard>

        <SpotlightCard accent="amber" className="p-6 space-y-2.5">
          <span className="font-mono text-xs font-bold text-amber-700 dark:text-amber-400">
            02 • KARMAN (GTO TASKS)
          </span>
          <h2 className="text-base font-bold text-zinc-900 dark:text-white">
            Group Effectiveness &amp; Ground Action
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Evaluates real-time teamwork, practical intelligence, and physical
            courage across Group Discussions, Group Planning Exercise, PGT/HGT,
            Lecturette, and Command Task.
          </p>
        </SpotlightCard>

        <SpotlightCard accent="sky" className="p-6 space-y-2.5">
          <span className="font-mono text-xs font-bold text-sky-700 dark:text-sky-400">
            03 • VACHA (PERSONAL INTERVIEW)
          </span>
          <h2 className="text-base font-bold text-zinc-900 dark:text-white">
            Conscious Expression &amp; PIQ Integrity
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Conducted by the Interviewing Officer using Rapid-Fire Comprehensive
            Information Questionnaires (CIQ 1–3) to assess self-awareness,
            honesty, and social adaptability.
          </p>
        </SpotlightCard>
      </div>

      <SpotlightCard accent="indigo" className="p-6 sm:p-8 space-y-5">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
          The 15 Officer Like Qualities (OLQs) Across 4 Factors
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 text-xs sm:text-sm">
          <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/70 p-4 dark:border-white/[0.08] dark:bg-white/[0.02] space-y-1.5">
            <p className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
              Factor I • Planning &amp; Organizing
            </p>
            <ul className="space-y-1 text-zinc-600 dark:text-zinc-400">
              <li>1. Effective Intelligence</li>
              <li>2. Reasoning Ability</li>
              <li>3. Organizing Ability</li>
              <li>4. Power of Expression</li>
            </ul>
          </div>
          <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/70 p-4 dark:border-white/[0.08] dark:bg-white/[0.02] space-y-1.5">
            <p className="font-mono font-bold text-sky-700 dark:text-sky-400">
              Factor II • Social Adjustment
            </p>
            <ul className="space-y-1 text-zinc-600 dark:text-zinc-400">
              <li>5. Social Adaptability</li>
              <li>6. Cooperation</li>
              <li>7. Sense of Responsibility</li>
            </ul>
          </div>
          <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/70 p-4 dark:border-white/[0.08] dark:bg-white/[0.02] space-y-1.5">
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
          <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/70 p-4 dark:border-white/[0.08] dark:bg-white/[0.02] space-y-1.5">
            <p className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
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
            className="rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors"
          >
            Start Complete Psychological Test →
          </Link>
          <Link
            href="/gto"
            className="rounded-xl border border-zinc-300 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2.5 text-xs font-semibold text-zinc-800 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-white/10"
          >
            Explore GTO Tasks →
          </Link>
          <Link
            href="/interview"
            className="rounded-xl border border-zinc-300 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2.5 text-xs font-semibold text-zinc-800 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-white/10"
          >
            Practice Personal Interview →
          </Link>
        </div>
      </SpotlightCard>

      {/* Author Bio & Editorial Standards (E-E-A-T) matching cogify.me AuthorBio widget */}
      <section
        data-testid="about-author-bio"
        aria-labelledby="about-author-heading"
        className="rounded-3xl border border-zinc-200/90 bg-white p-6 sm:p-8 dark:border-white/[0.08] dark:bg-[#0b0f17] space-y-6 shadow-sm"
      >
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-cyan-600 flex items-center justify-center p-2.5 shrink-0 shadow-md shadow-indigo-500/20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/logo_white.png"
              alt="Shubham Sharma — COGIFY Systems Architect"
              width={40}
              height={40}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="space-y-1.5">
            <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              AUTHOR BIO &amp; EDITORIAL STANDARDS
            </span>
            <h2
              id="about-author-heading"
              className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white"
            >
              Shubham Sharma &amp; COGIFY Defence Psychology Research Team
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-3xl">
              All stimulus sets, timing engines, and evaluation frameworks on{" "}
              <strong>ssb.cogify.me</strong> are researched, curated, and
              maintained by the <strong>COGIFY Defence Assessment Wing</strong>{" "}
              in accordance with the testing protocols established by the{" "}
              <strong>
                Defence Institute of Psychological Research (DIPR, DRDO)
              </strong>
              . Rather than relying on generic AI-generated articles or
              pre-memorized coaching stories, our platform enforces authentic
              testing conditions: handwritten response booklets, zero visible
              countdown clocks in Hall Mode, and post-session Pin-Point OLQ
              triangulation.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 text-xs pt-2">
          <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/70 p-4 dark:border-white/[0.08] dark:bg-white/[0.02] space-y-1">
            <p className="font-semibold text-zinc-900 dark:text-white">
              Primary Research &amp; Calibration
            </p>
            <p className="text-zinc-600 dark:text-zinc-400">
              Verified against candidate test batteries from SCE Allahabad, SCN
              Kapurthala/Jalandhar, SCS Bangalore, SCC Bhopal, and AFSBs
              (Dehradun, Mysuru, Varanasi, Gandhinagar).
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/70 p-4 dark:border-white/[0.08] dark:bg-white/[0.02] space-y-1">
            <p className="font-semibold text-zinc-900 dark:text-white">
              Human-First Assessment Ethics
            </p>
            <p className="text-zinc-600 dark:text-zinc-400">
              Zero pre-cooked stories. Every evaluation prompt audits your
              handwritten scan line-by-line for incongruence between TAT, WAT,
              SRT, and SDT responses.
            </p>
          </div>
          <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/70 p-4 dark:border-white/[0.08] dark:bg-white/[0.02] space-y-1">
            <p className="font-semibold text-zinc-900 dark:text-white">
              Parent Organization
            </p>
            <p className="text-zinc-600 dark:text-zinc-400">
              Published by{" "}
              <a
                href="https://cogify.me"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-indigo-600 underline dark:text-indigo-400"
              >
                COGIFY (cogify.me)
              </a>{" "}
              — Cognitive Assessment &amp; High-Precision Simulation Systems.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
