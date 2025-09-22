// app/terms/page.tsx
import Link from "next/link";

export const metadata = { title: "Terms & Conditions · GoAstrion" };

export default function TermsPage() {
  return (
    <main className="min-h-[70vh]">
      <section className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl md:text-4xl font-semibold text-white">Terms &amp; Conditions</h1>
        <p className="mt-2 text-slate-400 text-sm">Last updated: September 22, 2025</p>

        <div className="mt-8 space-y-6 text-slate-300 leading-7">
          <section>
            <h2 className="text-white font-medium text-lg">1) Acceptance of Terms</h2>
            <p className="mt-2">
              By accessing or using GoAstrion (“Service”), you agree to be bound by these Terms &amp; Conditions
              (“Terms”). If you do not agree, do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-white font-medium text-lg">2) Eligibility & Accounts</h2>
            <p className="mt-2">
              You must be legally capable of forming a binding contract to use the Service.
              You are responsible for your account credentials and all activity under your account.
            </p>
          </section>

          <section>
            <h2 className="text-white font-medium text-lg">3) Services & Content</h2>
            <p className="mt-2">
              GoAstrion provides astrology-driven insights for educational and informational purposes. We may update,
              change, or discontinue features without notice. We reserve all rights to the content we provide.
            </p>
          </section>

          <section>
            <h2 className="text-white font-medium text-lg">4) No Professional Advice</h2>
            <p className="mt-2">
              Information on GoAstrion does not constitute legal, medical, financial, or psychological advice.
              Decisions you make are your responsibility. For professional advice, consult a qualified professional.
            </p>
          </section>

          <section>
            <h2 className="text-white font-medium text-lg">5) User Conduct</h2>
            <p className="mt-2">
              You agree not to misuse the Service, including (but not limited to) interfering with operation,
              reverse-engineering, scraping, violating applicable laws, or infringing intellectual property rights.
            </p>
          </section>

          <section>
            <h2 className="text-white font-medium text-lg">6) Payments & Refunds</h2>
            <p className="mt-2">
              Paid features (if any) will be billed as stated at checkout. Except where required by law or expressly
              stated, fees are non-refundable. Taxes may apply based on your location.
            </p>
          </section>

          <section>
            <h2 className="text-white font-medium text-lg">7) Privacy</h2>
            <p className="mt-2">
              Your use of the Service is also governed by our{" "}
              <Link href="/privacy" className="text-cyan-300 hover:underline">
                Privacy Policy
              </Link>.
              Please review it to understand how we collect and process data.
            </p>
          </section>

          <section>
            <h2 className="text-white font-medium text-lg">8) Third-Party Links</h2>
            <p className="mt-2">
              The Service may link to third-party sites. We are not responsible for their content, policies, or
              practices; access them at your own risk.
            </p>
          </section>

          <section>
            <h2 className="text-white font-medium text-lg">9) Availability & Changes</h2>
            <p className="mt-2">
              We strive for reliable access but do not guarantee uninterrupted availability. We may modify these Terms
              from time to time. Continued use after changes means you accept the updated Terms.
            </p>
          </section>

          <section>
            <h2 className="text-white font-medium text-lg">10) Limitation of Liability</h2>
            <p className="mt-2">
              To the maximum extent permitted by law, GoAstrion and its affiliates shall not be liable for any indirect,
              incidental, special, consequential, or punitive damages, or any loss of profits or data, arising from or
              related to your use of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-white font-medium text-lg">11) Indemnity</h2>
            <p className="mt-2">
              You agree to indemnify and hold GoAstrion, its officers, employees, and partners harmless from any claims,
              liabilities, damages, and expenses arising from your use of the Service or your breach of these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-white font-medium text-lg">12) Termination</h2>
            <p className="mt-2">
              We may suspend or terminate your access at any time for any reason, including breach of these Terms. Upon
              termination, your right to use the Service ceases immediately.
            </p>
          </section>

          <section>
            <h2 className="text-white font-medium text-lg">13) Governing Law</h2>
            <p className="mt-2">
              These Terms are governed by the laws applicable in India, without regard to conflict-of-laws principles.
              Courts in Kolkata, India shall have exclusive jurisdiction, unless otherwise required by law.
            </p>
          </section>

          <section>
            <h2 className="text-white font-medium text-lg">14) Contact</h2>
            <p className="mt-2">
              Questions? Write to <a href="mailto:info@goastrion.com" className="text-cyan-300 hover:underline">
                info@goastrion.com
              </a>.
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}
