import React from "react";
import Link from "next/link";
import { getPracticeSets } from "@/lib/tat/catalog";
import {
  getWatSets,
  getWatTotalWordsCount,
  getSrtSets,
  getSrtTotalQuestionsCount,
} from "@/lib/psych/catalog";
import { ContainerTextFlip } from "@/components/aceternity/ContainerTextFlip";
import { SpotlightCard } from "@/components/aceternity/SpotlightCard";
import { Spotlight } from "@/components/ui/Spotlight";

export default function DashboardPage() {
  const tatSets = getPracticeSets();
  const watSets = getWatSets();
  const srtSets = getSrtSets();
  const totalWatWords = getWatTotalWordsCount();
  const totalSrtQuestions = getSrtTotalQuestionsCount();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-16">
      {/* Unified cogify.me Hero Section with Spotlight & Grid Pattern */}
      <section className="relative overflow-hidden rounded-3xl border border-zinc-200/90 bg-white dark:border-white/[0.08] dark:bg-[#0b0f17] p-6 sm:p-10 lg:p-12 shadow-sm">
        {/* Background Spotlight & Grid matching cogify.me */}
        <Spotlight
          className="-top-40 left-0 md:left-60 md:-top-20"
          fill="#6366f1"
        />
        <div className="absolute inset-0 bg-grid-pattern opacity-60 pointer-events-none" />
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl dark:bg-indigo-500/15" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl dark:bg-cyan-500/10" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
          <div className="space-y-6 max-w-3xl">
            {/* Top Pill Badges matching cogify.me */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                <span>COGIFY Defence Suite • Stage-II Simulator</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
                <span>100% Client-Side • Zero Cloud Telemetry</span>
              </span>
            </div>

            {/* Single H1 matching cogify.me typography */}
            <h1 className="text-3xl sm:text-5xl lg:text-[3.35rem] font-extrabold tracking-tight text-zinc-900 dark:text-white leading-[1.1]">
              Authentic{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-600 dark:from-indigo-300 dark:via-indigo-200 dark:to-cyan-300">
                SSB Practice
              </span>{" "}
              for{" "}
              <span className="block sm:inline mt-2 sm:mt-0">
                <ContainerTextFlip
                  words={[
                    "Psychological Tests",
                    "TAT • WAT • SRT • SDT",
                    "GTO Officer Tasks",
                    "Personal Interview",
                  ]}
                />
              </span>
            </h1>

            <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-300 leading-relaxed font-normal">
              Simulate the exact Services Selection Board testing hall across{" "}
              <strong className="font-semibold text-indigo-600 dark:text-indigo-300">
                Psychology (TAT, WAT, SRT, SDT)
              </strong>
              ,{" "}
              <strong className="font-semibold text-amber-600 dark:text-amber-300">
                GTO Officer Tasks
              </strong>
              , and{" "}
              <strong className="font-semibold text-cyan-600 dark:text-cyan-300">
                Personal Interview
              </strong>
              . Write responses in your physical notebook under real DIPR board
              timings, finish anytime to export your attempted Question Booklet
              PDF, and evaluate with our Pin-Point AI Psychologist Prompt.
            </p>

            {/* Primary CTA Row matching cogify.me */}
            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              <Link
                href="/full-test"
                data-testid="dashboard-start-full-psych-test"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 border border-indigo-400/30 transition-all duration-200 active:scale-[0.98]"
              >
                <span>Start Complete Psychological Test</span>
                <span aria-hidden="true">→</span>
              </Link>
              <a
                href="/Phys-Test-Booklet.pdf"
                download="SSB-Psych-Test-Booklet.pdf"
                data-testid="download-booklet-btn"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-300 dark:border-white/15 bg-zinc-100/90 dark:bg-white/[0.06] hover:bg-zinc-200/80 dark:hover:bg-white/[0.12] px-5 py-3.5 text-sm font-semibold text-zinc-900 dark:text-white backdrop-blur-md transition-all duration-200"
              >
                <svg
                  className="h-4 w-4 text-indigo-600 dark:text-indigo-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
                  />
                </svg>
                <span>Download 16-Page Answer Booklet PDF</span>
              </a>
            </div>
          </div>

          {/* Right Quick SSB Pillars Stack matching cogify.me Bento style */}
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3 lg:w-80 shrink-0">
            <Link
              href="#psych-battery"
              className="group flex items-center justify-between rounded-2xl border border-indigo-500/25 bg-indigo-500/[0.06] px-4 py-3.5 hover:bg-indigo-500/[0.12] transition-all"
            >
              <div>
                <span className="block font-mono text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  PILLAR 01 • MANSIK
                </span>
                <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Psychological Battery (4 Tests)
                </span>
              </div>
              <span className="text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform">
                →
              </span>
            </Link>

            <Link
              href="/gto"
              className="group flex items-center justify-between rounded-2xl border border-amber-500/25 bg-amber-500/[0.06] px-4 py-3.5 hover:bg-amber-500/[0.12] transition-all"
            >
              <div>
                <span className="block font-mono text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  PILLAR 02 • KARMAN
                </span>
                <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  GTO Officer Tasks &amp; Lecturette
                </span>
              </div>
              <span className="text-amber-600 dark:text-amber-400 group-hover:translate-x-0.5 transition-transform">
                →
              </span>
            </Link>

            <Link
              href="/interview"
              className="group flex items-center justify-between rounded-2xl border border-cyan-500/25 bg-cyan-500/[0.06] px-4 py-3.5 hover:bg-cyan-500/[0.12] transition-all"
            >
              <div>
                <span className="block font-mono text-[10px] font-bold uppercase tracking-wider text-cyan-700 dark:text-cyan-400">
                  PILLAR 03 • VACHA
                </span>
                <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Personal Interview &amp; CIQ
                </span>
              </div>
              <span className="text-cyan-600 dark:text-cyan-400 group-hover:translate-x-0.5 transition-transform">
                →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Section 1: The Three SSB Assessment Pillars (Psychology, GTO, Personal Interview) */}
      <section className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-[11px] font-semibold uppercase tracking-widest">
              DIPR Three-Technique Triangulation
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Complete SSB Stage-II Assessment Pillars
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Choose an SSB assessment pillar below — Psychological Tests (TAT,
              WAT, SRT, SDT), GTO Tasks, or Personal Interview.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <SpotlightCard
            accent="indigo"
            className="p-6 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 font-mono text-[11px] font-bold text-indigo-700 dark:text-indigo-300">
                  PSYCHOLOGY • DAY 2
                </span>
                <span className="font-mono text-[11px] text-zinc-500">
                  TAT • WAT • SRT • SDT
                </span>
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                Psychological Test Battery
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Full Stage-II projector simulation: 10 TAT Sets (11 Pictures + 1
                Blank Slide), 10 Selection Board WAT Sets (15s/word with audio
                beep), 230 SRT Situations, and 15-minute SDT.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-zinc-200/80 dark:border-white/[0.08] flex flex-wrap items-center gap-2">
              <Link
                href="/full-test"
                className="rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors"
              >
                Full Psych Battery
              </Link>
              <Link
                href="/tat"
                className="rounded-xl border border-zinc-200 dark:border-white/10 px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/5"
              >
                TAT
              </Link>
              <Link
                href="/wat"
                className="rounded-xl border border-zinc-200 dark:border-white/10 px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/5"
              >
                WAT
              </Link>
              <Link
                href="/srt"
                className="rounded-xl border border-zinc-200 dark:border-white/10 px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/5"
              >
                SRT
              </Link>
            </div>
          </SpotlightCard>

          <SpotlightCard
            accent="amber"
            className="p-6 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 font-mono text-[11px] font-bold text-amber-700 dark:text-amber-300">
                  GTO SERIES • DAY 3 &amp; 4
                </span>
                <span className="font-mono text-[11px] text-zinc-500">
                  9 Outdoor &amp; Indoor Tasks
                </span>
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                GTO Officer Tasks &amp; Lecturette
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Practice with the interactive 3-minute Lecturette Card Timer
                (with 2:30 warning bell) and review Group Discussion, GPE,
                PGT/HGT, and Command Task rules.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-zinc-200/80 dark:border-white/[0.08] flex items-center justify-between">
              <span className="font-mono text-[11px] text-zinc-500">
                GD • GPE • Lecturette • CT
              </span>
              <Link
                href="/gto"
                className="rounded-xl bg-amber-600 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-500 transition-colors"
              >
                Open GTO Hub →
              </Link>
            </div>
          </SpotlightCard>

          <SpotlightCard
            accent="sky"
            className="p-6 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-sky-500/10 border border-sky-500/20 px-2.5 py-0.5 font-mono text-[11px] font-bold text-sky-700 dark:text-sky-300">
                  IO INTERVIEW • DAY 2–4
                </span>
                <span className="font-mono text-[11px] text-zinc-500">
                  PIQ &amp; Rapid-Fire CIQs
                </span>
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                Personal Interview Simulator
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Rehearse bundled Rapid-Fire Comprehensive Information Questions
                (CIQ-1 Academics, CIQ-2 Family &amp; Routine, CIQ-3 Hobbies
                &amp; Defense Knowledge) cross-matched with your SDT.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-zinc-200/80 dark:border-white/[0.08] flex items-center justify-between">
              <span className="font-mono text-[11px] text-zinc-500">
                CIQ-1 • CIQ-2 • CIQ-3 • PIQ
              </span>
              <Link
                href="/interview"
                className="rounded-xl bg-sky-600 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-500 transition-colors"
              >
                Practice Interview →
              </Link>
            </div>
          </SpotlightCard>
        </div>
      </section>

      {/* Section 2: All 4 Psychological Tests (TAT, WAT, SRT, SDT) */}
      <section id="psych-battery" className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold uppercase tracking-widest">
              Hall Projector Modules
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Psychological Tests (Individual &amp; Complete Battery)
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Run any individual test below or launch the complete continuous
              4-stage battery. Click &ldquo;Finish Test&rdquo; anytime to export
              only what you attempted.
            </p>
          </div>
          <Link
            href="/full-test"
            className="text-xs sm:text-sm font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
          >
            Launch Complete 4-Stage Battery →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* TAT Card */}
          <SpotlightCard
            accent="emerald"
            dataTestId="module-card-tat"
            className="p-6 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  01 • TAT
                </span>
                <span className="rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 font-mono text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                  10 SETS • 11+1 SLIDES
                </span>
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                Thematic Apperception Test
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                11 sequential picture slides + 12th Blank Slide. 30s silent
                viewing followed by 4m dark-screen story writing in your
                notebook.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-zinc-200/80 dark:border-white/[0.08] flex items-center justify-between">
              <Link
                href="/library"
                className="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                Browse Sets
              </Link>
              <Link
                href="/tat"
                data-testid="dashboard-configure-tat-link"
                className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
              >
                Practice TAT →
              </Link>
            </div>
          </SpotlightCard>

          {/* WAT Card */}
          <SpotlightCard
            accent="sky"
            dataTestId="module-card-wat"
            className="p-6 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-sky-700 dark:text-sky-400">
                  02 • WAT
                </span>
                <span className="rounded-md bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 font-mono text-[10px] font-semibold text-sky-700 dark:text-sky-300">
                  {watSets.length} SETS • {totalWatWords} WORDS
                </span>
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                Word Association Test
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                SSB Allahabad, Bhopal, Jalandhar, Bangalore &amp; Dehradun sets.
                60 words at 15s per word with audio beep &amp; 30s page-turn
                after every 20 words.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-zinc-200/80 dark:border-white/[0.08] flex items-center justify-between">
              <span className="font-mono text-[11px] text-zinc-500">
                15s / Word • Beep
              </span>
              <Link
                href="/wat"
                className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
              >
                Practice WAT →
              </Link>
            </div>
          </SpotlightCard>

          {/* SRT Card */}
          <SpotlightCard
            accent="amber"
            dataTestId="module-card-srt"
            className="p-6 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-amber-700 dark:text-amber-400">
                  03 • SRT
                </span>
                <span className="rounded-md bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 font-mono text-[10px] font-semibold text-amber-700 dark:text-amber-300">
                  {srtSets.length} SETS • {totalSrtQuestions} SITUATIONS
                </span>
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                Situation Reaction Test
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Real-time Random SRT generator + 4 Predefined Sets. Displays 5
                situations per sheet with an invisible 30-minute timer.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-zinc-200/80 dark:border-white/[0.08] flex items-center justify-between">
              <span className="font-mono text-[11px] text-zinc-500">
                5 / Sheet • 30 Min
              </span>
              <Link
                href="/srt"
                className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
              >
                Practice SRT →
              </Link>
            </div>
          </SpotlightCard>

          {/* SDT Card */}
          <SpotlightCard
            accent="violet"
            dataTestId="module-card-sdt"
            className="p-6 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-violet-700 dark:text-violet-400">
                  04 • SDT
                </span>
                <span className="rounded-md bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 font-mono text-[10px] font-semibold text-violet-700 dark:text-violet-300">
                  5 SECTIONS • 15 MIN
                </span>
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                Self-Description Test
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Write 5 structured self-description paragraphs (Parents,
                Teachers, Friends, Self-Appraisal &amp; Future Persona) under a
                silent 15-minute timer.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-zinc-200/80 dark:border-white/[0.08] flex items-center justify-between">
              <span className="font-mono text-[11px] text-zinc-500">
                15 Min Silent Timer
              </span>
              <Link
                href="/sdt"
                className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
              >
                Practice SDT →
              </Link>
            </div>
          </SpotlightCard>
        </div>
      </section>

      {/* Section 3: How Pin-Point AI Evaluation Works (cogify.me Bento Workflow) */}
      <section className="rounded-3xl border border-zinc-200/90 bg-white dark:border-white/[0.08] dark:bg-[#0b0f17] p-6 sm:p-10 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-[11px] font-semibold uppercase tracking-widest">
              Post-Test AI Evaluation Workflow
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">
              How to Evaluate Your Handwritten Responses in 3 Steps
            </h2>
          </div>
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 font-mono text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            Works even when you Finish Test early
          </span>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/70 p-5 dark:border-white/[0.08] dark:bg-white/[0.02] space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 font-mono text-xs font-bold text-white">
                01
              </span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
                Complete or Click &ldquo;Finish Test&rdquo;
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Write your answers in your notebook during the projection. Finish
              the full set or click{" "}
              <strong className="font-semibold text-zinc-900 dark:text-zinc-200">
                Finish Test
              </strong>{" "}
              anytime in-between — the exported PDF automatically contains{" "}
              <em>only</em> the items you attempted.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/70 p-5 dark:border-white/[0.08] dark:bg-white/[0.02] space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-600 font-mono text-xs font-bold text-white">
                02
              </span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
                Export PDF &amp; Copy Pin-Point Prompt
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Download your attempted{" "}
              <strong className="font-semibold text-zinc-900 dark:text-zinc-200">
                Question Booklet (PDF)
              </strong>{" "}
              and click{" "}
              <strong className="font-semibold text-zinc-900 dark:text-zinc-200">
                Copy Pin-Point AI Evaluation Prompt
              </strong>
              , which includes every attempted stimulus/word/SRT in exact order.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/70 p-5 dark:border-white/[0.08] dark:bg-white/[0.02] space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 font-mono text-xs font-bold text-white">
                03
              </span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
                Upload Handwritten Scan to Any AI
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Paste the copied prompt into ChatGPT, Claude, or Gemini along with
              your Question Booklet PDF and photos of your handwritten answers
              for pin-point DIPR Psychologist feedback &amp; rewrites.
            </p>
          </div>
        </div>
      </section>

      {/* Section 4: Direct Launch for TAT Sets (SET 1 – SET 10) */}
      <section className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
              TAT Sets (SET 1 – SET 10 • All 118 Real Pictures Approved)
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              11 chronological pictures + 12th Blank Slide per set. Click any
              set to start immediately in Authentic SSB Mode.
            </p>
          </div>
          <Link
            href="/library"
            className="text-xs sm:text-sm font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
          >
            Preview Set Slides →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {tatSets.map((set) => (
            <div
              key={set.id}
              data-testid={`home-set-card-${set.id}`}
              className="flex flex-col justify-between rounded-2xl border border-zinc-200/90 bg-white p-4 transition-all hover:border-indigo-500/40 hover:shadow-md dark:border-white/[0.08] dark:bg-[#0b0f17]"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-sm font-bold text-zinc-900 dark:text-white">
                    {set.title}
                  </span>
                  <span className="rounded-md bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                    11 + 1 Blank
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  {set.sourceFilename} • {set.sectionLabel ?? "12 Slides"}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-white/[0.06] flex items-center justify-between gap-2">
                <Link
                  href={`/tat?setId=${set.id}`}
                  className="text-[11px] font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                >
                  Options
                </Link>
                <Link
                  href={`/tat?setId=${set.id}&mode=realistic`}
                  data-testid={`quick-start-${set.id}`}
                  className="rounded-lg bg-indigo-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-indigo-500 transition-colors"
                >
                  Start {set.title} →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 5: Selection Board WAT Sets */}
      <section className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
              Selection Board WAT Sets (60 Words • 15s Audio Beep)
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Recent board sets from SSB Allahabad, Bangalore, Jalandhar,
              Bhopal, and 1 AFSB Dehradun.
            </p>
          </div>
          <Link
            href="/wat"
            className="text-xs sm:text-sm font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
          >
            All {watSets.length} WAT Sets →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {watSets.slice(0, 5).map((wSet) => (
            <Link
              key={wSet.setId}
              href={`/wat?set=${wSet.setId}`}
              data-testid={`home-wat-${wSet.setId}`}
              className="group flex flex-col justify-between rounded-2xl border border-zinc-200/90 bg-white p-4 hover:border-indigo-500/40 hover:shadow-md transition-all dark:border-white/[0.08] dark:bg-[#0b0f17]"
            >
              <div className="space-y-1">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  {wSet.board}
                </span>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                  {wSet.label}
                </h3>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  60 Words • 15s / Word
                </p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-white/[0.06] flex items-center justify-between text-[11px] font-semibold text-zinc-900 dark:text-zinc-100">
                <span>Launch WAT</span>
                <span className="text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Section 6: Frequently Asked Questions matching cogify.me FaqSection widget */}
      <section
        data-testid="seo-faq-section"
        aria-labelledby="faq-heading"
        className="space-y-8"
      >
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs font-semibold uppercase tracking-widest">
            <span>DIPR Stage-II Methodology &amp; Hall FAQ</span>
          </div>
          <h2
            id="faq-heading"
            className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white"
          >
            Frequently Asked Questions — SSB Psychology, GTO &amp; Interview
          </h2>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
            Direct answers to common questions about SSB Stage-2 timings,
            handwritten booklet evaluation, and Selection Center sets.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-3">
          <details
            className="group rounded-2xl bg-white dark:bg-[#0b0f17] border border-zinc-200/90 dark:border-white/[0.08] p-5 sm:p-6 shadow-xs transition-all open:border-indigo-500/30"
            open
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-zinc-900 dark:text-white text-sm sm:text-base">
              <span>
                How does the SSB Stage-2 Psychology Test work on ssb.cogify.me?
              </span>
              <span className="shrink-0 rounded-full bg-zinc-100 dark:bg-white/5 px-2.5 py-1 text-xs font-mono text-indigo-600 dark:text-indigo-400">
                +
              </span>
            </summary>
            <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-white/5 pt-3">
              ssb.cogify.me replicates the exact SSB Testing Hall sequence: TAT
              projects 11 pictures + 1 blank slide (30s picture projection
              followed by 4 minutes of notebook writing with no visible
              countdown), WAT projects 60 words for 15 seconds each with a hall
              beep and a 30-second page-turn timer after every 20 words, SRT
              displays 60 situations (5 per sheet) under an invisible 30-minute
              timer, and SDT provides 15 minutes for the 5 official
              Self-Description paragraphs.
            </p>
          </details>

          <details className="group rounded-2xl bg-white dark:bg-[#0b0f17] border border-zinc-200/90 dark:border-white/[0.08] p-5 sm:p-6 shadow-xs transition-all open:border-indigo-500/30">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-zinc-900 dark:text-white text-sm sm:text-base">
              <span>
                Can I download my attempted Question Booklet PDF and get AI
                evaluation?
              </span>
              <span className="shrink-0 rounded-full bg-zinc-100 dark:bg-white/5 px-2.5 py-1 text-xs font-mono text-indigo-600 dark:text-indigo-400">
                +
              </span>
            </summary>
            <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-white/5 pt-3">
              Yes. After completing any test or finishing early (TAT, WAT, SRT,
              SDT, or the Complete Psychological Test), you can export the exact
              attempted Question Booklet as a PDF and copy a tailored Pin-Point
              AI Psychologist Evaluation Prompt to review your handwritten
              notebook responses against the 15 Officer Like Qualities (OLQs).
            </p>
          </details>

          <details className="group rounded-2xl bg-white dark:bg-[#0b0f17] border border-zinc-200/90 dark:border-white/[0.08] p-5 sm:p-6 shadow-xs transition-all open:border-indigo-500/30">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-zinc-900 dark:text-white text-sm sm:text-base">
              <span>
                Does ssb.cogify.me include GTO Officer Tasks and Personal
                Interview practice?
              </span>
              <span className="shrink-0 rounded-full bg-zinc-100 dark:bg-white/5 px-2.5 py-1 text-xs font-mono text-indigo-600 dark:text-indigo-400">
                +
              </span>
            </summary>
            <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-white/5 pt-3">
              Yes. The GTO Hub includes an interactive 3-Minute Lecturette Card
              &amp; Hall Timer (with a 30-second warning beep and 24 real SSB
              topics) plus complete frameworks for all 9 GTO tasks (GD, GPE,
              PGT, HGT, GOR, IO, CT, FGT). The Interview Hub includes a PIQ Form
              Structuring guide and an interactive CIQ (Comprehensive
              Information Questionnaire) Rapid-Fire Simulator.
            </p>
          </details>

          <details className="group rounded-2xl bg-white dark:bg-[#0b0f17] border border-zinc-200/90 dark:border-white/[0.08] p-5 sm:p-6 shadow-xs transition-all open:border-indigo-500/30">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-zinc-900 dark:text-white text-sm sm:text-base">
              <span>
                Which SSB Selection Centers are covered in the WAT and TAT
                datasets?
              </span>
              <span className="shrink-0 rounded-full bg-zinc-100 dark:bg-white/5 px-2.5 py-1 text-xs font-mono text-indigo-600 dark:text-indigo-400">
                +
              </span>
            </summary>
            <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-white/5 pt-3">
              The platform includes 118 verified TAT stimulus slides across Set
              1 to Set 10, 60-word Selection Center WAT sets calibrated from SSB
              Allahabad (11/14/18/19/34 SSB), SSB Bhopal (20/21/22 SSB), SSB
              Bangalore (17/24 SSB), SSB Jalandhar, 1 AFSB Dehradun, 2 AFSB
              Mysuru, 4 AFSB Varanasi, and 180 Situation Reaction Test (SRT)
              items.
            </p>
          </details>
        </div>
      </section>

      {/* Section 7: E-E-A-T Author & Assessment Methodology Bio matching cogify.me AuthorBio widget */}
      <section
        data-testid="eeat-author-bio"
        aria-labelledby="author-bio-heading"
        className="rounded-3xl bg-white dark:bg-[#0b0f17] border border-zinc-200/90 dark:border-white/[0.08] p-6 sm:p-8 shadow-sm"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
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
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-semibold">
                  Architected &amp; Calibrated By
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[11px] font-medium">
                  Verified DIPR Protocol • Systems Architect
                </span>
              </div>
              <h2
                id="author-bio-heading"
                className="text-lg font-bold text-zinc-900 dark:text-white"
              >
                Shubham Sharma &amp; COGIFY Defence Psychology Research Team
              </h2>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
                Every timing loop, stimulus projection interval, and evaluation
                rubric on <strong>ssb.cogify.me</strong> is engineered around
                the Defence Institute of Psychological Research (DIPR)
                three-technique triangulation doctrine: <em>Mansik</em>{" "}
                (Psychological Battery: TAT, WAT, SRT, SDT), <em>Karman</em>{" "}
                (GTO 9-task series), and <em>Vacha</em> (Personal Interview CIQ
                sequences) with 100% client-side privacy.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link
              href="/about"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-800 dark:text-zinc-200 text-xs font-semibold transition-colors"
            >
              <span>Editorial Methodology</span>
              <span aria-hidden="true">→</span>
            </Link>
            <a
              href="https://cogify.me"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs font-semibold transition-colors"
            >
              <span>COGIFY Ecosystem</span>
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
