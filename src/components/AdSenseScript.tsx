import { ADSENSE_CLIENT, isAdsenseEnabled } from "@/lib/adsense";
import Script from "next/script";

export function AdSenseScript() {
  if (!isAdsenseEnabled()) return null;

  return (
    <Script
      id="adsense-script"
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
