import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppShell } from "@/components/ui/AppShell";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfcfe" },
    { media: "(prefers-color-scheme: dark)", color: "#06080d" },
  ],
};

const googleVerification =
  process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim();
const bingVerification = process.env.NEXT_PUBLIC_BING_VERIFICATION?.trim();

const verificationMetadata: Metadata["verification"] | undefined =
  googleVerification || bingVerification
    ? {
        ...(googleVerification ? { google: googleVerification } : {}),
        ...(bingVerification
          ? {
              other: {
                "msvalidate.01": [bingVerification],
              },
            }
          : {}),
      }
    : undefined;

export const metadata: Metadata = {
  metadataBase: new URL("https://ssb.cogify.me"),
  applicationName: "ssb.cogify.me — SSB Practice",
  category: "education",
  title: {
    default: "Free SSB Practice Online: TAT, WAT, SRT, SDT, GTO | COGIFY",
    template: "%s | ssb.cogify.me",
  },
  description:
    "Practice SSB Psychology (TAT, WAT, SRT, SDT), GTO tasks, and Personal Interview online with real Indian Defence timers, PDF booklets, and AI OLQ review.",
  keywords: [
    "SSB practice",
    "SSB test practice",
    "SSB psychology test practice",
    "SSB GTO practice",
    "SSB interview practice",
    "SSB lecturette timer",
    "SSB CIQ rapid fire",
    "TAT practice SSB",
    "WAT practice SSB",
    "SRT practice SSB",
    "SDT practice SSB",
    "SSB Stage 2 psychology simulator",
    "Thematic Apperception Test SSB",
    "Word Association Test SSB",
    "Situation Reaction Test SSB",
    "Self Description Test SSB",
    "SSB Allahabad WAT words",
    "SSB Bhopal WAT practice",
    "SSB Jalandhar WAT sets",
    "SSB Kapurthala WAT sets",
    "SSB Bangalore WAT practice",
    "NDA CDS AFCAT SSB preparation",
    "ssb.cogify.me",
    "cogify.me",
  ],
  authors: [{ name: "COGIFY", url: "https://cogify.me" }],
  creator: "COGIFY (cogify.me)",
  publisher: "COGIFY (cogify.me)",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "https://ssb.cogify.me",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: ["/favicon.ico"],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SSB Practice",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://ssb.cogify.me",
    siteName: "ssb.cogify.me — SSB Test Practice Platform",
    title: "Free SSB Practice Online: TAT, WAT, SRT, SDT, GTO | COGIFY",
    description:
      "Practice SSB Psychology (TAT, WAT, SRT, SDT), GTO tasks, and Personal Interview online with real Indian Defence timers, PDF booklets, and AI OLQ review.",
    images: [
      {
        url: "/og-image.webp",
        secureUrl: "https://ssb.cogify.me/og-image.webp",
        width: 1200,
        height: 630,
        type: "image/webp",
        alt: "ssb.cogify.me — India's #1 SSB Stage-2 Psychology, GTO & Interview Practice Platform",
      },
      {
        url: "/og-image.png",
        secureUrl: "https://ssb.cogify.me/og-image.png",
        width: 1200,
        height: 630,
        type: "image/png",
        alt: "ssb.cogify.me — India's #1 SSB Stage-2 Psychology, GTO & Interview Practice Platform",
      },
      {
        url: "/og-image.jpg",
        secureUrl: "https://ssb.cogify.me/og-image.jpg",
        width: 1200,
        height: 630,
        type: "image/jpeg",
        alt: "ssb.cogify.me — SSB Stage-2 Psychology, GTO & Interview Practice Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free SSB Practice Online: TAT, WAT, SRT, SDT, GTO | COGIFY",
    description:
      "Practice SSB Psychology (TAT, WAT, SRT, SDT), GTO tasks, and Personal Interview online with real Indian Defence timers, PDF booklets, and AI OLQ review.",
    images: [
      {
        url: "/twitter-image.png",
        width: 1200,
        height: 630,
        alt: "ssb.cogify.me — India's #1 SSB Stage-2 Test Practice Platform",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  ...(verificationMetadata ? { verification: verificationMetadata } : {}),
  manifest: "/manifest.json",
};

const ssbJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://ssb.cogify.me/#website",
      url: "https://ssb.cogify.me",
      name: "ssb.cogify.me — SSB Stage-2 Test Practice Platform",
      alternateName: ["SSB Practice by COGIFY", "ssb.cogify.me"],
      inLanguage: "en-IN",
      publisher: {
        "@id": "https://cogify.me/#organization",
      },
    },
    {
      "@type": "Organization",
      "@id": "https://cogify.me/#organization",
      name: "COGIFY",
      url: "https://cogify.me",
      logo: {
        "@type": "ImageObject",
        url: "https://ssb.cogify.me/icon-512.png",
        width: 512,
        height: 512,
      },
      sameAs: [
        "https://cogify.me",
        "https://biodata.cogify.me",
        "https://ssb.cogify.me",
      ],
    },
    {
      "@type": "Person",
      "@id": "https://cogify.me/#founder",
      name: "COGIFY Defence Psychology & GTO Research Team",
      url: "https://ssb.cogify.me/about",
      jobTitle: "SSB Stage-II Assessment & DIPR Methodology Researchers",
      worksFor: {
        "@id": "https://cogify.me/#organization",
      },
      sameAs: [
        "https://cogify.me",
        "https://biodata.cogify.me",
        "https://ssb.cogify.me",
      ],
      knowsAbout: [
        "DIPR SSB Psychological Assessment",
        "Thematic Apperception Test (TAT)",
        "Word Association Test (WAT)",
        "Situation Reaction Test (SRT)",
        "Self-Description Test (SDT)",
        "GTO 9-Task Series & Lecturette",
        "15 Officer Like Qualities (OLQs)",
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light scroll-smooth">
      <body className="min-h-screen bg-[#fbfcfe] dark:bg-[#06080d] text-zinc-900 dark:text-zinc-100 antialiased selection:bg-indigo-500/20 dark:selection:bg-indigo-500/30 selection:text-indigo-900 dark:selection:text-white flex flex-col justify-between transition-colors duration-200 overflow-x-hidden font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ssbJsonLd) }}
        />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
