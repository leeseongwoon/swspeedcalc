import { ADSENSE_CLIENT, isAdsenseEnabled } from "@/lib/adsense";

const SCRIPT_ID = "adsense-script";

let loadPromise: Promise<void> | null = null;

/** AdSense JS가 로드될 때까지 대기 (배너 push 전에 호출) */
export function loadAdsenseScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (!isAdsenseEnabled()) return Promise.resolve();

  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      if (existing.dataset.loaded === "true") {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("AdSense load failed")), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.async = true;
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;
    script.crossOrigin = "anonymous";
    script.onload = () => {
      script.dataset.loaded = "true";
      resolve();
    };
    script.onerror = () => reject(new Error("AdSense load failed"));
    document.head.appendChild(script);
  });

  return loadPromise;
}
