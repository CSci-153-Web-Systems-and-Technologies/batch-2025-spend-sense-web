"use client";

import { useState, useMemo } from "react";
import AddExpenseModal from "./AddExpenseModal";
import AddIncomeModal from "./AddIncomeModal";
import SetGoalModal from "./SetGoalModal";
import ScanBarcodeModal from "./ScanBarcodeModal";
import CategoryBreakdown from "./CategoryBreakdown";

type Expense = {
    id: string;
    amount: number;
    description: string;
    category: string;
    created_at: string;
};

type BudgetGoal = {
    id: string;
    category: string;
    target_amount: number;
};

type ExpensesClientProps = {
    expenses: Expense[];
    budgetGoals: BudgetGoal[];
};

const CATEGORY_STYLES: Record<string, { bg: string; icon: string }> = {
    food: { bg: "bg-red-100", icon: "🍽️" },
    transportation: { bg: "bg-blue-100", icon: "🚌" },
    school: { bg: "bg-yellow-100", icon: "📓" },
    entertainment: { bg: "bg-purple-100", icon: "🎬" },
    shopping: { bg: "bg-pink-100", icon: "🛒" },
    utilities: { bg: "bg-orange-100", icon: "💡" },
    health: { bg: "bg-green-100", icon: "💊" },
    other: { bg: "bg-gray-100", icon: "📦" },
};

const CATEGORIES = [
    { value: "", label: "All Categories" },
    { value: "food", label: "Food" },
    { value: "transportation", label: "Transportation" },
    { value: "school", label: "School Supplies" },
    { value: "entertainment", label: "Entertainment" },
    { value: "shopping", label: "Shopping" },
    { value: "utilities", label: "Utilities" },
    { value: "health", label: "Health" },
    { value: "other", label: "Other" },
];

const DATE_RANGES = [
    { value: "today", label: "Today" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "all", label: "All Time" },
];

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

function isWithinDateRange(dateString: string, range: string): boolean {
    const date = new Date(dateString);
    const now = new Date();

    switch (range) {
        case "today":
            return date.toDateString() === now.toDateString();
        case "week": {
            const weekAgo = new Date(now);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return date >= weekAgo;
        }
        case "month":
            return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        case "all":
        default:
            return true;
    }
}

