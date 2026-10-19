# SSB Simulator — Realistic TAT Psychology Test Platform

A production-grade, local-first web application that simulates the Indian **Services Selection Board (SSB) Stage II Psychological Battery**, starting with the **Thematic Apperception Test (TAT)** and architected with a modular exercise engine ready for **WAT (Word Association Test)**, **SRT (Situation Reaction Test)**, **SDT (Self-Description Test)**, and integrated **Booklet Practice**.

---

## 1. Core Capabilities

1. **Authentic SSB TAT Examination Flow**:
   - **30-second picture observation period** by default (full-viewport distraction-free stimulus projection).
   - **Automatic transition into a 4-minute (240s) story-writing period** without manual clicks.
   - **Uninterrupted sequence progression** through the selected set until completion.
   - **Strict Examination Discipline**: During active observation and writing, all decorative animations, top navigation links, future-picture thumbnails, and internal source PDF filenames are hidden.
2. **Authoritative Source PDF Provenance & Canonical Ordering**:
   - All 204 physical pages across `TAT 3.pdf` (22 pages), `TAT 4.pdf` (28 pages), and `tat_pdf.pdf` (154 pages) were visually audited and cataloged in `data/tat-manifest.json`.
   - **118 confirmed picture stimuli** were extracted as lossless `.png` archives (`data/original-assets/`) and optimized `.webp` web assets (`public/tat-assets/`) while removing non-stimulus scanner watermarks (`Scanned by CamScanner` footers in `TAT 3.pdf` and `TAT 4.pdf`).
   - Marker pages (`TAT 14`, `TAT 13`, `TAT 10`, `TAT 15`, `BLANK`, `STOP WRITING`) are classified in `data/tat-manifest.json` and excluded from picture stimuli.
   - User-facing canonical numbering (`Picture 1`, `Picture 2`, …) is decoupled from physical PDF page numbers and preserved even in **Selected-Picture** and **Random Order** practice modes.
3. **Deterministic Monotonic Timer Engine**:
   - Driven by a pure state machine (`READY`, `OBSERVATION`, `WRITING`, `ADVANCING`, `COMPLETED`, `PAUSED`, `INTERRUPTED`) using `performance.now()` reconciled against persisted wall-clock deadlines (`Date.now()`).
   - Supports an injectable deterministic test clock (`ControllableClock` / `window.__SSB_ENABLE_TEST_CLOCK__()`) for fast, non-flaky automated testing.
4. **Local-First IndexedDB Persistence & JSON Backup**:
   - Powered by **Dexie (IndexedDB)** (`lib/storage/db.ts`) for sessions, story drafts, per-stimulus progress (`not_attempted`, `in_progress`, `completed`, `skipped`, `reviewed`), self-review checklists, and developer manifest overrides.
   - Continuous debounced autosave with explicit status indicators (`Saving…`, `Saved`, `Save Error`) that only show `Saved` after the IndexedDB transaction resolves.
   - Full **Zod-validated JSON Export / Import** and **Clear Local Data** controls in `/settings`.
5. **Post-Session Review Workspace & Developer Manifest Audit**:
   - Post-session review (`/history/[sessionId]`) pairs each original stimulus with the candidate's written story, word/character counts, editable post-session revisions, and a 6-point structured self-reflection checklist.
   - Developer audit interface (`/library` -> *Source PDF Manifest Audit* tab and `npm run audit:manifest`) allows inspecting all 204 physical pages and saving/reverting page classification overrides in IndexedDB without editing source code.

---

## 2. Source PDF Audit Summary

