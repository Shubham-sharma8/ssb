/**
 * Cloudflare Worker Entry-Point for ssb.cogify.me
 *
 * Works with Cloudflare Workers Static Assets (`[assets]` in `wrangler.toml`)
 * and `npx wrangler deploy`:
 * 1. Enforces bot/scraper protection on `/api/booklet` and streams `/Phys-Test-Booklet.pdf`.
 * 2. Serves the prerendered client shell `/history/placeholder` for dynamic
 *    `/history/:sessionId` routes so IndexedDB session review works seamlessly.
 * 3. Delegates all static pages and assets to `env.ASSETS`.
 */

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

function isBlockedScraperUserAgent(userAgent) {
  if (!userAgent || userAgent.trim().length < 6) {
    return true;
  }
  return BLOCKED_BOT_PATTERNS.some((pattern) => pattern.test(userAgent));
}

function generateClientAccessToken(scope = "asset", timestampMs = Date.now()) {
  const windowBucket = Math.floor(timestampMs / (15 * 60 * 1000));
  const raw = `${CIPHER_SALT}:${scope}:${windowBucket}`;
  let hash = 2166136261;
  for (let i = 0; i < raw.length; i++) {
    hash ^= raw.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const unsigned = (hash >>> 0).toString(36);
  return `${windowBucket.toString(36)}.${unsigned}`;
}

function verifyClientAccessToken(token, scope = "asset", nowMs = Date.now()) {
  if (!token || typeof token !== "string") return false;
  const currentToken = generateClientAccessToken(scope, nowMs);
  const previousToken = generateClientAccessToken(scope, nowMs - 15 * 60 * 1000);
  const nextToken = generateClientAccessToken(scope, nowMs + 15 * 60 * 1000);
  return (
    token === currentToken || token === previousToken || token === nextToken
  );
}

const worker = {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 1. Bot-protected /api/booklet endpoint
    if (url.pathname === "/api/booklet") {
      const userAgent = request.headers.get("user-agent") ?? "";
      if (isBlockedScraperUserAgent(userAgent)) {
        return new Response(
          "Forbidden: Automated scraping is not permitted.",
          {
            status: 403,
            headers: {
              "X-Robots-Tag": "noindex, noarchive, nosnippet",
              "Cache-Control": "no-store",
            },
          }
        );
      }

      const token = url.searchParams.get("st");
      const referer = request.headers.get("referer") ?? "";
      const secFetchSite = request.headers.get("sec-fetch-site") ?? "";

      const isSameOriginRequest =
        secFetchSite === "same-origin" ||
        referer.includes("ssb.cogify.me") ||
        referer.includes("localhost") ||
        referer.includes("127.0.0.1");

      const hasValidToken = verifyClientAccessToken(token, "booklet");

      if (!hasValidToken && !isSameOriginRequest) {
        return new Response(
          "Unauthorized download request. Please download the booklet from ssb.cogify.me.",
          {
            status: 403,
            headers: {
              "X-Robots-Tag": "noindex, noarchive, nosnippet",
              "Cache-Control": "no-store",
            },
          }
        );
      }

      const assetUrl = new URL("/Phys-Test-Booklet.pdf", request.url);
      const assetRes = await env.ASSETS.fetch(new Request(assetUrl, request));
      if (!assetRes.ok) {
        return new Response("Booklet PDF not found.", { status: 404 });
      }

      return new Response(assetRes.body, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition":
            'attachment; filename="SSB-Psychology-Test-Booklet.pdf"',
          "X-Robots-Tag": "noindex, noarchive, nosnippet",
          "X-Content-Type-Options": "nosniff",
          "Cache-Control": "private, max-age=3600",
        },
      });
    }

    // 2. Dynamic client-side session review route (/history/:sessionId)
    if (
      url.pathname.startsWith("/history/") &&
      url.pathname !== "/history/" &&
      !url.pathname.endsWith(".rsc") &&
      !url.pathname.endsWith(".html")
    ) {
      const placeholderUrl = new URL("/history/placeholder", request.url);
      return env.ASSETS.fetch(new Request(placeholderUrl, request));
    }

    // 3. Default static asset serving
    return env.ASSETS.fetch(request);
  },
};

export default worker;
