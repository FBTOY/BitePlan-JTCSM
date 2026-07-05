import type { SessionFeedback, TastePreferences, UserPreferences } from "./types";

interface TasteSignal {
  key: keyof TastePreferences;
  increase: string[];
  decrease: string[];
}

const signals: TasteSignal[] = [
  {
    key: "sweet",
    increase: ["不够甜", "不甜", "偏淡", "甜点", "再甜", "加糖"],
    decrease: ["太甜", "偏甜", "过甜", "甜了", "腻", "少糖"],
  },
  {
    key: "sour",
    increase: ["不够酸", "不酸", "再加醋", "酸点", "偏淡"],
    decrease: ["太酸", "偏酸", "过酸", "酸了", "醋多"],
  },
  {
    key: "bitter",
    increase: ["不够苦", "不苦", "苦点"],
    decrease: ["太苦", "偏苦", "过苦", "苦了", "焦苦"],
  },
  {
    key: "spicy",
    increase: ["不够辣", "不辣", "辣点", "再辣", "加辣", "偏淡"],
    decrease: ["太辣", "偏辣", "过辣", "辣了", "太麻", "少辣"],
  },
  {
    key: "salty",
    increase: ["淡", "不够咸", "不咸", "咸点", "加盐", "偏淡"],
    decrease: ["太咸", "偏咸", "过咸", "咸了", "盐多"],
  },
];

const ADJUSTMENT = 8;
const MIN = 0;
const MAX = 100;

function clamp(value: number): number {
  return Math.max(MIN, Math.min(MAX, value));
}

export function calibrateTasteFromFeedback(
  preferences: UserPreferences,
  feedback: SessionFeedback
): TastePreferences {
  const text = `${feedback.taste} ${feedback.notes}`.toLowerCase();
  const next = { ...preferences.tastePreferences };

  for (const signal of signals) {
    if (signal.decrease.some((keyword) => text.includes(keyword))) {
      next[signal.key] = clamp(next[signal.key] - ADJUSTMENT);
    } else if (signal.increase.some((keyword) => text.includes(keyword))) {
      next[signal.key] = clamp(next[signal.key] + ADJUSTMENT);
    }
  }

  return next;
}

export function describeTasteChange(
  before: TastePreferences,
  after: TastePreferences
): string | null {
  const changes = Object.entries(after)
    .filter(([key]) => before[key as keyof TastePreferences] !== after[key as keyof TastePreferences])
    .map(([key, value]) => {
      const label =
        key === "sweet"
          ? "甜"
          : key === "sour"
          ? "酸"
          : key === "bitter"
          ? "苦"
          : key === "spicy"
          ? "辣"
          : "咸";
      const diff = value - before[key as keyof TastePreferences];
      return `${label}${diff > 0 ? "↑" : "↓"}${Math.abs(diff)}`;
    });

  if (changes.length === 0) return null;
  return `已自动校准口味偏好：${changes.join("、")}`;
}
