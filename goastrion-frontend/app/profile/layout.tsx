"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  if (!user) {
    router.push("/");
    return null;
  }

    const navLinks = [
      { label: "Overview", href: "/profile" },
      { label: "Saved Charts", href: "/profile/charts" },
      { label: "Settings", href: "/profile/settings" },
      { label: "History", href: "/profile/history" },
    ];


  return (
    <div className="min-h-screen bg-[#0B1020] text-slate-200 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-black/40 border-b md:border-b-0 md:border-r border-white/10 backdrop-blur-sm p-4 relative">
        {/* Mobile toggle */}
        <button
          className="md:hidden absolute right-4 top-4 text-slate-300"
          onClick={() => setOpen((v) => !v)}
        >
          ☰
        </button>

        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <Image
            src="/logo.png"
            alt="GoAstrion"
            width={60}
            height={60}
            className="rounded-full mb-3"
          />
          <p className="font-semibold text-lg text-cyan-300">
            {user.username || "User"}
          </p>
          <p className="text-sm text-slate-400 mb-4">{user.email}</p>
        </div>

        {/* Mobile menu (animated) */}
        <AnimatePresence>
          {(open || typeof window === "undefined") && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-col mt-2 md:mt-6 space-y-2"
            >
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block px-3 py-2 rounded-md text-sm ${
                    pathname === link.href
                      ? "bg-cyan-600 text-white font-medium"
                      : "hover:bg-white/10 text-slate-300"
                  }`}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <button
                onClick={() => {
                  logout();
                  router.push("/");
                }}
                className="mt-4 w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-500 transition"
              >
                Log out
              </button>
            </motion.nav>
          )}
        </AnimatePresence>

        {/* Desktop menu */}
        <nav className="hidden md:flex flex-col mt-6 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block px-3 py-2 rounded-md text-sm ${
                pathname === link.href
                  ? "bg-cyan-600 text-white font-medium"
                  : "hover:bg-white/10 text-slate-300"
              }`}
            >
              {link.label}
            </Link>
          ))}

          <button
            onClick={() => {
              logout();
              router.push("/");
            }}
            className="mt-6 bg-red-600 text-white py-2 rounded-lg hover:bg-red-500 transition"
          >
            Log out
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">{children}</main>
    </div>
  );
}
