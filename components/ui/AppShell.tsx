"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  loadUserPreferences,
  saveUserPreferences,
} from "@/lib/storage/preferences";
import type { UserPreferences } from "@/lib/validation/schemas";
import { BrandLogo } from "@/components/brand/BrandLogo";

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
      setScrolled(window.scrollY > 12);
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
      root.classList.remove("light");
    } else if (theme === "light") {
      root.classList.remove("dark");
      root.classList.add("light");
    } else {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      if (prefersDark) {
        root.classList.add("dark");
        root.classList.remove("light");
      } else {
        root.classList.remove("dark");
        root.classList.add("light");
      }
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

  const isDark = prefs?.theme === "dark";

  return (
    <div className="min-h-screen flex flex-col bg-[#fbfcfe] text-zinc-900 dark:bg-[#06080d] dark:text-zinc-100 transition-colors duration-200">
      {/* Unified cogify.me Floating Header */}
      <header
        className={`sticky top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled ? "py-2.5" : "py-3.5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            data-testid="aceternity-resizable-navbar"
            className={`rounded-2xl transition-all duration-300 ${
              scrolled
                ? "bg-white/90 dark:bg-zinc-950/85 border border-zinc-200/90 dark:border-white/10 shadow-lg shadow-zinc-900/5 dark:shadow-2xl dark:shadow-black/60 backdrop-blur-xl"
                : "bg-white/70 dark:bg-zinc-950/40 border border-zinc-200/70 dark:border-white/10 backdrop-blur-md"
            }`}
          >
            <div className="flex items-center justify-between px-4 sm:px-5 py-2.5">
              {/* Brand Wordmark matching cogify.me */}
              <div className="flex items-center gap-3 shrink-0">
                <Link
                  href="/"
                  className="flex items-center gap-3 group focus:outline-none"
                >
                  <BrandLogo
                    size={32}
                    className="group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base tracking-wider text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-white transition-colors">
                        COGIFY
                      </span>
                      <span className="rounded-md bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-indigo-700 dark:text-indigo-300">
                        ssb.cogify.me
                      </span>
                    </div>
                    <span className="text-[9px] font-mono tracking-widest text-zinc-500 dark:text-zinc-400 uppercase">
                      Stage-II Defence Assessment Suite
                    </span>
                  </div>
                </Link>
              </div>

              {/* Desktop Navigation Links matching cogify.me */}
              <nav
                aria-label="Main Navigation"
                className="hidden md:flex items-center gap-1"
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
                      className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-colors whitespace-nowrap ${
                        active
                          ? "text-indigo-600 dark:text-white bg-indigo-50 dark:bg-white/10 font-semibold"
                          : "text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5"
                      }`}
                    >
                      {item.fullLabel}
                    </Link>
                  );
                })}
              </nav>

              {/* Right Actions matching cogify.me */}
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href="/Phys-Test-Booklet.pdf"
                  download="SSB-Psych-Test-Booklet.pdf"
                  data-testid="download-booklet-header"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200/80 dark:bg-white/5 dark:hover:bg-white/10 border border-zinc-200/80 dark:border-white/10 text-xs font-semibold text-zinc-800 dark:text-zinc-200 transition-all"
                  title="Download 16-Page SSB Answer Booklet PDF for Handwritten Practice"
                >
                  <svg
                    className="h-3.5 w-3.5 shrink-0 text-indigo-600 dark:text-indigo-400"
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

                <Link
                  href="/full-test"
                  className="hidden lg:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all"
                >
                  <span>Full Psych Test</span>
                </Link>

                {/* Theme Toggle matching cogify.me */}
                <button
                  type="button"
                  onClick={toggleTheme}
                  data-testid="theme-toggle-btn"
                  aria-label="Toggle color theme"
                  title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                  className="inline-flex items-center gap-1.5 h-9 px-2.5 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-100/80 dark:bg-white/5 hover:bg-zinc-200/80 dark:hover:bg-white/10 text-xs font-medium text-zinc-700 dark:text-zinc-200 transition-colors cursor-pointer"
                >
                  {isDark ? (
                    <svg
                      className="w-4 h-4 text-amber-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <circle cx="12" cy="12" r="4" />
                      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4 text-indigo-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                    </svg>
                  )}
                  <span>{isDark ? "Light" : "Dark"}</span>
                </button>

                {/* Mobile Hamburger Button */}
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen((prev) => !prev)}
                  data-testid="mobile-menu-toggle"
                  aria-label="Toggle navigation menu"
                  aria-expanded={mobileMenuOpen}
                  className="inline-flex md:hidden items-center justify-center p-2 rounded-xl text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5"
                >
                  <svg
                    className="h-5 w-5"
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

            {/* Sub-Toolbar for Psychological Tests (always rendered in SSR DOM for crawlers) */}
            <div
              className={
                isPsychSection
                  ? "hidden md:flex items-center justify-between gap-2 border-t border-zinc-200/70 dark:border-white/[0.07] bg-zinc-50/70 dark:bg-white/[0.02] px-4 sm:px-5 py-1.5 text-[11px] rounded-b-2xl"
                  : "sr-only"
              }
            >
              <div className="flex items-center gap-1 overflow-x-auto">
                <span className="mr-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
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
                      className={`rounded-lg px-2.5 py-1 font-medium transition-colors whitespace-nowrap ${
                        active
                          ? "bg-indigo-600 text-white dark:bg-indigo-500 dark:text-white shadow-xs"
                          : "text-zinc-600 hover:bg-zinc-200/70 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-zinc-100"
                      }`}
                    >
                      {sub.label}
                    </Link>
                  );
                })}
              </div>
              <span className="hidden lg:inline-flex items-center gap-1.5 font-mono text-[10px] text-zinc-500 dark:text-zinc-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                DIPR Hall Projector • Handwritten Notebook Mode
              </span>
            </div>
          </div>
        </div>

        {/* Mobile Drawer matching cogify.me */}
        {mobileMenuOpen && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-2 md:hidden">
            <div
              data-testid="mobile-nav-drawer"
              className="rounded-2xl bg-white/95 dark:bg-zinc-950/95 border border-zinc-200 dark:border-white/10 p-4 backdrop-blur-xl shadow-2xl space-y-4"
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
                        className={`rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-colors ${
                          active
                            ? "bg-indigo-50 dark:bg-white/10 text-indigo-600 dark:text-white"
                            : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/5"
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
                  Psychological Battery
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
                        className={`rounded-xl px-3 py-2 text-xs font-medium transition-colors ${
                          active
                            ? "bg-indigo-600 text-white"
                            : "border border-zinc-200/80 dark:border-white/10 text-zinc-700 dark:text-zinc-300"
                        }`}
                      >
                        {sub.label}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-3 border-t border-zinc-200 dark:border-white/10 flex flex-col gap-2">
                <a
                  href="/Phys-Test-Booklet.pdf"
                  download="SSB-Psych-Test-Booklet.pdf"
                  className="w-full text-center px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                >
                  Download 16-Page Booklet PDF
                </a>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 pb-16 md:pb-0">
        {pathname && ROUTE_BREADCRUMBS[pathname] && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2">
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
              className="py-2"
            >
              <ol className="flex flex-wrap items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                <li className="inline-flex items-center">
                  <Link
                    href="/"
                    className="inline-flex items-center gap-1 hover:text-indigo-600 dark:hover:text-white transition-colors"
                  >
                    <span>COGIFY SSB</span>
                  </Link>
                </li>
                <li className="inline-flex items-center gap-1.5">
                  <span
                    aria-hidden="true"
                    className="text-zinc-400 dark:text-zinc-600"
                  >
                    /
                  </span>
                  <Link
                    href={
                      ROUTE_BREADCRUMBS[pathname].categoryHref.startsWith("/#")
                        ? "/"
                        : ROUTE_BREADCRUMBS[pathname].categoryHref
                    }
                    className="hover:text-indigo-600 dark:hover:text-white transition-colors"
                  >
                    {ROUTE_BREADCRUMBS[pathname].categoryLabel}
                  </Link>
                </li>
                <li className="inline-flex items-center gap-1.5">
                  <span
                    aria-hidden="true"
                    className="text-zinc-400 dark:text-zinc-600"
                  >
                    /
                  </span>
                  <span
                    aria-current="page"
                    className="text-zinc-900 dark:text-zinc-200 font-medium"
                  >
                    {ROUTE_BREADCRUMBS[pathname].currentLabel}
                  </span>
                </li>
              </ol>
            </nav>
          </div>
        )}
        {children}
      </main>

      {/* Mobile Bottom Quick Nav */}
      <nav
        data-testid="mobile-bottom-nav"
        aria-label="Mobile Quick Navigation"
        className="fixed bottom-0 inset-x-0 z-30 flex md:hidden items-center justify-around border-t border-zinc-200/90 bg-white/95 px-2 py-2 backdrop-blur-md dark:border-white/10 dark:bg-zinc-950/95"
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
                  ? "bg-indigo-600 text-white"
                  : "text-zinc-600 dark:text-zinc-400"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Unified cogify.me 12-Column Footer */}
      <footer
        data-testid="footer-cogify-section"
        className="bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-400 text-xs transition-colors duration-200 pb-20 md:pb-0"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
            {/* Brand Column (col-span-4) matching cogify.me */}
            <div className="md:col-span-4 space-y-4">
              <Link href="/" className="flex items-center gap-3">
                <BrandLogo size={32} />
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base tracking-wider text-zinc-900 dark:text-zinc-100">
                    COGIFY
                  </span>
                  <span className="rounded-md bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-indigo-700 dark:text-indigo-300">
                    ssb.cogify.me
                  </span>
                </div>
              </Link>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-sm">
                Complete Services Selection Board (SSB) Stage-II Assessment
                Workstation — Psychological Battery (TAT, WAT, SRT, SDT), GTO
                Officer Tasks &amp; Personal Interview preparation with
                Question Booklet PDF export and Pin-Point AI Evaluation.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[11px] font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Zero Cloud Telemetry
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-[11px] font-medium">
                  100% Client-Side Execution
                </span>
              </div>
            </div>

            {/* Psychological Suite Column (col-span-3) */}
            <div className="md:col-span-3 space-y-3">
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider text-xs">
                Psychological Battery
              </h3>
              <ul className="space-y-2.5">
                <li>
                  <Link
                    href="/full-test"
                    className="hover:text-indigo-600 dark:hover:text-white transition-colors inline-flex items-center gap-2"
                  >
                    <span>Complete Psych Battery</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-mono">
                      Full Hall
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tat"
                    className="hover:text-indigo-600 dark:hover:text-white transition-colors inline-flex items-center gap-2"
                  >
                    <span>TAT Sets (SET 1 – 10)</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-mono">
                      12 Slides
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/wat"
                    className="hover:text-indigo-600 dark:hover:text-white transition-colors inline-flex items-center gap-2"
                  >
                    <span>WAT Selection Boards</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 font-mono">
                      60 Words
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/srt"
                    className="hover:text-indigo-600 dark:hover:text-white transition-colors inline-flex items-center gap-2"
                  >
                    <span>SRT Rapid Situations</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-700 dark:text-violet-300 font-mono">
                      60 SRTs
                    </span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/sdt"
                    className="hover:text-indigo-600 dark:hover:text-white transition-colors inline-flex items-center gap-2"
                  >
                    <span>Self-Description (SDT)</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 font-mono">
                      15 Mins
                    </span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Stage-II & Platform Sitemap Column (col-span-3) */}
            <div className="md:col-span-3 space-y-3">
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider text-xs">
                Stage-II &amp; Sitemap
              </h3>
              <ul className="space-y-2.5">
                <li>
                  <Link
                    href="/"
                    className="hover:text-indigo-600 dark:hover:text-white transition-colors"
                  >
                    SSB Practice Hub (Overview)
                  </Link>
                </li>
                <li>
                  <Link
                    href="/gto"
                    className="hover:text-indigo-600 dark:hover:text-white transition-colors"
                  >
                    GTO Officer Tasks &amp; Lecturette
                  </Link>
                </li>
                <li>
                  <Link
                    href="/interview"
                    className="hover:text-indigo-600 dark:hover:text-white transition-colors"
                  >
                    Personal Interview &amp; CIQ Simulator
                  </Link>
                </li>
                <li>
                  <Link
                    href="/library"
                    className="hover:text-indigo-600 dark:hover:text-white transition-colors"
                  >
                    Approved TAT Stimulus Library
                  </Link>
                </li>
                <li>
                  <Link
                    href="/history"
                    className="hover:text-indigo-600 dark:hover:text-white transition-colors"
                  >
                    Practice Session History
                  </Link>
                </li>
                <li>
                  <Link
                    href="/settings"
                    className="hover:text-indigo-600 dark:hover:text-white transition-colors"
                  >
                    Simulator Settings &amp; Backup
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    className="hover:text-indigo-600 dark:hover:text-white transition-colors"
                  >
                    About SSB &amp; 15 OLQs
                  </Link>
                </li>
              </ul>
            </div>

            {/* Parent Company COGIFY Ecosystem Column (col-span-2) */}
            <div
              data-testid="cogify-parent-banner"
              className="md:col-span-2 space-y-3"
            >
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider text-xs">
                Parent — COGIFY
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Engineered by{" "}
                <a
                  href="https://cogify.me"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="cogify-parent-link"
                  className="font-semibold text-zinc-900 underline underline-offset-2 hover:text-indigo-600 dark:text-zinc-100 dark:hover:text-indigo-400"
                >
                  cogify.me
                </a>{" "}
                — privacy-first web tools &amp; macOS utility apps.
              </p>
              <div className="flex flex-col gap-2 pt-1">
                <a
                  href="https://cogify.me"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="footer-cogify-cta"
                  className="inline-flex items-center justify-center gap-1 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-zinc-800 hover:border-indigo-500/40 hover:text-indigo-600 dark:text-zinc-200 dark:hover:text-white transition-all"
                >
                  Visit cogify.me ↗
                </a>
                <a
                  href="https://cogify.me/products"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-zinc-800 hover:border-indigo-500/40 hover:text-indigo-600 dark:text-zinc-200 dark:hover:text-white transition-all"
                >
                  All 14 Free Apps ↗
                </a>
                <a
                  href="https://cogify.me/compare"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-zinc-800 hover:border-indigo-500/40 hover:text-indigo-600 dark:text-zinc-200 dark:hover:text-white transition-all"
                >
                  macOS Utility Benchmarks ↗
                </a>
                <a
                  href="https://biodata.cogify.me"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-zinc-800 hover:border-indigo-500/40 hover:text-indigo-600 dark:text-zinc-200 dark:hover:text-white transition-all"
                >
                  Marriage Biodata Maker ↗
                </a>
                <a
                  href="/Phys-Test-Booklet.pdf"
                  download="SSB-Psych-Test-Booklet.pdf"
                  className="inline-flex items-center justify-center gap-1 rounded-xl border border-indigo-500/25 bg-indigo-500/10 px-3 py-1.5 text-[11px] font-semibold text-indigo-700 hover:bg-indigo-500/20 dark:text-indigo-300 transition-all"
                >
                  16-Page Booklet PDF
                </a>
              </div>
              <div className="pt-1 text-[11px] text-zinc-500 font-mono">
                Domain: ssb.cogify.me
              </div>
            </div>
          </div>

          <div className="mt-10 pt-8 border-t border-zinc-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-zinc-500">
            <p>
              © {new Date().getFullYear()}{" "}
              <a
                href="https://cogify.me"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-zinc-800 dark:hover:text-zinc-200"
              >
                COGIFY Technologies (cogify.me)
              </a>
              . All rights reserved. Armed Forces SSB Practice Suite.
            </p>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={toggleTheme}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-zinc-100 dark:hover:bg-white/10 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
              >
                <span>Theme: {isDark ? "Dark Mode" : "Light Mode"}</span>
              </button>
              <span className="hidden sm:inline text-zinc-400">•</span>
              <span className="hidden sm:inline">
                Designed with precision • ssb.cogify.me
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
