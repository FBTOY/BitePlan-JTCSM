"use client";

import { useState } from "react";
import Link from "next/link";
import PantryManager from "@/components/PantryManager";
import { loadPantry, savePantry } from "@/lib/storage";
import type { PantryItem } from "@/lib/types";
import { ArrowLeft, Package } from "lucide-react";

export default function PantryPage() {
  const [items, setItems] = useState<PantryItem[]>(loadPantry);

  const handleChange = (next: PantryItem[]) => {
    setItems(next);
    savePantry(next);
  };

  return (
    <div className="flex min-h-full flex-col bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-4">
          <Link
            href="/"
            className="flex items-center gap-1 text-sm text-zinc-600 hover:text-zinc-900"
          >
            <ArrowLeft size={16} /> 返回
          </Link>
          <div className="flex items-center gap-2 text-lg font-bold text-zinc-900">
            <Package className="text-orange-600" size={20} />
            储备管理
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
        <PantryManager items={items} onChange={handleChange} />
      </main>
    </div>
  );
}
