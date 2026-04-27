-- Migration 013: Aggiunge aliquota IVA combinata 10%+22% per beni significativi
-- (D.P.R. 633/72 - serramenti con ristrutturazione edilizia)

INSERT INTO public.aliquote_iva (nome, percentuale, descrizione, richiede_dichiarazione, ordine, attiva, is_combined, rate_secondary)
VALUES (
    'IVA 10%+22% (Beni Significativi)',
    10,
    'Aliquota combinata per beni significativi: 10% sulla quota ridotta, 22% sulla quota eccedente',
    true,
    4,
    true,
    true,
    22
)
ON CONFLICT DO NOTHING;
