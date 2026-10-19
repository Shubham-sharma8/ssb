"use client";

import React, { useMemo, useState } from "react";
import {
  AttemptedBookletDataInput,
  AttemptedBookletPayload,
  buildAiEvaluationPrompt,
  generateQuestionBookletPdfBytes,
  normalizeAttemptedBookletPayload,
} from "@/lib/psych/export-booklet";

interface AttemptedBookletExportCardProps {
  data?: AttemptedBookletPayload | AttemptedBookletDataInput;
  payload?: AttemptedBookletPayload | AttemptedBookletDataInput;
  filename?: string;
}

const EVALUATION_STEPS = [
  {
    step: "STEP 01",
    title: "Download Attempted Question Booklet PDF",
    description:
      "Click 'Export Question Booklet (PDF)' below. If you finished the test early, this PDF contains only the exact pictures, words, or situations you actually attempted.",
    accent:
      "border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300",
    badgeBg: "bg-emerald-600 text-white",
  },
  {
    step: "STEP 02",
    title: "Copy the Pin-Point AI Psychologist Prompt",
    description:
      "Click 'Copy Pin-Point AI Evaluation Prompt'. It embeds your attempted stimuli/words/SRTs in exact chronological sequence along with DIPR 15-OLQ scoring rules.",
    accent: "border-sky-500/30 bg-sky-500/5 text-sky-700 dark:text-sky-300",
    badgeBg: "bg-sky-600 text-white",
  },
  {
    step: "STEP 03",
    title: "Upload Handwritten Notebook Scan + PDF to Any AI",
    description:
      "Open ChatGPT, Claude, or Gemini, paste the copied prompt, and attach both the Question Booklet PDF and clear photos/scans of your handwritten notebook pages.",
    accent:
      "border-violet-500/30 bg-violet-500/5 text-violet-700 dark:text-violet-300",
    badgeBg: "bg-violet-600 text-white",
  },
];

