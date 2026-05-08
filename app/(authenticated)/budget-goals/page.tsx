import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import BudgetGoalsClient from "@/components/BudgetGoalsClient";
import { getTotalSpent, getBudget } from "@/app/actions/expenses";
import { getTotalIncome } from "@/app/actions/income";
import { getBudgetGoals, getSpentByCategory } from "@/app/actions/budget-goals";



export default async function BudgetGoalsPage() {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        redirect("/login");
    }

    // Fetch data
    const [budgetGoals, spentByCategory, totalSpentResult, budgetResult, totalIncomeResult] = await Promise.all([
        getBudgetGoals(),
        getSpentByCategory(),
        getTotalSpent(),
        getBudget(),
        getTotalIncome(),
    ]);

    const totalSpent = totalSpentResult.total;
    const baseBudget = budgetResult.budget?.amount || 0;
    const totalIncome = totalIncomeResult.total;
    const totalBudget = baseBudget + totalIncome;

    return (
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Budget Goals</h1>
                <p className="text-gray-500 text-sm">Set and track your spending goals for better financial management.</p>
            </div>

            <BudgetGoalsClient
                budgetGoals={budgetGoals}
                spentByCategory={spentByCategory}
                totalBudget={totalBudget}
                totalSpent={totalSpent}
            />
        </main>
    );
}
