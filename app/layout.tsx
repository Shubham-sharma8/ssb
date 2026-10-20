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

export const metadata: Metadata = {
  metadataBase: new URL("https://ssb.cogify.me"),
  applicationName: "ssb.cogify.me — SSB Practice",
  category: "education",
  title: {
    default:
      "ssb.cogify.me — #1 SSB Test Practice Platform: Psychology (TAT, WAT, SRT, SDT), GTO & Interview",
    template: "%s | ssb.cogify.me — SSB Practice by COGIFY",
  },
  description:
    "ssb.cogify.me by COGIFY (cogify.me) — India's #1 Services Selection Board (SSB) Stage-2 Test Practice Platform covering Psychological Battery (TAT, WAT, SRT, SDT & Full Hall Simulator), GTO Tasks (GD, GPE, PGT, Lecturette Timer), and Personal Interview (CIQ Rapid-Fire & PIQ). Includes Question Booklet PDF export and Pin-Point AI Evaluation Prompts.",
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
    title:
      "ssb.cogify.me — #1 SSB Practice Platform (Psychology · GTO · Interview)",
    description:
      "Practice TAT, WAT, SRT, SDT, Full Psychological Battery, GTO Lecturette & Tasks, and Personal Interview CIQs with Question Booklet PDF export & Pin-Point AI Evaluation Prompts.",
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
    title:
      "ssb.cogify.me — #1 SSB Test Practice (Psychology, GTO & Interview)",
    description:
      "Real SSB Stage-2 Practice Platform with 10 TAT sets, 60-word WAT with 15s beep, 60-SRT sheets, SDT, GTO Lecturette Timer, Interview CIQ Simulator & AI Evaluation Prompts.",
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
  verification: {
    google: "ssb-cogify-me-gsc-verified",
    other: {
      "msvalidate.01": "ssb-cogify-me-bing-verified",
    },
  },
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
      "@type": "WebApplication",
      "@id": "https://ssb.cogify.me/#webapp",
      name: "ssb.cogify.me — SSB Stage-2 Test Practice Platform (Psychology, GTO & Interview)",
      url: "https://ssb.cogify.me",
      image: "https://ssb.cogify.me/og-image.webp",
      screenshot: "https://ssb.cogify.me/og-image.png",
      applicationCategory: "EducationalApplication",
      operatingSystem: "Any",
      inLanguage: "en-IN",
      isAccessibleForFree: true,
      description:
        "Authentic Indian Services Selection Board (SSB) Stage-2 Practice Platform covering Psychological Tests (TAT, WAT, SRT, SDT), GTO Tasks (Lecturette Timer & 9 GTO Tasks), and Personal Interview (CIQ Rapid-Fire Simulator) with PDF Question Booklet export and Pin-Point AI evaluation prompts.",
      author: {
        "@id": "https://ssb.cogify.me/#author",
      },
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "INR",
      },
      publisher: {
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
      },
    },
    {
      "@type": "Person",
      "@id": "https://ssb.cogify.me/#author",
      name: "COGIFY Defence Psychology & GTO Research Team",
      url: "https://ssb.cogify.me/about",
      jobTitle: "SSB Stage-II Assessment & DIPR Methodology Researchers",
      worksFor: {
        "@id": "https://cogify.me/#organization",
      },
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
      sameAs: ["https://cogify.me", "https://ssb.cogify.me"],
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://ssb.cogify.me/#breadcrumbs",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "SSB Practice Home",
          item: "https://ssb.cogify.me/",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Complete SSB Psychological Test",
          item: "https://ssb.cogify.me/full-test",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "TAT Practice (11 Pictures + 1 Blank)",
          item: "https://ssb.cogify.me/tat",
        },
        {
          "@type": "ListItem",
          position: 4,
          name: "WAT Practice (60 Words · 15s Beep)",
          item: "https://ssb.cogify.me/wat",
        },
        {
          "@type": "ListItem",
          position: 5,
          name: "SRT Practice (60 Situations · 30m)",
          item: "https://ssb.cogify.me/srt",
        },
        {
          "@type": "ListItem",
          position: 6,
          name: "SDT Practice (5 Paragraphs · 15m)",
          item: "https://ssb.cogify.me/sdt",
        },
        {
          "@type": "ListItem",
          position: 7,
          name: "GTO Tasks & Lecturette Timer",
          item: "https://ssb.cogify.me/gto",
        },
        {
          "@type": "ListItem",
          position: 8,
          name: "Personal Interview & CIQ Rapid-Fire",
          item: "https://ssb.cogify.me/interview",
        },
      ],
    },
    {
      "@type": "FAQPage",
      "@id": "https://ssb.cogify.me/#faq",
      mainEntity: [
        {
          "@type": "Question",
          name: "How does the SSB Stage-2 Psychology Test work on ssb.cogify.me?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "ssb.cogify.me replicates the exact SSB Testing Hall sequence: TAT projects 11 pictures + 1 blank slide (30s picture projection followed by 4 minutes of notebook writing with no visible countdown), WAT projects 60 words for 15 seconds each with a hall beep and a 30-second page-turn timer after every 20 words, SRT displays 60 situations (5 per sheet) under an invisible 30-minute timer, and SDT provides 15 minutes for the 5 official Self-Description paragraphs.",
          },
        },
        {
          "@type": "Question",
          name: "Can I download my attempted Question Booklet PDF and get AI evaluation?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. After completing any test or finishing early (TAT, WAT, SRT, SDT, or the Complete Psychological Test), you can export the exact attempted Question Booklet as a PDF and copy a tailored Pin-Point AI Psychologist Evaluation Prompt to review your handwritten notebook responses against the 15 Officer Like Qualities (OLQs).",
          },
        },
        {
          "@type": "Question",
          name: "Does ssb.cogify.me include GTO Officer Tasks and Personal Interview practice?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. The GTO Hub includes an interactive 3-Minute Lecturette Card & Hall Timer (with a 30-second warning beep and 24 real SSB topics) plus complete frameworks for all 9 GTO tasks (GD, GPE, PGT, HGT, GOR, IO, CT, FGT). The Interview Hub includes a PIQ Form Structuring guide and an interactive CIQ (Comprehensive Information Questionnaire) Rapid-Fire Simulator.",
          },
        },
        {
          "@type": "Question",
          name: "Which SSB Selection Centers are covered in the WAT and TAT datasets?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "The platform includes 118 verified TAT stimulus slides across Set 1 to Set 10, 60-word Selection Center WAT sets calibrated from SSB Allahabad (11/14/18/19/34 SSB), SSB Bhopal (20/21/22 SSB), SSB Bangalore (17/24 SSB), SSB Jalandhar, 1 AFSB Dehradun, 2 AFSB Mysuru, 4 AFSB Varanasi, and 180 Situation Reaction Test (SRT) items.",
          },
        },
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
