"use client";

import { useState } from "react";
import type { SessionFeedback } from "@/lib/types";
import { Star } from "lucide-react";

interface Props {
  onSubmit: (feedback: SessionFeedback) => void;
  onSkip: () => void;
}

export default function FeedbackForm({ onSubmit, onSkip }: Props) {
  const [rating, setRating] = useState(0);
  const [difficulty, setDifficulty] =
    useState<SessionFeedback["difficulty"] | "">("");
  const [taste, setTaste] = useState("");
  const [notes, setNotes] = useState("");

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-xl font-bold text-zinc-900">烹饪完成！</h2>
        <p className="mb-6 text-zinc-600">
          恭喜你完成了今天的菜品。请留下一点反馈，帮助下次做得更好。
        </p>

        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700">整体满意度</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  className={`${
                    value <= rating ? "text-yellow-400" : "text-zinc-300"
                  }`}
                >
                  <Star size={28} fill={value <= rating ? "currentColor" : "none"} />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700">难度感受</label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: "too_easy", label: "太简单" },
                { value: "just_right", label: "刚刚好" },
                { value: "too_hard", label: "有点难" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setDifficulty(opt.value as SessionFeedback["difficulty"])}
                  className={`rounded-full px-4 py-2 text-sm font-medium ${
                    difficulty === opt.value
                      ? "bg-orange-600 text-white"
                      : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700">口味评价</label>
            <input
              type="text"
              value={taste}
              onChange={(e) => setTaste(e.target.value)}
              placeholder="例如：咸淡刚好、有点淡、很成功"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700">其他建议</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="步骤哪里不清楚？下次想改进什么？"
              rows={3}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onSkip}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          跳过
        </button>
        <button
          type="button"
          onClick={() =>
            onSubmit({
              rating,
              difficulty: difficulty || "just_right",
              taste,
              notes,
            })
          }
          className="flex-1 rounded-lg bg-orange-600 py-2 text-sm font-semibold text-white hover:bg-orange-700"
        >
          提交反馈
        </button>
      </div>
    </div>
  );
}
