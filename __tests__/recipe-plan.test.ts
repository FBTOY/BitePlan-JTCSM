import { compressRecipeSteps } from "@/lib/recipe-plan";
import type { RecipePlan } from "@/lib/types";

const plan: RecipePlan = {
  title: "测试",
  description: "",
  servings: 1,
  estimatedTimeMinutes: 6,
  requiredIngredients: [],
  requiredTools: [],
  steps: [
    {
      id: "s1",
      order: 0,
      title: "热油",
      instruction: "把油烧热",
      durationMinutes: 2,
      checklist: ["油冒烟"],
    },
    {
      id: "s2",
      order: 1,
      title: "下蒜",
      instruction: "快速下蒜末爆香",
      durationMinutes: 1,
      checklist: ["蒜末金黄"],
    },
    {
      id: "s3",
      order: 2,
      title: "炒菜",
      instruction: "放入青菜翻炒",
      durationMinutes: 3,
      checklist: ["菜变软"],
    },
  ],
};

describe("compressRecipeSteps", () => {
  it("combines short steps with the previous step", () => {
    const result = compressRecipeSteps(plan);
    expect(result.steps).toHaveLength(2);
    expect(result.steps[0].durationMinutes).toBe(3);
    expect(result.steps[0].nextStepHint).toBe("下蒜");
    expect(result.steps[0].checklist).toEqual(["油冒烟", "蒜末金黄"]);
  });

  it("does not change single-step plans", () => {
    const single = { ...plan, steps: [plan.steps[0]] };
    expect(compressRecipeSteps(single).steps).toHaveLength(1);
  });
});
