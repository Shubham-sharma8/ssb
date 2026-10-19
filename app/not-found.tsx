import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "404 — Page Not Found | ssb.cogify.me SSB Practice Platform",
  description:
    "The requested SSB practice route could not be found. Return to the SSB Stage-2 Psychological Battery (TAT, WAT, SRT, SDT), GTO Tasks, or Personal Interview Hub.",
  robots: {
    index: false,
    follow: true,
    googleBot: {
      index: false,
      follow: true,
    },
  },
};

export default function NotFoundPage() {
  return (
    <div
      data-testid="custom-404-page"
      className="mx-auto max-w-4xl px-4 py-12 sm:px-6 space-y-8"
    >
      <div className="rounded-2xl border border-zinc-200/90 bg-white p-6 sm:p-8 dark:border-zinc-800 dark:bg-zinc-900 space-y-4">
        <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-300">
          HTTP 404 • ROUTE NOT FOUND
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          This SSB Testing Hall Route Does Not Exist
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl">
          The URL you requested is unavailable or has moved. Choose one of the
          verified Services Selection Board (SSB) Stage-II practice modules
          below to continue your preparation.
        </p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 pt-2">
          <Link
            href="/"
            className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-left hover:bg-emerald-500/15 transition-colors"
          >
            <p className="font-mono text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-300">
              Main Hub
            </p>
            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
              SSB Stage-II Practice Hub →
            </p>
          </Link>

          <Link
            href="/full-test"
            className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-left hover:border-emerald-500/40 transition-colors dark:border-zinc-800 dark:bg-zinc-950"
          >
            <p className="font-mono text-[10px] font-bold uppercase text-zinc-500">
              Full Battery
            </p>
            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
              Complete Psych Test →
            </p>
          </Link>

          <Link
            href="/tat"
            className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-left hover:border-emerald-500/40 transition-colors dark:border-zinc-800 dark:bg-zinc-950"
          >
            <p className="font-mono text-[10px] font-bold uppercase text-zinc-500">
              TAT Sets 1–10
            </p>
            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
              Thematic Apperception →
            </p>
          </Link>

          <Link
            href="/wat"
            className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-left hover:border-sky-500/40 transition-colors dark:border-zinc-800 dark:bg-zinc-950"
          >
            <p className="font-mono text-[10px] font-bold uppercase text-zinc-500">
              60 Words • 15s
            </p>
            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
              Word Association (WAT) →
            </p>
          </Link>

          <Link
            href="/srt"
            className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-left hover:border-amber-500/40 transition-colors dark:border-zinc-800 dark:bg-zinc-950"
          >
            <p className="font-mono text-[10px] font-bold uppercase text-zinc-500">
              60 Situations • 30m
            </p>
            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
              Situation Reaction (SRT) →
            </p>
          </Link>

          <Link
            href="/gto"
            className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-left hover:border-amber-500/40 transition-colors dark:border-zinc-800 dark:bg-zinc-950"
          >
            <p className="font-mono text-[10px] font-bold uppercase text-zinc-500">
              9 GTO Tasks
            </p>
            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
              GTO &amp; Lecturette Timer →
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
