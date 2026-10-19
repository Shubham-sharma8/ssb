"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Layers,
  Play,
  ShieldCheck,
  X,
} from "lucide-react";

export type BriefingExamType = "tat" | "wat" | "srt" | "sdt" | "full-test";

export interface BriefingSlideItem {
  slideNumber: number;
  badge: string;
  title: string;
  subtitle: string;
  points: Array<{
    heading: string;
    detail: string;
  }>;
  hallRule: string;
}

const BRIEFING_DECKS: Record<BriefingExamType, BriefingSlideItem[]> = {
  tat: [
    {
      slideNumber: 1,
      badge: "SLIDE 1 OF 3 • TEST BRIEFING",
      title: "Thematic Apperception Test (TAT)",
      subtitle:
        "Stage-2 SSB Psychological Projection Test — Imagination, Perception & Constructive Action",
      points: [
        {
          heading: "What is TAT?",
          detail:
            "You will be shown 11 hazy or dramatic pictures one after another, followed by a 12th Blank Slide where you imagine your own picture and story.",
        },
        {
          heading: "What the Assessor Looks For",
          detail:
            "Identify the central character (Hero), understand what led to the situation, describe concrete actions taken to resolve the problem, and conclude with a realistic, positive outcome.",
        },
        {
          heading: "Strict Chronological Sequence",
          detail:
            "Each set (SET 1 to SET 10) preserves the exact 11-picture sequence + 1 Blank Slide from the official SSB board projection dossier.",
        },
      ],
      hallRule:
        "Do not merely describe the picture—build an action-oriented story around the central character.",
    },
    {
      slideNumber: 2,
      badge: "SLIDE 2 OF 3 • TIMING & PROJECTION PROTOCOL",
      title: "30-Second Projection + 4-Minute Writing",
      subtitle:
        "Exact SSB Testing Hall Rhythm — Uninterrupted Auto-Advance Without Visible Countdown Clutter",
      points: [
        {
          heading: "30 Seconds: Picture Observation",
          detail:
            "Each slide is projected on a dark screen for 30 seconds. Observe the characters, setting, and mood carefully. Do not start writing while the picture is on screen.",
        },
        {
          heading: "4 Minutes: Notebook Story Writing",
          detail:
            "After 30 seconds, the picture vanishes automatically for 4 minutes. Write your complete story (around 100–120 words) in your physical SSB Psychology Booklet.",
        },
        {
          heading: "Slide 12: The Blank Slide",
          detail:
            "The 12th slide is completely blank for 30 seconds, followed by 4 minutes to write a self-conceived story reflecting your own initiative.",
        },
      ],
      hallRule:
        "When the 4 minutes expire, the next picture appears immediately—finish your story on time.",
    },
    {
      slideNumber: 3,
      badge: "SLIDE 3 OF 3 • HALL READINESS & AI DOSSIER",
      title: "Booklet Readiness & Post-Test Evaluation",
      subtitle:
        "Keep Your Physical Booklet & Pen Ready Before Entering the Projection Hall",
      points: [
        {
          heading: "Write in Your Physical Booklet",
          detail:
            "Turn to the TAT section (Pages 3–10) of your printed SSB Psychology Booklet. Use a smooth black or blue ballpoint pen.",
        },
        {
          heading: "No Pause or Back Navigation in Real Mode",
          detail:
            "Once projection begins, slides advance automatically just like the actual Services Selection Board hall.",
        },
        {
          heading: "Post-Test PDF & Pin-Point AI Prompt",
          detail:
            "After completing the test, download your attempted Question Booklet PDF and copy the DIPR AI Assessor Prompt to get story-by-story OLQ feedback.",
        },
      ],
      hallRule:
        "Sit upright, silence mobile notifications, and click 'Proceed to Exam Hall' when ready.",
    },
  ],
  wat: [
    {
      slideNumber: 1,
      badge: "SLIDE 1 OF 3 • TEST BRIEFING",
      title: "Word Association Test (WAT)",
      subtitle:
        "Stage-2 SSB Spontaneous Ideation Test — 60 Words Across Authentic SSB Selection Boards",
      points: [
        {
          heading: "What is WAT?",
          detail:
            "You will be shown 60 sequential everyday words (e.g., Courage, Obstacles, Command, Failure) drawn from SSB Allahabad, Bangalore, Jalandhar, Bhopal, Dehradun, or Random pools.",
        },
        {
          heading: "How to Respond",
          detail:
            "Write the very first spontaneous thought, observation, or constructive sentence that comes to your mind—not a dictionary definition or idiom.",
        },
        {
          heading: "Authentic Psychological Alignment",
          detail:
            "WAT reveals your subconscious attitude, social adaptability, and emotional stability under rapid time pressure.",
        },
      ],
      hallRule:
        "Avoid mechanical 'should/must' preaching sentences—express natural, action-oriented thoughts.",
    },
    {
      slideNumber: 2,
      badge: "SLIDE 2 OF 3 • TIMING & AUDIO CUES",
      title: "15 Seconds Per Word + 30s Page Turn",
      subtitle:
        "Audio Beep Cue on Every Word Transition & Automatic Booklet Page-Turn Pauses",
      points: [
        {
          heading: "15 Seconds Per Word",
          detail:
            "Each word remains on screen for exactly 15 seconds. An audio hall beep sounds every time a new word is projected.",
        },
        {
          heading: "30-Second Page-Turn Pause (After Word 20 & Word 40)",
          detail:
            "Because each physical WAT booklet sheet holds 20 words, a 30-second page-turn timer automatically appears after Word 20 and Word 40.",
        },
        {
          heading: "Continuous 15-Minute Flow",
          detail:
            "If you miss a word, leave that line blank and immediately focus on the current word number projected on screen.",
        },
      ],
      hallRule:
        "Match the word number on screen with the exact numbered line in your physical WAT sheet.",
    },
    {
      slideNumber: 3,
      badge: "SLIDE 3 OF 3 • HALL READINESS & AI DOSSIER",
      title: "WAT Sheet Setup & Post-Test Evaluation",
      subtitle:
        "Prepare WAT Pages (1–20, 21–40, 41–60) Before Starting Projection",
      points: [
        {
          heading: "Open WAT Section in Your Booklet",
          detail:
            "Keep your physical SSB Booklet open to WAT Sheet 1 (Words 1 to 20) and ensure your audio volume is audible for the beep cues.",
        },
        {
          heading: "Post-Test Question Booklet Export",
          detail:
            "Upon completion, export the exact 60-word sequence PDF you attempted so you can review missed words without breaking hall discipline.",
        },
        {
          heading: "Pin-Point AI Psychologist Evaluation",
          detail:
            "Copy the tailored AI evaluation prompt after the test and upload your handwritten WAT sheets for word-by-word OLQ analysis.",
        },
      ],
      hallRule:
        "Ensure sound is enabled for the 15-second beep cues, then click 'Proceed to Exam Hall'.",
    },
  ],
  srt: [
    {
      slideNumber: 1,
      badge: "SLIDE 1 OF 3 • TEST BRIEFING",
      title: "Situation Reaction Test (SRT)",
      subtitle:
        "Stage-2 SSB Practical Decision-Making & Common-Sense Action Under Pressure",
      points: [
        {
          heading: "What is SRT?",
          detail:
            "You are presented with practical day-to-day life and emergency situations where the main character faces an immediate dilemma or obstacle.",
        },
        {
          heading: "How to Write Reactions",
          detail:
            "Write concise, telegraphic, concrete actions stating exactly what you will do, how you will solve the problem, and complete the task—in 1 to 2 lines.",
        },
        {
          heading: "Predefined & Real-Time Random Sets",
          detail:
            "Practice either predefined 60-SRT board sets (SRT SET 1–4) or dynamically generated Real-Time Random SRT sets from 230 situations.",
        },
      ],
      hallRule:
        "Write direct actions (e.g., 'Administered first aid, rushed victim to hospital, and reported on time').",
    },
    {
      slideNumber: 2,
      badge: "SLIDE 2 OF 3 • 5-SRT SHEET & INVISIBLE TIMER",
      title: "5 Situations Per Sheet + Invisible Timer",
      subtitle:
        "Simulated Booklet Paging with Authentic Unobtrusive SSB Hall Timing",
      points: [
        {
          heading: "5 SRTs Displayed at a Time",
          detail:
            "Each screen sheet displays 5 numbered situations together so you can read and write reactions in your notebook at your natural pace.",
        },
        {
          heading: "Invisible Equivalent Hall Timer",
          detail:
            "An invisible background timer runs equivalent to your selected SRT count (30 seconds per SRT = 30 minutes for 60 SRTs).",
        },
        {
          heading: "Self-Paced Sheet Navigation",
          detail:
            "Advance to the next 5-SRT sheet as soon as you finish writing, or let the sheet auto-advance when the sheet window elapses.",
        },
      ],
      hallRule:
        "Prioritize quality and completeness of action while maintaining steady speed across all sheets.",
    },
    {
      slideNumber: 3,
      badge: "SLIDE 3 OF 3 • HALL READINESS & AI DOSSIER",
      title: "Booklet Readiness & Post-Test Evaluation",
      subtitle:
        "Keep SRT Answer Sheets Ready & Export Your Question Booklet After Completion",
      points: [
        {
          heading: "Match SRT Numbers Carefully",
          detail:
            "Write only the reaction against each SRT number in your physical SSB Booklet—do not copy the question text.",
        },
        {
          heading: "Automatic Completion at Time-Up",
          detail:
            "When the invisible hall timer reaches zero, an audio cue sounds and the test concludes immediately.",
        },
        {
          heading: "Post-Test PDF & AI OLQ Audit",
          detail:
            "Export your attempted SRT Question Booklet PDF and Pin-Point AI Prompt to audit every reaction for social effectiveness and grit.",
        },
      ],
      hallRule:
        "Open your booklet to the SRT section and click 'Proceed to Exam Hall' to begin.",
    },
  ],
  sdt: [
    {
      slideNumber: 1,
      badge: "SLIDE 1 OF 3 • TEST BRIEFING",
      title: "Self-Description Test (SDT)",
      subtitle:
        "Stage-2 SSB Self-Insight, Honesty & Goal Clarity Assessment",
      points: [
        {
          heading: "What is SDT?",
          detail:
            "The final test of the SSB psychology battery where you write 5 structured paragraphs describing how key people in your life perceive you and your own self-appraisal.",
        },
        {
          heading: "The 5 Official Perspectives",
          detail:
            "1. Parents' Opinion • 2. Teachers' / Employers' Opinion • 3. Friends' / Colleagues' Opinion • 4. Your Own Strengths & Areas to Improve • 5. Qualities You Aspire to Develop.",
        },
        {
          heading: "Consistency Across TAT, WAT & SRT",
          detail:
            "The Psychologist cross-verifies your conscious self-description in SDT against your subconscious projections in TAT, WAT, and SRT.",
        },
      ],
      hallRule:
        "Be authentic, balanced, and specific—cite real behavioral traits rather than generic adjectives.",
    },
    {
      slideNumber: 2,
      badge: "SLIDE 2 OF 3 • TIMING & STRUCTURE",
      title: "15-Minute Invisible Hall Timer",
      subtitle:
        "All 5 Prompts Displayed Together Just Like the Physical SSB Booklet",
      points: [
        {
          heading: "15 Minutes Total Duration",
          detail:
            "You have 15 minutes (~3 minutes per section) to write all 5 paragraphs on Pages 15–16 of your physical SSB Psychology Booklet.",
        },
        {
          heading: "Invisible Hall Timer",
          detail:
            "No distracting countdown clock is shown during writing. An audio hall beep alerts you when the 15-minute window ends.",
        },
        {
          heading: "Balanced Paragraph Length",
          detail:
            "Aim for 60–80 clear, honest words per perspective, including both positive qualities and realistic areas of improvement.",
        },
      ],
      hallRule:
        "Budget roughly 3 minutes per heading so all 5 sections are completed before time expires.",
    },
    {
      slideNumber: 3,
      badge: "SLIDE 3 OF 3 • HALL READINESS & AI DOSSIER",
      title: "SDT Sheet Readiness & AI Cross-Check",
      subtitle:
        "Write in Your Physical Booklet & Run the Post-Test AI Psychologist Audit",
      points: [
        {
          heading: "Turn to Pages 15–16 of Your Booklet",
          detail:
            "Keep your physical SSB Booklet open to the Self-Description section before starting the timer.",
        },
        {
          heading: "Early Completion Option",
          detail:
            "If you finish all 5 paragraphs before 15 minutes, you can click 'Finish & Export Dossier' immediately.",
        },
        {
          heading: "Post-Test PDF & AI Evaluation",
          detail:
            "Export the SDT Question Booklet PDF and Pin-Point AI Prompt to evaluate your self-description for maturity and realism.",
        },
      ],
      hallRule:
        "Take a deep breath, organize your thoughts, and click 'Proceed to Exam Hall'.",
    },
  ],
  "full-test": [
    {
      slideNumber: 1,
      badge: "SLIDE 1 OF 3 • COMPLETE BATTERY BRIEFING",
      title: "Complete SSB Stage-2 Psychological Test",
      subtitle:
        "Uninterrupted 4-Stage Hall Simulation: TAT → WAT → SRT → SDT",
      points: [
        {
          heading: "Real Day-2 SSB Psychology Hall Flow",
          detail:
            "Experience the entire Services Selection Board psychology battery in a single continuous sitting: Stage 1 (TAT) → Stage 2 (WAT) → Stage 3 (SRT) → Stage 4 (SDT).",
        },
        {
          heading: "Holistic OLQ Assessment",
          detail:
            "Simulates the mental stamina, focus transitions, and handwriting endurance required during the actual 2-hour SSB testing session.",
        },
        {
          heading: "Custom or Full Official Battery",
          detail:
            "Runs your exact selected sets (TAT Set 1–10, SSB Board WAT Set, SRT Set 1–4 or Random, and 5-section SDT) back-to-back.",
        },
      ],
      hallRule:
        "Treat this session with full examination hall discipline—no phone breaks between stages.",
    },
    {
      slideNumber: 2,
      badge: "SLIDE 2 OF 3 • 4-STAGE TIMING PROTOCOL",
      title: "Stage-by-Stage Hall Timings & Transitions",
      subtitle:
        "30-Second Inter-Stage Breathing Pause Between Each Test Module",
      points: [
        {
          heading: "Stage 1 (TAT) → Stage 2 (WAT)",
          detail:
            "TAT projects each picture for 30s + 4m writing (ending with the Blank Slide), followed by a 30s transition into WAT (15s per word + beep + 30s page turn every 20 words).",
        },
        {
          heading: "Stage 3 (SRT) → Stage 4 (SDT)",
          detail:
            "SRT displays 5 situations per sheet with an invisible timer (30s × SRT count), followed by a 30s transition into the 15-minute SDT.",
        },
        {
          heading: "Audio Hall Cues Enabled",
          detail:
            "Authentic audio beep cues notify you of word transitions, page turns, and stage completions.",
        },
      ],
      hallRule:
        "Use the 30-second inter-stage pause to turn your physical booklet to the next test section.",
    },
    {
      slideNumber: 3,
      badge: "SLIDE 3 OF 3 • MASTER DOSSIER & AI EVALUATION",
      title: "Unified Question Booklet PDF & Master AI Prompt",
      subtitle:
        "Single Combined Post-Test Export Covering All 4 Attempted Tests",
      points: [
        {
          heading: "Complete 16-Page Physical Booklet Required",
          detail:
            "Keep your printed 16-page SSB Psychology Booklet and two pens on your desk before starting Stage 1.",
        },
        {
          heading: "Unified Master PDF Export",
          detail:
            "At the end of Stage 4, download one consolidated Question Booklet PDF containing your exact attempted TAT slides, WAT words, SRT situations, and SDT prompts.",
        },
        {
          heading: "Pin-Point Cross-Test AI Psychologist Prompt",
          detail:
            "Copy the comprehensive DIPR AI prompt to cross-analyze your TAT, WAT, SRT, and SDT responses together for OLQ consistency.",
        },
      ],
      hallRule:
        "When your booklet and pen are ready, click 'Proceed to Exam Hall' to begin Stage 1 (TAT).",
    },
  ],
};

