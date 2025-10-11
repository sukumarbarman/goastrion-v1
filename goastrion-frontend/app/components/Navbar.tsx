"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Container from "./Container";
import LanguageSwitcher from "./LanguageSwitcher";
import { useI18n } from "../lib/i18n";

interface NavbarProps {
  onOpenLogin: () => void;
  onOpenSignup: () => void;
  onOpenAppt: () => void;
}

export default function Navbar({ onOpenLogin, onOpenSignup, onOpenAppt }: NavbarProps) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const tf = (k: string, fb: string) => (t(k) === k ? fb : t(k)); // safe i18n fallback

  // Close menu then run the passed handler
  const closeAnd =
    <T extends (...args: unknown[]) => void>(fn: T) =>
      (...args: Parameters<T>) => {
        setOpen(false);
        fn(...args);
      };

  return (
    <header className="sticky top-0 z-50 bg-black/30 backdrop-blur border-b border-white/5">
      <Container>
        <div className="flex items-center justify-between py-3">
          {/* Brand */}
          <Link href="/" prefetch className="flex items-center gap-2" onClick={() => setOpen(false)}>
            <Image
              src="/logo.png"
              alt="GoAstrion Logo"
              width={36}
              height={36}
              className="rounded-full"
            />
            <span className="text-cyan-300 font-bold text-lg">GoAstrion</span>
          </Link>

          {/* Desktop links */}
          <nav className="hidden md:flex gap-6 text-sm text-slate-300" aria-label="Primary">
            <Link href="/about" prefetch className="hover:text-white">{t("navbar.about")}</Link>
            <Link href="/create" prefetch className="hover:text-white">{t("create.title")}</Link>
            <Link href="/domains" prefetch className="hover:text-white">{t("navbar.lifeSpheres")}</Link>
            <Link href="/skills" prefetch className="hover:text-white">{t("navbar.skills")}</Link>

            {/* Saturn: same tab */}
            <Link href="/saturn" prefetch className="hover:text-white">
              {tf("navbar.saturn", "Saturn")}
            </Link>

            {/* Vimshottari: now same tab */}
            <Link href="/vimshottari" prefetch className="hover:text-white">
              {tf("navbar.vimshottari", "Vimshottari")}
            </Link>

            <Link href="/guides" prefetch className="hover:text-white">{t("navbar.guides")}</Link>
            <Link href="/faq" prefetch className="hover:text-white">{t("navbar.faq")}</Link>
          </nav>

          {/* Right cluster */}
          <div className="flex items-center gap-3">
            {/* Mobile quick CTA */}
            <Link
              href="/create"
              prefetch
              className="md:hidden inline-flex rounded-full bg-cyan-500 px-3 py-1.5 text-sm text-slate-950 font-semibold hover:bg-cyan-400"
              onClick={() => setOpen(false)}
            >
              {t("create.title")}
            </Link>

            <LanguageSwitcher />

            {/* Mobile menu toggle */}
            <button
              className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-white/10 text-slate-200"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label="Toggle menu"
              onClick={() => setOpen(v => !v)}
            >
              {/* burger / close */}
              <svg width="20" height="20" viewBox="0 0 20 20" className={open ? "hidden" : "block"} aria-hidden="true">
                <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <svg width="20" height="20" viewBox="0 0 20 20" className={open ? "block" : "hidden"} aria-hidden="true">
                <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>
      </Container>

      {/* Mobile panel */}
      {open && (
        <div
          id="mobile-menu"
          className="
            md:hidden
            fixed inset-x-0 top-[56px] z-50
            border-t border-white/10 bg-[#0B1022] shadow-lg
            max-h-[calc(100svh-56px)] overflow-y-auto overscroll-contain
            pb-[max(16px,env(safe-area-inset-bottom))]
          "
        >
          <nav className="px-2 py-2" aria-label="Mobile primary">
            <ul className="divide-y divide-white/5">
              <li>
                <Link href="/about" prefetch className="block px-3 py-3 text-slate-200 hover:bg-white/5" onClick={() => setOpen(false)}>
                  {t("navbar.about")}
                </Link>
              </li>
              <li>
                <Link href="/create" prefetch className="block px-3 py-3 text-slate-200 hover:bg-white/5" onClick={() => setOpen(false)}>
                  {t("create.title")}
                </Link>
              </li>
              <li>
                <Link href="/domains" prefetch className="block px-3 py-3 text-slate-200 hover:bg-white/5" onClick={() => setOpen(false)}>
                  {t("navbar.lifeSpheres")}
                </Link>
              </li>
              <li>
                <Link href="/skills" prefetch className="block px-3 py-3 text-slate-200 hover:bg-white/5" onClick={() => setOpen(false)}>
                  {t("navbar.skills")}
                </Link>
              </li>

              {/* Saturn: same tab on mobile */}
              <li>
                <Link href="/saturn" prefetch className="block px-3 py-3 text-slate-200 hover:bg-white/5" onClick={() => setOpen(false)}>
                  {tf("navbar.saturn", "Saturn")}
                </Link>
              </li>

              {/* Vimshottari: same tab on mobile */}
              <li>
                <Link
                  href="/vimshottari"
                  prefetch
                  className="block px-3 py-3 text-slate-200 hover:bg-white/5"
                  onClick={() => setOpen(false)}
                >
                  {tf("navbar.vimshottari", "Vimshottari")}
                </Link>
              </li>

              <li>
                <Link href="/guides" prefetch className="block px-3 py-3 text-slate-200 hover:bg-white/5" onClick={() => setOpen(false)}>
                  {t("navbar.guides")}
                </Link>
              </li>
              <li>
                <Link href="/faq" prefetch className="block px-3 py-3 text-slate-200 hover:bg-white/5" onClick={() => setOpen(false)}>
                  {t("navbar.faq")}
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}
