"use client";

import { useState } from "react";
import Link from "next/link";
import { loadSessions } from "@/lib/storage";
import type { CookingSession } from "@/lib/types";
import { ArrowLeft, Calendar, ChefHat, Star, Clock } from "lucide-react";

export default function HistoryPage() {
  const [sessions] = useState<CookingSession[]>(loadSessions);

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
              <div
                key={session.id}
                className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
              >
                <div className="mb-3 flex items-start justify-between">
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
                  <div className="mt-3 rounded-lg bg-zinc-50 p-3 text-sm text-zinc-600">
                    {session.feedback.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
