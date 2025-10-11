// app/results/page.tsx
import type { Metadata } from "next";
import ResultsClient from "./ResultsClient";

export const metadata: Metadata = {
  title: "Sample Report · GoAstrion",
  description:
    "Preview a GoAstrion report: Life Wheel (Domains), Skills, ShubhDin good days, MD/AD timing, and Saturn · Sade Sati notes.",
  alternates: { canonical: "https://goastrion.com/results" },
};

export default function ResultsPage() {
  return <ResultsClient />;
}
