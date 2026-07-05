"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import AuthForm from "@/components/AuthForm";
import { User, LogIn, UserPlus } from "lucide-react";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"login" | "register">(
    (searchParams.get("mode") as "login" | "register") || "login"
  );

  const updateMode = (next: "login" | "register") => {
    setMode(next);
    router.replace(`/login?mode=${next}`, { scroll: false });
  };

  return (
    <div className="flex min-h-full flex-col bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-4">
          <Link
            href="/"
            className="text-sm text-zinc-600 hover:text-zinc-900"
          >
            ← 返回
          </Link>
          <span className="text-lg font-bold text-zinc-900">今天吃什么 BitePlan</span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-md flex-1 px-4 py-12">
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
          <div className="mb-6 flex items-center gap-2 text-xl font-bold text-zinc-900">
            <User className="text-orange-600" size={24} />
            {mode === "login" ? "欢迎回来" : "创建账号"}
          </div>

          <div className="mb-6 flex rounded-lg bg-zinc-100 p-1">
            <button
              type="button"
              onClick={() => updateMode("login")}
              className={`flex flex-1 items-center justify-center gap-1 rounded-md py-2 text-sm font-medium transition-colors ${
                mode === "login"
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              <LogIn size={16} /> 登录
            </button>
            <button
              type="button"
              onClick={() => updateMode("register")}
              className={`flex flex-1 items-center justify-center gap-1 rounded-md py-2 text-sm font-medium transition-colors ${
                mode === "register"
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              <UserPlus size={16} /> 注册
            </button>
          </div>

          <p className="mb-6 text-sm text-zinc-600">
            {mode === "login"
              ? "登录后你的储备、历史记录和设置会自动同步到云端。"
              : "注册账号后，你的厨房数据可以跨设备保存。"}
          </p>

          <AuthForm
            mode={mode}
            onSuccess={() => {
              router.push("/");
              router.refresh();
            }}
          />
        </div>
      </main>
    </div>
  );
}
