"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { upsertBudgetGoal } from "@/app/actions/budget-goals";

type SetGoalModalProps = {
  isOpen: boolean;
  onClose: () => void;
  existingGoals?: Array<{ category: string; target_amount: number }>;
};

const CATEGORIES = [
  { value: "food", label: "Food", emoji: "🍽️" },
  { value: "transportation", label: "Transportation", emoji: "🚌" },
  { value: "school", label: "School Supplies", emoji: "📓" },
  { value: "entertainment", label: "Entertainment", emoji: "🎬" },
  { value: "shopping", label: "Shopping", emoji: "🛒" },
  { value: "utilities", label: "Utilities", emoji: "💡" },
  { value: "health", label: "Health", emoji: "💊" },
  { value: "other", label: "Other", emoji: "📦" },
];

export default function SetGoalModal({ isOpen, onClose, existingGoals = [] }: SetGoalModalProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const router = useRouter();

  // Get existing goal amount for selected category
  const existingGoal = existingGoals.find(g => g.category === selectedCategory);

  if (!isOpen) return null;

  const handleSubmit = (formData: FormData) => {
    setError(null);
    const category = formData.get("category") as string;
    const targetAmount = parseFloat(formData.get("targetAmount") as string);

    if (!category) {
      setError("Please select a category");
      return;
    }

    if (!targetAmount || targetAmount <= 0) {
      setError("Please enter a valid target amount");
      return;
    }

    startTransition(async () => {
      const result = await upsertBudgetGoal(category, targetAmount);
      if (result.error) {
        setError(result.error);
      } else {
        router.refresh();
        onClose();
        // Reset form
        setSelectedCategory("");
      }
    });
  };

  const handleClose = () => {
    setError(null);
    setSelectedCategory("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Set Budget Goal</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition cursor-pointer"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form action={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              id="category"
              name="category"
              required
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              disabled={isPending}
            >
              <option value="">Select a category</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.emoji} {cat.label}
                </option>
              ))}
            </select>
          </div>

          {existingGoal && (
            <div className="p-3 bg-blue-50 text-blue-700 rounded-lg text-sm">
              Current goal for this category: ₱{existingGoal.target_amount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
            </div>
          )}

          <div>
            <label htmlFor="targetAmount" className="block text-sm font-medium text-gray-700 mb-1">
              Target Amount (₱)
            </label>
            <input
              type="number"
              id="targetAmount"
              name="targetAmount"
              step="0.01"
              min="0.01"
              required
              placeholder={existingGoal ? existingGoal.target_amount.toString() : "0.00"}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              disabled={isPending}
            />
            <p className="text-xs text-gray-500 mt-1">
              Set a maximum spending limit for this category
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium cursor-pointer"
              disabled={isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition font-medium disabled:opacity-50 cursor-pointer"
              disabled={isPending}
            >
              {isPending ? "Saving..." : existingGoal ? "Update Goal" : "Set Goal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
