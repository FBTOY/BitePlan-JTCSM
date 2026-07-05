"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import AuthForm from "@/components/AuthForm";
import { User } from "lucide-react";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode] = useState<"login" | "register">(
    (searchParams.get("mode") as "login" | "register") || "login"
  );

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
            {mode === "login" ? "登录" : "注册"}
          </div>
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
