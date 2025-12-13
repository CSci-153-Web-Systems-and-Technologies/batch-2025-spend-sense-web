import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import BudgetGoalsClient from "@/components/BudgetGoalsClient";
import LogoutButton from "@/components/LogoutButton";
import MobileNav from "@/components/MobileNav";
import { getTotalSpent, getBudget } from "@/app/actions/expenses";
import { getTotalIncome } from "@/app/actions/income";
import { getBudgetGoals, getSpentByCategory } from "@/app/actions/budget-goals";



export default async function BudgetGoalsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const username = user.user_metadata?.username || user.email?.split('@')[0] || 'User';
    const avatarUrl = user.user_metadata?.avatar_url || null;

    // Fetch data
    const [budgetGoals, spentByCategory, totalSpentResult, budgetResult, totalIncomeResult] = await Promise.all([
        getBudgetGoals(),
        getSpentByCategory(),
        getTotalSpent(),
        getBudget(),
        getTotalIncome(),
    ]);

    const totalSpent = totalSpentResult.total;
    const baseBudget = budgetResult.budget?.amount || 10000;
    const totalIncome = totalIncomeResult.total;
    const totalBudget = baseBudget + totalIncome;

    return (
        <div className="min-h-screen flex flex-col bg-gray-100 pb-16 md:pb-0">
            {/* Navigation */}
            <nav className="w-full px-4 sm:px-6 py-3 bg-green-600">
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
                        <Link href="/expenses" className="text-white/80 text-sm font-medium hover:text-green-200 transition">
                            Expenses
                        </Link>
                        <Link href="/reports" className="text-white/80 text-sm font-medium hover:text-green-200 transition">
                            Reports
                        </Link>
                        <Link href="/budget-goals" className="text-white text-sm font-medium hover:text-green-200 transition underline underline-offset-4">
                            Budget Goals
                        </Link>
                    </div>

                    {/* User Menu */}
                    <div className="flex items-center gap-3">
                        <Link
                            href="/profile"
                            className="w-8 h-8 rounded-full flex items-center justify-center hover:ring-2 hover:ring-green-400 transition overflow-hidden"
                        >
                            {avatarUrl ? (
                                <Image
                                    src={avatarUrl}
                                    alt="Profile"
                                    width={32}
                                    height={32}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-green-700 flex items-center justify-center">
                                    <span className="text-white text-sm font-medium">
                                        {username.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            )}
                        </Link>
                        <span className="text-white text-sm font-medium hidden sm:block">
                            {username}
                        </span>
                        <LogoutButton />
                    </div>
                </div>
            </nav>

            {/* Budget Goals Content */}
            <main className="flex-1 px-6 py-6">
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

            {/* Mobile Navigation */}
            <MobileNav />
        </div>
    );
}
