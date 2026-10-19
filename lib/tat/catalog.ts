import rawCatalog from "@/data/tat-catalog.json";
import rawManifest from "@/data/tat-manifest.json";
import type {
  ManifestOverrideRecord,
  ManifestPageRecord,
  PracticeSetRecord,
  SelectionMode,
  StimulusCompletionStatus,
  StimulusRecord,
  TatCatalogData,
  TatManifestData,
} from "@/lib/validation/schemas";

const catalogData = rawCatalog as unknown as TatCatalogData;
const manifestData = rawManifest as unknown as TatManifestData;

export interface ResolvedStimulus extends StimulusRecord {
  /**
   * User-facing 1-based canonical picture number within the selected practice set or source sequence.
   * Always independent of physical PDF page numbers and never altered by session randomization.
   */
  canonicalNumber: number;
}

export function getRawManifest(): TatManifestData {
  return manifestData;
}

export function getRawCatalog(): TatCatalogData {
  return catalogData;
}

export function makePageOverrideKey(
  sourceId: string,
  sourcePageNumber: number
): string {
  return `${sourceId}:${sourcePageNumber}`;
}

/**
 * Merges developer review overrides onto the physical page manifest without modifying source files.
 */
export function getMergedManifestPages(
  overrides: ManifestOverrideRecord[] = []
): ManifestPageRecord[] {
  const overrideMap = new Map<string, ManifestOverrideRecord>();
  for (const ov of overrides) {
    overrideMap.set(ov.pageKey, ov);
  }

  return manifestData.pages.map((page) => {
    const key = makePageOverrideKey(page.sourceId, page.sourcePageNumber);
    const ov = overrideMap.get(key);
    if (!ov) return { ...page };
    return {
      ...page,
      pageType: ov.pageType,
      reviewStatus: ov.reviewStatus,
      sectionLabel: ov.sectionLabel,
      notes: ov.notes,
    };
  });
}

const LEGACY_SET_ID_ALIASES: Record<string, string> = {
  "set-tat-3": "set-1",
  "set-tat-4": "set-3",
  "set-tat-14": "set-5",
  "set-tat-13": "set-6",
  "set-tat-10": "set-7",
  "set-tat-15": "set-9",
};

/**
 * Returns all practice sets defined in the catalog (SET 1 .. SET 10).
 */
export function getPracticeSets(): PracticeSetRecord[] {
  return catalogData.sets;
}

export function getPracticeSetById(
  setId: string
): PracticeSetRecord | undefined {
  const direct = catalogData.sets.find((s) => s.id === setId);
  if (direct) return direct;
  const mappedId = LEGACY_SET_ID_ALIASES[setId];
  if (mappedId) {
    return catalogData.sets.find((s) => s.id === mappedId);
  }
  return undefined;
}

export function makeBlankSlideForSet(set: PracticeSetRecord): ResolvedStimulus {
  const folder = set.folderPath ?? `/tat-sets/${set.id.toUpperCase()}`;
  const blankPath = `${folder}/12-blank.webp`;
  return {
    sourceId: set.sourceId,
    sourceFilename: set.sourceFilename,
    sourcePageNumber: 0,
    pageType: "picture",
    sectionLabel: set.title,
    sourceSequence: 12,
    sectionSequence: 12,
    stimulusId: `${set.id}-blank`,
    assetPath: blankPath,
    setFolderAssetPath: blankPath,
    assignedSetId: set.id,
    assignedSetTitle: set.title,
    setSequenceNumber: 12,
    isBlankSlide: true,
    originalAssetPath: "public/tat-assets/blank-slide.webp",
    width: 1200,
    height: 900,
    phash: "ffffffffffffffff",
    duplicateOf: null,
    crossSourceDuplicates: [],
    reviewStatus: "approved",
    confidence: "high",
    hasScanArtifacts: false,
    ocrText: "BLANK SLIDE",
    description: `12th Blank Slide for ${set.title} — Write your own story in the '12 Blank Story' section of your SSB Psychology Booklet.`,
    notes: "Standard 12th Blank Slide in real SSB TAT sequence (11 Pictures + 1 Blank Slide).",
    canonicalNumber: 12,
  };
}

/**
 * Returns a map of stimulusId -> StimulusRecord (with any developer overrides applied).
 */
export function getStimulusMap(
  overrides: ManifestOverrideRecord[] = []
): Map<string, StimulusRecord> {
  const overrideMap = new Map<string, ManifestOverrideRecord>();
  for (const ov of overrides) {
    overrideMap.set(ov.pageKey, ov);
  }

  const map = new Map<string, StimulusRecord>();
  for (const stim of catalogData.stimuli) {
    const key = makePageOverrideKey(stim.sourceId, stim.sourcePageNumber);
    const ov = overrideMap.get(key);
    if (ov) {
      map.set(stim.stimulusId, {
        ...stim,
        pageType: ov.pageType,
        reviewStatus: ov.reviewStatus,
        sectionLabel: ov.sectionLabel,
        notes: ov.notes,
      });
    } else {
      map.set(stim.stimulusId, { ...stim });
    }
  }

  // Also register the 12th Blank Slide for every set
  for (const set of catalogData.sets) {
    const blank = makeBlankSlideForSet(set);
    map.set(blank.stimulusId, blank);
  }

  return map;
}

export function getStimulusById(
  stimulusId: string,
  overrides: ManifestOverrideRecord[] = []
): StimulusRecord | undefined {
  return getStimulusMap(overrides).get(stimulusId);
}

/**
 * Resolves the 11 picture stimuli for a given practice set in their authoritative chronological source order.
 * Assigns canonical 1-based picture numbers (Picture 1..11) independent of physical PDF page numbers.
 */
