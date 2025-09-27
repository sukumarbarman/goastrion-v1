// app/components/Footer.tsx
import Link from "next/link";
import Container from "./Container";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-white/10 bg-black/20">
      <Container>
        {/* Links row */}
        <nav className="py-6">
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-300">
            <li>
              <Link href="/guides" className="hover:text-white">
                Guides
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-white">
                About
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-white">
                Contact
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-white">
                Terms
              </Link>
            </li>
          </ul>
        </nav>

        {/* Bottom bar */}
        <div className="py-4 border-t border-white/10 text-xs text-slate-400">
          © {new Date().getFullYear()} GoAstrion. All rights reserved.
        </div>
      </Container>
    </footer>
  );
}
