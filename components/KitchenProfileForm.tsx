"use client";

import Link from "next/link";
import type { KitchenProfile, SkillLevel } from "@/lib/types";
import { ChefHat, Clock, Users, Package } from "lucide-react";

interface Props {
  initial?: KitchenProfile | null;
  onSave: (profile: KitchenProfile) => void;
}

const defaultProfile: KitchenProfile = {
  servings: 2,
  skillLevel: "beginner",
  timeMinutes: 60,
  dietaryNotes: "",
  availableIngredients: [],
  availableTools: [],
};

export default function KitchenProfileForm({ initial, onSave }: Props) {
  const profile = initial || defaultProfile;

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        onSave({
          servings: Number(form.get("servings")),
          timeMinutes: Number(form.get("timeMinutes")),
          skillLevel: form.get("skillLevel") as SkillLevel,
          dietaryNotes: String(form.get("dietaryNotes") || ""),
          availableIngredients: profile.availableIngredients,
          availableTools: profile.availableTools,
        });
      }}
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-zinc-700">
            <Users size={16} /> 用餐人数
          </label>
          <input
            type="number"
            min={1}
            max={20}
            defaultValue={profile.servings}
            name="servings"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-zinc-700">
            <Clock size={16} /> 可用时间（分钟）
          </label>
          <input
            type="number"
            min={5}
            step={5}
            defaultValue={profile.timeMinutes}
            name="timeMinutes"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-zinc-700">
          <ChefHat size={16} /> 烹饪水平
        </label>
        <select
          name="skillLevel"
          defaultValue={profile.skillLevel}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
        >
          <option value="beginner">新手 — 需要详细说明</option>
          <option value="intermediate">进阶 — 熟悉基础操作</option>
          <option value="advanced">熟练 — 可以接受简略步骤</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-700">饮食备注 / 忌口</label>
        <textarea
          name="dietaryNotes"
          defaultValue={profile.dietaryNotes}
          placeholder="例如：不吃辣、清真、低盐、素食……"
          rows={2}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
        />
      </div>

      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-700">
          <Package size={16} /> 食材与工具
        </div>
        <p className="mb-3 text-sm text-zinc-600">
          在「储备管理」中维护现有食材、调料和工具，生成方案时会自动带入。
        </p>
        <Link
          href="/pantry"
          className="inline-flex rounded-lg bg-white px-3 py-2 text-sm font-medium text-zinc-700 shadow-sm ring-1 ring-zinc-200 hover:bg-zinc-50"
        >
          去管理储备 →
        </Link>
      </div>

      <button
        type="submit"
        className="w-full rounded-lg bg-orange-600 py-3 text-sm font-semibold text-white hover:bg-orange-700"
      >
        保存厨房档案
      </button>
    </form>
  );
}
