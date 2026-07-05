"use client";

import { useState } from "react";
import Link from "next/link";
import { loadSessions } from "@/lib/storage";
import type { CookingSession, RecipeStep } from "@/lib/types";
import {
  ArrowLeft,
  Calendar,
  ChefHat,
  Star,
  Clock,
  X,
  Users,
  ListOrdered,
  UtensilsCrossed,
  Package,
} from "lucide-react";

export default function HistoryPage() {
  const [sessions] = useState<CookingSession[]>(loadSessions);
  const [selected, setSelected] = useState<CookingSession | null>(null);

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
          <h1 className="text-lg font-bold text-zinc-900">历史菜单</h1>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
        {sessions.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center text-zinc-500">
            还没有烹饪记录。
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <button
                key={session.id}
                type="button"
                onClick={() => setSelected(session)}
                className="w-full rounded-2xl border border-zinc-200 bg-white p-5 text-left shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-3 flex items-start justify-between"
                >
                  <div className="flex items-center gap-2 text-lg font-semibold text-zinc-900">
                    <ChefHat className="text-orange-600" size={20} />
                    {session.recipe.title}
                  </div>
                  {session.feedback && (
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star size={16} fill="currentColor" />
                      <span className="text-sm">{session.feedback.rating}</span>
                    </div>
                  )}
                </div>

                <div className="mb-3 flex flex-wrap gap-3 text-sm text-zinc-600">
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {new Date(session.startedAt).toLocaleDateString("zh-CN")}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {session.recipe.estimatedTimeMinutes} 分钟
                  </span>
                  <span>{session.recipe.servings} 人份</span>
                </div>

                <p className="text-sm text-zinc-700">{session.recipe.description}</p>

                {session.feedback?.notes && (
                  <div className="mt-3 rounded-lg bg-zinc-50 p-3 text-sm text-zinc-600"
                  >
                    {session.feedback.notes}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </main>

      {selected && <HistoryDetail session={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function HistoryDetail({
  session,
  onClose,
}: {
  session: CookingSession;
  onClose: () => void;
}) {
  const recipe = session.recipe;
  const completed = new Set(session.completedStepIds);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-zinc-900">{recipe.title}</h2>
            <p className="mt-1 text-sm text-zinc-600">{recipe.description}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 hover:bg-zinc-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-6 flex flex-wrap gap-3 text-sm text-zinc-600">
          <span className="flex items-center gap-1">
            <Calendar size={14} />
            {new Date(session.startedAt).toLocaleDateString("zh-CN")}
          </span>
          <span className="flex items-center gap-1">
            <Users size={14} /> {recipe.servings} 人份
          </span>
          <span className="flex items-center gap-1">
            <Clock size={14} /> {recipe.estimatedTimeMinutes} 分钟
          </span>
          {session.feedback && (
            <span className="flex items-center gap-1 text-amber-500">
              <Star size={14} fill="currentColor" /> {session.feedback.rating} / 5
            </span>
          )}
        </div>

        <div className="mb-6 grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="mb-2 flex items-center gap-1 font-semibold text-zinc-900">
              <Package size={16} /> 食材
            </h3>
            <ul className="space-y-1 text-sm text-zinc-700">
              {recipe.requiredIngredients.map((ing, idx) => (
                <li key={idx}>
                  {ing.name}
                  {ing.quantity && (
                    <span className="text-zinc-500"> · {ing.quantity}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-2 flex items-center gap-1 font-semibold text-zinc-900">
              <UtensilsCrossed size={16} /> 工具
            </h3>
            <ul className="space-y-1 text-sm text-zinc-700">
              {recipe.requiredTools.map((tool, idx) => (
                <li key={idx}>{tool}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="mb-3 flex items-center gap-1 font-semibold text-zinc-900">
            <ListOrdered size={16} /> 步骤（{recipe.steps.length} 步）
          </h3>
          <div className="space-y-3">
            {recipe.steps.map((step: RecipeStep, idx) => {
              const isCompleted = completed.has(step.id);
              return (
                <div
                  key={step.id}
                  className={`rounded-lg border p-4 ${
                    isCompleted
                      ? "border-green-200 bg-green-50"
                      : "border-zinc-200"
                  }`}
                >
                  <div className="mb-1 flex items-center gap-2 font-semibold text-zinc-900">
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs ${
                        isCompleted
                          ? "bg-green-600 text-white"
                          : "bg-zinc-200 text-zinc-700"
                      }`}
                    >
                      {idx + 1}
                    </span>
                    {step.title}
                    {step.durationMinutes && (
                      <span className="ml-auto text-xs font-normal text-zinc-500">
                        {step.durationMinutes} 分钟
                      </span>
                    )}
                  </div>
                  <p className="whitespace-pre-line text-sm text-zinc-700">
                    {step.instruction}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {session.feedback && (
          <div className="rounded-lg bg-zinc-50 p-4">
            <h3 className="mb-2 text-sm font-semibold text-zinc-900">本次反馈</h3>
            <div className="space-y-1 text-sm text-zinc-700">
              <div>
                评分：{session.feedback.rating} / 5 · 难度：
                {session.feedback.difficulty === "too_easy"
                  ? "太简单"
                  : session.feedback.difficulty === "too_hard"
                  ? "有点难"
                  : "刚刚好"}
              </div>
              {session.feedback.taste && (
                <div>口味：{session.feedback.taste}</div>
              )}
              {session.feedback.notes && (
                <div className="text-zinc-600">备注：{session.feedback.notes}</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
