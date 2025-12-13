"use client";

import { useState } from "react";
import AddExpenseModal from "./AddExpenseModal";
import AddIncomeModal from "./AddIncomeModal";
import EditableBudget from "./EditableBudget";

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
};

const CATEGORY_STYLES: Record<string, { bg: string; emoji: string }> = {
  food: { bg: "bg-red-100", emoji: "🍽️" },
  transportation: { bg: "bg-blue-100", emoji: "🚌" },
  school: { bg: "bg-yellow-100", emoji: "📓" },
  entertainment: { bg: "bg-purple-100", emoji: "🎬" },
  shopping: { bg: "bg-pink-100", emoji: "🛒" },
  utilities: { bg: "bg-orange-100", emoji: "💡" },
  health: { bg: "bg-green-100", emoji: "💊" },
  other: { bg: "bg-gray-100", emoji: "📦" },
};

const SOURCE_STYLES: Record<string, { bg: string; emoji: string }> = {
  salary: { bg: "bg-green-100", emoji: "💼" },
  allowance: { bg: "bg-blue-100", emoji: "💵" },
  freelance: { bg: "bg-purple-100", emoji: "💻" },
  business: { bg: "bg-orange-100", emoji: "🏪" },
  gift: { bg: "bg-pink-100", emoji: "🎁" },
  refund: { bg: "bg-yellow-100", emoji: "↩️" },
  investment: { bg: "bg-teal-100", emoji: "📈" },
  other: { bg: "bg-gray-100", emoji: "📦" },
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

export default function DashboardClient({
  budget,
  totalSpent,
  remaining,
  expenses,
  income,
}: DashboardClientProps) {
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isAddIncomeOpen, setIsAddIncomeOpen] = useState(false);

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Total Budget */}
        <div className="bg-green-500 rounded-xl p-5 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-white/80 text-sm">Total Budget</p>
              <EditableBudget initialBudget={budget} />
              <p className="text-white/60 text-xs">This Month</p>
            </div>
          </div>
        </div>

        {/* Total Spent */}
        <div className="bg-red-400 rounded-xl p-5 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p className="text-white/80 text-sm">Total Spent</p>
              <p className="text-2xl font-bold">₱{totalSpent.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</p>
              <p className="text-white/60 text-xs">This Month</p>
            </div>
          </div>
        </div>

        {/* Remaining */}
        <div className="bg-white border border-gray-300 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Remaining</p>
              <p className={`text-2xl font-bold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₱{remaining.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
              </p>
              <p className="text-gray-500 text-xs">This Month</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => setIsAddExpenseOpen(true)}
            className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-lg font-medium transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Expense
          </button>
          <button className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg font-medium transition"
            onClick={() => setIsAddIncomeOpen(true)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Income
          </button>
          <button className="flex items-center justify-center gap-2 bg-orange-400 hover:bg-orange-500 text-white py-3 px-4 rounded-lg font-medium transition opacity-50 cursor-not-allowed">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            Scan Barcode
          </button>
          <button className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg font-medium transition opacity-50 cursor-not-allowed">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            Set Goal
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Expenses */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Expenses</h2>
          {expenses.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>No expenses yet.</p>
              <p className="text-sm">Click &quot;Add Expense&quot; to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {expenses.map((expense, index) => {
                const style = CATEGORY_STYLES[expense.category] || CATEGORY_STYLES.other;
                return (
                  <div
                    key={expense.id}
                    className={`flex items-center justify-between py-3 ${
                      index < expenses.length - 1 ? "border-b border-gray-100" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 ${style.bg} rounded-lg flex items-center justify-center`}>
                        <span className="text-lg">{style.emoji}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{expense.description}</p>
                        <p className="text-sm text-gray-400">
                          {getCategoryLabel(expense.category)} · {formatRelativeTime(expense.created_at)}
                        </p>
                      </div>
                    </div>
                    <p className="text-red-500 font-semibold">
                      -₱{expense.amount.toLocaleString("en-PH", { minimumFractionDigits: 0 })}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Budget Goals - Placeholder */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Budget Goals</h2>
          <div className="space-y-4">
            {/* Food Budget */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Food Budget</span>
                <span className="text-sm text-gray-800 font-medium">₱800/₱1,200</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '67%' }}></div>
              </div>
            </div>

            {/* Transportation */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Transportation</span>
                <span className="text-sm text-gray-800 font-medium">₱300/₱500</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>

            {/* Entertainment */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Entertainment</span>
                <span className="text-sm text-gray-800 font-medium">₱450/₱600</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-orange-400 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Income */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Income</h2>
          {income.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>No income yet.</p>
              <p className="text-sm">Click &quot;Add Income&quot; to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {income.map((inc, index) => {
                const style = SOURCE_STYLES[inc.source] || SOURCE_STYLES.other;
                return (
                  <div
                    key={inc.id}
                    className={`flex items-center justify-between py-3 ${
                      index < income.length - 1 ? "border-b border-gray-100" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 ${style.bg} rounded-lg flex items-center justify-center`}>
                        <span className="text-lg">{style.emoji}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{inc.description}</p>
                        <p className="text-sm text-gray-400">
                          {getSourceLabel(inc.source)} · {formatRelativeTime(inc.created_at)}
                        </p>
                      </div>
                    </div>
                    <p className="text-green-500 font-semibold">
                      +₱{inc.amount.toLocaleString("en-PH", { minimumFractionDigits: 0 })}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add Expense Modal */}
      <AddExpenseModal isOpen={isAddExpenseOpen} onClose={() => setIsAddExpenseOpen(false)} />
      
      {/* Add Income Modal */}
      <AddIncomeModal isOpen={isAddIncomeOpen} onClose={() => setIsAddIncomeOpen(false)} />
    </>
  );
}
