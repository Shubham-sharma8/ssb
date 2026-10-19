import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const watTxt = fs.readFileSync(path.join(ROOT, "WAT.txt"), "utf8");
const srtTxt = fs.readFileSync(path.join(ROOT, "SRT.txt"), "utf8");

function cleanWord(raw) {
  return raw
    .replace(/^[0-9️⃣🔟.\s*-]+/u, "")
    .replace(/^[\d]+\.\s*/, "")
    .replace(/[*_📌]/gu, "")
    .trim();
}

// Parse WAT.txt
const watLines = watTxt.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

const boardSections = [
  {
    id: "wat-allahabad",
    title: "SSB Allahabad",
    boardName: "SSB Allahabad (Selection Centre East)",
    headerMatch: /SSB ALLAHABAD/i,
  },
  {
    id: "wat-bangalore",
    title: "SSB Bangalore",
    boardName: "SSB Bangalore (Selection Centre South)",
    headerMatch: /SSB\s+Bangalore/i,
  },
  {
    id: "wat-jalandhar",
    title: "SSB Jalandhar",
    boardName: "SSB Jalandhar (Selection Centre North)",
    headerMatch: /SSB JALANDHAR/i,
  },
  {
    id: "wat-bhopal",
    title: "SSB Bhopal",
    boardName: "SSB Bhopal (Selection Centre Central)",
    headerMatch: /SSB BHOPAL/i,
  },
  {
    id: "wat-dehradun",
    title: "1 AFSB Dehradun",
    boardName: "1 AFSB Dehradun (Air Force Selection Board)",
    headerMatch: /1 AFSB DEHRADUN/i,
  },
];

let currentSection = null;
const rawBoardWords = {
  "wat-allahabad": [],
  "wat-bangalore": [],
  "wat-jalandhar": [],
  "wat-bhopal": [],
  "wat-dehradun": [],
};
const otherWatWords = [];

for (const line of watLines) {
  const matchedBoard = boardSections.find((b) => b.headerMatch.test(line));
  if (matchedBoard) {
    currentSection = matchedBoard.id;
    continue;
  }
  if (/^Other WAT$/i.test(line)) {
    currentSection = "other";
    continue;
  }

  const word = cleanWord(line);
  if (!word) continue;

  if (currentSection && currentSection !== "other") {
    rawBoardWords[currentSection].push(word);
  } else if (currentSection === "other") {
    // Fix minor OCR typo "Solder" -> "Soldier" if needed, or preserve clean capitalization
    const normalized = word === "Solder" ? "Soldier" : word;
    otherWatWords.push(normalized);
  }
}

// Track used words from otherWatWords when topping up boards with < 60 words
let otherCursor = 0;

function topUpTo60(initialWords) {
  const result = [...initialWords];
  const existingLower = new Set(result.map((w) => w.toLowerCase()));
  while (result.length < 60 && otherCursor < otherWatWords.length) {
    const candidate = otherWatWords[otherCursor++];
    if (!existingLower.has(candidate.toLowerCase())) {
      result.push(candidate);
      existingLower.add(candidate.toLowerCase());
    }
  }
  return result.slice(0, 60);
}

const watSets = [];

for (const board of boardSections) {
  const originalCount = rawBoardWords[board.id].length;
  const words =
    originalCount >= 60
      ? rawBoardWords[board.id].slice(0, 60)
      : topUpTo60(rawBoardWords[board.id]);

  watSets.push({
    setId: board.id,
    title: board.title,
    boardName: board.boardName,
    category: "board",
    isRandom: false,
    originalBoardWordCount: originalCount,
    wordCount: words.length,
    description:
      originalCount >= 60
        ? `Official 60 recent WAT words asked at ${board.title}.`
        : `${originalCount} recent WAT words reported from ${board.title}, completed to 60 words from the master SSB WAT pool.`,
    words: words.map((w, idx) => ({
      id: `${board.id}-w${String(idx + 1).padStart(2, "0")}`,
      number: idx + 1,
      word: w,
      fromBoardReport: idx < originalCount,
    })),
  });
}

