//goastrion-frontend/app/components/Navbar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Container from "./Container";
import LanguageSwitcher from "./LanguageSwitcher";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../lib/i18n";

export default function Navbar({
  onOpenLogin,
  onOpenSignup,
  onOpenAppt, // <-- optional
}: {
  onOpenLogin: () => void;
  onOpenSignup: () => void;
  onOpenAppt?: () => void; // <-- allow this prop
}) {
  const { user, logout } = useAuth();
  const [dropdown, setDropdown] = useState(false);
  const [mobile, setMobile] = useState(false);
  const { tOr } = useI18n();

  // Map slugs → i18n keys with safe fallbacks (English stays as-is)
  const NAV_ITEMS = [
    { slug: "daily",        key: "navbar.daily",        fallback: "Today" },
    { slug: "shubhdin",     key: "navbar.shubhdin",     fallback: "ShubhDin" }, // ✅ NEW
    { slug: "create",       key: "navbar.create",       fallback: "Create" },
    { slug: "saturn",       key: "navbar.saturn",       fallback: "Saturn" },
    { slug: "vimshottari",  key: "navbar.vimshottari",  fallback: "Vimshottari" },
    { slug: "domains",      key: "navbar.lifeSpheres",  fallback: "Domains" },
    { slug: "skills",       key: "navbar.skills",       fallback: "Skills" },
  ] as const;

  const loginLabel   = tOr("navbar.login",  "Log in");
  const signupLabel  = tOr("navbar.signup", "Sign up");
  const profileLbl   = tOr("navbar.profile","Profile");
  const logoutLbl    = tOr("navbar.logout", "Log out");
  const openMenuAria = tOr("navbar.openMenu","Open menu");
  const bookLabel    = tOr("navbar.book",   "Book appointment");

  // Reusable CTA that uses handler when present, or links to /book otherwise
  const ApptCTA = ({ mobile = false }: { mobile?: boolean }) =>
    onOpenAppt ? (
      <button
        onClick={onOpenAppt}
        className={
          mobile
            ? "block w-full bg-emerald-500 text-slate-950 font-semibold py-2 rounded-lg mb-2"
            : "hidden md:inline-flex bg-emerald-500 text-slate-950 font-semibold text-sm px-3 py-1.5 rounded-full hover:bg-emerald-400 transition"
        }
        aria-label={bookLabel}
      >
        {bookLabel}
      </button>
    ) : (
      <Link
        href="/book"
        className={
          mobile
            ? "block w-full bg-emerald-500 text-slate-950 font-semibold py-2 rounded-lg mb-2 text-center"
            : "hidden md:inline-flex bg-emerald-500 text-slate-950 font-semibold text-sm px-3 py-1.5 rounded-full hover:bg-emerald-400 transition"
        }
        aria-label={bookLabel}
      >
        {bookLabel}
      </Link>
    );

  return (
    <header className="sticky top-0 z-50 bg-black/40 backdrop-blur border-b border-white/10">
      <Container>
        <div className="flex items-center justify-between py-3">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="GoAstrion" width={36} height={36} />
            <span className="text-cyan-300 font-bold text-lg">GoAstrion</span>
          </Link>

          {/* Links */}
          <nav className="hidden md:flex gap-6 text-sm text-slate-300">
            {NAV_ITEMS.map(({ slug, key, fallback }) => (
              <Link key={slug} href={`/${slug}`} className="hover:text-white">
                {tOr(key, fallback)}
              </Link>
            ))}
          </nav>

          {/* Right cluster */}
          <div className="flex items-center gap-3 relative">
            <LanguageSwitcher />

            {/* Desktop Appointment CTA
            <ApptCTA />
            */}

            {!user ? (
              <div className="hidden md:flex gap-3">
                <button onClick={onOpenLogin} className="text-slate-200 hover:text-white text-sm">
                  {loginLabel}
                </button>
                <button
                  onClick={onOpenSignup}
                  className="bg-cyan-500 text-slate-950 font-semibold text-sm px-3 py-1.5 rounded-full hover:bg-cyan-400 transition"
                >
                  {signupLabel}
                </button>
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setDropdown((v) => !v)}
                  className="flex items-center gap-2 text-slate-200 hover:text-white"
                >
                  <div className="w-8 h-8 rounded-full bg-cyan-600 flex items-center justify-center text-white font-semibold">
                    {user.username ? user.username[0].toUpperCase() : "U"}
                  </div>
                </button>

                {dropdown && (
                  <div className="absolute right-0 mt-2 w-40 bg-white text-gray-800 rounded-lg shadow-md border border-gray-100 z-50">
                    <div className="px-4 py-2 text-sm border-b border-gray-100">
                      {user.email}
                    </div>
                    <Link href="/profile" className="block px-4 py-2 text-sm hover:bg-gray-100">
                      {profileLbl}
                    </Link>
                    <button onClick={logout} className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100">
                      {logoutLbl}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Mobile toggle */}
            <button
              className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-white/10 text-slate-200"
              onClick={() => setMobile(!mobile)}
              aria-label={openMenuAria}
            >
              ☰
            </button>
          </div>
        </div>
      </Container>

      {/* Mobile panel */}
{/* Mobile panel */}
{mobile && (
  <div className="md:hidden fixed inset-x-0 bg-[#0B1022] z-50 p-4 border-t border-white/10 space-y-3">
    {/* Links */}
    <nav className="flex flex-col space-y-2 text-slate-300 text-base">
      {NAV_ITEMS.map(({ slug, key, fallback }) => (
        <Link
          key={slug}
          href={`/${slug}`}
          className="block px-2 py-2 rounded-lg hover:bg-white/10 hover:text-white transition"
          onClick={() => setMobile(false)}
        >
          {tOr(key, fallback)}
        </Link>
      ))}
    </nav>

    <hr className="border-white/10 my-3" />

    {/* Auth buttons */}
    {!user ? (
      <>
        <button
          onClick={() => {
            onOpenLogin();
            setMobile(false);
          }}
          className="block w-full bg-cyan-500 text-slate-950 font-semibold py-2 rounded-lg mb-2"
        >
          {loginLabel}
        </button>
        <button
          onClick={() => {
            onOpenSignup();
            setMobile(false);
          }}
          className="block w-full border border-cyan-400 text-cyan-300 py-2 rounded-lg"
        >
          {signupLabel}
        </button>
      </>
    ) : (
      <>
        <Link
          href="/profile"
          className="block w-full bg-cyan-600 text-white text-center py-2 rounded-lg mb-2"
          onClick={() => setMobile(false)}
        >
          {profileLbl}
        </Link>
        <button
          onClick={() => {
            logout();
            setMobile(false);
          }}
          className="block w-full bg-red-500 text-white py-2 rounded-lg"
        >
          {logoutLbl}
        </button>
      </>
    )}
  </div>
)}

    </header>
  );
}
