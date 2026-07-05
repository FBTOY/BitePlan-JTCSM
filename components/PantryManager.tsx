"use client";

import { useState } from "react";
import type { PantryItem } from "@/lib/types";
import { Plus, Trash2, Package, Droplets, UtensilsCrossed } from "lucide-react";

interface Props {
  items: PantryItem[];
  onChange: (items: PantryItem[]) => void;
}

const categoryIcons = {
  ingredient: <Package size={14} />,
  seasoning: <Droplets size={14} />,
  tool: <UtensilsCrossed size={14} />,
};

const categoryLabels = {
  ingredient: "食材",
  seasoning: "配料/调料",
  tool: "工具",
};

const categoryColors = {
  ingredient: "bg-green-50 text-green-800",
  seasoning: "bg-amber-50 text-amber-800",
  tool: "bg-blue-50 text-blue-800",
};

export default function PantryManager({ items, onChange }: Props) {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [category, setCategory] = useState<PantryItem["category"]>("ingredient");
  const [note, setNote] = useState("");

  const add = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const now = new Date().toISOString();
    const existing = items.find(
      (i) => i.name === trimmed && i.category === category
    );
    const newItem: PantryItem = {
      id:
        existing?.id ||
        `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      name: trimmed,
      quantity: quantity.trim() || existing?.quantity,
      category,
      note: note.trim() || existing?.note,
      updatedAt: now,
    };

    if (existing) {
      onChange(items.map((i) => (i.id === existing.id ? newItem : i)));
    } else {
      onChange([newItem, ...items]);
    }

    setName("");
    setQuantity("");
    setNote("");
  };

  const remove = (id: string) => {
    onChange(items.filter((i) => i.id !== id));
  };

  const grouped = items.reduce(
    (acc, item) => {
      acc[item.category].push(item);
      return acc;
    },
    { ingredient: [], seasoning: [], tool: [] } as Record<
      PantryItem["category"],
      PantryItem[]
    >
  );

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-zinc-900">添加储备</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="名称，例如：生抽"
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
          <input
            type="text"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="数量（可选）"
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as PantryItem["category"])}
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          >
            <option value="ingredient">食材</option>
            <option value="seasoning">配料/调料</option>
            <option value="tool">工具</option>
          </select>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="备注（可选）"
            className="rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
        </div>
        <button
          type="button"
          onClick={add}
          disabled={!name.trim()}
          className="mt-3 flex items-center gap-1 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
        >
          <Plus size={16} /> 添加
        </button>
      </div>

      {(Object.keys(categoryLabels) as PantryItem["category"][]).map((cat) => {
        const list = grouped[cat];
        if (list.length === 0) return null;
        return (
          <div key={cat}>
            <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-900">
              <span className={`rounded p-1 ${categoryColors[cat]}`}>
                {categoryIcons[cat]}
              </span>
              {categoryLabels[cat]}
            </h4>
            <div className="flex flex-wrap gap-2">
              {list.map((item) => (
                <span
                  key={item.id}
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm ${categoryColors[cat]}`}
                >
                  <span>
                    {item.name}
                    {item.quantity && (
                      <span className="opacity-75"> · {item.quantity}</span>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => remove(item.id)}
                    className="opacity-60 hover:opacity-100"
                  >
                    <Trash2 size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        );
      })}

      {items.length === 0 && (
        <div className="rounded-lg border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500">
          储备为空。可以在生成菜谱后点击食材/配料一键加入，也可以在这里手动添加。
        </div>
      )}
    </div>
  );
}
