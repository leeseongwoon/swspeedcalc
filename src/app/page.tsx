"use client";

import { monsters } from "@/data/monsters";
import type { Attribute, Monster } from "@/types/monster";
import { calcFinalSpeed } from "@/lib/speed";
import { useEffect, useMemo, useRef, useState } from "react";

type Slot = {
  key: string;
  monsterId: string | "";
  addSpeed: number;
};

const ATTR_BADGE: Record<Attribute, string> = {
  fire: "sw-attr-badge sw-attr-badge-fire",
  water: "sw-attr-badge sw-attr-badge-water",
  wind: "sw-attr-badge sw-attr-badge-wind",
  light: "sw-attr-badge sw-attr-badge-light",
  dark: "sw-attr-badge sw-attr-badge-dark",
};

function clampInt(n: number, min: number, max: number) {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, Math.trunc(n)));
}

function labelMonster(m: Monster) {
  return `${m.nameKr} (${m.attribute.toUpperCase()}) / ${m.baseSpeed}`;
}

function monsterMatchesQuery(m: Monster, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const hay = [
    m.id,
    m.nameKr,
    m.awakenedNameKr,
    m.attribute,
    String(m.baseSpeed),
    String(m.stars),
  ]
    .join(" ")
    .toLowerCase();
  return hay.includes(q);
}

/** 몬스터 검색 목록: 숫자 → 영문 → 한글 */
function awakenedNameSortCategory(name: string): number {
  const first = [...name.trim()][0];
  if (!first) return 3;
  const code = first.codePointAt(0)!;
  if (code >= 0x30 && code <= 0x39) return 0;
  if (
    (code >= 0x41 && code <= 0x5a) ||
    (code >= 0x61 && code <= 0x7a)
  ) {
    return 1;
  }
  if (
    (code >= 0xac00 && code <= 0xd7a3) ||
    (code >= 0x1100 && code <= 0x11ff) ||
    (code >= 0x3131 && code <= 0x318e)
  ) {
    return 2;
  }
  return 3;
}

function compareAwakenedNameKr(a: string, b: string): number {
  const catA = awakenedNameSortCategory(a);
  const catB = awakenedNameSortCategory(b);
  if (catA !== catB) return catA - catB;
  if (catA === 2) return a.localeCompare(b, "ko");
  return a.localeCompare(b, "en", { numeric: true, sensitivity: "base" });
}

