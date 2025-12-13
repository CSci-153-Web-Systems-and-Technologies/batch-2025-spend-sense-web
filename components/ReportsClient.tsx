"use client";

import { useState, useMemo } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

type Expense = {
    id: string;
    amount: number;
    description: string;
    category: string;
    created_at: string;
};

type ReportsClientProps = {
    expenses: Expense[];
    totalBudget: number;
    totalSpent: number;
};

const CATEGORY_ICONS: Record<string, string> = {
    food: "🍽️",
    transportation: "🚌",
    school: "📓",
    entertainment: "🎬",
    shopping: "🛒",
    utilities: "💡",
    health: "💊",
    other: "📦",
};

const CATEGORY_LABELS: Record<string, string> = {
    food: "Food",
    transportation: "Transportation",
    school: "School",
    entertainment: "Entertainment",
    shopping: "Shopping",
    utilities: "Utilities",
    health: "Health",
    other: "Other",
};

const TIME_PERIODS = [
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "year", label: "This Year" },
];

const REPORT_TYPES = [
    { value: "summary", label: "Summary" },
    { value: "detailed", label: "Detailed" },
    { value: "category", label: "By Category" },
];

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

function getFilteredData(expenses: Expense[], timePeriod: string, categoryFilter: string) {
    const now = new Date();

    return expenses.filter((expense) => {
        const expenseDate = new Date(expense.created_at);

        // Time filter
        let inTimePeriod = false;
        switch (timePeriod) {
            case "week":
                const weekAgo = new Date(now);
                weekAgo.setDate(weekAgo.getDate() - 7);
                inTimePeriod = expenseDate >= weekAgo;
                break;
            case "month":
                inTimePeriod = expenseDate.getMonth() === now.getMonth() &&
                    expenseDate.getFullYear() === now.getFullYear();
                break;
            case "year":
                inTimePeriod = expenseDate.getFullYear() === now.getFullYear();
                break;
            default:
                inTimePeriod = true;
        }

        // Category filter
        const inCategory = !categoryFilter || expense.category === categoryFilter;

        return inTimePeriod && inCategory;
    });
}

function getChartData(expenses: Expense[], timePeriod: string) {
    const today = new Date();
    const days: { date: string; label: string; total: number }[] = [];
    const daysCount = timePeriod === "week" ? 7 : timePeriod === "month" ? 30 : 12;

    if (timePeriod === "year") {
        // Monthly data for year view
        for (let i = 11; i >= 0; i--) {
            const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const label = date.toLocaleDateString("en-US", { month: "short" });
            days.push({ date: `${date.getFullYear()}-${date.getMonth()}`, label, total: 0 });
        }

        expenses.forEach((expense) => {
            const expenseDate = new Date(expense.created_at);
            const key = `${expenseDate.getFullYear()}-${expenseDate.getMonth()}`;
            const day = days.find((d) => d.date === key);
            if (day) {
                day.total += Number(expense.amount);
            }
        });
    } else {
        for (let i = daysCount - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split("T")[0];
            const label = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
            days.push({ date: dateStr, label, total: 0 });
        }

        expenses.forEach((expense) => {
            const expenseDate = new Date(expense.created_at).toISOString().split("T")[0];
            const day = days.find((d) => d.date === expenseDate);
            if (day) {
                day.total += Number(expense.amount);
            }
        });
    }

    return days;
}

function getMostExpensiveCategory(expenses: Expense[]) {
    const categoryTotals: Record<string, number> = {};

    expenses.forEach((expense) => {
        const cat = expense.category || "other";
        categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(expense.amount);
    });

    let maxCategory = "other";
    let maxAmount = 0;

    Object.entries(categoryTotals).forEach(([category, amount]) => {
        if (amount > maxAmount) {
            maxCategory = category;
            maxAmount = amount;
        }
    });

    const total = Object.values(categoryTotals).reduce((a, b) => a + b, 0);
    const percentage = total > 0 ? ((maxAmount / total) * 100).toFixed(1) : 0;

    return { category: maxCategory, amount: maxAmount, percentage };
}

function getSpendingStreak(expenses: Expense[]) {
    if (expenses.length === 0) return 0;

    const sortedDates = [...new Set(
        expenses.map(e => new Date(e.created_at).toISOString().split("T")[0])
    )].sort().reverse();

    let streak = 0;
    const today = new Date().toISOString().split("T")[0];
    let checkDate = today;

    for (const date of sortedDates) {
        if (date === checkDate) {
            streak++;
            const prevDate = new Date(checkDate);
            prevDate.setDate(prevDate.getDate() - 1);
            checkDate = prevDate.toISOString().split("T")[0];
        } else if (date < checkDate) {
            break;
        }
    }

    return streak;
}

