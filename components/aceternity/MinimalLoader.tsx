"use client";

import React from "react";

export interface MinimalLoaderProps {
  label?: string;
  sublabel?: string;
  fullScreen?: boolean;
}

/**
 * Aceternity UI — Minimal Multi-Step / Pulse Loader
 * Eliminates layout jump during hydration or test initialization.
 */
export function MinimalLoader({
  label = "Preparing SSB Assessment Environment",
  sublabel = "ssb.cogify.me • DIPR Stage-II Standard",
  fullScreen = false,
}: MinimalLoaderProps) {
  return (
    <div
      data-testid="ssb-minimal-loader"
      className={`flex flex-col items-center justify-center px-6 text-center transition-opacity duration-300 ${
        fullScreen
          ? "min-h-[75vh] w-full"
          : "min-h-[260px] w-full rounded-xl border border-zinc-200/80 bg-white/60 p-8 dark:border-zinc-800/80 dark:bg-zinc-900/50"
      }`}
    >
      <div className="relative mb-5 flex h-12 w-12 items-center justify-center">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500/20 duration-1000" />
        <span className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/15 to-sky-500/15 shadow-sm">
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent dark:border-emerald-400 dark:border-t-transparent" />
        </span>
      </div>

      <p className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
        {label}
      </p>
      <p className="mt-1 font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
        {sublabel}
      </p>

      {/* Progress shimmer bar */}
      <div className="mt-4 h-1 w-44 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
        <div className="h-full w-1/2 animate-pulse rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500" />
      </div>
    </div>
  );
}
