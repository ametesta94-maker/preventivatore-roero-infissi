-- Migration 014: Add text columns for order documents to impostazioni
-- These store rich-text (HTML) templates for order document PDFs

ALTER TABLE impostazioni
ADD COLUMN IF NOT EXISTS testo_condizioni_pagamento_doc TEXT,
ADD COLUMN IF NOT EXISTS testo_iva_agevolata_doc TEXT,
ADD COLUMN IF NOT EXISTS testo_atto_notorio TEXT,
ADD COLUMN IF NOT EXISTS testo_scheda_enea TEXT;

COMMENT ON COLUMN impostazioni.testo_condizioni_pagamento_doc IS 'Template HTML condizioni di pagamento per documenti ordine';
COMMENT ON COLUMN impostazioni.testo_iva_agevolata_doc IS 'Template HTML dichiarazione IVA agevolata per documenti ordine';
COMMENT ON COLUMN impostazioni.testo_atto_notorio IS 'Template HTML atto notorio per documenti ordine';
COMMENT ON COLUMN impostazioni.testo_scheda_enea IS 'Template HTML scheda ENEA per documenti ordine';
