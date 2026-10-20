"use client";

import React, { useRef, useState } from "react";

export type SpotlightAccent =
  | "indigo"
  | "emerald"
  | "amber"
  | "sky"
  | "violet"
  | "rose"
  | "neutral";

export interface SpotlightCardProps {
  children: React.ReactNode;
  accent?: SpotlightAccent;
  className?: string;
  dataTestId?: string;
}

const ACCENT_MAP: Record<
  SpotlightAccent,
  { glow: string; border: string; topBar: string }
> = {
  indigo: {
    glow: "rgba(99, 102, 241, 0.14)",
    border: "hover:border-indigo-500/40 dark:hover:border-indigo-400/40",
    topBar: "from-indigo-500/80 via-cyan-500/40 to-transparent",
  },
  emerald: {
    glow: "rgba(16, 185, 129, 0.13)",
    border: "hover:border-emerald-500/40 dark:hover:border-emerald-400/40",
    topBar: "from-emerald-500/70 via-teal-500/40 to-transparent",
  },
  amber: {
    glow: "rgba(245, 158, 11, 0.13)",
    border: "hover:border-amber-500/40 dark:hover:border-amber-400/40",
    topBar: "from-amber-500/70 via-orange-500/40 to-transparent",
  },
  sky: {
    glow: "rgba(14, 165, 233, 0.13)",
    border: "hover:border-sky-500/40 dark:hover:border-sky-400/40",
    topBar: "from-sky-500/70 via-indigo-500/40 to-transparent",
  },
  violet: {
    glow: "rgba(139, 92, 246, 0.13)",
    border: "hover:border-violet-500/40 dark:hover:border-violet-400/40",
    topBar: "from-violet-500/70 via-fuchsia-500/40 to-transparent",
  },
  rose: {
    glow: "rgba(244, 63, 94, 0.13)",
    border: "hover:border-rose-500/40 dark:hover:border-rose-400/40",
    topBar: "from-rose-500/70 via-orange-500/40 to-transparent",
  },
  neutral: {
    glow: "rgba(113, 113, 122, 0.10)",
    border: "hover:border-zinc-400 dark:hover:border-zinc-600",
    topBar: "from-zinc-400/50 via-zinc-300/20 to-transparent",
  },
};

/**
 * Unified cogify.me Bento / Spotlight Card
 * Matches cogify.me's rounded-2xl dark:bg-[#0b0f17] dark:border-white/[0.08] card surface.
 */
export function SpotlightCard({
  children,
  accent = "indigo",
  className = "",
  dataTestId,
}: SpotlightCardProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const styleConfig = ACCENT_MAP[accent] ?? ACCENT_MAP.indigo;

  return (
    <div
      ref={divRef}
      data-testid={dataTestId}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={`group relative overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 dark:shadow-none transition-all duration-300 dark:border-white/[0.08] dark:bg-[#0b0f17] ${styleConfig.border} ${className}`}
    >
      {/* Top subtle color accent line */}
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r ${styleConfig.topBar}`}
      />
      {/* Radial spotlight */}
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300"
        style={{
          opacity,
          background: `radial-gradient(450px circle at ${position.x}px ${position.y}px, ${styleConfig.glow}, transparent 45%)`,
        }}
      />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}
