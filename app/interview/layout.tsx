import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SSB Personal Interview Practice: CIQ Rapid-Fire Simulator & PIQ Form Guide",
  description:
    "Prepare for the SSB Personal Interview with an interactive CIQ (Comprehensive Information Questionnaire) Rapid-Fire Simulator (Academics, Family, Hobbies, Defence & Current Affairs) and a complete PIQ Form Structuring guide.",
  alternates: {
    canonical: "https://ssb.cogify.me/interview",
  },
  openGraph: {
    title: "SSB Personal Interview Practice: CIQ Rapid-Fire & PIQ Guide | ssb.cogify.me",
    description:
      "Interactive SSB Interviewing Officer (IO) CIQ Rapid-Fire Simulator and PIQ Form Structuring Blueprint mapped to all 15 OLQs.",
    url: "https://ssb.cogify.me/interview",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "SSB Personal Interview & CIQ Rapid-Fire Simulator | ssb.cogify.me",
    description:
      "Practice timed SSB Interview CIQ sequences and structure your PIQ form for the Interviewing Officer.",
    images: ["/twitter-image.png"],
  },
};

export default function InterviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
