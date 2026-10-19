/**
 * Generates all production SEO visual assets for ssb.cogify.me:
 * - public/icon.svg
 * - public/favicon-16x16.png
 * - public/favicon-32x32.png
 * - public/favicon-48x48.png
 * - public/favicon.ico (multi-size 16x16, 32x32, 48x48 ICO binary)
 * - public/apple-touch-icon.png (180x180)
 * - public/icon-192.png (192x192)
 * - public/icon-512.png (512x512)
 * - public/og-image.svg (1200x630)
 * - public/og-image.png (1200x630 raster PNG for WhatsApp, LinkedIn, Facebook, Discord, Slack)
 * - public/twitter-image.png (1200x630 raster PNG for X / Twitter summary_large_image)
 */

import fs from "fs";
import path from "path";
import { chromium } from "@playwright/test";

const publicDir = path.join(process.cwd(), "public");

const iconSvgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512" fill="none">
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#09090b" />
      <stop offset="50%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#09090b" />
    </linearGradient>
    <linearGradient id="shieldStroke" x1="64" y1="40" x2="448" y2="472" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="50%" stop-color="#6366f1" />
      <stop offset="100%" stop-color="#10b981" />
    </linearGradient>
    <linearGradient id="shieldFill" x1="96" y1="64" x2="416" y2="448" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.22" />
      <stop offset="50%" stop-color="#6366f1" stop-opacity="0.16" />
      <stop offset="100%" stop-color="#10b981" stop-opacity="0.20" />
    </linearGradient>
    <radialGradient id="coreGlow" cx="50%" cy="48%" r="42%">
      <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.35" />
      <stop offset="100%" stop-color="#38bdf8" stop-opacity="0" />
    </radialGradient>
  </defs>

  <!-- Rounded App Icon Base -->
  <rect width="512" height="512" rx="112" fill="url(#bgGrad)" />
  <rect x="12" y="12" width="488" height="488" rx="100" stroke="#27272a" stroke-width="6" />
  <circle cx="256" cy="248" r="196" fill="url(#coreGlow)" />

  <!-- Tactical SSB Shield -->
  <path
    d="M256 52L424 120V244C424 354 352 430 256 460C160 430 88 354 88 244V120L256 52Z"
    fill="url(#shieldFill)"
    stroke="url(#shieldStroke)"
    stroke-width="18"
    stroke-linejoin="round"
  />

  <!-- Inner Telemetry Ring -->
  <circle
    cx="256"
    cy="244"
    r="92"
    stroke="#e2e8f0"
    stroke-opacity="0.85"
    stroke-width="10"
    stroke-dasharray="24 16"
  />
  <circle
    cx="256"
    cy="244"
    r="54"
    fill="#38bdf8"
    fill-opacity="0.2"
    stroke="#38bdf8"
    stroke-width="10"
  />

  <!-- Crosshair Axis Ticks -->
  <path
    d="M256 116V154M256 334V372M128 244H166M346 244H384"
    stroke="#94a3b8"
    stroke-width="12"
    stroke-linecap="round"
  />

  <!-- North-Star / Compass Needle -->
  <polygon points="256,188 274,244 256,300 238,244" fill="#f8fafc" />
  <circle cx="256" cy="244" r="10" fill="#10b981" />
