import { NextResponse } from "next/server";
import { authenticateUser, createAuthSession, getSessionCookieHeader } from "@/lib/auth";

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

    const user = authenticateUser(body.username, body.password);
    if (!user) {
      return NextResponse.json(
        { error: "用户名或密码错误" },
        { status: 401 }
      );
    }

    const sessionId = createAuthSession(user.id);
    const response = NextResponse.json({ user });
    response.headers.set("Set-Cookie", getSessionCookieHeader(sessionId));
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "登录失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