export default function Home() {
  const monsterList = useMemo(() => Object.values(monsters), []);
  const monsterById = useMemo(() => {
    const map: Record<string, Monster> = {};
    for (const m of monsterList) map[m.id] = m;
    return map;
  }, [monsterList]);
  const [pickerOpenSlotKey, setPickerOpenSlotKey] = useState<string | null>(
    null,
  );
  const [pickerQuery, setPickerQuery] = useState("");
  const pickerList = useMemo(() => {
    const list = monsterList.filter((m) => monsterMatchesQuery(m, pickerQuery));
    list.sort((a, b) =>
      compareAwakenedNameKr(a.awakenedNameKr, b.awakenedNameKr),
    );
    return list;
  }, [monsterList, pickerQuery]);

  const [honorPercent, setHonorPercent] = useState(15);
  const [leaderPercent, setLeaderPercent] = useState(0);
  const leaderOptions = useMemo(() => [0, 10, 16, 19, 24, 28, 33], []);
  const [leaderOpen, setLeaderOpen] = useState(false);
  const leaderRef = useRef<HTMLDivElement | null>(null);
  const totalPercent = honorPercent + leaderPercent;

  const [slots, setSlots] = useState<Slot[]>([
    { key: "1", monsterId: "", addSpeed: 0 },
    { key: "2", monsterId: "", addSpeed: 0 },
    { key: "3", monsterId: "", addSpeed: 0 },
  ]);

  const filled = useMemo(() => {
    return slots
      .map((s, idx) => {
        const m = s.monsterId ? monsterById[s.monsterId] : undefined;
        if (!m) return null;
        const finalSpeed = calcFinalSpeed(
          { baseSpeed: m.baseSpeed, addSpeed: s.addSpeed },
          { percent: totalPercent },
        );
        return {
          idx,
          slotKey: s.key,
          monster: m,
          addSpeed: s.addSpeed,
          finalSpeed,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)
      .sort((a, b) => b.finalSpeed - a.finalSpeed);
  }, [slots, monsterById, totalPercent]);

  const canAddSlot = slots.length < 5;
  const canRemoveSlot = slots.length > 3;

  useEffect(() => {
    if (!leaderOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLeaderOpen(false);
    };
    const onMouseDown = (e: MouseEvent) => {
      const el = leaderRef.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) {
        setLeaderOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("mousedown", onMouseDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("mousedown", onMouseDown);
    };
  }, [leaderOpen]);

  return (
    <div className="flex flex-1 flex-col text-[var(--sw-text)]">
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-10 sm:px-8 lg:px-12 lg:py-16 xl:px-16 xl:py-20">
        <header className="flex flex-col gap-2 border-b border-[var(--sw-border-gold)] pb-5">
          <p className="text-xs font-semibold tracking-[0.2em] text-[var(--sw-gold)] uppercase">
            Summoners War
          </p>
          <h1 className="sw-title text-2xl sm:text-3xl">
            서머너즈워 공격속도 계산기
          </h1>
          <p className="sw-subtitle max-w-2xl">
            명예건물(%) + 리더스킬(%)만 먼저 반영하고, 각 몬스터는 추가
            공속(룬)이 반영됩니다.
          </p>
        </header>

        <section className="sw-panel grid gap-3 p-4 sm:grid-cols-3">
          <div className="flex flex-col gap-1">
            <label className="sw-label">명예건물 공속(%)</label>
            <input
              className="sw-input"
              inputMode="numeric"
              value={honorPercent}
              onChange={(e) =>
                setHonorPercent(clampInt(Number(e.target.value), 0, 15))
              }
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="sw-label">리더스킬 공속(%)</label>
            <div className="relative" ref={leaderRef}>
              <button
                type="button"
                className="sw-select"
                aria-haspopup="listbox"
                aria-expanded={leaderOpen}
                onClick={() => setLeaderOpen((v) => !v)}
              >
                <span>{leaderPercent}%</span>
                <span className="ml-3 shrink-0 text-[var(--sw-muted)]">▾</span>
              </button>
              {leaderOpen ? (
                <div
                  className="sw-dropdown"
                  role="listbox"
                  aria-label="리더스킬 공속(%)"
                >
                  {leaderOptions.map((v) => {
                    const active = v === leaderPercent;
                    return (
                      <button
                        key={v}
                        type="button"
                        role="option"
                        aria-selected={active}
                        className={[
                          "sw-dropdown-item",
                          active ? "sw-dropdown-item-active" : "",
                        ].join(" ")}
                        onClick={() => {
                          setLeaderPercent(v);
                          setLeaderOpen(false);
                        }}
                      >
                        {v}%
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="sw-label">합산 보너스(%)</div>
            <div className="sw-readonly">{totalPercent}%</div>
          </div>
        </section>

        <section className="grid gap-3 lg:grid-cols-2">
          <div className="sw-panel p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="sw-section-title">몬스터 선택 (2~5)</h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="sw-btn-outline"
                  disabled={!canRemoveSlot}
                  onClick={() => setSlots((prev) => prev.slice(0, prev.length - 1))}
                >
                  − 슬롯
                </button>
                <button
                  type="button"
                  className="sw-btn-gold"
                  disabled={!canAddSlot}
                  onClick={() =>
                    setSlots((prev) => [
                      ...prev,
                      {
                        key: String(prev.length + 1),
                        monsterId: "",
                        addSpeed: 0,
                      },
                    ])
                  }
                >
                  + 슬롯
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {slots.map((slot, i) => (
                <div
                  key={slot.key}
                  className="sw-panel-inner grid grid-cols-1 gap-2 p-3 sm:grid-cols-5"
                >
                  <div className="sm:col-span-3">
                    <div className="sw-label-sm">슬롯 {i + 1}</div>
                    <button
                      type="button"
                      className="sw-select"
                      onClick={() => {
                        setPickerOpenSlotKey(slot.key);
                        setPickerQuery("");
                      }}
                    >
                      <span className="truncate">
                        {slot.monsterId && monsterById[slot.monsterId]
                          ? labelMonster(monsterById[slot.monsterId])
                          : "몬스터 선택"}
                      </span>
                    </button>
                  </div>

                  <div className="sm:col-span-2">
                    <div className="sw-label-sm">추가 공속(+)</div>
                    <input
                      className="sw-input"
                      inputMode="numeric"
                      value={slot.addSpeed}
                      onChange={(e) => {
                        const v = clampInt(Number(e.target.value), 0, 500);
                        setSlots((prev) =>
                          prev.map((s) =>
                            s.key === slot.key ? { ...s, addSpeed: v } : s,
                          ),
                        );
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="sw-panel p-4">
            <h2 className="sw-section-title mb-3">턴 순서 (최종 공속 내림차순)</h2>

            {filled.length === 0 ? (
              <div className="sw-panel-inner border-dashed p-6 text-center text-sm text-[var(--sw-muted)]">
                몬스터를 1마리 이상 선택하면 여기에서 순서가 계산됩니다.
              </div>
            ) : (
              <ol className="flex flex-col gap-2">
                {filled.map((x, rank) => (
                  <li
                    key={`${x.slotKey}-${x.monster.id}`}
                    className={[
                      "sw-panel-inner flex items-center justify-between p-3",
                      rank === 0 ? "sw-rank-first" : "",
                    ].join(" ")}
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                        <span className="text-[var(--sw-gold-bright)]">
                          {rank + 1}.
                        </span>
                        <span>{x.monster.nameKr}</span>
                        <span className={ATTR_BADGE[x.monster.attribute]}>
                          {x.monster.attribute}
                        </span>
                      </div>
                      <div className="text-xs text-[var(--sw-muted)]">
                        기본 {x.monster.baseSpeed} · 보너스 {totalPercent}% ·
                        추가 +{x.addSpeed}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="sw-speed-value">{x.finalSpeed}</div>
                      <div className="text-xs text-[var(--sw-muted)]">
                        최종 공속
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </section>
      </main>

      {pickerOpenSlotKey ? (
        <div
          className="sw-modal-overlay fixed inset-0 z-50 flex items-start justify-center overflow-y-auto px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top))] sm:pt-8"
          role="dialog"
          aria-modal="true"
          onMouseDown={() => setPickerOpenSlotKey(null)}
        >
          <div
            className="sw-modal w-full max-w-2xl"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="sw-section-title">몬스터 검색</div>
              <button
                type="button"
                className="sw-btn-outline"
                onClick={() => setPickerOpenSlotKey(null)}
              >
                닫기
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input
                className="sw-input flex-1"
                placeholder="몬스터명, 각성명(한글, 영문)으로 검색 (예: 조커, 루쉔, lushen)"
                value={pickerQuery}
                autoFocus
                onChange={(e) => setPickerQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setPickerOpenSlotKey(null);
                }}
              />
              <div className="shrink-0 text-xs font-medium text-[var(--sw-gold)]">
                {pickerList.length}/{monsterList.length}
              </div>
            </div>

            <div className="sw-panel-inner mt-3 max-h-[60vh] overflow-auto">
              {pickerList.length === 0 ? (
                <div className="p-4 text-sm text-[var(--sw-muted)]">
                  검색 결과가 없습니다.
                </div>
              ) : (
                <ul className="divide-y divide-[var(--sw-border)]">
                  {pickerList.map((m) => (
                    <li key={m.id}>
                      <button
                        type="button"
                        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-[rgba(40,58,96,0.5)]"
                        onClick={() => {
                          const pickedId = m.id;
                          setSlots((prev) =>
                            prev.map((s) =>
                              s.key === pickerOpenSlotKey
                                ? { ...s, monsterId: pickedId }
                                : s,
                            ),
                          );
                          setPickerOpenSlotKey(null);
                        }}
                      >
                        <div className="flex min-w-0 flex-col gap-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="truncate text-sm font-semibold text-[var(--sw-text)]">
                              {m.awakenedNameKr}
                            </span>
                            <span className={ATTR_BADGE[m.attribute]}>
                              {m.attribute}
                            </span>
                          </div>
                          <div className="truncate text-xs text-[var(--sw-muted)]">
                            {m.nameKr} · 공격속도 {m.baseSpeed} · {m.stars}성
                          </div>
                        </div>
                        <span className="shrink-0 text-xs font-semibold text-[var(--sw-gold)]">
                          선택
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-3 text-xs text-[var(--sw-muted)]">
              팁: ESC로 닫기 가능
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
