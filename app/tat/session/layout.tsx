import type { Metadata } from "next";

const title = "Active SSB TAT Hall Projector Session | ssb.cogify.me";
const description =
  "Active SSB Thematic Apperception Test (TAT) hall projector session with 30-second picture observation and 4-minute notebook story writing intervals.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "https://ssb.cogify.me/tat",
  },
  openGraph: {
    title,
    description,
    url: "https://ssb.cogify.me/tat",
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

export default function TatSessionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
