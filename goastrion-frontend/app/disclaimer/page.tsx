// app/disclaimer/page.tsx
import Container from "@/app/components/Container";

export const metadata = {
  title: "Disclaimer | GoAstrion",
  description:
    "Read the official disclaimer of GoAstrion. Astrology insights are meant for guidance, learning, and self-awareness — not as absolute predictions or guarantees.",
};

export default function DisclaimerPage() {
  return (
    <Container>
      <section className="py-10 text-slate-200">
        <h1 className="text-3xl font-semibold mb-6 text-white">
          Disclaimer
        </h1>

        <p className="mb-6">
          <strong>Last updated:</strong> {new Date().getFullYear()}
        </p>

        <p className="mb-6">
          The information provided on{" "}
          <a
            href="https://goastrion.com"
            className="text-cyan-400 underline"
          >
            GoAstrion.com
          </a>{" "}
          is for general informational and educational purposes only. All
          astrology, planetary, and timing insights available on this website
          are intended to help users understand patterns and possibilities in
          life — not to guarantee specific outcomes or future events.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3 text-white">
          No Professional Advice
        </h2>
        <p className="mb-6">
          GoAstrion does not provide medical, financial, psychological, or legal
          advice. The content, including astrology readings, reports, and
          predictions, should not replace professional consultation. Users are
          encouraged to exercise their own judgment and discretion in any
          personal or professional decisions.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3 text-white">
          Accuracy and Limitations
        </h2>
        <p className="mb-6">
          While we make every effort to ensure that the data, charts, and
          interpretations are accurate and generated from authentic Vedic
          astrology principles, GoAstrion makes no representation or warranty
          regarding the accuracy, completeness, or reliability of the
          information provided. Results may vary depending on multiple factors
          including birth data precision and astrological methods.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3 text-white">
          External Links and Third-Party Services
        </h2>
        <p className="mb-6">
          Our website may include links to external websites or third-party
          services, such as Google Ads or analytics tools. These are provided
          for convenience, and GoAstrion has no control over or responsibility
          for their content, accuracy, or data practices.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3 text-white">
          Use at Your Own Risk
        </h2>
        <p className="mb-6">
          By accessing and using GoAstrion, you acknowledge and agree that any
          reliance on information, charts, or insights is at your own risk.
          GoAstrion, its team, or affiliates shall not be held responsible or
          liable for any loss, damages, or outcomes resulting from decisions or
          actions taken based on our platform's content.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3 text-white">
          Consent
        </h2>
        <p className="mb-6">
          By using our website, you hereby consent to this disclaimer and agree
          to its terms. If you do not agree, please discontinue use of
          GoAstrion immediately.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3 text-white">
          Contact
        </h2>
        <p>
          For questions about this disclaimer, please contact us at{" "}
          <a
            href="mailto:info@goastrion.com"
            className="text-cyan-400 underline"
          >
            info@goastrion.com
          </a>
          .
        </p>
      </section>
    </Container>
  );
}
