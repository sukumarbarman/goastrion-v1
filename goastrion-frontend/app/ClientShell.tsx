// app/ClientShell.tsx
"use client";

import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import LoginModal from "./components/LoginModal";
import SignupModal from "./components/SignupModal";
import { useI18n } from "./lib/i18n";

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const { locale } = useI18n();

  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  // keep <html lang="..."> in sync with selected locale
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <>
      <Navbar
        onOpenLogin={() => setShowLogin(true)}
        onOpenSignup={() => setShowSignup(true)}
        onOpenAppt={() => {}}
      />

      <main className="min-h-[calc(100vh-160px)]">{children}</main>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
      {showSignup && <SignupModal onClose={() => setShowSignup(false)} />}
    </>
  );
}
