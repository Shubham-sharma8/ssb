import { describe, expect, it } from "vitest";
import fs from "fs";
import path from "path";
import {
  buildSessionSequence,
  getAllCatalogStimuli,
  getMergedManifestPages,
  getPracticeSets,
  getRawCatalog,
  getRawManifest,
  getSlidesForSet,
  getStimuliForSet,
} from "@/lib/tat/catalog";

describe("Source PDF Inventory, Manifest, Set Folders (SET 1 – SET 10), and Stimulus Catalog Fidelity", () => {
  const manifest = getRawManifest();
  const catalog = getRawCatalog();
  const projectRoot = path.resolve(__dirname, "../..");

  it("inventories all three authoritative source PDFs and the SSB Psychology Test Booklet", () => {
    expect(manifest.sources).toHaveLength(3);

    const byId = Object.fromEntries(
      manifest.sources.map((s) => [s.sourceId, s])
    );
    expect(byId["tat-3"]?.sourceFilename).toBe("TAT 3.pdf");
    expect(byId["tat-3"]?.physicalPageCount).toBe(22);

    expect(byId["tat-4"]?.sourceFilename).toBe("TAT 4.pdf");
    expect(byId["tat-4"]?.physicalPageCount).toBe(28);

    expect(byId["tat-pdf"]?.sourceFilename).toBe("tat_pdf.pdf");
    expect(byId["tat-pdf"]?.physicalPageCount).toBe(154);

    for (const src of manifest.sources) {
      const pdfPath = path.join(projectRoot, src.sourceFilename);
      expect(fs.existsSync(pdfPath)).toBe(true);
    }

    // Verify the downloadable SSB Psychology Test Booklet PDF exists in public/
    const bookletPath = path.join(projectRoot, "public", "Phys-Test-Booklet.pdf");
    expect(fs.existsSync(bookletPath)).toBe(true);
    expect(fs.statSync(bookletPath).size).toBeGreaterThan(10_000);
  });

  it("contains an audit record for every single physical page (204 total)", () => {
    expect(manifest.totalPhysicalPages).toBe(204);
    expect(manifest.pages).toHaveLength(204);

    for (const src of manifest.sources) {
      const pagesForSource = manifest.pages.filter(
        (p) => p.sourceId === src.sourceId
      );
      expect(pagesForSource).toHaveLength(src.physicalPageCount);

      const pageNums = pagesForSource.map((p) => p.sourcePageNumber);
      const expected = Array.from(
        { length: src.physicalPageCount },
        (_, i) => i + 1
      );
      expect(pageNums).toEqual(expected);
    }
  });

  it("divides the PDFs into SET 1 through SET 10 with 11 chronological pictures + 1 blank slide per set saved in /public/tat-sets/", () => {
    const sets = getPracticeSets();
    expect(sets).toHaveLength(10);
    expect(sets.map((s) => s.title)).toEqual([
      "SET 1",
      "SET 2",
      "SET 3",
      "SET 4",
      "SET 5",
      "SET 6",
      "SET 7",
      "SET 8",
      "SET 9",
      "SET 10",
    ]);

    // Verify TAT 3.pdf (22 pictures) -> SET 1 (p.1..11) and SET 2 (p.12..22)
    const set1Stimuli = getStimuliForSet("set-1");
    const set2Stimuli = getStimuliForSet("set-2");
    expect(set1Stimuli.map((s) => s.sourcePageNumber)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11,
    ]);
    expect(set2Stimuli.map((s) => s.sourcePageNumber)).toEqual([
      12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
    ]);

    // Verify TAT 4.pdf (22 pictures + 6 blank pages excluded) -> SET 3 and SET 4
    const set3Stimuli = getStimuliForSet("set-3");
    const set4Stimuli = getStimuliForSet("set-4");
    expect(set3Stimuli.map((s) => s.sourcePageNumber)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11,
    ]);
    expect(set4Stimuli.map((s) => s.sourcePageNumber)).toEqual([
      12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
    ]);

    // Verify every set has 11 pictures + 1 blank slide (12 slides total) and exists on disk in public/tat-sets/SET-N
    for (let i = 1; i <= 10; i++) {
      const setId = `set-${i}`;
      const folderName = `SET-${i}`;
      const slides = getSlidesForSet(setId);
      expect(slides).toHaveLength(12);
      expect(slides.slice(0, 11).map((s) => s.canonicalNumber)).toEqual([
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11,
      ]);
      expect(slides[11]?.canonicalNumber).toBe(12);

      // Verify ascending physical page order within each set's 11 pictures
      const pageNums = slides.slice(0, 11).map((s) => s.sourcePageNumber);
      const sortedPageNums = [...pageNums].sort((a, b) => a - b);
      expect(pageNums).toEqual(sortedPageNums);

      // Verify files in public/tat-sets/SET-N/01.webp .. 11.webp + 12-blank.webp
      const setDir = path.join(projectRoot, "public", "tat-sets", folderName);
      expect(fs.existsSync(setDir)).toBe(true);
      for (let picIdx = 1; picIdx <= 11; picIdx++) {
        const file = path.join(
          setDir,
          `${String(picIdx).padStart(2, "0")}.webp`
        );
        expect(fs.existsSync(file)).toBe(true);
        expect(fs.statSync(file).size).toBeGreaterThan(500);
      }
      const blankFile = path.join(setDir, "12-blank.webp");
      expect(fs.existsSync(blankFile)).toBe(true);
    }
  });

  it("never presents BLANK, STOP WRITING, title, or spacer pages as picture stimuli", () => {
    const tatPdfPages = manifest.pages.filter((p) => p.sourceId === "tat-pdf");
    const byPage = Object.fromEntries(
      tatPdfPages.map((p) => [p.sourcePageNumber, p])
    );

    expect(byPage[1]?.pageType).toBe("title");
    expect(byPage[24]?.pageType).toBe("blank");
    expect(byPage[26]?.pageType).toBe("stop-writing");
    expect(byPage[27]?.pageType).toBe("title");
    expect(byPage[50]?.pageType).toBe("blank");
    expect(byPage[52]?.pageType).toBe("stop-writing");
    expect(byPage[53]?.pageType).toBe("title");
    expect(byPage[76]?.pageType).toBe("blank");
    expect(byPage[78]?.pageType).toBe("stop-writing");
    expect(byPage[104]?.pageType).toBe("title");
    expect(byPage[127]?.pageType).toBe("blank");
    expect(byPage[129]?.pageType).toBe("stop-writing");

    const nonStimulusTypes = new Set([
      "title",
      "blank",
      "instruction",
      "stop-writing",
    ]);
    for (const stim of catalog.stimuli) {
      expect(nonStimulusTypes.has(stim.pageType)).toBe(false);
    }

    for (const set of getPracticeSets()) {
      const stimuli = getStimuliForSet(set.id);
      for (const s of stimuli) {
        expect(nonStimulusTypes.has(s.pageType)).toBe(false);
      }
    }
  });

  it("preserves original chronological sequence and keeps canonical picture numbers independent of physical page numbers", () => {
    const set5Stimuli = getStimuliForSet("set-5");
    expect(set5Stimuli).toHaveLength(11);

    // Physical pages in SET 5 (TAT 14) are 2, 4, 6, 8, ..., 22 while canonical numbers are 1..11
    expect(set5Stimuli.map((s) => s.sourcePageNumber)).toEqual([
      2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22,
    ]);
    expect(set5Stimuli.map((s) => s.canonicalNumber)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11,
    ]);

    const page8Stim = set5Stimuli.find((s) => s.sourcePageNumber === 8);
    expect(page8Stim?.canonicalNumber).toBe(4);

    // Physical page 28 in SET 6 (TAT 13) is canonical Picture 1 of SET 6
    const set6Stimuli = getStimuliForSet("set-6");
    expect(set6Stimuli[0]?.sourcePageNumber).toBe(28);
    expect(set6Stimuli[0]?.canonicalNumber).toBe(1);
  });

  it("approves all real picture stimuli across all sets (including SET 9 and SET 10) while retaining duplicate metadata", () => {
    const pages = getMergedManifestPages();
    const p131 = pages.find(
      (p) => p.sourceId === "tat-pdf" && p.sourcePageNumber === 131
    );
    const p133 = pages.find(
      (p) => p.sourceId === "tat-pdf" && p.sourcePageNumber === 133
    );
    const p135 = pages.find(
      (p) => p.sourceId === "tat-pdf" && p.sourcePageNumber === 135
    );

    expect(p131?.pageType).toBe("picture");
    expect(p131?.reviewStatus).toBe("approved");
    expect(p131?.duplicateOf).toBe("tat-pdf-p098");
    expect(p133?.duplicateOf).toBe("tat-pdf-p100");
    expect(p135?.duplicateOf).toBe("tat-pdf-p102");

    // Verify SET 9 and SET 10 return all 11 approved picture stimuli
    expect(getStimuliForSet("set-9")).toHaveLength(11);
    expect(getStimuliForSet("set-10")).toHaveLength(11);

    const tat3p1 = catalog.stimuli.find((s) => s.stimulusId === "tat-3-p001");
    expect(tat3p1?.crossSourceDuplicates).toContain("tat-pdf-p036");
  });

  it("verifies every stimulus points to existing optimized WebP and original PNG assets on disk", () => {
    const allStimuli = getAllCatalogStimuli();
    expect(allStimuli.length).toBe(118);

    for (const stim of allStimuli) {
      expect(stim.assetPath).toMatch(/^\/tat-assets\/.+\.webp$/);
      const webpDiskPath = path.join(projectRoot, "public", stim.assetPath);
      expect(fs.existsSync(webpDiskPath)).toBe(true);
      expect(fs.statSync(webpDiskPath).size).toBeGreaterThan(500);

      const origDiskPath = path.join(projectRoot, stim.originalAssetPath);
      expect(fs.existsSync(origDiskPath)).toBe(true);
      expect(fs.statSync(origDiskPath).size).toBeGreaterThan(1000);
    }
  });

  it("randomizes session order for Pictures 1–11 while keeping the 12th Blank Slide at the end and preserving canonical picture numbers", () => {
    let seed = 42;
    const rng = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    const built = buildSessionSequence({
      setId: "set-5",
      selectionMode: "random",
      includeCompleted: true,
      rng,
    });

    // 11 pictures + 1 blank slide = 12 slides
    expect(built.orderedStimuli).toHaveLength(12);
    const order = built.orderedStimuli.map((s) => s.canonicalNumber);
    expect(order.slice(0, 11)).not.toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    // 12th slide remains at the end
    expect(order[11]).toBe(12);

    // Every stimulus still retains its exact original canonical number from the set
    const stimP8 = built.orderedStimuli.find(
      (s) => s.stimulusId === "tat-pdf-p008"
    );
    expect(stimP8?.canonicalNumber).toBe(4);
    expect(built.canonicalNumbersMap["tat-pdf-p008"]).toBe(4);
  });

  it("provides authentic WAT sets for SSB Allahabad, SSB Bangalore (30+30), SSB Jalandhar, SSB Bhopal, 1 AFSB Dehradun (20+40), practice sets, and a live Random WAT set", async () => {
    const {
      getWatSets,
      resolveWatWordsForSet,
      getWatTotalWordsCount,
    } = await import("@/lib/psych/catalog");

    expect(getWatTotalWordsCount()).toBeGreaterThanOrEqual(300);

    const watSets = getWatSets();
    expect(watSets.length).toBe(10); // 9 predefined + 1 random

    const allahabad = watSets.find((s) => s.setId === "wat-allahabad");
    expect(allahabad?.originalBoardWordCount).toBe(60);
    expect(allahabad?.wordCount).toBe(60);
    expect(allahabad?.words[0]?.word).toBe("Courage");

    const bangalore = watSets.find((s) => s.setId === "wat-bangalore");
    expect(bangalore?.originalBoardWordCount).toBe(30);
    expect(bangalore?.supplementedPoolCount).toBe(30);
    expect(bangalore?.wordCount).toBe(60);

    const jalandhar = watSets.find((s) => s.setId === "wat-jalandhar");
    expect(jalandhar?.originalBoardWordCount).toBe(60);
    expect(jalandhar?.wordCount).toBe(60);

    const bhopal = watSets.find((s) => s.setId === "wat-bhopal");
    expect(bhopal?.originalBoardWordCount).toBe(60);
    expect(bhopal?.wordCount).toBe(60);

    const dehradun = watSets.find((s) => s.setId === "wat-dehradun");
    expect(dehradun?.originalBoardWordCount).toBe(20);
    expect(dehradun?.supplementedPoolCount).toBe(40);
    expect(dehradun?.wordCount).toBe(60);

    const randomRun1 = resolveWatWordsForSet("wat-random", 60);
    const randomRun2 = resolveWatWordsForSet("wat-random", 60);
    expect(randomRun1.words).toHaveLength(60);
    expect(randomRun2.words).toHaveLength(60);
    expect(randomRun1.words.map((w) => w.word)).not.toEqual(
      randomRun2.words.map((w) => w.word)
    );
  });

  it("provides predefined SRT sets (SRT SET 1–4) plus a real-time Random SRT set drawing from 230 situations", async () => {
    const {
      getSrtSets,
      resolveSrtQuestionsForSet,
      getSrtTotalQuestionsCount,
      getSdtPrompts,
      getSdtDefaultDurationMs,
    } = await import("@/lib/psych/catalog");

    expect(getSrtTotalQuestionsCount()).toBe(230);

    const srtSets = getSrtSets();
    expect(srtSets.length).toBe(5); // 1 real-time random + 4 predefined
    expect(srtSets[0]?.setId).toBe("srt-random");
    expect(srtSets[0]?.isRandom).toBe(true);

    const r1 = resolveSrtQuestionsForSet("srt-random", 60);
    const r2 = resolveSrtQuestionsForSet("srt-random", 60);
    expect(r1.questions).toHaveLength(60);
    expect(r2.questions).toHaveLength(60);
    expect(r1.questions.map((q) => q.originalNumber)).not.toEqual(
      r2.questions.map((q) => q.originalNumber)
    );

    const predefined1 = resolveSrtQuestionsForSet("srt-set-1", 60);
    expect(predefined1.questions).toHaveLength(60);

    const sdtPrompts = getSdtPrompts();
    expect(sdtPrompts).toHaveLength(5);
    expect(getSdtDefaultDurationMs()).toBe(15 * 60 * 1000);
  });

  it("generates a valid binary Question Booklet PDF (%PDF-1.4) and Pin-Point AI Psychologist Prompt for attempted tests", async () => {
    const {
      generateQuestionBookletPdfBytes,
      buildAiEvaluationPrompt,
    } = await import("@/lib/psych/export-booklet");
    const { resolveWatWordsForSet, resolveSrtQuestionsForSet, getSdtPrompts } =
      await import("@/lib/psych/catalog");

    const watResolved = resolveWatWordsForSet("wat-jalandhar", 5);
    const srtResolved = resolveSrtQuestionsForSet("srt-set-1", 5);
    const sdtPrompts = getSdtPrompts();

    const payload = {
      title: "Complete SSB Question Booklet",
      tat: {
        setLabel: "SET 1",
        slides: [
          {
            number: 1,
            stimulusId: "tat-3-p001",
            assetPath: "/tat-sets/SET-1/01.webp",
            isBlankSlide: false,
          },
        ],
      },
      wat: {
        setLabel: watResolved.set.label,
        board: watResolved.set.board,
        words: watResolved.words,
      },
      srt: {
        setLabel: srtResolved.set.label,
        questions: srtResolved.questions,
      },
      sdt: {
        prompts: sdtPrompts,
        durationSeconds: 900,
      },
    };

    const pdfBytes = generateQuestionBookletPdfBytes(payload);
    expect(pdfBytes.byteLength).toBeGreaterThan(800);
    const pdfText = new TextDecoder().decode(pdfBytes);
    expect(pdfText.startsWith("%PDF-1.4")).toBe(true);
    expect(pdfText).toContain("SSB.COGIFY.ME");
    expect(pdfText).toContain("SECTION 1: THEMATIC APPERCEPTION TEST");
    expect(pdfText).toContain("SECTION 2: WORD ASSOCIATION TEST");
    expect(pdfText).toContain("SECTION 3: SITUATION REACTION TEST");
    expect(pdfText).toContain("SECTION 4: SELF-DESCRIPTION TEST");

    const prompt = buildAiEvaluationPrompt(payload);
    expect(prompt).toContain("DIPR");
    expect(prompt).toContain("15 Officer Like Qualities");
    expect(prompt).toContain("PIN-POINT");
    expect(prompt).toContain(watResolved.words[0]!.word);
    expect(prompt).toContain(srtResolved.questions[0]!.situation);
  });
});
