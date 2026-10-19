import rawWatCatalog from "@/data/wat-catalog.json";
import rawSrtCatalog from "@/data/srt-catalog.json";
import rawSdtCatalog from "@/data/sdt-catalog.json";

export interface WatWordItem {
  id: string;
  number: number;
  word: string;
  fromBoardReport?: boolean;
}

export interface WatSetDefinition {
  id: string;
  setId: string;
  title: string;
  label: string;
  shortTitle: string;
  boardName: string;
  board: string;
  category: "board" | "practice" | "random";
  isRandom: boolean;
  originalBoardWordCount: number;
  supplementedPoolCount: number;
  wordCount: number;
  description: string;
  words: WatWordItem[];
}

export interface SrtQuestionItem {
  id: string;
  number: number;
  sourceQuestionId: string;
  originalNumber: number;
  situation: string;
}

export interface SrtSetDefinition {
  id: string;
  setId: string;
  title: string;
  label: string;
  shortTitle: string;
  subtitle: string;
  isRandom: boolean;
  questionCount: number;
  description: string;
  questions: SrtQuestionItem[];
}

export interface SdtPromptItem {
  id: string;
  number: number;
  title: string;
  question: string;
  prompt: string;
  guidance: string;
}

export function getWatTotalWordsCount(): number {
  return rawWatCatalog.totalUniqueWords ?? rawWatCatalog.masterWordPool.length;
}

export function getSrtTotalQuestionsCount(): number {
  return (
    rawSrtCatalog.totalMasterQuestions ??
    rawSrtCatalog.masterQuestionPool.length
  );
}

export function getWatSets(): WatSetDefinition[] {
  const predefined = (
    rawWatCatalog.sets as Array<
      Omit<
        WatSetDefinition,
        "id" | "label" | "board" | "shortTitle" | "supplementedPoolCount"
      >
    >
  ).map((s) => ({
    ...s,
    id: s.setId,
    label: s.title,
    shortTitle: s.title,
    board: s.boardName,
    supplementedPoolCount: Math.max(0, s.wordCount - s.originalBoardWordCount),
  }));

  const randomSet: WatSetDefinition = {
    id: "wat-random",
    setId: "wat-random",
    title: "RANDOM WAT SET",
    label: "RANDOM WAT SET",
    shortTitle: "RANDOM WAT SET",
    boardName: "Live Random Generator (All SSB Boards & Master Pool)",
    board: "Live Random Generator (All SSB Boards & Master Pool)",
    category: "random",
    isRandom: true,
    originalBoardWordCount: 60,
    supplementedPoolCount: 0,
    wordCount: 60,
    description:
      "Selects 60 WAT words randomly in real time from the 322-word SSB archive when you launch the test.",
    words: [],
  };

  return [...predefined, randomSet];
}

export function resolveWatWordsForSet(
  setId: string,
  count = 60
): { set: WatSetDefinition; words: WatWordItem[] } {
  const allSets = getWatSets();
  const found =
    allSets.find((s) => s.setId === setId || s.id === setId) ?? allSets[0];

  if (found.isRandom || found.setId === "wat-random") {
    const pool = [...rawWatCatalog.masterWordPool];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    const picked = pool.slice(0, count).map((word, idx) => ({
      id: `wat-random-w${String(idx + 1).padStart(2, "0")}`,
      number: idx + 1,
      word,
      fromBoardReport: false,
    }));
    return {
      set: {
        ...found,
        wordCount: picked.length,
        words: picked,
      },
      words: picked,
    };
  }

  const sliced = found.words.slice(0, count).map((w, idx) => ({
    ...w,
    number: idx + 1,
  }));
  return {
    set: found,
    words: sliced,
  };
}

export function getSrtSets(): SrtSetDefinition[] {
  const randomSet: SrtSetDefinition = {
    id: "srt-random",
    setId: "srt-random",
    title: "RANDOM SRT SET",
    label: "RANDOM SRT SET",
    shortTitle: "RANDOM SRT SET",
    subtitle: "Real-Time Random Selection (230 SSB Situations)",
    isRandom: true,
    questionCount: 60,
    description:
      "Not predefined — selects fresh SRT situations randomly in real time from the 230-situation SSB dataset on every attempt.",
    questions: [],
  };

  const predefined = (
    rawSrtCatalog.sets as Array<
      Omit<SrtSetDefinition, "id" | "label" | "shortTitle">
    >
  ).map((s) => ({
    ...s,
    id: s.setId,
    label: s.title,
    shortTitle: s.title,
  }));

  return [randomSet, ...predefined];
}

export function resolveSrtQuestionsForSet(
  setId: string,
  count = 60
): { set: SrtSetDefinition; questions: SrtQuestionItem[] } {
  const allSets = getSrtSets();
  const found =
    allSets.find((s) => s.setId === setId || s.id === setId) ?? allSets[0];

  if (found.isRandom || found.setId === "srt-random") {
    const pool = [...rawSrtCatalog.masterQuestionPool];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    const picked = pool.slice(0, count).map((item, idx) => ({
      id: `srt-random-q${String(idx + 1).padStart(2, "0")}`,
      number: idx + 1,
      sourceQuestionId: item.id,
      originalNumber: item.originalNumber,
      situation: item.situation,
    }));
    return {
      set: {
        ...found,
        questionCount: picked.length,
        questions: picked,
      },
      questions: picked,
    };
  }

  const sliced = found.questions.slice(0, count).map((q, idx) => ({
    ...q,
    number: idx + 1,
  }));
  return {
    set: found,
    questions: sliced,
  };
}

export function getSdtPrompts(): SdtPromptItem[] {
  return (rawSdtCatalog.prompts as Array<Omit<SdtPromptItem, "prompt">>).map(
    (p) => ({
      ...p,
      prompt: p.question,
    })
  );
}

export function getSdtDefaultDurationMs(): number {
  return rawSdtCatalog.defaultDurationMs ?? 15 * 60 * 1000;
}
