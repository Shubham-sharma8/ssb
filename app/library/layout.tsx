import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SSB TAT Stimulus Library (SET 1 to SET 10 Picture Sets & Self-Review)",
  description:
    "Browse all 10 approved SSB Thematic Apperception Test (TAT) sets (11 pictures + 1 blank slide per set) on ssb.cogify.me, inspect story history, and track self-reviewed stimuli.",
  alternates: {
    canonical: "https://ssb.cogify.me/library",
  },
  openGraph: {
    title: "SSB TAT Stimulus Library (SET 1–10) | ssb.cogify.me",
    description:
      "Browse all 10 SSB TAT picture sets (11 pictures + 1 blank slide per set) and review your practice history.",
    url: "https://ssb.cogify.me/library",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
};

export default function LibraryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
