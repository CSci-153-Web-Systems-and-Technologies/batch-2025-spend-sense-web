"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { addIncome } from "@/app/actions/income";
import { motion, AnimatePresence } from "framer-motion";

type AddIncomeModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const SOURCES = [
  { value: "salary", label: "Salary", emoji: "💼" },
  { value: "allowance", label: "Allowance", emoji: "💵" },
  { value: "freelance", label: "Freelance", emoji: "💻" },
  { value: "business", label: "Business", emoji: "🏪" },
  { value: "gift", label: "Gift", emoji: "🎁" },
  { value: "refund", label: "Refund", emoji: "↩️" },
  { value: "investment", label: "Investment", emoji: "📈" },
  { value: "other", label: "Other", emoji: "📦" },
];

export default function AddIncomeModal({ isOpen, onClose }: AddIncomeModalProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!isOpen) {
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      const result = await addIncome(formData);
      if (result.error) {
        setError(result.error);
      } else {
        router.refresh();
        onClose();
      }
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white dark:bg-gray-900 rounded-3xl p-6 w-full max-w-md shadow-2xl shadow-emerald-500/10 border border-gray-100 dark:border-gray-800"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Add Income</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-xl text-sm border border-emerald-100 dark:border-emerald-900/50">
                {error}
              </motion.div>
            )}

            <form action={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="amount" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Amount (₱)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₱</span>
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all"
                    disabled={isPending}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Description
                </label>
                <input
                  type="text"
                  id="description"
                  name="description"
                  required
                  placeholder="What is this income for?"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all"
                  disabled={isPending}
                />
              </div>

              <div>
                <label htmlFor="source" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Source
                </label>
                <select
                  id="source"
                  name="source"
                  required
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all appearance-none cursor-pointer"
                  disabled={isPending}
                >
                  <option value="">Select a source</option>
                  {SOURCES.map((src) => (
                    <option key={src.value} value={src.value}>
                      {src.emoji} {src.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-semibold cursor-pointer"
                  disabled={isPending}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/30 transition-all font-semibold disabled:opacity-50 cursor-pointer"
                  disabled={isPending}
                >
                  {isPending ? "Adding..." : "Add Income"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
