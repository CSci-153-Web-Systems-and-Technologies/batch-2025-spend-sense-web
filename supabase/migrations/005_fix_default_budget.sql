-- Fix: Change default budget amount from 10000 to 0 for NEW accounts only
-- Do NOT modify existing accounts' budgets

-- Update the column default (only affects future inserts)
ALTER TABLE budgets ALTER COLUMN amount SET DEFAULT 0.00;
