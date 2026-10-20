"use client";

import React, { useEffect, useState } from "react";

export interface ContainerTextFlipProps {
  words?: string[];
  interval?: number;
  className?: string;
}

/**
 * Unified cogify.me Container Text Flip
 * Smoothly flips between key SSB assessment stages inside an adaptive indigo/cyan pill container.
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
  const longestWord = words.reduce(
    (longest, candidate) =>
      candidate.length > longest.length ? candidate : longest,
    words[0] ?? ""
  );

  return (
    <span
      data-testid="aceternity-text-flip"
      className={`relative inline-grid place-items-center overflow-hidden rounded-xl border border-indigo-500/25 bg-gradient-to-r from-indigo-500/10 via-indigo-500/5 to-cyan-500/10 px-3.5 py-1 font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-600 dark:from-indigo-300 dark:via-indigo-200 dark:to-cyan-300 shadow-[inset_0_1px_0_0_rgba(99,102,241,0.2)] transition-colors duration-300 dark:border-indigo-400/25 ${className}`}
    >
      {/* Invisible longest-word sizer prevents Cumulative Layout Shift (CLS) on word flip */}
      <span
        aria-hidden="true"
        className="col-start-1 row-start-1 invisible pointer-events-none select-none whitespace-nowrap"
      >
        {longestWord}
      </span>
      <span
        className={`col-start-1 row-start-1 inline-block whitespace-nowrap text-indigo-600 dark:text-indigo-300 transition-transform duration-200 ease-out ${
          animating
            ? "-translate-y-3 scale-95 opacity-0"
            : "translate-y-0 scale-100 opacity-100"
        }`}
      >
        {currentWord}
      </span>
    </span>
  );
}
