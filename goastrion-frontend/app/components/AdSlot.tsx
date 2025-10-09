"use client";

import { useEffect, useMemo, useRef } from "react";
import { usePathname } from "next/navigation";

type AdFormat = "auto" | "fluid" | "rectangle";

type Props = {
  slot: string;                  // e.g. "1234567890" from AdSense
  format?: AdFormat;
  fullWidthResponsive?: boolean;
  minHeight?: number;            // reserve space → no CLS
  className?: string;
};

declare global {
  interface Window { adsbygoogle?: unknown[] }
}

const ENABLED = process.env.NEXT_PUBLIC_ENABLE_ADS === "true";
const CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? "";

export default function AdSlot({
  slot,
  format = "auto",
  fullWidthResponsive = true,
  minHeight = 280,
  className,
}: Props) {
  const pathname = usePathname();
  const ref = useRef<HTMLModElement | null>(null);
  const canRender = useMemo(() => ENABLED && CLIENT.length > 0, []);

  useEffect(() => {
    if (!canRender || !ref.current) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        try {
          if (!Array.isArray(window.adsbygoogle)) window.adsbygoogle = [];
          window.adsbygoogle.push({});
        } finally {
          io.disconnect();
        }
      },
      { rootMargin: "200px" }
    );

    io.observe(ref.current);
    return () => io.disconnect();
  }, [pathname, slot, canRender]);

  if (!canRender) return null;

  return (
    <ins
      ref={ref}
      className={`adsbygoogle ${className ?? ""}`}
      style={{ display: "block", minHeight }}
      data-ad-client={CLIENT}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive={fullWidthResponsive ? "true" : "false"}
    />
  );
}
