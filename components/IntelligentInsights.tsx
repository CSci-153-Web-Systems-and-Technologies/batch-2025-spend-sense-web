"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

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

type IntelligentInsightsProps = {
  expenses: Expense[];
  budgetGoals: BudgetGoal[];
  totalBudget: number;
  totalSpent: number;
};

export default function IntelligentInsights({
  expenses,
  budgetGoals,
  totalBudget,
  totalSpent,
}: IntelligentInsightsProps) {
  const insights = useMemo(() => {
    const alerts: Array<{ id: string; type: 'warning' | 'success' | 'info'; title: string; message: string; icon: string }> = [];

    // 1. Overspending Risk
    const spentByCategory: Record<string, number> = {};
    expenses.forEach(exp => {
      spentByCategory[exp.category] = (spentByCategory[exp.category] || 0) + exp.amount;
    });

    budgetGoals.forEach(goal => {
      const spent = spentByCategory[goal.category] || 0;
      if (spent > goal.target_amount) {
        alerts.push({
          id: `over-${goal.category}`,
          type: 'warning',
          title: 'Overspending Alert',
          message: `You overspent on ${goal.category} this month by ₱${(spent - goal.target_amount).toLocaleString()}.`,
          icon: '⚠️'
        });
      } else if (spent > goal.target_amount * 0.9) {
         alerts.push({
          id: `risk-${goal.category}`,
          type: 'warning',
          title: 'Nearing Budget Limit',
          message: `You are close to exceeding your ${goal.category} budget. ₱${(goal.target_amount - spent).toLocaleString()} left.`,
          icon: '📉'
        });
      }
    });

    // 2. Weekend Spending Behavior
    let weekendSpent = 0;
    let weekdaySpent = 0;
    let weekendCount = 0;
    let weekdayCount = 0;

    expenses.forEach(exp => {
      const date = new Date(exp.created_at);
      const day = date.getDay(); // 0 is Sunday, 6 is Saturday
      if (day === 0 || day === 6) {
        weekendSpent += exp.amount;
        weekendCount++;
      } else {
        weekdaySpent += exp.amount;
        weekdayCount++;
      }
    });

    // Average per day (rough estimate to find behavioral patterns)
    // Avoid division by zero
    const avgWeekend = weekendCount > 0 ? weekendSpent / Math.max(1, weekendCount) : 0; 
    const avgWeekday = weekdayCount > 0 ? weekdaySpent / Math.max(1, weekdayCount) : 0; 

    // If average spend per weekend transaction is much higher, or total weekend spend is huge
    if (avgWeekend > avgWeekday * 1.5 && weekendSpent > 0) {
      alerts.push({
        id: 'weekend-behavior',
        type: 'info',
        title: 'Behavior Insight',
        message: 'You usually spend more on weekends. Consider planning weekend activities in advance to save.',
        icon: '💡'
      });
    }

    // 3. Savings Projection & End of Month Balance
    const now = new Date();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const daysInMonth = endOfMonth.getDate();
    const currentDay = Math.max(1, now.getDate()); // ensure at least 1
    const remainingDays = Math.max(1, daysInMonth - currentDay);

    // Daily run rate
    const dailyRunRate = totalSpent / currentDay;
    const projectedTotalSpend = totalSpent + (dailyRunRate * remainingDays);
    const projectedRemaining = totalBudget - projectedTotalSpend;

    if (totalBudget > 0) {
      if (projectedRemaining > 0) {
         alerts.push({
          id: 'savings-projection',
          type: 'success',
          title: 'On Track!',
          message: `Keep this pace and you'll save around ₱${Math.round(projectedRemaining).toLocaleString()} by the end of the month!`,
          icon: '🎉'
        });
      } else if (projectedRemaining < 0 && totalSpent < totalBudget) {
         const neededDailyRate = (totalBudget - totalSpent) / remainingDays;
         if (neededDailyRate > 0) {
            alerts.push({
              id: 'savings-adjustment',
              type: 'warning',
              title: 'Action Needed',
              message: `You are projected to overspend. Try to limit daily spending to ₱${Math.round(neededDailyRate).toLocaleString()} to stay within budget.`,
              icon: '🎯'
            });
         }
      }
    }

    // Sort by type: warning first, then info, then success
    const typeOrder = { warning: 0, info: 1, success: 2 };
    alerts.sort((a, b) => typeOrder[a.type] - typeOrder[b.type]);

    return alerts;
  }, [expenses, budgetGoals, totalBudget, totalSpent]);

  if (insights.length === 0) return null;

  return (
    <div className="mb-6 space-y-3">
      {insights.slice(0, 2).map((insight, index) => (
        <motion.div
          key={insight.id}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`flex items-start gap-4 p-4 rounded-2xl border backdrop-blur-md shadow-sm ${
            insight.type === 'warning' ? 'bg-orange-50/80 border-orange-200 text-orange-800' :
            insight.type === 'success' ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800' :
            'bg-indigo-50/80 border-indigo-200 text-indigo-800'
          }`}
        >
          <div className="text-2xl mt-0.5">{insight.icon}</div>
          <div>
            <h4 className="font-semibold text-sm">{insight.title}</h4>
            <p className="text-sm opacity-90 mt-0.5">{insight.message}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
