"use client";

import { useState } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AuthModals from "./components/AuthModals";
import AppointmentModal from "./components/AppointmentModal";
import { I18nProvider } from "./lib/i18n";

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [apptOpen, setApptOpen] = useState(false);

  return (
    <I18nProvider>
      <Navbar
        onOpenLogin={() => { setAuthMode("login"); setAuthOpen(true); }}
        onOpenSignup={() => { setAuthMode("signup"); setAuthOpen(true); }}
        onOpenAppt={() => setApptOpen(true)}
      />
      <main className="space-y-16 py-8">{children}</main>
      <Footer />
      <AuthModals open={authOpen} mode={authMode} onClose={() => setAuthOpen(false)} />
      <AppointmentModal open={apptOpen} onClose={() => setApptOpen(false)} />
    </I18nProvider>
  );
}
