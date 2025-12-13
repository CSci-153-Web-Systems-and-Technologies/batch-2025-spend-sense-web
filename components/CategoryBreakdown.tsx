"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

type Expense = {
  id: string;
  amount: number;
  category: string;
};

type CategoryBreakdownProps = {
  expenses: Expense[];
};

const COLORS: Record<string, string> = {
  food: "#EF4444",
  transportation: "#3B82F6",
  school: "#6B7280",
  entertainment: "#EAB308",
  shopping: "#EC4899",
  utilities: "#F97316",
  health: "#22C55E",
  other: "#F59E0B",
};

const LABELS: Record<string, string> = {
  food: "Food",
  transportation: "Transportation",
  school: "School",
  entertainment: "Entertainment",
  shopping: "Shopping",
  utilities: "Utilities",
  health: "Health",
  other: "Other",
};

function getCategoryData(expenses: Expense[]) {
  const categoryTotals: Record<string, number> = {};

  expenses.forEach((expense) => {
    const cat = expense.category || "other";
    categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(expense.amount);
  });

  return Object.entries(categoryTotals).map(([category, amount]) => ({
    category,
    name: LABELS[category] || category,
    value: amount,
    color: COLORS[category] || COLORS.other,
  }));
}

export default function CategoryBreakdown({ expenses }: CategoryBreakdownProps) {
  const data = getCategoryData(expenses);
  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Category Breakdown</h2>
        <div className="text-center py-8 text-gray-400">
          <p>No expenses to display.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Category Breakdown</h2>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              dataKey="value"
              label={({ percent }) => `${((percent ?? 0) * 100).toFixed(1)}%`}
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-4 space-y-2">
        {data.map((item) => (
          <div key={item.category} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-gray-600">{item.name}</span>
            </div>
            <span className="font-medium text-gray-800">
              ₱{item.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
