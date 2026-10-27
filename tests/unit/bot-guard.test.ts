import { describe, expect, it } from "vitest";
import {
  decodeProtectedStorage,
  encodeProtectedStorage,
  generateClientAccessToken,
  getProtectedBookletUrl,
  isAllowedSearchBotUserAgent,
  isBlockedScraperUserAgent,
  resolveProtectedAssetUrl,
  verifyClientAccessToken,
} from "@/lib/security/bot-guard";

describe("Security & Bot-Guard Utilities", () => {
  it("blocks known scraper User-Agents while allowing normal browsers and search/AI answer bots", () => {
    expect(isBlockedScraperUserAgent("curl/8.4.0")).toBe(true);
    expect(isBlockedScraperUserAgent("python-requests/2.31.0")).toBe(true);
    expect(isBlockedScraperUserAgent("Scrapy/2.11.0")).toBe(true);
    expect(isBlockedScraperUserAgent("Bytespider")).toBe(true);
    expect(isBlockedScraperUserAgent("Mozilla/5.0 (compatible; GPTBot/1.0)")).toBe(
      false
    );
    expect(isAllowedSearchBotUserAgent("Mozilla/5.0 (compatible; GPTBot/1.0)")).toBe(
      true
    );
    expect(isAllowedSearchBotUserAgent("Mozilla/5.0 (compatible; ClaudeBot/1.0)")).toBe(
      true
    );
    expect(isAllowedSearchBotUserAgent("Mozilla/5.0 (compatible; PerplexityBot/1.0)")).toBe(
      true
    );
    expect(
      isBlockedScraperUserAgent(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/125.0.0.0 Safari/537.36"
      )
    ).toBe(false);
  });

  it("generates and verifies time-windowed client access tokens", () => {
    const now = 1_750_000_000_000;
    const token = generateClientAccessToken("/Phys-Test-Booklet.pdf", now);
    expect(
      verifyClientAccessToken(token, "/Phys-Test-Booklet.pdf", now + 30_000)
    ).toBe(true);
    expect(
      verifyClientAccessToken(token, "/other-resource.pdf", now)
    ).toBe(false);
    expect(
      verifyClientAccessToken(
        token,
        "/Phys-Test-Booklet.pdf",
        now + 2 * 60 * 60 * 1000
      )
    ).toBe(false);
  });

  it("encodes and decodes protected storage payloads so DevTools storage is not plain JSON", () => {
    const sample = {
      practiceMode: "realistic",
      soundAlerts: true,
      board: "SSB Allahabad",
    };
    const encoded = encodeProtectedStorage(sample);
    expect(encoded.startsWith("cgf_v2_")).toBe(true);
    expect(encoded).not.toContain("SSB Allahabad");

    const decoded = decodeProtectedStorage<typeof sample>(encoded);
    expect(decoded).toEqual(sample);
  });

  it("resolves local asset URLs and booklet endpoints directly from the app", () => {
    const assetUrl = resolveProtectedAssetUrl("/tat-sets/SET-1/01.webp");
    expect(assetUrl).toBe("/tat-sets/SET-1/01.webp");

    const signedAssetUrl = resolveProtectedAssetUrl("/tat-sets/SET-1/01.webp", true);
    expect(signedAssetUrl).toContain("/tat-sets/SET-1/01.webp?st=");

    const bookletUrl = getProtectedBookletUrl();
    expect(bookletUrl).toBe("/Phys-Test-Booklet.pdf");
  });
});
