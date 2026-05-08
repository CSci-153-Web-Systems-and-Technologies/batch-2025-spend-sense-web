"use client";

import { useState } from "react";
import { motion, Variants } from "framer-motion";
import AddExpenseModal from "./AddExpenseModal";
import AddIncomeModal from "./AddIncomeModal";
import SetGoalModal from "./SetGoalModal";
import ScanBarcodeModal from "./ScanBarcodeModal";
import EditableBudget from "./EditableBudget";
import SpendingTrends from "./SpendingTrends";
import CategoryBreakdown from "./CategoryBreakdown";

type BudgetGoal = {
  id: string;
  category: string;
  target_amount: number;
};

type DashboardClientProps = {
  budget: number;
  totalSpent: number;
  remaining: number;
  expenses: Array<{
    id: string;
    amount: number;
    description: string;
    category: string;
    created_at: string;
  }>;
  income: Array<{
    id: string;
    amount: number;
    description: string;
    source: string;
    created_at: string;
  }>;
  budgetGoals: BudgetGoal[];
  spentByCategory: Record<string, number>;
};

const CATEGORY_STYLES: Record<string, { bg: string; emoji: string }> = {
  food: { bg: "bg-red-100 text-red-600", emoji: "🍽️" },
  transportation: { bg: "bg-blue-100 text-blue-600", emoji: "🚌" },
  school: { bg: "bg-yellow-100 text-yellow-600", emoji: "📓" },
  entertainment: { bg: "bg-purple-100 text-purple-600", emoji: "🎬" },
  shopping: { bg: "bg-pink-100 text-pink-600", emoji: "🛒" },
  utilities: { bg: "bg-orange-100 text-orange-600", emoji: "💡" },
  health: { bg: "bg-emerald-100 text-emerald-600", emoji: "💊" },
  other: { bg: "bg-gray-100 text-gray-600", emoji: "📦" },
};

const SOURCE_STYLES: Record<string, { bg: string; emoji: string }> = {
  salary: { bg: "bg-emerald-100 text-emerald-600", emoji: "💼" },
  allowance: { bg: "bg-blue-100 text-blue-600", emoji: "💵" },
  freelance: { bg: "bg-purple-100 text-purple-600", emoji: "💻" },
  business: { bg: "bg-orange-100 text-orange-600", emoji: "🏪" },
  gift: { bg: "bg-pink-100 text-pink-600", emoji: "🎁" },
  refund: { bg: "bg-yellow-100 text-yellow-600", emoji: "↩️" },
  investment: { bg: "bg-teal-100 text-teal-600", emoji: "📈" },
  other: { bg: "bg-gray-100 text-gray-600", emoji: "📦" },
};

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString("en-PH", { month: "short", day: "numeric" });
}

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    food: "Food",
    transportation: "Transportation",
    school: "School Supplies",
    entertainment: "Entertainment",
    shopping: "Shopping",
    utilities: "Utilities",
    health: "Health",
    other: "Other",
  };
  return labels[category] || category;
}

function getSourceLabel(source: string): string {
  const labels: Record<string, string> = {
    salary: "Salary",
    allowance: "Allowance",
    freelance: "Freelance",
    business: "Business",
    gift: "Gift",
    refund: "Refund",
    investment: "Investment",
    other: "Other",
  };
  return labels[source] || source;
}

