"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { updateExpense } from "@/app/actions/expenses";

type AddExpenseModalProps = {
  isOpen: boolean;
  onClose: () => void;
  prefillData?: {
    id?: string;
    amount?: number;
    description?: string;
    category?: string;
  };
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

export default function AddExpenseModal({ isOpen, onClose, prefillData }: AddExpenseModalProps) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const router = useRouter();
  const isEditing = Boolean(prefillData?.id);

  useEffect(() => {
    if (prefillData) {
      if (prefillData.amount) setAmount(prefillData.amount.toString());
      if (prefillData.description) setDescription(prefillData.description);
      if (prefillData.category) setCategory(prefillData.category);
    }
  }, [prefillData]);

  useEffect(() => {
    if (!isOpen) {
      setAmount("");
      setDescription("");
      setCategory("");
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsPending(true);
    try {
      const supabase = createClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (!user || userError) {
        setError("Not authenticated. Please log in again.");
        setIsPending(false);
        return;
      }
      if (!amount || !description || !category) {
        setError("All fields are required.");
        setIsPending(false);
        return;
      }

      // If editing, use updateExpense action
      if (isEditing && prefillData?.id) {
        const formData = new FormData();
        formData.append("amount", amount);
        formData.append("description", description.trim());
        formData.append("category", category);
        
        const result = await updateExpense(prefillData.id, formData);
        if (result.error) {
          setError(result.error);
          setIsPending(false);
          return;
        }
      } else {
        // Otherwise, add new expense
        const { error } = await supabase
          .from("expenses")
          .insert({
            user_id: user.id,
            amount: parseFloat(amount),
            description: description.trim(),
            category,
          });
        if (error) {
          setError(error.message || "Failed to add expense");
          setIsPending(false);
          return;
        }
      }

      router.refresh();
      onClose();
    } catch (err) {
      setError("Network error");
    }
    setIsPending(false);
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
            className="bg-white dark:bg-gray-900 rounded-3xl p-6 w-full max-w-md shadow-2xl shadow-rose-500/10 border border-gray-100 dark:border-gray-800"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                {isEditing ? "Edit Expense" : "Add Expense"}
              </h2>
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
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mb-6 p-4 bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 rounded-xl text-sm border border-rose-100 dark:border-rose-900/50">
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
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
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 outline-none transition-all"
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
                  placeholder="What did you spend on?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 outline-none transition-all"
                  disabled={isPending}
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 outline-none transition-all appearance-none cursor-pointer"
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
                  className="flex-1 px-4 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl shadow-lg shadow-rose-500/30 transition-all font-semibold disabled:opacity-50 cursor-pointer"
                  disabled={isPending}
                >
                  {isPending ? (isEditing ? "Updating..." : "Adding...") : (isEditing ? "Save Changes" : "Add Expense")}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
