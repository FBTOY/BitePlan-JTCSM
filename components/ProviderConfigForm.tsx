"use client";

import { useState } from "react";
import type { ProviderConfig, ProviderType } from "@/lib/types";
import { defaultModels, providerLabels } from "@/lib/recipe";
import { Key, Plus, Trash2, Check, Sparkles } from "lucide-react";

interface Props {
  providers: ProviderConfig[];
  onChange: (providers: ProviderConfig[]) => void;
}

export default function ProviderConfigForm({ providers, onChange }: Props) {
  const [editing, setEditing] = useState<ProviderConfig | null>(null);

  const startNew = () => {
    setEditing({
      id: `new-${Date.now()}`,
      provider: "moonshot",
      name: "",
      apiKey: "",
      model: defaultModels.moonshot,
      baseUrl: "https://api.moonshot.cn/v1",
      isDefault: providers.length === 0,
    });
  };

  const startEdit = (p: ProviderConfig) => {
    setEditing({ ...p });
  };

  const save = () => {
    if (!editing || !editing.name.trim() || !editing.apiKey.trim()) return;

    const isNew = editing.id.startsWith("new-");
    const id = isNew
      ? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
      : editing.id;
    const saved: ProviderConfig = { ...editing, id };

    let next = providers.map((p) =>
      saved.isDefault && p.id !== id ? { ...p, isDefault: false } : p
    );

    if (isNew) {
      next = [...next, saved];
    } else {
      next = next.map((p) => (p.id === id ? saved : p));
    }

    if (!next.some((p) => p.isDefault)) {
      next[0] = { ...next[0], isDefault: true };
    }

    onChange(next);
    setEditing(null);
  };

  const remove = (id: string) => {
    const next = providers.filter((p) => p.id !== id);
    if (next.length > 0 && !next.some((p) => p.isDefault)) {
      next[0] = { ...next[0], isDefault: true };
    }
    onChange(next);
  };

  const setDefault = (id: string) => {
    const next = providers.map((p) => ({ ...p, isDefault: p.id === id }));
    onChange(next);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-900">AI 服务配置</h2>
        <button
          type="button"
          onClick={startNew}
          className="flex items-center gap-1 rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700"
        >
          <Plus size={16} /> 添加
        </button>
      </div>

      {providers.length === 0 && !editing && (
        <div className="rounded-lg border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500">
          还没有配置 AI 服务。点击「添加」配置 Kimi 或 Claude。
        </div>
      )}

      <div className="space-y-3">
        {providers.map((p) => (
          <div
            key={p.id}
            className={`flex items-center justify-between rounded-lg border p-4 ${
              p.isDefault
                ? "border-orange-300 bg-orange-50"
                : "border-zinc-200 bg-white"
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-medium text-zinc-900">
                <Sparkles size={16} className="text-orange-600" />
                {p.name}
                {p.isDefault && (
                  <span className="rounded-full bg-orange-200 px-2 py-0.5 text-xs text-orange-800">
                    默认
                  </span>
                )}
              </div>
              <div className="text-sm text-zinc-500">
                {providerLabels[p.provider]} · {p.model}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!p.isDefault && (
                <button
                  type="button"
                  onClick={() => setDefault(p.id)}
                  className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50"
                >
                  设为默认
                </button>
              )}
              <button
                type="button"
                onClick={() => startEdit(p)}
                className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50"
              >
                编辑
              </button>
              <button
                type="button"
                onClick={() => remove(p.id)}
                className="rounded-lg border border-red-200 p-1.5 text-red-600 hover:bg-red-50"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700">服务商</label>
            <select
              value={editing.provider}
              onChange={(e) => {
                const provider = e.target.value as ProviderType;
                setEditing({
                  ...editing,
                  provider,
                  model: defaultModels[provider],
                  baseUrl:
                    provider === "moonshot"
                      ? "https://api.moonshot.cn/v1"
                      : "",
                });
              }}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              <option value="moonshot">Moonshot (Kimi)</option>
              <option value="anthropic">Anthropic (Claude)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700">配置名称</label>
            <input
              type="text"
              value={editing.name}
              onChange={(e) =>
                setEditing({ ...editing, name: e.target.value })
              }
              placeholder="例如：我的 Kimi"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-1 text-sm font-medium text-zinc-700">
              <Key size={14} /> API Key
            </label>
            <input
              type="password"
              value={editing.apiKey}
              onChange={(e) =>
                setEditing({ ...editing, apiKey: e.target.value })
              }
              placeholder="sk-..."
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700">模型</label>
            <input
              type="text"
              value={editing.model}
              onChange={(e) =>
                setEditing({ ...editing, model: e.target.value })
              }
              placeholder={defaultModels[editing.provider]}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>

          {editing.provider === "moonshot" && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700">Base URL（可选）</label>
              <input
                type="text"
                value={editing.baseUrl || ""}
                onChange={(e) =>
                  setEditing({ ...editing, baseUrl: e.target.value })
                }
                placeholder="https://api.moonshot.cn/v1"
                className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
          )}

          <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-700">
            <input
              type="checkbox"
              checked={editing.isDefault}
              onChange={(e) =>
                setEditing({ ...editing, isDefault: e.target.checked })
              }
              className="rounded border-zinc-300 text-orange-600 focus:ring-orange-500"
            />
            设为默认服务商
          </label>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              取消
            </button>
            <button
              type="button"
              onClick={save}
              className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700"
            >
              <Check size={16} /> 保存
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