// Now build general sets from the remaining words in otherWatWords
const remainingOther = otherWatWords.slice(otherCursor);
let generalSetIndex = 6; // SET 6, SET 7, SET 8, SET 9
for (let i = 0; i < remainingOther.length; i += 60) {
  const chunk = remainingOther.slice(i, i + 60);
  if (chunk.length < 25) break;
  // If the last chunk has e.g. 52 words, top it up to 60 using earlier words not in this chunk
  const existingLower = new Set(chunk.map((w) => w.toLowerCase()));
  let fillIdx = 0;
  while (chunk.length < 60 && fillIdx < otherWatWords.length) {
    const candidate = otherWatWords[fillIdx++];
    if (!existingLower.has(candidate.toLowerCase())) {
      chunk.push(candidate);
      existingLower.add(candidate.toLowerCase());
    }
  }

  const setId = `wat-set-${generalSetIndex}`;
  watSets.push({
    setId,
    title: `WAT SET ${generalSetIndex}`,
    boardName: `Master SSB WAT Archive — Set ${generalSetIndex}`,
    category: "practice",
    isRandom: false,
    originalBoardWordCount: 60,
    wordCount: 60,
    description: `60 sequential SSB WAT words from the master practice bank (Set ${generalSetIndex}).`,
    words: chunk.slice(0, 60).map((w, idx) => ({
      id: `${setId}-w${String(idx + 1).padStart(2, "0")}`,
      number: idx + 1,
      word: w,
      fromBoardReport: false,
    })),
  });
  generalSetIndex++;
}

// Collect unique master word bank for RANDOM WAT SET
const allWordsPool = [];
const seenLower = new Set();
for (const s of watSets) {
  for (const item of s.words) {
    const lower = item.word.toLowerCase();
    if (!seenLower.has(lower)) {
      seenLower.add(lower);
      allWordsPool.push(item.word);
    }
  }
}

const watCatalog = {
  version: "1.0.0",
  generatedAt: new Date().toISOString(),
  defaultWordDurationMs: 15000,
  pageTurnIntervalEvery: 20,
  pageTurnDurationMs: 30000,
  totalUniqueWords: allWordsPool.length,
  masterWordPool: allWordsPool,
  sets: watSets,
};

fs.writeFileSync(
  path.join(ROOT, "data/wat-catalog.json"),
  JSON.stringify(watCatalog, null, 2)
);

// Parse SRT.txt
// Normalize lines and extract numbered items 1..230
const srtCleanText = srtTxt
  .replace(/\r\n/g, "\n")
  // Fix 191 + 192 split across one sentence
  .replace(
    /191\.\s*In order to produce better results in his organization\s*192\.\s*what measures he should take\.+/i,
    "191. In order to produce better results in his organization, what measures should he take....\n192. When assigned an urgent task with limited resources in his organization, he...."
  )
  // Fix 105 where two situations were merged
  .replace(
    /105\.\s*He sees a snake moving near to the bed where his younger\s*brother is sleeping, when he enters his room\.\s*If some of your\s*friend cracks a joke on you in presence of your girlfriend, what\s*will you do\.+/i,
    "105. He sees a snake moving near the bed where his younger brother is sleeping when he enters his room. He...."
  )
  // Fix 115 where two situations were merged
  .replace(
    /You have been invited for dinner by one of\s*your friend and you are also required to attend Regimental\s*'BaraKhana’\.\s*you\.+/i,
    ""
  );

const srtRegex = /(?:^|\n)\s*(\d{1,3})\.\s+([\s\S]*?)(?=(?:\n\s*\d{1,3}\.\s+)|$)/g;
const srtItems = [];
let match;
while ((match = srtRegex.exec(srtCleanText)) !== null) {
  const num = Number(match[1]);
  let text = match[2]
    .replace(/\s+/g, " ")
    .replace(/(\.\s*){2,}$/, "...")
    .trim();
  if (!text.endsWith(".") && !text.endsWith("?")) {
    text = `${text}...`;
  }
  srtItems.push({
    id: `srt-q${String(num).padStart(3, "0")}`,
    originalNumber: num,
    situation: text,
  });
}

