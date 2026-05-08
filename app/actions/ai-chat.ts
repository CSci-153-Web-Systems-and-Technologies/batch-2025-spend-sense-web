"use server";

import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// Schema for AI-parsed expense/income data
const transactionSchema = z.object({
  type: z.enum(["expense", "income"]),
  amount: z.number().positive(),
  description: z.string(),
  category: z.string(),
});

export async function processChatExpense(message: string) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "You must be logged in to use the AI assistant." };
    }

    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      return { error: "GEMINI_API_KEY is not set. Please configure it in your environment variables." };
    }

    try {
      const result = await generateObject({
        model: google("gemini-2.5-flash"),
        schema: transactionSchema,
        prompt: `You are an AI financial assistant for SpendSense. The user wants to log either an expense or an income.
        
Extract the type (expense or income), amount, description, and category/source from their message.

Valid EXPENSE categories: food, transportation, school, entertainment, shopping, utilities, health, other.
Valid INCOME sources: salary, allowance, freelance, business, gift, refund, investment, other.

User message: "${message}"`,
      });

      const parsedData = result.object;

      if (!parsedData.amount || !parsedData.description || !parsedData.category) {
        return { error: "I'm missing some details. Please provide the amount and what it's for." };
      }

      const type = parsedData.type === 'income' ? 'income' : 'expense';

      if (type === 'expense') {
        const { error: insertError } = await supabase
          .from("expenses")
          .insert({
            user_id: user.id,
            amount: Number(parsedData.amount),
            description: parsedData.description,
            category: parsedData.category.toLowerCase(),
          });

        if (insertError) return { error: `Database error (Expense): ${insertError.message}` };
      } else {
        const { error: insertError } = await supabase
          .from("income")
          .insert({
            user_id: user.id,
            amount: Number(parsedData.amount),
            description: parsedData.description,
            source: parsedData.category.toLowerCase(),
          });

        if (insertError) return { error: `Database error (Income): ${insertError.message}` };
      }

      revalidatePath("/dashboard");
      revalidatePath("/expenses");
      
      const formattedAmount = Number(parsedData.amount).toLocaleString("en-PH", {
        style: "currency",
        currency: "PHP"
      });

      return { 
        success: true, 
        message: `Successfully added ${type}: ${formattedAmount} for ${parsedData.description} (${parsedData.category}).` 
      };
    } catch (aiError: any) {
      console.error("AI generation error:", aiError);
      
      // Provide user-friendly error messaging
      if (aiError?.message?.includes("401")) {
        return { error: "AI authentication failed. Check that GEMINI_API_KEY is valid and the Generative Language API is enabled in Google Cloud." };
      }
      if (aiError?.message?.includes("429")) {
        return { error: "AI rate limit exceeded. Please try again in a moment." };
      }
      if (aiError?.message?.includes("not found") || aiError?.message?.includes("not available")) {
        return { error: "Gemini model unavailable. Ensure the Generative Language API is enabled in Google Cloud Console." };
      }
      
      return { error: `AI Error: ${aiError.message || "Failed to process your request"}` };
    }
  } catch (error: any) {
    console.error("AI Chat Error:", error);
    return { error: `Error: ${error.message || "Authentication or connection failed"}` };
  }
}
