import React from "react";
import SessionReviewClient from "./SessionReviewClient";

export function generateStaticParams() {
  return [{ sessionId: "placeholder" }];
}

export default function SessionReviewDetailPage() {
  return <SessionReviewClient />;
}
