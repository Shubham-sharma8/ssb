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

  console.log(
    "✓ Prepared Cloudflare static assets in ./.cloudflare-assets for wrangler deploy"
  );
}

main();
