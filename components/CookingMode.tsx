"use client";

import { useState } from "react";
import type { CookingSession, RecipeStep } from "@/lib/types";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Lightbulb,
  List,
  X,
} from "lucide-react";

interface Props {
  session: CookingSession;
  onUpdate: (session: CookingSession) => void;
  onFinish: () => void;
}

export default function CookingMode({ session, onUpdate, onFinish }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAllSteps, setShowAllSteps] = useState(false);
  const steps = session.recipe.steps;
  const currentStep: RecipeStep | undefined = steps[currentIndex];

  if (!currentStep) return null;

  const toggleCheck = (item: string) => {
    const next = {
      ...session,
      checkedItems: {
        ...session.checkedItems,
        [item]: !session.checkedItems[item],
      },
    };
    onUpdate(next);
  };

  const markStepComplete = () => {
    const nextCompleted = new Set(session.completedStepIds);
    nextCompleted.add(currentStep.id);
    const next = {
      ...session,
      completedStepIds: Array.from(nextCompleted),
    };
    onUpdate(next);

    if (currentIndex < steps.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      onFinish();
    }
  };

  const progress = Math.round(
    (session.completedStepIds.length / steps.length) * 100
  );

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-zinc-600">
          <span>步骤 {currentIndex + 1} / {steps.length}</span>
          <span>{progress}% 完成</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200">
          <div
            className="h-full bg-orange-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex gap-1 overflow-x-auto pb-2">
          {steps.map((step, idx) => {
            const isCompleted = session.completedStepIds.includes(step.id);
            const isCurrent = idx === currentIndex;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`shrink-0 rounded-lg px-3 py-2 text-left text-xs ${
                  isCurrent
                    ? "bg-orange-100 text-orange-800 ring-1 ring-orange-300"
                    : isCompleted
                    ? "bg-green-50 text-green-700"
                    : "bg-zinc-100 text-zinc-600"
                }`}
              >
                <div className="font-medium">{idx + 1}. {step.title}</div>
                {step.durationMinutes && (
                  <div className="opacity-75">{step.durationMinutes} 分钟</div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-zinc-900">{currentStep.title}</h3>
          <div className="flex items-center gap-2">
            {currentStep.durationMinutes && (
              <span className="flex items-center gap-1 rounded-full bg-zinc-100 px-3 py-1 text-sm text-zinc-700">
                <Clock size={14} /> {currentStep.durationMinutes} 分钟
              </span>
            )}
            <button
              type="button"
              onClick={() => setShowAllSteps(true)}
              className="flex items-center gap-1 rounded-full bg-zinc-100 px-3 py-1 text-sm text-zinc-700 hover:bg-zinc-200"
            >
              <List size={14} /> 全流程
            </button>
          </div>
        </div>

        <p className="mb-6 whitespace-pre-line text-zinc-700 leading-relaxed">
          {currentStep.instruction}
        </p>

        {currentStep.tips && currentStep.tips.length > 0 && (
          <div className="mb-6 rounded-lg bg-amber-50 p-4">
            <div className="mb-2 flex items-center gap-1 text-sm font-semibold text-amber-900">
              <Lightbulb size={16} /> 小贴士
            </div>
            <ul className="list-inside list-disc space-y-1 text-sm text-amber-800">
              {currentStep.tips.map((tip, idx) => (
                <li key={idx}>{tip}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-zinc-900">本步清单</h4>
          {currentStep.checklist.map((item, idx) => {
            const checked = !!session.checkedItems[item];
            return (
              <label
                key={idx}
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                  checked
                    ? "border-orange-200 bg-orange-50"
                    : "border-zinc-200 hover:bg-zinc-50"
                }`}
              >
                <span
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                    checked
                      ? "border-orange-500 bg-orange-500 text-white"
                      : "border-zinc-300"
                  }`}
                >
                  {checked && <Check size={14} />}
                </span>
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={checked}
                  onChange={() => toggleCheck(item)}
                />
                <span
                  className={`text-sm ${
                    checked ? "text-zinc-500 line-through" : "text-zinc-800"
                  }`}
                >
                  {item}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex((i) => i - 1)}
          className="flex items-center gap-1 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
        >
          <ChevronLeft size={16} /> 上一步
        </button>

        <button
          type="button"
          onClick={markStepComplete}
          className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700"
        >
          {currentIndex === steps.length - 1 ? "完成烹饪" : "完成本步"}
          {currentIndex < steps.length - 1 && <ChevronRight size={16} />}
        </button>
      </div>

      {showAllSteps && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-zinc-900">全流程</h3>
              <button
                type="button"
                onClick={() => setShowAllSteps(false)}
                className="rounded-full p-2 hover:bg-zinc-100"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              {steps.map((step, idx) => (
                <div
                  key={step.id}
                  className={`rounded-lg border p-4 ${
                    idx === currentIndex
                      ? "border-orange-300 bg-orange-50"
                      : "border-zinc-200"
                  }`}
                >
                  <div className="mb-1 font-semibold text-zinc-900">
                    {idx + 1}. {step.title}
                  </div>
                  <p className="whitespace-pre-line text-sm text-zinc-700">
                    {step.instruction}
                  </p>
                  {step.durationMinutes && (
                    <div className="mt-2 text-xs text-zinc-500">
                      预计 {step.durationMinutes} 分钟
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
