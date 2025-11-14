// ================================================
// app/contact/page.tsx
// SEO + AdSense Friendly Contact Page (safe version)
// ================================================
import Container from "../components/Container";
import ContactForm from "../components/ContactForm";

export const metadata = {
  title: "Contact Us | GoAstrion",
  description:
    "Reach out to the GoAstrion team for support, feedback, partnership enquiries, technical issues, or general questions. We usually respond within 24–48 hours.",
};

export default function ContactPage() {
  return (
    <Container>
      <div className="max-w-3xl mx-auto py-10 px-4">
        {/* Hero */}
        <h1 className="text-2xl md:text-3xl font-bold text-cyan-300">
          Contact Us
        </h1>
        <p className="text-slate-300 mt-3 leading-relaxed">
          We&apos;re here to help! Whether you have a question about your birth chart,
          need technical support, want to report a bug, or simply share your
          feedback about GoAstrion &mdash; feel free to reach out.
          Our team typically responds within <strong>24&ndash;48 hours</strong>.
        </p>

        {/* Why Contact Section */}
        <div className="mt-8 bg-white/5 border border-white/10 rounded-xl p-5">
          <h2 className="text-xl font-semibold text-cyan-200">
            When Should You Contact Us?
          </h2>
          <ul className="list-disc list-inside text-slate-300 mt-3 space-y-2">
            <li>Help with using GoAstrion features (charts, timing tools, guides).</li>
            <li>Incorrect birth chart data or calculation issues.</li>
            <li>Technical problems like page errors or slow loading.</li>
            <li>Feedback for improving accuracy or user experience.</li>
            <li>General queries about services, features, or updates.</li>
            <li>Business or partnership enquiries.</li>
          </ul>
        </div>

        {/* Response Policy */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-cyan-200">
            Our Response Policy
          </h2>
          <p className="text-slate-300 mt-2 leading-relaxed">
            Every message is reviewed by a member of our team. While we usually reply
            within two days, complex requests may take a little longer.
            For time-sensitive issues, please include as much detail as possible so we
            can assist you quickly.
          </p>
        </div>

        {/* Contact Form */}
        <div className="mt-10">
          <h2 className="text-xl font-semibold text-cyan-200 mb-2">
            Send Us a Message
          </h2>
          <ContactForm />
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-slate-400 text-sm leading-relaxed">
          <p>
            GoAstrion is committed to providing high-quality guidance through
            astrology, research-based insights, and modern tools.
            This contact page is for customer support and general enquiries only.
            For legal, privacy, or data-related requests, please visit our{" "}
            <a
              href="/privacy-policy"
              className="text-cyan-400 hover:underline"
            >
              Privacy Policy
            </a>{" "}
            or{" "}
            <a
              href="/terms"
              className="text-cyan-400 hover:underline"
            >
              Terms of Service
            </a>.
          </p>
        </div>
      </div>
    </Container>
  );
}
