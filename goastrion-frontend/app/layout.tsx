// app/layout.tsx
import "./globals.css";
import ClientShell from "./ClientShell";
import { I18nProvider } from "./lib/i18n";
import Footer from "./components/Footer";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // We set initial lang="en"; ClientShell will update it on the client
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0B1020] text-slate-200 flex flex-col">
        <I18nProvider>
          {/* Main app content grows to push footer to bottom */}
          <div className="flex-1">
            <ClientShell>{children}</ClientShell>
          </div>

          {/* Global footer appears on every route */}
          <Footer />
        </I18nProvider>
      </body>
    </html>
  );
}
