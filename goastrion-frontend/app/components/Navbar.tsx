"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import Container from "./Container";
import LanguageSwitcher from "./LanguageSwitcher";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../lib/i18n";
import {
  User,
  Settings,
  BarChart2,
  Clock,
  X,
  LogOut,
} from "lucide-react";

export default function Navbar({
  onOpenLogin,
  onOpenSignup,
  onOpenAppt,
}: {
  onOpenLogin: () => void;
  onOpenSignup: () => void;
  onOpenAppt?: () => void;
}) {
  const { user, logout } = useAuth();
  const [dropdown, setDropdown] = useState(false);
  const [mobile, setMobile] = useState(false);
  const { tOr } = useI18n();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const NAV_ITEMS = [
    { slug: "daily", key: "navbar.daily", fallback: "Today" },
    { slug: "shubhdin", key: "navbar.shubhdin", fallback: "ShubhDin" },
    { slug: "create", key: "navbar.create", fallback: "Create" },
    { slug: "saturn", key: "navbar.saturn", fallback: "Saturn" },
    { slug: "vimshottari", key: "navbar.vimshottari", fallback: "Vimshottari" },
    { slug: "domains", key: "navbar.lifeSpheres", fallback: "Domains" },
    { slug: "skills", key: "navbar.skills", fallback: "Skills" },
  ] as const;

  const loginLabel = tOr("navbar.login", "Log in");
  const signupLabel = tOr("navbar.signup", "Sign up");
  const openMenuAria = tOr("navbar.openMenu", "Open menu");

  // 🔹 Close dropdown on outside click or ESC
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdown(false);
      }
    }
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setDropdown(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

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

            {!user ? (
              <div className="hidden md:flex gap-3">
                <button
                  onClick={onOpenLogin}
                  className="text-slate-200 hover:text-white text-sm"
                >
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
              <div className="relative" ref={dropdownRef}>
                {/* Avatar button with glow */}
                <button
                  onClick={() => setDropdown((v) => !v)}
                  className={`flex items-center gap-2 text-slate-200 hover:text-white transition ${
                    dropdown ? "ring-2 ring-cyan-400/50 ring-offset-2 ring-offset-black/40" : ""
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold transition-all ${
                      dropdown
                        ? "bg-cyan-500 glow-active shadow-[0_0_10px_rgba(34,211,238,0.6)]"
                        : "bg-cyan-600"
                    }`}
                  >
                    {user.username ? user.username[0].toUpperCase() : "U"}
                  </div>
                  <span className="hidden md:inline text-sm font-medium text-white/90 max-w-[120px] truncate">
                    {user.username}
                  </span>
                  <span
                    className={`text-xs transition-transform ${
                      dropdown ? "rotate-180 opacity-80" : "opacity-70"
                    }`}
                  >
                    ▼
                  </span>
                </button>

                {/* Dropdown */}
                {dropdown && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl border border-white/10 bg-black/70 backdrop-blur-sm text-slate-200 shadow-lg text-sm py-1 z-50 animate-fadeIn">
                    {/* Header with name */}
                    <div className="px-4 py-2 font-medium text-white/90 border-b border-white/10">
                      Hi, {user.username || "User"} 👋
                    </div>

                    {/* Profile Links */}
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 transition"
                      onClick={() => setDropdown(false)}
                    >
                      <User size={16} /> Profile Overview
                    </Link>
                    <Link
                      href="/profile/settings"
                      className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 transition"
                      onClick={() => setDropdown(false)}
                    >
                    {/*
                      <Settings size={16} /> Edit Profile
                    </Link>
                    <Link
                      href="/profile/charts"
                      className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 transition"
                      onClick={() => setDropdown(false)}
                    >
                   */}

                      <BarChart2 size={16} /> Saved Charts
                    </Link>
                    <Link
                      href="/profile/history"
                      className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 transition"
                      onClick={() => setDropdown(false)}
                    >


                      <Clock size={16} /> History
                    </Link>

                    <div className="border-t border-white/10 my-1" />

                    {/* Utility actions */}
                    <button
                      onClick={() => setDropdown(false)}
                      className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-white/10 transition"
                    >


                      <X size={16} /> Hide Menu
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        setDropdown(false);
                      }}
                      className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-white/5 hover:text-red-500 transition"
                    >
                      <LogOut size={16} /> Log Out
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

      {/* Mobile menu */}
      {mobile && (
        <div className="md:hidden fixed inset-x-0 bg-[#0B1022] z-50 p-4 border-t border-white/10 space-y-2">
          <nav className="flex flex-col space-y-1 text-slate-300 text-base">
            {NAV_ITEMS.map(({ slug, key, fallback }) => (
              <Link
                key={slug}
                href={`/${slug}`}
                className="block px-3 py-2 rounded-md hover:bg-white/10 hover:text-white transition"
                onClick={() => setMobile(false)}
              >
                {tOr(key, fallback)}
              </Link>
            ))}

            {!user ? (
              <>
                <button
                  onClick={() => {
                    onOpenLogin();
                    setMobile(false);
                  }}
                  className="block text-left px-3 py-2 rounded-md hover:bg-white/10 hover:text-white transition"
                >
                  {loginLabel}
                </button>
                <button
                  onClick={() => {
                    onOpenSignup();
                    setMobile(false);
                  }}
                  className="block text-left px-3 py-2 rounded-md hover:bg-white/10 hover:text-white transition"
                >
                  {signupLabel}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/profile"
                  className="block px-3 py-2 rounded-md hover:bg-white/10 hover:text-white transition"
                  onClick={() => setMobile(false)}
                >
                  {user.username || "Profile"}
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobile(false);
                  }}
                  className="block text-left px-3 py-2 rounded-md hover:bg-white/10 hover:text-red-500 transition"
                >
                  Log Out
                </button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
