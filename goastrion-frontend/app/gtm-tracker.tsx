// app/gtm-tracker.tsx
"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args:
      | ["js", Date]
      | ["config", string, { page_path?: string }]
      | ["event", string, Record<string, unknown>?]
    ) => void;
  }
}

const GA_ID: string | undefined = process.env.NEXT_PUBLIC_GA_ID;

export default function GATracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined" || !GA_ID || typeof window.gtag !== "function") return;
    const search = typeof window !== "undefined" ? window.location.search : "";
    const url = search ? `${pathname}${search}` : pathname;
    window.gtag("config", GA_ID, { page_path: url });
  }, [pathname]);

  return null;
}
