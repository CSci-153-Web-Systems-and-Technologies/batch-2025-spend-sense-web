"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function processChatExpense(message: string) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: "You must be logged in to use the AI assistant." };
    }

    if (!process.env.GEMINI_API_KEY) {
      return { error: "GEMINI_API_KEY is not set. Please configure it in your environment variables." };
    }

    // Call Gemini to parse the message
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `
      You are an AI financial assistant for SpendSense. The user wants to log either an expense or an income.
      Extract the type (expense or income), amount, description, and category/source.
      
      Valid EXPENSE categories: food, transportation, school, entertainment, shopping, utilities, health, other.
      Valid INCOME sources: salary, allowance, freelance, business, gift, refund, investment, other.
      
      Return ONLY a valid JSON object with no markdown formatting or backticks. 
      Format exactly like this:
      {
        "type": "expense",
        "amount": 120.50,
        "description": "Lunch at Jollibee",
        "category": "food"
      }
      OR
      {
        "type": "income",
        "amount": 5000,
        "description": "Monthly Salary",
        "category": "salary"
      }
      
      User message: "${message}"
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Clean up potential markdown formatting from the response
    const jsonString = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    let parsedData;
    try {
      parsedData = JSON.parse(jsonString);
    } catch (e) {
      console.error("Failed to parse JSON from AI:", responseText);
      return { error: "Sorry, I couldn't understand that. Try something like '120 on lunch' or 'Received 5000 from work'." };
    }

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

      if (insertError) return { error: "Failed to save the expense." };
    } else {
      const { error: insertError } = await supabase
        .from("income")
        .insert({
          user_id: user.id,
          amount: Number(parsedData.amount),
          description: parsedData.description,
          source: parsedData.category.toLowerCase(),
        });

      if (insertError) return { error: "Failed to save the income." };
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

  } catch (error: any) {
    console.error("AI Chat Error:", error);
    return { error: "An unexpected error occurred while processing your request." };
  }
}
