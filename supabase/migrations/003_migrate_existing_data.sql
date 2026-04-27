-- ============================================================
-- Migration 003: Migrazione dati esistenti
-- Mappa i vecchi valori prodotti.categoria (stringhe)
-- ai nuovi categories.id (UUID)
-- ============================================================

-- Mappatura categoria stringa → category_id UUID
UPDATE public.prodotti SET category_id = '10000000-0000-0000-0000-000000000001' WHERE categoria IN ('serramenti_pvc', 'serramenti_legno_alluminio', 'serramenti_alluminio', 'finestra', 'porta', 'portafinestra', 'scorrevole');
UPDATE public.prodotti SET category_id = '10000000-0000-0000-0000-000000000002' WHERE categoria IN ('persiane', 'persiana');
UPDATE public.prodotti SET category_id = '10000000-0000-0000-0000-000000000003' WHERE categoria IN ('tapparelle', 'avvolgibili', 'tapparella');
UPDATE public.prodotti SET category_id = '10000000-0000-0000-0000-000000000004' WHERE categoria IN ('zanzariere', 'zanzariere_tende', 'zanzariera');
UPDATE public.prodotti SET category_id = '10000000-0000-0000-0000-000000000005' WHERE categoria IN ('blindati', 'portoncini', 'blindati_portoncini');
UPDATE public.prodotti SET category_id = '10000000-0000-0000-0000-000000000006' WHERE categoria IN ('porte_interne');
UPDATE public.prodotti SET category_id = '10000000-0000-0000-0000-000000000007' WHERE categoria IN ('grate');
UPDATE public.prodotti SET category_id = '10000000-0000-0000-0000-000000000008' WHERE categoria IN ('cassonetti', 'celini', 'cassonetti_celini');
UPDATE public.prodotti SET category_id = '10000000-0000-0000-0000-000000000009' WHERE categoria IN ('altro', 'accessorio', 'vari') OR category_id IS NULL;

-- Per i prodotti che non matchano nulla, assegna "Altro"
UPDATE public.prodotti SET category_id = '10000000-0000-0000-0000-000000000009' WHERE category_id IS NULL;
