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
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const prompt = `
      You are an AI expense tracking assistant. The user wants to log an expense.
      Extract the amount, description, and category from the user's message.
      
      Valid categories are ONLY: food, transportation, school, entertainment, shopping, utilities, health, other.
      Pick the closest valid category. If you can't determine one, use "other".
      
      Return ONLY a valid JSON object with no markdown formatting or backticks. 
      Format exactly like this:
      {
        "amount": 120.50,
        "description": "Lunch at Jollibee",
        "category": "food"
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
      return { error: "Sorry, I couldn't understand the expense details. Please try rephrasing (e.g., '120 on spaghetti for food')." };
    }

    if (!parsedData.amount || !parsedData.description || !parsedData.category) {
      return { error: "I'm missing some details. Please provide amount, what you bought, and category." };
    }

    // Insert into Supabase
    const { error: insertError } = await supabase
      .from("expenses")
      .insert({
        user_id: user.id,
        amount: Number(parsedData.amount),
        description: parsedData.description,
        category: parsedData.category.toLowerCase(),
      });

    if (insertError) {
      console.error("Supabase insert error:", insertError);
      return { error: "Failed to save the expense to the database." };
    }

    revalidatePath("/dashboard");
    revalidatePath("/expenses");
    
    // Format amount properly
    const formattedAmount = Number(parsedData.amount).toLocaleString("en-PH", {
      style: "currency",
      currency: "PHP"
    });

    return { 
      success: true, 
      message: `Added ${formattedAmount} for ${parsedData.description} under ${parsedData.category}.` 
    };

  } catch (error: any) {
    console.error("AI Chat Error:", error);
    return { error: "An unexpected error occurred while processing your request." };
  }
}
