import type { Metadata } from "next";

const title = "SSB SRT Practice: 60 Situations Timer";
const description =
  "Practice SSB Situation Reaction Test (SRT) online with 230 real defence scenarios, 5-per-sheet booklet view, 30-minute timer, and AI OLQ evaluation.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "https://ssb.cogify.me/srt",
  },
  openGraph: {
    title,
    description,
    url: "https://ssb.cogify.me/srt",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og-image.png"],
  },
};

export default function SrtLayout({ children }: { children: React.ReactNode }) {
  return children;
}
