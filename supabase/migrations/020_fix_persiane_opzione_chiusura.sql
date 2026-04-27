-- 020_fix_persiane_opzione_chiusura.sql
-- Fix: Migration 017 hid options matching 'chiusura%' but
-- 'opzione_chiusura' starts with 'opzione_', not 'chiusura'.
-- This migration ensures opzione_chiusura is also hidden for Persiane.

UPDATE public.category_options co
SET is_active = false
FROM public.categories c
WHERE c.id = co.category_id
  AND c.nome ILIKE 'Persiane%'
  AND co.option_key = 'opzione_chiusura'
  AND co.is_active = true;
