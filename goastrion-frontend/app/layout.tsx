// app/layout.tsx
import "./globals.css";
import ClientShell from "./ClientShell";
import { I18nProvider } from "./lib/i18n";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // We set initial lang="en"; ClientShell will update it on the client
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0B1020] text-slate-200">
        <I18nProvider>
          <ClientShell>{children}</ClientShell>
        </I18nProvider>
      </body>
    </html>
  );
}
