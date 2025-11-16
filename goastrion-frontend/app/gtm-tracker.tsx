//goastrion-frontend/app/gtm-tracker.tsx

"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID as string | undefined;

// Basic gtag signature
type GtagFn = (
  command: "event",
  eventName: string,
  params?: Record<string, unknown>
) => void;

function getGtag(): GtagFn | undefined {
  if (typeof window === "undefined") return;
  const maybe = (window as unknown as { gtag?: unknown }).gtag;
  return typeof maybe === "function" ? (maybe as GtagFn) : undefined;
}

// Send pageview with retry (handles slow GA load)
function sendPageview(url: string) {
  if (!GA_ID) return;

  const attempt = (retries = 5) => {
    const gtag = getGtag();
    if (gtag) {
      gtag("event", "page_view", {
        page_location: window.location.origin + url,
        page_path: url,
        page_title: document.title,
        send_to: GA_ID,
      });
    } else if (retries > 0) {
      setTimeout(() => attempt(retries - 1), 300);
    }
  };
  attempt();
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
