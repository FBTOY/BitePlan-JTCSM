import { buildRecipePrompt, parseRecipePlan } from "@/lib/recipe";
import type { KitchenProfile, UserPreferences } from "@/lib/types";

const profile: KitchenProfile = {
  servings: 2,
  skillLevel: "beginner",
  timeMinutes: 45,
  dietaryNotes: "不吃辣",
  availableIngredients: [{ name: "鸡蛋", quantity: "3个" }],
  availableTools: ["炒锅"],
};

const preferences: UserPreferences = {
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
  ],
  autoCalibrateTaste: false,
};

describe("buildRecipePrompt", () => {
  it("includes dish name and profile fields", () => {
    const prompt = buildRecipePrompt(profile, "番茄炒蛋", preferences);
    expect(prompt).toContain("番茄炒蛋");
    expect(prompt).toContain("2 人");
    expect(prompt).toContain("不吃辣");
    expect(prompt).toContain("鸡蛋");
    expect(prompt).toContain("炒锅");
  });

  it("includes extra notes when provided", () => {
    const prompt = buildRecipePrompt(profile, "番茄炒蛋", preferences, "希望少油");
    expect(prompt).toContain("希望少油");
  });

  it("includes mass-only unit instructions", () => {
    const prompt = buildRecipePrompt(profile, "番茄炒蛋", {
      ...preferences,
      onlyUseMassUnits: true,
    });
    expect(prompt).toContain("质量单位");
  });

  it("includes taste preferences", () => {
    const prompt = buildRecipePrompt(profile, "番茄炒蛋", preferences);
    expect(prompt).toContain("口味偏好");
    expect(prompt).toContain("甜:50/100");
  });

  it("includes custom units", () => {
    const prompt = buildRecipePrompt(profile, "番茄炒蛋", preferences);
    expect(prompt).toContain("用户自定义单位");
    expect(prompt).toContain("1 勺 = 5 克");
  });
});

describe("parseRecipePlan", () => {
  it("parses valid JSON recipe", () => {
    const raw = JSON.stringify({
      title: "番茄炒蛋",
      description: "家常菜",
      servings: 2,
      estimatedTimeMinutes: 20,
      requiredIngredients: [{ name: "番茄", quantity: "2个" }],
      requiredTools: ["炒锅"],
      steps: [
        {
          id: "step-1",
          order: 0,
          title: "准备食材",
          instruction: "把番茄切块，鸡蛋打散。",
          durationMinutes: 5,
          tips: ["鸡蛋里加少许盐"],
          checklist: ["番茄切块", "鸡蛋打散"],
        },
      ],
    });

    const plan = parseRecipePlan(raw);
    expect(plan.title).toBe("番茄炒蛋");
    expect(plan.steps).toHaveLength(1);
    expect(plan.steps[0].checklist).toHaveLength(2);
  });

  it("strips markdown code fences", () => {
    const raw = "```json\n" + JSON.stringify({
      title: "A",
      description: "B",
      servings: 1,
      estimatedTimeMinutes: 10,
      requiredIngredients: [],
      requiredTools: [],
      steps: [{
        id: "s1",
        order: 0,
        title: "T",
        instruction: "I",
        checklist: ["c"],
      }],
    }) + "\n```";

    expect(() => parseRecipePlan(raw)).not.toThrow();
  });

  it("normalizes tool objects to strings", () => {
    const raw = JSON.stringify({
      title: "测试",
      description: "",
      servings: 1,
      estimatedTimeMinutes: 10,
      requiredIngredients: [],
      requiredTools: [{ name: "炒锅" }, "菜刀"],
      missingTools: [{ name: "蒸锅" }],
      steps: [
        {
          id: "s1",
          order: 0,
          title: "T",
          instruction: "I",
          checklist: ["c"],
        },
      ],
    });

    const plan = parseRecipePlan(raw);
    expect(plan.requiredTools).toEqual(["炒锅", "菜刀"]);
    expect(plan.missingTools).toEqual(["蒸锅"]);
  });

  it("throws on invalid data", () => {
    expect(() => parseRecipePlan('{"title": "x"}')).toThrow();
  });
});
