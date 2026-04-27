-- Query to find the CHECK constraint definition
-- Run this in Supabase SQL Editor

SELECT 
    conname AS constraint_name,
    pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conname = 'prodotti_categoria_check'
  AND conrelid = 'public.prodotti'::regclass;
