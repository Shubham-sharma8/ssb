/**
 * Assembles `.cloudflare-assets/` from the Next.js build output (`distDir`) and `public/`
 * so `npx wrangler deploy` can deploy both the Worker entry-point and static assets seamlessly.
 */

import fs from "fs";
import path from "path";

const rootDir = process.cwd();
const distDirName = process.env.NEXT_DIST_DIR || ".next";
const nextDir = path.join(rootDir, distDirName);
const publicDir = path.join(rootDir, "public");
const outDir = path.join(rootDir, ".cloudflare-assets");

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

function copyAppServerOutput(srcAppDir, destRootDir, relPath = "") {
  if (!fs.existsSync(srcAppDir)) return;
  for (const entry of fs.readdirSync(srcAppDir)) {
    const fullSrc = path.join(srcAppDir, entry);
    const relEntry = relPath ? path.join(relPath, entry) : entry;
    const stat = fs.statSync(fullSrc);

    if (stat.isDirectory()) {
      copyAppServerOutput(fullSrc, destRootDir, relEntry);
      continue;
    }

    if (entry === "_not-found.html") {
      const dest404 = path.join(destRootDir, "404.html");
      fs.mkdirSync(path.dirname(dest404), { recursive: true });
      fs.copyFileSync(fullSrc, dest404);
      continue;
    }

    if (entry.endsWith(".html") || entry.endsWith(".rsc")) {
      const destFile = path.join(destRootDir, relEntry);
      fs.mkdirSync(path.dirname(destFile), { recursive: true });
      fs.copyFileSync(fullSrc, destFile);
      continue;
    }

    // Prerendered metadata route bodies (e.g. robots.txt.body, sitemap.xml.body)
    if (entry.endsWith(".body")) {
      const cleanName = relEntry.slice(0, -".body".length);
      const destFile = path.join(destRootDir, cleanName);
      fs.mkdirSync(path.dirname(destFile), { recursive: true });
      fs.copyFileSync(fullSrc, destFile);

      if (cleanName === "robots.txt" || cleanName === "sitemap.xml") {
        const publicDest = path.join(publicDir, cleanName);
        fs.copyFileSync(fullSrc, publicDest);
      }
    }
  }
}

function escapeXml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function cleanStimulusDescription(rawDesc) {
  const trimmed = String(rawDesc ?? "").trim();
  if (!trimmed) {
    return "Black-and-white ambiguity-calibrated scene for SSB PPDT and TAT story writing practice";
  }
  const cleaned = trimmed
    .replace(/\s*[—-]\s*duplicate of\s+[a-z0-9-]+/i, "")
    .replace(
      /^(?:duplicate\s+)?(?:very\s+dark\s+|dark\s+textured\s+|dark\s+|faint\s+|high-contrast\s+|low-quality\s+)?(?:sketch\s+|halftone\s+|photographic\s+|photocopy\s+)?scan\s+of\s+/i,
      ""
    )
    .replace(
      /\s+with\s+overlaid\s+worksheet\s+text(?:\s*\([^)]*\))?/i,
      " in group discussion scene"
    )
    .trim();
  if (!cleaned) {
    return "Black-and-white ambiguity-calibrated scene for SSB PPDT and TAT story writing practice";
  }
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

