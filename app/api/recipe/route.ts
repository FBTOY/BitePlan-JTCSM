import { NextResponse } from "next/server";
import { generateRecipePlan } from "@/lib/recipe";
import type { KitchenProfile, ProviderConfig } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      profile: KitchenProfile;
      provider: ProviderConfig;
      dishName: string;
      extraNotes?: string;
    };

    if (!body.profile || !body.dishName || !body.provider) {
      return NextResponse.json(
        { error: "缺少必要参数：profile、provider 或 dishName" },
        { status: 400 }
      );
    }

    if (!body.provider.apiKey) {
      return NextResponse.json(
        { error: "API Key 不能为空" },
        { status: 400 }
      );
    }

    const plan = await generateRecipePlan(
      body.provider,
      body.profile,
      body.dishName,
      body.extraNotes
    );
    return NextResponse.json({ plan });
  } catch (error) {
    const message = error instanceof Error ? error.message : "未知错误";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
