"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useMounted } from "@/lib/hooks";
import KitchenProfileForm from "@/components/KitchenProfileForm";
import DishInput from "@/components/DishInput";
import RecipeCard from "@/components/RecipeCard";
import CookingMode from "@/components/CookingMode";
import FeedbackForm from "@/components/FeedbackForm";
import {
  saveProfile,
  saveCurrentSession,
  archiveSession,
  loadProfile,
  loadCurrentSession,
  loadProviders,
  loadPantry,
  loadPreferences,
  addOrUpdatePantryItem,
  pantryToProfile,
  setCurrentUserId,
  syncFromServer,
} from "@/lib/storage";
import { useAuth, logout } from "@/lib/auth-store";
import type {
  KitchenProfile,
  RecipePlan,
  CookingSession,
  SessionFeedback,
  ProviderConfig,
  PantryItem,
} from "@/lib/types";
import {
  CookingPot,
  RotateCcw,
  Settings,
  Package,
  History,
  Sparkles,
  User as UserIcon,
  LogOut,
} from "lucide-react";

type View =
  | "profile"
  | "dish"
  | "recipe"
  | "cooking"
  | "feedback"
  | "done";

interface InitialState {
  profile: KitchenProfile | null;
  recipe: RecipePlan | null;
  session: CookingSession | null;
  view: View;
}

function loadInitialState(): InitialState {
  if (typeof window === "undefined") {
    return {
      profile: null,
      recipe: null,
      session: null,
      view: "profile",
    };
  }

  const savedSession = loadCurrentSession();
  if (savedSession) {
    let view: View = "recipe";
    if (savedSession.completedAt) {
      view = "done";
    } else if (savedSession.completedStepIds.length > 0) {
      view = "cooking";
    }
    return {
      profile: savedSession.profile,
      recipe: savedSession.recipe,
      session: savedSession,
      view,
    };
  }

  const savedProfile = loadProfile();
  if (savedProfile) {
    return {
      profile: savedProfile,
      recipe: null,
      session: null,
      view: "dish",
    };
  }

  return {
    profile: null,
    recipe: null,
    session: null,
    view: "profile",
  };
}

