// app/gtm-tracker.tsx
"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID as string | undefined;

// Minimal gtag signature we need (no external @types required)
type GtagFn = (
  command: "event",
  eventName: string,
  params?: Record<string, unknown>
) => void;

function getGtag(): GtagFn | undefined {
  if (typeof window === "undefined") return undefined;
  const maybe = (window as unknown as { gtag?: unknown }).gtag;
  return typeof maybe === "function" ? (maybe as GtagFn) : undefined;
}

function sendPageview(url: string) {
  if (!GA_ID) return;
  const gtag = getGtag();
  if (!gtag) return;

  gtag("event", "page_view", {
    page_location:
      typeof window !== "undefined" ? window.location.origin + url : url,
    page_path: url,
    page_title: typeof document !== "undefined" ? document.title : undefined,
    send_to: GA_ID,
  });
}

export default function GATracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) return;
    const url = `${pathname}${searchParams?.toString() ? `?${searchParams}` : ""}`;
    sendPageview(url);
  }, [pathname, searchParams]);

  return null;
}
