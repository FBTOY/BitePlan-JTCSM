"use client";

import { useState } from "react";
import type { PantryItem } from "@/lib/types";
import {
  Plus,
  Trash2,
  Package,
  Droplets,
  UtensilsCrossed,
  Search,
} from "lucide-react";

interface Props {
  items: PantryItem[];
  onChange: (items: PantryItem[]) => void;
}

const categories: {
  key: PantryItem["category"];
  label: string;
  placeholder: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
}[] = [
  {
    key: "ingredient",
    label: "食材",
    placeholder: "例如：土豆、鸡蛋、牛肉",
    icon: <Package size={16} />,
    color: "text-green-700",
    bg: "bg-green-50",
  },
  {
    key: "seasoning",
    label: "配料/调料",
    placeholder: "例如：生抽、蚝油、花椒",
    icon: <Droplets size={16} />,
    color: "text-amber-700",
    bg: "bg-amber-50",
  },
  {
    key: "tool",
    label: "工具",
    placeholder: "例如：炒锅、空气炸锅、料理机",
    icon: <UtensilsCrossed size={16} />,
    color: "text-blue-700",
    bg: "bg-blue-50",
  },
];

export default function PantryManager({ items, onChange }: Props) {
  const [activeCategory, setActiveCategory] = useState<PantryItem["category"]>(
    "ingredient"
  );
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");
  const [search, setSearch] = useState("");

  const active = categories.find((c) => c.key === activeCategory)!;

  const add = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const now = new Date().toISOString();
    const existing = items.find(
      (i) => i.name === trimmed && i.category === activeCategory
    );
    const newItem: PantryItem = {
      id:
        existing?.id ||
        `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      name: trimmed,
      quantity: quantity.trim() || existing?.quantity,
      category: activeCategory,
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

  const filtered = items
    .filter((i) => i.category === activeCategory)
    .filter(
      (i) =>
        !search.trim() ||
        i.name.toLowerCase().includes(search.trim().toLowerCase()) ||
        (i.note && i.note.toLowerCase().includes(search.trim().toLowerCase()))
    );

  const counts = categories.map((cat) => ({
    ...cat,
    count: items.filter((i) => i.category === cat.key).length,
  }));

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-zinc-900">添加储备</h3>

        <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
          {counts.map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => setActiveCategory(cat.key)}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                activeCategory === cat.key
                  ? `${cat.bg} ${cat.color} ring-1 ring-inset ring-current`
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              {cat.icon}
              {cat.label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-xs ${
                  activeCategory === cat.key ? "bg-white/60" : "bg-white"
                }`}
              >
                {cat.count}
              </span>
            </button>
          ))}
        </div>

        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={active.placeholder}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
            <input
              type="text"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder={`数量（可选）`}
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="备注（可选）"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
          <button
            type="button"
            onClick={add}
            disabled={!name.trim()}
            aria-label={`添加${active.label}`}
            className="flex items-center gap-1 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
          >
            <Plus size={16} /> 添加{active.label}
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h4
            className={`flex items-center gap-2 text-sm font-semibold ${active.color}`}
          >
            <span className={`rounded p-1 ${active.bg}`}>{active.icon}</span>
            {active.label}列表
          </h4>
          <div className="relative">
            <Search
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索"
              className="rounded-lg border border-zinc-300 py-1.5 pl-8 pr-3 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500">
            {search.trim()
              ? "没有找到匹配的储备"
              : `暂无${active.label}。可以在上方添加，或在生成菜谱后点击食材/配料一键加入。`}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="group flex items-start justify-between rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm"
              >
                <div className="min-w-0">
                  <div className="font-medium text-zinc-900">{item.name}</div>
                  {(item.quantity || item.note) && (
                    <div className="mt-0.5 text-zinc-500">
                      {item.quantity}
                      {item.quantity && item.note && " · "}
                      {item.note}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => remove(item.id)}
                  aria-label={`删除 ${item.name}`}
                  className="ml-2 text-zinc-400 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-600"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
