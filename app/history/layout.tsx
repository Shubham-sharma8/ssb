import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SSB Practice Session History & Self-Review Workspace",
  description:
    "Review your completed and in-progress SSB TAT practice sessions, inspect story drafts, and run structured self-review checklists.",
  alternates: {
    canonical: "https://ssb.cogify.me/history",
  },
  openGraph: {
    title: "SSB Practice Session History & Review | ssb.cogify.me",
    description:
      "Review your SSB practice sessions, handwritten story notes, and self-review checklists on ssb.cogify.me.",
    url: "https://ssb.cogify.me/history",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
};

export default function HistoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
