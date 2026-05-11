"use client";

import { monsters } from "@/data/monsters";
import type { Monster } from "@/types/monster";
import { calcFinalSpeed } from "@/lib/speed";
import { useEffect, useMemo, useRef, useState } from "react";

type Slot = {
  key: string;
  monsterId: string | "";
  addSpeed: number;
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

export default function Home() {
  const monsterList = useMemo(() => Object.values(monsters), []);
  const monsterById = useMemo(() => monsters, []);
  const [pickerOpenSlotKey, setPickerOpenSlotKey] = useState<string | null>(
    null,
  );
  const [pickerQuery, setPickerQuery] = useState("");
  const pickerList = useMemo(() => {
    const list = monsterList.filter((m) => monsterMatchesQuery(m, pickerQuery));
    list.sort((a, b) => a.awakenedNameKr.localeCompare(b.awakenedNameKr, "ko"));
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
    <div className="flex flex-1 flex-col bg-zinc-50 font-sans text-zinc-950 dark:bg-black dark:text-zinc-50">
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-10 sm:px-8 lg:px-12 lg:py-16 xl:px-16 xl:py-20">
        <header className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            서머너즈워 공격속도 계산기
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            명예건물(%) + 리더스킬(%)만 먼저 반영하고, 각 몬스터는 추가
            공속(룬)이 반영됩니다.
          </p>
        </header>

        <section className="grid gap-3 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950 sm:grid-cols-3">
          <div className="flex flex-col gap-1">
            <label className="pl-1 text-sm font-medium">명예건물 공속(%)</label>
            <input
              className="h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-black dark:focus:border-zinc-600"
              inputMode="numeric"
              value={honorPercent}
              onChange={(e) =>
                setHonorPercent(clampInt(Number(e.target.value), 0, 15))
              }
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="pl-1 text-sm font-medium">리더스킬 공속(%)</label>
            <div className="relative" ref={leaderRef}>
              <button
                type="button"
                className={[
                  "flex h-11 w-full items-center justify-between border border-zinc-200 bg-white px-3 text-left text-sm outline-none hover:bg-zinc-50 focus:border-zinc-400 dark:border-zinc-800 dark:bg-black dark:hover:bg-zinc-900 dark:focus:border-zinc-600",
                  "rounded-xl",
                ].join(" ")}
                aria-haspopup="listbox"
                aria-expanded={leaderOpen}
                onClick={() => setLeaderOpen((v) => !v)}
              >
                <span>{leaderPercent}%</span>
                <span className="ml-3 shrink-0 text-zinc-500 dark:text-zinc-400">
                  ▾
                </span>
              </button>
              {leaderOpen ? (
                <div
                  className="absolute left-0 right-0 top-full z-50 mt-0.5 max-h-64 overflow-auto rounded-xl border border-zinc-200 bg-white p-1 shadow-xl dark:border-zinc-800 dark:bg-zinc-950"
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
                          "flex h-10 w-full items-center rounded-lg px-3 text-left text-sm",
                          active
                            ? "bg-zinc-900 text-white dark:bg-white dark:text-black"
                            : "hover:bg-zinc-50 dark:hover:bg-zinc-900",
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
              <div className="pl-1 text-sm font-medium">합산 보너스(%)</div>
              <div className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-sm leading-[44px] tabular-nums dark:border-zinc-800 dark:bg-zinc-900">
                {totalPercent}%
              </div>
          </div>
        </section>

        <section className="grid gap-3 lg:grid-cols-2">
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold">몬스터 선택 (3~5)</h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="h-9 rounded-xl border border-zinc-200 bg-white px-3 text-sm font-medium disabled:opacity-50 dark:border-zinc-800 dark:bg-black"
                  disabled={!canRemoveSlot}
                  onClick={() => setSlots((prev) => prev.slice(0, prev.length - 1))}
                >
                  - 슬롯
                </button>
                <button
                  type="button"
                  className="h-9 rounded-xl bg-zinc-900 px-3 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-black"
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
                  className="grid grid-cols-1 gap-2 rounded-xl border border-zinc-200 p-3 dark:border-zinc-800 sm:grid-cols-5"
                >
                  <div className="sm:col-span-3">
                    <div className="pl-1 mb-1 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                      슬롯 {i + 1}
                    </div>
                    <button
                      type="button"
                      className="flex h-11 w-full items-center justify-between rounded-xl border border-zinc-200 bg-white px-3 text-left text-sm outline-none hover:bg-zinc-50 dark:border-zinc-800 dark:bg-black dark:hover:bg-zinc-900"
                      onClick={() => {
                        setPickerOpenSlotKey(slot.key);
                        setPickerQuery("");
                      }}
                    >
                      <span className="truncate">
                        {slot.monsterId
                          ? labelMonster(monsterById[slot.monsterId])
                          : "몬스터 선택"}
                      </span>
                      {/*   
                      <span className="ml-3 shrink-0 text-zinc-500 dark:text-zinc-400">
                        검색
                      </span> 
                      */}
                    </button>
                  </div>

                  <div className="sm:col-span-2">
                    <div className="pl-1 mb-1 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                      추가 공속(+)
                    </div>
                    <input
                      className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-black dark:focus:border-zinc-600"
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

          <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="mb-3 text-base font-semibold">
              턴 순서 (최종 공속 내림차순)
            </h2>

            {filled.length === 0 ? (
              <div className="rounded-xl border border-dashed border-zinc-200 p-6 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
                몬스터를 1마리 이상 선택하면 여기에서 순서가 계산됩니다.
              </div>
            ) : (
              <ol className="flex flex-col gap-2">
                {filled.map((x, rank) => (
                  <li
                    key={`${x.slotKey}-${x.monster.id}`}
                    className="flex items-center justify-between rounded-xl border border-zinc-200 p-3 dark:border-zinc-800"
                  >
                    <div className="flex flex-col">
                      <div className="text-sm font-semibold">
                        {rank + 1}. {x.monster.nameKr}
                        <span className="ml-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                          ({x.monster.attribute})
                        </span>
                      </div>
                      <div className="text-xs text-zinc-600 dark:text-zinc-400">
                        기본 {x.monster.baseSpeed} · 보너스 {totalPercent}% ·
                        추가 +{x.addSpeed}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold">
                        {x.finalSpeed}
                      </div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">
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
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          onMouseDown={() => setPickerOpenSlotKey(null)}
        >
          <div
            className="w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white p-4 shadow-xl dark:border-zinc-800 dark:bg-zinc-950"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="text-base font-semibold">몬스터 검색</div>
              <button
                type="button"
                className="h-9 rounded-xl border border-zinc-200 bg-white px-3 text-sm font-medium dark:border-zinc-800 dark:bg-black"
                onClick={() => setPickerOpenSlotKey(null)}
              >
                닫기
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input
                className="h-11 flex-1 rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-zinc-400 dark:border-zinc-800 dark:bg-black dark:focus:border-zinc-600"
                placeholder="이름/각성/속성/ID로 검색 (예: 조커, 루쉔, lushen)"
                value={pickerQuery}
                autoFocus
                onChange={(e) => setPickerQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setPickerOpenSlotKey(null);
                }}
              />
              <div className="shrink-0 text-xs text-zinc-500 dark:text-zinc-400">
                {pickerList.length}/{monsterList.length}
              </div>
            </div>

            <div className="mt-3 max-h-[60vh] overflow-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
              {pickerList.length === 0 ? (
                <div className="p-4 text-sm text-zinc-600 dark:text-zinc-400">
                  검색 결과가 없습니다.
                </div>
              ) : (
                <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {pickerList.map((m) => (
                    <li key={m.id}>
                      <button
                        type="button"
                        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-900"
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
                        <div className="flex min-w-0 flex-col">
                          <div className="truncate text-sm font-semibold">
                            {m.awakenedNameKr}
                            <span className="ml-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                              ({m.attribute})
                            </span>
                          </div>
                          <div className="truncate text-xs text-zinc-600 dark:text-zinc-400">
                            {m.nameKr} · 기본 {m.baseSpeed} · {m.stars}성 · id:
                            {m.id}
                          </div>
                        </div>
                        <div className="shrink-0 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                          선택
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
              팁: ESC로 닫기 가능
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
