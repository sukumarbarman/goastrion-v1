"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Item = { href: string; label: string; exact?: boolean };

const ITEMS: Item[] = [
  { href: "/profile", label: "Overview", exact: true },
  { href: "/profile/charts", label: "Saved Charts" },

  { href: "/profile/history", label: "History" },
];

function NavLink({ href, label, exact }: Item) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname.startsWith(href);

  const base =
    "block rounded-lg px-3 py-2 text-sm transition-colors";
  const activeCls =
    "bg-white/10 text-white border border-white/10";
  const idleCls =
    "text-slate-300 hover:text-white hover:bg-white/10 border border-transparent";

  return (
    <Link href={href} className={`${base} ${active ? activeCls : idleCls}`}>
      {label}
    </Link>
  );
}

export default function ProfileNav() {
  return (
    <nav className="grid gap-1">
      {ITEMS.map((it) => (
        <NavLink key={it.href} {...it} />
      ))}
    </nav>
  );
}
