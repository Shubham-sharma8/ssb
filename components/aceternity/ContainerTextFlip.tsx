"use client";

import React, { useEffect, useState } from "react";

export interface ContainerTextFlipProps {
  words?: string[];
  interval?: number;
  className?: string;
}

/**
 * Aceternity UI — Container Text Flip (Minimal Edition)
 * Smoothly flips between key SSB assessment stages inside an adaptive pill container.
 */
export function ContainerTextFlip({
  words = [
    "Psychological Tests",
    "TAT • WAT • SRT • SDT",
    "GTO Officer Tasks",
    "Personal Interview",
  ],
  interval = 2800,
  className = "",
}: ContainerTextFlipProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (words.length <= 1) return;
    const timer = setInterval(() => {
      setAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % words.length);
        setAnimating(false);
      }, 220);
    }, interval);

    return () => clearInterval(timer);
  }, [words, interval]);

  const currentWord = words[currentIndex] ?? words[0] ?? "";

  return (
    <span
      data-testid="aceternity-text-flip"
      className={`relative inline-flex items-center justify-center overflow-hidden rounded-lg border border-emerald-500/30 bg-gradient-to-b from-emerald-500/10 via-teal-500/5 to-transparent px-3 py-1 font-semibold text-emerald-700 shadow-[inset_0_1px_0_0_rgba(16,185,129,0.2)] transition-all duration-300 dark:border-emerald-400/30 dark:from-emerald-400/15 dark:via-teal-400/5 dark:text-emerald-300 ${className}`}
    >
      <span
        className={`inline-block transition-all duration-200 ease-out ${
          animating
            ? "-translate-y-3 scale-95 opacity-0 blur-[2px]"
            : "translate-y-0 scale-100 opacity-100 blur-0"
        }`}
      >
        {currentWord}
      </span>
    </span>
  );
}
