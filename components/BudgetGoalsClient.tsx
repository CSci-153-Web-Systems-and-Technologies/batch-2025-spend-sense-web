"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SetGoalModal from "./SetGoalModal";

type BudgetGoal = {
    id: string;
    category: string;
    target_amount: number;
    created_at: string;
};

type BudgetGoalsClientProps = {
    budgetGoals: BudgetGoal[];
    spentByCategory: Record<string, number>;
    totalBudget: number;
    totalSpent: number;
};

const CATEGORY_STYLES: Record<string, { bg: string; icon: string; color: string }> = {
    food: { bg: "bg-red-100", icon: "🍽️", color: "bg-red-500" },
    transportation: { bg: "bg-blue-100", icon: "🚌", color: "bg-green-500" },
    school: { bg: "bg-yellow-100", icon: "📓", color: "bg-green-500" },
    entertainment: { bg: "bg-purple-100", icon: "🎬", color: "bg-orange-400" },
    shopping: { bg: "bg-pink-100", icon: "🛒", color: "bg-pink-500" },
    utilities: { bg: "bg-orange-100", icon: "💡", color: "bg-orange-500" },
    health: { bg: "bg-green-100", icon: "💊", color: "bg-green-500" },
    other: { bg: "bg-gray-100", icon: "📦", color: "bg-gray-500" },
};

const CATEGORY_LABELS: Record<string, string> = {
    food: "Food Budget",
    transportation: "Transportation",
    school: "School Supplies",
    entertainment: "Entertainment",
    shopping: "Shopping",
    utilities: "Utilities",
    health: "Health",
    other: "Other",
};

