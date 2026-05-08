import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import DashboardClient from "@/components/DashboardClient";
import { getExpenses, getTotalSpent, getBudget } from "@/app/actions/expenses";
import { getTotalIncome, getAllIncome } from "@/app/actions/income";
import { getBudgetGoals, getSpentByCategory } from "@/app/actions/budget-goals";



export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

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
  const baseBudget = budgetResult.budget?.amount || 0;
  const totalIncome = totalIncomeResult.total;
  // Total budget = base budget + income added this month
  const budget = baseBudget + totalIncome;
  const remaining = budget - totalSpent;

  return (
    <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
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
  );
}
