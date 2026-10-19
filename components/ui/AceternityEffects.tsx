"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Aceternity UI Spotlight Effect
 * Used strictly on non-examination screens (Dashboard / Setup header).
 */
export function Spotlight({
  className,
  fill = "white",
}: {
  className?: string;
  fill?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute z-[1] h-[169%] w-[138%] lg:w-[84%] opacity-0 animate-spotlight",
        className
      )}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 3787 2842"
      fill="none"
    >
      <g filter="url(#ssb_spotlight_filter)">
        <ellipse
          cx="1924.71"
          cy="273.501"
          rx="1924.71"
          ry="273.501"
          transform="matrix(-0.822377 -0.568943 -0.568943 0.822377 3631.88 2291.09)"
          fill={fill}
          fillOpacity="0.16"
        />
      </g>
      <defs>
        <filter
          id="ssb_spotlight_filter"
          x="0.860352"
          y="0.838989"
          width="3785.16"
          height="2840.26"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feGaussianBlur
            stdDeviation="151"
            result="effect1_foregroundBlur_1065_8"
          />
        </filter>
      </defs>
    </svg>
  );
}

/**
 * Aceternity UI Background Grid with radial mask
 */
export function BackgroundGrid({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className
      )}
    >
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.06)_1px,transparent_1px)] bg-[size:32px_32px]"
        style={{
          maskImage:
            "radial-gradient(ellipse 80% 60% at 50% 0%, #000 50%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 60% at 50% 0%, #000 50%, transparent 100%)",
        }}
      />
    </div>
  );
}

/**
 * Aceternity UI BentoGrid & BentoGridItem
 */
export function BentoGrid({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto",
        className
      )}
    >
      {children}
    </div>
  );
}

export function BentoGridItem({
  className,
  title,
  description,
  header,
  icon,
  footer,
}: {
  className?: string;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  header?: React.ReactNode;
  icon?: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "row-span-1 rounded-xl group/bento hover:shadow-xl transition duration-200 p-5 bg-slate-900/75 dark:bg-slate-900/75 light:bg-white border border-slate-800/80 hover:border-sky-500/40 justify-between flex flex-col space-y-4 backdrop-blur-sm",
        className
      )}
    >
      {header}
      <div className="group-hover/bento:translate-x-1 transition duration-200">
        {icon && <div className="mb-2 text-sky-400">{icon}</div>}
        {title && (
          <div className="font-semibold text-slate-100 mb-1 tracking-tight">
            {title}
          </div>
        )}
        {description && (
          <div className="text-sm text-slate-400 leading-relaxed">
            {description}
          </div>
        )}
      </div>
      {footer && <div className="pt-2 border-t border-slate-800/70">{footer}</div>}
    </div>
  );
}

/**
 * Aceternity UI HoverEffect Card Grid
 */
export interface HoverCardItem {
  id: string;
  title: string;
  badge?: string;
  description: string;
  meta?: string;
  onClick?: () => void;
  href?: string;
  actionLabel?: string;
}

export function HoverCardGrid({
  items,
  className,
  renderAction,
}: {
  items: HoverCardItem[];
  className?: string;
  renderAction?: (item: HoverCardItem) => React.ReactNode;
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4",
        className
      )}
    >
      {items.map((item, idx) => (
        <div
          key={item.id}
          className="relative group block p-1.5 h-full w-full"
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence>
            {hoveredIndex === idx && (
              <motion.span
                className="absolute inset-0 h-full w-full bg-sky-500/10 dark:bg-sky-400/10 block rounded-2xl border border-sky-500/30"
                layoutId="ssbHoverBackground"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  transition: { duration: 0.15 },
                }}
                exit={{
                  opacity: 0,
                  transition: { duration: 0.15, delay: 0.1 },
                }}
              />
            )}
          </AnimatePresence>
          <div className="rounded-xl h-full w-full p-5 overflow-hidden bg-slate-900/85 border border-slate-800 group-hover:border-slate-700 relative z-10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <h3 className="text-base font-semibold text-slate-100 tracking-tight">
                  {item.title}
                </h3>
                {item.badge && (
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30">
                    {item.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                {item.description}
              </p>
            </div>
            <div>
              {item.meta && (
                <div className="text-[11px] text-slate-400 font-mono mb-3">
                  {item.meta}
                </div>
              )}
              {renderAction && renderAction(item)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
