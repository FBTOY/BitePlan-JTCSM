"use client";

import { useState } from "react";
import type {
  UserPreferences,
  WeightUnit,
  VolumeUnit,
  TasteKey,
  CustomUnit,
} from "@/lib/types";
import { Plus, Trash2 } from "lucide-react";

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

const tasteOptions: { key: TasteKey; label: string; low: string; high: string }[] = [
  { key: "sweet", label: "甜", low: "清淡", high: "喜甜" },
  { key: "sour", label: "酸", low: "少酸", high: "喜酸" },
  { key: "bitter", label: "苦", low: "少苦", high: "喜苦" },
  { key: "spicy", label: "辣", low: "不辣", high: "重辣" },
  { key: "salty", label: "咸", low: "清淡", high: "偏咸" },
];

export default function PreferencesForm({ preferences, onChange }: Props) {
  const [newUnitName, setNewUnitName] = useState("");
  const [newUnitGrams, setNewUnitGrams] = useState("");

  const updateTaste = (key: TasteKey, value: number) => {
    onChange({
      ...preferences,
      tastePreferences: { ...preferences.tastePreferences, [key]: value },
    });
  };

  const addCustomUnit = () => {
    const name = newUnitName.trim();
    const grams = Number(newUnitGrams);
    if (!name || Number.isNaN(grams) || grams <= 0) return;
    const unit: CustomUnit = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      name,
      grams,
    };
    onChange({
      ...preferences,
      customUnits: [...preferences.customUnits, unit],
    });
    setNewUnitName("");
    setNewUnitGrams("");
  };

  const removeCustomUnit = (id: string) => {
    onChange({
      ...preferences,
      customUnits: preferences.customUnits.filter((u) => u.id !== id),
    });
  };

  return (
    <div className="space-y-7 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-zinc-900">偏好设置</h3>

      <div className="grid gap-5 sm:grid-cols-2">
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
              <option key={u.value} value={u.value}>
                {u.label}
              </option>
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
              <option key={u.value} value={u.value}>
                {u.label}
              </option>
            ))}
          </select>
        </div>
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

      <div className="space-y-4">
        <div className="text-sm font-medium text-zinc-700">口味偏好</div>
        <p className="text-xs text-zinc-500">
          50 为中性，向左表示希望减少，向右表示希望增加。
        </p>
        {tasteOptions.map((opt) => {
          const value = preferences.tastePreferences[opt.key];
          return (
            <div key={opt.key} className="space-y-2">
              <div className="flex items-center justify-between text-sm text-zinc-700">
                <span>{opt.label}</span>
                <span className="text-xs text-zinc-500">
                  {opt.low} · {value} · {opt.high}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={value}
                onChange={(e) => updateTaste(opt.key, Number(e.target.value))}
                className="w-full accent-orange-600"
              />
            </div>
          );
        })}
      </div>

      <div className="space-y-3">
        <div className="text-sm font-medium text-zinc-700">自定义单位</div>
        <p className="text-xs text-zinc-500">
          例如「1 勺 = 5 克」「1 汤匙 = 15 克」，生成菜谱时会优先使用这些家用单位。
        </p>

        <div className="space-y-2">
          {preferences.customUnits.map((unit) => (
            <div
              key={unit.id}
              className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm"
            >
              <span>
                1 {unit.name} = {unit.grams} 克
              </span>
              <button
                type="button"
                onClick={() => removeCustomUnit(unit.id)}
                className="text-zinc-400 hover:text-red-600"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          <input
            type="text"
            value={newUnitName}
            onChange={(e) => setNewUnitName(e.target.value)}
            placeholder="单位名称"
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
          <input
            type="number"
            min={1}
            step="any"
            value={newUnitGrams}
            onChange={(e) => setNewUnitGrams(e.target.value)}
            placeholder="等于多少克"
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
          <button
            type="button"
            onClick={addCustomUnit}
            disabled={!newUnitName.trim() || !newUnitGrams || Number(newUnitGrams) <= 0}
            className="flex items-center justify-center gap-1 rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
          >
            <Plus size={14} /> 添加单位
          </button>
        </div>
      </div>

      <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700">
        <input
          type="checkbox"
          checked={preferences.autoCalibrateTaste}
          onChange={(e) =>
            onChange({ ...preferences, autoCalibrateTaste: e.target.checked })
          }
          className="rounded border-zinc-300 text-orange-600 focus:ring-orange-500"
        />
        自动校准口味偏好（根据反馈自动调整甜酸苦辣咸偏好）
      </label>
    </div>
  );
}
