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

const ALLOWED_SEARCH_BOT_PATTERNS = [
  /gptbot/i,
  /oai-searchbot/i,
  /chatgpt-user/i,
  /claudebot/i,
  /anthropic-ai/i,
  /perplexitybot/i,
  /google-extended/i,
  /applebot/i,
  /amazonbot/i,
  /duckassistbot/i,
  /googlebot/i,
  /bingbot/i,
];

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
  /petalbot/i,
  /mj12bot/i,
  /dotbot/i,
  /semrushbot/i,
  /ahrefsbot/i,
  /blexbot/i,
  /dataforseobot/i,
];

function isAllowedSearchBotUserAgent(userAgent) {
  if (!userAgent) return false;
  return ALLOWED_SEARCH_BOT_PATTERNS.some((pattern) => pattern.test(userAgent));
}

function isBlockedScraperUserAgent(userAgent) {
  if (!userAgent || userAgent.trim().length < 6) {
    return true;
  }
  if (isAllowedSearchBotUserAgent(userAgent)) {
    return false;
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

    // 0. Single-hop canonical URL normalization (HTTP -> HTTPS, www -> apex, strip trailing slash)
    const forwardedProto = request.headers.get("x-forwarded-proto");
    const isLocalhost =
      url.hostname === "localhost" || url.hostname === "127.0.0.1";
    const needsHttpsUpgrade =
      !isLocalhost && (url.protocol === "http:" || forwardedProto === "http");
    const isWwwHost = url.hostname === "www.ssb.cogify.me";
    const hasTrailingSlash =
      url.pathname.length > 1 && url.pathname.endsWith("/");

    if (needsHttpsUpgrade || isWwwHost || hasTrailingSlash) {
      const canonicalPathname = hasTrailingSlash
        ? url.pathname.replace(/\/+$/, "")
        : url.pathname;
      const canonicalHost = isLocalhost ? url.host : "ssb.cogify.me";
      const canonicalProtocol = isLocalhost ? url.protocol : "https:";
      const redirectLocation = `${canonicalProtocol}//${canonicalHost}${canonicalPathname}${url.search}`;
      return new Response(null, {
        status: 301,
        headers: {
          Location: redirectLocation,
          "Strict-Transport-Security":
            "max-age=63072000; includeSubDomains; preload",
          "X-Content-Type-Options": "nosniff",
          "Cache-Control": "public, max-age=31536000",
        },
      });
    }

    // Redirect legacy /tat/session?set=... links without sessionId directly to /tat?setId=... in a single 301 hop
    if (
      url.pathname === "/tat/session" &&
      !url.searchParams.has("sessionId") &&
      (url.searchParams.has("set") || url.searchParams.has("setId"))
    ) {
      const setId = url.searchParams.get("setId") ?? url.searchParams.get("set");
      const mode = url.searchParams.get("mode");
      const target = new URL("/tat", url.origin);
      if (setId) target.searchParams.set("setId", setId);
      if (mode) target.searchParams.set("mode", mode);
      return Response.redirect(target.toString(), 301);
    }

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
      const res = await env.ASSETS.fetch(new Request(placeholderUrl, request));
      const headers = new Headers(res.headers);
      headers.set("X-Robots-Tag", "noindex, follow");
      return new Response(res.body, {
        status: res.status,
        headers,
      });
    }

    // 3. Default static asset serving with explicit 404 fallback
    const response = await env.ASSETS.fetch(request);
    if (response.status === 404) {
      const notFoundUrl = new URL("/404.html", request.url);
      const notFoundRes = await env.ASSETS.fetch(
        new Request(notFoundUrl, request)
      );
      const headers = new Headers(notFoundRes.headers);
      headers.set("X-Robots-Tag", "noindex, follow");
      if (!headers.has("Content-Type")) {
        headers.set("Content-Type", "text/html; charset=utf-8");
      }
      return new Response(notFoundRes.body, {
        status: 404,
        headers,
      });
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.includes("text/html")) {
      const headers = new Headers(response.headers);
      const isNoIndexRoute =
        url.pathname === "/history" ||
        url.pathname.startsWith("/history/") ||
        url.pathname === "/settings" ||
        url.pathname.startsWith("/settings/") ||
        url.pathname === "/tat/session" ||
        url.pathname.startsWith("/dev");

      if (isNoIndexRoute) {
        headers.set("X-Robots-Tag", "noindex, follow");
      } else {
        headers.set(
          "X-Robots-Tag",
          "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
        );
        const canonicalPath = url.pathname === "/" ? "" : url.pathname;
        headers.set(
          "Link",
          `<https://ssb.cogify.me${canonicalPath}>; rel="canonical"`
        );
      }

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    }

    return response;
  },
};

export default worker;

