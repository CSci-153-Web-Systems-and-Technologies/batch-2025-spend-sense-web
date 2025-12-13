import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import ExpensesClient from "@/components/ExpensesClient";
import { getExpenses } from "@/app/actions/expenses";
import { getBudgetGoals } from "@/app/actions/budget-goals";

async function signOut() {
  "use server";
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export default async function ExpensesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const username = user.user_metadata?.username || user.email?.split('@')[0] || 'User';

  // Fetch expenses data
  const [expensesResult, budgetGoals] = await Promise.all([
    getExpenses(),
    getBudgetGoals(),
  ]);

  const expenses = expensesResult.expenses;

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
            <Link href="/dashboard" className="text-white/80 text-sm font-medium hover:text-green-200 transition">
              Dashboard
            </Link>
            <Link href="/expenses" className="text-white text-sm font-medium hover:text-green-200 transition underline underline-offset-4">
              Expenses
            </Link>
            <Link href="/reports" className="text-white/80 text-sm font-medium hover:text-green-200 transition">
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

      {/* Expenses Content */}
      <main className="flex-1 px-6 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Expenses</h1>
          <p className="text-gray-500 text-sm">Track and manage your daily expenses.</p>
        </div>

        <ExpensesClient
          expenses={expenses}
          budgetGoals={budgetGoals}
        />
      </main>
    </div>
  );
}
