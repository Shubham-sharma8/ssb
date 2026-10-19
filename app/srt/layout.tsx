import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SRT Practice (60 Situations · 5 SRTs per Sheet · 30m Invisible Hall Timer)",
  description:
    "Practice the SSB Situation Reaction Test (SRT) with predefined 60-situation sets and real-time Random sets. Displays 5 SRT situations per sheet with an invisible timer scaled to the situation count (30s per SRT), plus Question Booklet PDF export and Pin-Point AI Evaluation.",
  alternates: {
    canonical: "https://ssb.cogify.me/srt",
  },
  openGraph: {
    title: "SSB SRT Practice Simulator (60 Situations · 30m Invisible Timer) | ssb.cogify.me",
    description:
      "Authentic SSB Situation Reaction Test (SRT) simulator displaying 5 situations per sheet with invisible hall timer, PDF Booklet export & AI Evaluation.",
    url: "https://ssb.cogify.me/srt",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "SSB SRT Practice (60 Situations · 30m Hall Timer) | ssb.cogify.me",
    description:
      "Practice SSB Situation Reaction Test (SRT) with 5 situations per sheet, invisible timer, PDF Booklet export & Pin-Point AI Evaluation.",
    images: ["/twitter-image.png"],
  },
};

export default function SrtLayout({ children }: { children: React.ReactNode }) {
  return children;
}
