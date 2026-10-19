import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/tat", "/wat", "/srt", "/sdt", "/full-test"],
        disallow: [
          "/api/",
          "/dev/",
          "/_next/",
          "/tat-sets/",
          "/tat-assets/",
          "/Phys-Test-Booklet.pdf",
        ],
      },
      {
        userAgent: [
          "GPTBot",
          "CCBot",
          "Bytespider",
          "Scrapy",
          "HTTrack",
          "python-requests",
          "Go-http-client",
        ],
        disallow: ["/"],
      },
    ],
    sitemap: "https://ssb.cogify.me/sitemap.xml",
    host: "https://ssb.cogify.me",
  };
}
