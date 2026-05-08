import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import DashboardClient from "@/components/DashboardClient";
import { getExpenses, getTotalSpent, getBudget } from "@/app/actions/expenses";
import { getTotalIncome, getAllIncome } from "@/app/actions/income";
import { getBudgetGoals, getSpentByCategory } from "@/app/actions/budget-goals";

async function signOut() {
  "use server";
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  const username = user.user_metadata?.username || user.email?.split('@')[0] || 'User';

  // Fetch dashboard data
  const [expensesResult, totalSpentResult, budgetResult, totalIncomeResult, allIncomeResult, budgetGoals, spentByCategory] = await Promise.all([
    getExpenses(),
    getTotalSpent(),
    getBudget(),
    getTotalIncome(),
    getAllIncome(),
    getBudgetGoals(),
    getSpentByCategory(),
  ]);

  const expenses = expensesResult.expenses;
  const allIncome = allIncomeResult.income;
  const totalSpent = totalSpentResult.total;
  const baseBudget = budgetResult.budget?.amount || 10000;
  const totalIncome = totalIncomeResult.total;
  // Total budget = base budget + income added this month
  const budget = baseBudget + totalIncome;
  const remaining = budget - totalSpent;

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">

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
          income={allIncome}
          budgetGoals={budgetGoals}
          spentByCategory={spentByCategory}
        />
      </main>
    </div>
  );
}
