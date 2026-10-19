import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TAT Practice (SET 1–10: 11 Pictures + 1 Blank Slide, 30s View + 4m Story)",
  description:
    "Practice the authentic SSB Thematic Apperception Test (TAT) with SET 1 to SET 10 (11 pictures + 1 blank slide per set). Real SSB Hall Mode projects each picture for 30 seconds followed by 4 minutes of zero-timer notebook writing, with Question Booklet PDF export and Pin-Point AI Evaluation.",
  alternates: {
    canonical: "https://ssb.cogify.me/tat",
  },
  openGraph: {
    title: "SSB TAT Practice Simulator (SET 1–10 · 11 Pictures + 1 Blank Slide) | ssb.cogify.me",
    description:
      "Authentic SSB Stage-2 Thematic Apperception Test (TAT) Hall Simulator with 30s picture projection, 4m story writing, PDF Booklet export & AI Evaluation.",
    url: "https://ssb.cogify.me/tat",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "SSB TAT Practice Simulator (SET 1–10) | ssb.cogify.me",
    description:
      "Practice real SSB TAT sets (11 pictures + 1 blank slide, 30s projection + 4m story writing) with PDF Booklet export & AI Evaluation.",
    images: ["/twitter-image.png"],
  },
};

export default function TatLayout({ children }: { children: React.ReactNode }) {
  return children;
}
