"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";

interface Props {
  onSubmit: (dishName: string, extraNotes?: string) => void;
  loading?: boolean;
}

export default function DishInput({ onSubmit, loading }: Props) {
  const [dishName, setDishName] = useState("");
  const [extraNotes, setExtraNotes] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!dishName.trim()) return;
        onSubmit(dishName.trim(), extraNotes.trim() || undefined);
      }}
      className="space-y-4"
    >
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-700">
          今天想做什么？
        </label>
        <input
          type="text"
          value={dishName}
          onChange={(e) => setDishName(e.target.value)}
          placeholder="例如：番茄炒蛋、红烧肉、奶油蘑菇汤"
          className="w-full rounded-lg border border-zinc-300 px-4 py-3 text-base focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-700">补充说明（可选）</label>
        <textarea
          value={extraNotes}
          onChange={(e) => setExtraNotes(e.target.value)}
          placeholder="例如：想要清淡一点、只有电磁炉、希望少洗碗……"
          rows={2}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
        />
      </div>

      <button
        type="submit"
        disabled={loading || !dishName.trim()}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 py-3 text-sm font-semibold text-white hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Sparkles size={16} />
        {loading ? "AI 正在生成方案……" : "生成烹饪方案"}
      </button>
    </form>
  );
}
