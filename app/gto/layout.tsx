import type { Metadata } from "next";

const title = "SSB GTO Tasks, GPE and Lecturette Timer";
const description =
  "Master all 9 SSB GTO tasks (GD, GPE, PGT, HGT, FGT, Command Task, IO, Snake Race) and practice Lecturette with 16 real topics and 3m prep + 3m timer.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "https://ssb.cogify.me/gto",
  },
  openGraph: {
    title,
    description,
    url: "https://ssb.cogify.me/gto",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og-image.png"],
  },
};

export default function GtoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
