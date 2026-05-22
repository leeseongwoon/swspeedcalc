export type SpeedBonuses = {
  /** 명예건물(%) + 리더스킬(%) 등 합산 퍼센트 */
  percent: number;
};

export type MonsterSpeedInput = {
  baseSpeed: number;
  /** 룬/아티/정수 등으로 얻는 추가 공속 (flat) */
  addSpeed: number;
  /** %·룬 반영 후 더해지는 패시브 flat (예: 슈마르 +15) */
  postPassiveFlat?: number;
};

export type SpeedBreakdown = {
  afterPercent: number;
  runeFlat: number;
  passiveFlat: number;
  total: number;
};

/**
 * SW 공속: floor(base × (1 + %/100)) + 룬 flat + 패시브 flat(맨 마지막)
 */
export function calcFinalSpeedBreakdown(
  input: MonsterSpeedInput,
  bonuses: SpeedBonuses,
): SpeedBreakdown {
  const percent = Number.isFinite(bonuses.percent) ? bonuses.percent : 0;
  const base = Math.max(0, input.baseSpeed);
  const addRaw = Number.isFinite(input.addSpeed) ? input.addSpeed : 0;
  const runeFlat = Math.max(0, addRaw);
  const passiveRaw = input.postPassiveFlat ?? 0;
  const passiveFlat = Math.max(
    0,
    Number.isFinite(passiveRaw) ? passiveRaw : 0,
  );
  const afterPercent = Math.floor(base * (1 + percent / 100));
  return {
    afterPercent,
    runeFlat,
    passiveFlat,
    total: afterPercent + runeFlat + passiveFlat,
  };
}

export function calcFinalSpeed(
  input: MonsterSpeedInput,
  bonuses: SpeedBonuses,
): number {
  return calcFinalSpeedBreakdown(input, bonuses).total;
}
