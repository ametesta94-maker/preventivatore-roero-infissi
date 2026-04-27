-- ============================================
-- Fix: Update prodotti table defaults and RLS policies
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/avdbccescaitczzdehjc/sql/new
-- ============================================

-- 1. Set default values for columns that might be missing them
ALTER TABLE public.prodotti ALTER COLUMN percentuale_ricarico SET DEFAULT 0;
ALTER TABLE public.prodotti ALTER COLUMN costo_posa SET DEFAULT 0;
ALTER TABLE public.prodotti ALTER COLUMN richiede_configurazione SET DEFAULT false;
ALTER TABLE public.prodotti ALTER COLUMN richiede_dimensioni SET DEFAULT false;
ALTER TABLE public.prodotti ALTER COLUMN attivo SET DEFAULT true;

-- 2. Make sure category_id is a foreign key to categories
-- (This might already be the case, but good to ensure)
-- ALTER TABLE public.prodotti ADD CONSTRAINT fk_category FOREIGN KEY (category_id) REFERENCES public.categories(id);

-- 3. Enable RLS on products if not already enabled
ALTER TABLE public.prodotti ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for products
-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Enable read access for all users" ON public.prodotti;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.prodotti;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.prodotti;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.prodotti;

-- Allow read access to everyone (anon and authenticated)
CREATE POLICY "Enable read access for all users" ON public.prodotti
    FOR SELECT TO anon, authenticated USING (true);

-- Allow insert, update, delete only to authenticated users
CREATE POLICY "Enable insert for authenticated users" ON public.prodotti
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON public.prodotti
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users" ON public.prodotti
    FOR DELETE TO authenticated USING (true);
