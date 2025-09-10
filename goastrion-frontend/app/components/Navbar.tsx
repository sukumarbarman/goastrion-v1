// app/components/Navbar.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import Container from "./Container";
import LanguageSwitcher from "./LanguageSwitcher";
import { useI18n } from "../lib/i18n";

// Define props interface
interface NavbarProps {
  onOpenLogin: () => void;
  onOpenSignup: () => void;
  onOpenAppt: () => void;
}

export default function Navbar({ onOpenLogin, onOpenSignup, onOpenAppt }: NavbarProps) {
  const { t } = useI18n();

  return (
    <header className="sticky top-0 z-40 bg-black/30 backdrop-blur border-b border-white/5">
      <Container>
        <div className="flex items-center justify-between py-3">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="GoAstrion Logo"
              width={36}
              height={36}
              className="rounded-full"
            />
            <span className="text-cyan-300 font-bold text-lg">GoAstrion</span>
          </Link>

          {/* Links */}
          <nav className="hidden md:flex gap-6 text-sm text-slate-300">
            <Link href="/pricing" className="hover:text-white">
              {t("navbar.pricing")}
            </Link>
            <Link href="/about" className="hover:text-white">
              {t("navbar.about")}
            </Link>
            <Link href="/dashboard" className="hover:text-white">
              {t("navbar.dashboard")}
            </Link>

            {/* NEW: direct link to the Generate Chart page */}
            <Link href="/create" className="hover:text-white">
              {t("create.title")}
            </Link>

            {/* Keep Results if you still use that route */}
            <Link href="/results" className="hover:text-white">
              {t("navbar.results")}
            </Link>
          </nav>

          {/* Right: Language + Actions */}
          <div className="flex items-center gap-3">
            {/* Mobile-only quick CTA to Generate Chart */}
            <Link
              href="/create"
              className="md:hidden inline-flex rounded-full bg-cyan-500 px-3 py-1.5 text-sm text-slate-950 font-semibold hover:bg-cyan-400"
            >
              {t("create.title")}
            </Link>

            <LanguageSwitcher />
            <button
              onClick={onOpenAppt}
              className="hidden md:inline-flex rounded-full border border-cyan-400/40 bg-cyan-500/15 px-3 py-1.5 text-sm text-cyan-200 hover:bg-cyan-500/25"
            >
              {t("navbar.book")}
            </button>
            <button
              onClick={onOpenLogin}
              className="rounded-full border border-white/10 px-3 py-1.5 text-sm text-slate-200 hover:border-white/20"
            >
              {t("navbar.login")}
            </button>
            <button
              onClick={onOpenSignup}
              className="rounded-full bg-cyan-500 px-3 py-1.5 text-sm text-slate-950 font-semibold hover:bg-cyan-400"
            >
              {t("navbar.signup")}
            </button>
          </div>
        </div>
      </Container>
    </header>
  );
}
