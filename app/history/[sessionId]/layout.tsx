import type { Metadata } from "next";

const title = "SSB TAT Session Story Review, OLQ Log | ssb.cogify.me";
const description =
  "Inspect your completed SSB TAT session stories, per-slide observation and writing durations, and structured Officer Like Qualities (OLQ) review.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "https://ssb.cogify.me/history",
  },
  openGraph: {
    title,
    description,
    url: "https://ssb.cogify.me/history",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og-image.png"],
  },
  robots: {
    index: false,
    follow: true,
    googleBot: {
      index: false,
      follow: true,
    },
  },
};

export default function SessionReviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
