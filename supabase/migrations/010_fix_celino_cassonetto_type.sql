-- Migration 010: Fix celino_cassonetto option type
-- Il campo "Celino o Cassonetto" negli Avvolgibili era di tipo 'number',
-- deve essere 'text' (campo libero) come indicato nelle istruzioni operative.

UPDATE public.category_options
SET option_type = 'text'
WHERE option_key = 'celino_cassonetto'
  AND category_id = (
      SELECT id FROM public.categories WHERE nome ILIKE 'Avvolgibili%' LIMIT 1
  );

COMMENT ON COLUMN public.category_options.option_type IS
    'Tipo opzione: select, text, number, boolean. celino_cassonetto è text (campo libero).';