</svg>
`;

const ogSvgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#09090b" />
      <stop offset="50%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#09090b" />
    </linearGradient>
    <linearGradient id="accentGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="50%" stop-color="#818cf8" />
      <stop offset="100%" stop-color="#34d399" />
    </linearGradient>
    <linearGradient id="shieldGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="50%" stop-color="#6366f1" />
      <stop offset="100%" stop-color="#10b981" />
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)" />
  <rect x="36" y="36" width="1128" height="558" rx="28" fill="none" stroke="#27272a" stroke-width="2" />
  <rect x="76" y="74" width="370" height="42" rx="21" fill="#18181b" stroke="#3f3f46" stroke-width="1.5" />
  <circle cx="102" cy="95" r="6" fill="#10b981" />
  <text x="120" y="101" fill="#e4e4e7" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="15" font-weight="700" letter-spacing="1.8">
    SSB.COGIFY.ME · BY COGIFY.ME
  </text>

  <text x="76" y="192" fill="#fafafa" font-family="system-ui, -apple-system, BlinkMacSystemFont, sans-serif" font-size="58" font-weight="800">
    India&apos;s #1 SSB Stage-2
  </text>
  <text x="76" y="262" fill="url(#accentGrad)" font-family="system-ui, -apple-system, BlinkMacSystemFont, sans-serif" font-size="54" font-weight="800">
    Test Practice &amp; Hall Simulator
  </text>
  <text x="76" y="320" fill="#a1a1aa" font-family="system-ui, -apple-system, BlinkMacSystemFont, sans-serif" font-size="23" font-weight="500">
    Psychology (TAT · WAT · SRT · SDT) · GTO Tasks &amp; Lecturette · Personal Interview CIQs
  </text>

  <g transform="translate(76, 368)">
    <rect x="0" y="0" width="252" height="118" rx="16" fill="#18181b" stroke="#10b981" stroke-opacity="0.45" stroke-width="1.5" />
    <text x="22" y="36" fill="#34d399" font-family="ui-monospace, monospace" font-size="13" font-weight="700" letter-spacing="1.2">01 · PSYCHOLOGY BATTERY</text>
    <text x="22" y="68" fill="#fafafa" font-family="system-ui, sans-serif" font-size="22" font-weight="700">TAT · WAT · SRT · SDT</text>
    <text x="22" y="96" fill="#a1a1aa" font-family="system-ui, sans-serif" font-size="14" font-weight="500">10 Sets · 15s Beep · Hall Mode</text>

    <rect x="272" y="0" width="252" height="118" rx="16" fill="#18181b" stroke="#38bdf8" stroke-opacity="0.45" stroke-width="1.5" />
    <text x="294" y="36" fill="#38bdf8" font-family="ui-monospace, monospace" font-size="13" font-weight="700" letter-spacing="1.2">02 · GTO OFFICER TASKS</text>
    <text x="294" y="68" fill="#fafafa" font-family="system-ui, sans-serif" font-size="22" font-weight="700">9 Tasks + Lecturette</text>
    <text x="294" y="96" fill="#a1a1aa" font-family="system-ui, sans-serif" font-size="14" font-weight="500">3m Speech + 30s Warning Beep</text>

    <rect x="544" y="0" width="252" height="118" rx="16" fill="#18181b" stroke="#818cf8" stroke-opacity="0.45" stroke-width="1.5" />
    <text x="566" y="36" fill="#818cf8" font-family="ui-monospace, monospace" font-size="13" font-weight="700" letter-spacing="1.2">03 · INTERVIEW HALL</text>
    <text x="566" y="68" fill="#fafafa" font-family="system-ui, sans-serif" font-size="22" font-weight="700">CIQ Rapid-Fire &amp; PIQ</text>
    <text x="566" y="96" fill="#a1a1aa" font-family="system-ui, sans-serif" font-size="14" font-weight="500">IO Prompts + OLQ Mapping</text>

    <rect x="816" y="0" width="232" height="118" rx="16" fill="#fafafa" />
    <text x="838" y="36" fill="#059669" font-family="ui-monospace, monospace" font-size="13" font-weight="800" letter-spacing="1.2">04 · POST-TEST REVIEW</text>
    <text x="838" y="68" fill="#09090b" font-family="system-ui, sans-serif" font-size="21" font-weight="800">Booklet PDF + AI</text>
    <text x="838" y="96" fill="#3f3f46" font-family="system-ui, sans-serif" font-size="14" font-weight="600">Pin-Point OLQ Evaluation</text>
  </g>

  <text x="76" y="546" fill="#71717a" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="15" font-weight="600" letter-spacing="1">
    HTTPS://SSB.COGIFY.ME · ARMY (SSB) · NAVY (NSB) · AIR FORCE (AFSB) · 100% FREE &amp; OFFLINE-READY
  </text>
</svg>
`;

