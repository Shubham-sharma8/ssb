import type { ResolvedStimulus } from "@/lib/tat/catalog";
import type { WatWordItem, SrtQuestionItem, SdtPromptItem } from "@/lib/psych/catalog";

export interface AttemptedBookletPayload {
  testType: "TAT" | "WAT" | "SRT" | "SDT" | "FULL_PSYCH_BATTERY";
  title: string;
  completedAtIso: string;
  modeLabel: string;
  tat?: {
    setTitle: string;
    observationSeconds: number;
    writingSeconds: number;
    slides: Array<{
      stepNumber: number;
      canonicalNumber: number;
      stimulusId: string;
      isBlankSlide: boolean;
      assetPath: string;
      sourceHint?: string;
      typedDraft?: string;
    }>;
  };
  wat?: {
    setTitle: string;
    boardName: string;
    wordDurationSeconds: number;
    pageTurnSeconds: number;
    words: WatWordItem[];
  };
  srt?: {
    setTitle: string;
    totalDurationSeconds: number;
    questions: SrtQuestionItem[];
  };
  sdt?: {
    durationSeconds: number;
    prompts: SdtPromptItem[];
  };
}

/**
 * Escapes parentheses and backslashes for PDF literal strings.
 */
function pdfEscape(text: string): string {
  return text
    .replace(/[^\x20-\x7E]/g, " ")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

/**
 * Wraps a single line into multiple lines of at most `maxChars` characters.
 */
function wrapTextLine(line: string, maxChars = 88): string[] {
  if (line.length <= maxChars) return [line];
  const words = line.split(/\s+/);
  const result: string[] = [];
  let current = "";
  for (const w of words) {
    if (!current) {
      current = w;
    } else if (current.length + 1 + w.length <= maxChars) {
      current += ` ${w}`;
    } else {
      result.push(current);
      current = w;
    }
  }
  if (current) result.push(current);
  return result;
}

/**
 * Builds structured plain-text lines representing the attempted question booklet.
 */
export function buildBookletDocumentLines(
  payload: AttemptedBookletPayload
): Array<{ text: string; bold?: boolean; size?: number }> {
  const lines: Array<{ text: string; bold?: boolean; size?: number }> = [];

  lines.push({
    text: "SSB.COGIFY.ME — ATTEMPTED SSB PSYCHOLOGY QUESTION BOOKLET",
    bold: true,
    size: 13,
  });
  lines.push({
    text: `Test Module: ${payload.title} (${payload.testType})`,
    bold: true,
    size: 10,
  });
  lines.push({
    text: `Completed At: ${new Date(payload.completedAtIso).toLocaleString()} | Mode: ${payload.modeLabel}`,
    size: 9,
  });
  lines.push({
    text: "----------------------------------------------------------------------------------------",
    size: 9,
  });
  lines.push({ text: "", size: 9 });

  if (payload.tat && payload.tat.slides.length > 0) {
    lines.push({
      text: `SECTION 1: THEMATIC APPERCEPTION TEST (TAT) — ${payload.tat.setTitle}`,
      bold: true,
      size: 11,
    });
    lines.push({
      text: `Timing: ${payload.tat.observationSeconds}s Picture Projection + ${Math.round(
        payload.tat.writingSeconds / 60
      )}m Story Writing (${payload.tat.slides.length} Slides Attempted)`,
      size: 9,
    });
    lines.push({ text: "", size: 9 });

    for (const slide of payload.tat.slides) {
      const label = slide.isBlankSlide
        ? `Slide ${slide.stepNumber} (Picture #12 — BLANK SLIDE): Candidate imagines own picture & writes Story #12`
        : `Slide ${slide.stepNumber} (Picture #${slide.canonicalNumber}): Stimulus ID ${slide.stimulusId} [Image: ${slide.assetPath}]`;
      for (const wrapped of wrapTextLine(label, 86)) {
        lines.push({ text: wrapped, bold: slide.isBlankSlide, size: 9.5 });
      }
      if (slide.typedDraft && slide.typedDraft.trim().length > 0) {
        for (const wrapped of wrapTextLine(
          `   Typed Story Response: ${slide.typedDraft.trim()}`,
          84
        )) {
          lines.push({ text: wrapped, size: 9 });
        }
      }
    }
    lines.push({ text: "", size: 9 });
  }

  if (payload.wat && payload.wat.words.length > 0) {
    lines.push({
      text: `SECTION 2: WORD ASSOCIATION TEST (WAT) — ${payload.wat.setTitle} (${payload.wat.boardName})`,
      bold: true,
      size: 11,
    });
    lines.push({
      text: `Timing: ${payload.wat.wordDurationSeconds}s per word with audio beep + ${payload.wat.pageTurnSeconds}s page-turn pause after every 20 words (${payload.wat.words.length} Words)`,
      size: 9,
    });
    lines.push({ text: "", size: 9 });

    // Format in clean rows of 3 words per line for compact readability, plus sequential numbering
    for (let i = 0; i < payload.wat.words.length; i += 3) {
      const chunk = payload.wat.words.slice(i, i + 3);
      const rowText = chunk
        .map((w) => `${String(w.number).padStart(2, "0")}. ${w.word.padEnd(20, " ")}`)
        .join("   ");
      lines.push({ text: rowText, size: 9.5 });
      if ((i + 3) === 20 || (i + 3) === 40) {
        lines.push({
          text: `--- [30-Second Booklet Page Turn after Word ${i + 3}] ---`,
          size: 8.5,
        });
      }
    }
    lines.push({ text: "", size: 9 });
  }

  if (payload.srt && payload.srt.questions.length > 0) {
    lines.push({
      text: `SECTION 3: SITUATION REACTION TEST (SRT) — ${payload.srt.setTitle}`,
      bold: true,
      size: 11,
    });
    lines.push({
      text: `Total SRTs Attempted: ${payload.srt.questions.length} | Invisible Timer: ${Math.round(
        payload.srt.totalDurationSeconds / 60
      )}m ${payload.srt.totalDurationSeconds % 60}s (30s per SRT, displayed 5 per sheet)`,
      size: 9,
    });
    lines.push({ text: "", size: 9 });

    for (const q of payload.srt.questions) {
      const wrapped = wrapTextLine(
        `SRT #${String(q.number).padStart(2, "0")}: ${q.situation}`,
        86
      );
      wrapped.forEach((lineText, idx) => {
        lines.push({
          text: idx === 0 ? lineText : `        ${lineText}`,
          size: 9.5,
        });
      });
    }
    lines.push({ text: "", size: 9 });
  }

  if (payload.sdt && payload.sdt.prompts.length > 0) {
    lines.push({
      text: `SECTION 4: SELF-DESCRIPTION TEST (SDT) — 5 Standard SSB Questions`,
      bold: true,
      size: 11,
    });
    lines.push({
      text: `Timing: ${Math.round(payload.sdt.durationSeconds / 60)} Minutes Invisible Timer`,
      size: 9,
    });
    lines.push({ text: "", size: 9 });

    for (const p of payload.sdt.prompts) {
      lines.push({
        text: `SDT #${p.number} (${p.title}): ${p.question}`,
        bold: true,
        size: 9.5,
      });
      for (const wrapped of wrapTextLine(`   Guidance: ${p.guidance}`, 84)) {
        lines.push({ text: wrapped, size: 9 });
      }
    }
    lines.push({ text: "", size: 9 });
  }

  lines.push({
    text: "----------------------------------------------------------------------------------------",
    size: 9,
  });
  lines.push({
    text: "Generated by ssb.cogify.me (A Cogify Technologies Platform — https://cogify.me)",
    size: 8.5,
  });

  return lines;
}

/**
 * Generates a valid multi-page binary PDF (PDF 1.4) in memory and returns a Uint8Array.
 */
export function generateAttemptedBookletPdfBytes(
  payload: AttemptedBookletPayload
): Uint8Array {
  const allLines = buildBookletDocumentLines(payload);
  const linesPerPage = 52;
  const pages: Array<typeof allLines> = [];
  for (let i = 0; i < allLines.length; i += linesPerPage) {
    pages.push(allLines.slice(i, i + linesPerPage));
  }
  if (pages.length === 0) {
    pages.push([{ text: "SSB Question Booklet", bold: true, size: 12 }]);
  }

  // Object IDs:
  // 1: Catalog
  // 2: Pages
  // 3: Font Regular (Helvetica)
  // 4: Font Bold (Helvetica-Bold)
  // For each page p (0..pages.length-1):
  //   Page object ID = 5 + p * 2
  //   Content stream ID = 6 + p * 2
  const objects: string[] = [];
  const pageObjectIds: number[] = [];

  for (let p = 0; p < pages.length; p++) {
    const pageObjId = 5 + p * 2;
    const contentObjId = 6 + p * 2;
    pageObjectIds.push(pageObjId);

    const pageLines = pages[p];
    const streamParts: string[] = ["BT"];
    let y = 795;

    for (const item of pageLines) {
      const fontRef = item.bold ? "/F2" : "/F1";
      const fontSize = item.size ?? 9.5;
      streamParts.push(`${fontRef} ${fontSize} Tf`);
      streamParts.push(`1 0 0 1 42 ${y} Tm`);
      streamParts.push(`(${pdfEscape(item.text)}) Tj`);
      y -= fontSize >= 11 ? 16 : 13.5;
    }

    // Page footer
    streamParts.push("/F1 8 Tf");
    streamParts.push(`1 0 0 1 42 28 Tm`);
    streamParts.push(
      `(${pdfEscape(
        `ssb.cogify.me — Question Booklet | Page ${p + 1} of ${pages.length}`
      )}) Tj`
    );
    streamParts.push("ET");

    const streamBody = streamParts.join("\n");
    objects[pageObjId] = `${pageObjId} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentObjId} 0 R >>\nendobj\n`;
    objects[contentObjId] = `${contentObjId} 0 obj\n<< /Length ${streamBody.length} >>\nstream\n${streamBody}\nendstream\nendobj\n`;
  }

  objects[1] = `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`;
  objects[2] = `2 0 obj\n<< /Type /Pages /Kids [${pageObjectIds
    .map((id) => `${id} 0 R`)
    .join(" ")}] /Count ${pages.length} >>\nendobj\n`;
  objects[3] = `3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`;
  objects[4] = `4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n`;

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [0];
  const totalObjects = 4 + pages.length * 2;

  for (let id = 1; id <= totalObjects; id++) {
    offsets[id] = pdf.length;
    pdf += objects[id];
  }

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${totalObjects + 1}\n0000000000 65535 f \n`;
  for (let id = 1; id <= totalObjects; id++) {
    pdf += `${String(offsets[id]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${totalObjects + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new TextEncoder().encode(pdf);
}

/**
 * Triggers a direct browser download of the generated Question Booklet PDF.
 */
export function downloadAttemptedBookletPdf(
  payload: AttemptedBookletPayload
): void {
  const bytes = generateAttemptedBookletPdfBytes(payload);
  const blob = new Blob([bytes.buffer as ArrayBuffer], {
    type: "application/pdf",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const slug = payload.testType.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const datePart = payload.completedAtIso.slice(0, 10);
  a.href = url;
  a.download = `ssb-cogify-question-booklet-${slug}-${datePart}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/**
 * Opens a printable visual dossier window (including actual TAT stimulus images)
 * so the user can also print or Save as PDF with embedded pictures.
 */
export function openPrintableVisualBooklet(
  payload: AttemptedBookletPayload
): void {
  const win = window.open("", "_blank");
  if (!win) return;

  const tatHtml =
    payload.tat && payload.tat.slides.length > 0
      ? `
      <section style="margin-bottom: 28px;">
        <h2 style="font-size: 16px; border-bottom: 1px solid #d4d4d8; padding-bottom: 6px;">
          1. Thematic Apperception Test (TAT) — ${payload.tat.setTitle}
        </h2>
        <p style="font-size: 12px; color: #52525b;">
          ${payload.tat.observationSeconds}s picture projection + ${Math.round(
          payload.tat.writingSeconds / 60
        )}m story writing (${payload.tat.slides.length} slides)
        </p>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; margin-top: 12px;">
          ${payload.tat.slides
            .map(
              (s) => `
              <div style="border: 1px solid #d4d4d8; border-radius: 6px; padding: 10px; page-break-inside: avoid;">
                <div style="font-size: 12px; font-weight: 600; margin-bottom: 6px;">
                  Slide ${s.stepNumber} — ${
                s.isBlankSlide
                  ? "Picture #12 (Blank Slide)"
                  : `Picture #${s.canonicalNumber}`
              }
                </div>
                <div style="height: 170px; background: #18181b; display: flex; align-items: center; justify-content: center; border-radius: 4px; overflow: hidden;">
                  <img src="${window.location.origin}${s.assetPath}" alt="Picture ${
                s.canonicalNumber
              }" style="max-width: 100%; max-height: 166px; object-fit: contain;" />
                </div>
              </div>`
            )
            .join("")}
        </div>
      </section>`
      : "";

  const watHtml =
    payload.wat && payload.wat.words.length > 0
      ? `
      <section style="margin-bottom: 28px; page-break-inside: avoid;">
        <h2 style="font-size: 16px; border-bottom: 1px solid #d4d4d8; padding-bottom: 6px;">
          2. Word Association Test (WAT) — ${payload.wat.setTitle} (${payload.wat.boardName})
        </h2>
        <p style="font-size: 12px; color: #52525b;">
          ${payload.wat.wordDurationSeconds}s per word with beep + ${payload.wat.pageTurnSeconds}s page-turn pause after every 20 words
        </p>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px 16px; margin-top: 10px; font-size: 12px;">
          ${payload.wat.words
            .map(
              (w) =>
                `<div><strong>${String(w.number).padStart(2, "0")}.</strong> ${
                  w.word
                }</div>`
            )
            .join("")}
        </div>
      </section>`
      : "";

  const srtHtml =
    payload.srt && payload.srt.questions.length > 0
      ? `
      <section style="margin-bottom: 28px;">
        <h2 style="font-size: 16px; border-bottom: 1px solid #d4d4d8; padding-bottom: 6px;">
          3. Situation Reaction Test (SRT) — ${payload.srt.setTitle}
        </h2>
        <ol style="font-size: 12px; line-height: 1.55; padding-left: 20px;">
          ${payload.srt.questions
            .map(
              (q) =>
                `<li style="margin-bottom: 6px;"><strong>[SRT #${q.number}]</strong> ${q.situation}</li>`
            )
            .join("")}
        </ol>
      </section>`
      : "";

  const sdtHtml =
    payload.sdt && payload.sdt.prompts.length > 0
      ? `
      <section style="margin-bottom: 28px;">
        <h2 style="font-size: 16px; border-bottom: 1px solid #d4d4d8; padding-bottom: 6px;">
          4. Self-Description Test (SDT) — 15 Minutes
        </h2>
        <ol style="font-size: 12px; line-height: 1.6; padding-left: 20px;">
          ${payload.sdt.prompts
            .map(
              (p) =>
                `<li style="margin-bottom: 8px;"><strong>${p.title}:</strong> ${p.question}<br/><span style="color:#52525b;">${p.guidance}</span></li>`
            )
            .join("")}
        </ol>
      </section>`
      : "";

  win.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Attempted SSB Question Booklet — ssb.cogify.me</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #18181b; margin: 28px; }
    @media print { .no-print { display: none !important; } }
  </style>
</head>
<body>
  <div class="no-print" style="margin-bottom: 18px; padding: 12px; background: #f4f4f5; border: 1px solid #d4d4d8; border-radius: 6px; display: flex; justify-content: space-between; align-items: center;">
    <span style="font-size: 13px;">Use <strong>Cmd/Ctrl + P → Save as PDF</strong> to save this visual Question Booklet with TAT images.</span>
    <button onclick="window.print()" style="padding: 8px 16px; background: #18181b; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-weight: 600;">Print / Save Visual PDF</button>
  </div>
  <header style="margin-bottom: 20px; border-bottom: 2px solid #18181b; padding-bottom: 10px;">
    <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #52525b;">ssb.cogify.me · Official Attempted Question Booklet</div>
    <h1 style="font-size: 20px; margin: 4px 0;">${payload.title}</h1>
    <div style="font-size: 12px; color: #52525b;">Completed: ${new Date(
      payload.completedAtIso
    ).toLocaleString()} · Mode: ${payload.modeLabel}</div>
  </header>
  ${tatHtml}
  ${watHtml}
  ${srtHtml}
  ${sdtHtml}
</body>
</html>`);
  win.document.close();
}

/**
 * Builds the comprehensive Pin-Point SSB Psychologist AI Evaluation Prompt
 * containing the exact questions attempted by the candidate.
 */
export function buildPinPointAiEvaluationPrompt(
  payload: AttemptedBookletPayload
): string {
  const sections: string[] = [];

  sections.push(
    `You are a Senior DIPR-Trained Indian Services Selection Board (SSB) Psychologist with 20+ years of experience assessing candidates across the 15 Officer Like Qualities (OLQs) grouped under the 4 Official Factors:
- Factor I (Planning & Organizing): Effective Intelligence, Reasoning Ability, Organizing Ability, Power of Expression.
- Factor II (Social Adjustment): Social Adaptability, Cooperation, Sense of Responsibility.
- Factor III (Social Effectiveness): Initiative, Self-Confidence, Speed of Decision, Ability to Influence the Group, Liveliness.
- Factor IV (Dynamic): Determination, Courage, Stamina.

I have just completed an SSB Psychology Test session on ssb.cogify.me (${payload.title}) under ${payload.modeLabel}.
Along with this prompt, I am uploading:
1. The downloaded Attempted Question Booklet PDF (containing the exact TAT pictures, WAT words, SRT situations, and/or SDT prompts I attempted), AND
2. Scanned photos/PDF of my handwritten responses from my SSB Psychology Test Booklet / notebook.

YOUR MISSION — PIN-POINT ACCURACY EVALUATION:
Do NOT give generic motivational advice. Read my handwritten responses carefully, match each response by its exact number to the attempted questions listed below, and give me a ruthless, constructive, pin-point SSB Psychologist evaluation covering:
1. WHAT WAS GOOD: Which exact stories, sentences, or reactions naturally projected Officer Like Qualities (and why).
2. WHAT NEEDS IMPROVEMENT & WHERE (PIN-POINT BY EXACT NUMBER): Quote my exact line or story flaw, explain the psychological projection error (e.g., wishful thinking, superficial action, preachiness/moralizing, passive hero, incomplete problem resolution, negative/escapist reaction, or mismatch with the picture/situation).
3. WHAT I COULD DO BETTER (CONCRETE REWRITES): For every weak TAT story, every weak/skipped/cliché WAT sentence, and every incomplete SRT reaction, write a crisp, realistic, officer-like replacement that fits a natural 21–24 year old candidate.`
  );

  if (payload.tat && payload.tat.slides.length > 0) {
    const tatList = payload.tat.slides
      .map((s) =>
        s.isBlankSlide
          ? `- Slide ${s.stepNumber} (Picture #12 — BLANK SLIDE): Candidate imagines own picture and writes Story #12.`
          : `- Slide ${s.stepNumber} (Picture #${s.canonicalNumber} | Stimulus ID: ${s.stimulusId}): Refer to Slide ${s.stepNumber} in the attached Question Booklet PDF.`
      )
      .join("\n");

    sections.push(
      `====================================================================
ATTEMPTED TAT PICTURES (${payload.tat.setTitle} — ${payload.tat.slides.length} Slides)
====================================================================
${tatList}

REQUIRED TAT PIN-POINT BREAKDOWN (For EVERY Story #1 to #${payload.tat.slides.length}):
- [Story #]:
  • Stimulus Alignment: Did my story accurately perceive the age, gender, setting, and mood of the picture in the Question Booklet PDF?
  • What Was Good: Specific actions, resourcefulness, or realistic planning shown by my central character.
  • Pin-Point Flaws: Point out exact sentences where I used artificial designations, unrealistic miracles, preaching, or lacked concrete "How" (execution steps).
  • Improved SSB Story Rewrite (100–120 words): A practical, natural story for this exact picture showing clear Past -> Present Action -> Constructive Outcome.`
    );
  }

  if (payload.wat && payload.wat.words.length > 0) {
    const watList = payload.wat.words
      .map((w) => `${w.number}. ${w.word}`)
      .join("\n");

    sections.push(
      `====================================================================
ATTEMPTED WAT WORDS (${payload.wat.setTitle} — ${payload.wat.words.length} Words, 15s each)
====================================================================
${watList}

REQUIRED WAT PIN-POINT BREAKDOWN (Audit ALL ${payload.wat.words.length} Words by exact number):
- Summary Count: How many out of ${payload.wat.words.length} were Attempted vs Skipped, and how many were Natural/Observational vs Preachy/Cliché/Negative.
- What Was Good: List my best WAT sentences by Word # and explain what OLQ they reflect.
- Pin-Point Corrections Table (For EVERY weak, negative, passive, "should/must" preaching, idiom, or skipped word):
  • Word #[N] ([Word]): My Handwritten Sentence -> Why it is weak -> 2 Crisp Officer-Like Alternatives.`
    );
  }

  if (payload.srt && payload.srt.questions.length > 0) {
    const srtList = payload.srt.questions
      .map((q) => `SRT #${q.number}: ${q.situation}`)
      .join("\n");

    sections.push(
      `====================================================================
ATTEMPTED SRT SITUATIONS (${payload.srt.setTitle} — ${payload.srt.questions.length} Situations)
====================================================================
${srtList}

REQUIRED SRT PIN-POINT BREAKDOWN (Audit EVERY attempted SRT by exact number):
- Speed & Completion Check: How many situations did I complete, and were there any skipped numbers in between?
- What Was Good: Highlight SRT numbers where my action was immediate, practical, prioritized life/duty first, and fully resolved the problem.
- Pin-Point Corrections (For EVERY incomplete, evasive, aggressive, or unrealistic reaction):
  • SRT #[N]: Situation -> My Handwritten Reaction -> Exact flaw (e.g., forgot first-aid, didn't report, left main goal unfinished) -> Ideal 1-Line Complete SSB Reaction.`
    );
  }

  if (payload.sdt && payload.sdt.prompts.length > 0) {
    const sdtList = payload.sdt.prompts
      .map((p) => `SDT #${p.number} (${p.title}): ${p.question}`)
      .join("\n");

    sections.push(
      `====================================================================
ATTEMPTED SDT QUESTIONS (5 Self-Description Prompts — 15 Minutes)
====================================================================
${sdtList}

REQUIRED SDT PIN-POINT BREAKDOWN:
- Consistency Cross-Check: Compare my SDT claims with my actual subconscious projections in TAT/WAT/SRT. Point out any contradictions.
- Paragraph-by-Paragraph Critique (1. Parents, 2. Teachers/Employers, 3. Friends, 4. Self, 5. Qualities to Develop): What sounded genuine vs braggy or generic, and how to refine each paragraph.`
    );
  }

  sections.push(
    `====================================================================
FINAL DELIVERABLE:
End your review with:
1. A 15-OLQ Factor-by-Factor Scorecard (Rating each Factor out of 10 based strictly on my written evidence).
2. My Top 3 Psychological Blind Spots to fix immediately.
3. A concrete 7-Day Daily Practice Drill before my upcoming SSB interview.`
  );

  return sections.join("\n\n");
}

export interface AttemptedBookletDataInput {
  title: string;
  subtitle?: string;
  startedAtIso?: string;
  completedAtIso?: string;
  modeLabel?: string;
  testType?: AttemptedBookletPayload["testType"];
  tat?: {
    setLabel?: string;
    setTitle?: string;
    observationSeconds?: number;
    writingSeconds?: number;
    slides: Array<{
      number?: number;
      stepNumber?: number;
      canonicalNumber?: number;
      stimulusId: string;
      assetPath: string;
      isBlankSlide: boolean;
      description?: string;
      sourceHint?: string;
      typedDraft?: string;
    }>;
  };
  wat?: {
    setLabel?: string;
    setTitle?: string;
    board?: string;
    boardName?: string;
    wordDurationSeconds?: number;
    pageTurnSeconds?: number;
    words: WatWordItem[];
  };
  srt?: {
    setLabel?: string;
    setTitle?: string;
    isRealtimeRandom?: boolean;
    totalDurationSeconds?: number;
    questions: SrtQuestionItem[];
  };
  sdt?: {
    prompts: SdtPromptItem[];
    durationSeconds: number;
  };
}

export function normalizeAttemptedBookletPayload(
  input: AttemptedBookletPayload | AttemptedBookletDataInput
): AttemptedBookletPayload {
  const hasMultiple =
    [input.tat, input.wat, input.srt, input.sdt].filter(Boolean).length > 1;
  const inferredTestType: AttemptedBookletPayload["testType"] =
    input.testType ??
    (hasMultiple
      ? "FULL_PSYCH_BATTERY"
      : input.tat
      ? "TAT"
      : input.wat
      ? "WAT"
      : input.srt
      ? "SRT"
      : "SDT");

  const rawData = input as AttemptedBookletDataInput;

  return {
    testType: inferredTestType,
    title: input.title,
    completedAtIso:
      input.completedAtIso ??
      rawData.startedAtIso ??
      new Date().toISOString(),
    modeLabel:
      input.modeLabel ??
      rawData.subtitle ??
      "Real SSB Psychology Hall Simulation",
    tat: rawData.tat
      ? {
          setTitle:
            rawData.tat.setTitle ?? rawData.tat.setLabel ?? "TAT Set",
          observationSeconds: rawData.tat.observationSeconds ?? 30,
          writingSeconds: rawData.tat.writingSeconds ?? 240,
          slides: rawData.tat.slides.map((s, idx) => ({
            stepNumber: s.stepNumber ?? s.number ?? idx + 1,
            canonicalNumber: s.canonicalNumber ?? s.number ?? idx + 1,
            stimulusId: s.stimulusId,
            isBlankSlide: s.isBlankSlide,
            assetPath: s.assetPath,
            sourceHint: s.sourceHint ?? s.description,
            typedDraft: s.typedDraft,
          })),
        }
      : undefined,
    wat: rawData.wat
      ? {
          setTitle:
            rawData.wat.setTitle ?? rawData.wat.setLabel ?? "WAT Set",
          boardName:
            rawData.wat.boardName ??
            rawData.wat.board ??
            rawData.wat.setLabel ??
            "SSB Board",
          wordDurationSeconds: rawData.wat.wordDurationSeconds ?? 15,
          pageTurnSeconds: rawData.wat.pageTurnSeconds ?? 30,
          words: rawData.wat.words,
        }
      : undefined,
    srt: rawData.srt
      ? {
          setTitle:
            rawData.srt.setTitle ?? rawData.srt.setLabel ?? "SRT Set",
          totalDurationSeconds:
            rawData.srt.totalDurationSeconds ??
            rawData.srt.questions.length * 30,
          questions: rawData.srt.questions,
        }
      : undefined,
    sdt: rawData.sdt
      ? {
          durationSeconds: rawData.sdt.durationSeconds ?? 900,
          prompts: rawData.sdt.prompts,
        }
      : undefined,
  };
}

export const generateQuestionBookletPdfBytes = (
  input: AttemptedBookletPayload | AttemptedBookletDataInput
) => generateAttemptedBookletPdfBytes(normalizeAttemptedBookletPayload(input));

export const buildAiEvaluationPrompt = (
  input: AttemptedBookletPayload | AttemptedBookletDataInput
) => buildPinPointAiEvaluationPrompt(normalizeAttemptedBookletPayload(input));

/**
 * Helper to construct a TAT-only AttemptedBookletPayload from a completed TAT session.
 */
export function buildTatBookletPayload(params: {
  setTitle: string;
  completedAtIso: string;
  modeLabel: string;
  observationSeconds: number;
  writingSeconds: number;
  slides: ResolvedStimulus[];
  canonicalNumbersMap?: Record<string, number>;
  storiesByStimulusId?: Record<string, string>;
}): AttemptedBookletPayload {
  return {
    testType: "TAT",
    title: `TAT — ${params.setTitle}`,
    completedAtIso: params.completedAtIso,
    modeLabel: params.modeLabel,
    tat: {
      setTitle: params.setTitle,
      observationSeconds: params.observationSeconds,
      writingSeconds: params.writingSeconds,
      slides: params.slides.map((stim, idx) => {
        const canonicalNumber =
          params.canonicalNumbersMap?.[stim.stimulusId] ??
          stim.canonicalNumber ??
          idx + 1;
        const isBlankSlide =
          canonicalNumber === 12 || stim.stimulusId.endsWith("-blank");
        return {
          stepNumber: idx + 1,
          canonicalNumber,
          stimulusId: stim.stimulusId,
          isBlankSlide,
          assetPath: stim.setFolderAssetPath ?? stim.assetPath,
          sourceHint: stim.sourceFilename,
          typedDraft: params.storiesByStimulusId?.[stim.stimulusId],
        };
      }),
    },
  };
}
