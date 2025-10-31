// app/privacy/page.tsx
import Container from "@/app/components/Container";

export const metadata = {
  title: "Privacy Policy | GoAstrion",
  description:
    "GoAstrion respects your privacy. Learn how we collect, use, and protect your information while providing personalized astrology and learning insights.",
};

export default function PrivacyPage() {
  return (
    <Container>
      <section className="py-10 text-slate-200">
        <h1 className="text-3xl font-semibold mb-6 text-white">
          Privacy Policy
        </h1>

        <p className="mb-4">
          <strong>Effective Date:</strong> {new Date().getFullYear()}
        </p>

        <p className="mb-6">
          At <strong>GoAstrion</strong> (accessible at{" "}
          <a href="https://goastrion.com" className="text-cyan-400 underline">
            https://goastrion.com
          </a>
          ), we value your trust and are committed to protecting your personal
          information. This Privacy Policy explains how we collect, use, and
          safeguard your data when you use our website, apps, and services.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3 text-white">
          1. Information We Collect
        </h2>
        <ul className="list-disc list-inside mb-6 space-y-2">
          <li>
            <strong>Personal Information:</strong> When you create an account or
            submit your birth details, we may collect your name, email address,
            date, time, and place of birth.
          </li>
          <li>
            <strong>Usage Data:</strong> We automatically collect information
            like IP address, browser type, device data, and usage analytics via
            cookies and Google Analytics.
          </li>
          <li>
            <strong>Cookies:</strong> We use cookies and similar technologies to
            improve your user experience, remember preferences, and display
            relevant ads.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-3 text-white">
          2. How We Use Your Information
        </h2>
        <ul className="list-disc list-inside mb-6 space-y-2">
          <li>To generate accurate Vedic astrology charts and insights.</li>
          <li>
            To improve our services, personalize content, and recommend
            relevant insights.
          </li>
          <li>
            To send occasional product updates, newsletters, or notifications
            (only if you opt in).
          </li>
          <li>
            To serve contextual ads via Google AdSense and measure engagement.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-3 text-white">
          3. Third-Party Services
        </h2>
        <p className="mb-6">
          We may use third-party tools such as Google Analytics, Google
          AdSense, and other ad or analytics providers that collect anonymous
          data using cookies or tracking pixels. These services may use your
          browsing data to deliver personalized ads or measure website
          performance. You can learn more and opt out of personalized ads at{" "}
          <a
            href="https://adssettings.google.com"
            className="text-cyan-400 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google Ad Settings
          </a>
          .
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3 text-white">
          4. Data Security
        </h2>
        <p className="mb-6">
          We implement modern encryption, HTTPS, and secure server environments
          to protect your data. However, no method of online transmission is
          100% secure. By using GoAstrion, you acknowledge and accept this risk.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3 text-white">
          5. Your Rights & Choices
        </h2>
        <ul className="list-disc list-inside mb-6 space-y-2">
          <li>Access, correct, or delete your personal information.</li>
          <li>Opt out of cookies via your browser settings.</li>
          <li>
            Unsubscribe from marketing emails by clicking the link in the email
            footer.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-3 text-white">
          6. Children’s Privacy
        </h2>
        <p className="mb-6">
          Our website is not intended for users under the age of 13. We do not
          knowingly collect personal data from minors. If you believe a child
          has provided us data, please contact us to remove it.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3 text-white">
          7. Updates to This Policy
        </h2>
        <p className="mb-6">
          We may update this Privacy Policy from time to time. Changes will be
          reflected on this page with a new effective date. Continued use of
          GoAstrion means you agree to the latest version.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3 text-white">
          8. Contact Us
        </h2>
        <p>
          If you have any questions or concerns about this Privacy Policy,
          please contact us at:{" "}
          <a
            href="mailto:info@goastrion.com"
            className="text-cyan-400 underline"
          >
            info@goastrion.com
          </a>
        </p>
      </section>
    </Container>
  );
}
