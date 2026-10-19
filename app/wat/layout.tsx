import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "WAT Practice (60 Words · 15s Audio Beep · Allahabad, Bhopal, Jalandhar Sets)",
  description:
    "Practice the SSB Word Association Test (WAT) with board-specific 60-word sets from SSB Allahabad, Bhopal, Jalandhar, Kapurthala, Bangalore, and real-time Random sets. Projects each word for 15 seconds with audio beep and a 30-second page-turn timer after every 20 words.",
  alternates: {
    canonical: "https://ssb.cogify.me/wat",
  },
  openGraph: {
    title: "SSB WAT Practice Simulator (60 Words · 15s Beep · Board-Specific Sets) | ssb.cogify.me",
    description:
      "Practice 60-word SSB WAT sets (Allahabad, Bhopal, Jalandhar, Kapurthala, Bangalore & Random) with 15s audio beep, 30s page turn after 20 words, PDF Booklet & AI Evaluation.",
    url: "https://ssb.cogify.me/wat",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "SSB WAT Practice (60 Words · 15s Beep) | ssb.cogify.me",
    description:
      "60-word SSB Word Association Test simulator with 15s beep, 30s page turn after 20 words, PDF Booklet export & Pin-Point AI Evaluation.",
    images: ["/twitter-image.png"],
  },
};

export default function WatLayout({ children }: { children: React.ReactNode }) {
  return children;
}
