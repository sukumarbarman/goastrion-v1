"use client";

import { useEffect, useMemo, useRef } from "react";
import { usePathname } from "next/navigation";

type AdFormat = "auto" | "fluid" | "rectangle";

type Props = {
  slot: string; // e.g. "1234567890" from AdSense
  format?: AdFormat;
  fullWidthResponsive?: boolean;
  // Reserve space to avoid layout shift (tweak per placement)
  minHeight?: number; // px
  className?: string;
};

declare global {
  interface Window { adsbygoogle: any[] }
}

const enabled = process.env.NEXT_PUBLIC_ENABLE_ADS === "true";
const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

export default function AdSlot({
  slot,
  format = "auto",
  fullWidthResponsive = true,
  minHeight = 280,
  className,
}: Props) {
  const pathname = usePathname();
  const ref = useRef<HTMLModElement>(null);

  // Avoid rendering at all if ads are disabled or client missing
  const canRender = useMemo(() => enabled && !!client, []);

  useEffect(() => {
    if (!canRender) return;

    const el = ref.current as unknown as HTMLElement | null;
    if (!el) return;

    // Lazy push when visible to save impressions
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
          } catch (_) {}
          io.disconnect();
        }
      });
    }, { rootMargin: "200px" });

    io.observe(el);
    return () => io.disconnect();
  }, [pathname, slot, canRender]);

  if (!canRender) return null;

  return (
    <ins
      ref={ref as any}
      className={`adsbygoogle ${className ?? ""}`}
      style={{ display: "block", minHeight }}
      data-ad-client={client}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive={fullWidthResponsive ? "true" : "false"}
    />
  );
}