export interface ExamBriefingSlidesProps {
  examType: BriefingExamType;
  configSummary?: string;
  setLabel?: string;
  onComplete?: () => void;
  onStartExam?: () => void;
  onCancel?: () => void;
}

export function ExamBriefingSlides({
  examType,
  configSummary,
  setLabel,
  onComplete,
  onStartExam,
  onCancel,
}: ExamBriefingSlidesProps) {
  const slides = BRIEFING_DECKS[examType] ?? BRIEFING_DECKS.tat;
  const [currentIndex, setCurrentIndex] = useState(0);
  const summaryLabel = configSummary ?? setLabel;
  const triggerComplete = useCallback(() => {
    if (onComplete) {
      onComplete();
    } else if (onStartExam) {
      onStartExam();
    }
  }, [onComplete, onStartExam]);

  const currentSlide = slides[currentIndex] ?? slides[0]!;
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === slides.length - 1;

  const handleNext = useCallback(() => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      triggerComplete();
    }
  }, [currentIndex, slides.length, triggerComplete]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        if (currentIndex < slides.length - 1) {
          setCurrentIndex((prev) => prev + 1);
        }
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (currentIndex > 0) {
          setCurrentIndex((prev) => prev - 1);
        }
      } else if (e.key === "Escape" && onCancel) {
        e.preventDefault();
        onCancel();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [currentIndex, slides.length, onCancel]);

  return (
    <div
      className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-10"
      data-testid="exam-briefing-modal"
    >
      <div
        className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-800 dark:bg-neutral-900"
        data-testid="exam-briefing-slides"
      >
        {/* Top Projector Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 bg-neutral-900 px-5 py-3.5 text-white dark:border-neutral-800 dark:bg-neutral-950">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
            <span
              className="font-mono text-xs font-semibold uppercase tracking-widest text-neutral-200"
              data-testid="briefing-slide-badge"
            >
              {currentSlide.badge}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Slide Indicator Dots */}
            <div className="flex items-center gap-1.5" role="tablist" aria-label="Briefing slides">
              {slides.map((s, idx) => (
                <button
                  key={s.slideNumber}
                  type="button"
                  role="tab"
                  onClick={() => setCurrentIndex(idx)}
                  data-testid={`briefing-slide-dot-${idx}`}
                  aria-label={`Slide ${idx + 1}`}
                  aria-selected={idx === currentIndex}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentIndex
                      ? "w-7 bg-white"
                      : "w-2 bg-neutral-600 hover:bg-neutral-400"
                  }`}
                />
              ))}
            </div>

            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                data-testid="briefing-cancel-btn"
                className="inline-flex items-center gap-1 rounded-md border border-neutral-700 bg-neutral-800 px-2.5 py-1 text-xs font-medium text-neutral-300 transition hover:bg-neutral-700 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
                Back to Setup
              </button>
            )}
          </div>
        </div>

        {/* Slide Content Area */}
        <div className="p-6 sm:p-8">
          {summaryLabel && (
            <div className="mb-4 inline-flex items-center gap-2 rounded-md border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300">
              <Layers className="h-3.5 w-3.5 text-neutral-500" />
              <span>Selected Configuration: {summaryLabel}</span>
            </div>
          )}

          <h1
            className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-2xl"
            data-testid="briefing-slide-title"
          >
            {currentSlide.title}
          </h1>
          <p className="mt-1.5 text-sm text-neutral-600 dark:text-neutral-400">
            {currentSlide.subtitle}
          </p>

          {/* 3 Structured Briefing Cards on each slide */}
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {currentSlide.points.map((pt, i) => (
              <div
                key={pt.heading}
                className="flex flex-col justify-between rounded-xl border border-neutral-200 bg-neutral-50/70 p-4 dark:border-neutral-800 dark:bg-neutral-950/60"
              >
                <div>
                  <div className="mb-2.5 flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-900 font-mono text-xs font-bold text-white dark:bg-white dark:text-neutral-900">
                      {i + 1}
                    </span>
                    <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">
                      {pt.heading}
                    </h2>
                  </div>
                  <p className="text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
                    {pt.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Official Hall Rule Callout */}
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-neutral-200 bg-neutral-100/80 px-4 py-3.5 dark:border-neutral-800 dark:bg-neutral-950">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-neutral-900 dark:text-neutral-200" />
            <div className="text-xs text-neutral-700 dark:text-neutral-300">
              <span className="font-semibold text-neutral-900 dark:text-white">
                SSB Testing Hall Instruction:{" "}
              </span>
              {currentSlide.hallRule}
            </div>
          </div>
        </div>

        {/* Slide Footer Navigation (Previous / Skip / Next / Proceed to Exam) */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 bg-neutral-50 px-6 py-4 dark:border-neutral-800 dark:bg-neutral-950/80">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrev}
              disabled={isFirst}
              data-testid="briefing-prev-btn"
              className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3.5 py-2 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Previous
            </button>

            {!isLast && (
              <button
                type="button"
                onClick={triggerComplete}
                data-testid="briefing-skip-btn"
                className="rounded-lg px-3 py-2 text-xs font-medium text-neutral-500 underline-offset-4 transition hover:text-neutral-900 hover:underline dark:text-neutral-400 dark:hover:text-white"
              >
                Skip Briefing & Start Exam
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span
              className="font-mono text-xs text-neutral-500"
              data-testid="briefing-slide-counter"
            >
              Slide {currentIndex + 1} of {slides.length}
            </span>

            {!isLast ? (
              <button
                type="button"
                onClick={handleNext}
                data-testid="briefing-next-btn"
                className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
              >
                Next Slide
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={triggerComplete}
                data-testid="briefing-start-exam-btn"
                className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-6 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
              >
                <Play className="h-4 w-4 fill-current" />
                Proceed to Exam Hall
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
