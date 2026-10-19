import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SSB GTO Officer Tasks & 3-Minute Lecturette Timer (GD, GPE, PGT, HGT, CT, FGT)",
  description:
    "Practice SSB Group Testing Officer (GTO) tasks with an interactive 3-Minute Lecturette Card & Hall Timer (2.5m preparation + 3m speech with 30s warning beep, 24 real SSB topics) and tactical blueprints for all 9 GTO tasks.",
  alternates: {
    canonical: "https://ssb.cogify.me/gto",
  },
  openGraph: {
    title: "SSB GTO Officer Tasks & 3-Minute Lecturette Timer | ssb.cogify.me",
    description:
      "Interactive 3-Minute SSB Lecturette Card & Hall Timer (with 30s warning beep) and complete frameworks for all 9 GTO Tasks (GD, GPE, PGT, HGT, GOR, IO, CT, FGT).",
    url: "https://ssb.cogify.me/gto",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "SSB GTO Tasks & 3-Minute Lecturette Timer | ssb.cogify.me",
    description:
      "Practice SSB Lecturette cards with a 3-minute hall timer & 30s warning beep, plus tactical frameworks for all 9 GTO tasks.",
    images: ["/twitter-image.png"],
  },
};

export default function GtoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
