import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const cookieHeader = request.headers.get("cookie") || undefined;
    const user = getCurrentUser(cookieHeader);
    return NextResponse.json({ user });
  } catch (error) {
    const message = error instanceof Error ? error.message : "获取用户信息失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
