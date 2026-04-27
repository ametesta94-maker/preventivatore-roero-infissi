-- ============================================================
-- Migration 006: FASE 5 — Opzioni per Categoria
-- Modifiche richieste dal refactoring Roero Infissi
-- NOTA: usa subquery per nome invece di UUID fissi
-- ============================================================

-- ============================================================
-- 1. PERSIANE
-- ============================================================

-- Aggiungere "Libro" come valore di Tipologia
INSERT INTO public.category_option_values (category_option_id, value_key, value_label, sort_order)
SELECT co.id, 'libro', 'Libro', 3
FROM public.category_options co
JOIN public.categories c ON c.id = co.category_id
WHERE c.nome = 'Persiane' AND co.option_key = 'tipologia'
ON CONFLICT (category_option_id, value_key) DO NOTHING;

-- Nascondere "Opzione Chiusura"
UPDATE public.category_options co
SET is_active = false
FROM public.categories c
WHERE c.id = co.category_id AND c.nome = 'Persiane' AND co.option_label = 'Opzione Chiusura';

-- ============================================================
-- 2. AVVOLGIBILI
-- ============================================================

-- Nascondere "Guide"
UPDATE public.category_options co
SET is_active = false
FROM public.categories c
WHERE c.id = co.category_id AND c.nome = 'Avvolgibili' AND co.option_label = 'Guide';

-- Nascondere "Cuscinetti e Staffe"
UPDATE public.category_options co
SET is_active = false
FROM public.categories c
WHERE c.id = co.category_id AND c.nome = 'Avvolgibili' AND co.option_label = 'Cuscinetti e Staffe';

-- ============================================================
-- 3. ZANZARIERE / TENDE
-- ============================================================

-- Nascondere "Sgancio"
UPDATE public.category_options co
SET is_active = false
FROM public.categories c
WHERE c.id = co.category_id AND c.nome ILIKE 'Zanzariere%' AND co.option_label = 'Sgancio';

-- Nascondere "Note"
UPDATE public.category_options co
SET is_active = false
FROM public.categories c
WHERE c.id = co.category_id AND c.nome ILIKE 'Zanzariere%' AND co.option_label = 'Note';

-- ============================================================
-- 4. BLINDATI / PORTONCINI
-- ============================================================

-- Nascondere "Coprifilo"
UPDATE public.category_options co
SET is_active = false
FROM public.categories c
WHERE c.id = co.category_id AND c.nome ILIKE 'Blind%' AND co.option_label = 'Coprifilo';

-- Nascondere "Materiale Coprifilo"
UPDATE public.category_options co
SET is_active = false
FROM public.categories c
WHERE c.id = co.category_id AND c.nome ILIKE 'Blind%' AND co.option_label = 'Materiale Coprifilo';

-- Aggiungere nuove opzioni: ST7, Controtelaio, Angolare, Kit Maniglia
INSERT INTO public.category_options (category_id, option_key, option_label, option_type, is_required, sort_order, applies_to_position, is_active)
SELECT c.id, 'st7', 'ST7', 'boolean', false, 13, false, true
FROM public.categories c WHERE c.nome ILIKE 'Blind%'
ON CONFLICT (category_id, option_key) DO NOTHING;

INSERT INTO public.category_options (category_id, option_key, option_label, option_type, is_required, sort_order, applies_to_position, is_active)
SELECT c.id, 'controtelaio', 'Controtelaio', 'boolean', false, 14, false, true
FROM public.categories c WHERE c.nome ILIKE 'Blind%'
ON CONFLICT (category_id, option_key) DO NOTHING;

INSERT INTO public.category_options (category_id, option_key, option_label, option_type, is_required, sort_order, applies_to_position, is_active)
SELECT c.id, 'angolare', 'Angolare', 'boolean', false, 15, false, true
FROM public.categories c WHERE c.nome ILIKE 'Blind%'
ON CONFLICT (category_id, option_key) DO NOTHING;

INSERT INTO public.category_options (category_id, option_key, option_label, option_type, is_required, sort_order, applies_to_position, is_active)
SELECT c.id, 'kit_maniglia', 'Kit Maniglia', 'select', false, 16, false, true
FROM public.categories c WHERE c.nome ILIKE 'Blind%'
ON CONFLICT (category_id, option_key) DO NOTHING;

-- Valori per Kit Maniglia
INSERT INTO public.category_option_values (category_option_id, value_key, value_label, sort_order)
SELECT co.id, 'standard', 'Standard', 1
FROM public.category_options co
JOIN public.categories c ON c.id = co.category_id
WHERE c.nome ILIKE 'Blind%' AND co.option_key = 'kit_maniglia'
ON CONFLICT (category_option_id, value_key) DO NOTHING;

INSERT INTO public.category_option_values (category_option_id, value_key, value_label, sort_order)
SELECT co.id, 'accessorio', 'Accessorio', 2
FROM public.category_options co
JOIN public.categories c ON c.id = co.category_id
WHERE c.nome ILIKE 'Blind%' AND co.option_key = 'kit_maniglia'
ON CONFLICT (category_option_id, value_key) DO NOTHING;

-- ============================================================
-- 5. SERRAMENTI / PORTE INTERNE
-- ============================================================
-- Campo testo libero per descrizione già presente come opzione 'descrizione'.
-- Nessuna modifica necessaria.
