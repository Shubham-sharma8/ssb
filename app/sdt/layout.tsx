import type { Metadata } from "next";

const title = "SSB SDT Practice: Self-Description Test";
const description =
  "Practice the SSB Self-Description Test (SDT) with all 5 official prompts (Parents, Teachers, Friends, Self, Aims), 15m hall timer, and AI OLQ review.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "https://ssb.cogify.me/sdt",
  },
  openGraph: {
    title,
    description,
    url: "https://ssb.cogify.me/sdt",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og-image.png"],
  },
};

export default function SdtLayout({ children }: { children: React.ReactNode }) {
  return children;
}
