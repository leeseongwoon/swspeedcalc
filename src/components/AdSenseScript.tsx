"use client";

import { loadAdsenseScript } from "@/lib/loadAdsenseScript";
import { useEffect } from "react";

/** layout에서 미리 AdSense 스크립트 로드 시작 */
export function AdSenseScript() {
  useEffect(() => {
    loadAdsenseScript().catch(() => {});
  }, []);

  return null;
}