function buildRichImageSitemapXml() {
  const baseUrl = "https://ssb.cogify.me";
  const lastMod = "2026-11-06T00:00:00.000Z";
  const catalogPath = path.join(rootDir, "data", "tat-catalog.json");
  const catalog = JSON.parse(fs.readFileSync(catalogPath, "utf8"));

  const stimById = new Map(
    (catalog.stimuli ?? []).map((stim) => [stim.stimulusId, stim])
  );

  const leadSetImages = [];
  const allLibraryImages = [
    {
      loc: `${baseUrl}/og-image.webp`,
      title: "SSB Stage-2 Psychology, GTO & Interview Practice Studio — ssb.cogify.me",
      caption:
        "Free Indian Armed Forces Services Selection Board (SSB/AFSB/NSB) Stage-1 PPDT & Stage-2 TAT, WAT, SRT, SDT, GTO and Personal Interview Simulator by COGIFY.",
    },
    {
      loc: `${baseUrl}/og-image.png`,
      title: "SSB TAT & PPDT Picture Library (10 Sets • 120 Slides) — ssb.cogify.me",
      caption:
        "Complete 10-set SSB Thematic Apperception Test (TAT) and Picture Perception & Description Test (PPDT) image library with 30s observation and 4m story timers.",
    },
  ];

  const seenImageLocs = new Set(allLibraryImages.map((img) => img.loc));

  for (const set of catalog.sets ?? []) {
    const setTitle = set.title;
    const folder = set.folderPath || `/tat-sets/${set.id.toUpperCase()}`;

    (set.stimulusIds ?? []).forEach((stimId, idx) => {
      const stim = stimById.get(stimId);
      if (!stim) return;
      const num = idx + 1;
      const cleanDesc = cleanStimulusDescription(stim.description);
      const setImgLoc = `${baseUrl}${stim.setFolderAssetPath || `${folder}/${String(num).padStart(2, "0")}.webp`}`;
      const imgEntry = {
        loc: setImgLoc,
        title: `${setTitle} Picture ${num}: ${cleanDesc} — SSB PPDT & TAT Picture | ssb.cogify.me`,
        caption: `SSB TAT & PPDT Picture — ${setTitle} Picture ${num}: ${cleanDesc} (Stage-1 Screening PPDT & Stage-2 Psychology TAT Stimulus ${stim.stimulusId}).`,
      };

      if (num === 1) {
        leadSetImages.push(imgEntry);
      }
      if (!seenImageLocs.has(imgEntry.loc)) {
        seenImageLocs.add(imgEntry.loc);
        allLibraryImages.push(imgEntry);
      }

      if (stim.assetPath) {
        const assetLoc = `${baseUrl}${stim.assetPath}`;
        if (!seenImageLocs.has(assetLoc)) {
          seenImageLocs.add(assetLoc);
          allLibraryImages.push({
            loc: assetLoc,
            title: `${setTitle} Picture ${num} (${stim.stimulusId}): ${cleanDesc} — SSB TAT & PPDT Stimulus`,
            caption: `High-contrast WebP stimulus scan (${stim.stimulusId}) for Indian Armed Forces SSB Stage-1 PPDT and Stage-2 TAT (${setTitle} Slide ${num}: ${cleanDesc}).`,
          });
        }
      }
    });

    const blankLoc = `${baseUrl}${folder}/12-blank.webp`;
    if (!seenImageLocs.has(blankLoc)) {
      seenImageLocs.add(blankLoc);
      allLibraryImages.push({
        loc: blankLoc,
        title: `${setTitle} Slide 12 (12th Blank Slide) — SSB TAT Self-Projected Story Writing | ssb.cogify.me`,
        caption: `Official 12th Blank Slide for ${setTitle} in the SSB Stage-2 Thematic Apperception Test (11 Pictures + 1 Blank Slide).`,
      });
    }
  }

  for (const stim of catalog.stimuli ?? []) {
    if (!stim.assetPath) continue;
    const assetLoc = `${baseUrl}${stim.assetPath}`;
    if (!seenImageLocs.has(assetLoc)) {
      seenImageLocs.add(assetLoc);
      const cleanDesc = cleanStimulusDescription(stim.description);
      allLibraryImages.push({
        loc: assetLoc,
        title: `SSB PPDT & TAT Archive Picture (${stim.stimulusId}): ${cleanDesc} | ssb.cogify.me`,
        caption: `SSB Stage-1 Screening PPDT & Stage-2 TAT Stimulus (${stim.stimulusId}): ${cleanDesc}.`,
      });
    }
  }

  const pages = [
    {
      loc: baseUrl,
      changefreq: "daily",
      priority: "1.0",
      images: [
        allLibraryImages[0],
        allLibraryImages[1],
        {
          loc: `${baseUrl}/brand/logo.png`,
          title: "COGIFY — SSB Stage-2 Test Practice Platform Logo",
          caption: "Official logo of ssb.cogify.me by COGIFY Technologies.",
        },
        ...leadSetImages,
      ],
    },
    {
      loc: `${baseUrl}/full-test`,
      changefreq: "weekly",
      priority: "0.95",
      images: [allLibraryImages[1], ...leadSetImages.slice(0, 3)],
    },
    {
      loc: `${baseUrl}/tat`,
      changefreq: "weekly",
      priority: "0.95",
      images: [allLibraryImages[1], ...leadSetImages],
    },
    {
      loc: `${baseUrl}/wat`,
      changefreq: "weekly",
      priority: "0.95",
      images: [allLibraryImages[1]],
    },
    {
      loc: `${baseUrl}/srt`,
      changefreq: "weekly",
      priority: "0.95",
      images: [allLibraryImages[1]],
    },
    {
      loc: `${baseUrl}/sdt`,
      changefreq: "weekly",
      priority: "0.9",
      images: [allLibraryImages[1]],
    },
    {
      loc: `${baseUrl}/gto`,
      changefreq: "weekly",
      priority: "0.95",
      images: [allLibraryImages[1]],
    },
    {
      loc: `${baseUrl}/interview`,
      changefreq: "weekly",
      priority: "0.95",
      images: [allLibraryImages[1]],
    },
    {
      loc: `${baseUrl}/library`,
      changefreq: "weekly",
      priority: "0.9",
      images: allLibraryImages,
    },
    {
      loc: `${baseUrl}/about`,
      changefreq: "monthly",
      priority: "0.85",
      images: [
        allLibraryImages[1],
        {
          loc: `${baseUrl}/brand/logo_white.png`,
          title: "Shubham Sharma & COGIFY Defence Psychology Research Team",
          caption: "COGIFY Defence Assessment Wing emblem on ssb.cogify.me.",
        },
      ],
    },
  ];

  const urlNodes = pages
    .map((p) => {
      const imgNodes = (p.images ?? [])
        .map(
          (img) => `    <image:image>
      <image:loc>${escapeXml(img.loc)}</image:loc>
      <image:title>${escapeXml(img.title)}</image:title>
      <image:caption>${escapeXml(img.caption)}</image:caption>
    </image:image>`
        )
        .join("\n");
      return `  <url>
    <loc>${escapeXml(p.loc)}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
${imgNodes}
  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urlNodes}
</urlset>
`;
}

function main() {
  if (fs.existsSync(outDir)) {
    fs.rmSync(outDir, { recursive: true, force: true });
  }
  fs.mkdirSync(outDir, { recursive: true });

  // 1. Copy public/ static assets
  copyRecursive(publicDir, outDir);

  // 2. Copy .next/static -> .cloudflare-assets/_next/static
  const nextStaticDir = path.join(nextDir, "static");
  const outNextStaticDir = path.join(outDir, "_next", "static");
  copyRecursive(nextStaticDir, outNextStaticDir);

  // 3. Copy prerendered HTML, RSC payloads, robots.txt, and sitemap.xml from .next/server/app
  const serverAppDir = path.join(nextDir, "server", "app");
  copyAppServerOutput(serverAppDir, outDir);

  // 4. Generate rich Google Image Sitemap (xmlns:image) with <image:title> and <image:caption> for all TAT & PPDT images
  const richSitemapXml = buildRichImageSitemapXml();
  fs.writeFileSync(path.join(outDir, "sitemap.xml"), richSitemapXml, "utf8");
  fs.writeFileSync(path.join(publicDir, "sitemap.xml"), richSitemapXml, "utf8");

  console.log(
    "✓ Prepared Cloudflare static assets & Google Image Sitemap in ./.cloudflare-assets for wrangler deploy"
  );
}

main();
