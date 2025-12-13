"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export type Expense = {
  id: string;
  user_id: string;
  amount: number;
  description: string;
  category: string;
  created_at: string;
};

export type Budget = {
  id: string;
  user_id: string;
  amount: number;
  month: number;
  year: number;
};

// Get all expenses for the current user
export async function getExpenses() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", expenses: [] };
  }

  const { data: expenses, error } = await supabase
    .from("expenses")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return { error: error.message, expenses: [] };
  }

  return { expenses: expenses || [], error: null };
}

// Get recent expenses (last 5)
export async function getRecentExpenses(limit: number = 5) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", expenses: [] };
  }

  const { data: expenses, error } = await supabase
    .from("expenses")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return { error: error.message, expenses: [] };
  }

  return { expenses: expenses || [], error: null };
}

// Get total spent for current month
export async function getTotalSpent() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", total: 0 };
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const { data: expenses, error } = await supabase
    .from("expenses")
    .select("amount")
    .eq("user_id", user.id)
    .gte("created_at", startOfMonth.toISOString())
    .lte("created_at", endOfMonth.toISOString());

  if (error) {
    return { error: error.message, total: 0 };
  }

  const total = expenses?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0;
  return { total, error: null };
}

// Add a new expense
export async function addExpense(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const amount = parseFloat(formData.get("amount") as string);
  const description = formData.get("description") as string;
  const category = formData.get("category") as string;

  if (!amount || !description || !category) {
    return { error: "All fields are required" };
  }

  const { error } = await supabase
    .from("expenses")
    .insert({
      user_id: user.id,
      amount,
      description,
      category,
    });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/expenses");
  return { success: true, error: null };
}

// Delete an expense
export async function deleteExpense(expenseId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("expenses")
    .delete()
    .eq("id", expenseId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/expenses");
  return { success: true, error: null };
}

// Get or create budget for current month
export async function getBudget() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", budget: null };
  }

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  // Try to get existing budget
  let { data: budget, error } = await supabase
    .from("budgets")
    .select("*")
    .eq("user_id", user.id)
    .eq("month", month)
    .eq("year", year)
    .single();

  if (error && error.code === "PGRST116") {
    // Budget doesn't exist, create default one
    const { data: newBudget, error: insertError } = await supabase
      .from("budgets")
      .insert({
        user_id: user.id,
        amount: 10000,
        month,
        year,
      })
      .select()
      .single();

    if (insertError) {
      return { error: insertError.message, budget: null };
    }

    return { budget: newBudget, error: null };
  }

  if (error) {
    return { error: error.message, budget: null };
  }

  return { budget, error: null };
}

// Update budget
export async function updateBudget(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const amount = parseFloat(formData.get("amount") as string);

  if (!amount || amount <= 0) {
    return { error: "Invalid budget amount" };
  }

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const { error } = await supabase
    .from("budgets")
    .upsert({
      user_id: user.id,
      amount,
      month,
      year,
    }, {
      onConflict: "user_id,month,year",
    });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return { success: true, error: null };
}
