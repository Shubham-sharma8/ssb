import { test, expect } from "@playwright/test";

declare global {
  interface Window {
    __SSB_ENABLE_TEST_CLOCK__?: () => {
      advance: (ms: number) => void;
    };
    __SSB_TEST_CLOCK__?: {
      advance: (ms: number) => void;
    };
  }
}

test.describe("SSB Practice — Realistic TAT Psychology Test Platform E2E", () => {
  test("Real SSB Hall Mode: no visible timer, 30s picture projection, picture vanishes for 4-minute notebook writing, automatic advance to next picture, and Booklet PDF download", async ({
    page,
  }) => {
    // 1. Open the SSB Practice hub and verify Resizable Navbar, 3 SSB Pillars (Psyc, GTO, Interview), and 4 Psych modules
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /SSB Practice/i })
    ).toBeVisible();
    await expect(page.getByTestId("aceternity-resizable-navbar")).toBeVisible();
    await expect(page.getByTestId("top-nav-psyc")).toBeVisible();
    await expect(page.getByTestId("top-nav-gto")).toBeVisible();
    await expect(page.getByTestId("top-nav-interview")).toBeVisible();
    await expect(page.getByTestId("nav-Settings")).toBeVisible();
    await expect(page.getByTestId("top-nav-about")).toBeVisible();
    await expect(page.getByTestId("download-booklet-btn")).toBeVisible();
    await expect(page.getByTestId("module-card-tat")).toBeVisible();
    await expect(page.getByTestId("module-card-wat")).toBeVisible();
    await expect(page.getByTestId("module-card-srt")).toBeVisible();
    await expect(page.getByTestId("module-card-sdt")).toBeVisible();

    // 2. Navigate to TAT Setup (/tat) and verify SET 1 .. SET 10 are all approved and available
    await page.getByTestId("dashboard-configure-tat-link").click();
    await expect(page).toHaveURL(/\/tat$/);
    await expect(page.getByTestId("select-set-set-9")).toBeVisible();
    await expect(page.getByTestId("select-set-set-10")).toBeVisible();

    const set5Card = page.getByTestId("select-set-set-5");
    await expect(set5Card).toBeVisible();
    await set5Card.click();

    // 3. Select 2 pictures for deterministic E2E testing while keeping Real SSB Mode active
    await page.getByTestId("scope-selected-btn").click();
    await expect(page.getByTestId("selected-picture-picker")).toBeVisible();

    await page.getByTestId("picker-clear-all").click();
    await page.getByTestId("pick-stimulus-tat-pdf-p002").click();
    await page.getByTestId("pick-stimulus-tat-pdf-p004").click();
    await expect(page.getByTestId("summary-picture-count")).toContainText(
      "2 pictures"
    );

    // Ensure Real SSB Hall Mode (no timer, physical notebook writing) is selected by default
    await page.getByTestId("mode-realistic-btn").click();
    await page.getByTestId("start-test-btn").click();

    // Verify 3-slide pre-exam briefing presentation with Next -> Next -> Proceed to Exam Hall
    await expect(page.getByTestId("exam-briefing-modal")).toBeVisible();
    await expect(page.getByTestId("briefing-slide-counter")).toContainText(
      "Slide 1 of 3"
    );
    await page.getByTestId("briefing-next-btn").click();
    await expect(page.getByTestId("briefing-slide-counter")).toContainText(
      "Slide 2 of 3"
    );
    await page.getByTestId("briefing-next-btn").click();
    await expect(page.getByTestId("briefing-slide-counter")).toContainText(
      "Slide 3 of 3"
    );
    await page.getByTestId("briefing-start-exam-btn").click();

    await expect(page).toHaveURL(/\/tat\/session\?sessionId=/, {
      timeout: 15000,
    });

    // 4. Verify Real SSB Mode observation phase:
    // - Picture is projected
    // - NO countdown timer is shown on screen
    // - Top navigation is hidden
    await expect(page.getByTestId("active-tat-session-surface")).toBeVisible();
    await expect(page.getByTestId("aceternity-resizable-navbar")).toHaveCount(0);

    await expect(page.getByTestId("real-mode-no-timer-indicator")).toBeVisible();
    await expect(page.getByTestId("session-countdown-timer")).toHaveCount(0);
    await expect(page.getByTestId("tat-finish-test-btn")).toBeVisible();

    await expect(page.getByTestId("active-phase-badge")).toContainText(
      "Observation"
    );
    await expect(page.getByTestId("active-session-step-label")).toContainText(
      "1 of 2"
    );
    await expect(
      page.getByTestId("active-picture-canonical-label")
    ).toContainText("Picture 1");
    await expect(page.getByTestId("observation-projection-stage")).toBeVisible();
    await expect(page.getByTestId("projected-stimulus-image")).toBeVisible();

    // 5. Advance deterministic clock by 30.5 seconds:
    // Picture MUST vanish and transition into 4-minute notebook writing phase
    await page.evaluate(() => {
      if (window.__SSB_ENABLE_TEST_CLOCK__) {
        window.__SSB_ENABLE_TEST_CLOCK__();
      }
      window.__SSB_TEST_CLOCK__?.advance(30_500);
    });

    await expect(page.getByTestId("active-phase-badge")).toContainText(
      "Story Writing"
    );
    // Picture has vanished!
    await expect(page.getByTestId("projected-stimulus-image")).toHaveCount(0);
    // Notebook writing instructions are shown, still with NO countdown timer
    await expect(page.getByTestId("notebook-writing-stage")).toBeVisible();
    await expect(page.getByTestId("session-countdown-timer")).toHaveCount(0);

    // 6. Wait 4 minutes (advance 240.5 seconds):
    // Automatically projects Picture 2 without any user typing or clicking!
    await page.evaluate(() => {
      window.__SSB_TEST_CLOCK__?.advance(240_500);
    });

    await expect(page.getByTestId("active-phase-badge")).toContainText(
      "Observation"
    );
    await expect(page.getByTestId("active-session-step-label")).toContainText(
      "2 of 2"
    );
    await expect(
      page.getByTestId("active-picture-canonical-label")
    ).toContainText("Picture 2");
    await expect(page.getByTestId("projected-stimulus-image")).toBeVisible();

    // Advance 30.5 seconds so Picture 2 vanishes into writing phase
    await page.evaluate(() => {
      window.__SSB_TEST_CLOCK__?.advance(30_500);
    });
    await expect(page.getByTestId("notebook-writing-stage")).toBeVisible();

    // 7. Test optional Digital Notepad toggle, autosave, reload recovery, completion, and review
    await page.getByTestId("toggle-digital-notepad-btn").click();
    await expect(page.getByTestId("writing-editor-stage")).toBeVisible();

    const story2Text =
      "Captain Meera organized her mountaineering expedition team when sudden fog reduced visibility on the ridge. She established a fixed rope line, guided every member safely to the high-altitude shelter, and completed the reconnaissance mission on schedule.";
    await page.getByTestId("story-writing-textarea").fill(story2Text);
    await expect(page.getByTestId("save-status-indicator")).toContainText(
      "Saved",
      { timeout: 5000 }
    );

    await page.reload();
    await expect(page.getByTestId("active-tat-session-surface")).toBeVisible();
    await expect(page.getByTestId("active-session-step-label")).toContainText(
      "2 of 2"
    );

    // Finish session via Finish Test button
    await page.getByTestId("tat-finish-test-btn").click();

    await expect(page.getByTestId("session-completed-screen")).toBeVisible();
    await expect(page.getByTestId("completed-screen-count")).toContainText(
      "2 / 2"
    );

    // 8. Post-session review workspace
    await page.getByTestId("completed-review-session-link").click();
    await expect(page).toHaveURL(/\/history\/tat-sess-/);
    await expect(page.getByTestId("review-session-title")).toBeVisible();

    await page.getByTestId("checklist-mainCharacterEstablished").check();
    await page.getByTestId("checklist-plausibleSituation").check();
    await page.getByTestId("checklist-concreteCourseOfAction").check();
    await page.getByTestId("checklist-outcomeExplained").check();
    await page.getByTestId("checklist-fitsPicture").check();
    await page
      .getByTestId("review-improvement-notes")
      .fill("Clear action steps and constructive outcome.");

    await page.getByTestId("mark-reviewed-btn").click();
    await expect(page.getByTestId("review-save-banner")).toContainText(
      "Saved story edits & self-review reflection."
    );

    // 9. Stimulus Library (All 10 Sets Approved, Source PDF Manifest Audit removed)
    await page.goto("/library");
    await expect(page.getByTestId("tab-manifest-audit")).toHaveCount(0);
    await expect(page.getByTestId("library-set-set-9")).toBeVisible();
    await expect(page.getByTestId("library-set-set-10")).toBeVisible();
    await page.getByTestId("library-set-set-5").click();
    await expect(
      page.getByTestId("library-stimulus-card-tat-pdf-p002")
    ).toContainText("Reviewed");

    // 10. Settings preferences (Application Title removed) + JSON export/clear/import round-trip
    await page.goto("/settings");
    await expect(page.getByTestId("pref-brand-name")).toHaveCount(0);
    await page.getByTestId("save-preferences-btn").click();
    await expect(page.getByTestId("prefs-saved-banner")).toBeVisible();

    await page.getByTestId("export-json-btn").click();
    await expect(page.getByTestId("exported-json-textarea")).toHaveValue(
      /Captain Meera organized her mountaineering expedition/
    );
    const exportedJson = await page
      .getByTestId("exported-json-textarea")
      .inputValue();

    await page.getByTestId("open-clear-data-confirm-btn").click();
    await page.getByTestId("confirm-clear-data-btn").click();
    await expect(page.getByTestId("clear-data-feedback")).toBeVisible();

    await page.getByTestId("import-json-textarea").fill(exportedJson);
    await page.getByTestId("import-json-btn").click();
    await expect(page.getByTestId("import-result-banner")).toContainText(
      "Successfully imported 1 session(s), 2 story record(s)"
    );
  });

  test("Selected-picture canonical numbering preservation & Practice Mode with visible timer and pause/resume", async ({
    page,
  }) => {
    await page.goto("/tat");
    await page.getByTestId("select-set-set-1").click();
    await page.getByTestId("scope-selected-btn").click();
    await page.getByTestId("picker-clear-all").click();

    // Select Picture 5 (tat-3-p005) as the only picture in the session
    await page.getByTestId("pick-stimulus-tat-3-p005").click();
    await expect(page.getByTestId("summary-picture-count")).toContainText(
      "1 picture"
    );

    // Switch to Practice Mode so countdown timer & Pause/Resume are enabled
    await page.getByTestId("mode-practice-btn").click();
    await page.getByTestId("start-test-btn").click();
    await expect(page.getByTestId("exam-briefing-modal")).toBeVisible();
    await page.getByTestId("briefing-skip-btn").click();

    await expect(page.getByTestId("active-tat-session-surface")).toBeVisible();
    // In Practice Mode, countdown timer IS visible
    await expect(page.getByTestId("session-countdown-timer")).toBeVisible();
    // Canonical numbering still shows Picture 5 even as Step 1 of 1
    await expect(page.getByTestId("active-session-step-label")).toContainText(
      "1 of 1"
    );
    await expect(
      page.getByTestId("active-picture-canonical-label")
    ).toContainText("Picture 5");

    // Pause and resume the session in Practice Mode
    await page.getByTestId("pause-session-btn").click();
    await expect(page.getByTestId("session-paused-overlay")).toBeVisible();
    await expect(page.getByTestId("projected-stimulus-image")).toHaveCount(0);

    await page.getByTestId("resume-paused-session-btn").click();
    await expect(page.getByTestId("observation-projection-stage")).toBeVisible();
  });

  test("Responsive layout across mobile (320px & 375px), tablet (768px), and desktop (1280px) viewports with zero horizontal overflow", async ({
    page,
  }) => {
    const assertNoHorizontalOverflow = async (label: string) => {
      const overflow = await page.evaluate(() => {
        return {
          scrollWidth: document.documentElement.scrollWidth,
          innerWidth: window.innerWidth,
        };
      });
      expect(
        overflow.scrollWidth,
        `Expected no horizontal overflow on ${label} (${overflow.scrollWidth} > ${overflow.innerWidth})`
      ).toBeLessThanOrEqual(overflow.innerWidth);
    };

    const routes = [
      "/",
      "/tat",
      "/wat",
      "/srt",
      "/sdt",
      "/full-test",
      "/gto",
      "/interview",
      "/about",
      "/library",
      "/history",
      "/settings",
    ];
    const viewports = [
      { name: "small-mobile", width: 320, height: 568 },
      { name: "mobile", width: 375, height: 667 },
      { name: "tablet", width: 768, height: 1024 },
      { name: "desktop", width: 1280, height: 800 },
    ];

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      for (const route of routes) {
        await page.goto(route);
        await assertNoHorizontalOverflow(
          `${vp.name} (${vp.width}x${vp.height}) at ${route}`
        );
      }
    }

    // Verify mobile navigation drawer and bottom nav on 375x667
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    await expect(page.getByTestId("mobile-bottom-nav")).toBeVisible();
    await expect(page.getByTestId("mobile-menu-toggle")).toBeVisible();

    await page.getByTestId("mobile-menu-toggle").click();
    await expect(page.getByTestId("mobile-nav-drawer")).toBeVisible();

    // Navigate to /tat via mobile bottom nav and run an active TAT session on mobile
    await page.getByTestId("mobile-bottom-nav-tat").click();
    await expect(page).toHaveURL(/\/tat$/);
    await expect(page.getByTestId("mobile-nav-drawer")).toHaveCount(0);

    await page.getByTestId("scope-selected-btn").click();
    await page.getByTestId("picker-clear-all").click();
    await page.getByTestId("pick-stimulus-tat-3-p001").click();
    await assertNoHorizontalOverflow("mobile /tat with picture picker open");

    await page.getByTestId("start-test-btn").click();
    await expect(page.getByTestId("exam-briefing-modal")).toBeVisible();
    await assertNoHorizontalOverflow("mobile /tat briefing modal open");
    await page.getByTestId("briefing-skip-btn").click();

    await expect(page.getByTestId("active-tat-session-surface")).toBeVisible();
    await expect(page.getByTestId("mobile-bottom-nav")).toHaveCount(0);
    await assertNoHorizontalOverflow("mobile /tat/session observation phase");

    // Advance into notebook writing phase on mobile and verify zero horizontal overflow
    await page.evaluate(() => {
      if (window.__SSB_ENABLE_TEST_CLOCK__) {
        window.__SSB_ENABLE_TEST_CLOCK__();
      }
      window.__SSB_TEST_CLOCK__?.advance(30_500);
    });
    await expect(page.getByTestId("notebook-writing-stage")).toBeVisible();
    await assertNoHorizontalOverflow("mobile /tat/session writing phase");
  });

  test("Light Mode button contrast, ssb.cogify.me branding & cogify.me footer, WAT (no running word number, 15s word + beep + 30s page turn after 20 words, Finish Test early exports attempted only), SRT, SDT, Complete Psychological Test, GTO & Interview, SEO & Bot Guard", async ({
    page,
    request,
  }) => {
    // 0. Verify Bot Protection on /api/booklet (blocks unauthenticated/scraper requests with 403) and SEO routes
    const unauthBookletRes = await request.get("/api/booklet");
    expect(unauthBookletRes.status()).toBe(403);

    const botBookletRes = await request.get("/api/booklet?st=fake", {
      headers: { "user-agent": "curl/8.4.0" },
    });
    expect(botBookletRes.status()).toBe(403);

    const sitemapRes = await request.get("/sitemap.xml");
    expect(sitemapRes.status()).toBe(200);
    const sitemapText = await sitemapRes.text();
    expect(sitemapText).toContain("https://ssb.cogify.me/tat");
    expect(sitemapText).toContain("https://ssb.cogify.me/gto");
    expect(sitemapText).toContain("https://ssb.cogify.me/interview");
    expect(sitemapText).toContain("https://ssb.cogify.me/library");

    const robotsRes = await request.get("/robots.txt");
    expect(robotsRes.status()).toBe(200);
    const robotsText = await robotsRes.text();
    expect(robotsText).toContain("Disallow: /api/");
    expect(robotsText).toContain("Allow: /og-image.png");

    for (const assetPath of [
      "/favicon.ico",
      "/favicon-32x32.png",
      "/apple-touch-icon.png",
      "/icon-192.png",
      "/icon-512.png",
      "/og-image.webp",
      "/og-image.png",
      "/og-image.jpg",
      "/twitter-image.png",
      "/manifest.json",
    ]) {
      const res = await request.get(assetPath);
      expect(res.status(), `Expected ${assetPath} to return 200`).toBe(200);
    }

    // 1. Switch to Light Mode and verify primary button contrast + ssb.cogify.me & cogify.me footer
    await page.goto("/settings");
    await expect(page.getByTestId("seo-breadcrumbs")).toBeVisible();
    await page.getByTestId("pref-theme").selectOption("light");
    await page.getByTestId("save-preferences-btn").click();

    await page.goto("/");
    const primaryBtn = page.getByTestId("dashboard-configure-tat-link");
    await expect(primaryBtn).toBeVisible();
    const styles = await primaryBtn.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { color: cs.color, backgroundColor: cs.backgroundColor };
    });
    expect(styles.color).toBe("rgb(255, 255, 255)");
    expect(styles.backgroundColor).toBe("rgb(24, 24, 27)");

    // Verify ssb.cogify.me branding, OpenGraph/Twitter image meta tags, canonical link, visible FAQ section, E-E-A-T author bio, and JSON-LD structured data
    await expect(
      page.locator('meta[property="og:image"]').first()
    ).toHaveAttribute("content", /og-image\.(webp|png)$/);
    await expect(
      page.locator('meta[name="twitter:image"]').first()
    ).toHaveAttribute("content", /twitter-image\.png$/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      "https://ssb.cogify.me"
    );
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByTestId("seo-faq-section")).toBeVisible();
    await expect(page.getByTestId("eeat-author-bio")).toBeVisible();
    await expect(page.getByTestId("quick-start-set-1")).toHaveAttribute(
      "href",
      "/tat?setId=set-1&mode=realistic"
    );

    await expect(page.getByTestId("cogify-parent-banner")).toBeVisible();
    await expect(page.getByTestId("cogify-parent-link")).toHaveAttribute(
      "href",
      "https://cogify.me"
    );
    await expect(page.getByTestId("footer-cogify-section")).toBeVisible();
    await expect(page.getByTestId("footer-cogify-cta")).toHaveAttribute(
      "href",
      "https://cogify.me"
    );
    const jsonLdCount = await page
      .locator('script[type="application/ld+json"]')
      .count();
    expect(jsonLdCount).toBeGreaterThanOrEqual(1);

    // 2. WAT Module (/wat): SSB Jalandhar set, breadcrumbs, NO running word number, 15s word transitions with beep, 30s page-turn after 20 words, Finish Test early -> exports only attempted words + AI Prompt copy toast & 3-step Aceternity guide
    await page.goto("/wat");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      "https://ssb.cogify.me/wat"
    );
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByTestId("seo-breadcrumbs")).toBeVisible();
    await expect(page.getByTestId("wat-set-card-wat-allahabad")).toBeVisible();
    await expect(page.getByTestId("wat-set-card-wat-jalandhar")).toBeVisible();
    await expect(page.getByTestId("wat-set-card-wat-bhopal")).toBeVisible();
    await expect(page.getByTestId("wat-set-card-wat-random")).toBeVisible();

    await page.getByTestId("wat-set-card-wat-jalandhar").click();
    await page.getByTestId("start-wat-btn").click();
    await expect(page.getByTestId("exam-briefing-modal")).toBeVisible();
    await page.getByTestId("briefing-next-btn").click();
    await page.getByTestId("briefing-next-btn").click();
    await page.getByTestId("briefing-start-exam-btn").click();

    await expect(page.getByTestId("wat-session-runner")).toBeVisible();
    // Authentic SSB hall mode: running word number is NOT displayed
    await expect(page.getByTestId("wat-word-counter")).toHaveCount(0);
    const word1 = await page.getByTestId("wat-active-word").textContent();

    // Advance 15.2s -> transitions to Word 2 with beep sound
    await page.evaluate(() => {
      if (window.__SSB_ENABLE_TEST_CLOCK__) {
        window.__SSB_ENABLE_TEST_CLOCK__();
      }
      window.__SSB_TEST_CLOCK__?.advance(15_200);
    });
    const word2 = await page.getByTestId("wat-active-word").textContent();
    expect(word2).not.toBe(word1);

    // Advance through Words 2..20 (19 words) to trigger the 30-second page-turn timer after Word 20
    for (let i = 2; i <= 20; i++) {
      await page.getByTestId("wat-skip-step-btn").click();
    }
    await expect(page.getByTestId("wat-page-turn-stage")).toBeVisible();
    await expect(page.getByTestId("wat-page-turn-countdown")).toBeVisible();

    // Advance 30.5s on the page-turn timer -> automatically transitions to Word 21!
    await page.evaluate(() => {
      window.__SSB_TEST_CLOCK__?.advance(30_500);
    });
    const word21 = await page.getByTestId("wat-active-word").textContent();
    expect(word21).toBeTruthy();

    // Finish WAT early in-between (at Word 21 of 60) and verify Question Booklet PDF + Pin-Point AI Prompt export contains only attempted words (21 words)
    await page.getByTestId("wat-finish-early-btn").click();
    await expect(page.getByTestId("wat-completed-screen")).toBeVisible();
    await expect(page.getByTestId("attempted-booklet-export-card")).toBeVisible();
    await expect(page.getByTestId("aceternity-evaluation-steps")).toBeVisible();

    await page.getByTestId("copy-ai-evaluation-prompt-btn").click();
    await expect(page.getByTestId("ai-prompt-copy-toast")).toBeVisible();

    await page.getByTestId("toggle-ai-prompt-preview-btn").click();
    await expect(page.getByTestId("ai-prompt-textarea")).toHaveValue(
      /PIN-POINT/
    );
    const promptVal = await page.getByTestId("ai-prompt-textarea").inputValue();
    expect(promptVal).toContain(
      "ATTEMPTED WAT WORDS (SSB Jalandhar — 21 Words"
    );
    expect(promptVal).toContain("21. Honour");
    expect(promptVal).not.toContain("22. ");

    // 3. SRT Module (/srt): Random SRT Set, 5 SRTs displayed + instructions + invisible timer equivalent to SRT count
    await page.goto("/srt");
    await expect(page.getByTestId("srt-set-card-srt-random")).toBeVisible();
    await expect(page.getByTestId("srt-set-card-srt-set-1")).toBeVisible();
    await page.getByTestId("srt-set-card-srt-random").click();
    await page.getByTestId("srt-count-5").click();
    await page.getByTestId("start-srt-btn").click();
    await expect(page.getByTestId("exam-briefing-modal")).toBeVisible();
    await page.getByTestId("briefing-skip-btn").click();

    await expect(page.getByTestId("srt-session-runner")).toBeVisible();
    await expect(page.getByTestId("srt-instructions-banner")).toBeVisible();
    await expect(page.getByTestId("srt-invisible-timer-badge")).toContainText(
      "02:30"
    );
    for (let i = 1; i <= 5; i++) {
      await expect(page.getByTestId(`srt-question-card-${i}`)).toBeVisible();
    }

    // Advance invisible timer by 150.5s (2m 30s) -> automatically completes SRT
    await page.evaluate(() => {
      if (window.__SSB_ENABLE_TEST_CLOCK__) {
        window.__SSB_ENABLE_TEST_CLOCK__();
      }
      window.__SSB_TEST_CLOCK__?.advance(150_500);
    });
    await expect(page.getByTestId("srt-completed-screen")).toBeVisible();
    await expect(page.getByTestId("attempted-booklet-export-card")).toBeVisible();

    // 4. SDT Module (/sdt)
    await page.goto("/sdt");
    await page.getByTestId("start-sdt-btn").click();
    await expect(page.getByTestId("exam-briefing-modal")).toBeVisible();
    await page.getByTestId("briefing-skip-btn").click();

    await expect(page.getByTestId("sdt-session-runner")).toBeVisible();
    await expect(page.getByTestId("sdt-prompt-card-1")).toBeVisible();
    await expect(page.getByTestId("sdt-prompt-card-5")).toBeVisible();
    await page.getByTestId("sdt-finish-btn").click();
    await expect(page.getByTestId("attempted-booklet-export-card")).toBeVisible();

    // 5. Complete Psychological Test Battery (/full-test)
    await page.goto("/full-test");
    await page.getByTestId("start-full-psych-test-btn").click();
    await expect(page.getByTestId("exam-briefing-modal")).toBeVisible();
    await page.getByTestId("briefing-skip-btn").click();

    await expect(page.getByTestId("full-test-runner")).toBeVisible();
    await expect(page.getByTestId("full-test-stage-indicator")).toContainText(
      "Stage 1/4: TAT"
    );
    await expect(page.getByTestId("full-test-finish-btn")).toBeVisible();
    await page.getByTestId("full-test-next-module-btn").click();
    await expect(page.getByTestId("full-test-stage-indicator")).toContainText(
      "Stage 2/4: WAT"
    );
    await expect(page.getByTestId("wat-word-counter")).toHaveCount(0);
    await page.getByTestId("full-test-next-module-btn").click();
    await expect(page.getByTestId("full-test-stage-indicator")).toContainText(
      "Stage 3/4: SRT"
    );
    await page.getByTestId("full-test-next-module-btn").click();
    await expect(page.getByTestId("full-test-stage-indicator")).toContainText(
      "Stage 4/4: SDT"
    );
    await page.getByTestId("full-test-next-module-btn").click();
    await expect(page.getByTestId("attempted-booklet-export-card")).toBeVisible();

    // 6. GTO & Personal Interview Hubs
    await page.goto("/gto");
    await expect(
      page.getByRole("heading", { name: /GTO Officer Tasks/i })
    ).toBeVisible();
    await expect(page.getByTestId("gto-lecturette-simulator")).toBeVisible();

    await page.goto("/interview");
    await expect(
      page.getByRole("heading", { name: /Personal Interview/i })
    ).toBeVisible();
    await expect(page.getByTestId("interview-ciq-simulator")).toBeVisible();
  });
});
