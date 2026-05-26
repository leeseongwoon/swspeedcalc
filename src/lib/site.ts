export const siteConfig = {
  name: "서머너즈워 공속 계산기",
  shortName: "SW 공속 계산기",
  description:
    "명예건물·리더스킬·룬 추가 공속을 반영해 몬스터별 최종 공속과 턴 순서를 계산하는 서머너즈워 공격속도 계산기입니다.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://swspeedcalc.vercel.app",
  locale: "ko_KR",
  keywords: [
    "서머너즈워",
    "서머너즈 워",
    "Summoners War",
    "서머너즈워 공속계산기",
    "서머너즈워 공속 계산기",
    "서머너즈 워 공속계산기",
    "서머너즈 워 공속 계산기",
    "공속 계산기",
    "공격속도 계산기",
    "턴 순서",
    "스피드 계산",
    "리더스킬 공속",
    "명예건물 공속",
    "룬 공속",
  ],
} as const;