export default function Home() {
  const mounted = useMounted();
  const { user } = useAuth();
  const [state, setState] = useState<InitialState>(loadInitialState);
  const [providers] = useState<ProviderConfig[]>(loadProviders);
  const [pantry, setPantry] = useState<PantryItem[]>(loadPantry);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { profile, view, recipe, session } = state;

  useEffect(() => {
    if (session) {
      saveCurrentSession(session);
    }
  }, [session]);

  useEffect(() => {
    if (user) {
      setCurrentUserId(user.id);
      void (async () => {
        await syncFromServer();
        setPantry(loadPantry());
      })();
    } else {
      setCurrentUserId(null);
    }
  }, [user]);

  const effectiveProfile = useMemo(() => {
    if (!profile) return null;
    return pantryToProfile(profile, pantry);
  }, [profile, pantry]);

  const defaultProvider = providers.find((p) => p.isDefault) || providers[0] || null;

  const updateState = (patch: Partial<InitialState>) => {
    setState((prev) => ({ ...prev, ...patch }));
  };

  const handleSaveProfile = (p: KitchenProfile) => {
    saveProfile(p);
    updateState({ profile: p, view: "dish" });
  };

  const handleGenerate = async (dishName: string, extraNotes?: string) => {
    if (!effectiveProfile || !defaultProvider) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: effectiveProfile,
          provider: defaultProvider,
          preferences: loadPreferences(),
          dishName,
          extraNotes,
        }),
      });
      const data = (await res.json()) as { plan?: RecipePlan; error?: string };
      if (!res.ok || data.error) {
        throw new Error(data.error || "生成失败");
      }
      if (!data.plan) {
        throw new Error("未返回有效方案");
      }
      const newSession: CookingSession = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        startedAt: new Date().toISOString(),
        profile: effectiveProfile,
        recipe: data.plan,
        completedStepIds: [],
        checkedItems: {},
      };
      updateState({
        recipe: data.plan,
        session: newSession,
        view: "recipe",
      });
      saveCurrentSession(newSession);
    } catch (err) {
      setError(err instanceof Error ? err.message : "未知错误");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToPantry = (
    ingredient: { name: string; quantity?: string; note?: string },
    category: "ingredient" | "seasoning"
  ) => {
    const item = addOrUpdatePantryItem({
      name: ingredient.name,
      quantity: ingredient.quantity,
      category,
      note: ingredient.note,
    });
    setPantry((prev) =>
      prev.some((i) => i.id === item.id)
        ? prev.map((i) => (i.id === item.id ? item : i))
        : [item, ...prev]
    );
  };

  const handleStartCooking = () => updateState({ view: "cooking" });

  const handleUpdateSession = (s: CookingSession) => {
    updateState({ session: s });
  };

  const handleFinishCooking = () => updateState({ view: "feedback" });

  const finishSession = (finished: CookingSession) => {
    updateState({ session: finished, view: "done" });
    saveCurrentSession(finished);
    archiveSession(finished);
  };

  const handleFeedback = (feedback: SessionFeedback) => {
    if (!session) return;
    finishSession({
      ...session,
      feedback,
      completedAt: new Date().toISOString(),
    });
  };

  const handleSkipFeedback = () => {
    if (!session) return;
    finishSession({
      ...session,
      completedAt: new Date().toISOString(),
    });
  };

  const handleReset = () => {
    updateState({ recipe: null, session: null, view: "dish" });
    saveCurrentSession(null);
  };

  if (!mounted) {
    return (
      <div className="flex flex-1 items-center justify-center">
        加载中……
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2 text-lg font-bold text-zinc-900">
            <CookingPot className="text-orange-600" size={24} />
            今天吃什么 BitePlan
          </div>
          <nav className="flex items-center gap-4">
            <Link
              href="/pantry"
              className="flex items-center gap-1 text-sm text-zinc-600 hover:text-zinc-900"
            >
              <Package size={16} /> 储备
            </Link>
            <Link
              href="/history"
              className="flex items-center gap-1 text-sm text-zinc-600 hover:text-zinc-900"
            >
              <History size={16} /> 历史
            </Link>
            <Link
              href="/settings"
              className="flex items-center gap-1 text-sm text-zinc-600 hover:text-zinc-900"
            >
              <Settings size={16} /> 设置
            </Link>
            {profile && view !== "profile" && (
              <button
                type="button"
                onClick={() => updateState({ view: "profile" })}
                className="flex items-center gap-1 text-sm text-zinc-600 hover:text-zinc-900"
              >
                修改档案
              </button>
            )}
            {user ? (
              <button
                type="button"
                onClick={async () => {
                  await logout();
                  window.location.reload();
                }}
                className="flex items-center gap-1 text-sm text-zinc-600 hover:text-zinc-900"
              >
                <LogOut size={16} /> 退出
              </button>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1 text-sm text-zinc-600 hover:text-zinc-900"
              >
                <UserIcon size={16} /> 登录
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
        {!defaultProvider && view !== "profile" && (
          <div className="mb-6 rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-800">
            <div className="mb-2 flex items-center gap-2 font-semibold">
              <Sparkles size={16} /> 请先配置 AI 服务
            </div>
            <p className="mb-3">
              生成菜谱需要配置 Kimi 或 Claude 的 API Key。
            </p>
            <Link
              href="/settings"
              className="inline-flex rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700"
            >
              去设置
            </Link>
          </div>
        )}

        {view === "profile" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900">先告诉我你的厨房情况</h1>
              <p className="mt-1 text-zinc-600">
                填写档案后，AI 会根据你现有的食材和工具生成专属方案。
              </p>
            </div>
            <KitchenProfileForm
              initial={profile}
              onSave={handleSaveProfile}
            />
          </div>
        )}

        {view === "dish" && profile && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900">想做什么菜？</h1>
              <p className="mt-1 text-zinc-600">
                当前档案：{profile.servings} 人 · {profile.timeMinutes} 分钟 ·{" "}
                {profile.skillLevel === "beginner"
                  ? "新手"
                  : profile.skillLevel === "intermediate"
                  ? "进阶"
                  : "熟练"}
                {pantry.length > 0 && ` · 储备 ${pantry.length} 项`}
              </p>
            </div>
            {error && (
              <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800">
                {error}
              </div>
            )}
            <DishInput onSubmit={handleGenerate} loading={loading} />
          </div>
        )}

        {view === "recipe" && recipe && (
          <RecipeCard
            plan={recipe}
            onStart={handleStartCooking}
            onAddToPantry={handleAddToPantry}
          />
        )}

        {view === "cooking" && session && (
          <CookingMode
            session={session}
            onUpdate={handleUpdateSession}
            onFinish={handleFinishCooking}
          />
        )}

        {view === "feedback" && (
          <FeedbackForm onSubmit={handleFeedback} onSkip={handleSkipFeedback} />
        )}

        {view === "done" && session && (
          <div className="space-y-6 text-center">
            <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-700">
                <CookingPot size={32} />
              </div>
              <h2 className="text-2xl font-bold text-zinc-900">{session.recipe.title} 已完成！</h2>
              <p className="mt-2 text-zinc-600">
                {session.feedback
                  ? "感谢你的反馈，期待下次再见。"
                  : "做得好！下次可以继续优化方案。"}
              </p>
              {session.feedback && (
                <div className="mt-4 text-sm text-zinc-500">
                  评分：{session.feedback.rating} / 5 · 难度：
                  {session.feedback.difficulty === "too_easy"
                    ? "太简单"
                    : session.feedback.difficulty === "too_hard"
                    ? "有点难"
                    : "刚刚好"}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-6 py-3 text-sm font-semibold text-white hover:bg-zinc-700"
            >
              <RotateCcw size={16} /> 再做一道菜
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
