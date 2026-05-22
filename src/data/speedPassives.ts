/** 계산이 끝난 뒤( % + 룬 flat ) 더해지는 패시브 공속 */
export type SpeedPassive = {
  postFlat: number;
  label?: string;
};

/**
 * 패시브 공속이 있는 몬스터만 등록 (monsters.ts 전체 수정 불필요)
 * key = Monster.id
 */
export const speedPassives: Record<string, SpeedPassive> = {
  snumar: { postFlat: 15, label: "패시브" },
};

export function getPostPassiveFlat(monsterId: string): number {
  return speedPassives[monsterId]?.postFlat ?? 0;
}
