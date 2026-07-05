"use client";

import type { Ingredient, RecipePlan } from "@/lib/types";
import { Clock, Users, AlertCircle, ChefHat, Plus } from "lucide-react";

interface Props {
  plan: RecipePlan;
  onStart: () => void;
  onAddToPantry?: (ingredient: Ingredient, category: "ingredient" | "seasoning") => void;
}

function IngredientRow({
  ing,
  onClick,
}: {
  ing: Ingredient;
  onClick?: () => void;
}) {
  return (
    <li className="flex items-center justify-between gap-2">
      <span>
        {ing.name}
        {ing.quantity && (
          <span className="text-zinc-500"> · {ing.quantity}</span>
        )}
      </span>
      {onClick && (
        <button
          type="button"
          onClick={onClick}
          className="flex items-center gap-1 rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-100"
          title="加入储备"
        >
          <Plus size={12} /> 加入储备
        </button>
      )}
    </li>
  );
}

export default function RecipeCard({ plan, onStart, onAddToPantry }: Props) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-zinc-900">{plan.title}</h2>
            <p className="mt-1 text-zinc-600">{plan.description}</p>
          </div>
          <div className="rounded-full bg-orange-100 p-2 text-orange-700">
            <ChefHat size={24} />
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-4 text-sm text-zinc-700">
          <span className="flex items-center gap-1">
            <Users size={16} /> {plan.servings} 人份
          </span>
          <span className="flex items-center gap-1">
            <Clock size={16} /> 约 {plan.estimatedTimeMinutes} 分钟
          </span>
          <span className="flex items-center gap-1">
            共 {plan.steps.length} 个步骤
          </span>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="mb-2 font-semibold text-zinc-900">所需食材</h3>
            <ul className="space-y-1 text-sm text-zinc-700">
              {plan.requiredIngredients.map((ing, idx) => (
                <IngredientRow
                  key={idx}
                  ing={ing}
                  onClick={
                    onAddToPantry
                      ? () => onAddToPantry(ing, "ingredient")
                      : undefined
                  }
                />
              ))}
            </ul>
            {plan.missingIngredients && plan.missingIngredients.length > 0 && (
              <div className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                <div className="mb-1 flex items-center gap-1 font-medium">
                  <AlertCircle size={14} /> 你可能还缺
                </div>
                {plan.missingIngredients.map((ing, idx) => (
                  <div key={idx}>
                    {ing.name}
                    {ing.quantity && ` (${ing.quantity})`}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="mb-2 font-semibold text-zinc-900">所需工具</h3>
            <ul className="space-y-1 text-sm text-zinc-700">
              {plan.requiredTools.map((tool, idx) => (
                <li key={idx}>{tool}</li>
              ))}
            </ul>
            {plan.missingTools && plan.missingTools.length > 0 && (
              <div className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                <div className="mb-1 flex items-center gap-1 font-medium">
                  <AlertCircle size={14} /> 你可能还缺
                </div>
                {plan.missingTools.join("、")}
              </div>
            )}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onStart}
        className="w-full rounded-lg bg-orange-600 py-3 text-sm font-semibold text-white hover:bg-orange-700"
      >
        开始跟做
      </button>
    </div>
  );
}
