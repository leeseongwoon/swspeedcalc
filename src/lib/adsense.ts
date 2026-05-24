export const ADSENSE_CLIENT =
  process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? "ca-pub-7703126764016123";

export const ADSENSE_SLOTS = {
  top: process.env.NEXT_PUBLIC_ADSENSE_SLOT_TOP ?? "",
  bottom: process.env.NEXT_PUBLIC_ADSENSE_SLOT_BOTTOM ?? "",
} as const;

export function isAdsenseEnabled(): boolean {
  return ADSENSE_CLIENT.startsWith("ca-pub-");
}
