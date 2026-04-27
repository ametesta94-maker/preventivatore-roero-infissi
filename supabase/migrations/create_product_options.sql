-- ============================================
-- Migration: Create product_options and product_option_values tables
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/avdbccescaitczzdehjc/sql/new
-- ============================================

-- 1. Create product_options table
CREATE TABLE IF NOT EXISTS public.product_options (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES public.prodotti(id) ON DELETE CASCADE,
    nome VARCHAR(100) NOT NULL,
    tipo VARCHAR(20) NOT NULL DEFAULT 'select' CHECK (tipo IN ('select', 'number', 'text', 'boolean')),
    obbligatorio BOOLEAN NOT NULL DEFAULT false,
    ordine INTEGER NOT NULL DEFAULT 0,
    attivo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create product_option_values table
CREATE TABLE IF NOT EXISTS public.product_option_values (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_option_id UUID NOT NULL REFERENCES public.product_options(id) ON DELETE CASCADE,
    valore VARCHAR(100) NOT NULL,
    sovrapprezzo NUMERIC(10,2) NOT NULL DEFAULT 0,
    ordine INTEGER NOT NULL DEFAULT 0,
    attivo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_product_options_product_id ON public.product_options(product_id);
CREATE INDEX IF NOT EXISTS idx_product_option_values_option_id ON public.product_option_values(product_option_id);

-- 4. Enable RLS
ALTER TABLE public.product_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_option_values ENABLE ROW LEVEL SECURITY;

-- 5. RLS policies - allow all authenticated users
CREATE POLICY "Allow all for authenticated users" ON public.product_options
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users" ON public.product_option_values
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 6. Also allow anon access (since the app uses anon key)
CREATE POLICY "Allow all for anon users" ON public.product_options
    FOR ALL TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for anon users" ON public.product_option_values
    FOR ALL TO anon USING (true) WITH CHECK (true);
