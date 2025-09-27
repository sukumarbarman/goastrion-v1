// app/faq/page.tsx
import Script from "next/script";
import Link from "next/link";

export const metadata = {
  title: "GoAstrion FAQs",
  description:
    "Answers to common questions about generating North Indian (Vedic) birth charts, highlights, privacy, and more.",
  alternates: { canonical: "https://goastrion.com/faq" },
};

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
          "You’ll need your date of birth, time of birth, and place (latitude/longitude improves accuracy).",
      },
    },
    {
      "@type": "Question",
      name: "What are Domains and Skills in the results?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "Domains summarize areas like Career, Finance, Marriage, and Health from house strengths and aspects. Skills highlight personal tendencies such as analytical ability and leadership.",
      },
    },
    {
      "@type": "Question",
      name: "Is my data private?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "We only use the details you enter to compute your chart and insights. We don’t sell your personal data. See the Privacy page for details.",
      },
    },
    {
      "@type": "Question",
      name: "How accurate are the insights?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "Insights are computed programmatically from planetary placements, house emphasis, and configured rules. They are guidance—not a substitute for professional advice.",
      },
    },
    {
      "@type": "Question",
      name: "Where do I start?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "Go to the Create page, enter your birth details, and generate your chart. Then review Domains and Skills for a guided understanding.",
      },
    },
  ],
} as const;

export default function Page() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-semibold">Frequently Asked Questions</h1>
      <p className="mt-3 opacity-90">
        New to GoAstrion? Start on the{" "}
        <Link href="/create" className="underline decoration-indigo-400 hover:opacity-80">
          Create
        </Link>{" "}
        page, then explore{" "}
        <Link href="/domains" className="underline decoration-indigo-400 hover:opacity-80">
          Domains
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
            You’ll need your date of birth, time of birth, and place (latitude/longitude improves accuracy).
          </p>
        </details>

        <details className="rounded-xl bg-white/5 p-4">
          <summary className="cursor-pointer font-medium">What are Domains and Skills in the results?</summary>
          <p className="mt-2">
            Domains summarize areas like Career, Finance, Marriage, and Health from house strengths and aspects. Skills
            highlight personal tendencies such as analytical ability and leadership.
          </p>
        </details>

        <details className="rounded-xl bg-white/5 p-4">
          <summary className="cursor-pointer font-medium">Is my data private?</summary>
          <p className="mt-2">
            We only use the details you enter to compute your chart and insights. We don’t sell your personal data. See
            our{" "}
            <Link href="/privacy" className="underline decoration-indigo-400 hover:opacity-80">
              Privacy
            </Link>{" "}
            page for details.
          </p>
        </details>

        <details className="rounded-xl bg-white/5 p-4">
          <summary className="cursor-pointer font-medium">How accurate are the insights?</summary>
          <p className="mt-2">
            Insights are computed programmatically from planetary placements, house emphasis, and configured rules. They
            are guidance—not a substitute for professional advice.
          </p>
        </details>

        <details className="rounded-xl bg-white/5 p-4">
          <summary className="cursor-pointer font-medium">Where do I start?</summary>
          <p className="mt-2">
            Go to the{" "}
            <Link href="/create" className="underline decoration-indigo-400 hover:opacity-80">
              Create
            </Link>{" "}
            page, enter your birth details, and generate your chart. Then review{" "}
            <Link href="/domains" className="underline decoration-indigo-400 hover:opacity-80">
              Domains
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