export function getStimuliForSet(
  setId: string,
  overrides: ManifestOverrideRecord[] = []
): ResolvedStimulus[] {
  const set = getPracticeSetById(setId);
  if (!set) return [];

  const stimMap = getStimulusMap(overrides);
  const resolved: ResolvedStimulus[] = [];

  set.stimulusIds.forEach((id, index) => {
    const stim = stimMap.get(id);
    if (!stim) return;
    if (
      stim.pageType === "title" ||
      stim.pageType === "blank" ||
      stim.pageType === "instruction" ||
      stim.pageType === "stop-writing" ||
      stim.reviewStatus === "rejected"
    ) {
      return;
    }
    resolved.push({
      ...stim,
      canonicalNumber: index + 1,
    });
  });

  return resolved;
}

/**
 * Resolves all 12 slides for a TAT Set: 11 Pictures (1..11) + 1 Blank Slide (12).
 */
export function getSlidesForSet(
  setId: string,
  overrides: ManifestOverrideRecord[] = []
): ResolvedStimulus[] {
  const set = getPracticeSetById(setId);
  if (!set) return [];
  const pictures = getStimuliForSet(setId, overrides);
  if (set.hasBlankSlide !== false) {
    return [...pictures, makeBlankSlideForSet(set)];
  }
  return pictures;
}

/**
 * Returns all confirmed picture stimuli across all sources in their original source sequence.
 * Preserves chronological order per source without alphabetical or similarity sorting.
 */
export function getAllCatalogStimuli(
  overrides: ManifestOverrideRecord[] = []
): ResolvedStimulus[] {
  const stimMap = getStimulusMap(overrides);
  const result: ResolvedStimulus[] = [];

  for (const stim of catalogData.stimuli) {
    const merged = stimMap.get(stim.stimulusId) ?? stim;
    if (
      merged.pageType === "title" ||
      merged.pageType === "blank" ||
      merged.pageType === "instruction" ||
      merged.pageType === "stop-writing" ||
      merged.reviewStatus === "rejected"
    ) {
      continue;
    }
    result.push({
      ...merged,
      canonicalNumber:
        merged.setSequenceNumber ||
        merged.sectionSequence ||
        merged.sourceSequence,
    });
  }
  return result;
}

export interface BuildSessionSequenceOptions {
  setId: string;
  selectionMode: SelectionMode;
  selectedStimulusIds?: string[];
  includeCompleted: boolean;
  includeBlankSlide?: boolean;
  progressStatusByStimulusId?: Record<string, StimulusCompletionStatus>;
  overrides?: ManifestOverrideRecord[];
  rng?: () => number;
}

export interface BuiltSessionSequence {
  set: PracticeSetRecord;
  orderedStimuli: ResolvedStimulus[];
  stimulusIds: string[];
  canonicalNumbersMap: Record<string, number>;
}

/**
 * Builds the exact sequence of stimuli for a new TAT session.
 * - For SET 1..SET 10, includes the 11 Pictures + 12th Blank Slide (12 slides total) when includeBlankSlide is enabled.
 * - Preserves canonical picture numbers from the set even when filtered or randomized.
 * - Keeps the 12th Blank Slide at the end of the set even if Pictures 1..11 are randomized.
 */
export function buildSessionSequence(
  options: BuildSessionSequenceOptions
): BuiltSessionSequence {
  const {
    setId,
    selectionMode,
    selectedStimulusIds,
    includeCompleted,
    includeBlankSlide,
    progressStatusByStimulusId = {},
    overrides = [],
    rng = Math.random,
  } = options;

  const set = getPracticeSetById(setId);
  if (!set) {
    throw new Error(`Unknown practice set ID: ${setId}`);
  }

  const isLegacySetCall = Boolean(LEGACY_SET_ID_ALIASES[setId]);
  const shouldIncludeBlank =
    includeBlankSlide !== undefined ? includeBlankSlide : !isLegacySetCall;

  const allSetStimuli = shouldIncludeBlank
    ? getSlidesForSet(set.id, overrides)
    : getStimuliForSet(set.id, overrides);

  const canonicalNumbersMap: Record<string, number> = {};
  for (const stim of allSetStimuli) {
    canonicalNumbersMap[stim.stimulusId] = stim.canonicalNumber;
  }

  let eligible = [...allSetStimuli];

  // If user selected specific pictures, keep only those (preserving chronological set order initially)
  if (
    selectionMode === "selected" ||
    (selectedStimulusIds && selectedStimulusIds.length > 0)
  ) {
    const selectedSet = new Set(selectedStimulusIds ?? []);
    eligible = eligible.filter((s) => selectedSet.has(s.stimulusId));
  }

  // Filter out completed/reviewed stimuli if includeCompleted is false (and not explicitly hand-picked in selected mode)
  if (!includeCompleted && selectionMode !== "selected") {
    eligible = eligible.filter((s) => {
      if (s.isBlankSlide) return true;
      const status = progressStatusByStimulusId[s.stimulusId] ?? "not_attempted";
      return status !== "completed" && status !== "reviewed";
    });
  }

  // Randomize order for this session only if selectionMode === "random"
  // Keep the 12th Blank Slide at the end of the sequence just like real SSB TAT
  if (selectionMode === "random" && eligible.length > 1) {
    const blankSlides = eligible.filter((s) => s.isBlankSlide);
    const pictureSlides = eligible.filter((s) => !s.isBlankSlide);
    for (let i = pictureSlides.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      const temp = pictureSlides[i];
      pictureSlides[i] = pictureSlides[j];
      pictureSlides[j] = temp;
    }
    eligible = [...pictureSlides, ...blankSlides];
  }

  return {
    set,
    orderedStimuli: eligible,
    stimulusIds: eligible.map((s) => s.stimulusId),
    canonicalNumbersMap,
  };
}

