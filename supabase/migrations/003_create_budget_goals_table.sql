-- Create budget_goals table
CREATE TABLE IF NOT EXISTS budget_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  target_amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, category)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS budget_goals_user_id_idx ON budget_goals(user_id);

-- Enable Row Level Security
ALTER TABLE budget_goals ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own budget goals" ON budget_goals;
DROP POLICY IF EXISTS "Users can insert their own budget goals" ON budget_goals;
DROP POLICY IF EXISTS "Users can update their own budget goals" ON budget_goals;
DROP POLICY IF EXISTS "Users can delete their own budget goals" ON budget_goals;

-- Create policies
CREATE POLICY "Users can view their own budget goals"
  ON budget_goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own budget goals"
  ON budget_goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budget goals"
  ON budget_goals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budget goals"
  ON budget_goals FOR DELETE
  USING (auth.uid() = user_id);
