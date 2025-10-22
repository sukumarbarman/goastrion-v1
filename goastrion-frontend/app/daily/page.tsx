// app/daily/page.tsx
import type { Metadata } from "next";
import DailyClient from "@/app/components/daily/DailyClient";

export const metadata: Metadata = {
  title: "Daily — GoAstrion",
  description: "Supportive windows, highlights, and remedies for your day.",
};

export default function DailyPage() {
  return <DailyClient />;
}
