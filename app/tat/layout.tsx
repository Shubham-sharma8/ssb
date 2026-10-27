import type { Metadata } from "next";

const title = "SSB TAT Practice: 10 Sets, 30s/4m Timer";
const description =
  "Practice SSB Thematic Apperception Test (TAT) online across 10 curated sets (11 pictures plus 1 blank slide) with real 30s projection and 4m timers.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "https://ssb.cogify.me/tat",
  },
  openGraph: {
    title,
    description,
    url: "https://ssb.cogify.me/tat",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og-image.png"],
  },
};

export default function TatLayout({ children }: { children: React.ReactNode }) {
  return children;
}
