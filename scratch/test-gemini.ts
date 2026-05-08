import { GoogleGenerativeAI } from "@google/generative-ai";

async function test() {
  const apiKey = "AIzaSyCUJCXZ959uYgJ7Dh1MK3P5oD0KeY0T2hU";
  const genAI = new GoogleGenerativeAI(apiKey);
  
  try {
    console.log("Listing models...");
    // @ts-ignore
    const result = await genAI.listModels();
    console.log("Available models:", JSON.stringify(result, null, 2));
  } catch (e: any) {
    console.error("Error listing models:", e.message);
  }
}

test();
