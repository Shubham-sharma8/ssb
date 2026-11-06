import type { Metadata } from "next";
import {
  getPracticeSets,
  getStimuliForSet,
  getStimulusImageSrc,
  getStimulusSeoAlt,
  getStimulusSeoCaption,
  getStimulusSeoTitle,
} from "@/lib/tat/catalog";

const title = "SSB TAT & PPDT Practice: 10 Sets, 30s/4m Timer";
const description =
  "Practice SSB Stage-2 Thematic Apperception Test (TAT) & Stage-1 Screening PPDT online across 10 curated sets (120 slides) with real 30s/4m timers.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "SSB TAT practice online",
    "SSB PPDT practice timer",
    "PPDT pictures with 30 second timer",
    "TAT pictures SSB set 1 to 10",
    "Thematic Apperception Test SSB simulator",
    "Picture Perception and Description Test SSB",
    "SSB psychology test practice",
  ],
  alternates: {
    canonical: "https://ssb.cogify.me/tat",
  },
  openGraph: {
    title,
    description,
    url: "https://ssb.cogify.me/tat",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SSB TAT & PPDT Simulator — 10 Sets (30s Observation / 4m Story Timer) on ssb.cogify.me",
      },
      {
        url: "/tat-sets/SET-1/01.webp",
        width: 2135,
        height: 1584,
        alt: "SSB TAT & PPDT Picture — SET 1 Picture 1: Young man buttoning shirt with another man in right foreground",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og-image.png"],
  },
};

export default function TatLayout({ children }: { children: React.ReactNode }) {
  const sets = getPracticeSets();
  const leadSetImages = sets.flatMap((set) => {
    const firstStim = getStimuliForSet(set.id)[0];
    if (!firstStim) return [];
    const imgPath = getStimulusImageSrc(firstStim);
    return [
      {
        "@type": "ImageObject",
        "@id": `https://ssb.cogify.me/tat#${set.id}-lead-image`,
        name: getStimulusSeoTitle(firstStim, set.title),
        description: getStimulusSeoAlt(firstStim, set.title),
        caption: getStimulusSeoCaption(firstStim, set.title),
        contentUrl: `https://ssb.cogify.me${imgPath}`,
        url: `https://ssb.cogify.me/tat?setId=${set.id}`,
        encodingFormat: "image/webp",
        width: firstStim.width,
        height: firstStim.height,
        license: "https://ssb.cogify.me/about",
        acquireLicensePage: "https://ssb.cogify.me/about",
        creditText: "SSB Practice Studio by COGIFY (ssb.cogify.me)",
        copyrightNotice: "© 2026 COGIFY Technologies (cogify.me)",
        creator: {
          "@type": "Organization",
          name: "COGIFY Technologies",
          url: "https://cogify.me",
        },
      },
    ];
  });

  const tatJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LearningResource",
        "@id": "https://ssb.cogify.me/tat#learning-resource",
        name: title,
        description,
        url: "https://ssb.cogify.me/tat",
        learningResourceType: "Practice Examination Simulator",
        educationalUse: [
          "SSB Stage-1 Screening PPDT (Picture Perception & Description Test)",
          "SSB Stage-2 Psychology TAT (Thematic Apperception Test)",
        ],
        inLanguage: "en-IN",
        isAccessibleForFree: true,
        image: leadSetImages,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(tatJsonLd) }}
      />
      {children}
    </>
  );
}
