// goastrion-frontend/app/daily/page.tsx
import DailyClient from "@/app/components/daily/DailyClient";

export const metadata = {
  title: "Daily — GoAstrion",
  description: "Supportive windows, highlights, and remedies for your day.",
};

export default function DailyPage() {
  return <DailyClient />;
}
