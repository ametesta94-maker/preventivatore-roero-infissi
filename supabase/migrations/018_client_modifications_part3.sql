-- 018_client_modifications_part3.sql

-- ============================================================
-- 1. ZANZARIERE — Togliere "Misure rilevate"
-- ============================================================
UPDATE category_options co
SET is_active = false
FROM categories c
WHERE c.id = co.category_id
  AND c.nome ILIKE 'Zanzariere%'
  AND co.option_key ILIKE 'misure%';

-- ============================================================
-- 2. SERVIZI — Prezzi di default richiesti
-- ============================================================
UPDATE services 
SET default_price = 200 
WHERE name ILIKE 'Pratica Enea%';

UPDATE services 
SET default_price = 20 
WHERE name ILIKE 'Smaltimento%';

UPDATE services 
SET default_price = 300 
WHERE name ILIKE 'Trasporto%';

-- (Also handle 'servizi' table if it exists instead of 'services')
UPDATE servizi 
SET prezzo_base = 200 
WHERE nome ILIKE 'Pratica Enea%' OR nome ILIKE 'Enea%';

UPDATE servizi 
SET prezzo_base = 20 
WHERE nome ILIKE 'Smaltimento%';

UPDATE servizi 
SET prezzo_base = 300 
WHERE nome ILIKE 'Trasporto%';

-- ============================================================
-- 3. PERSIANE — Togliere modello "Libro"
-- ============================================================
UPDATE category_option_values cov
SET is_active = false
FROM category_options co
JOIN categories c ON c.id = co.category_id
WHERE co.id = cov.category_option_id
  AND c.nome ILIKE 'Persiane%'
  AND co.option_key ILIKE 'modello%'
  AND cov.value_key ILIKE 'libro%';

-- ============================================================
-- 4. BLINDATO — Togliere "Telaio"
-- ============================================================
UPDATE category_options co
SET is_active = false
FROM categories c
WHERE c.id = co.category_id
  AND c.nome ILIKE 'Blind%'
  AND co.option_key ILIKE 'telaio%';

-- ============================================================
-- 5. SERRAMENTI E PORTE INTERNE — Lasciare campi liberi
-- ============================================================
-- Opzione 1: Disattiviamo tutte le opzioni per queste categorie,
-- così il preventivatore userà solo la descrizione libera (se gestito).
UPDATE category_options co
SET is_active = false
FROM categories c
WHERE c.id = co.category_id
  AND (c.nome ILIKE 'Serrament%' OR c.nome ILIKE 'Porte intern%');