// Animation Variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function DashboardClient({
  budget,
  totalSpent,
  remaining,
  expenses,
  income,
  budgetGoals,
  spentByCategory,
}: DashboardClientProps) {
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isAddIncomeOpen, setIsAddIncomeOpen] = useState(false);
  const [isSetGoalOpen, setIsSetGoalOpen] = useState(false);
  const [isScanBarcodeOpen, setIsScanBarcodeOpen] = useState(false);
  const [expensePrefill, setExpensePrefill] = useState<{ amount?: number; description?: string; category?: string } | undefined>();

  const handleBarcodeScanned = (data: { description: string; amount: number; category: string }) => {
    setExpensePrefill({
      amount: data.amount,
      description: data.description,
      category: data.category,
    });
    setIsScanBarcodeOpen(false);
    setIsAddExpenseOpen(true);
  };

  return (
    <motion.div 
      initial="hidden" 
      animate="show" 
      variants={containerVariants}
      className="space-y-6"
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Budget */}
        <motion.div variants={itemVariants} whileHover={{ y: -4, scale: 1.01 }} className="bg-gradient-to-br from-violet-500 to-violet-700 rounded-2xl p-6 text-white shadow-lg shadow-violet-500/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-20 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500">
            <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-violet-50 font-medium tracking-wide text-sm">Total Budget</p>
            </div>
            <div>
              <EditableBudget initialBudget={budget} />
              <p className="text-violet-100 text-xs mt-1 font-medium tracking-wider uppercase">This Month</p>
            </div>
          </div>
        </motion.div>

        {/* Total Spent */}
        <motion.div variants={itemVariants} whileHover={{ y: -4, scale: 1.01 }} className="bg-gradient-to-br from-rose-400 to-rose-600 rounded-2xl p-6 text-white shadow-lg shadow-rose-500/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-20 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500">
            <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="text-rose-50 font-medium tracking-wide text-sm">Total Spent</p>
            </div>
            <div>
              <p className="text-3xl font-bold tracking-tight">₱{totalSpent.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</p>
              <p className="text-rose-100 text-xs mt-1 font-medium tracking-wider uppercase">This Month</p>
            </div>
          </div>
        </motion.div>

        {/* Remaining */}
        <motion.div variants={itemVariants} whileHover={{ y: -4, scale: 1.01 }} className={`bg-gradient-to-br ${remaining >= 0 ? 'from-indigo-500 to-blue-600 shadow-indigo-500/20' : 'from-rose-500 to-red-600 shadow-rose-500/20'} rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group`}>
          <div className="absolute top-0 right-0 p-4 opacity-20 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500">
             <svg className="w-24 h-24 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
          </div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-indigo-50 font-medium tracking-wide text-sm">Remaining</p>
            </div>
            <div>
              <p className="text-3xl font-bold tracking-tight text-white">
                ₱{remaining.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
              </p>
              <p className="text-indigo-100 text-xs mt-1 font-medium tracking-wider uppercase">This Month</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setIsAddExpenseOpen(true)}
            className="flex flex-col items-center justify-center gap-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-violet-200 dark:hover:border-violet-900/50 hover:bg-violet-50 dark:hover:bg-violet-900/10 text-gray-700 dark:text-gray-200 py-4 px-4 rounded-2xl font-medium transition-colors cursor-pointer shadow-sm"
          >
            <div className="w-12 h-12 bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <span className="text-sm font-semibold tracking-wide">Add Expense</span>
          </motion.button>
          
          <motion.button
             whileHover={{ scale: 1.03 }}
             whileTap={{ scale: 0.97 }}
            onClick={() => setIsAddIncomeOpen(true)}
            className="flex flex-col items-center justify-center gap-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-teal-200 dark:hover:border-teal-900/50 hover:bg-teal-50 dark:hover:bg-teal-900/10 text-gray-700 dark:text-gray-200 py-4 px-4 rounded-2xl font-medium transition-colors cursor-pointer shadow-sm"
          >
             <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <span className="text-sm font-semibold tracking-wide">Add Income</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setIsScanBarcodeOpen(true)}
             className="flex flex-col items-center justify-center gap-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-orange-200 dark:hover:border-orange-900/50 hover:bg-orange-50 dark:hover:bg-orange-900/10 text-gray-700 dark:text-gray-200 py-4 px-4 rounded-2xl font-medium transition-colors cursor-pointer shadow-sm"
          >
             <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
            <span className="text-sm font-semibold tracking-wide">Scan Barcode</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setIsSetGoalOpen(true)}
            className="flex flex-col items-center justify-center gap-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-900/50 hover:bg-blue-50 dark:hover:bg-blue-900/10 text-gray-700 dark:text-gray-200 py-4 px-4 rounded-2xl font-medium transition-colors cursor-pointer shadow-sm"
          >
             <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </div>
            <span className="text-sm font-semibold tracking-wide">Set Goal</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Expenses */}
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
             <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Recent Expenses</h2>
             <button className="text-sm text-primary font-medium hover:underline cursor-pointer">View All</button>
          </div>
          {expenses.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              </div>
              <p className="text-gray-500 font-medium">No expenses yet.</p>
              <p className="text-sm text-gray-400 mt-1">Click &quot;Add Expense&quot; to get started!</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
              {expenses.map((expense) => {
                const style = CATEGORY_STYLES[expense.category] || CATEGORY_STYLES.other;
                return (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={expense.id}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border border-transparent hover:border-gray-100 dark:hover:border-gray-700"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 ${style.bg} rounded-xl flex items-center justify-center shadow-sm`}>
                        <span className="text-xl">{style.emoji}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-gray-200 text-base">{expense.description}</p>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mt-0.5">
                          {getCategoryLabel(expense.category)} <span className="mx-1 opacity-50">•</span> {formatRelativeTime(expense.created_at)}
                        </p>
                      </div>
                    </div>
                    <p className="text-rose-600 dark:text-rose-400 font-bold tracking-tight">
                      -₱{expense.amount.toLocaleString("en-PH", { minimumFractionDigits: 0 })}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Budget Goals - Dynamic */}
        <motion.div variants={itemVariants} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
             <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Budget Goals</h2>
             <button onClick={() => setIsSetGoalOpen(true)} className="cursor-pointer w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 flex items-center justify-center text-gray-600 transition-colors">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
             </button>
          </div>
          {budgetGoals.length === 0 ? (
            <div className="text-center py-10 my-auto bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
               <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <p className="text-gray-500 font-medium">No goals set.</p>
            </div>
          ) : (
            <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {budgetGoals.map((goal) => {
                const spent = spentByCategory[goal.category] || 0;
                const percentage = Math.min((spent / goal.target_amount) * 100, 100);
                const isOverBudget = spent > goal.target_amount;
                const categoryStyle = CATEGORY_STYLES[goal.category] || CATEGORY_STYLES.other;

                return (
                  <div key={goal.id} className="group">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <span className="w-6 h-6 rounded bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-xs">{categoryStyle.emoji}</span>
                        {getCategoryLabel(goal.category)}
                      </span>
                      <span className={`text-sm font-bold ${isOverBudget ? 'text-rose-600' : 'text-gray-600 dark:text-gray-400'}`}>
                        ₱{spent.toLocaleString("en-PH", { minimumFractionDigits: 0 })} <span className="text-gray-400 font-normal mx-0.5">/</span> ₱{goal.target_amount.toLocaleString("en-PH", { minimumFractionDigits: 0 })}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${percentage}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`h-full rounded-full ${isOverBudget
                            ? 'bg-rose-500'
                            : percentage >= 80
                              ? 'bg-amber-400'
                              : 'bg-emerald-500'
                          }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Spending Trends Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <SpendingTrends expenses={expenses} />
        </motion.div>

        {/* Category Breakdown Chart */}
        <motion.div variants={itemVariants}>
          <CategoryBreakdown expenses={expenses} />
        </motion.div>

        {/* Recent Income */}
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
           <div className="flex items-center justify-between mb-6">
             <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Recent Income</h2>
             <button className="cursor-pointer text-sm text-primary font-medium hover:underline">View All</button>
          </div>
          {income.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
              </div>
              <p className="text-gray-500 font-medium">No income yet.</p>
              <p className="text-sm text-gray-400 mt-1">Click &quot;Add Income&quot; to track your earnings!</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
              {income.map((inc) => {
                const style = SOURCE_STYLES[inc.source] || SOURCE_STYLES.other;
                return (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={inc.id}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border border-transparent hover:border-gray-100 dark:hover:border-gray-700"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 ${style.bg} rounded-xl flex items-center justify-center shadow-sm`}>
                        <span className="text-xl">{style.emoji}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-gray-200 text-base">{inc.description}</p>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mt-0.5">
                          {getSourceLabel(inc.source)} <span className="mx-1 opacity-50">•</span> {formatRelativeTime(inc.created_at)}
                        </p>
                      </div>
                    </div>
                    <p className="text-emerald-600 dark:text-emerald-400 font-bold tracking-tight">
                      +₱{inc.amount.toLocaleString("en-PH", { minimumFractionDigits: 0 })}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* Add Expense Modal */}
      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => {
          setIsAddExpenseOpen(false);
          setExpensePrefill(undefined);
        }}
        prefillData={expensePrefill}
      />

      {/* Add Income Modal */}
      <AddIncomeModal isOpen={isAddIncomeOpen} onClose={() => setIsAddIncomeOpen(false)} />

      {/* Set Goal Modal */}
      <SetGoalModal
        isOpen={isSetGoalOpen}
        onClose={() => setIsSetGoalOpen(false)}
        existingGoals={budgetGoals.map(g => ({ category: g.category, target_amount: g.target_amount }))}
      />

      {/* Scan Barcode Modal */}
      <ScanBarcodeModal
        isOpen={isScanBarcodeOpen}
        onClose={() => setIsScanBarcodeOpen(false)}
        onProductScanned={handleBarcodeScanned}
      />
    </motion.div>
  );
}
