"use client";

import { useState } from "react";
import Link from "next/link";
import ProviderConfigForm from "@/components/ProviderConfigForm";
import { loadProviders, saveProviders } from "@/lib/storage";
import type { ProviderConfig } from "@/lib/types";
import { ArrowLeft, Sparkles } from "lucide-react";

export default function SettingsPage() {
  const [providers, setProviders] = useState<ProviderConfig[]>(loadProviders);

  const handleChange = (next: ProviderConfig[]) => {
    setProviders(next);
    saveProviders(next);
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
            <Sparkles className="text-orange-600" size={20} />
            设置
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
        <ProviderConfigForm providers={providers} onChange={handleChange} />
      </main>
    </div>
  );
}