export default function ExpensesClient({ expenses, budgetGoals }: ExpensesClientProps) {
    const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
    const [isAddIncomeOpen, setIsAddIncomeOpen] = useState(false);
    const [isSetGoalOpen, setIsSetGoalOpen] = useState(false);
    const [isScanBarcodeOpen, setIsScanBarcodeOpen] = useState(false);
    const [expensePrefill, setExpensePrefill] = useState<{ amount?: number; description?: string; category?: string } | undefined>();

    // Filter states
    const [categoryFilter, setCategoryFilter] = useState("");
    const [dateRange, setDateRange] = useState("today");
    const [searchQuery, setSearchQuery] = useState("");

    const handleBarcodeScanned = (data: { description: string; amount: number; category: string }) => {
        setExpensePrefill({
            amount: data.amount,
            description: data.description,
            category: data.category,
        });
        setIsScanBarcodeOpen(false);
        setIsAddExpenseOpen(true);
    };

    // Filter expenses
    const filteredExpenses = useMemo(() => {
        return expenses.filter((expense) => {
            // Category filter
            if (categoryFilter && expense.category !== categoryFilter) {
                return false;
            }
            // Date range filter
            if (!isWithinDateRange(expense.created_at, dateRange)) {
                return false;
            }
            // Search filter
            if (searchQuery && !expense.description.toLowerCase().includes(searchQuery.toLowerCase())) {
                return false;
            }
            return true;
        });
    }, [expenses, categoryFilter, dateRange, searchQuery]);

    // Calculate total for filtered expenses
    const totalFiltered = useMemo(() => {
        return filteredExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
    }, [filteredExpenses]);

    // Get date range label for display
    const dateRangeLabel = DATE_RANGES.find(r => r.value === dateRange)?.label || "This Week";

    return (
        <>
            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <button
                    onClick={() => setIsAddExpenseOpen(true)}
                    className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-lg font-medium transition cursor-pointer"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Expense
                </button>
                <button
                    onClick={() => setIsAddIncomeOpen(true)}
                    className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg font-medium transition cursor-pointer"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Add Income
                </button>
                <button
                    onClick={() => setIsScanBarcodeOpen(true)}
                    className="flex items-center justify-center gap-2 bg-orange-400 hover:bg-orange-500 text-white py-3 px-4 rounded-lg font-medium transition cursor-pointer"
                >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M2 4h2v16H2V4zm3 0h1v16H5V4zm2 0h2v16H7V4zm3 0h1v16h-1V4zm2 0h2v16h-2V4zm3 0h2v16h-2V4zm3 0h1v16h-1V4zm2 0h2v16h-2V4z" />
                    </svg>
                    Scan Barcode
                </button>
                <button
                    onClick={() => setIsSetGoalOpen(true)}
                    className="flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 text-white py-3 px-4 rounded-lg font-medium transition cursor-pointer"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Set Goal
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Category</label>
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none min-w-[140px]"
                    >
                        {CATEGORIES.map((cat) => (
                            <option key={cat.value} value={cat.value}>
                                {cat.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Date Range</label>
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none min-w-[120px]"
                    >
                        {DATE_RANGES.map((range) => (
                            <option key={range.value} value={range.value}>
                                {range.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Search</label>
                    <input
                        type="text"
                        placeholder="Search expenses..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none min-w-[180px]"
                    />
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Expenses */}
                <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-800">Recent Expenses</h2>
                        <button className="text-gray-400 hover:text-gray-600 transition">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                        </button>
                    </div>
                    {filteredExpenses.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                            <p>No expenses found.</p>
                            <p className="text-sm">Try adjusting your filters or add a new expense!</p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {filteredExpenses.map((expense, index) => {
                                const style = CATEGORY_STYLES[expense.category] || CATEGORY_STYLES.other;
                                return (
                                    <div
                                        key={expense.id}
                                        className={`flex items-center justify-between py-3 ${index < filteredExpenses.length - 1 ? "border-b border-gray-100" : ""
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 ${style.bg} rounded-lg flex items-center justify-center`}>
                                                <span className="text-lg">{style.icon}</span>
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
                            {filteredExpenses.length > 0 && (
                                <div className="flex justify-center pt-2">
                                    <button className="text-gray-400 hover:text-gray-600 transition">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* Total Spent Card */}
                    <div className="bg-red-400 rounded-xl p-6 text-white text-center">
                        <p className="text-3xl font-bold">₱{totalFiltered.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</p>
                        <p className="text-white/80 text-sm mt-1">Total {dateRangeLabel}</p>
                    </div>

                    {/* Category Breakdown */}
                    <CategoryBreakdown expenses={filteredExpenses} />
                </div>
            </div>

            {/* Modals */}
            <AddExpenseModal
                isOpen={isAddExpenseOpen}
                onClose={() => {
                    setIsAddExpenseOpen(false);
                    setExpensePrefill(undefined);
                }}
                prefillData={expensePrefill}
            />

            <AddIncomeModal isOpen={isAddIncomeOpen} onClose={() => setIsAddIncomeOpen(false)} />

            <SetGoalModal
                isOpen={isSetGoalOpen}
                onClose={() => setIsSetGoalOpen(false)}
                existingGoals={budgetGoals.map(g => ({ category: g.category, target_amount: g.target_amount }))}
            />

            <ScanBarcodeModal
                isOpen={isScanBarcodeOpen}
                onClose={() => setIsScanBarcodeOpen(false)}
                onProductScanned={handleBarcodeScanned}
            />
        </>
    );
}
