"use server";

import { createClient } from "@/utils/supabase/server";

export interface BudgetGoal {
  id: string;
  user_id: string;
  category: string;
  target_amount: number;
  created_at: string;
  updated_at: string;
}

export async function getBudgetGoals(): Promise<BudgetGoal[]> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("budget_goals")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching budget goals:", error.message, error.code, error.details);
    return [];
  }

  return data || [];
}

export async function getBudgetGoalByCategory(category: string): Promise<BudgetGoal | null> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("budget_goals")
    .select("*")
    .eq("user_id", user.id)
    .eq("category", category)
    .single();

  if (error) {
    if (error.code !== "PGRST116") { // Not found error
      console.error("Error fetching budget goal:", error);
    }
    return null;
  }

  return data;
}

export async function upsertBudgetGoal(category: string, targetAmount: number): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "User not authenticated" };
  }

  const { error } = await supabase
    .from("budget_goals")
    .upsert(
      {
        user_id: user.id,
        category,
        target_amount: targetAmount,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,category",
      }
    );

  if (error) {
    console.error("Error upserting budget goal:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function deleteBudgetGoal(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "User not authenticated" };
  }

  const { error } = await supabase
    .from("budget_goals")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting budget goal:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function getSpentByCategory(): Promise<Record<string, number>> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return {};

  const { data, error } = await supabase
    .from("expenses")
    .select("category, amount")
    .eq("user_id", user.id);

  if (error) {
    console.error("Error fetching expenses by category:", error);
    return {};
  }

  const spentByCategory: Record<string, number> = {};
  for (const expense of data || []) {
    const category = expense.category || "Other";
    spentByCategory[category] = (spentByCategory[category] || 0) + Number(expense.amount);
  }

  return spentByCategory;
}
