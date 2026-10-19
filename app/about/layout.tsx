import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About SSB Stage-1 & Stage-2 Procedure, 15 OLQs & DIPR Methodology",
  description:
    "Learn how the Indian Services Selection Board (SSB) 5-Day Assessment works across Mansik (Psychology: TAT, WAT, SRT, SDT), Karman (GTO Tasks), and Vachik (Personal Interview), mapped to the 15 Officer Like Qualities (OLQs).",
  alternates: {
    canonical: "https://ssb.cogify.me/about",
  },
  openGraph: {
    title: "About SSB Stage-2 Procedure, 15 OLQs & DIPR Methodology | ssb.cogify.me",
    description:
      "Complete guide to the 5-Day SSB Selection Procedure, Mansik-Karman-Vachik triangulation, and the 15 Officer Like Qualities (OLQs).",
    url: "https://ssb.cogify.me/about",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
