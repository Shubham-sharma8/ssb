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

export default function DashboardPage() {
  const tatSets = getPracticeSets();
  const watSets = getWatSets();
  const srtSets = getSrtSets();
  const totalWatWords = getWatTotalWordsCount();
  const totalSrtQuestions = getSrtTotalQuestionsCount();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-12">

      {/* Z-Pattern Hero Header with Aceternity ContainerTextFlip & Color Accents */}
      <section className="relative overflow-hidden rounded-2xl border border-zinc-200/90 bg-white/95 p-6 sm:p-9 shadow-xs dark:border-zinc-800/90 dark:bg-zinc-900/85">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl dark:bg-emerald-500/15" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl dark:bg-sky-500/10" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-wider text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                SSB STAGE-II TESTING PLATFORM
              </span>
              <span className="rounded-full border border-zinc-200 bg-zinc-100 px-2.5 py-0.5 font-mono text-[11px] font-medium text-zinc-600 dark:border-zinc-800 dark:bg-zinc-800/80 dark:text-zinc-300">
                Psychology • GTO • Interview
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 leading-tight">
              Authentic SSB Practice for{" "}
              <span className="block sm:inline mt-1.5 sm:mt-0">
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

            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Simulate the exact Services Selection Board testing environment across{" "}
              <strong className="font-semibold text-emerald-700 dark:text-emerald-400">
                Psychology (TAT, WAT, SRT, SDT)
              </strong>
              ,{" "}
              <strong className="font-semibold text-amber-700 dark:text-amber-400">
                GTO Tasks
              </strong>
              , and{" "}
              <strong className="font-semibold text-sky-700 dark:text-sky-400">
                Personal Interview
              </strong>
              . Write responses in your physical notebook under real board timings,
              finish anytime to export your attempted Question Booklet PDF, and
              evaluate with our Pin-Point AI Psychologist Prompt.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                href="/full-test"
                data-testid="dashboard-start-full-psych-test"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 transition-all dark:bg-emerald-500 dark:text-zinc-950 dark:hover:bg-emerald-400"
              >
                <span>Start Complete Psychological Test</span>
                <span aria-hidden="true">→</span>
              </Link>
              <a
                href="/Phys-Test-Booklet.pdf"
                download="SSB-Psych-Test-Booklet.pdf"
                data-testid="download-booklet-btn"
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-zinc-900 hover:bg-zinc-100 transition-colors dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
              >
                <svg
                  className="h-4 w-4 text-emerald-600 dark:text-emerald-400"
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

          {/* Quick SSB Pillars Summary Box */}
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-2.5 lg:w-72 shrink-0">
            <Link
              href="#psych-battery"
              className="group flex items-center justify-between rounded-xl border border-emerald-500/25 bg-emerald-500/5 px-4 py-3 hover:bg-emerald-500/10 transition-colors"
            >
              <div>
                <span className="block font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  PILLAR 01 • MANSIK
                </span>
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  Psychological Battery (4 Tests)
                </span>
              </div>
              <span className="text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform">
                →
              </span>
            </Link>

            <Link
              href="/gto"
              className="group flex items-center justify-between rounded-xl border border-amber-500/25 bg-amber-500/5 px-4 py-3 hover:bg-amber-500/10 transition-colors"
            >
              <div>
                <span className="block font-mono text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  PILLAR 02 • KARMAN
                </span>
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  GTO Officer Tasks &amp; Lecturette
                </span>
              </div>
              <span className="text-amber-600 dark:text-amber-400 group-hover:translate-x-0.5 transition-transform">
                →
              </span>
            </Link>

            <Link
              href="/interview"
              className="group flex items-center justify-between rounded-xl border border-sky-500/25 bg-sky-500/5 px-4 py-3 hover:bg-sky-500/10 transition-colors"
            >
              <div>
                <span className="block font-mono text-[10px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400">
                  PILLAR 03 • VACHA
                </span>
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  Personal Interview &amp; CIQ
                </span>
              </div>
              <span className="text-sky-600 dark:text-sky-400 group-hover:translate-x-0.5 transition-transform">
                →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Section 1: The Three SSB Assessment Pillars (Psychology, GTO, Personal Interview) */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Complete SSB Stage-II Assessment Pillars
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Choose an SSB assessment pillar below — Psychological Tests (TAT, WAT, SRT, SDT), GTO Tasks, or Personal Interview.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <SpotlightCard accent="emerald" className="p-5 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                  PSYCHOLOGY • DAY 2
                </span>
                <span className="font-mono text-[11px] text-zinc-500">
                  TAT • WAT • SRT • SDT
                </span>
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Psychological Test Battery
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Full Stage-II projector simulation: 10 TAT Sets (11 Pictures + 1
                Blank Slide), 10 Selection Board WAT Sets (15s/word with audio
                beep), 230 SRT Situations, and 15-minute SDT.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center gap-2">
              <Link
                href="/full-test"
                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 dark:bg-emerald-500 dark:text-zinc-950"
              >
                Full Psych Battery
              </Link>
              <Link
                href="/tat"
                className="rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                TAT
              </Link>
              <Link
                href="/wat"
                className="rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                WAT
              </Link>
              <Link
                href="/srt"
                className="rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                SRT
              </Link>
            </div>
          </SpotlightCard>

          <SpotlightCard accent="amber" className="p-5 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-amber-500/10 px-2.5 py-0.5 font-mono text-[11px] font-bold text-amber-700 dark:text-amber-300">
                  GTO SERIES • DAY 3 &amp; 4
                </span>
                <span className="font-mono text-[11px] text-zinc-500">
                  9 Outdoor &amp; Indoor Tasks
                </span>
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                GTO Officer Tasks &amp; Lecturette
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Practice with the interactive 3-minute Lecturette Card Timer (with
                2:30 warning bell) and review Group Discussion, GPE, PGT/HGT, and
                Command Task rules.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
              <span className="font-mono text-[11px] text-zinc-500">
                GD • GPE • Lecturette • CT
              </span>
              <Link
                href="/gto"
                className="rounded-lg bg-amber-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-amber-500 dark:bg-amber-500 dark:text-zinc-950"
              >
                Open GTO Hub →
              </Link>
            </div>
          </SpotlightCard>

          <SpotlightCard accent="sky" className="p-5 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-sky-500/10 px-2.5 py-0.5 font-mono text-[11px] font-bold text-sky-700 dark:text-sky-300">
                  IO INTERVIEW • DAY 2–4
                </span>
                <span className="font-mono text-[11px] text-zinc-500">
                  PIQ &amp; Rapid-Fire CIQs
                </span>
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Personal Interview Simulator
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Rehearse bundled Rapid-Fire Comprehensive Information Questions
                (CIQ-1 Academics, CIQ-2 Family &amp; Routine, CIQ-3 Hobbies &amp;
                Defense Knowledge) cross-matched with your SDT.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
              <span className="font-mono text-[11px] text-zinc-500">
                CIQ-1 • CIQ-2 • CIQ-3 • PIQ
              </span>
              <Link
                href="/interview"
                className="rounded-lg bg-sky-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-sky-500 dark:bg-sky-500 dark:text-zinc-950"
              >
                Practice Interview →
              </Link>
            </div>
          </SpotlightCard>
        </div>
      </section>

      {/* Section 2: All 4 Psychological Tests (TAT, WAT, SRT, SDT) */}
      <section id="psych-battery" className="space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Psychological Tests (Individual &amp; Complete Battery)
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Run any individual test below or launch the complete continuous 4-stage battery. You can click &ldquo;Finish Test&rdquo; anytime to export only what you attempted.
            </p>
          </div>
          <Link
            href="/full-test"
            className="text-xs font-semibold text-emerald-700 hover:underline dark:text-emerald-400"
          >
            Launch Complete 4-Stage Battery →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* TAT Card */}
          <SpotlightCard
            accent="emerald"
            dataTestId="module-card-tat"
            className="p-5 flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  01 • TAT
                </span>
                <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                  10 SETS • 11+1 SLIDES
                </span>
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Thematic Apperception Test
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                11 sequential picture slides + 12th Blank Slide. 30s silent
                viewing followed by 4m dark-screen story writing in your notebook.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
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
            className="p-5 flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-sky-700 dark:text-sky-400">
                  02 • WAT
                </span>
                <span className="rounded-md bg-sky-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-sky-700 dark:text-sky-300">
                  {watSets.length} SETS • {totalWatWords} WORDS
                </span>
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Word Association Test
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                SSB Allahabad, Bhopal, Jalandhar, Bangalore &amp; Dehradun sets.
                60 words at 15s per word with audio beep &amp; 30s page-turn
                after every 20 words.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
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
            className="p-5 flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-amber-700 dark:text-amber-400">
                  03 • SRT
                </span>
                <span className="rounded-md bg-amber-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-amber-700 dark:text-amber-300">
                  {srtSets.length} SETS • {totalSrtQuestions} SITUATIONS
                </span>
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Situation Reaction Test
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Real-time Random SRT generator + 4 Predefined Sets. Displays 5
                situations per sheet with an invisible 30-minute timer.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
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
            className="p-5 flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-violet-700 dark:text-violet-400">
                  04 • SDT
                </span>
                <span className="rounded-md bg-violet-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-violet-700 dark:text-violet-300">
                  5 SECTIONS • 15 MIN
                </span>
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Self-Description Test
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Write 5 structured self-description paragraphs (Parents,
                Teachers, Friends, Self-Appraisal &amp; Future Persona) under a
                silent 15-minute timer.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
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

      {/* Section 3: How Pin-Point AI Evaluation Works (Aceternity 3-Step Workflow) */}
      <section className="rounded-2xl border border-emerald-500/25 bg-gradient-to-br from-emerald-500/5 via-white to-sky-500/5 p-6 sm:p-7 dark:border-emerald-400/20 dark:from-emerald-500/10 dark:via-zinc-900 dark:to-sky-500/10 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              POST-TEST AI EVALUATION WORKFLOW
            </span>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              How to Evaluate Your Handwritten Responses in 3 Steps
            </h2>
          </div>
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-mono text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">
            Works even when you Finish Test early
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-zinc-200/80 bg-white/90 p-4 dark:border-zinc-800 dark:bg-zinc-950/80 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 font-mono text-xs font-bold text-white">
                1
              </span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                Complete or Click &ldquo;Finish Test&rdquo;
              </h3>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Write your answers in your notebook during the projection. Finish
              the full set or click{" "}
              <strong className="font-semibold text-zinc-900 dark:text-zinc-200">
                Finish Test
              </strong>{" "}
              anytime in-between — the exported PDF automatically contains{" "}
              <em>only</em> the items you attempted.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-200/80 bg-white/90 p-4 dark:border-zinc-800 dark:bg-zinc-950/80 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-600 font-mono text-xs font-bold text-white">
                2
              </span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                Export PDF &amp; Copy Pin-Point Prompt
              </h3>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
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

          <div className="rounded-xl border border-zinc-200/80 bg-white/90 p-4 dark:border-zinc-800 dark:bg-zinc-950/80 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-600 font-mono text-xs font-bold text-white">
                3
              </span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                Upload Handwritten Scan to Any AI
              </h3>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Paste the copied prompt into ChatGPT, Claude, or Gemini along with
              your Question Booklet PDF and photos of your handwritten answers
              for pin-point DIPR Psychologist feedback &amp; rewrites.
            </p>
          </div>
        </div>
      </section>

      {/* Section 4: Direct Launch for TAT Sets (SET 1 – SET 10) */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              TAT Sets (SET 1 – SET 10 • All 118 Real Pictures Approved)
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              11 chronological pictures + 12th Blank Slide per set. Click any set to start immediately in Authentic SSB Mode.
            </p>
          </div>
          <Link
            href="/library"
            className="text-xs font-semibold text-emerald-700 hover:underline dark:text-emerald-400"
          >
            Preview Set Slides →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {tatSets.map((set) => (
            <div
              key={set.id}
              data-testid={`home-set-card-${set.id}`}
              className="flex flex-col justify-between rounded-xl border border-zinc-200/90 bg-white p-4 transition-all hover:border-emerald-500/40 hover:shadow-xs dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {set.title}
                  </span>
                  <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                    11 + 1 Blank
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  {set.sourceFilename} • {set.sectionLabel ?? "12 Slides"}
                </p>
              </div>

              <div className="mt-4 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-2">
                <Link
                  href={`/tat?set=${set.id}`}
                  className="text-[11px] font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                >
                  Options
                </Link>
                <Link
                  href={`/tat/session?set=${set.id}&mode=realistic`}
                  data-testid={`quick-start-${set.id}`}
                  className="rounded-lg bg-zinc-900 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-emerald-600 transition-colors dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-emerald-400"
                >
                  Start {set.title} →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 5: Selection Board WAT Sets */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Selection Board WAT Sets (60 Words • 15s Audio Beep)
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Recent board sets from SSB Allahabad, Bangalore, Jalandhar, Bhopal, and 1 AFSB Dehradun.
            </p>
          </div>
          <Link
            href="/wat"
            className="text-xs font-semibold text-sky-700 hover:underline dark:text-sky-400"
          >
            All {watSets.length} WAT Sets →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {watSets.slice(0, 5).map((wSet) => (
            <Link
              key={wSet.setId}
              href={`/wat?set=${wSet.setId}`}
              data-testid={`home-wat-${wSet.setId}`}
              className="group flex flex-col justify-between rounded-xl border border-zinc-200/90 bg-white p-4 hover:border-sky-500/40 transition-all dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="space-y-1">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400">
                  {wSet.board}
                </span>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {wSet.label}
                </h3>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  60 Words • 15s / Word
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[11px] font-semibold text-zinc-900 dark:text-zinc-100">
                <span>Launch WAT</span>
                <span className="group-hover:translate-x-0.5 transition-transform">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
