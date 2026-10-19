"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  loadUserPreferences,
  saveUserPreferences,
} from "@/lib/storage/preferences";
import type { UserPreferences } from "@/lib/validation/schemas";

const TOP_NAV_ITEMS = [
  { href: "/", label: "Psyc", fullLabel: "Psychology", testId: "top-nav-psyc" },
  { href: "/gto", label: "GTO", fullLabel: "GTO Tasks", testId: "top-nav-gto" },
  {
    href: "/interview",
    label: "Interview",
    fullLabel: "Interview",
    testId: "top-nav-interview",
  },
  {
    href: "/settings",
    label: "Settings",
    fullLabel: "Settings",
    testId: "nav-Settings",
  },
  { href: "/about", label: "About", fullLabel: "About", testId: "top-nav-about" },
];

const PSYCH_SUB_ITEMS = [
  { href: "/", label: "Overview", testId: "nav-Home" },
  { href: "/full-test", label: "Full Psych Battery", testId: "nav-Full-Psych" },
  { href: "/tat", label: "TAT", testId: "nav-TAT" },
  { href: "/wat", label: "WAT", testId: "nav-WAT" },
  { href: "/srt", label: "SRT", testId: "nav-SRT" },
  { href: "/sdt", label: "SDT", testId: "nav-SDT" },
  { href: "/library", label: "TAT Sets", testId: "nav-Sets" },
  { href: "/history", label: "History", testId: "nav-History" },
];

const ROUTE_BREADCRUMBS: Record<
  string,
  {
    categoryLabel: string;
    categoryHref: string;
    currentLabel: string;
  }
