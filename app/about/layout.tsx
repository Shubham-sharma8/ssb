import type { Metadata } from "next";

const title = "About SSB Selection Process and 15 OLQs";
const description =
  "Complete guide to the 5-day Indian Armed Forces SSB selection process, Stage-1 OIR and PPDT, Stage-2 Psychology, GTO, Interview, and the 15 Official OLQs.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "https://ssb.cogify.me/about",
  },
  openGraph: {
    title,
    description,
    url: "https://ssb.cogify.me/about",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og-image.png"],
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