/**
 * Builds a standard Windows/Web `.ico` file from an array of PNG buffers.
 * Modern browsers and crawlers natively support PNG-compressed frames inside ICO containers.
 */
function buildIcoFromPngs(entries) {
  const count = entries.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  let offset = headerSize + count * dirEntrySize;

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // Reserved = 0
  header.writeUInt16LE(1, 2); // Type = 1 (ICO)
  header.writeUInt16LE(count, 4); // Image count

  const dirEntries = [];
  const imageBuffers = [];

  for (const { size, buffer } of entries) {
    const entry = Buffer.alloc(dirEntrySize);
    entry.writeUInt8(size >= 256 ? 0 : size, 0); // Width
    entry.writeUInt8(size >= 256 ? 0 : size, 1); // Height
    entry.writeUInt8(0, 2); // Color palette
    entry.writeUInt8(0, 3); // Reserved
    entry.writeUInt16LE(1, 4); // Color planes
    entry.writeUInt16LE(32, 6); // Bits per pixel
    entry.writeUInt32LE(buffer.length, 8); // Image byte size
    entry.writeUInt32LE(offset, 12); // Offset in file

    dirEntries.push(entry);
    imageBuffers.push(buffer);
    offset += buffer.length;
  }

  return Buffer.concat([header, ...dirEntries, ...imageBuffers]);
}

const socialCardHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 1200px;
    height: 630px;
    overflow: hidden;
    background: #09090b;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #fafafa;
  }
  .canvas {
    position: relative;
    width: 1200px;
    height: 630px;
    padding: 42px 52px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background:
      radial-gradient(circle at 86% 20%, rgba(56, 189, 248, 0.18), transparent 42%),
      radial-gradient(circle at 18% 82%, rgba(16, 185, 129, 0.15), transparent 45%),
      radial-gradient(circle at 55% 45%, rgba(99, 102, 241, 0.12), transparent 50%),
      linear-gradient(135deg, #09090b 0%, #0f172a 52%, #09090b 100%);
  }
  .grid-overlay {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px);
    background-size: 36px 36px;
    pointer-events: none;
  }
  .frame {
    position: absolute;
    inset: 24px;
    border-radius: 26px;
    border: 1.5px solid rgba(255, 255, 255, 0.1);
    pointer-events: none;
  }
  .top-row {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 18px 0 18px;
  }
  .brand-pill {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    background: rgba(24, 24, 27, 0.9);
    border: 1px solid rgba(63, 63, 70, 0.85);
    border-radius: 999px;
    padding: 8px 18px 8px 12px;
  }
  .brand-dot {
    width: 10px;
    height: 10px;
    border-radius: 999px;
    background: #10b981;
    box-shadow: 0 0 12px #10b981;
  }
  .brand-text {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.14em;
    color: #e4e4e7;
  }
  .stage-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(16, 185, 129, 0.12);
    border: 1px solid rgba(16, 185, 129, 0.38);
    color: #6ee7b7;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.1em;
    padding: 8px 16px;
    border-radius: 999px;
  }
  .hero {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 18px;
    gap: 28px;
  }
  .hero-left {
    max-width: 820px;
  }
  .eyebrow {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.16em;
    color: #38bdf8;
    text-transform: uppercase;
    margin-bottom: 10px;
  }
  h1 {
    font-size: 58px;
    line-height: 1.08;
    font-weight: 800;
    letter-spacing: -0.025em;
    color: #ffffff;
    margin-bottom: 14px;
  }
  .gradient-span {
    background: linear-gradient(90deg, #38bdf8 0%, #818cf8 50%, #34d399 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .subtitle {
    font-size: 21px;
    line-height: 1.45;
    color: #a1a1aa;
    font-weight: 500;
  }
  .subtitle strong {
    color: #f4f4f5;
    font-weight: 600;
  }
  .emblem-box {
    width: 176px;
    height: 176px;
    border-radius: 36px;
    background: rgba(24, 24, 27, 0.85);
    border: 1.5px solid rgba(255, 255, 255, 0.12);
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.55);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .cards {
    position: relative;
    z-index: 2;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    padding: 0 18px;
  }
  .card {
    background: rgba(24, 24, 27, 0.88);
    border-radius: 18px;
    padding: 18px 20px;
    border: 1.5px solid rgba(63, 63, 70, 0.7);
  }
  .card.emerald { border-color: rgba(16, 185, 129, 0.45); }
  .card.sky { border-color: rgba(56, 189, 248, 0.45); }
  .card.indigo { border-color: rgba(129, 140, 248, 0.45); }
  .card.light {
    background: linear-gradient(135deg, #ffffff 0%, #f4f4f5 100%);
    border-color: #e4e4e7;
  }
  .card-tag {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.1em;
    margin-bottom: 8px;
  }
  .card.emerald .card-tag { color: #34d399; }
  .card.sky .card-tag { color: #38bdf8; }
  .card.indigo .card-tag { color: #818cf8; }
  .card.light .card-tag { color: #059669; }
  .card-title {
    font-size: 20px;
    font-weight: 800;
    color: #fafafa;
    margin-bottom: 5px;
    letter-spacing: -0.01em;
  }
  .card.light .card-title { color: #09090b; }
  .card-desc {
    font-size: 13px;
    font-weight: 500;
    color: #a1a1aa;
  }
  .card.light .card-desc { color: #3f3f46; font-weight: 600; }
  .footer-row {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 18px 6px 18px;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 13px;
    font-weight: 600;
    color: #71717a;
    letter-spacing: 0.06em;
  }
  .footer-highlight {
    color: #d4d4d8;
  }
</style>
</head>
<body>
  <div class="canvas">
    <div class="grid-overlay"></div>
    <div class="frame"></div>

    <div class="top-row">
      <div class="brand-pill">
        <span class="brand-dot"></span>
        <span class="brand-text">SSB.COGIFY.ME · BY COGIFY.ME</span>
      </div>
      <div class="stage-badge">
        STAGE-II SELECTION BOARD SIMULATOR · ZERO-TIMER HALL MODE
      </div>
    </div>

    <div class="hero">
      <div class="hero-left">
        <div class="eyebrow">INDIAN ARMED FORCES OFFICER SELECTION PREP · ARMY · NAVY · AIR FORCE</div>
        <h1>
          India’s #1 SSB Stage-2<br />
          <span class="gradient-span">Test Practice Platform</span>
        </h1>
        <p class="subtitle">
          Authentic <strong>Psychological Battery (TAT, WAT, SRT, SDT)</strong>, <strong>GTO Officer Tasks &amp; Lecturette Timer</strong>, and <strong>Personal Interview CIQ Simulator</strong> with Question Booklet PDF &amp; Pin-Point AI Evaluation.
        </p>
      </div>
      <div class="emblem-box">
        ${iconSvgContent.replace('width="512" height="512"', 'width="136" height="136"')}
      </div>
    </div>

    <div class="cards">
      <div class="card emerald">
        <div class="card-tag">01 · PSYCHOLOGY HALL</div>
        <div class="card-title">TAT · WAT · SRT · SDT</div>
        <div class="card-desc">10 Sets · 15s Beep · Hall Mode</div>
      </div>
      <div class="card sky">
        <div class="card-tag">02 · GTO TASKS &amp; TIMER</div>
        <div class="card-title">9 Tasks + Lecturette</div>
        <div class="card-desc">3m Speech · 30s Warning Beep</div>
      </div>
      <div class="card indigo">
        <div class="card-tag">03 · INTERVIEW HALL</div>
        <div class="card-title">CIQ Rapid-Fire &amp; PIQ</div>
        <div class="card-desc">Timed IO Sequences · 15 OLQs</div>
      </div>
      <div class="card light">
        <div class="card-tag">04 · POST-TEST EXPORT</div>
        <div class="card-title">Booklet PDF + AI</div>
        <div class="card-desc">Pin-Point OLQ Evaluation Prompt</div>
      </div>
    </div>

    <div class="footer-row">
      <span><span class="footer-highlight">https://ssb.cogify.me</span> · NDA · CDS · AFCAT · SSC TECH · TES</span>
      <span>100% FREE · OFFLINE-READY · BUILT BY COGIFY.ME</span>
    </div>
  </div>
</body>
</html>`;

async function main() {
  fs.mkdirSync(publicDir, { recursive: true });

  // 1. Write vector SVGs
  fs.writeFileSync(path.join(publicDir, "icon.svg"), iconSvgContent, "utf8");
  fs.writeFileSync(path.join(publicDir, "og-image.svg"), ogSvgContent, "utf8");
  console.log("✓ Wrote public/icon.svg and public/og-image.svg");

  const browser = await chromium.launch({ channel: "chrome" });

  try {
    // 2. Render square app icons at multiple resolutions
    const iconSizes = [
      { size: 16, name: "favicon-16x16.png" },
      { size: 32, name: "favicon-32x32.png" },
      { size: 48, name: "favicon-48x48.png" },
      { size: 180, name: "apple-touch-icon.png" },
      { size: 192, name: "icon-192.png" },
      { size: 512, name: "icon-512.png" },
    ];

    const icoBuffers = [];

    for (const { size, name } of iconSizes) {
      const page = await browser.newPage({
        viewport: { width: size, height: size },
        deviceScaleFactor: 1,
      });
      await page.setContent(
        `<!DOCTYPE html><html><head><style>*{margin:0;padding:0;}body{width:${size}px;height:${size}px;overflow:hidden;background:transparent;display:flex;align-items:center;justify-content:center;}svg{width:100%;height:100%;display:block;}</style></head><body>${iconSvgContent}</body></html>`
      );
      const outPath = path.join(publicDir, name);
      const buf = await page.screenshot({
        path: outPath,
        type: "png",
        omitBackground: true,
      });
      if (size === 16 || size === 32 || size === 48) {
        icoBuffers.push({ size, buffer: buf });
      }
      await page.close();
      console.log(`✓ Generated public/${name} (${size}x${size}, ${buf.length} bytes)`);
    }

    // 3. Build multi-resolution favicon.ico (16x16, 32x32, 48x48)
    const icoBuffer = buildIcoFromPngs(icoBuffers);
    fs.writeFileSync(path.join(publicDir, "favicon.ico"), icoBuffer);
    console.log(`✓ Generated public/favicon.ico (16x16, 32x32, 48x48 — ${icoBuffer.length} bytes)`);

    // 4. Render 1200x630 OpenGraph & Twitter link-sharing preview PNGs & JPG
    const ogPage = await browser.newPage({
      viewport: { width: 1200, height: 630 },
      deviceScaleFactor: 1,
    });
    await ogPage.setContent(socialCardHtml, { waitUntil: "networkidle" });
    const ogPngBuffer = await ogPage.screenshot({
      path: path.join(publicDir, "og-image.png"),
      type: "png",
    });
    fs.writeFileSync(path.join(publicDir, "twitter-image.png"), ogPngBuffer);
    const ogJpgBuffer = await ogPage.screenshot({
      path: path.join(publicDir, "og-image.jpg"),
      type: "jpeg",
      quality: 92,
    });
    await ogPage.close();
    console.log(
      `✓ Generated public/og-image.png (${ogPngBuffer.length} bytes), public/twitter-image.png, and public/og-image.jpg (${ogJpgBuffer.length} bytes)`
    );
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