// Deterministic PRNG (Mulberry32) to build predefined random sets from the 230 SRTs
function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = mulberry32(20261019);
const shuffledIndices = srtItems.map((_, idx) => idx);
for (let i = shuffledIndices.length - 1; i > 0; i--) {
  const j = Math.floor(rng() * (i + 1));
  [shuffledIndices[i], shuffledIndices[j]] = [shuffledIndices[j], shuffledIndices[i]];
}

const srtSets = [];
for (let s = 0; s < 4; s++) {
  const slice = shuffledIndices.slice(s * 55, s * 55 + 60);
  // Ensure 60 items per predefined set
  while (slice.length < 60) {
    slice.push(shuffledIndices[(slice.length * 7 + s) % shuffledIndices.length]);
  }
  const setNum = s + 1;
  const setId = `srt-set-${setNum}`;
  srtSets.push({
    setId,
    title: `SRT SET ${setNum}`,
    subtitle: `Predefined SSB SRT Booklet — Set ${setNum}`,
    isRandom: false,
    questionCount: 60,
    description: `Predefined 60-situation SSB SRT set curated from the 230-question SSB archive (displayed 5 situations per sheet with invisible timer).`,
    questions: slice.map((itemIdx, pos) => ({
      id: `${setId}-q${String(pos + 1).padStart(2, "0")}`,
      number: pos + 1,
      sourceQuestionId: srtItems[itemIdx].id,
      originalNumber: srtItems[itemIdx].originalNumber,
      situation: srtItems[itemIdx].situation,
    })),
  });
}

const srtCatalog = {
  version: "1.0.0",
  generatedAt: new Date().toISOString(),
  secondsPerSrt: 30,
  questionsPerSheet: 5,
  defaultFullCount: 60,
  totalMasterQuestions: srtItems.length,
  masterQuestionPool: srtItems,
  sets: srtSets,
};

fs.writeFileSync(
  path.join(ROOT, "data/srt-catalog.json"),
  JSON.stringify(srtCatalog, null, 2)
);

// Build SDT Catalog
const sdtCatalog = {
  version: "1.0.0",
  generatedAt: new Date().toISOString(),
  defaultDurationMs: 15 * 60 * 1000, // 15 minutes
  prompts: [
    {
      id: "sdt-1-parents",
      number: 1,
      title: "Parents' Opinion",
      question: "What do your parents (or guardians) think about you?",
      guidance:
        "Write what your parents genuinely observe about your responsibility, habits, reliability at home, and areas where they advise you to improve.",
    },
    {
      id: "sdt-2-teachers",
      number: 2,
      title: "Teachers' / Employers' Opinion",
      question: "What do your teachers, professors, or employers think about you?",
      guidance:
        "Describe how your mentors or supervisors view your punctuality, sincerity, grasp of tasks, teamwork, and areas where they expect more from you.",
    },
    {
      id: "sdt-3-friends",
      number: 3,
      title: "Friends' & Colleagues' Opinion",
      question: "What do your friends and colleagues think about you?",
      guidance:
        "Mention how your peers see your cooperation, trustworthiness, sense of humour, availability in need, and any habits they tease or correct you about.",
    },
    {
      id: "sdt-4-self",
      number: 4,
      title: "Your Own Opinion About Yourself",
      question: "What is your own opinion about yourself?",
      guidance:
        "State your genuine strengths, values, practical approach to challenges, and honest self-awareness of your current limitations.",
    },
    {
      id: "sdt-5-aim",
      number: 5,
      title: "Qualities You Would Like to Develop",
      question: "What kind of person do you want to become / what qualities would you like to develop?",
      guidance:
        "Outline concrete, actionable qualities and skills you are actively working to build for your personal growth and career.",
    },
  ],
};

fs.writeFileSync(
  path.join(ROOT, "data/sdt-catalog.json"),
  JSON.stringify(sdtCatalog, null, 2)
);

console.log(
  `Built WAT catalog (${watSets.length} predefined sets, ${allWordsPool.length} unique words), SRT catalog (${srtSets.length} predefined sets, ${srtItems.length} master questions), and SDT catalog (5 prompts).`
);
