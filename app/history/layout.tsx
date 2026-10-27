import type { Metadata } from "next";

const title = "Saved SSB Practice Sessions and History";
const description =
  "Review your saved SSB TAT practice sessions, story drafts, timing logs, and 15 OLQ self-evaluation checklists stored locally in your browser.";

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

export default function HistoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
