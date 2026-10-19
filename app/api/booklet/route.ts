import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import {
  isBlockedScraperUserAgent,
  verifyClientAccessToken,
} from "@/lib/security/bot-guard";

export async function GET(request: NextRequest) {
  const userAgent = request.headers.get("user-agent") ?? "";
  if (isBlockedScraperUserAgent(userAgent)) {
    return new NextResponse("Forbidden: Automated scraping is not permitted.", {
      status: 403,
      headers: {
        "X-Robots-Tag": "noindex, noarchive, nosnippet",
        "Cache-Control": "no-store",
      },
    });
  }

  const token = request.nextUrl.searchParams.get("st");
  const referer = request.headers.get("referer") ?? "";
  const secFetchSite = request.headers.get("sec-fetch-site") ?? "";

  const isSameOriginRequest =
    secFetchSite === "same-origin" ||
    referer.includes("ssb.cogify.me") ||
    referer.includes("localhost") ||
    referer.includes("127.0.0.1");

  const hasValidToken = verifyClientAccessToken(token, "booklet");

  if (!hasValidToken && !isSameOriginRequest) {
    return new NextResponse(
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

  const externalAssetServer = process.env.NEXT_PUBLIC_ASSET_SERVER_URL?.replace(
    /\/+$/,
    ""
  );
  if (externalAssetServer) {
    return NextResponse.redirect(
      `${externalAssetServer}/Phys-Test-Booklet.pdf`,
      302
    );
  }

  const filePath = path.join(process.cwd(), "public", "Phys-Test-Booklet.pdf");
  if (!fs.existsSync(filePath)) {
    return new NextResponse("Booklet PDF not found.", { status: 404 });
  }

  const fileBuffer = fs.readFileSync(filePath);
  return new NextResponse(fileBuffer, {
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
