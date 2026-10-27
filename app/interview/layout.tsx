import type { Metadata } from "next";

const title = "SSB Personal Interview, PIQ Simulator";
const description =
  "Prepare for the SSB Personal Interview with interactive Rapid-Fire CIQ simulators, PIQ-based questions, 15 OLQ mapping, and AI Interviewing Officer review.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "https://ssb.cogify.me/interview",
  },
  openGraph: {
    title,
    description,
    url: "https://ssb.cogify.me/interview",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og-image.png"],
  },
};

export default function InterviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
