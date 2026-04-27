-- Migration 011: Aggiunge il campo importo_beni_significativi a preventivi
-- Necessario per il calcolo dell'IVA combinata (10%/22%) sui beni significativi
-- (es. serramenti con aliquota ridotta per ristrutturazione, D.P.R. 633/72)

ALTER TABLE public.preventivi
    ADD COLUMN IF NOT EXISTS importo_beni_significativi DECIMAL(12,2) NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.preventivi.importo_beni_significativi IS
    'Valore dei beni significativi (es. serramenti) per calcolo IVA combinata. '
    'Usato solo quando aliquote_iva.is_combined = true. '
    'La quota eccedente la metà del totale viene tassata a rate_secondary (22%).';