| Source File | Physical Pages | Confirmed Stimuli | Marker / Non-Stimulus Pages | Notes |
| :--- | :---: | :---: | :---: | :--- |
| `TAT 3.pdf` | 22 | 22 (`tat-3-p001` – `tat-3-p022`) | 0 | Cropped bottom `Scanned by CamScanner` watermark bar safely outside stimulus frames; flagged 4 cross-PDF visual duplicates against `TAT 4.pdf`. |
| `TAT 4.pdf` | 28 | 28 (`tat-4-p001` – `tat-4-p028`) | 0 | Cropped bottom `Scanned by CamScanner` watermark bar; flagged 5 intra/cross-PDF duplicate candidates in `data/tat-manifest.json`. |
| `tat_pdf.pdf` | 154 | 68 (`tat-pdf-p002` – `tat-pdf-p153`) | 86 (`4` title, `78` blank, `4` stop-writing) | Contains 4 explicitly titled 11-picture board sets (`TAT 14`, `TAT 13`, `TAT 10`, `TAT 15` = 44 approved default stimuli) plus 2 unlabeled 12-picture sequences (`Pages 80–102` and `Pages 131–153`, 24 stimuli) flagged `needs-review` due to missing section title slides, 1 worksheet-overlaid scan (`p.98`), 3 intra-PDF duplicates (`p.131, 133, 135`), and 9 dark photocopy scans (`p.137–153`). |
| **Total** | **204** | **118** | **86** | All 204 pages recorded in `data/tat-manifest.json`; all 118 stimuli in `data/tat-catalog.json`. |

---

## 3. Project Structure

```text
├── app/
│   ├── page.tsx                     # Dashboard (real IndexedDB telemetry, recovery banner, battery overview)
│   ├── tat/page.tsx                 # TAT Session Configuration (set, subset, ordering, mode, fullscreen)
│   ├── tat/session/page.tsx         # Distraction-free TAT Examination Runner
│   ├── history/page.tsx             # Session History & Unfinished Session Recovery
│   ├── history/[sessionId]/page.tsx # Post-Session Story Review & Self-Reflection Workspace
│   ├── library/page.tsx             # Stimulus Catalog & Developer 204-Page Manifest Audit UI
│   └── settings/page.tsx            # Preferences, Validated JSON Export/Import, Clear Local Data
├── components/
│   └── ui/
│       ├── AceternityEffects.tsx    # Spotlight, BackgroundGrid, BentoGrid, HoverCardGrid, MovingBorderButton
│       └── AppShell.tsx             # Responsive Navigation Shell (auto-hidden during active /tat/session)
├── lib/
│   ├── modules/registry.ts          # Modular SSB Exercise Registry (TAT active; WAT, SRT, SDT, Booklet contracts)
│   ├── session/clock.ts             # Monotonic + Wall Clock abstraction & ControllableClock for tests
│   ├── session/state-machine.ts     # Pure TAT Session State Machine & Deadline Reconciliation
│   ├── storage/db.ts                # Dexie IndexedDB Database, Transactions, Telemetry & JSON Backup
│   ├── storage/preferences.ts       # localStorage User Preferences with Cross-Component Sync
│   ├── tat/catalog.ts               # Stimulus Catalog Loader, Canonical Numbering & Override Merger
│   └── validation/schemas.ts        # Strict Zod Schemas for Manifests, Sessions, Stories & Backups
├── data/
│   ├── tat-manifest.json            # 204-page physical PDF provenance manifest
│   ├── tat-catalog.json             # 118 confirmed picture stimuli & 9 practice sets
│   └── original-assets/             # 118 lossless PNG stimulus archives
├── public/
│   ├── tat-assets/                  # 118 optimized WebP stimulus assets
│   ├── brand-mark.svg               # Original vector emblem
│   └── sw.js                        # Offline asset-caching service worker
├── scripts/
│   └── audit-report.mjs             # CLI Source Manifest & Asset Integrity Report
└── tests/
    ├── unit/                        # Vitest unit & integration suites (source content, timer, persistence)
    └── e2e/                         # Playwright browser end-to-end tests
```

---

## 4. Local Setup & Verification Commands

```bash
# Install dependencies
npm install

# Run CLI source manifest & asset integrity audit report
npm run audit:manifest

# Run strict TypeScript typecheck
npm run typecheck

# Run ESLint check
npm run lint

# Run Vitest unit & integration test suites
npm test

# Build production Next.js bundle
npm run build

# Run Playwright End-to-End browser tests
npm run test:e2e

# Start local development server
npm run dev
```

---

## 5. Deployment Compatibility (Cloudflare Pages / Workers & Static/Edge Hosting)

The application is strictly local-first (IndexedDB + `localStorage` + static JSON/WebP assets) with `images: { unoptimized: true }` configured in `next.config.mjs` and zero server-side database or paid external API dependencies. It can be deployed directly to **Cloudflare Pages / Workers** (via `@cloudflare/next-on-pages` or OpenNext) or any standard Next.js hosting environment.
