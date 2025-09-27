// app/faq/page.tsx
import Script from "next/script";
import Link from "next/link";

export const metadata = {
  title: "GoAstrion FAQs",
  description:
    "Answers about charts, the Life Wheel, timezone handling, languages/localization, and whether latitude/longitude are needed.",
  alternates: { canonical: "https://goastrion.com/faq" },
};

// ---------- JSON-LD (Rich Results) ----------
const FAQ_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is the chart free?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "You can generate a basic chart for free on the Create page. Optional premium insights may be offered later.",
      },
    },
    {
      "@type": "Question",
      name: "Do you use Vedic (sidereal) calculations and North Indian style?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "Yes. GoAstrion uses sidereal calculations and renders the chart in North Indian style.",
      },
    },
    {
      "@type": "Question",
      name: "What details do I need to generate a chart?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "You’ll need your date of birth, time of birth, and place. Latitude/longitude is optional but improves accuracy.",
      },
    },
    {
      "@type": "Question",
      name: "What is the Life Wheel?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "Life Wheel is our summary view that highlights key areas like Career, Finance, Marriage, and Health based on house strengths and planetary aspects.",
      },
    },
    {
      "@type": "Question",
      name: "How does timezone work? Do I enter IST/UTC?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "Enter your local birth date and time. The app converts it to UTC internally using the selected timezone. India uses IST (UTC+05:30) and has no daylight saving. For other countries, select the appropriate timezone; we handle offsets automatically.",
      },
    },
    {
      "@type": "Question",
      name: "Which languages are supported (India & international)?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "We support English and are rolling out a full multilingual experience covering major Indian and international languages. " +
          "India: Hindi (hi-IN), Bengali (bn-IN), Marathi (mr-IN), Tamil (ta-IN), Telugu (te-IN), Gujarati (gu-IN), Kannada (kn-IN), Malayalam (ml-IN), Punjabi (pa-IN), Odia (or-IN), Assamese (as-IN), Urdu (ur-IN, RTL). " +
          "International: Spanish (es), Portuguese—Brazil (pt-BR), French (fr), German (de), Indonesian (id), Turkish (tr), Vietnamese (vi), Arabic (ar, RTL), Japanese (ja), Korean (ko), Thai (th), Chinese—Simplified (zh-CN), Chinese—Traditional (zh-TW), Russian (ru), Filipino/Tagalog (fil), Nepali (ne).",
      },
    },
    {
      "@type": "Question",
      name: "Is latitude/longitude required?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "Not required. Selecting a city/place auto-fills coordinates. Exact lat/lon can slightly improve house cusp precision—handy near time zone borders or at high latitudes.",
      },
    },
    {
      "@type": "Question",
      name: "Where do I start?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "Go to the Create page, enter your birth details, and generate your chart. Then review the Life Wheel and Skills for a guided understanding.",
      },
    },
  ],
} as const;

// ---------- Page ----------
export default function Page() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-semibold">Frequently Asked Questions</h1>
      <p className="mt-3 opacity-90">
        New to GoAstrion? Start on the{" "}
        <Link href="/create" className="underline decoration-indigo-400 hover:opacity-80">
          Create
        </Link>{" "}
        page, then explore the{" "}
        <Link href="/domains" className="underline decoration-indigo-400 hover:opacity-80">
          Life Wheel
        </Link>{" "}
        and{" "}
        <Link href="/skills" className="underline decoration-indigo-400 hover:opacity-80">
          Skills
        </Link>
        .
      </p>

      <div className="mt-8 space-y-4 text-slate-200/90">
        <details className="rounded-xl bg-white/5 p-4">
          <summary className="cursor-pointer font-medium">Is the chart free?</summary>
          <p className="mt-2">
            You can generate a basic chart for free on the{" "}
            <Link href="/create" className="underline decoration-indigo-400 hover:opacity-80">
              Create
            </Link>{" "}
            page. Optional premium insights may be offered later.
          </p>
        </details>

        <details className="rounded-xl bg-white/5 p-4">
          <summary className="cursor-pointer font-medium">
            Do you use Vedic (sidereal) calculations and North Indian style?
          </summary>
          <p className="mt-2">
            Yes. GoAstrion uses sidereal calculations and renders the chart in North Indian style.
          </p>
        </details>

        <details className="rounded-xl bg-white/5 p-4">
          <summary className="cursor-pointer font-medium">What details do I need to generate a chart?</summary>
          <p className="mt-2">
            Date of birth, time of birth, and place. Latitude/longitude is optional but improves accuracy.
          </p>
        </details>

        <details className="rounded-xl bg-white/5 p-4">
          <summary className="cursor-pointer font-medium">What is the Life Wheel?</summary>
          <p className="mt-2">
            Life Wheel is our summary view that highlights key areas like Career, Finance, Marriage, and Health based on
            house strengths and planetary aspects.
          </p>
        </details>

        <details className="rounded-xl bg-white/5 p-4">
          <summary className="cursor-pointer font-medium">How does timezone work? Do I enter IST/UTC?</summary>
          <p className="mt-2">
            Enter your <b>local</b> birth date and time. The app converts to UTC internally using the selected timezone.
            India uses IST (UTC+05:30) and has no daylight saving. If you were born outside India, select that
            timezone—we handle the offset automatically.
          </p>
        </details>

        <details className="rounded-xl bg-white/5 p-4">
          <summary className="cursor-pointer font-medium">Which languages are supported (India &amp; international)?</summary>
          <div className="mt-2 space-y-2">
            <p>
              We support <b>English</b> and are rolling out a full multilingual experience covering major Indian and
              international languages.
            </p>
            <p>
              <b>India:</b> Hindi (hi-IN), Bengali (bn-IN), Marathi (mr-IN), Tamil (ta-IN), Telugu (te-IN), Gujarati
              (gu-IN), Kannada (kn-IN), Malayalam (ml-IN), Punjabi (pa-IN), Odia (or-IN), Assamese (as-IN), Urdu (ur-IN, RTL).
            </p>
            <p>
              <b>International:</b> Spanish (es), Portuguese—Brazil (pt-BR), French (fr), German (de), Indonesian (id),
              Turkish (tr), Vietnamese (vi), Arabic (ar, RTL), Japanese (ja), Korean (ko), Thai (th), Chinese—Simplified
              (zh-CN), Chinese—Traditional (zh-TW), Russian (ru), Filipino/Tagalog (fil), Nepali (ne).
            </p>
          </div>
        </details>

        <details className="rounded-xl bg-white/5 p-4">
          <summary className="cursor-pointer font-medium">Is latitude/longitude required?</summary>
          <p className="mt-2">
            Not required. Selecting a city/place auto-fills coordinates. Exact lat/lon can slightly improve house cusp
            precision—handy near time zone borders or at high latitudes.
          </p>
        </details>

        <details className="rounded-xl bg-white/5 p-4">
          <summary className="cursor-pointer font-medium">Where do I start?</summary>
          <p className="mt-2">
            Go to{" "}
            <Link href="/create" className="underline decoration-indigo-400 hover:opacity-80">
              Create
            </Link>
            , enter your birth details, and generate your chart. Then review the{" "}
            <Link href="/domains" className="underline decoration-indigo-400 hover:opacity-80">
              Life Wheel
            </Link>{" "}
            and{" "}
            <Link href="/skills" className="underline decoration-indigo-400 hover:opacity-80">
              Skills
            </Link>
            .
          </p>
        </details>
      </div>

      {/* JSON-LD for rich results */}
      <Script
        id="ld-faq"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_LD) }}
      />
    </main>
  );
}