export default function ReportsClient({ expenses, totalBudget, totalSpent }: ReportsClientProps) {
    const [timePeriod, setTimePeriod] = useState("month");
    const [reportType, setReportType] = useState("summary");
    const [categoryFilter, setCategoryFilter] = useState("");

    const filteredExpenses = useMemo(() =>
        getFilteredData(expenses, timePeriod, categoryFilter),
        [expenses, timePeriod, categoryFilter]
    );

    const chartData = useMemo(() =>
        getChartData(filteredExpenses, timePeriod),
        [filteredExpenses, timePeriod]
    );

    const stats = useMemo(() => {
        const totals = chartData.map((d) => d.total);
        const totalAmount = totals.reduce((a, b) => a + b, 0);
        const daysWithData = totals.filter(t => t > 0).length || 1;
        const dailyAverage = Math.round(totalAmount / daysWithData);
        const highestDay = Math.max(...totals, 0);
        const transactionCount = filteredExpenses.length;

        // Get unique categories
        const categories = new Set(filteredExpenses.map(e => e.category));

        return { totalAmount, dailyAverage, highestDay, transactionCount, categoryCount: categories.size };
    }, [chartData, filteredExpenses]);

    const mostExpensive = useMemo(() =>
        getMostExpensiveCategory(filteredExpenses),
        [filteredExpenses]
    );

    const spendingStreak = useMemo(() =>
        getSpendingStreak(expenses),
        [expenses]
    );

    const budgetUsed = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
    const budgetRemaining = totalBudget - totalSpent;

    // Generate report data for export
    const generateReportData = () => {
        return filteredExpenses.map((expense) => ({
            Date: new Date(expense.created_at).toLocaleDateString("en-PH"),
            Description: expense.description,
            Category: CATEGORY_LABELS[expense.category] || expense.category,
            Amount: expense.amount,
        }));
    };

    // Export as PDF
    const exportAsPDF = () => {
        const doc = new jsPDF();
        const reportData = generateReportData();

        // Title
        doc.setFontSize(20);
        doc.setTextColor(34, 197, 94); // Green color
        doc.text("SpendSense Report", 14, 22);

        // Subtitle
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text(`Generated on ${new Date().toLocaleDateString("en-PH")}`, 14, 30);
        doc.text(`Period: ${TIME_PERIODS.find(p => p.value === timePeriod)?.label || "All Time"}`, 14, 36);

        // Summary stats
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.text(`Total Expenses: ₱${stats.totalAmount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`, 14, 48);
        doc.text(`Daily Average: ₱${stats.dailyAverage.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`, 14, 54);
        doc.text(`Total Transactions: ${stats.transactionCount}`, 14, 60);
        doc.text(`Budget Used: ${budgetUsed}%`, 14, 66);

        // Table
        autoTable(doc, {
            startY: 75,
            head: [["Date", "Description", "Category", "Amount (₱)"]],
            body: reportData.map((row) => [
                row.Date,
                row.Description,
                row.Category,
                row.Amount.toLocaleString("en-PH", { minimumFractionDigits: 2 }),
            ]),
            headStyles: { fillColor: [34, 197, 94] },
            alternateRowStyles: { fillColor: [245, 245, 245] },
        });

        doc.save(`spendsense-report-${new Date().toISOString().split("T")[0]}.pdf`);
    };

    // Export as Excel
    const exportAsExcel = () => {
        const reportData = generateReportData();

        // Add summary row at the top
        const summaryData = [
            { Date: "SUMMARY", Description: "", Category: "", Amount: "" },
            { Date: "Total Expenses", Description: "", Category: "", Amount: stats.totalAmount },
            { Date: "Daily Average", Description: "", Category: "", Amount: stats.dailyAverage },
            { Date: "Transactions", Description: "", Category: "", Amount: stats.transactionCount },
            { Date: "", Description: "", Category: "", Amount: "" },
            { Date: "TRANSACTIONS", Description: "", Category: "", Amount: "" },
        ];

        const allData = [...summaryData, ...reportData];

        const ws = XLSX.utils.json_to_sheet(allData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Expenses Report");

        // Auto-size columns
        const colWidths = [
            { wch: 12 }, // Date
            { wch: 30 }, // Description
            { wch: 15 }, // Category
            { wch: 15 }, // Amount
        ];
        ws["!cols"] = colWidths;

        XLSX.writeFile(wb, `spendsense-report-${new Date().toISOString().split("T")[0]}.xlsx`);
    };

    // Export as CSV
    const exportAsCSV = () => {
        const reportData = generateReportData();

        const headers = ["Date", "Description", "Category", "Amount"];
        const csvRows = [
            headers.join(","),
            ...reportData.map((row) =>
                [
                    row.Date,
                    `"${row.Description.replace(/"/g, '""')}"`,
                    row.Category,
                    row.Amount,
                ].join(",")
            ),
        ];

        const csvContent = csvRows.join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `spendsense-report-${new Date().toISOString().split("T")[0]}.csv`;
        link.click();
    };

    // Print report
    const printReport = () => {
        const printWindow = window.open("", "_blank");
        if (!printWindow) {
            alert("Please allow popups to print the report");
            return;
        }

        const reportData = generateReportData();

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>SpendSense Report</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    h1 { color: #22C55E; }
                    .summary { margin-bottom: 20px; padding: 15px; background: #f5f5f5; border-radius: 8px; }
                    .summary p { margin: 5px 0; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
                    th { background: #22C55E; color: white; }
                    tr:nth-child(even) { background: #f9f9f9; }
                    .amount { text-align: right; }
                    @media print {
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <h1>SpendSense Report</h1>
                <p>Generated on ${new Date().toLocaleDateString("en-PH")}</p>
                <p>Period: ${TIME_PERIODS.find(p => p.value === timePeriod)?.label || "All Time"}</p>
                
                <div class="summary">
                    <p><strong>Total Expenses:</strong> ₱${stats.totalAmount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</p>
                    <p><strong>Daily Average:</strong> ₱${stats.dailyAverage.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</p>
                    <p><strong>Total Transactions:</strong> ${stats.transactionCount}</p>
                    <p><strong>Budget Used:</strong> ${budgetUsed}%</p>
                </div>
                
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Description</th>
                            <th>Category</th>
                            <th class="amount">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${reportData.map((row) => `
                            <tr>
                                <td>${row.Date}</td>
                                <td>${row.Description}</td>
                                <td>${row.Category}</td>
                                <td class="amount">₱${row.Amount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
                
                <script>
                    window.onload = function() { window.print(); }
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    const handleExport = (format: string) => {
        switch (format) {
            case "PDF":
                exportAsPDF();
                break;
            case "Excel":
                exportAsExcel();
                break;
            case "CSV":
                exportAsCSV();
                break;
            case "Print":
                printReport();
                break;
            default:
                alert(`Unknown format: ${format}`);
        }
    };

    const handleGenerateReport = () => {
        // Show a toast/notification that report is generated
        alert(`Report generated for ${TIME_PERIODS.find(p => p.value === timePeriod)?.label}!\n\nTotal: ₱${stats.totalAmount.toLocaleString()}\nTransactions: ${stats.transactionCount}`);
    };

    return (
        <>
            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Time Period</label>
                    <select
                        value={timePeriod}
                        onChange={(e) => setTimePeriod(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    >
                        {TIME_PERIODS.map((period) => (
                            <option key={period.value} value={period.value}>
                                {period.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Report Type</label>
                    <select
                        value={reportType}
                        onChange={(e) => setReportType(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    >
                        {REPORT_TYPES.map((type) => (
                            <option key={type.value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Category Filter</label>
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    >
                        {CATEGORIES.map((cat) => (
                            <option key={cat.value} value={cat.value}>
                                {cat.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex items-end">
                    <button
                        onClick={handleGenerateReport}
                        className="w-full px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition cursor-pointer"
                    >
                        Generate Report
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-green-500 rounded-xl p-5 text-white shadow-md">
                    <p className="text-2xl font-bold drop-shadow-sm">₱{stats.totalAmount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</p>
                    <p className="text-white font-medium text-sm">Total Expenses</p>
                    <p className="text-green-100 text-xs mt-1">+12% from last month</p>
                </div>
                <div className="bg-yellow-500 rounded-xl p-5 text-white shadow-md">
                    <p className="text-2xl font-bold drop-shadow-sm">₱{stats.dailyAverage.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</p>
                    <p className="text-white font-medium text-sm">Daily Average</p>
                    <p className="text-yellow-100 text-xs mt-1">-5% from last month</p>
                </div>
                <div className="bg-teal-500 rounded-xl p-5 text-white shadow-md">
                    <p className="text-2xl font-bold drop-shadow-sm">₱{stats.highestDay.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</p>
                    <p className="text-white font-medium text-sm">Highest Single Day</p>
                    <p className="text-teal-100 text-xs mt-1">{mostExpensive.category ? CATEGORY_LABELS[mostExpensive.category] || mostExpensive.category : "N/A"}</p>
                </div>
                <div className="bg-purple-500 rounded-xl p-5 text-white shadow-md">
                    <p className="text-2xl font-bold drop-shadow-sm">{stats.transactionCount}</p>
                    <p className="text-white font-medium text-sm">Total Transactions</p>
                    <p className="text-purple-100 text-xs mt-1">Across {stats.categoryCount} categories</p>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Spending Trends Chart */}
                <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Spending Trends</h2>

                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <XAxis
                                    dataKey="label"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: "#9CA3AF" }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: "#9CA3AF" }}
                                    tickFormatter={(value) => `₱${value}`}
                                />
                                <Tooltip
                                    formatter={(value: number) => [`₱${value.toLocaleString()}`, "Spent"]}
                                    contentStyle={{ borderRadius: "8px", border: "1px solid #E5E7EB" }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="total"
                                    stroke="#22C55E"
                                    strokeWidth={2}
                                    dot={{ fill: "#22C55E", strokeWidth: 2, r: 4 }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Stats below chart */}
                    <div className="grid grid-cols-3 gap-4 mt-6 text-center border-t border-gray-100 pt-6">
                        <div>
                            <p className="text-2xl font-bold text-gray-900">₱{stats.dailyAverage.toLocaleString()}</p>
                            <p className="text-sm text-gray-600 font-medium">Daily Average</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">₱{stats.totalAmount.toLocaleString()}</p>
                            <p className="text-sm text-gray-600 font-medium">Total {TIME_PERIODS.find(p => p.value === timePeriod)?.label}</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">₱{stats.highestDay.toLocaleString()}</p>
                            <p className="text-sm text-gray-600 font-medium">Highest single day</p>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                    {/* Most Expensive Category */}
                    <div className="bg-white rounded-xl p-5 shadow-sm text-center border border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-800 mb-3">Most Expensive Category</h3>
                        <div className="text-4xl mb-2">{CATEGORY_ICONS[mostExpensive.category] || "📦"}</div>
                        <p className="text-lg font-bold text-gray-900">{CATEGORY_LABELS[mostExpensive.category] || "Other"}</p>
                        <p className="text-sm text-gray-600">₱{mostExpensive.amount.toLocaleString()} · {mostExpensive.percentage}%</p>
                    </div>

                    {/* Spending Streak */}
                    <div className="bg-white rounded-xl p-5 shadow-sm text-center border border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-800 mb-3">Spending Streak</h3>
                        <div className="text-3xl mb-2">🌙</div>
                        <p className="text-2xl font-bold text-gray-900">{spendingStreak} Days</p>
                        <p className="text-sm text-gray-600">Consistent Tracking</p>
                    </div>

                    {/* Budget Status */}
                    <div className="bg-purple-50 rounded-xl p-5 shadow-sm text-center border-2 border-purple-200">
                        <h3 className="text-sm font-semibold text-gray-800 mb-3">Budget Status</h3>
                        <div className="w-12 h-12 mx-auto mb-2 rounded-full border-4 border-purple-400 flex items-center justify-center bg-white">
                            <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <p className="text-xl font-bold text-gray-900">{budgetUsed}% used</p>
                        <p className="text-sm text-gray-600">₱{budgetRemaining.toLocaleString()} remaining</p>
                    </div>
                </div>
            </div>

            {/* Export Reports */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">Export Reports</h2>
                <p className="text-gray-500 text-sm mb-4">Download your spending reports in various formats.</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <button
                        onClick={() => handleExport("PDF")}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium cursor-pointer"
                    >
                        Export as PDF
                    </button>
                    <button
                        onClick={() => handleExport("Excel")}
                        className="px-4 py-2 border border-green-500 text-green-600 rounded-lg hover:bg-green-50 transition font-medium cursor-pointer"
                    >
                        Export as Excel
                    </button>
                    <button
                        onClick={() => handleExport("CSV")}
                        className="px-4 py-2 border border-orange-400 text-orange-500 rounded-lg hover:bg-orange-50 transition font-medium cursor-pointer"
                    >
                        Export as CSV
                    </button>
                    <button
                        onClick={() => handleExport("Print")}
                        className="px-4 py-2 border border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 transition font-medium cursor-pointer"
                    >
                        Print Report
                    </button>
                </div>
            </div>
        </>
    );
}
