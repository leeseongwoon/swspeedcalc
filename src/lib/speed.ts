export type SpeedBonuses = {
  /** 명예건물(%) + 리더스킬(%) 등 합산 퍼센트 */
  percent: number;
};

export type MonsterSpeedInput = {
  baseSpeed: number;
  /** 룬/아티/정수 등으로 얻는 추가 공속 (flat) */
  addSpeed: number;
};

/**
 * SW 공속은 퍼센트가 base에만 적용되고, 그 뒤 flat이 더해지는 형태로 쓰는 게 일반적이라
 * 우선 이 형태로 고정합니다.
 */
export function calcFinalSpeed(
  input: MonsterSpeedInput,
  bonuses: SpeedBonuses,
): number {
  const percent = Number.isFinite(bonuses.percent) ? bonuses.percent : 0;
  const base = Math.max(0, input.baseSpeed);
  const addRaw = Number.isFinite(input.addSpeed) ? input.addSpeed : 0;
  const add = Math.max(0, addRaw);
  return Math.floor(base * (1 + percent / 100)) + add;
}

