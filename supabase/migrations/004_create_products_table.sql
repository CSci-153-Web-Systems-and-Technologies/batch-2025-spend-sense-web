-- Create products table for user-specific product storage
-- Each user can have their own products with custom prices
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  barcode TEXT NOT NULL,
  name TEXT NOT NULL,
  price DECIMAL(10, 2),
  category TEXT NOT NULL DEFAULT 'food',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Each user can only have one entry per barcode
  UNIQUE(user_id, barcode)
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS products_user_id_idx ON products(user_id);
CREATE INDEX IF NOT EXISTS products_barcode_idx ON products(barcode);
CREATE INDEX IF NOT EXISTS products_user_barcode_idx ON products(user_id, barcode);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view products" ON products;
DROP POLICY IF EXISTS "Authenticated users can insert products" ON products;
DROP POLICY IF EXISTS "Authenticated users can update products" ON products;
DROP POLICY IF EXISTS "Authenticated users can delete products" ON products;
DROP POLICY IF EXISTS "Users can view their own products" ON products;
DROP POLICY IF EXISTS "Users can insert their own products" ON products;
DROP POLICY IF EXISTS "Users can update their own products" ON products;
DROP POLICY IF EXISTS "Users can delete their own products" ON products;

-- Create RLS policies - users can only access their own products
CREATE POLICY "Users can view their own products"
  ON products FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own products"
  ON products FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own products"
  ON products FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own products"
  ON products FOR DELETE
  USING (auth.uid() = user_id);
