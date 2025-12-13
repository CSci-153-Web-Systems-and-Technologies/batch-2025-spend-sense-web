"use server";

import { createClient } from "@/utils/supabase/server";

export interface Product {
  id: string;
  user_id: string;
  barcode: string;
  name: string;
  price: number | null;
  category: string;
  created_at: string;
  updated_at: string;
}

export interface OpenFoodFactsProduct {
  barcode: string;
  name: string;
  brand?: string;
  category?: string;
  image_url?: string;
}

export interface LookupResult {
  product: {
    barcode: string;
    name: string;
    price: number | null;
    category: string;
  } | null;
  source: "user" | "openfoodfacts" | null;
}

// Fetch product from Open Food Facts API (v2)
export async function fetchFromOpenFoodFacts(barcode: string): Promise<OpenFoodFactsProduct | null> {
  try {
    // Using v2 API with field selection for better performance
    const response = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${barcode}?fields=code,product_name,brands,categories_tags_en,image_url`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    
    // v2 API uses status: 1 for found products
    if (data.status !== 1 || !data.product) {
      return null;
    }
    
    const product = data.product;
    
    return {
      barcode,
      name: product.product_name || "Unknown Product",
      brand: product.brands,
      category: "food", // Default to food for Open Food Facts products
      image_url: product.image_url,
    };
  } catch (error) {
    console.error("Error fetching from Open Food Facts:", error);
    return null;
  }
}

// Look up product - first check user's saved products, then Open Food Facts
export async function lookupProduct(barcode: string): Promise<LookupResult> {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user) {
    // First check user's saved products
    const { data: userProduct } = await supabase
      .from("products")
      .select("*")
      .eq("user_id", user.id)
      .eq("barcode", barcode)
      .single();
    
    if (userProduct) {
      return {
        product: {
          barcode: userProduct.barcode,
          name: userProduct.name,
          price: userProduct.price,
          category: userProduct.category,
        },
        source: "user",
      };
    }
  }
  
  // Try Open Food Facts API
  const offProduct = await fetchFromOpenFoodFacts(barcode);
  if (offProduct) {
    return {
      product: {
        barcode: offProduct.barcode,
        name: offProduct.name,
        price: null, // No price from API
        category: offProduct.category || "food",
      },
      source: "openfoodfacts",
    };
  }
  
  return { product: null, source: null };
}

// Save or update a product for the current user
export async function saveUserProduct(
  barcode: string,
  name: string,
  price: number,
  category: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("products")
    .upsert({
      user_id: user.id,
      barcode,
      name,
      price,
      category,
      updated_at: new Date().toISOString(),
    }, { 
      onConflict: "user_id,barcode",
    });

  if (error) {
    console.error("Error saving product:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// Get all products for the current user
export async function getUserProducts(): Promise<Product[]> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("user_id", user.id)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching products:", error.message);
    return [];
  }

  return data || [];
}

// Delete a user's product
export async function deleteUserProduct(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting product:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true };
}
