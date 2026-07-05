"use client";

import type { UserPreferences, WeightUnit, VolumeUnit } from "@/lib/types";

interface Props {
  preferences: UserPreferences;
  onChange: (preferences: UserPreferences) => void;
}

const weightUnits: { value: WeightUnit; label: string }[] = [
  { value: "g", label: "克 (g)" },
  { value: "kg", label: "千克 (kg)" },
  { value: "oz", label: "盎司 (oz)" },
  { value: "lb", label: "磅 (lb)" },
];

const volumeUnits: { value: VolumeUnit; label: string }[] = [
  { value: "ml", label: "毫升 (ml)" },
  { value: "l", label: "升 (l)" },
  { value: "cup", label: "杯 (cup)" },
  { value: "tbsp", label: "汤匙 (tbsp)" },
  { value: "tsp", label: "茶匙 (tsp)" },
];

export default function PreferencesForm({ preferences, onChange }: Props) {
  return (
    <div className="space-y-5 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-zinc-900">偏好设置</h3>

      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-700">重量单位</label>
        <select
          value={preferences.weightUnit}
          onChange={(e) =>
            onChange({ ...preferences, weightUnit: e.target.value as WeightUnit })
          }
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
        >
          {weightUnits.map((u) => (
            <option key={u.value} value={u.value}>{u.label}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-700">容积单位</label>
        <select
          value={preferences.volumeUnit}
          onChange={(e) =>
            onChange({ ...preferences, volumeUnit: e.target.value as VolumeUnit })
          }
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
        >
          {volumeUnits.map((u) => (
            <option key={u.value} value={u.value}>{u.label}</option>
          ))}
        </select>
      </div>

      <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700">
        <input
          type="checkbox"
          checked={preferences.onlyUseMassUnits}
          onChange={(e) =>
            onChange({ ...preferences, onlyUseMassUnits: e.target.checked })
          }
          className="rounded border-zinc-300 text-orange-600 focus:ring-orange-500"
        />
        只使用质量单位（容积单位自动转换为克/千克）
      </label>
    </div>
  );
}
