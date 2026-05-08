import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import ReportsClient from "@/components/ReportsClient";
import { getExpenses, getTotalSpent, getBudget } from "@/app/actions/expenses";
import { getTotalIncome } from "@/app/actions/income";



export default async function ReportsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Fetch data for reports
    const [expensesResult, totalSpentResult, budgetResult, totalIncomeResult] = await Promise.all([
        getExpenses(),
        getTotalSpent(),
        getBudget(),
        getTotalIncome(),
    ]);

    const expenses = expensesResult.expenses;
    const totalSpent = totalSpentResult.total;
    const baseBudget = budgetResult.budget?.amount || 0;
    const totalIncome = totalIncomeResult.total;
    const totalBudget = baseBudget + totalIncome;

    return (
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Reports</h1>
                <p className="text-gray-500 text-sm">Analyze your spending patterns and financial habits.</p>
            </div>

            <ReportsClient
                expenses={expenses}
                totalBudget={totalBudget}
                totalSpent={totalSpent}
            />
        </main>
    );
}
