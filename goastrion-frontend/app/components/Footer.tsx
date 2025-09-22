// app/components/Footer.tsx
"use client";

import Link from "next/link";
import Container from "./Container";
import { useI18n } from "../lib/i18n";

export default function Footer() {
  const { t } = useI18n();

  return (
    <footer className="mt-16 border-t border-white/10 bg-black/20">
      <Container>
        <div className="py-8 grid gap-8 md:grid-cols-12 text-sm">
          {/* Brand + brief */}
          <div className="md:col-span-4">
            <div className="text-white font-semibold text-lg">GoAstrion</div>
            <p className="mt-2 text-slate-400">
              {t("site.tagline") === "site.tagline"
                ? "Astrology-powered guidance across Career, Finance, Marriage, and Health."
                : t("site.tagline")}
            </p>

            <div className="mt-4 flex gap-4 text-slate-400">
              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white"
                aria-label="X (Twitter)"
              >
                X
              </a>
              <a
                href="https://www.youtube.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white"
                aria-label="YouTube"
              >
                YouTube
              </a>
              <a
                href="https://www.facebook.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white"
                aria-label="Facebook"
              >
                Facebook
              </a>
            </div>
          </div>

          {/* Product */}
          <nav className="md:col-span-4">
            <div className="text-white font-semibold">
              {t("footer.product") === "footer.product" ? "Product" : t("footer.product")}
            </div>
            <ul className="mt-3 space-y-2 text-slate-300">
              <li>
                <Link href="/skills" className="hover:text-white">
                  {t("footer.links.skills") === "footer.links.skills" ? "Skills" : t("footer.links.skills")}
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white">
                  {t("navbar.pricing") === "navbar.pricing" ? "Pricing" : t("navbar.pricing")}
                </Link>
              </li>
              <li>
                <Link href="/guides" className="hover:text-white">
                  {t("footer.links.guides") === "footer.links.guides" ? "Guides" : t("footer.links.guides")}
                </Link>
              </li>
            </ul>
          </nav>

          {/* Company */}
          <nav className="md:col-span-4">
            <div className="text-white font-semibold">
              {t("footer.company") === "footer.company" ? "Company" : t("footer.company")}
            </div>
            <ul className="mt-3 space-y-2 text-slate-300">
              <li>
                <Link href="/about" className="hover:text-white">
                  {t("navbar.about") === "navbar.about" ? "About" : t("navbar.about")}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white">
                  {t("footer.links.contact") === "footer.links.contact" ? "Contact" : t("footer.links.contact")}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white">
                  {t("footer.links.privacy") === "footer.links.privacy" ? "Privacy" : t("footer.links.privacy")}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white">
                  {t("footer.links.terms") === "footer.links.terms" ? "Terms" : t("footer.links.terms")}
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        {/* Bottom bar */}
        <div className="py-4 border-t border-white/10 text-xs flex flex-col md:flex-row items-center justify-between gap-2 text-slate-400">
          <div>© {new Date().getFullYear()} GoAstrion. All rights reserved.</div>

        </div>
      </Container>
    </footer>
  );
}
