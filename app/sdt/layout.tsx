import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SDT Practice (Self Description Test: 5 Paragraphs · 15-Minute Hall Timer)",
  description:
    "Practice the SSB Self Description Test (SDT) with the 5 official Self-Description paragraphs (Parents, Teachers/Employers, Friends, Own Opinion, and Qualities to Improve) under a 15-minute hall timer with Question Booklet PDF export and AI Evaluation.",
  alternates: {
    canonical: "https://ssb.cogify.me/sdt",
  },
  openGraph: {
    title: "SSB SDT Practice (Self Description Test · 5 Paragraphs · 15m) | ssb.cogify.me",
    description:
      "Practice the 5 official SSB Self-Description Test (SDT) paragraphs under a 15-minute hall timer with PDF Booklet export & Pin-Point AI Evaluation.",
    url: "https://ssb.cogify.me/sdt",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "SSB SDT Practice (5 Paragraphs · 15m Timer) | ssb.cogify.me",
    description:
      "Authentic SSB Self Description Test (SDT) simulator with 15-minute timer, PDF Booklet export & AI Evaluation.",
    images: ["/twitter-image.png"],
  },
};

export default function SdtLayout({ children }: { children: React.ReactNode }) {
  return children;
}