function getDaysRemaining(): number {
    const now = new Date();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return Math.ceil((endOfMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function getStatusInfo(percentage: number): { label: string; color: string; textColor: string } {
    if (percentage >= 100) {
        return { label: "OVER BUDGET", color: "bg-red-100", textColor: "text-red-600" };
    } else if (percentage >= 75) {
        return { label: "APPROACHING LIMIT", color: "bg-orange-100", textColor: "text-orange-600" };
    } else if (percentage >= 50) {
        return { label: "ON TRACK", color: "bg-green-100", textColor: "text-green-600" };
    } else {
        return { label: "WELL UNDER BUDGET", color: "bg-green-100", textColor: "text-green-600" };
    }
}

function getProgressBarColor(percentage: number): string {
    if (percentage >= 100) return "bg-red-500";
    if (percentage >= 75) return "bg-orange-400";
    return "bg-green-500";
}

export default function BudgetGoalsClient({
    budgetGoals,
    spentByCategory,
    totalBudget,
    totalSpent
}: BudgetGoalsClientProps) {
    const [isSetGoalOpen, setIsSetGoalOpen] = useState(false);
    const router = useRouter();

    const daysRemaining = getDaysRemaining();
    const remainingBudget = totalBudget - totalSpent;
    const budgetUsedPercentage = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

    // Count goals over budget
    const goalsOverBudget = budgetGoals.filter(goal => {
        const spent = spentByCategory[goal.category] || 0;
        return spent > goal.target_amount;
    });

    // Get categories that exceeded budget
    const exceededCategories = goalsOverBudget.map(g =>
        CATEGORY_LABELS[g.category]?.split(" ")[0] || g.category
    );

    const handleEditGoal = (goal: BudgetGoal) => {
        // Open modal with prefilled data - for now just open the set goal modal
        setIsSetGoalOpen(true);
    };

    const handleDeleteGoal = async (goalId: string) => {
        if (!confirm("Are you sure you want to delete this budget goal?")) return;

        try {
            const response = await fetch(`/api/budget-goals/${goalId}`, {
                method: "DELETE",
            });
            if (response.ok) {
                router.refresh();
            }
        } catch (error) {
            console.error("Error deleting goal:", error);
        }
    };

    return (
        <>
            {/* Set Goal Button */}
            <div className="mb-6">
                <button
                    onClick={() => setIsSetGoalOpen(true)}
                    className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white py-3 px-6 rounded-lg font-medium transition"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Set Goal
                </button>
            </div>

            {/* Monthly Budget Overview */}
            <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Monthly Budget Overview</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-green-500 rounded-xl p-5 text-white shadow-md">
                        <p className="text-2xl font-bold drop-shadow-sm">₱{totalBudget.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</p>
                        <p className="text-white font-medium text-sm">Total Monthly Budget</p>
                        <p className="text-green-100 text-xs mt-1">Set across {budgetGoals.length} categories</p>
                    </div>
                    <div className="bg-yellow-500 rounded-xl p-5 text-white shadow-md">
                        <p className="text-2xl font-bold drop-shadow-sm">₱{remainingBudget.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</p>
                        <p className="text-white font-medium text-sm">Remaining Budget</p>
                        <p className="text-yellow-100 text-xs mt-1">{100 - budgetUsedPercentage}% left this month</p>
                    </div>
                    <div className="bg-red-400 rounded-xl p-5 text-white shadow-md">
                        <p className="text-2xl font-bold drop-shadow-sm">₱{totalSpent.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</p>
                        <p className="text-white font-medium text-sm">Total Spent</p>
                        <p className="text-red-100 text-xs mt-1">{budgetUsedPercentage}% of budget used</p>
                    </div>
                    <div className="bg-purple-500 rounded-xl p-5 text-white shadow-md">
                        <p className="text-2xl font-bold drop-shadow-sm">{goalsOverBudget.length}</p>
                        <p className="text-white font-medium text-sm">Goals over Budget</p>
                        <p className="text-purple-100 text-xs mt-1">
                            {exceededCategories.length > 0
                                ? `${exceededCategories.slice(0, 2).join(", ")}${exceededCategories.length > 2 ? "..." : ""} exceeded`
                                : "All on track"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Budget Goal Cards */}
            {budgetGoals.length === 0 ? (
                <div className="bg-white rounded-xl p-8 shadow-sm text-center">
                    <div className="text-4xl mb-4">🎯</div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">No Budget Goals Set</h3>
                    <p className="text-gray-500 mb-4">Start tracking your spending by setting budget goals for different categories.</p>
                    <button
                        onClick={() => setIsSetGoalOpen(true)}
                        className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition"
                    >
                        Set Your First Goal
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {budgetGoals.map((goal) => {
                        const spent = spentByCategory[goal.category] || 0;
                        const percentage = Math.min(Math.round((spent / goal.target_amount) * 100), 150);
                        const displayPercentage = Math.min(percentage, 100);
                        const remaining = goal.target_amount - spent;
                        const style = CATEGORY_STYLES[goal.category] || CATEGORY_STYLES.other;
                        const status = getStatusInfo(percentage);
                        const progressColor = getProgressBarColor(percentage);

                        return (
                            <div key={goal.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 ${style.bg} rounded-lg flex items-center justify-center`}>
                                            <span className="text-xl">{style.icon}</span>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{CATEGORY_LABELS[goal.category] || goal.category}</h3>
                                            <p className="text-xs text-gray-500 uppercase tracking-wide">Monthly Goal</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => handleEditGoal(goal)}
                                            className="p-2 text-orange-400 hover:bg-orange-50 rounded-lg transition"
                                            aria-label="Edit goal"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => handleDeleteGoal(goal.id)}
                                            className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition"
                                            aria-label="Delete goal"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                {/* Amount */}
                                <div className="flex items-baseline justify-between mb-2">
                                    <p className="text-2xl font-bold text-gray-900">₱{spent.toLocaleString()}</p>
                                    <p className="text-sm text-gray-500">of ₱{goal.target_amount.toLocaleString()}</p>
                                </div>

                                {/* Progress Bar */}
                                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                                    <div
                                        className={`h-2 rounded-full transition-all ${progressColor}`}
                                        style={{ width: `${displayPercentage}%` }}
                                    />
                                </div>

                                {/* Stats */}
                                <div className="flex items-center justify-between text-sm mb-3">
                                    <span className="text-gray-600 font-medium">{percentage}%</span>
                                    <span className="text-gray-500">
                                        {remaining > 0
                                            ? `₱${remaining.toLocaleString()} remaining`
                                            : `₱${Math.abs(remaining).toLocaleString()} over budget`}
                                    </span>
                                </div>

                                {/* Status Badge and Days */}
                                <div className="flex items-center justify-between mb-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.color} ${status.textColor}`}>
                                        {status.label}
                                    </span>
                                    <span className="text-xs text-gray-500">{daysRemaining} days remaining</span>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setIsSetGoalOpen(true)}
                                        className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
                                    >
                                        {percentage >= 75 ? "Increase Budget" : "Reduce Budget"}
                                    </button>
                                    <button className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-medium">
                                        View Details
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Set Goal Modal */}
            <SetGoalModal
                isOpen={isSetGoalOpen}
                onClose={() => setIsSetGoalOpen(false)}
                existingGoals={budgetGoals.map(g => ({ category: g.category, target_amount: g.target_amount }))}
            />
        </>
    );
}
