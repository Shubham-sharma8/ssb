export type ExerciseType =
  | "image-projection-story"
  | "word-association"
  | "situation-reaction"
  | "structured-self-description"
  | "booklet-sequence";

export type ModuleStatus = "active" | "planned";

export interface ModuleTimingConfiguration {
  hasObservationPhase: boolean;
  defaultObservationSeconds: number;
  defaultResponseSeconds: number;
  totalDurationMinutes: number;
  autoAdvance: boolean;
  supportsCustomTiming: boolean;
}

export interface ModuleResponseFormat {
  inputType: "long-text" | "single-sentence" | "short-paragraph" | "multi-section-form";
  autosaveDebounceMs: number;
  supportsWordCount: boolean;
  enforcesMinimumLength: boolean;
}

export interface ModuleSequencePolicy {
  supportsSequential: boolean;
  supportsRandom: boolean;
  supportsSubsetSelection: boolean;
  preservesCanonicalNumbering: boolean;
}

export interface ModuleCompletionPolicy {
  trackedStates: Array<
    "not_attempted" | "in_progress" | "completed" | "skipped" | "reviewed"
  >;
  allowsRepeatCompleted: boolean;
  commitsDraftOnDeadline: boolean;
}

export interface ModuleReviewCapabilities {
  postSessionOnly: boolean;
  supportsOfflineStoryEdit: boolean;
  supportsStructuredReflection: boolean;
  reflectionPrompts: string[];
}

export interface ExerciseModuleDefinition {
  id: string;
  name: string;
  shortName: string;
  badge: string;
  status: ModuleStatus;
  route: string | null;
  exerciseType: ExerciseType;
  summary: string;
  instructions: string[];
  stimulusCollectionSummary: string;
  timingConfig: ModuleTimingConfiguration;
  responseFormat: ModuleResponseFormat;
  sequencePolicy: ModuleSequencePolicy;
  completionPolicy: ModuleCompletionPolicy;
  reviewCapabilities: ModuleReviewCapabilities;
}

