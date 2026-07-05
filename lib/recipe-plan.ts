import type { RecipePlan, RecipeStep } from "./types";

export function compressRecipeSteps(
  plan: RecipePlan,
  thresholdMinutes = 2
): RecipePlan {
  if (plan.steps.length <= 1) return plan;

  const compressed: RecipeStep[] = [];
  let current = plan.steps[0];

  for (let i = 1; i < plan.steps.length; i++) {
    const next = plan.steps[i];
    const shouldCombine =
      current.durationMinutes !== undefined &&
      next.durationMinutes !== undefined &&
      next.durationMinutes <= thresholdMinutes;

    if (shouldCombine) {
      current = {
        ...current,
        durationMinutes:
          (current.durationMinutes || 0) + (next.durationMinutes || 0),
        instruction: `${current.instruction}\n\n下一步提示：${next.title}。${next.instruction}`,
        nextStepHint: next.title,
        tips: [
          ...(current.tips || []),
          ...(next.tips || []),
        ],
        checklist: [
          ...current.checklist,
          ...next.checklist,
        ],
      };
    } else {
      compressed.push(current);
      current = next;
    }
  }

  compressed.push(current);

  // Re-assign orders
  const reordered = compressed.map((step, idx) => ({
    ...step,
    order: idx,
    id: step.id || `step-${idx + 1}`,
  }));

  return {
    ...plan,
    estimatedTimeMinutes: reordered.reduce(
      (sum, s) => sum + (s.durationMinutes || 0),
      0
    ),
    steps: reordered,
  };
}
