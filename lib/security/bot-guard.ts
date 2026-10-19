/**
 * SSB.COGIFY.ME — Bot-Proofing, Asset Server URL Resolution & Storage Protection
 *
 * Provides:
 * 1. Configurable external/edge server URL resolution (`NEXT_PUBLIC_ASSET_SERVER_URL`)
 *    for PDFs and stimulus sets so the main repository and bundle stay lightweight.
 * 2. Time-bound signed client challenge tokens (`st`) to prevent automated bots,
 *    scrapers, or direct CLI scripts from bulk-downloading sets or booklets.
 * 3. Obfuscated LocalStorage / SessionStorage payload encoding so inspecting
 *    DevTools -> Application -> Storage does not expose raw JSON stimulus sets.
 * 4. Automated scraper User-Agent & rate-limit guards for API routes.
 */

const STORAGE_PREFIX = "cgf_v2_";
const CIPHER_SALT = "ssb.cogify.me::stage2-psych-shield::2026";

const BLOCKED_BOT_PATTERNS = [
  /curl\//i,
  /wget\//i,
  /python-requests/i,
  /python-urllib/i,
  /aiohttp/i,
  /httpx/i,
  /scrapy/i,
  /httrack/i,
  /teleport/i,
  /webcopier/i,
  /offline explorer/i,
  / site-sucker/i,
  /sitesucker/i,
  /gobuster/i,
  /dirbuster/i,
  /nikto/i,
  /sqlmap/i,
  /nmap/i,
  /masscan/i,
  /zgrab/i,
  /bytespider/i,
  /ccbot/i,
  /gptbot/i,
  /chatgpt-user/i,
  /claudebot/i,
  /anthropic-ai/i,
  /petalbot/i,
  /mj12bot/i,
  /dotbot/i,
  /semrushbot/i,
  /ahrefsbot/i,
  /blexbot/i,
  /dataforseobot/i,
];

/**
 * Checks whether a request User-Agent belongs to a known scraper, bulk downloader,
 * or unauthorized AI crawler.
 */
export function isBlockedScraperUserAgent(userAgent: string | null | undefined): boolean {
  if (!userAgent || userAgent.trim().length < 6) {
    return true;
  }
  return BLOCKED_BOT_PATTERNS.some((pattern) => pattern.test(userAgent));
}

/**
 * Generates a lightweight, deterministic time-windowed token (valid for ~30 minutes)
 * used to authenticate legitimate browser requests to protected asset endpoints.
 */
export function generateClientAccessToken(scope = "asset", timestampMs = Date.now()): string {
  const windowBucket = Math.floor(timestampMs / (15 * 60 * 1000)); // 15-min bucket
  const raw = `${CIPHER_SALT}:${scope}:${windowBucket}`;
  let hash = 2166136261;
  for (let i = 0; i < raw.length; i++) {
    hash ^= raw.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const unsigned = (hash >>> 0).toString(36);
  return `${windowBucket.toString(36)}.${unsigned}`;
}

/**
 * Verifies a client access token across the current and previous 15-minute window.
 */
export function verifyClientAccessToken(
  token: string | null | undefined,
  scope = "asset",
  nowMs = Date.now()
): boolean {
  if (!token || typeof token !== "string") return false;
  const currentToken = generateClientAccessToken(scope, nowMs);
  const previousToken = generateClientAccessToken(scope, nowMs - 15 * 60 * 1000);
  const nextToken = generateClientAccessToken(scope, nowMs + 15 * 60 * 1000);
  return token === currentToken || token === previousToken || token === nextToken;
}

/**
 * Resolves a stimulus or PDF asset path directly from local static storage.
 * All stimulus sets and booklets are kept locally inside the project.
 */
export function resolveProtectedAssetUrl(assetPath: string, includeToken = false): string {
  if (!assetPath) return "";
  const normalizedPath = assetPath.startsWith("/") ? assetPath : `/${assetPath}`;
  if (!includeToken) return normalizedPath;

  const token = generateClientAccessToken("stimulus");
  const separator = normalizedPath.includes("?") ? "&" : "?";
  return `${normalizedPath}${separator}st=${encodeURIComponent(token)}`;
}

/**
 * Returns the local URL for downloading the official 16-page SSB Psychology Booklet PDF.
 */
export function getProtectedBookletUrl(): string {
  return "/Phys-Test-Booklet.pdf";
}

/**
 * Obfuscates structured data before persisting to localStorage / sessionStorage
 * so inspecting DevTools -> Application -> Storage does not expose plain-text sets.
 */
export function encodeProtectedStorage<T>(value: T): string {
  try {
    const json = JSON.stringify(value);
    const bytes = new TextEncoder().encode(json);
    const keyBytes = new TextEncoder().encode(CIPHER_SALT);
    const xored = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) {
      xored[i] = bytes[i]! ^ keyBytes[i % keyBytes.length]!;
    }
    let binary = "";
    for (let i = 0; i < xored.length; i++) {
      binary += String.fromCharCode(xored[i]!);
    }
    const base64 =
      typeof btoa === "function"
        ? btoa(binary)
        : Buffer.from(binary, "binary").toString("base64");
    return `${STORAGE_PREFIX}${base64}`;
  } catch {
    return JSON.stringify(value);
  }
}

/**
 * Decodes an obfuscated storage string back into its typed object.
 * Seamlessly falls back to `JSON.parse` if legacy plain-JSON data is encountered.
 */
export function decodeProtectedStorage<T>(raw: string | null | undefined): T | null {
  if (!raw) return null;
  try {
    if (!raw.startsWith(STORAGE_PREFIX)) {
      return JSON.parse(raw) as T;
    }
    const base64 = raw.slice(STORAGE_PREFIX.length);
    const binary =
      typeof atob === "function"
        ? atob(base64)
        : Buffer.from(base64, "base64").toString("binary");
    const keyBytes = new TextEncoder().encode(CIPHER_SALT);
    const out = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      out[i] = binary.charCodeAt(i) ^ keyBytes[i % keyBytes.length]!;
    }
    const decodedJson = new TextDecoder().decode(out);
    return JSON.parse(decodedJson) as T;
  } catch {
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }
}
