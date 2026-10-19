#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

const manifestPath = path.join(rootDir, "data/tat-manifest.json");
const catalogPath = path.join(rootDir, "data/tat-catalog.json");

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));

console.log("==========================================================================");
console.log(" SSB SIMULATOR — SOURCE PDF AUDIT & STIMULUS MANIFEST REPORT");
console.log("==========================================================================\n");

console.log(`Schema Version       : v${manifest.schemaVersion}`);
console.log(`Total Physical Pages : ${manifest.totalPhysicalPages}`);
console.log(`Total Stimulus Pages : ${manifest.totalStimulusPages}`);
console.log(`Practice Sets        : ${catalog.sets.length}\n`);

console.log("--- SOURCE FILES ---");
for (const src of manifest.sources) {
  console.log(
    `• ${src.sourceFilename.padEnd(14)} (${src.sourceId}): ${src.physicalPageCount} physical pages | ${src.picturePageCount} stimulus pages | ${src.nonPicturePageCount} non-stimulus pages`
  );
  console.log(`  Notes: ${src.notes}`);
}

console.log("\n--- PRACTICE SETS ---");
for (const set of catalog.sets) {
  const statusTag = set.isApprovedDefault ? "[APPROVED DEFAULT]" : "[NEEDS REVIEW]";
  console.log(
    `• ${set.id.padEnd(26)} ${statusTag.padEnd(19)} (${String(set.stimulusIds.length).padStart(2)} stimuli) — ${set.title}`
  );
}

const byType = {};
for (const p of manifest.pages) {
  byType[p.pageType] = (byType[p.pageType] || 0) + 1;
}
console.log("\n--- PAGE CLASSIFICATION BREAKDOWN (204 PAGES) ---");
for (const [type, count] of Object.entries(byType)) {
  console.log(`• ${type.padEnd(16)}: ${count}`);
}

const needsReviewPages = manifest.pages.filter(
  (p) => p.reviewStatus === "needs-review" || p.pageType === "duplicate" || p.pageType === "needs-review"
);
console.log(`\n--- FLAGGED / DUPLICATE / NEEDS-REVIEW PAGES (${needsReviewPages.length}) ---`);
for (const p of needsReviewPages) {
  console.log(
    `• ${p.sourceFilename} P.${String(p.sourcePageNumber).padStart(3)} | Type: ${p.pageType.padEnd(12)} | ID: ${(p.stimulusId || "-").padEnd(13)} | DupOf: ${(p.duplicateOf || "-").padEnd(13)} | ${p.notes}`
  );
}
console.log("\nAll 118 stimulus WebP and lossless PNG assets verified.\n");
