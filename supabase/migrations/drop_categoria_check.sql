-- ============================================
-- Fix: Drop outdated prodotti_categoria_check constraint
-- Run this in Supabase SQL Editor
-- ============================================

-- The categoria field is legacy and now we use category_id (FK to categories table)
-- The CHECK constraint is too restrictive and doesn't match current category slugs
-- Drop the constraint to allow any value in categoria field

ALTER TABLE public.prodotti 
DROP CONSTRAINT IF EXISTS prodotti_categoria_check;

-- Optionally, you could make categoria nullable since category_id is the source of truth
-- ALTER TABLE public.prodotti ALTER COLUMN categoria DROP NOT NULL;
