import type { Metadata } from "next";

const title = "Full SSB Psychology Test: TAT, WAT, SRT";
const description =
  "Take the complete 2-hour Stage-2 SSB Psychological Test Battery (TAT, WAT, SRT, SDT) back-to-back with real hall timers, PDF booklet, and AI OLQ review.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "https://ssb.cogify.me/full-test",
  },
  openGraph: {
    title,
    description,
    url: "https://ssb.cogify.me/full-test",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og-image.png"],
  },
};

export default function FullTestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
