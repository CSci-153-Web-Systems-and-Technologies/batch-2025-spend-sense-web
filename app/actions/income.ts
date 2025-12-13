"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export type Income = {
  id: string;
  user_id: string;
  amount: number;
  description: string;
  source: string;
  created_at: string;
};

// Get all income for the current user
export async function getAllIncome() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: "Not authenticated", income: [] };
  }

  const { data: income, error } = await supabase
    .from("income")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return { error: error.message, income: [] };
  }

  return { income: income || [], error: null };
}

// Get recent income (last 5)
export async function getRecentIncome(limit: number = 5) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: "Not authenticated", income: [] };
  }

  const { data: income, error } = await supabase
    .from("income")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return { error: error.message, income: [] };
  }

  return { income: income || [], error: null };
}

// Get total income for current month
export async function getTotalIncome() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: "Not authenticated", total: 0 };
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const { data: income, error } = await supabase
    .from("income")
    .select("amount")
    .eq("user_id", user.id)
    .gte("created_at", startOfMonth.toISOString())
    .lte("created_at", endOfMonth.toISOString());

  if (error) {
    return { error: error.message, total: 0 };
  }

  const total = income?.reduce((sum, inc) => sum + Number(inc.amount), 0) || 0;
  return { total, error: null };
}

// Add a new income
export async function addIncome(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: "Not authenticated" };
  }

  const amount = parseFloat(formData.get("amount") as string);
  const description = formData.get("description") as string;
  const source = formData.get("source") as string;

  if (!amount || !description || !source) {
    return { error: "All fields are required" };
  }

  const { error } = await supabase
    .from("income")
    .insert({
      user_id: user.id,
      amount,
      description,
      source,
    });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return { success: true, error: null };
}

// Delete an income
export async function deleteIncome(incomeId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("income")
    .delete()
    .eq("id", incomeId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return { success: true, error: null };
}
