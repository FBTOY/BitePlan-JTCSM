import { NextResponse } from "next/server";
import { generateRecipePlan } from "@/lib/recipe";
import { compressRecipeSteps } from "@/lib/recipe-plan";
import type {
  KitchenProfile,
  ProviderConfig,
  UserPreferences,
} from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      profile: KitchenProfile;
      provider: ProviderConfig;
      preferences: UserPreferences;
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
      body.preferences || {
        weightUnit: "g",
        volumeUnit: "ml",
        onlyUseMassUnits: false,
        tastePreferences: {
          sweet: 50,
          sour: 50,
          bitter: 50,
          spicy: 50,
          salty: 50,
        },
        customUnits: [
          { id: "spoon", name: "勺", grams: 5 },
          { id: "tbsp-zh", name: "汤匙", grams: 15 },
          { id: "tsp-zh", name: "茶匙", grams: 5 },
        ],
        autoCalibrateTaste: false,
      },
      body.dishName,
      body.extraNotes
    );
    const compressedPlan = compressRecipeSteps(plan);
    return NextResponse.json({ plan: compressedPlan });
  } catch (error) {
    const message = error instanceof Error ? error.message : "未知错误";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
