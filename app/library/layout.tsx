import type { Metadata } from "next";

const title = "SSB TAT Picture Library: 10 Sets (120)";
const description =
  "Browse all 10 official-format SSB TAT picture sets (110 stimulus pictures plus 10 blank slides) to preview prompts and practice OLQ story construction.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "https://ssb.cogify.me/library",
  },
  openGraph: {
    title,
    description,
    url: "https://ssb.cogify.me/library",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og-image.png"],
  },
};

export default function LibraryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
