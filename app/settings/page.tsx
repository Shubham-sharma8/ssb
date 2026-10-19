"use client";

import React, { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  HardDrive,
  RotateCcw,
  Save,
  ShieldCheck,
  Trash2,
  Upload,
} from "lucide-react";
import {
  clearAllLocalData,
  exportAllPracticeData,
  importPracticeData,
} from "@/lib/storage/db";
import {
  DEFAULT_USER_PREFERENCES,
  loadUserPreferences,
  resetUserPreferences,
  saveUserPreferences,
} from "@/lib/storage/preferences";
import type { UserPreferences } from "@/lib/validation/schemas";

export default function SettingsPage() {
  const [prefs, setPrefs] = useState<UserPreferences>(DEFAULT_USER_PREFERENCES);
  const [prefsSavedBanner, setPrefsSavedBanner] = useState<string | null>(null);

  // Export / Import state
  const [exportedJsonText, setExportedJsonText] = useState<string>("");
  const [importJsonText, setImportJsonText] = useState<string>("");
  const [overwriteOnImport, setOverwriteOnImport] = useState<boolean>(false);
  const [importResultBanner, setImportResultBanner] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Clear local data confirmation
  const [confirmClearOpen, setConfirmClearOpen] = useState<boolean>(false);
  const [clearFeedback, setClearFeedback] = useState<string | null>(null);

  useEffect(() => {
    const loaded = loadUserPreferences();
    setPrefs(loaded);
  }, []);

  const applyThemeAttribute = (theme: "dark" | "light") => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.remove("dark", "light");
      document.documentElement.classList.add(theme);
    }
  };

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    const saved = saveUserPreferences(prefs);
    setPrefs(saved);
    applyThemeAttribute(saved.theme);
    setPrefsSavedBanner("Preferences saved to local storage.");
  };

  const handleResetPreferences = () => {
    const defaults = resetUserPreferences();
    setPrefs(defaults);
    applyThemeAttribute(defaults.theme);
    setPrefsSavedBanner("Preferences restored to defaults.");
  };

  const handleExportData = async () => {
    const bundle = await exportAllPracticeData();
    const formatted = JSON.stringify(bundle, null, 2);
    setExportedJsonText(formatted);

    if (typeof window !== "undefined") {
      const blob = new Blob([formatted], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ssb-practice-backup-${new Date()
        .toISOString()
        .slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setImportJsonText(text);
  };

  const handleImportData = async () => {
    setImportResultBanner(null);
    if (!importJsonText.trim()) {
      setImportResultBanner({
        type: "error",
        message: "Please paste or upload a JSON backup payload before importing.",
      });
      return;
    }

    try {
      const parsed: unknown = JSON.parse(importJsonText);
      const summary = await importPracticeData(parsed, {
        overwriteExisting: overwriteOnImport,
      });
      setImportResultBanner({
        type: "success",
        message: `Successfully imported ${summary.importedSessions} session(s), ${summary.importedStories} story record(s), and ${summary.importedProgress} stimulus progress entry/entries.`,
      });
    } catch (err) {
      setImportResultBanner({
        type: "error",
        message:
          err instanceof Error
            ? `Import validation failed: ${err.message}`
            : "Invalid JSON backup file.",
      });
    }
  };

  const handleClearAllData = async () => {
    await clearAllLocalData();
    setConfirmClearOpen(false);
    setExportedJsonText("");
    setClearFeedback(
      "All local sessions, stories, stimulus progress, and manifest overrides have been cleared."
    );
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:py-8 sm:px-6">
      <div className="mb-6 border-b border-zinc-200 pb-5 dark:border-zinc-800">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
          Preferences, Offline Cache & Data Backup
        </p>
        <h1 className="mt-1 text-xl sm:text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          Settings & Data Management
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Configure default SSB test timings, minimal light/dark appearance,
          sound cues, and export or import your local practice archive.
        </p>
      </div>

      <div className="space-y-6">
        {/* Section 1: Preferences Form */}
        <form
          onSubmit={handleSavePreferences}
          className="rounded-lg border border-zinc-200 bg-white p-4 sm:p-6 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 pb-3 dark:border-zinc-800">
            <h2 className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-zinc-100">
              Appearance & Examination Defaults
            </h2>
            <button
              type="button"
              onClick={handleResetPreferences}
              className="inline-flex items-center gap-1.5 rounded border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Restore Defaults</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Interface Theme
              </label>
              <select
                data-testid="pref-theme"
                value={prefs.theme}
                onChange={(e) =>
                  setPrefs((prev) => ({
                    ...prev,
                    theme: e.target.value as "dark" | "light",
                  }))
                }
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-base sm:text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              >
                <option value="light">
                  Light — Minimal Paper Surface (Default)
                </option>
                <option value="dark">Dark — Low-Light Evening Mode</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Default Observation Window (Seconds, SSB Standard = 30s)
              </label>
              <input
                type="number"
                min={5}
                max={300}
                data-testid="pref-observation-seconds"
                value={prefs.defaultObservationSeconds}
                onChange={(e) =>
                  setPrefs((prev) => ({
                    ...prev,
                    defaultObservationSeconds: Math.max(
                      5,
                      Number(e.target.value) || 30
                    ),
                  }))
                }
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-base sm:text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Default Story Writing Window (Seconds, SSB Standard = 240s)
              </label>
              <input
                type="number"
                min={15}
                max={1800}
                data-testid="pref-writing-seconds"
                value={prefs.defaultWritingSeconds}
                onChange={(e) =>
                  setPrefs((prev) => ({
                    ...prev,
                    defaultWritingSeconds: Math.max(
                      15,
                      Number(e.target.value) || 240
                    ),
                  }))
                }
                className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-base sm:text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="flex cursor-pointer items-center justify-between gap-3 rounded-md border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
              <span>Play subtle audio bell when picture vanishes / changes</span>
              <input
                type="checkbox"
                checked={prefs.soundAlerts}
                onChange={(e) =>
                  setPrefs((prev) => ({
                    ...prev,
                    soundAlerts: e.target.checked,
                  }))
                }
                className="h-4 w-4 rounded border-zinc-300 text-zinc-900 shrink-0"
              />
            </label>

            <label className="flex cursor-pointer items-center justify-between gap-3 rounded-md border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
              <span>Show live word count when using Digital Textbox mode</span>
              <input
                type="checkbox"
                checked={prefs.showWordCounter}
                onChange={(e) =>
                  setPrefs((prev) => ({
                    ...prev,
                    showWordCounter: e.target.checked,
                  }))
                }
                className="h-4 w-4 rounded border-zinc-300 text-zinc-900 shrink-0"
              />
            </label>
          </div>

          {prefsSavedBanner && (
            <div
              data-testid="prefs-saved-banner"
              className="mt-4 flex items-center gap-2 rounded-md border border-emerald-300 bg-emerald-50 px-3.5 py-2.5 text-xs text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{prefsSavedBanner}</span>
            </div>
          )}

          <div className="mt-5 flex justify-end">
            <button
              type="submit"
              data-testid="save-preferences-btn"
              className="w-full sm:w-auto justify-center inline-flex items-center gap-2 rounded-md bg-zinc-900 px-5 py-2.5 text-xs font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
            >
              <Save className="h-4 w-4" />
              <span>Save Preferences</span>
            </button>
          </div>
        </form>

        {/* Section 2: Export & Import Practice Data */}
        <div className="rounded-lg border border-zinc-200 bg-white p-4 sm:p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-4 border-b border-zinc-200 pb-3 dark:border-zinc-800">
            <h2 className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-zinc-100">
              Export & Import Practice Data (JSON Backup)
            </h2>
            <p className="mt-1 text-xs text-zinc-500">
              Export all sessions, stories, stimulus progress, and manifest
              overrides to a portable JSON file, or restore from an existing
              backup.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Export Column */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  1. Export Local Practice Data
                </h3>
                <button
                  type="button"
                  data-testid="export-json-btn"
                  onClick={() => void handleExportData()}
                  className="inline-flex items-center gap-1.5 rounded-md bg-zinc-900 px-3.5 py-2 text-xs font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Generate & Download JSON</span>
                </button>
              </div>

              <textarea
                readOnly
                data-testid="exported-json-textarea"
                value={exportedJsonText}
                rows={8}
                placeholder="Click 'Generate & Download JSON' above to inspect or copy your backup payload..."
                className="w-full rounded-md border border-zinc-300 bg-zinc-50 p-3 font-mono text-xs text-zinc-800 placeholder-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200"
              />
            </div>

            {/* Import Column */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  2. Import JSON Backup
                </h3>
                <label className="cursor-pointer rounded border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                  <span>Select .json File</span>
                  <input
                    type="file"
                    accept="application/json,.json"
                    onChange={(e) => void handleFileUpload(e)}
                    className="hidden"
                  />
                </label>
              </div>

              <textarea
                data-testid="import-json-textarea"
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                rows={6}
                placeholder="Paste exported JSON bundle here or upload a .json file..."
                className="w-full rounded-md border border-zinc-300 bg-zinc-50 p-3 font-mono text-xs text-zinc-800 placeholder-zinc-400 focus:border-zinc-900 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200"
              />

              <label className="flex cursor-pointer items-center gap-2.5 text-xs text-zinc-700 dark:text-zinc-300">
                <input
                  type="checkbox"
                  data-testid="import-overwrite-checkbox"
                  checked={overwriteOnImport}
                  onChange={(e) => setOverwriteOnImport(e.target.checked)}
                  className="h-4 w-4 rounded border-zinc-300 text-zinc-900"
                />
                <span>
                  Overwrite existing local records if IDs match (unchecked =
                  merge only new records)
                </span>
              </label>

              <button
                type="button"
                data-testid="import-json-btn"
                onClick={() => void handleImportData()}
                className="inline-flex items-center gap-1.5 rounded-md border border-zinc-300 bg-white px-4 py-2 text-xs font-medium text-zinc-800 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Validate & Import JSON</span>
              </button>

              {importResultBanner && (
                <div
                  data-testid="import-result-banner"
                  className={`rounded-md border p-3 text-xs ${
                    importResultBanner.type === "success"
                      ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                      : "border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-300"
                  }`}
                >
                  {importResultBanner.message}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Privacy Architecture & Clear Local Storage */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              <ShieldCheck className="h-4 w-4 text-zinc-700 dark:text-zinc-300" />
              <span>Local-First Privacy & Offline Mode</span>
            </div>
            <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
              All sessions, story notes, and set progress are stored inside your
              browser&apos;s IndexedDB (<code className="font-mono">SSBSimulatorDB</code>)
              and <code className="font-mono">localStorage</code>. All 10 TAT
              sets and the SSB Psychology Booklet PDF can be cached for 100%
              offline practice without internet access.
            </p>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              <HardDrive className="h-4 w-4 text-rose-600" />
              <span>Reset All Local Practice Data</span>
            </div>
            <p className="mb-4 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
              Permanently delete all recorded sessions, stories, and picture
              completion states from this browser.
            </p>

            {clearFeedback && (
              <div
                data-testid="clear-data-feedback"
                className="mb-3 rounded border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
              >
                {clearFeedback}
              </div>
            )}

            {!confirmClearOpen ? (
              <button
                type="button"
                data-testid="open-clear-data-confirm-btn"
                onClick={() => setConfirmClearOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-md border border-rose-300 bg-rose-50 px-4 py-2 text-xs font-medium text-rose-800 transition hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Clear All Local Data...</span>
              </button>
            ) : (
              <div className="flex flex-wrap items-center gap-2 rounded-md border border-rose-300 bg-rose-50/50 p-3 dark:border-rose-800 dark:bg-zinc-950">
                <span className="flex items-center gap-1.5 text-xs font-medium text-rose-800 dark:text-rose-300">
                  <AlertTriangle className="h-4 w-4" />
                  Confirm permanent deletion?
                </span>
                <button
                  type="button"
                  data-testid="confirm-clear-data-btn"
                  onClick={() => void handleClearAllData()}
                  className="rounded bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-500"
                >
                  Yes, Delete Everything
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmClearOpen(false)}
                  className="rounded border border-zinc-300 bg-white px-3 py-1.5 text-xs text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
