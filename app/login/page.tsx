"use client";

import { Suspense } from "react";
import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-full items-center justify-center">
          加载中……
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
