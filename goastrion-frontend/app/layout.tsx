import "./globals.css";
import ClientShell from "./ClientShell";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0B1020] text-slate-200">
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}
