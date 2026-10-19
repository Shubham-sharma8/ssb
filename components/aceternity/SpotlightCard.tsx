"use client";

import React, { useRef, useState } from "react";

export type SpotlightAccent = "emerald" | "amber" | "sky" | "violet" | "rose" | "neutral";

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
 * Aceternity UI — Interactive Spotlight & Accent Card
 * Provides subtle cursor-tracking illumination and refined color-coded top border accents.
 */
export function SpotlightCard({
  children,
  accent = "emerald",
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

  const styleConfig = ACCENT_MAP[accent] ?? ACCENT_MAP.emerald;

  return (
    <div
      ref={divRef}
      data-testid={dataTestId}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={`group relative overflow-hidden rounded-xl border border-zinc-200/90 bg-white/95 transition-all duration-300 dark:border-zinc-800/90 dark:bg-zinc-900/80 ${styleConfig.border} ${className}`}
    >
      {/* Top subtle color accent line */}
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r ${styleConfig.topBar}`}
      />
      {/* Aceternity radial spotlight */}
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
