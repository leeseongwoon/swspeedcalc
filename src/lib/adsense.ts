export const ADSENSE_CLIENT =
  process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? "ca-pub-7703126764016123";

/** 하단 배너 광고 슬롯 (NEXT_PUBLIC_ADSENSE_SLOT 또는 SLOT_TOP) */
export const ADSENSE_SLOT =
  process.env.NEXT_PUBLIC_ADSENSE_SLOT ??
  process.env.NEXT_PUBLIC_ADSENSE_SLOT_TOP ??
  "7589868522";

export function isAdsenseEnabled(): boolean {
  return ADSENSE_CLIENT.startsWith("ca-pub-");
}
