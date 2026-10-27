import type { Metadata } from "next";

const title = "SSB Practice Hall Timer, App Settings";
const description =
  "Configure your SSB Practice hall timer preferences, sound alerts, display theme, and local IndexedDB session backup export or import options.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "https://ssb.cogify.me/settings",
  },
  openGraph: {
    title,
    description,
    url: "https://ssb.cogify.me/settings",
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

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
