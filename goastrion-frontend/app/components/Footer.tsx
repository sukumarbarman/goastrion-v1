// app/components/Footer.tsx
"use client";

import Link from "next/link";
import Container from "./Container";
import { useI18n } from "@/app/lib/i18n";

export default function Footer() {
  const { t } = useI18n();
  const tr = (key: string, fallback: string): string => {
    const v = t(key);
    return v && v !== key ? v : fallback;
  };
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 bg-black/30 border-t border-white/10">
      <Container>
        {/* Link row */}
        <nav className="py-8" aria-label={tr("footer.navLabel", "Footer links")}>
          <ul className="flex flex-wrap items-center justify-center gap-2">
            <li>
              <Link
                href="/guides"
                aria-label={tr("footer.guides", "Guides")}
                className="inline-flex rounded-full px-4 py-2 text-sm text-slate-200/90 hover:text-white hover:bg-white/10 transition"
              >
                {tr("footer.guides", "Guides")}
              </Link>
            </li>
            <li>
              <Link
                href="/about"
                aria-label={tr("footer.about", "About")}
                className="inline-flex rounded-full px-4 py-2 text-sm text-slate-200/90 hover:text-white hover:bg-white/10 transition"
              >
                {tr("footer.about", "About")}
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                aria-label={tr("footer.contact", "Contact")}
                className="inline-flex rounded-full px-4 py-2 text-sm text-slate-200/90 hover:text-white hover:bg-white/10 transition"
              >
                {tr("footer.contact", "Contact")}
              </Link>
            </li>
            <li>
              <Link
                href="/terms"
                aria-label={tr("footer.terms", "Terms")}
                className="inline-flex rounded-full px-4 py-2 text-sm text-slate-200/90 hover:text-white hover:bg-white/10 transition"
              >
                {tr("footer.terms", "Terms")}
              </Link>
            </li>
          </ul>
        </nav>

        {/* Divider */}
        <div className="border-t border-white/10" />

        {/* Copyright */}
        <div className="py-6 text-center text-xs text-slate-400">
          © {year} GoAstrion. All rights reserved.
        </div>
      </Container>
    </footer>
  );
}
