import type { Metadata } from "next";
import {
  getPracticeSets,
  getSlidesForSet,
  getStimulusImageSrc,
  getStimulusSeoAlt,
  getStimulusSeoCaption,
  getStimulusSeoTitle,
} from "@/lib/tat/catalog";

const title = "SSB TAT & PPDT Picture Library: 10 Sets (120 Images)";
const description =
  "Browse all 10 official-format SSB TAT & Stage-1 Screening PPDT picture sets (110 stimulus images + 10 blank slides) with scene descriptions and story timers.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "SSB PPDT pictures",
    "SSB TAT pictures",
    "PPDT images for SSB practice",
    "TAT pictures SSB set 1 to 10",
    "Picture Perception and Description Test images",
    "Thematic Apperception Test pictures SSB",
    "SSB screening PPDT images with stories",
    "SSB Stage 2 psychology TAT images",
    "Indian Army Navy Air Force AFSB PPDT TAT pictures",
  ],
  alternates: {
    canonical: "https://ssb.cogify.me/library",
  },
  openGraph: {
    title,
    description,
    url: "https://ssb.cogify.me/library",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SSB TAT & PPDT Picture Library — 10 Sets (120 Slides) on ssb.cogify.me",
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

export default function LibraryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sets = getPracticeSets();
  const imageObjects = sets.flatMap((set) => {
    const slides = getSlidesForSet(set.id);
    return slides.map((stim) => {
      const imgPath = getStimulusImageSrc(stim);
      const absImgUrl = `https://ssb.cogify.me${imgPath}`;
      const anchorUrl = `https://ssb.cogify.me/library#${set.id}-pic-${stim.canonicalNumber}`;
      return {
        "@type": "ImageObject",
        "@id": `https://ssb.cogify.me/library#${set.id}-${stim.stimulusId}`,
        name: getStimulusSeoTitle(stim, set.title),
        description: getStimulusSeoAlt(stim, set.title),
        caption: getStimulusSeoCaption(stim, set.title),
        contentUrl: absImgUrl,
        url: anchorUrl,
        thumbnailUrl: `https://ssb.cogify.me${stim.assetPath}`,
        encodingFormat: "image/webp",
        width: stim.width,
        height: stim.height,
        representativeOfPage:
          set.id === "set-1" && stim.canonicalNumber === 1,
        license: "https://ssb.cogify.me/about",
        acquireLicensePage: "https://ssb.cogify.me/about",
        creditText: "SSB Practice Studio by COGIFY (ssb.cogify.me)",
        copyrightNotice: "© 2026 COGIFY Technologies (cogify.me)",
        creator: {
          "@type": "Organization",
          name: "COGIFY Technologies",
          url: "https://cogify.me",
        },
      };
    });
  });

  const libraryGalleryJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": "https://ssb.cogify.me/library#webpage",
        url: "https://ssb.cogify.me/library",
        name: title,
        description,
        isPartOf: {
          "@id": "https://ssb.cogify.me/#website",
        },
        mainEntity: {
          "@id": "https://ssb.cogify.me/library#image-gallery",
        },
      },
      {
        "@type": "ImageGallery",
        "@id": "https://ssb.cogify.me/library#image-gallery",
        name: "SSB Stage-1 PPDT & Stage-2 TAT Complete 10-Set Picture Gallery (120 Slides)",
        description:
          "Complete archive of 110 calibrated black-and-white ambiguity illustrations plus 10 blank slides across SET 1 to SET 10 for Indian Armed Forces Services Selection Board (SSB/AFSB/NSB) Screening PPDT and Stage-2 Psychology TAT.",
        url: "https://ssb.cogify.me/library",
        numberOfItems: imageObjects.length,
        associatedMedia: imageObjects,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(libraryGalleryJsonLd),
        }}
      />
      {children}
    </>
  );
}
