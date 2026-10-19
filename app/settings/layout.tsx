import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Simulator Settings, Theme Preferences & Local JSON Backup",
  description:
    "Configure SSB hall simulator timings, audio beep cues, light/dark theme preferences, and export or import local practice session backups on ssb.cogify.me.",
  alternates: {
    canonical: "https://ssb.cogify.me/settings",
  },
  openGraph: {
    title: "Simulator Settings & Local Data Backup | ssb.cogify.me",
    description:
      "Customize SSB simulator timings, audio cues, theme mode, and local session data backups.",
    url: "https://ssb.cogify.me/settings",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
