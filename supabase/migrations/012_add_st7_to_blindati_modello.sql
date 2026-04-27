-- Migration 012: Aggiunge ST7 come valore nel campo Modello dei Blindati/Portoncini
-- Il documento specifica "Modello aggiungere ST7" come valore nel select esistente

INSERT INTO public.category_option_values (category_option_id, value_key, value_label, sort_order)
SELECT co.id, 'st7', 'ST7', 4
FROM public.category_options co
JOIN public.categories c ON c.id = co.category_id
WHERE c.nome ILIKE 'Blind%' AND co.option_key = 'modello'
ON CONFLICT (category_option_id, value_key) DO NOTHING;
