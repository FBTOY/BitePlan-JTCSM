import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import type {
  KitchenProfile,
  ProviderConfig,
  ProviderType,
  RecipePlan,
} from "./types";

const ingredientSchema = z.object({
  name: z.string().min(1),
  quantity: z.string().optional(),
  note: z.string().optional(),
});

const stepSchema = z.object({
  id: z.string().min(1),
  order: z.number().int().nonnegative(),
  title: z.string().min(1),
  instruction: z.string().min(1),
  durationMinutes: z.number().int().nonnegative().optional(),
  tips: z.array(z.string()).optional(),
  checklist: z.array(z.string()).min(1),
});

const toolLikeSchema = z.union([
  z.string().min(1),
  z.object({ name: z.string().min(1) }).transform((t) => t.name),
]);

export const recipePlanSchema = z.object({
  title: z.string().min(1),
  description: z.string(),
  servings: z.number().int().positive(),
  estimatedTimeMinutes: z.number().int().nonnegative(),
  requiredIngredients: z.array(ingredientSchema),
  missingIngredients: z.array(ingredientSchema).optional(),
  requiredTools: z.array(toolLikeSchema),
  missingTools: z.array(toolLikeSchema).optional(),
  steps: z.array(stepSchema).min(1),
});

export const defaultModels: Record<ProviderType, string> = {
  anthropic: "claude-3-5-sonnet-20241022",
  moonshot: "moonshot-v1-8k",
};

export const providerLabels: Record<ProviderType, string> = {
  anthropic: "Anthropic (Claude)",
  moonshot: "Moonshot (Kimi)",
};

export function buildRecipePrompt(
  profile: KitchenProfile,
  dishName: string,
  extraNotes?: string
): string {
  const ingredients = profile.availableIngredients
    .map(
      (i) =>
        `- ${i.name}${i.quantity ? ` (${i.quantity})` : ""}${
          i.note ? ` — ${i.note}` : ""
        }`
    )
    .join("\n") || "未提供";

  const tools = profile.availableTools.map((t) => `- ${t}`).join("\n") || "未提供";

  return `你是一位专业中餐与西式家常菜厨师，擅长根据用户现有的厨房条件制定详细、可执行、清单化的烹饪方案。

## 用户厨房档案
- 用餐人数：${profile.servings} 人
- 烹饪水平：${
    profile.skillLevel === "beginner"
      ? "新手"
      : profile.skillLevel === "intermediate"
      ? "进阶"
      : "熟练"
  }
- 可用时间：约 ${profile.timeMinutes} 分钟
- 饮食备注：${profile.dietaryNotes || "无"}
- 现有食材：
${ingredients}
- 现有工具：
${tools}
${extraNotes ? `\n## 额外说明\n${extraNotes}\n` : ""}

## 目标任务
请为菜品「${dishName}」生成一份标准化制作方案。

要求：
1. 根据用户现有食材和工具调整方案；缺少的食材/工具要列出但不要让方案不可执行（给出替代方案或建议）。
2. 步骤要细粒度、可逐项勾选，每个步骤包含：标题、详细操作说明、预计耗时（分钟）、小贴士、至少一条清单项（checklist）。
3. 总耗时尽量控制在用户可用时间 ${profile.timeMinutes} 分钟内。
4. 难度与说明要匹配用户的烹饪水平。
5. 必须严格返回下面 JSON 结构，不要包含 markdown 代码块外的任何解释文字。

输出格式：
${JSON.stringify(
  {
    title: "菜品名称",
    description: "方案简介",
    servings: profile.servings,
    estimatedTimeMinutes: 0,
    requiredIngredients: [{ name: "食材", quantity: "用量", note: "备注" }],
    missingIngredients: [{ name: "食材", quantity: "用量", note: "备注" }],
    requiredTools: ["工具"],
    missingTools: ["工具"],
    steps: [
      {
        id: "step-1",
        order: 0,
        title: "步骤标题",
        instruction: "详细操作说明",
        durationMinutes: 5,
        tips: ["小贴士"],
        checklist: ["清单项 1", "清单项 2"],
      },
    ],
  },
  null,
  2
)}`;
}

export function parseRecipePlan(raw: string): RecipePlan {
  const cleaned = raw
    .replace(/^```json\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  const parsed = JSON.parse(cleaned);
  return recipePlanSchema.parse(parsed);
}

export async function generateRecipePlan(
  config: ProviderConfig,
  profile: KitchenProfile,
  dishName: string,
  extraNotes?: string
): Promise<RecipePlan> {
  const prompt = buildRecipePrompt(profile, dishName, extraNotes);

  if (config.provider === "anthropic") {
    const client = new Anthropic({ apiKey: config.apiKey });
    const response = await client.messages.create({
      model: config.model || defaultModels.anthropic,
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    });
    const content = response.content.find((c) => c.type === "text")?.text;
    if (!content) {
      throw new Error("AI 未返回有效内容");
    }
    return parseRecipePlan(content);
  }

  if (config.provider === "moonshot") {
    const client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseUrl || "https://api.moonshot.cn/v1",
    });
    const response = await client.chat.completions.create({
      model: config.model || defaultModels.moonshot,
      messages: [{ role: "user", content: prompt }],
    });
    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("AI 未返回有效内容");
    }
    return parseRecipePlan(content);
  }

  throw new Error(`不支持的 provider：${config.provider}`);
}
