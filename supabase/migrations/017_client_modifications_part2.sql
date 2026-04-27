-- 017_client_modifications_part2.sql
-- 1. Zanzariere: Add "Altro" w/ free text input
-- 2. Persiane: Hide "Chiusura" option
-- 3. Blindato: Remove "ST7" value from "Classe Antieffrazione"
-- 4. Blindato: "Passata" → option_type 'number' for manual price input

-- ============================================================
-- 1. ZANZARIERE — aggiungere opzione "Altro" (testo libero)
-- ============================================================
INSERT INTO category_options (category_id, option_key, option_label, option_type, is_required, sort_order, applies_to_position, is_active)
SELECT c.id, 'altro', 'Altro', 'text', false, 99, true, true
FROM categories c
WHERE c.nome ILIKE 'Zanzariere%'
AND NOT EXISTS (
    SELECT 1 FROM category_options co
    WHERE co.category_id = c.id AND co.option_key = 'altro'
);

-- ============================================================
-- 2. PERSIANE — disattivare "Chiusura"
-- ============================================================
UPDATE category_options co
SET is_active = false
FROM categories c
WHERE c.id = co.category_id
  AND c.nome ILIKE 'Persiane%'
  AND co.option_key ILIKE 'chiusura%';

-- ============================================================
-- 3. BLINDATO — disattivare valore "ST7" dalla opzione
--    "Classe Antieffrazione" (o option_key = 'classe_antieffrazione')
-- ============================================================
UPDATE category_option_values cov
SET is_active = false
FROM category_options co
JOIN categories c ON c.id = co.category_id
WHERE co.id = cov.category_option_id
  AND c.nome ILIKE 'Blind%'
  AND (co.option_key ILIKE 'classe_antieffrazione%' OR co.option_key = 'st7')
  AND (cov.value_key ILIKE 'st7%' OR cov.value_label ILIKE 'ST7%');

-- Anche disattivare se ST7 è un'opzione booleana standalone
UPDATE category_options co
SET is_active = false
FROM categories c
WHERE c.id = co.category_id
  AND c.nome ILIKE 'Blind%'
  AND co.option_key = 'st7';

-- ============================================================
-- 4. BLINDATO — "Passata": cambio da boolean a 'number'
--    per inserire il prezzo manualmente
-- ============================================================
UPDATE category_options co
SET option_type = 'number'
FROM categories c
WHERE c.id = co.category_id
  AND c.nome ILIKE 'Blind%'
  AND co.option_key = 'passata';
