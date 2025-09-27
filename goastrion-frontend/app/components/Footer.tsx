// app/components/Footer.tsx
import Link from "next/link";
import Container from "./Container";

export default function Footer() {
  return (
    <footer className="mt-16 bg-black/30 border-t border-white/10">
      <Container>
        {/* Link row */}
        <nav className="py-8">
          <ul className="flex flex-wrap items-center justify-center gap-2">
            <li>
              <Link
                href="/guides"
                className="inline-flex rounded-full px-4 py-2 text-sm text-slate-200/90 hover:text-white hover:bg-white/10 transition"
              >
                Guides
              </Link>
            </li>
            <li>
              <Link
                href="/about"
                className="inline-flex rounded-full px-4 py-2 text-sm text-slate-200/90 hover:text-white hover:bg-white/10 transition"
              >
                About
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                className="inline-flex rounded-full px-4 py-2 text-sm text-slate-200/90 hover:text-white hover:bg-white/10 transition"
              >
                Contact
              </Link>
            </li>
            <li>
              <Link
                href="/terms"
                className="inline-flex rounded-full px-4 py-2 text-sm text-slate-200/90 hover:text-white hover:bg-white/10 transition"
              >
                Terms
              </Link>
            </li>
          </ul>
        </nav>

        {/* Divider */}
        <div className="border-t border-white/10" />

        {/* Copyright */}
        <div className="py-6 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} GoAstrion. All rights reserved.
        </div>
      </Container>
    </footer>
  );
}
