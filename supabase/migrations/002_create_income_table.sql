-- Create income table
CREATE TABLE IF NOT EXISTS income (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT NOT NULL,
  source TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS income_user_id_idx ON income(user_id);
CREATE INDEX IF NOT EXISTS income_created_at_idx ON income(created_at);

-- Enable Row Level Security
ALTER TABLE income ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own income" ON income;
DROP POLICY IF EXISTS "Users can insert their own income" ON income;
DROP POLICY IF EXISTS "Users can update their own income" ON income;
DROP POLICY IF EXISTS "Users can delete their own income" ON income;

-- Create policy for users to only see their own income
CREATE POLICY "Users can view their own income"
  ON income FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy for users to insert their own income
CREATE POLICY "Users can insert their own income"
  ON income FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy for users to update their own income
CREATE POLICY "Users can update their own income"
  ON income FOR UPDATE
  USING (auth.uid() = user_id);

-- Create policy for users to delete their own income
CREATE POLICY "Users can delete their own income"
  ON income FOR DELETE
  USING (auth.uid() = user_id);
