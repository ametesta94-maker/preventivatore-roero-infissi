-- ============================================================================
-- MIGRATION 016: Modifiche richieste dal cliente (Marzo 2026)
-- Descrizione: Aggiorna descrizioni categorie, prezzi servizi, persiane,
--              zanzariere (misure_rilevate), emesso_da preventivo,
--              detrazioni ordine.
-- ============================================================================

-- ============================================================
-- 1. DESCRIZIONE ZANZARIERE — Template condizionale verticale/laterale
--    L'opzione "modello_posizione" ha valore 'verticale'/'laterale_guida_bassa'/'laterale_guida_alta'
--    Usiamo blocchi {{#if}} per la descrizione condizionale
-- ============================================================

UPDATE categories
SET description_template = E'Zanzariere in alluminio verniciato colore {{colore}}.\n{{#if tipologia=zanzariera}}{{#if modello_posizione=verticale}}Modello verticale per finestra con rallentatore, spazzolino antivento, barra maniglia.{{/if}}{{#if modello_posizione=laterale_guida_bassa}}Modello laterale per porta con rete tesa e guida inferiore calpestabile da mm.5, barra maniglia.{{/if}}{{#if modello_posizione=laterale_guida_alta}}Modello laterale per porta con rete tesa e guida inferiore calpestabile da mm.5, barra maniglia.{{/if}}{{/if}}\nComplete di tutti gli accessori d''uso per renderle perfettamente funzionanti.'
WHERE LOWER(nome) LIKE 'zanzariere%';

-- ============================================================
-- 2. DESCRIZIONE GRATE — Template completo
-- ============================================================

UPDATE categories
SET description_template = E'La caratteristica della grata (modello {{sotto_modello}}) è la struttura resa semplificata; la grata è realizzata da un telaio perimetrale in acciaio zincato di sezione 30x30x2 mm. di spessore; l''ingombro complessivo è di soli 35 mm., permettendo l''applicazione anche in presenza di monoblocco, senza dover fare alcuna modifica al serramento esistente.\nLa verniciatura viene effettuata con polveri poliestere per esterno, per una perfetta aderenza e durata delle vernici. Tutti i modelli di grate sono realizzati da moduli di acciaio pieno di spessore 14 mm..\nSnodo autobloccante con doppia funzione. Cilindro europeo con 3 chiavi e scheda di duplicazione.'
WHERE LOWER(nome) = 'grate';

-- ============================================================
-- 3. DESCRIZIONE BLINDATO — Template completo
-- ============================================================

UPDATE categories
SET description_template = E'Porta blindata {{modello}}: realizzata a 2 livelli di lamiera con piastra di protezione serratura, coibentazione interna con doppio strato di isolamento in polistirene espanso, 4 punti di chiusura fissi sul lato cerniera, cerniere con perno in acciaio a sfera, carenatura in lamiera zincata plastificata con finitura effetto inox, lama paraspifferi; cilindro europeo a 5 chiavi e scheda di duplicazione, protezione cilindro a forma conica che limita il tentativo di strappo o estrazione; PANNELLO esterno {{pannello_esterno_colore}}, PANNELLO interno {{pannello_interno_colore}}.\nClasse antieffrazione 3.'
WHERE nome ILIKE 'Blind%';

-- ============================================================
-- 4. PREZZI SERVIZI — Aggiorna prezzi di default
-- ============================================================

UPDATE services SET price = 200.00 WHERE code = 'SRV-ENEA';
UPDATE services SET price = 20.00, unit = 'pezzo' WHERE code = 'SRV-SMALT';
UPDATE services SET price = 300.00 WHERE code = 'SRV-TRASP';

-- ============================================================
-- 5. PERSIANE — Disattivare "Libro" dai modelli
--    (Migration 006 lo aggiungeva erroneamente)
-- ============================================================

UPDATE public.category_option_values
SET is_active = false
WHERE value_key = 'libro'
  AND category_option_id = (
      SELECT co.id FROM public.category_options co
      JOIN public.categories c ON c.id = co.category_id
      WHERE c.nome = 'Persiane' AND co.option_key = 'modello'
  );

-- ============================================================
-- 6. ZANZARIERE — Nascondere "Misure Rilevate"
-- ============================================================

UPDATE public.category_options co
SET is_active = false
FROM public.categories c
WHERE c.id = co.category_id
  AND c.nome ILIKE 'Zanzariere%'
  AND co.option_key = 'misure_rilevate';

-- ============================================================
-- 7. BLINDATO — Nascondere "Telaio" (campo globale)
-- ============================================================

UPDATE public.category_options co
SET is_active = false
FROM public.categories c
WHERE c.id = co.category_id
  AND c.nome ILIKE 'Blind%'
  AND co.option_key = 'telaio';

-- ============================================================
-- 8. BLINDATO — Nascondere misure dalla Passata
--    (misura_passata_l e misura_passata_h restano nel DB
--     ma vengono disattivate nell'interfaccia)
-- ============================================================

UPDATE public.category_options co
SET is_active = false
FROM public.categories c
WHERE c.id = co.category_id
  AND c.nome ILIKE 'Blind%'
  AND co.option_key IN ('misura_passata_l', 'misura_passata_h');

-- ============================================================
-- 9. CAMPO "EMESSO DA" — Aggiungere al preventivo
-- ============================================================

ALTER TABLE preventivi
ADD COLUMN IF NOT EXISTS emesso_da VARCHAR(100);

COMMENT ON COLUMN preventivi.emesso_da IS 'Nome dell''operatore che ha emesso il preventivo';

-- ============================================================
-- 10. DETRAZIONI ORDINE — Aggiornare commento
-- ============================================================

COMMENT ON COLUMN orders.deduction_type IS 'Tipo detrazione: ecobonus, bonus_casa, bonus_sicurezza, nessuna';

-- ============================================================
-- FINE MIGRATION 016
-- ============================================================
