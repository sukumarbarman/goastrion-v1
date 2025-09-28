// app/faq/page.tsx
import FaqClient from "./FaqClient";

export const metadata = {
  title: "GoAstrion FAQs",
  description:
    "Answers about charts, the Life Wheel, Skills, timezone handling, languages/localization, latitude/longitude, MD/AD timing—and why you should use GoAstrion.",
  alternates: { canonical: "https://goastrion.com/faq" },
};

export default function Page() {
  return <FaqClient />;
}
