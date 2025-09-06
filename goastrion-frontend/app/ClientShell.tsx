// app/ClientShell.tsx
"use client";

import { useEffect } from "react";
import Navbar from "./components/Navbar";
// import Footer from "./components/Footer"; // uncomment if you have one
import { useI18n } from "./lib/i18n";

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const { locale } = useI18n();

  // Keep <html lang="..."> in sync with the active locale
  useEffect(() => {
    try {
      document.documentElement.lang = locale; // "en" | "hi" | "bn"
    } catch {}
  }, [locale]);

  return (
    <>
      <Navbar
        onOpenLogin={() => {}}
        onOpenSignup={() => {}}
        onOpenAppt={() => {}}
      />
      <main className="min-h-[calc(100vh-160px)]">{children}</main>
      {/* <Footer /> */}
    </>
  );
}
