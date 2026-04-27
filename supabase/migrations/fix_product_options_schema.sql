-- ============================================
-- Fix: Recreate product_options & product_option_values with correct column names
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/avdbccescaitczzdehjc/sql/new
-- ============================================

-- 1. Drop old tables (they are empty, no data loss)
DROP TABLE IF EXISTS public.product_option_values CASCADE;
DROP TABLE IF EXISTS public.product_options CASCADE;

-- 2. Recreate product_options with correct schema
CREATE TABLE public.product_options (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES public.prodotti(id) ON DELETE CASCADE,
    option_key VARCHAR(100) NOT NULL,
    option_label VARCHAR(200) NOT NULL,
    option_type VARCHAR(30) NOT NULL DEFAULT 'select',
    is_required BOOLEAN NOT NULL DEFAULT false,
    sort_order INTEGER NOT NULL DEFAULT 0,
    applies_to_position BOOLEAN NOT NULL DEFAULT false,
    price_adjustment_default NUMERIC(10,2) DEFAULT NULL,
    depends_on_option_id UUID DEFAULT NULL,
    depends_on_values_json JSONB DEFAULT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Recreate product_option_values with correct schema
CREATE TABLE public.product_option_values (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_option_id UUID NOT NULL REFERENCES public.product_options(id) ON DELETE CASCADE,
    value_key VARCHAR(100) NOT NULL,
    value_label VARCHAR(200) NOT NULL,
    price_adjustment NUMERIC(10,2) DEFAULT NULL,
    price_mode VARCHAR(20) NOT NULL DEFAULT 'fixed',
    sort_order INTEGER NOT NULL DEFAULT 0,
    depends_on_value_id UUID DEFAULT NULL,
    is_default BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    metadata_json JSONB DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Indexes
CREATE INDEX idx_product_options_product_id ON public.product_options(product_id);
CREATE INDEX idx_product_option_values_option_id ON public.product_option_values(product_option_id);

-- 5. Enable RLS
ALTER TABLE public.product_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_option_values ENABLE ROW LEVEL SECURITY;

-- 6. RLS policies for product_options
CREATE POLICY "Allow all for authenticated" ON public.product_options
    FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON public.product_options
    FOR ALL TO anon USING (true) WITH CHECK (true);

-- 7. RLS policies for product_option_values
CREATE POLICY "Allow all for authenticated" ON public.product_option_values
    FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON public.product_option_values
    FOR ALL TO anon USING (true) WITH CHECK (true);
