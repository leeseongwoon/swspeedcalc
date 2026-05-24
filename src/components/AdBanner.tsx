"use client";

import { ADSENSE_CLIENT } from "@/lib/adsense";
import { loadAdsenseScript } from "@/lib/loadAdsenseScript";
import { useEffect, useRef } from "react";

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[];
  }
}

type AdBannerProps = {
  slot: string;
  format?: "auto" | "horizontal" | "rectangle" | "vertical";
  className?: string;
};

export function AdBanner({
  slot,
  format = "horizontal",
  className = "",
}: AdBannerProps) {
  const insRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (!ADSENSE_CLIENT || !slot || pushed.current) return;

    let cancelled = false;

    loadAdsenseScript()
      .then(() => {
        if (cancelled || pushed.current || !insRef.current) return;
        try {
          window.adsbygoogle = window.adsbygoogle || [];
          window.adsbygoogle.push({});
          pushed.current = true;
        } catch {
          // AdSense blocked
        }
      })
      .catch(() => {
        // Script blocked or failed
      });

    return () => {
      cancelled = true;
    };
  }, [slot]);

  if (!ADSENSE_CLIENT || !slot) return null;

  return (
    <aside
      className={["sw-ad-slot", className].filter(Boolean).join(" ")}
      aria-label="광고"
    >
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </aside>
  );
}
