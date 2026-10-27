import type { Metadata } from "next";

const title = "SSB WAT Practice: 60 Words, 15s Timer";
const description =
  "Practice SSB Word Association Test (WAT) online with 60-word sets from Allahabad, Bhopal, and Jalandhar boards, 15s audio cues, and AI OLQ evaluation.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "https://ssb.cogify.me/wat",
  },
  openGraph: {
    title,
    description,
    url: "https://ssb.cogify.me/wat",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og-image.png"],
  },
};

export default function WatLayout({ children }: { children: React.ReactNode }) {
  return children;
}
