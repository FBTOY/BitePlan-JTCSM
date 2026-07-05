import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getAllUserData, setUserData, getDb } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const cookieHeader = request.headers.get("cookie") || undefined;
    const user = getCurrentUser(cookieHeader);
    if (!user) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const data = getAllUserData(user.id);
    return NextResponse.json({ data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "获取数据失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieHeader = request.headers.get("cookie") || undefined;
    const user = getCurrentUser(cookieHeader);
    if (!user) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const body = (await request.json()) as {
      key: string;
      value: unknown;
    };

    if (!body.key) {
      return NextResponse.json({ error: "缺少 key" }, { status: 400 });
    }

    setUserData(user.id, body.key, body.value);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "保存数据失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const cookieHeader = request.headers.get("cookie") || undefined;
    const user = getCurrentUser(cookieHeader);
    if (!user) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");
    if (!key) {
      return NextResponse.json({ error: "缺少 key" }, { status: 400 });
    }

    getDb()
      .prepare("DELETE FROM user_data WHERE user_id = ? AND key = ?")
      .run(user.id, key);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "删除数据失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
