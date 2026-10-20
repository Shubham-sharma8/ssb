"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  History,
  Play,
} from "lucide-react";
import { getAllSessions, getStoriesForSession } from "@/lib/storage/db";
import { formatDurationSeconds } from "@/lib/utils";
import type { SessionRecord, StoryRecord } from "@/lib/validation/schemas";

interface EnrichedSession {
  session: SessionRecord;
  stories: StoryRecord[];
  completedCount: number;
  skippedCount: number;
  inProgressCount: number;
  reviewedCount: number;
  totalWords: number;
}

const SELECTION_MODE_LABELS: Record<SessionRecord["selectionMode"], string> = {
  sequential: "Sequential Order",
  random: "Randomized Order",
  selected: "Selected Pictures",
};

export default function HistoryPage() {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<EnrichedSession[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const allSessions = await getAllSessions();
        const enriched: EnrichedSession[] = await Promise.all(
          allSessions.map(async (session) => {
            const stories = await getStoriesForSession(session.id);
            const completedCount = stories.filter(
              (s) =>
                s.completionStatus === "completed" ||
                s.completionStatus === "reviewed"
            ).length;
            const skippedCount = stories.filter(
              (s) => s.completionStatus === "skipped"
            ).length;
            const inProgressCount = stories.filter(
              (s) => s.completionStatus === "in_progress"
            ).length;
            const reviewedCount = stories.filter(
              (s) => s.completionStatus === "reviewed"
            ).length;
            const totalWords = stories.reduce(
              (acc, s) => acc + (s.wordCount || 0),
              0
            );
            return {
              session,
              stories,
              completedCount,
              skippedCount,
              inProgressCount,
              reviewedCount,
              totalWords,
            };
          })
        );
        if (mounted) {
          setSessions(enriched);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredSessions = sessions.filter((item) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "completed") {
      return item.session.phase === "COMPLETED";
    }
    if (statusFilter === "interrupted") {
      return item.session.phase === "INTERRUPTED";
    }
    if (statusFilter === "in_progress") {
      return (
        item.session.phase !== "COMPLETED" &&
        item.session.phase !== "INTERRUPTED"
      );
    }
    return true;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="mb-6 flex flex-col justify-between gap-4 rounded-2xl border border-zinc-200/90 dark:border-white/[0.08] bg-white dark:bg-[#0b0f17] p-5 sm:p-6 shadow-sm lg:flex-row lg:items-end">
        <div>
          <p className="font-mono text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Post-Test Review & Practice Log
          </p>
          <h1 className="mt-1 text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Session History
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Inspect completed and interrupted TAT sets, review projected pictures
            side-by-side with your stories, and complete self-review checklists.
          </p>
        </div>

        <div className="flex items-center gap-2 max-w-full overflow-x-auto no-scrollbar">
          <div className="inline-flex rounded-xl border border-zinc-200/90 bg-zinc-100/80 p-1 text-xs shrink-0 dark:border-white/[0.08] dark:bg-white/[0.04]">
            {[
              { id: "all", label: "All Sessions" },
              { id: "completed", label: "Completed" },
              { id: "in_progress", label: "In Progress" },
              { id: "interrupted", label: "Interrupted" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`rounded-lg px-2.5 sm:px-3 py-1.5 font-medium transition whitespace-nowrap ${
                  statusFilter === tab.id
                    ? "bg-white text-zinc-900 shadow-sm dark:bg-indigo-600 dark:text-white"
                    : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-zinc-200/90 bg-white p-12 text-center text-sm text-zinc-500 dark:border-white/[0.08] dark:bg-[#0b0f17]">
          Loading session history...
        </div>
      ) : filteredSessions.length === 0 ? (
        <div
          data-testid="empty-history-state"
          className="rounded-2xl border border-dashed border-zinc-300 bg-white p-10 text-center dark:border-white/[0.12] dark:bg-[#0b0f17] shadow-sm"
        >
          <History className="mx-auto mb-3 h-8 w-8 text-zinc-400" />
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            {sessions.length === 0
              ? "No practice sessions recorded yet"
              : "No sessions match the selected filter"}
          </h2>
          <p className="mx-auto mt-1 max-w-md text-xs text-zinc-500">
            {sessions.length === 0
              ? "Your completed and interrupted TAT sessions are stored locally in your browser."
              : "Switch the status filter above to view all recorded sessions."}
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <Link
              href="/tat"
              className="inline-flex items-center gap-2 rounded-md bg-zinc-900 px-4 py-2 text-xs font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>Start TAT Practice</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3" data-testid="history-session-list">
          {filteredSessions.map(
            ({
              session,
              stories,
              completedCount,
              skippedCount,
              reviewedCount,
              totalWords,
            }) => {
              const totalPics = session.stimulusIds.length;
              const attemptedPics = stories.length;
              const isCompleted = session.phase === "COMPLETED";
              const durationSeconds = session.completedAt
                ? Math.max(
                    1,
                    Math.round(
                      (new Date(session.completedAt).getTime() -
                        new Date(session.startedAt).getTime()) /
                        1000
                    )
                  )
                : null;

              return (
                <div
                  key={session.id}
                  data-testid={`history-session-card-${session.id}`}
                  className="rounded-lg border border-zinc-200 bg-white p-4 sm:p-5 transition hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                          {session.setTitle}
                        </h2>
                        <span
                          className={`rounded px-2 py-0.5 text-[11px] font-medium ${
                            isCompleted
                              ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                              : "bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                          }`}
                        >
                          {isCompleted
                            ? "Completed"
                            : session.phase === "INTERRUPTED"
                            ? "Interrupted"
                            : "In Progress"}
                        </span>
                        <span className="rounded border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[11px] text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
                          {SELECTION_MODE_LABELS[session.selectionMode]}
                        </span>
                        <span className="rounded border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[11px] text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
                          {session.practiceMode === "realistic"
                            ? "Real SSB Mode"
                            : "Practice Mode"}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500">
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(session.startedAt).toLocaleString()}
                        </span>
                        {durationSeconds !== null && (
                          <span className="inline-flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            Duration: {formatDurationSeconds(durationSeconds)}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1.5">
                          <FileText className="h-3.5 w-3.5" />
                          {attemptedPics} / {totalPics} slides recorded (
                          {completedCount} completed, {skippedCount} skipped)
                        </span>
                        {reviewedCount > 0 && (
                          <span className="inline-flex items-center gap-1.5 text-zinc-900 font-medium dark:text-zinc-200">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            {reviewedCount} self-reviewed
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                      {totalWords > 0 && (
                        <div className="rounded border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-right dark:border-zinc-800 dark:bg-zinc-950">
                          <div className="text-[10px] uppercase tracking-wider text-zinc-500">
                            Words Typed
                          </div>
                          <div className="font-mono text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                            {totalWords}
                          </div>
                        </div>
                      )}

                      {!isCompleted && (
                        <Link
                          href={`/tat/session?sessionId=${encodeURIComponent(
                            session.id
                          )}`}
                          className="inline-flex items-center gap-1.5 rounded-md border border-zinc-300 bg-white px-3.5 py-2 text-xs font-medium text-zinc-800 transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                        >
                          <Play className="h-3.5 w-3.5 fill-current" />
                          <span>Resume</span>
                        </Link>
                      )}

                      <Link
                        href={`/history/${encodeURIComponent(session.id)}`}
                        data-testid={`open-session-review-${session.id}`}
                        className="inline-flex items-center gap-1.5 rounded-md bg-zinc-900 px-3.5 py-2 text-xs font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
                      >
                        <span>Review Slides & Stories</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            }
          )}
        </div>
      )}
    </div>
  );
}
