// app/components/Navbar.tsx
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

  // Close menu then run the passed handler (no 'any' here)
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
          <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
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
          <nav className="hidden md:flex gap-6 text-sm text-slate-300">
            <Link href="/about" className="hover:text-white">{t("navbar.about")}</Link>
            <Link href="/create" className="hover:text-white">{t("create.title")}</Link>
            <Link href="/domains" className="hover:text-white">{t("navbar.lifeSpheres")}</Link>
            <Link href="/skills" className="hover:text-white">{t("navbar.skills")}</Link>
            <Link href="/guides" className="hover:text-white">{t("navbar.guides")}</Link>
            <Link href="/faq" className="hover:text-white">{t("navbar.faq")}</Link>


          </nav>

          {/* Right cluster */}
          <div className="flex items-center gap-3">
            {/* Mobile quick CTA */}
            <Link
              href="/create"
              className="md:hidden inline-flex rounded-full bg-cyan-500 px-3 py-1.5 text-sm text-slate-950 font-semibold hover:bg-cyan-400"
              onClick={() => setOpen(false)}
            >
              {t("create.title")}
            </Link>

            <LanguageSwitcher />
{/*
            <button
              onClick={onOpenAppt}
              className="hidden md:inline-flex rounded-full border border-cyan-400/40 bg-cyan-500/15 px-3 py-1.5 text-sm text-cyan-200 hover:bg-cyan-500/25"
            >
              {t("navbar.book")}
            </button>
            <button
              onClick={onOpenLogin}
              className="hidden md:inline-flex rounded-full border border-white/10 px-3 py-1.5 text-sm text-slate-200 hover:border-white/20"
            >
              {t("navbar.login")}
            </button>
            <button
              onClick={onOpenSignup}
              className="hidden md:inline-flex rounded-full bg-cyan-500 px-3 py-1.5 text-sm text-slate-950 font-semibold hover:bg-cyan-400"
            >
              {t("navbar.signup")}
            </button>
*/}
            {/* Mobile menu toggle */}
            <button
              className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-white/10 text-slate-200"
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen(v => !v)}
            >
              <span className="sr-only">Menu</span>
              {/* burger / close */}
              <svg width="20" height="20" viewBox="0 0 20 20" className={open ? "hidden" : "block"}>
                <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <svg width="20" height="20" viewBox="0 0 20 20" className={open ? "block" : "hidden"}>
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
          <nav className="px-2 py-2">
            <ul className="divide-y divide-white/5">
              <li>
                <Link href="/domains" className="block px-3 py-3 text-slate-200 hover:bg-white/5" onClick={() => setOpen(false)}>
                  {t("navbar.lifeSpheres")}
                </Link>
              </li>
              <li>
                <Link href="/skills" className="block px-3 py-3 text-slate-200 hover:bg-white/5" onClick={() => setOpen(false)}>
                  {t("navbar.skills")}
                </Link>
              </li>
              <li>
                <Link href="/about" className="block px-3 py-3 text-slate-200 hover:bg-white/5" onClick={() => setOpen(false)}>
                  {t("navbar.about")}
                </Link>
              </li>
              <li>
                <Link href="/create" className="block px-3 py-3 text-slate-200 hover:bg-white/5" onClick={() => setOpen(false)}>
                  {t("create.title")}
                </Link>
              </li>
            </ul>

            {/* Actions */}
            <div className="mt-3 grid grid-cols-2 gap-2 px-2">
              <button
                onClick={closeAnd(onOpenAppt)}
                className="rounded-full border border-cyan-400/40 bg-cyan-500/15 px-3 py-2 text-sm text-cyan-200 hover:bg-cyan-500/25"
              >
                {t("navbar.book")}
              </button>
              <button
                onClick={closeAnd(onOpenLogin)}
                className="rounded-full border border-white/10 px-3 py-2 text-sm text-slate-200 hover:border-white/20"
              >
                {t("navbar.login")}
              </button>
              <button
                onClick={closeAnd(onOpenSignup)}
                className="col-span-2 rounded-full bg-cyan-500 px-3 py-2 text-sm text-slate-950 font-semibold hover:bg-cyan-400"
              >
                {t("navbar.signup")}
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