export function AttemptedBookletExportCard({
  data,
  payload,
  filename = "SSB-Attempted-Question-Booklet.pdf",
}: AttemptedBookletExportCardProps) {
  const resolvedPayload = useMemo(
    () => normalizeAttemptedBookletPayload((data ?? payload)!),
    [data, payload]
  );
  const [copyState, setCopyState] = useState<"idle" | "copying" | "copied">(
    "idle"
  );
  const [downloaded, setDownloaded] = useState(false);
  const [showPromptPreview, setShowPromptPreview] = useState(false);

  const aiPrompt = useMemo(
    () => buildAiEvaluationPrompt(resolvedPayload),
    [resolvedPayload]
  );

  async function handleDownloadPdf() {
    const bytes = await generateQuestionBookletPdfBytes(resolvedPayload);
    const blob = new Blob([bytes.buffer as ArrayBuffer], {
      type: "application/pdf",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3500);
  }

  async function handleCopyPrompt() {
    setCopyState("copying");
    try {
      await navigator.clipboard.writeText(aiPrompt);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = aiPrompt;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setTimeout(() => {
      setCopyState("copied");
    }, 220);
    setTimeout(() => {
      setCopyState("idle");
    }, 4000);
  }

  return (
    <div
      data-testid="attempted-booklet-export-card"
      className="rounded-2xl border border-emerald-500/30 bg-white p-5 sm:p-6 shadow-xs dark:border-emerald-400/25 dark:bg-zinc-900 space-y-6"
    >
      {/* Top Header & Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-xs font-mono uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-bold">
              Post-Test Booklet Export &amp; Pin-Point AI Psychologist Evaluation
            </p>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
            Export Attempted Question Booklet (PDF) + Copy AI Evaluation Prompt
          </h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
            Includes only the stimuli, words, and situations you attempted in this
            session. Follow the 3 steps below to get line-by-line DIPR Psychologist
            feedback on your handwritten responses.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleDownloadPdf}
            data-testid="export-question-booklet-pdf-btn"
            className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-zinc-700 transition-colors dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300 cursor-pointer"
          >
            <svg
              className="h-4 w-4 text-emerald-400 dark:text-emerald-600"
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
            <span>
              {downloaded
                ? "✓ Question Booklet PDF Exported"
                : "Export Question Booklet (PDF)"}
            </span>
          </button>

          <button
            type="button"
            onClick={handleCopyPrompt}
            data-testid="copy-ai-evaluation-prompt-btn"
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
              copyState === "copied"
                ? "border-emerald-600 bg-emerald-600 text-white shadow-sm dark:border-emerald-400 dark:bg-emerald-400 dark:text-zinc-950"
                : copyState === "copying"
                ? "border-sky-500 bg-sky-500/15 text-sky-800 dark:text-sky-200"
                : "border-emerald-600/40 bg-emerald-500/10 text-emerald-900 hover:bg-emerald-500/20 dark:border-emerald-400/40 dark:bg-emerald-400/10 dark:text-emerald-200 dark:hover:bg-emerald-400/20"
            }`}
          >
            {copyState === "copying" ? (
              <>
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                <span>Copying Pin-Point AI Evaluation Prompt...</span>
              </>
            ) : copyState === "copied" ? (
              <>
                <span>✓ Copied Pin-Point AI Evaluation Prompt!</span>
              </>
            ) : (
              <>
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                <span>Copy Pin-Point AI Evaluation Prompt</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Animated Copy Confirmation Banner */}
      {copyState !== "idle" && (
        <div
          data-testid="ai-prompt-copy-toast"
          className="flex items-center justify-between gap-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-xs font-medium text-emerald-900 transition-all dark:border-emerald-400/40 dark:bg-emerald-500/15 dark:text-emerald-200"
        >
          <div className="flex items-center gap-2.5">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-bold text-white">
              ✓
            </span>
            <span>
              {copyState === "copying"
                ? "Copying Pin-Point AI Evaluation Prompt with your attempted items..."
                : "Pin-Point AI Evaluation Prompt copied to clipboard! Now paste it into ChatGPT, Claude, or Gemini with your handwritten response scan."}
            </span>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-700 dark:text-emerald-300 shrink-0">
            Ready to Paste
          </span>
        </div>
      )}

      {/* Aceternity 3-Step Evaluation Guide */}
      <div
        data-testid="aceternity-evaluation-steps"
        className="grid grid-cols-1 gap-3 md:grid-cols-3"
      >
        {EVALUATION_STEPS.map((item) => (
          <div
            key={item.step}
            className={`relative overflow-hidden rounded-xl border p-4 transition-all ${item.accent}`}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span
                className={`rounded-md px-2 py-0.5 font-mono text-[10px] font-bold ${item.badgeBg}`}
              >
                {item.step}
              </span>
              <span className="font-mono text-[10px] opacity-75">
                SSB AI Dossier
              </span>
            </div>
            <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
              {item.title}
            </h4>
            <p className="mt-1 text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {item.description}
            </p>
          </div>
        ))}
      </div>

      {/* Expandable Prompt Preview */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-semibold text-zinc-600 dark:text-zinc-400">
            Pin-Point AI Psychologist Prompt (Includes Only Your Attempted Items)
          </span>
          <button
            type="button"
            onClick={() => setShowPromptPreview((v) => !v)}
            data-testid="toggle-ai-prompt-preview-btn"
            className="text-xs font-semibold text-emerald-700 underline underline-offset-2 hover:text-emerald-600 dark:text-emerald-400 cursor-pointer"
          >
            {showPromptPreview ? "Hide Full Prompt" : "Inspect Full AI Prompt"}
          </button>
        </div>

        {showPromptPreview && (
          <textarea
            readOnly
            rows={10}
            value={aiPrompt}
            data-testid="ai-prompt-textarea"
            className="w-full max-h-72 overflow-y-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-3.5 text-[11px] font-mono leading-relaxed text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap"
          />
        )}
      </div>
    </div>
  );
}
