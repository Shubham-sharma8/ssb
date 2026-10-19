import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Active TAT Hall Session — ssb.cogify.me",
  description:
    "Active SSB Thematic Apperception Test (TAT) projector session runner.",
  alternates: {
    canonical: "https://ssb.cogify.me/tat",
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
