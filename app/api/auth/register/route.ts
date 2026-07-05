import { NextResponse } from "next/server";
import { registerUser, createAuthSession, getSessionCookieHeader } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      username?: string;
      password?: string;
    };

    if (!body.username || !body.password) {
      return NextResponse.json(
        { error: "用户名和密码不能为空" },
        { status: 400 }
      );
    }

    if (body.username.length < 3 || body.password.length < 6) {
      return NextResponse.json(
        { error: "用户名至少3位，密码至少6位" },
        { status: 400 }
      );
    }

    const user = registerUser(body.username, body.password);
    if (!user) {
      return NextResponse.json({ error: "用户名已存在" }, { status: 409 });
    }

    const sessionId = createAuthSession(user.id);
    const response = NextResponse.json({ user });
    response.headers.set("Set-Cookie", getSessionCookieHeader(sessionId));
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "注册失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
