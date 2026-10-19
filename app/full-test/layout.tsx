import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Complete SSB Stage-2 Psychological Test Simulator (TAT → WAT → SRT → SDT)",
  description:
    "Run the complete, uninterrupted SSB Stage-2 Psychological Test Battery (TAT 12 slides → WAT 60 words → SRT 60 situations → SDT 5 paragraphs) with authentic hall transitions, Question Booklet PDF export, and Pin-Point AI Psychologist Evaluation.",
  alternates: {
    canonical: "https://ssb.cogify.me/full-test",
  },
  openGraph: {
    title: "Complete SSB Stage-2 Psychological Test Simulator | ssb.cogify.me",
    description:
      "Full uninterrupted SSB Psychology Battery (TAT → WAT → SRT → SDT) with Question Booklet PDF export and Pin-Point AI Evaluation Prompt.",
    url: "https://ssb.cogify.me/full-test",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Complete SSB Stage-2 Psychological Test Simulator | ssb.cogify.me",
    description:
      "Run the full SSB Psychology Battery (TAT → WAT → SRT → SDT) with Question Booklet PDF export and AI Evaluation.",
    images: ["/twitter-image.png"],
  },
};

export default function FullTestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
