import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import DashboardClient from "@/components/DashboardClient";
import { getRecentExpenses, getTotalSpent, getBudget } from "@/app/actions/expenses";
import { getTotalIncome, getRecentIncome } from "@/app/actions/income";
import { getBudgetGoals, getSpentByCategory } from "@/app/actions/budget-goals";

async function signOut() {
  "use server";
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const username = user.user_metadata?.username || user.email?.split('@')[0] || 'User';

  // Fetch dashboard data
  const [expensesResult, totalSpentResult, budgetResult, totalIncomeResult, recentIncomeResult, budgetGoals, spentByCategory] = await Promise.all([
    getRecentExpenses(4),
    getTotalSpent(),
    getBudget(),
    getTotalIncome(),
    getRecentIncome(4),
    getBudgetGoals(),
    getSpentByCategory(),
  ]);

  const expenses = expensesResult.expenses;
  const recentIncome = recentIncomeResult.income;
  const totalSpent = totalSpentResult.total;
  const baseBudget = budgetResult.budget?.amount || 10000;
  const totalIncome = totalIncomeResult.total;
  // Total budget = base budget + income added this month
  const budget = baseBudget + totalIncome;
  const remaining = budget - totalSpent;

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Navigation */}
      <nav className="w-full px-6 py-3 bg-green-600">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg">$</span>
            </div>
            <span className="text-white font-bold text-lg">SpendSense</span>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/dashboard" className="text-white text-sm font-medium hover:text-green-200 transition underline underline-offset-4">
              Dashboard
            </Link>
            <Link href="#" className="text-white/80 text-sm font-medium hover:text-green-200 transition">
              Expenses
            </Link>
            <Link href="#" className="text-white/80 text-sm font-medium hover:text-green-200 transition">
              Reports
            </Link>
            <Link href="#" className="text-white/80 text-sm font-medium hover:text-green-200 transition">
              Budget Goals
            </Link>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-700 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {username.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-white text-sm font-medium hidden sm:block">
              {username}
            </span>
            <form action={signOut}>
              <button
                type="submit"
                className="text-white/80 hover:text-white text-sm transition ml-2"
                title="Logout"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <main className="flex-1 px-6 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
          <p className="text-gray-500 text-sm">Track your spending and manage your budget efficiently</p>
        </div>

        <DashboardClient
          budget={budget}
          totalSpent={totalSpent}
          remaining={remaining}
          expenses={expenses}
          income={recentIncome}
          budgetGoals={budgetGoals}
          spentByCategory={spentByCategory}
        />
      </main>
    </div>
  );
}