> = {
  "/full-test": {
    categoryLabel: "Psychological Battery",
    categoryHref: "/#psych-battery",
    currentLabel: "Complete SSB Psychological Test (TAT • WAT • SRT • SDT)",
  },
  "/tat": {
    categoryLabel: "Psychological Battery",
    categoryHref: "/#psych-battery",
    currentLabel: "TAT Practice (SET 1 – SET 10)",
  },
  "/wat": {
    categoryLabel: "Psychological Battery",
    categoryHref: "/#psych-battery",
    currentLabel: "WAT Practice (60 Words • 15s Audio Beep)",
  },
  "/srt": {
    categoryLabel: "Psychological Battery",
    categoryHref: "/#psych-battery",
    currentLabel: "SRT Practice (60 Situations • 30m Timer)",
  },
  "/sdt": {
    categoryLabel: "Psychological Battery",
    categoryHref: "/#psych-battery",
    currentLabel: "Self-Description Test (SDT • 15m Timer)",
  },
  "/library": {
    categoryLabel: "Psychological Battery",
    categoryHref: "/tat",
    currentLabel: "Approved SSB TAT Sets Library (SET 1 – SET 10)",
  },
  "/history": {
    categoryLabel: "Psychological Battery",
    categoryHref: "/tat",
    currentLabel: "Practice Session History & Self-Review",
  },
  "/gto": {
    categoryLabel: "Stage-II Assessment",
    categoryHref: "/",
    currentLabel: "GTO Officer Tasks & 3-Minute Lecturette Timer",
  },
  "/interview": {
    categoryLabel: "Stage-II Assessment",
    categoryHref: "/",
    currentLabel: "Personal Interview & CIQ Rapid-Fire Simulator",
  },
  "/about": {
    categoryLabel: "Stage-II Methodology",
    categoryHref: "/",
    currentLabel: "About SSB Assessment & 15 OLQs",
  },
  "/settings": {
    categoryLabel: "Platform Configuration",
    categoryHref: "/",
    currentLabel: "Simulator Settings & Local Backup",
  },
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Hide global navigation shell during active fullscreen/timed TAT slide projection
  const isSessionRunner = pathname?.startsWith("/tat/session");

  const isPsychSection =
    pathname === "/" ||
    pathname?.startsWith("/tat") ||
    pathname?.startsWith("/wat") ||
    pathname?.startsWith("/srt") ||
    pathname?.startsWith("/sdt") ||
    pathname?.startsWith("/full-test") ||
    pathname?.startsWith("/library") ||
    pathname?.startsWith("/history");

  useEffect(() => {
    const loaded = loadUserPreferences();
    setPrefs(loaded);
    applyTheme(loaded.theme);

    // Proactively unregister any legacy Service Workers & clear stale caches
    // so the browser always refreshes cleanly without stale cached bundles.
    if (typeof window !== "undefined") {
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker
          .getRegistrations()
          .then((registrations) => {
            for (const reg of registrations) {
              reg.unregister().catch(() => {});
            }
          })
          .catch(() => {});
      }
      if ("caches" in window) {
        caches
          .keys()
          .then((keys) => {
            for (const key of keys) {
              caches.delete(key).catch(() => {});
            }
          })
          .catch(() => {});
      }
    }

    const onScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  function applyTheme(theme: UserPreferences["theme"]) {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else if (theme === "light") {
      root.classList.remove("dark");
    } else {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      if (prefersDark) root.classList.add("dark");
      else root.classList.remove("dark");
    }
  }

  function toggleTheme() {
    const current = prefs ?? loadUserPreferences();
    const nextTheme: UserPreferences["theme"] =
      current.theme === "dark" ? "light" : "dark";
    const updated = saveUserPreferences({ theme: nextTheme });
    setPrefs(updated);
    applyTheme(updated.theme);
  }

  if (isSessionRunner) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      {/* Subtle Aceternity Top Ambient Glow */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-0 h-64 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.10),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.12),transparent)]" />

      {/* Aceternity Resizable Navbar */}
      <header className="sticky top-0 z-40 w-full transition-all duration-300">
        <div
          className={`mx-auto transition-all duration-300 ${
            scrolled
              ? "max-w-5xl px-3 pt-2"
              : "max-w-6xl px-4 sm:px-6 pt-0"
          }`}
        >
          <div
            data-testid="aceternity-resizable-navbar"
            className={`flex items-center justify-between transition-all duration-300 ${
              scrolled
                ? "h-12 rounded-2xl border border-zinc-200/90 bg-white/90 px-4 shadow-lg shadow-zinc-900/5 backdrop-blur-xl dark:border-zinc-800/90 dark:bg-zinc-900/90 dark:shadow-black/30"
                : "h-14 border-b border-zinc-200/80 bg-white/80 px-2 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/80"
            }`}
          >
            {/* Brand Logo — Never truncated */}
            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/"
                className="group flex items-center gap-2.5 text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-100"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-emerald-500/30 bg-gradient-to-br from-emerald-500/20 via-teal-500/15 to-sky-500/20 text-[11px] font-extrabold text-emerald-700 shadow-xs transition-transform duration-200 group-hover:scale-105 dark:border-emerald-400/30 dark:text-emerald-300">
                  SSB
                </span>
                <span className="whitespace-nowrap font-bold tracking-tight">
                  ssb.cogify.me
                </span>
              </Link>
            </div>

            {/* Primary Toolbar: Psyc, GTO, Interview, Settings, About */}
            <nav
              aria-label="Main Navigation"
              className="hidden md:flex items-center gap-1 rounded-xl border border-zinc-200/70 bg-zinc-100/70 p-1 dark:border-zinc-800/80 dark:bg-zinc-900/70"
            >
              {TOP_NAV_ITEMS.map((item) => {
                const active =
                  item.href === "/"
                    ? isPsychSection
                    : pathname === item.href ||
                      pathname?.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    data-testid={item.testId}
                    className={`relative rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 whitespace-nowrap ${
                      active
                        ? "bg-white text-emerald-700 shadow-xs ring-1 ring-zinc-200/80 dark:bg-zinc-800 dark:text-emerald-300 dark:ring-zinc-700"
                        : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                    }`}
                  >
                    {item.fullLabel}
                  </Link>
                );
              })}
            </nav>

            {/* Right Controls: Booklet PDF + Theme Toggle + Mobile Menu */}
            <div className="flex items-center gap-2 shrink-0">
              <a
                href="/Phys-Test-Booklet.pdf"
                download="SSB-Psych-Test-Booklet.pdf"
                data-testid="download-booklet-header"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-emerald-600/25 bg-emerald-500/10 px-2.5 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-500/20 transition-colors dark:border-emerald-400/25 dark:bg-emerald-400/10 dark:text-emerald-300 dark:hover:bg-emerald-400/20"
                title="Download 16-Page SSB Answer Booklet PDF for Handwritten Practice"
              >
                <svg
                  className="h-3.5 w-3.5 shrink-0"
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
                <span>Booklet PDF</span>
              </a>

              <button
                type="button"
                onClick={toggleTheme}
                data-testid="theme-toggle-btn"
                aria-label="Toggle color theme"
                className="inline-flex items-center justify-center rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 transition-colors dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                {prefs?.theme === "dark" ? "Light" : "Dark"}
              </button>

              {/* Mobile Hamburger Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                data-testid="mobile-menu-toggle"
                aria-label="Toggle navigation menu"
                aria-expanded={mobileMenuOpen}
                className="inline-flex md:hidden items-center justify-center rounded-lg border border-zinc-200 bg-white p-1.5 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  {mobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Sub-Toolbar for Psychological Tests (when inside Psychology section) */}
          {isPsychSection && (
            <div className="hidden md:flex items-center justify-between gap-2 border-b border-zinc-200/60 bg-zinc-50/90 px-3 py-1.5 text-[11px] backdrop-blur-xs dark:border-zinc-800/60 dark:bg-zinc-950/80">
              <div className="flex items-center gap-1 overflow-x-auto">
                <span className="mr-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Psych Suite:
                </span>
                {PSYCH_SUB_ITEMS.map((sub) => {
                  const active =
                    sub.href === "/"
                      ? pathname === "/"
                      : pathname === sub.href ||
                        pathname?.startsWith(`${sub.href}/`);
                  return (
                    <Link
                      key={sub.href}
                      href={sub.href}
                      data-testid={sub.testId}
                      className={`rounded-md px-2.5 py-1 font-medium transition-colors whitespace-nowrap ${
                        active
                          ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                          : "text-zinc-600 hover:bg-zinc-200/70 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                      }`}
                    >
                      {sub.label}
                    </Link>
                  );
                })}
              </div>
              <span className="hidden lg:inline-block font-mono text-[10px] text-zinc-500 dark:text-zinc-400">
                Real SSB Projector • Handwritten Notebook Mode
              </span>
            </div>
          )}
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div
            data-testid="mobile-nav-drawer"
            className="md:hidden border-b border-zinc-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur-lg dark:border-zinc-800 dark:bg-zinc-950/95 space-y-3"
          >
            <div>
              <p className="px-2 pb-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                SSB Modules
              </p>
              <nav className="grid grid-cols-2 gap-1.5">
                {TOP_NAV_ITEMS.map((item) => {
                  const active =
                    item.href === "/"
                      ? isPsychSection
                      : pathname === item.href ||
                        pathname?.startsWith(`${item.href}/`);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                        active
                          ? "bg-emerald-600 text-white dark:bg-emerald-500 dark:text-zinc-950"
                          : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-300"
                      }`}
                    >
                      {item.fullLabel}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div>
              <p className="px-2 pb-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                Psychological Tests
              </p>
              <nav className="grid grid-cols-2 gap-1.5">
                {PSYCH_SUB_ITEMS.map((sub) => {
                  const active =
                    sub.href === "/"
                      ? pathname === "/"
                      : pathname === sub.href ||
                        pathname?.startsWith(`${sub.href}/`);
                  return (
                    <Link
                      key={sub.href}
                      href={sub.href}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                        active
                          ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                          : "border border-zinc-200/80 text-zinc-700 dark:border-zinc-800 dark:text-zinc-300"
                      }`}
                    >
                      {sub.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-2">
              <a
                href="/Phys-Test-Booklet.pdf"
                download="SSB-Psych-Test-Booklet.pdf"
                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300"
              >
                Download 16-Page Booklet PDF
              </a>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 pb-16 md:pb-0">
        {pathname && ROUTE_BREADCRUMBS[pathname] && (
          <div className="mx-auto max-w-6xl px-4 pt-3 sm:px-6">
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "BreadcrumbList",
                  itemListElement: [
                    {
                      "@type": "ListItem",
                      position: 1,
                      name: "SSB Practice Home",
                      item: "https://ssb.cogify.me",
                    },
                    {
                      "@type": "ListItem",
                      position: 2,
                      name: ROUTE_BREADCRUMBS[pathname].categoryLabel,
                      item: `https://ssb.cogify.me${
                        ROUTE_BREADCRUMBS[pathname].categoryHref.startsWith("/#")
                          ? ""
                          : ROUTE_BREADCRUMBS[pathname].categoryHref === "/"
                            ? ""
                            : ROUTE_BREADCRUMBS[pathname].categoryHref
                      }`,
                    },
                    {
                      "@type": "ListItem",
                      position: 3,
                      name: ROUTE_BREADCRUMBS[pathname].currentLabel,
                      item: `https://ssb.cogify.me${pathname}`,
                    },
                  ],
                }),
              }}
            />
            <nav
              aria-label="Breadcrumb"
              data-testid="seo-breadcrumbs"
              className="flex flex-wrap items-center gap-1.5 text-[11px] font-medium text-zinc-500 dark:text-zinc-400"
            >
              <Link
                href="/"
                className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              >
                SSB Practice Home
              </Link>
              <span aria-hidden="true" className="text-zinc-300 dark:text-zinc-700">
                /
              </span>
              <Link
                href={
                  ROUTE_BREADCRUMBS[pathname].categoryHref.startsWith("/#")
                    ? "/"
                    : ROUTE_BREADCRUMBS[pathname].categoryHref
                }
                className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              >
                {ROUTE_BREADCRUMBS[pathname].categoryLabel}
              </Link>
              <span aria-hidden="true" className="text-zinc-300 dark:text-zinc-700">
                /
              </span>
              <span
                aria-current="page"
                className="font-semibold text-emerald-700 dark:text-emerald-300"
              >
                {ROUTE_BREADCRUMBS[pathname].currentLabel}
              </span>
            </nav>
          </div>
        )}
        {children}
      </main>

      {/* Mobile Bottom Quick Nav */}
      <nav
        data-testid="mobile-bottom-nav"
        aria-label="Mobile Quick Navigation"
        className="fixed bottom-0 inset-x-0 z-30 flex md:hidden items-center justify-around border-t border-zinc-200/90 bg-white/95 px-2 py-2 backdrop-blur-md dark:border-zinc-800/90 dark:bg-zinc-950/95"
      >
        {[
          { href: "/", label: "Psyc", testId: "mobile-bottom-nav-home" },
          { href: "/tat", label: "TAT", testId: "mobile-bottom-nav-tat" },
          { href: "/wat", label: "WAT", testId: "mobile-bottom-nav-wat" },
          { href: "/gto", label: "GTO", testId: "mobile-bottom-nav-gto" },
          {
            href: "/interview",
            label: "Interview",
            testId: "mobile-bottom-nav-interview",
          },
        ].map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href ||
                pathname?.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              data-testid={item.testId}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                active
                  ? "bg-emerald-600 text-white dark:bg-emerald-500 dark:text-zinc-950"
                  : "text-zinc-600 dark:text-zinc-400"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Minimal Aceternity Footer */}
      <footer
        data-testid="footer-cogify-section"
        className="relative z-10 border-t border-zinc-200/80 bg-white/90 py-8 pb-20 md:pb-8 text-xs text-zinc-500 dark:border-zinc-800/80 dark:bg-zinc-950/90 dark:text-zinc-400"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 items-start">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-emerald-600 text-[10px] font-bold text-white">
                  S
                </span>
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  ssb.cogify.me
                </p>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Complete Services Selection Board (SSB) Stage-II Practice Suite —
                Psychological Battery (TAT, WAT, SRT, SDT), GTO Tasks &amp;
                Personal Interview preparation with Pin-Point AI Evaluation.
              </p>
            </div>

            <div className="space-y-2">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                SSB Assessment Pillars &amp; Sitemap
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
                <Link
                  href="/"
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  SSB Practice Hub
                </Link>
                <Link
                  href="/full-test"
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  Full Psych Battery
                </Link>
                <Link
                  href="/tat"
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  TAT Sets (1–10)
                </Link>
                <Link
                  href="/wat"
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  WAT Boards
                </Link>
                <Link
                  href="/srt"
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  SRT Situations
                </Link>
                <Link
                  href="/sdt"
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  Self-Description (SDT)
                </Link>
                <Link
                  href="/gto"
                  className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                >
                  GTO Officer Tasks
                </Link>
                <Link
                  href="/interview"
                  className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                >
                  Personal Interview
                </Link>
                <Link
                  href="/library"
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  Stimulus Library
                </Link>
                <Link
                  href="/history"
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  Practice History
                </Link>
                <Link
                  href="/settings"
                  className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                >
                  Settings
                </Link>
                <Link
                  href="/about"
                  className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                >
                  About SSB
                </Link>
              </div>
            </div>

            <div
              data-testid="cogify-parent-banner"
              className="space-y-2 md:text-right"
            >
              <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Parent Company — Cogify
              </p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                An initiative by{" "}
                <a
                  href="https://cogify.me"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="cogify-parent-link"
                  className="font-semibold text-zinc-900 underline underline-offset-2 hover:text-emerald-600 dark:text-zinc-100 dark:hover:text-emerald-400"
                >
                  cogify.me
                </a>{" "}
                building precision cognitive &amp; defense assessment tools.
              </p>
              <div className="flex md:justify-end gap-3 pt-1">
                <a
                  href="https://cogify.me"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="footer-cogify-cta"
                  className="inline-flex items-center gap-1 rounded-md border border-zinc-300 bg-zinc-50 px-2.5 py-1 text-[11px] font-medium text-zinc-800 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  Visit cogify.me ↗
                </a>
                <a
                  href="/Phys-Test-Booklet.pdf"
                  download="SSB-Psych-Test-Booklet.pdf"
                  className="inline-flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-800 hover:bg-emerald-500/20 dark:text-emerald-300"
                >
                  Booklet PDF
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-200/70 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-zinc-500 dark:border-zinc-800/70 dark:text-zinc-400">
            <span>
              ssb.cogify.me — Armed Forces SSB Practice Platform (Army • Navy • Air Force)
            </span>
            <span>
              © {new Date().getFullYear()}{" "}
              <a
                href="https://cogify.me"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-zinc-800 dark:hover:text-zinc-200"
              >
                cogify.me
              </a>
              . All rights reserved.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
