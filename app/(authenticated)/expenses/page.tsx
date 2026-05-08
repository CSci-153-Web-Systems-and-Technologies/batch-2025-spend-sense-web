import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import ExpensesClient from "@/components/ExpensesClient";
import { getExpenses } from "@/app/actions/expenses";
import { getBudgetGoals } from "@/app/actions/budget-goals";



export default async function ExpensesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch expenses data
  const [expensesResult, budgetGoals] = await Promise.all([
    getExpenses(),
    getBudgetGoals(),
  ]);

  const expenses = expensesResult.expenses;

  return (
    <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
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
  );
}
