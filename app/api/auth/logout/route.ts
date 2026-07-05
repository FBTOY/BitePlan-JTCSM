import { NextResponse } from "next/server";
import { logoutSession, getSessionCookieHeader, parseSessionCookie } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const cookieHeader = request.headers.get("cookie") || undefined;
    const sessionId = parseSessionCookie(cookieHeader);
    logoutSession(sessionId);

    const response = NextResponse.json({ ok: true });
    response.headers.set("Set-Cookie", getSessionCookieHeader("", true));
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "退出失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
