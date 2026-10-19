import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SSB Session Review & AI Evaluation — ssb.cogify.me",
  description:
    "Review your completed SSB Thematic Apperception Test (TAT) session, export your Question Booklet PDF, and copy your Pin-Point AI evaluation prompt.",
  alternates: {
    canonical: "https://ssb.cogify.me/history",
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
