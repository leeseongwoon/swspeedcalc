"use client";

import { ADSENSE_CLIENT, isAdsenseEnabled } from "@/lib/adsense";
import { useEffect } from "react";

const SCRIPT_ID = "adsense-script";

export function AdSenseScript() {
  useEffect(() => {
    if (!isAdsenseEnabled()) return;
    if (document.getElementById(SCRIPT_ID)) return;

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.async = true;
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;
    script.crossOrigin = "anonymous";
    document.head.appendChild(script);
  }, []);

  return null;
}
