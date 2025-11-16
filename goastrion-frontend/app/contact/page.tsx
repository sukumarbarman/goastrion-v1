// ================================================
// app/contact/page.tsx
// ================================================
import Container from "../components/Container";
import ContactForm from "../components/ContactForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | GoAstrion",
  description:
    "Contact GoAstrion for support, feedback, partnership enquiries, calculation issues, or general questions. Get a response within 24–48 hours.",
  keywords: [
    "GoAstrion contact",
    "astrology support",
    "Vedic astrology help",
    "GoAstrion help",
    "GoAstrion feedback",
    "astrology app support"
  ],
  alternates: {
    canonical: "https://goastrion.com/contact",
  },
  openGraph: {
    title: "Contact Us | GoAstrion",
    description:
      "Get support, report issues, share feedback, or get help with charts and features. GoAstrion responds within 24–48 hours.",
    url: "https://goastrion.com/contact",
    siteName: "GoAstrion",
    images: [
      {
        url: "https://goastrion.com/og/contact.jpg",
        width: 1200,
        height: 630,
        alt: "Contact GoAstrion",
      },
    ],
    type: "website",
    locale: "en-IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Us | GoAstrion",
    description:
      "Need help? Contact the GoAstrion team for support, feedback, or partnership enquiries.",
    images: ["https://goastrion.com/og/contact.jpg"],
  },
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
          feedback — feel free to reach out. Our team typically responds within
          <strong> 24–48 hours</strong>.
        </p>

        {/* Why Contact Section */}
        <div className="mt-8 bg-white/5 border border-white/10 rounded-xl p-5">
          <h2 className="text-xl font-semibold text-cyan-200">
            When Should You Contact Us?
          </h2>
          <ul className="list-disc list-inside text-slate-300 mt-3 space-y-2">
            <li>Help with using GoAstrion features.</li>
            <li>Incorrect birth chart or calculation issues.</li>
            <li>Technical problems or bugs.</li>
            <li>Feedback for accuracy or UX improvements.</li>
            <li>General queries about services or updates.</li>
            <li>Business or partnership enquiries.</li>
          </ul>
        </div>

        {/* Response Policy */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-cyan-200">
            Our Response Policy
          </h2>
          <p className="text-slate-300 mt-2 leading-relaxed">
            Every message is reviewed by our team. Most responses are sent within
            24–48 hours. For urgent issues, please include complete details.
          </p>
        </div>

        {/* Form */}
        <div className="mt-10">
          <h2 className="text-xl font-semibold text-cyan-200 mb-2">
            Send Us a Message
          </h2>
          <ContactForm />
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-slate-400 text-sm leading-relaxed">
          <p>
            GoAstrion provides high-quality astrology guidance and modern tools.
            This page is for customer support. For legal or privacy matters, visit{" "}
            <a href="/privacy-policy" className="text-cyan-400 hover:underline">
              Privacy Policy
            </a>
            {" "}or{" "}
            <a href="/terms" className="text-cyan-400 hover:underline">
              Terms of Service
            </a>.
          </p>
        </div>

      </div>
    </Container>
  );
}
