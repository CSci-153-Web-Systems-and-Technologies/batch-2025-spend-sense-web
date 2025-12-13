"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Expense = {
  id: string;
  amount: number;
  created_at: string;
};

type SpendingTrendsProps = {
  expenses: Expense[];
};

// Get last 7 days data from expenses
function getLast7DaysData(expenses: Expense[]) {
  const today = new Date();
  const days: { date: string; label: string; total: number }[] = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    const label = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    days.push({ date: dateStr, label, total: 0 });
  }

  // Sum expenses per day
  expenses.forEach((expense) => {
    const expenseDate = new Date(expense.created_at).toISOString().split("T")[0];
    const day = days.find((d) => d.date === expenseDate);
    if (day) {
      day.total += Number(expense.amount);
    }
  });

  return days;
}

export default function SpendingTrends({ expenses }: SpendingTrendsProps) {
  const data = getLast7DaysData(expenses);
  
  const totals = data.map((d) => d.total);
  const totalWeek = totals.reduce((a, b) => a + b, 0);
  const dailyAverage = Math.round(totalWeek / 7);
  const highestDay = Math.max(...totals);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Spending Trends</h2>
      
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
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

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6 text-center">
        <div>
          <p className="text-2xl font-bold text-gray-800">₱{dailyAverage.toLocaleString()}</p>
          <p className="text-sm text-gray-500">Daily Average</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-800">₱{totalWeek.toLocaleString()}</p>
          <p className="text-sm text-gray-500">Total Week</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-800">₱{highestDay.toLocaleString()}</p>
          <p className="text-sm text-gray-500">Highest single day</p>
        </div>
      </div>
    </div>
  );
}
