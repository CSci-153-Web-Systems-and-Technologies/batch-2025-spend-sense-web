"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateBudget } from "@/app/actions/expenses";

type EditableBudgetProps = {
  initialBudget: number;
};

export default function EditableBudget({ initialBudget }: EditableBudgetProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [budget, setBudget] = useState(initialBudget);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await updateBudget(formData);
      if (!result.error) {
        const newAmount = parseFloat(formData.get("amount") as string);
        setBudget(newAmount);
        setIsEditing(false);
        router.refresh();
      }
    });
  };

  if (isEditing) {
    return (
      <form action={handleSubmit} className="flex items-center gap-2">
        <span className="text-white/80 text-sm">₱</span>
        <input
          type="number"
          name="amount"
          defaultValue={budget}
          step="0.01"
          min="0"
          className="w-28 px-2 py-1 text-lg font-bold rounded bg-white/20 text-white border-none outline-none focus:ring-2 focus:ring-white/50"
          autoFocus
          disabled={isPending}
        />
        <button
          type="submit"
          disabled={isPending}
          className="text-white/80 hover:text-white text-sm"
        >
          {isPending ? "..." : "✓"}
        </button>
        <button
          type="button"
          onClick={() => setIsEditing(false)}
          className="text-white/80 hover:text-white text-sm"
        >
          ✕
        </button>
      </form>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <p className="text-2xl font-bold">₱{budget.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</p>
      <button
        onClick={() => setIsEditing(true)}
        className="text-white/60 hover:text-white transition"
        title="Edit budget"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      </button>
    </div>
  );
}