export const SSB_EXERCISE_MODULES: ExerciseModuleDefinition[] = [
  {
    id: "tat",
    name: "Thematic Apperception Test (TAT)",
    shortName: "TAT",
    badge: "Available Now",
    status: "active",
    route: "/tat",
    exerciseType: "image-projection-story",
    summary:
      "Real SSB hall simulation: each picture is projected for 30 seconds (no visible timer), then vanishes for 4 minutes while you write your story in your physical SSB Psychology Booklet.",
    instructions: [
      "Download and print the official 16-page SSB Psychology Test Booklet before starting.",
      "Observe each projected picture carefully for 30 seconds (no timer is displayed in Real Mode).",
      "After 30 seconds, the picture vanishes automatically for 4 minutes while you write your story in your notebook.",
      "Each set (SET 1 to SET 10) contains 11 sequential pictures followed by the 12th Blank Slide.",
    ],
    stimulusCollectionSummary:
      "10 structured TAT Sets (SET 1 – SET 10), each with 11 sequential pictures + 1 Blank Slide (12 slides per set) extracted in strict PDF sequence.",
    timingConfig: {
      hasObservationPhase: true,
      defaultObservationSeconds: 30,
      defaultResponseSeconds: 240,
      totalDurationMinutes: 54,
      autoAdvance: true,
      supportsCustomTiming: true,
    },
    responseFormat: {
      inputType: "long-text",
      autosaveDebounceMs: 250,
      supportsWordCount: true,
      enforcesMinimumLength: false,
    },
    sequencePolicy: {
      supportsSequential: true,
      supportsRandom: true,
      supportsSubsetSelection: true,
      preservesCanonicalNumbering: true,
    },
    completionPolicy: {
      trackedStates: [
        "not_attempted",
        "in_progress",
        "completed",
        "skipped",
        "reviewed",
      ],
      allowsRepeatCompleted: true,
      commitsDraftOnDeadline: true,
    },
    reviewCapabilities: {
      postSessionOnly: true,
      supportsOfflineStoryEdit: true,
      supportsStructuredReflection: true,
      reflectionPrompts: [
        "Was the main character clearly established?",
        "Was a plausible situation described?",
        "Was there a concrete course of action?",
        "Was the outcome explained?",
        "Did the story fit the available picture?",
        "What could be improved next time?",
      ],
    },
  },
  {
    id: "wat",
    name: "Word Association Test (WAT)",
    shortName: "WAT",
    badge: "Available Now",
    status: "active",
    route: "/wat",
    exerciseType: "word-association",
    summary:
      "60 sequential word stimuli (SSB Allahabad, Bangalore, Jalandhar, Bhopal, Dehradun, WAT Sets 6–9 & Random Set). 15s per word with beep cue + 30s page-turn pause after every 20 words.",
    instructions: [
      "Each word is projected for 15 seconds with an audio beep cue on every word transition.",
      "Write the first spontaneous thought or sentence triggered by the word in your physical SSB Booklet.",
      "A 30-second page-turn timer is automatically inserted after Word 20 and Word 40.",
    ],
    stimulusCollectionSummary:
      "9 board/sequential 60-word sets (SSB Allahabad, Bangalore, Jalandhar, Bhopal, Dehradun + WAT Sets 6–9) + Real-Time Random WAT Set from 322 authentic words.",
    timingConfig: {
      hasObservationPhase: false,
      defaultObservationSeconds: 0,
      defaultResponseSeconds: 15,
      totalDurationMinutes: 15,
      autoAdvance: true,
      supportsCustomTiming: true,
    },
    responseFormat: {
      inputType: "single-sentence",
      autosaveDebounceMs: 150,
      supportsWordCount: true,
      enforcesMinimumLength: false,
    },
    sequencePolicy: {
      supportsSequential: true,
      supportsRandom: true,
      supportsSubsetSelection: true,
      preservesCanonicalNumbering: true,
    },
    completionPolicy: {
      trackedStates: [
        "not_attempted",
        "in_progress",
        "completed",
        "skipped",
        "reviewed",
      ],
      allowsRepeatCompleted: true,
      commitsDraftOnDeadline: true,
    },
    reviewCapabilities: {
      postSessionOnly: true,
      supportsOfflineStoryEdit: true,
      supportsStructuredReflection: true,
      reflectionPrompts: [
        "Was the response spontaneous and constructive?",
        "Were any words left blank under time pressure?",
      ],
    },
  },
  {
    id: "srt",
    name: "Situation Reaction Test (SRT)",
    shortName: "SRT",
    badge: "Available Now",
    status: "active",
    route: "/srt",
    exerciseType: "situation-reaction",
    summary:
      "Displays 5 SRTs at a time with official instructions and an invisible timer equivalent to the SRT count (30s × SRTs). Includes Predefined Sets 1–4 and Real-Time Random SRT Set.",
    instructions: [
      "Read the 5 situations displayed on each sheet and write your concrete reactions in your physical SSB Booklet.",
      "An invisible background timer runs equivalent to your selected SRT count (2m 30s per 5-SRT sheet / 30m for 60 SRTs).",
    ],
    stimulusCollectionSummary:
      "4 predefined 60-situation sets (SRT SET 1 – SET 4) + Real-Time Random SRT generator from 230 authentic SSB situations.",
    timingConfig: {
      hasObservationPhase: false,
      defaultObservationSeconds: 0,
      defaultResponseSeconds: 30,
      totalDurationMinutes: 30,
      autoAdvance: true,
      supportsCustomTiming: true,
    },
    responseFormat: {
      inputType: "short-paragraph",
      autosaveDebounceMs: 200,
      supportsWordCount: true,
      enforcesMinimumLength: false,
    },
    sequencePolicy: {
      supportsSequential: true,
      supportsRandom: true,
      supportsSubsetSelection: true,
      preservesCanonicalNumbering: true,
    },
    completionPolicy: {
      trackedStates: [
        "not_attempted",
        "in_progress",
        "completed",
        "skipped",
        "reviewed",
      ],
      allowsRepeatCompleted: true,
      commitsDraftOnDeadline: true,
    },
    reviewCapabilities: {
      postSessionOnly: true,
      supportsOfflineStoryEdit: true,
      supportsStructuredReflection: true,
      reflectionPrompts: [
        "Did the response address the core problem directly?",
        "Was the action realistic given the constraints of the situation?",
      ],
    },
  },
  {
    id: "sdt",
    name: "Self-Description Test (SDT)",
    shortName: "SDT",
    badge: "Available Now",
    status: "active",
    route: "/sdt",
    exerciseType: "structured-self-description",
    summary:
      "15-minute structured self-assessment across the 5 official SSB perspectives (Parents, Teachers/Employers, Friends, Own Strengths/Weaknesses, and Aspirations) with an invisible hall timer.",
    instructions: [
      "Write structured paragraphs covering the five standard SSB Self-Description prompts on pages 15–16 of your physical SSB Booklet within 15 minutes.",
    ],
    stimulusCollectionSummary:
      "5 official SSB Self-Description prompts with 15-minute invisible hall timer and PDF Question Booklet + AI Prompt export.",
    timingConfig: {
      hasObservationPhase: false,
      defaultObservationSeconds: 0,
      defaultResponseSeconds: 900,
      totalDurationMinutes: 15,
      autoAdvance: false,
      supportsCustomTiming: true,
    },
    responseFormat: {
      inputType: "multi-section-form",
      autosaveDebounceMs: 300,
      supportsWordCount: true,
      enforcesMinimumLength: false,
    },
    sequencePolicy: {
      supportsSequential: true,
      supportsRandom: false,
      supportsSubsetSelection: false,
      preservesCanonicalNumbering: true,
    },
    completionPolicy: {
      trackedStates: ["not_attempted", "in_progress", "completed", "reviewed"],
      allowsRepeatCompleted: true,
      commitsDraftOnDeadline: true,
    },
    reviewCapabilities: {
      postSessionOnly: true,
      supportsOfflineStoryEdit: true,
      supportsStructuredReflection: true,
      reflectionPrompts: [
        "Are the five perspectives specific and authentic?",
        "Were all five sections completed within the 15-minute window?",
      ],
    },
  },
];

export function getExerciseModule(id: string): ExerciseModuleDefinition | undefined {
  return SSB_EXERCISE_MODULES.find((m) => m.id === id);
}
