-- ============================================================
-- Migration 002: Seed completo categorie e opzioni
-- Popola tutte le 9 categorie con opzioni e valori
-- come da architettura.md
-- ============================================================

-- ============================================================
-- CATEGORIE
-- ============================================================

INSERT INTO public.categories (id, slug, nome, descrizione, icona, ordine) VALUES
  ('10000000-0000-0000-0000-000000000001', 'serramenti',           'Serramenti',           'Finestre, porte-finestre, scorrevoli in vari materiali', '🪟', 1),
  ('10000000-0000-0000-0000-000000000002', 'persiane',             'Persiane',             'Persiane classiche, piemontesi, genovesi, scuri',       '🏠', 2),
  ('10000000-0000-0000-0000-000000000003', 'avvolgibili',          'Avvolgibili',          'Tapparelle in alluminio e PVC',                         '🔽', 3),
  ('10000000-0000-0000-0000-000000000004', 'zanzariere_tende',     'Zanzariere / Tende',   'Zanzariere e tende tecniche',                           '🦟', 4),
  ('10000000-0000-0000-0000-000000000005', 'blindati_portoncini',  'Blindati / Portoncini','Porte blindate e portoncini di sicurezza',              '🚪', 5),
  ('10000000-0000-0000-0000-000000000006', 'porte_interne',        'Porte Interne',        'Porte interne in varie serie e finiture',               '🚪', 6),
  ('10000000-0000-0000-0000-000000000007', 'grate',                'Grate',                'Grate di sicurezza in vari modelli',                    '🔒', 7),
  ('10000000-0000-0000-0000-000000000008', 'cassonetti_celini',    'Cassonetti / Celini',  'Cassonetti e celini per tapparelle',                    '📦', 8),
  ('10000000-0000-0000-0000-000000000009', 'altro',                'Altro',                'Prodotti e servizi vari',                               '📋', 9)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- VARIABILI ID CATEGORIE (per leggibilita)
-- ============================================================
-- cat_serramenti     = 10000000-0000-0000-0000-000000000001
-- cat_persiane       = 10000000-0000-0000-0000-000000000002
-- cat_avvolgibili    = 10000000-0000-0000-0000-000000000003
-- cat_zanzariere     = 10000000-0000-0000-0000-000000000004
-- cat_blindati       = 10000000-0000-0000-0000-000000000005
-- cat_porte_interne  = 10000000-0000-0000-0000-000000000006
-- cat_grate          = 10000000-0000-0000-0000-000000000007
-- cat_cassonetti     = 10000000-0000-0000-0000-000000000008
-- cat_altro          = 10000000-0000-0000-0000-000000000009

-- ============================================================
-- 1. SERRAMENTI — Opzioni Globali (applies_to_position = false)
-- ============================================================

INSERT INTO public.category_options (id, category_id, option_key, option_label, option_type, is_required, sort_order, applies_to_position, depends_on_option_id, depends_on_values_json, is_active) VALUES
  -- Opzioni globali serramenti
  ('20000000-0000-0000-0001-000000000001', '10000000-0000-0000-0000-000000000001', 'materiale',              'Materiale',                          'select',       true,  1,  false, NULL, NULL, true),
  ('20000000-0000-0000-0001-000000000002', '10000000-0000-0000-0000-000000000001', 'colore',                 'Colore',                             'text',         false, 2,  false, '20000000-0000-0000-0001-000000000001', '["PVC"]', true),
  ('20000000-0000-0000-0001-000000000003', '10000000-0000-0000-0000-000000000001', 'colore_interno',         'Colore Interno',                     'text',         false, 3,  false, '20000000-0000-0000-0001-000000000001', '["KAB","Fin-Project","Alluminio","Legno/Alluminio","Legno"]', true),
  ('20000000-0000-0000-0001-000000000004', '10000000-0000-0000-0000-000000000001', 'colore_esterno',         'Colore Esterno',                     'text',         false, 4,  false, '20000000-0000-0000-0001-000000000001', '["KAB","Fin-Project","Alluminio","Legno/Alluminio","Legno"]', true),
  ('20000000-0000-0000-0001-000000000005', '10000000-0000-0000-0000-000000000001', 'spessore_telaio',        'Spessore Telaio',                    'select',       false, 5,  false, '20000000-0000-0000-0001-000000000001', NULL, true),
  ('20000000-0000-0000-0001-000000000006', '10000000-0000-0000-0000-000000000001', 'telaio',                 'Telaio',                             'select',       false, 6,  false, NULL, NULL, true),
  ('20000000-0000-0000-0001-000000000007', '10000000-0000-0000-0000-000000000001', 'anta',                   'Anta',                               'select',       false, 7,  false, '20000000-0000-0000-0001-000000000001', '["PVC","KAB"]', true),
  ('20000000-0000-0000-0001-000000000008', '10000000-0000-0000-0000-000000000001', 'anta_finproject',        'Anta',                               'select',       false, 8,  false, '20000000-0000-0000-0001-000000000001', '["Fin-Project"]', true),
  ('20000000-0000-0000-0001-000000000009', '10000000-0000-0000-0000-000000000001', 'tipologia_porte',        'Tipologia Porte',                    'multi_select', false, 9,  false, '20000000-0000-0000-0001-000000000001', '["PVC","KAB"]', true),
  ('20000000-0000-0000-0001-000000000010', '10000000-0000-0000-0000-000000000001', 'misura_traverso',        'Misura da terra a centro traverso',  'number',       false, 10, false, '20000000-0000-0000-0001-000000000009', '["Traverso"]', true),
  ('20000000-0000-0000-0001-000000000011', '10000000-0000-0000-0000-000000000001', 'quantita_zoccoli',       'Quantita zoccoli',                   'select',       false, 11, false, '20000000-0000-0000-0001-000000000009', '["Zoccolo"]', true),
  ('20000000-0000-0000-0001-000000000012', '10000000-0000-0000-0000-000000000001', 'misura_pannello_inf',    'Misura da terra a centro traverso (pannello)', 'number', false, 12, false, '20000000-0000-0000-0001-000000000009', '["Pannello inferiore"]', true),
  ('20000000-0000-0000-0001-000000000013', '10000000-0000-0000-0000-000000000001', 'traversini',             'Traversini',                         'boolean',      false, 13, false, NULL, NULL, true),
  ('20000000-0000-0000-0001-000000000014', '10000000-0000-0000-0000-000000000001', 'n_traversini',           'N. Traversini',                      'select',       false, 14, false, '20000000-0000-0000-0001-000000000013', NULL, true),
  ('20000000-0000-0000-0001-000000000015', '10000000-0000-0000-0000-000000000001', 'tipologia_porte_finproject', 'Tipologia Porte',                'select',       false, 15, false, '20000000-0000-0000-0001-000000000001', '["Fin-Project"]', true),
  ('20000000-0000-0000-0001-000000000016', '10000000-0000-0000-0000-000000000001', 'nodo_centrale',          'Nodo Centrale',                      'select',       false, 16, false, '20000000-0000-0000-0001-000000000001', '["PVC","KAB"]', true),
  ('20000000-0000-0000-0001-000000000017', '10000000-0000-0000-0000-000000000001', 'fermavetro',             'Fermavetro',                         'select',       false, 17, false, '20000000-0000-0000-0001-000000000001', '["PVC","KAB"]', true),
  ('20000000-0000-0000-0001-000000000018', '10000000-0000-0000-0000-000000000001', 'modello_maniglie',       'Modello Maniglie',                   'select',       false, 18, false, NULL, NULL, true),
  ('20000000-0000-0000-0001-000000000019', '10000000-0000-0000-0000-000000000001', 'tipo_maniglie',          'Tipo Maniglie',                      'select',       false, 19, false, '20000000-0000-0000-0001-000000000018', NULL, true),
  ('20000000-0000-0000-0001-000000000020', '10000000-0000-0000-0000-000000000001', 'colore_maniglie',        'Colore Maniglie',                    'select',       false, 20, false, '20000000-0000-0000-0001-000000000018', NULL, true),
  ('20000000-0000-0000-0001-000000000021', '10000000-0000-0000-0000-000000000001', 'vetri',                  'Vetri',                              'text',         false, 21, false, NULL, NULL, true),
  ('20000000-0000-0000-0001-000000000022', '10000000-0000-0000-0000-000000000001', 'cerniere',               'Cerniere',                           'select',       false, 22, false, NULL, NULL, true),
  ('20000000-0000-0000-0001-000000000023', '10000000-0000-0000-0000-000000000001', 'coprifili',              'Coprifili',                          'text',         false, 23, false, NULL, NULL, true)
ON CONFLICT (category_id, option_key) DO NOTHING;

-- Opzioni posizione serramenti (applies_to_position = true)
INSERT INTO public.category_options (id, category_id, option_key, option_label, option_type, is_required, sort_order, applies_to_position, is_active) VALUES
  ('20000000-0000-0000-0001-000000000101', '10000000-0000-0000-0000-000000000001', 'descrizione',            'Descrizione',                'text',    false, 1,  true, true),
  ('20000000-0000-0000-0001-000000000102', '10000000-0000-0000-0000-000000000001', 'quantita',               'Quantita',                   'number',  true,  2,  true, true),
  ('20000000-0000-0000-0001-000000000103', '10000000-0000-0000-0000-000000000001', 'senso_apertura',         'Senso di apertura',          'select',  false, 3,  true, true),
  ('20000000-0000-0000-0001-000000000104', '10000000-0000-0000-0000-000000000001', 'larghezza',              'Larghezza (mm)',             'number',  true,  4,  true, true),
  ('20000000-0000-0000-0001-000000000105', '10000000-0000-0000-0000-000000000001', 'altezza',                'Altezza (mm)',               'number',  true,  5,  true, true),
  ('20000000-0000-0000-0001-000000000106', '10000000-0000-0000-0000-000000000001', 'ante',                   'Ante',                       'number',  false, 6,  true, true),
  ('20000000-0000-0000-0001-000000000107', '10000000-0000-0000-0000-000000000001', 'portoncino_serratura',   'Portoncino con Serratura',   'boolean', false, 7,  true, true),
  ('20000000-0000-0000-0001-000000000108', '10000000-0000-0000-0000-000000000001', 'porta_serratura',        'Porta con Serratura',        'boolean', false, 8,  true, true),
  ('20000000-0000-0000-0001-000000000109', '10000000-0000-0000-0000-000000000001', 'gioco_posizione_l',      'Gioco posizione L',          'number',  false, 9,  true, true),
  ('20000000-0000-0000-0001-000000000110', '10000000-0000-0000-0000-000000000001', 'gioco_posizione_h',      'Gioco posizione H',          'number',  false, 10, true, true),
  ('20000000-0000-0000-0001-000000000111', '10000000-0000-0000-0000-000000000001', 'tendina_plissetta',      'Tendina Plissetta',          'boolean', false, 11, true, true),
  ('20000000-0000-0000-0001-000000000112', '10000000-0000-0000-0000-000000000001', 'colore_tendina',         'Colore Tendina',             'text',    false, 12, true, true),
  ('20000000-0000-0000-0001-000000000113', '10000000-0000-0000-0000-000000000001', 'veneziana',              'Veneziana',                  'boolean', false, 13, true, true),
  ('20000000-0000-0000-0001-000000000114', '10000000-0000-0000-0000-000000000001', 'colore_veneziana',       'Colore Veneziana',           'text',    false, 14, true, true),
  ('20000000-0000-0000-0001-000000000115', '10000000-0000-0000-0000-000000000001', 'motore',                 'Motore',                     'boolean', false, 15, true, true),
  ('20000000-0000-0000-0001-000000000116', '10000000-0000-0000-0000-000000000001', 'soglia_alluminio',       'Soglia Alluminio',           'boolean', false, 16, true, true),
  ('20000000-0000-0000-0001-000000000117', '10000000-0000-0000-0000-000000000001', 'maniglia_argano',        'Maniglia d''Argano',         'boolean', false, 17, true, true),
  ('20000000-0000-0000-0001-000000000118', '10000000-0000-0000-0000-000000000001', 'vetro_satinato',         'Vetro Satinato',             'boolean', false, 18, true, true),
  ('20000000-0000-0000-0001-000000000119', '10000000-0000-0000-0000-000000000001', 'serratura',              'Serratura',                  'boolean', false, 19, true, true),
  ('20000000-0000-0000-0001-000000000120', '10000000-0000-0000-0000-000000000001', 'telaio_posizione',       'Telaio',                     'select',  false, 20, true, true),
  ('20000000-0000-0000-0001-000000000121', '10000000-0000-0000-0000-000000000001', 'rifilo_aletta_sopra',    'Rifilo Aletta - Sopra',      'number',  false, 21, true, true),
  ('20000000-0000-0000-0001-000000000122', '10000000-0000-0000-0000-000000000001', 'rifilo_aletta_sotto',    'Rifilo Aletta - Sotto',      'number',  false, 22, true, true),
  ('20000000-0000-0000-0001-000000000123', '10000000-0000-0000-0000-000000000001', 'rifilo_aletta_sx',       'Rifilo Aletta - Sinistra',   'number',  false, 23, true, true),
  ('20000000-0000-0000-0001-000000000124', '10000000-0000-0000-0000-000000000001', 'rifilo_aletta_dx',       'Rifilo Aletta - Destra',     'number',  false, 24, true, true),
  ('20000000-0000-0000-0001-000000000125', '10000000-0000-0000-0000-000000000001', 'note_posizione',         'Note',                       'text',    false, 25, true, true)
ON CONFLICT (category_id, option_key) DO NOTHING;

-- Dipendenze posizione: colore_tendina dipende da tendina_plissetta, colore_veneziana dipende da veneziana
UPDATE public.category_options SET depends_on_option_id = '20000000-0000-0000-0001-000000000111' WHERE id = '20000000-0000-0000-0001-000000000112';
UPDATE public.category_options SET depends_on_option_id = '20000000-0000-0000-0001-000000000113' WHERE id = '20000000-0000-0000-0001-000000000114';
-- n_traversini dipende da traversini (boolean true)
UPDATE public.category_options SET depends_on_option_id = '20000000-0000-0000-0001-000000000013' WHERE id = '20000000-0000-0000-0001-000000000014';

-- ============================================================
-- VALORI per opzioni Serramenti globali
-- ============================================================

-- Materiale
INSERT INTO public.category_option_values (id, category_option_id, value_key, value_label, sort_order) VALUES
  ('30000000-0000-0001-0001-000000000001', '20000000-0000-0000-0001-000000000001', 'PVC',              'PVC',              1),
  ('30000000-0000-0001-0001-000000000002', '20000000-0000-0000-0001-000000000001', 'KAB',              'KAB',              2),
  ('30000000-0000-0001-0001-000000000003', '20000000-0000-0000-0001-000000000001', 'Fin-Project',      'Fin-Project',      3),
  ('30000000-0000-0001-0001-000000000004', '20000000-0000-0000-0001-000000000001', 'Alluminio',        'Alluminio',        4),
  ('30000000-0000-0001-0001-000000000005', '20000000-0000-0000-0001-000000000001', 'Legno/Alluminio',  'Legno/Alluminio',  5),
  ('30000000-0000-0001-0001-000000000006', '20000000-0000-0000-0001-000000000001', 'Legno',            'Legno',            6)
ON CONFLICT (category_option_id, value_key) DO NOTHING;

-- Spessore Telaio (condizionale su materiale)
INSERT INTO public.category_option_values (id, category_option_id, value_key, value_label, sort_order, depends_on_value_id) VALUES
  ('30000000-0000-0001-0005-000000000001', '20000000-0000-0000-0001-000000000005', 'pvc_77',  '77',  1, '30000000-0000-0001-0001-000000000001'),
  ('30000000-0000-0001-0005-000000000002', '20000000-0000-0000-0001-000000000005', 'pvc_90',  '90',  2, '30000000-0000-0001-0001-000000000001'),
  ('30000000-0000-0001-0005-000000000003', '20000000-0000-0000-0001-000000000005', 'kab_85',  '85',  3, '30000000-0000-0001-0001-000000000002'),
  ('30000000-0000-0001-0005-000000000004', '20000000-0000-0000-0001-000000000005', 'kab_98',  '98',  4, '30000000-0000-0001-0001-000000000002'),
  ('30000000-0000-0001-0005-000000000005', '20000000-0000-0000-0001-000000000005', 'fp_78',   '78',  5, '30000000-0000-0001-0001-000000000003')
ON CONFLICT (category_option_id, value_key) DO NOTHING;

-- Telaio
INSERT INTO public.category_option_values (category_option_id, value_key, value_label, sort_order) VALUES
  ('20000000-0000-0000-0001-000000000006', 'L', 'L', 1),
  ('20000000-0000-0000-0001-000000000006', 'Z', 'Z', 2)
ON CONFLICT (category_option_id, value_key) DO NOTHING;

-- Anta (PVC/KAB)
INSERT INTO public.category_option_values (category_option_id, value_key, value_label, sort_order) VALUES
  ('20000000-0000-0000-0001-000000000007', 'classic_line', 'Classic Line', 1),
  ('20000000-0000-0000-0001-000000000007', 'slim_line',    'Slim Line',    2),
  ('20000000-0000-0000-0001-000000000007', 'nova_line',    'Nova Line',    3)
ON CONFLICT (category_option_id, value_key) DO NOTHING;

-- Anta Fin-Project
INSERT INTO public.category_option_values (category_option_id, value_key, value_label, sort_order) VALUES
  ('20000000-0000-0000-0001-000000000008', 'classic_line', 'Classic Line', 1),
  ('20000000-0000-0000-0001-000000000008', 'slim_line',    'Slim Line',    2),
  ('20000000-0000-0000-0001-000000000008', 'nova_line',    'Nova Line',    3),
  ('20000000-0000-0000-0001-000000000008', 'ferro_line',   'Ferro Line',   4)
ON CONFLICT (category_option_id, value_key) DO NOTHING;

-- Tipologia Porte (multi_select PVC/KAB)
INSERT INTO public.category_option_values (category_option_id, value_key, value_label, sort_order) VALUES
  ('20000000-0000-0000-0001-000000000009', 'tutto_vetro',       'Tutto vetro',       1),
  ('20000000-0000-0000-0001-000000000009', 'traverso',          'Traverso',          2),
  ('20000000-0000-0000-0001-000000000009', 'zoccolo',           'Zoccolo',           3),
  ('20000000-0000-0000-0001-000000000009', 'pannello_inferiore','Pannello inferiore',4)
ON CONFLICT (category_option_id, value_key) DO NOTHING;

-- Quantita zoccoli
INSERT INTO public.category_option_values (category_option_id, value_key, value_label, sort_order) VALUES
  ('20000000-0000-0000-0001-000000000011', '1', '1', 1),
  ('20000000-0000-0000-0001-000000000011', '2', '2', 2)
ON CONFLICT (category_option_id, value_key) DO NOTHING;

-- N. Traversini
INSERT INTO public.category_option_values (category_option_id, value_key, value_label, sort_order) VALUES
  ('20000000-0000-0000-0001-000000000014', '1', '1', 1),
  ('20000000-0000-0000-0001-000000000014', '2', '2', 2),
  ('20000000-0000-0000-0001-000000000014', '3', '3', 3),
  ('20000000-0000-0000-0001-000000000014', '4', '4', 4),
  ('20000000-0000-0000-0001-000000000014', '5', '5', 5)
ON CONFLICT (category_option_id, value_key) DO NOTHING;

-- Tipologia Porte Fin-Project
INSERT INTO public.category_option_values (category_option_id, value_key, value_label, sort_order) VALUES
  ('20000000-0000-0000-0001-000000000015', 'pannello_inferiore', 'Pannello inferiore', 1)
ON CONFLICT (category_option_id, value_key) DO NOTHING;

-- Nodo Centrale (PVC/KAB)
INSERT INTO public.category_option_values (category_option_id, value_key, value_label, sort_order) VALUES
  ('20000000-0000-0000-0001-000000000016', 'standard',      'Standard (senza pilastrino)', 1),
  ('20000000-0000-0000-0001-000000000016', 'con_pilastrino', 'Con pilastrino',             2),
  ('20000000-0000-0000-0001-000000000016', 'history',        'History',                    3)
ON CONFLICT (category_option_id, value_key) DO NOTHING;

-- Fermavetro (PVC/KAB)
INSERT INTO public.category_option_values (category_option_id, value_key, value_label, sort_order) VALUES
  ('20000000-0000-0000-0001-000000000017', 'stile_33',     'In stile cod. 33',        1),
  ('20000000-0000-0000-0001-000000000017', 'classic_66',   'Classic Line cod. 66',    2)
ON CONFLICT (category_option_id, value_key) DO NOTHING;

-- Modello Maniglie
INSERT INTO public.category_option_values (id, category_option_id, value_key, value_label, sort_order) VALUES
  ('30000000-0000-0001-0018-000000000001', '20000000-0000-0000-0001-000000000018', 'serie_1',  'Serie 1',  1),
  ('30000000-0000-0001-0018-000000000002', '20000000-0000-0000-0001-000000000018', 'serie_2',  'Serie 2',  2),
  ('30000000-0000-0001-0018-000000000003', '20000000-0000-0000-0001-000000000018', 'serie_3',  'Serie 3',  3),
  ('30000000-0000-0001-0018-000000000011', '20000000-0000-0000-0001-000000000018', 'serie_11', 'Serie 11', 4),
  ('30000000-0000-0001-0018-000000000012', '20000000-0000-0000-0001-000000000018', 'serie_12', 'Serie 12', 5),
  ('30000000-0000-0001-0018-000000000013', '20000000-0000-0000-0001-000000000018', 'serie_13', 'Serie 13', 6),
  ('30000000-0000-0001-0018-000000000014', '20000000-0000-0000-0001-000000000018', 'serie_14', 'Serie 14', 7),
  ('30000000-0000-0001-0018-000000000015', '20000000-0000-0000-0001-000000000018', 'serie_15', 'Serie 15', 8),
  ('30000000-0000-0001-0018-000000000016', '20000000-0000-0000-0001-000000000018', 'serie_16', 'Serie 16', 9)
ON CONFLICT (category_option_id, value_key) DO NOTHING;

-- Tipo Maniglie (condizionale su modello)
INSERT INTO public.category_option_values (category_option_id, value_key, value_label, sort_order, depends_on_value_id) VALUES
  -- Serie 1
  ('20000000-0000-0000-0001-000000000019', 's1_standard',              'Standard',                           1, '30000000-0000-0001-0018-000000000001'),
  ('20000000-0000-0000-0001-000000000019', 's1_con_pulsante',          'Con pulsante',                       2, '30000000-0000-0001-0018-000000000001'),
  ('20000000-0000-0000-0001-000000000019', 's1_con_chiave',            'Con chiave',                         3, '30000000-0000-0001-0018-000000000001'),
  -- Serie 2
  ('20000000-0000-0000-0001-000000000019', 's2_standard',              'Standard',                           4, '30000000-0000-0001-0018-000000000002'),
  ('20000000-0000-0000-0001-000000000019', 's2_a_pressione',           'A pressione',                        5, '30000000-0000-0001-0018-000000000002'),
  ('20000000-0000-0000-0001-000000000019', 's2_a_pressione_chiave',    'A pressione con chiave',             6, '30000000-0000-0001-0018-000000000002'),
  -- Serie 3
  ('20000000-0000-0000-0001-000000000019', 's3_standard',              'Standard',                           7, '30000000-0000-0001-0018-000000000003'),
  -- Serie 11-16 (stesse opzioni)
  ('20000000-0000-0000-0001-000000000019', 's11_rosetta_tonda',        'Rosetta tonda',                      8,  '30000000-0000-0001-0018-000000000011'),
  ('20000000-0000-0000-0001-000000000019', 's11_rosetta_ovale',        'Rosetta ovale',                      9,  '30000000-0000-0001-0018-000000000011'),
  ('20000000-0000-0000-0001-000000000019', 's11_pressione_ovale',      'A pressione con rosetta ovale',      10, '30000000-0000-0001-0018-000000000011'),
  ('20000000-0000-0000-0001-000000000019', 's12_rosetta_tonda',        'Rosetta tonda',                      11, '30000000-0000-0001-0018-000000000012'),
  ('20000000-0000-0000-0001-000000000019', 's12_rosetta_ovale',        'Rosetta ovale',                      12, '30000000-0000-0001-0018-000000000012'),
  ('20000000-0000-0000-0001-000000000019', 's12_pressione_ovale',      'A pressione con rosetta ovale',      13, '30000000-0000-0001-0018-000000000012'),
  ('20000000-0000-0000-0001-000000000019', 's13_rosetta_tonda',        'Rosetta tonda',                      14, '30000000-0000-0001-0018-000000000013'),
  ('20000000-0000-0000-0001-000000000019', 's13_rosetta_ovale',        'Rosetta ovale',                      15, '30000000-0000-0001-0018-000000000013'),
  ('20000000-0000-0000-0001-000000000019', 's13_pressione_ovale',      'A pressione con rosetta ovale',      16, '30000000-0000-0001-0018-000000000013'),
  ('20000000-0000-0000-0001-000000000019', 's14_rosetta_tonda',        'Rosetta tonda',                      17, '30000000-0000-0001-0018-000000000014'),
  ('20000000-0000-0000-0001-000000000019', 's14_rosetta_ovale',        'Rosetta ovale',                      18, '30000000-0000-0001-0018-000000000014'),
  ('20000000-0000-0000-0001-000000000019', 's14_pressione_ovale',      'A pressione con rosetta ovale',      19, '30000000-0000-0001-0018-000000000014'),
  ('20000000-0000-0000-0001-000000000019', 's15_rosetta_tonda',        'Rosetta tonda',                      20, '30000000-0000-0001-0018-000000000015'),
  ('20000000-0000-0000-0001-000000000019', 's15_rosetta_ovale',        'Rosetta ovale',                      21, '30000000-0000-0001-0018-000000000015'),
  ('20000000-0000-0000-0001-000000000019', 's15_pressione_ovale',      'A pressione con rosetta ovale',      22, '30000000-0000-0001-0018-000000000015'),
  ('20000000-0000-0000-0001-000000000019', 's16_rosetta_tonda',        'Rosetta tonda',                      23, '30000000-0000-0001-0018-000000000016'),
  ('20000000-0000-0000-0001-000000000019', 's16_rosetta_ovale',        'Rosetta ovale',                      24, '30000000-0000-0001-0018-000000000016'),
  ('20000000-0000-0000-0001-000000000019', 's16_pressione_ovale',      'A pressione con rosetta ovale',      25, '30000000-0000-0001-0018-000000000016')
ON CONFLICT (category_option_id, value_key) DO NOTHING;

-- Colore Maniglie (condizionale su modello)
INSERT INTO public.category_option_values (category_option_id, value_key, value_label, sort_order, depends_on_value_id) VALUES
  -- Serie 1
  ('20000000-0000-0000-0001-000000000020', 's1_bianco',           'Bianco',            1,  '30000000-0000-0001-0018-000000000001'),
  ('20000000-0000-0000-0001-000000000020', 's1_bianco_perla',     'Bianco perla',      2,  '30000000-0000-0001-0018-000000000001'),
  ('20000000-0000-0000-0001-000000000020', 's1_cromo_satinato',   'Cromo satinato',    3,  '30000000-0000-0001-0018-000000000001'),
  ('20000000-0000-0000-0001-000000000020', 's1_titanio',          'Titanio',           4,  '30000000-0000-0001-0018-000000000001'),
  ('20000000-0000-0000-0001-000000000020', 's1_bronzo',           'Bronzo',            5,  '30000000-0000-0001-0018-000000000001'),
  ('20000000-0000-0000-0001-000000000020', 's1_ottone_lucido',    'Ottone lucido',     6,  '30000000-0000-0001-0018-000000000001'),
  -- Serie 2
  ('20000000-0000-0000-0001-000000000020', 's2_bianco_opaco',     'Bianco opaco',      7,  '30000000-0000-0001-0018-000000000002'),
  ('20000000-0000-0000-0001-000000000020', 's2_titanio',          'Titanio',           8,  '30000000-0000-0001-0018-000000000002'),
  ('20000000-0000-0000-0001-000000000020', 's2_nero_opaco',       'Nero opaco',        9,  '30000000-0000-0001-0018-000000000002'),
  -- Serie 3
  ('20000000-0000-0000-0001-000000000020', 's3_acciaio_inox',     'Acciaio inox',      10, '30000000-0000-0001-0018-000000000003'),
  -- Serie 11-16 (stessi colori)
  ('20000000-0000-0000-0001-000000000020', 's11_cromo_satinato',  'Cromo satinato',    11, '30000000-0000-0001-0018-000000000011'),
  ('20000000-0000-0000-0001-000000000020', 's11_acciaio_inox',    'Acciaio inox',      12, '30000000-0000-0001-0018-000000000011'),
  ('20000000-0000-0000-0001-000000000020', 's11_nero_anodizzato', 'Nero anodizzato',   13, '30000000-0000-0001-0018-000000000011'),
  ('20000000-0000-0000-0001-000000000020', 's11_gruppo_finstral', 'Gruppo colore 1+2 Finstral', 14, '30000000-0000-0001-0018-000000000011'),
  ('20000000-0000-0000-0001-000000000020', 's12_cromo_satinato',  'Cromo satinato',    15, '30000000-0000-0001-0018-000000000012'),
  ('20000000-0000-0000-0001-000000000020', 's12_acciaio_inox',    'Acciaio inox',      16, '30000000-0000-0001-0018-000000000012'),
  ('20000000-0000-0000-0001-000000000020', 's12_nero_anodizzato', 'Nero anodizzato',   17, '30000000-0000-0001-0018-000000000012'),
  ('20000000-0000-0000-0001-000000000020', 's12_gruppo_finstral', 'Gruppo colore 1+2 Finstral', 18, '30000000-0000-0001-0018-000000000012'),
  ('20000000-0000-0000-0001-000000000020', 's13_cromo_satinato',  'Cromo satinato',    19, '30000000-0000-0001-0018-000000000013'),
  ('20000000-0000-0000-0001-000000000020', 's13_acciaio_inox',    'Acciaio inox',      20, '30000000-0000-0001-0018-000000000013'),
  ('20000000-0000-0000-0001-000000000020', 's13_nero_anodizzato', 'Nero anodizzato',   21, '30000000-0000-0001-0018-000000000013'),
  ('20000000-0000-0000-0001-000000000020', 's13_gruppo_finstral', 'Gruppo colore 1+2 Finstral', 22, '30000000-0000-0001-0018-000000000013'),
  ('20000000-0000-0000-0001-000000000020', 's14_cromo_satinato',  'Cromo satinato',    23, '30000000-0000-0001-0018-000000000014'),
  ('20000000-0000-0000-0001-000000000020', 's14_acciaio_inox',    'Acciaio inox',      24, '30000000-0000-0001-0018-000000000014'),
  ('20000000-0000-0000-0001-000000000020', 's14_nero_anodizzato', 'Nero anodizzato',   25, '30000000-0000-0001-0018-000000000014'),
  ('20000000-0000-0000-0001-000000000020', 's14_gruppo_finstral', 'Gruppo colore 1+2 Finstral', 26, '30000000-0000-0001-0018-000000000014'),
  ('20000000-0000-0000-0001-000000000020', 's15_cromo_satinato',  'Cromo satinato',    27, '30000000-0000-0001-0018-000000000015'),
  ('20000000-0000-0000-0001-000000000020', 's15_acciaio_inox',    'Acciaio inox',      28, '30000000-0000-0001-0018-000000000015'),
  ('20000000-0000-0000-0001-000000000020', 's15_nero_anodizzato', 'Nero anodizzato',   29, '30000000-0000-0001-0018-000000000015'),
  ('20000000-0000-0000-0001-000000000020', 's15_gruppo_finstral', 'Gruppo colore 1+2 Finstral', 30, '30000000-0000-0001-0018-000000000015'),
  ('20000000-0000-0000-0001-000000000020', 's16_cromo_satinato',  'Cromo satinato',    31, '30000000-0000-0001-0018-000000000016'),
  ('20000000-0000-0000-0001-000000000020', 's16_acciaio_inox',    'Acciaio inox',      32, '30000000-0000-0001-0018-000000000016'),
  ('20000000-0000-0000-0001-000000000020', 's16_nero_anodizzato', 'Nero anodizzato',   33, '30000000-0000-0001-0018-000000000016'),
  ('20000000-0000-0000-0001-000000000020', 's16_gruppo_finstral', 'Gruppo colore 1+2 Finstral', 34, '30000000-0000-0001-0018-000000000016')
ON CONFLICT (category_option_id, value_key) DO NOTHING;

-- Cerniere
INSERT INTO public.category_option_values (category_option_id, value_key, value_label, sort_order) VALUES
  ('20000000-0000-0000-0001-000000000022', 'a_scomparsa', 'A scomparsa', 1),
  ('20000000-0000-0000-0001-000000000022', 'a_vista',     'A vista',     2)
ON CONFLICT (category_option_id, value_key) DO NOTHING;

-- Senso apertura posizione
INSERT INTO public.category_option_values (category_option_id, value_key, value_label, sort_order) VALUES
  ('20000000-0000-0000-0001-000000000103', 'sx',    'Sinistra', 1),
  ('20000000-0000-0000-0001-000000000103', 'dx',    'Destra',   2),
  ('20000000-0000-0000-0001-000000000103', 'anta_ribalta_sx', 'Anta-Ribalta Sx', 3),
  ('20000000-0000-0000-0001-000000000103', 'anta_ribalta_dx', 'Anta-Ribalta Dx', 4),
  ('20000000-0000-0000-0001-000000000103', 'vasistas', 'Vasistas', 5)
ON CONFLICT (category_option_id, value_key) DO NOTHING;

-- Telaio posizione
INSERT INTO public.category_option_values (category_option_id, value_key, value_label, sort_order) VALUES
  ('20000000-0000-0000-0001-000000000120', 'L', 'L', 1),
  ('20000000-0000-0000-0001-000000000120', 'Z', 'Z', 2)
ON CONFLICT (category_option_id, value_key) DO NOTHING;

-- ============================================================
-- 2. PERSIANE — Opzioni
-- ============================================================

INSERT INTO public.category_options (id, category_id, option_key, option_label, option_type, is_required, sort_order, applies_to_position, depends_on_option_id, depends_on_values_json, is_active) VALUES
  -- Globali
  ('20000000-0000-0000-0002-000000000001', '10000000-0000-0000-0000-000000000002', 'modello',                'Modello',                  'select',  true,  1,  false, NULL, NULL, true),
  ('20000000-0000-0000-0002-000000000002', '10000000-0000-0000-0000-000000000002', 'tipologia',              'Tipologia',                'select',  true,  2,  false, NULL, NULL, true),
  ('20000000-0000-0000-0002-000000000003', '10000000-0000-0000-0000-000000000002', 'colore',                 'Colore',                   'text',    false, 3,  false, NULL, NULL, true),
  ('20000000-0000-0000-0002-000000000004', '10000000-0000-0000-0000-000000000002', 'ovalina',                'Ovalina',                  'select',  false, 4,  false, NULL, NULL, true),
  ('20000000-0000-0000-0002-000000000005', '10000000-0000-0000-0000-000000000002', 'scelta_tipologia',       'Scelta Tipologia',         'select',  false, 5,  false, '20000000-0000-0000-0002-000000000002', '["Anta a muro"]', true),
  ('20000000-0000-0000-0002-000000000006', '10000000-0000-0000-0000-000000000002', 'scelta_tipologia_telaio','Scelta Tipologia Telaio',  'select',  false, 6,  false, '20000000-0000-0000-0002-000000000002', '["Su telaio"]', true),
  ('20000000-0000-0000-0002-000000000007', '10000000-0000-0000-0000-000000000002', 'scelta_tipologia_2',     'Montaggio',                'select',  false, 7,  false, '20000000-0000-0000-0002-000000000002', '["Anta a muro"]', true),
  ('20000000-0000-0000-0002-000000000008', '10000000-0000-0000-0000-000000000002', 'chiusura',               'Chiusura',                 'select',  false, 8,  false, NULL, NULL, true),
  ('20000000-0000-0000-0002-000000000009', '10000000-0000-0000-0000-000000000002', 'opzione_chiusura',       'Opzione Chiusura',         'select',  false, 9,  false, NULL, NULL, true),
  ('20000000-0000-0000-0002-000000000010', '10000000-0000-0000-0000-000000000002', 'fermapersiana',          'Fermapersiana',            'select',  false, 10, false, NULL, NULL, true),
  -- Posizione
  ('20000000-0000-0000-0002-000000000101', '10000000-0000-0000-0000-000000000002', 'descrizione',            'Descrizione',              'text',    false, 1,  true, true),
  ('20000000-0000-0000-0002-000000000102', '10000000-0000-0000-0000-000000000002', 'quantita',               'Quantita',                 'number',  true,  2,  true, true),
  ('20000000-0000-0000-0002-000000000103', '10000000-0000-0000-0000-000000000002', 'senso_apertura',         'Senso di apertura',        'select',  false, 3,  true, true),
  ('20000000-0000-0000-0002-000000000104', '10000000-0000-0000-0000-000000000002', 'larghezza',              'Larghezza (mm)',           'number',  true,  4,  true, true),
  ('20000000-0000-0000-0002-000000000105', '10000000-0000-0000-0000-000000000002', 'altezza',                'Altezza (mm)',             'number',  true,  5,  true, true),
  ('20000000-0000-0000-0002-000000000106', '10000000-0000-0000-0000-000000000002', 'ante',                   'Ante persiane',            'number',  false, 6,  true, true),
  ('20000000-0000-0000-0002-000000000107', '10000000-0000-0000-0000-000000000002', 'serratura',              'Serratura',                'boolean', false, 7,  true, true),
  ('20000000-0000-0000-0002-000000000108', '10000000-0000-0000-0000-000000000002', 'gioco_l',                'Gioco L',                  'number',  false, 8,  true, true),
  ('20000000-0000-0000-0002-000000000109', '10000000-0000-0000-0000-000000000002', 'gioco_h',                'Gioco H',                  'number',  false, 9,  true, true),
  ('20000000-0000-0000-0002-000000000110', '10000000-0000-0000-0000-000000000002', 'note',                   'Note',                     'text',    false, 10, true, true)
ON CONFLICT (category_id, option_key) DO NOTHING;

-- Valori Persiane
INSERT INTO public.category_option_values (category_option_id, value_key, value_label, sort_order) VALUES
  -- Modello
  ('20000000-0000-0000-0002-000000000001', 'classica',        'Classica',        1),
  ('20000000-0000-0000-0002-000000000001', 'piemontese',      'Piemontese',      2),
  ('20000000-0000-0000-0002-000000000001', 'genovese',        'Genovese',        3),
  ('20000000-0000-0000-0002-000000000001', 'anta_scuro',      'Anta Scuro',      4),
  ('20000000-0000-0000-0002-000000000001', 'antone_rustico',  'Antone Rustico',  5),
  ('20000000-0000-0000-0002-000000000001', 'libro',           'Libro',           6),
  -- Tipologia
  ('20000000-0000-0000-0002-000000000002', 'anta_a_muro',  'Anta a muro', 1),
  ('20000000-0000-0000-0002-000000000002', 'su_telaio',    'Su telaio',   2),
  -- Ovalina
  ('20000000-0000-0000-0002-000000000004', 'fissa',        'Fissa',       1),
  ('20000000-0000-0000-0002-000000000004', 'orientabile',  'Orientabile', 2),
  -- Scelta tipologia (anta a muro)
  ('20000000-0000-0000-0002-000000000005', 'bandella_monza',    'Bandella Monza',    1),
  ('20000000-0000-0000-0002-000000000005', 'cantonali_a_vista', 'Cantonali a vista', 2),
  -- Scelta tipologia telaio (su telaio)
  ('20000000-0000-0000-0002-000000000006', 't5',         'T5',         1),
  ('20000000-0000-0000-0002-000000000006', 't9',         'T9',         2),
  ('20000000-0000-0000-0002-000000000006', 'aletta_36',  'Aletta 36',  3),
  ('20000000-0000-0000-0002-000000000006', 'aletta_70',  'Aletta 70',  4),
  ('20000000-0000-0000-0002-000000000006', 'mini',       'Mini',       5),
  -- Montaggio (anta a muro)
  ('20000000-0000-0000-0002-000000000007', 'montato',       'Montato',       1),
  ('20000000-0000-0000-0002-000000000007', 'fornito_sfuso', 'Fornito sfuso', 2),
  -- Chiusura
  ('20000000-0000-0000-0002-000000000008', 'spagnoletta', 'Spagnoletta', 1),
  ('20000000-0000-0000-0002-000000000008', 'applica',     'Applica',     2),
  -- Opzione chiusura
  ('20000000-0000-0000-0002-000000000009', 'montata',       'Montata',       1),
  ('20000000-0000-0000-0002-000000000009', 'fornita_sfusa', 'Fornita sfusa', 2),
  -- Fermapersiana
  ('20000000-0000-0000-0002-000000000010', 'grillo',         'Grillo',         1),
  ('20000000-0000-0000-0002-000000000010', 'calamita',       'Calamita',       2),
  ('20000000-0000-0000-0002-000000000010', 'torbell',        'Torbell',        3),
  ('20000000-0000-0000-0002-000000000010', 'tipo_mini_cric', 'Tipo Mini Cric', 4),
  -- Senso apertura posizione
  ('20000000-0000-0000-0002-000000000103', 'sx', 'Sinistra', 1),
  ('20000000-0000-0000-0002-000000000103', 'dx', 'Destra',   2)
ON CONFLICT (category_option_id, value_key) DO NOTHING;

-- ============================================================
-- 3. AVVOLGIBILI — Opzioni
-- ============================================================

INSERT INTO public.category_options (id, category_id, option_key, option_label, option_type, is_required, sort_order, applies_to_position, depends_on_option_id, depends_on_values_json, is_active) VALUES
  -- Globali
  ('20000000-0000-0000-0003-000000000001', '10000000-0000-0000-0000-000000000003', 'materiale',              'Materiale',                'select',  true,  1,  false, NULL, NULL, true),
  ('20000000-0000-0000-0003-000000000002', '10000000-0000-0000-0000-000000000003', 'colore',                 'Colore',                   'text',    false, 2,  false, NULL, NULL, true),
  ('20000000-0000-0000-0003-000000000003', '10000000-0000-0000-0000-000000000003', 'guide',                  'Guide',                    'select',  false, 3,  false, NULL, NULL, true),
  ('20000000-0000-0000-0003-000000000004', '10000000-0000-0000-0000-000000000003', 'azionamento',            'Azionamento',              'select',  false, 4,  false, NULL, NULL, true),
  ('20000000-0000-0000-0003-000000000005', '10000000-0000-0000-0000-000000000003', 'celino_cassonetto',      'Celino o Cassonetto',      'number',  false, 5,  false, NULL, NULL, true),
  ('20000000-0000-0000-0003-000000000006', '10000000-0000-0000-0000-000000000003', 'coibentazione_cassonetti','Coibentazione Cassonetti', 'boolean', false, 6,  false, NULL, NULL, true),
  ('20000000-0000-0000-0003-000000000007', '10000000-0000-0000-0000-000000000003', 'cuscinetti_staffe',      'Cuscinetti e Staffe',      'text',    false, 7,  false, NULL, NULL, true),
  -- Posizione
  ('20000000-0000-0000-0003-000000000101', '10000000-0000-0000-0000-000000000003', 'descrizione',            'Descrizione',              'text',    false, 1,  true, true),
  ('20000000-0000-0000-0003-000000000102', '10000000-0000-0000-0000-000000000003', 'quantita',               'Quantita',                 'number',  true,  2,  true, true),
  ('20000000-0000-0000-0003-000000000103', '10000000-0000-0000-0000-000000000003', 'larghezza',              'Larghezza (mm)',           'number',  true,  3,  true, true),
  ('20000000-0000-0000-0003-000000000104', '10000000-0000-0000-0000-000000000003', 'altezza',                'Altezza (mm)',             'number',  true,  4,  true, true),
  ('20000000-0000-0000-0003-000000000105', '10000000-0000-0000-0000-000000000003', 'motore',                 'Motore avvolgibili',       'boolean', false, 5,  true, true),
  ('20000000-0000-0000-0003-000000000106', '10000000-0000-0000-0000-000000000003', 'interasse_avvolgicorda', 'Interasse Avvolgicorda',   'select',  false, 6,  true, true),
  ('20000000-0000-0000-0003-000000000107', '10000000-0000-0000-0000-000000000003', 'note',                   'Note',                     'text',    false, 7,  true, true)
ON CONFLICT (category_id, option_key) DO NOTHING;

INSERT INTO public.category_option_values (category_option_id, value_key, value_label, sort_order) VALUES
  -- Materiale avvolgibili
  ('20000000-0000-0000-0003-000000000001', 'alluminio_coibentato',  'Alluminio coibentato',    1),
  ('20000000-0000-0000-0003-000000000001', 'alluminio_alta_densita','Alluminio alta densita',  2),
  ('20000000-0000-0000-0003-000000000001', 'pvc',                   'PVC',                     3),
  -- Guide
  ('20000000-0000-0000-0003-000000000003', 'nuove',        'Nuove',        1),
  ('20000000-0000-0000-0003-000000000003', 'sostituzione', 'Sostituzione', 2),
  -- Azionamento
  ('20000000-0000-0000-0003-000000000004', 'manuale',      'Manuale',      1),
  ('20000000-0000-0000-0003-000000000004', 'motorizzato',  'Motorizzato',  2),
  -- Interasse avvolgicorda
  ('20000000-0000-0000-0003-000000000106', '145', '145', 1),
  ('20000000-0000-0000-0003-000000000106', '165', '165', 2),
  ('20000000-0000-0000-0003-000000000106', '185', '185', 3),
  ('20000000-0000-0000-0003-000000000106', '205', '205', 4)
ON CONFLICT (category_option_id, value_key) DO NOTHING;

-- ============================================================
-- 4. ZANZARIERE / TENDE — Opzioni
-- ============================================================

INSERT INTO public.category_options (id, category_id, option_key, option_label, option_type, is_required, sort_order, applies_to_position, depends_on_option_id, depends_on_values_json, is_active) VALUES
  -- Globali
  ('20000000-0000-0000-0004-000000000001', '10000000-0000-0000-0000-000000000004', 'tipologia',    'Tipologia',        'select', true,  1, false, NULL, NULL, true),
  ('20000000-0000-0000-0004-000000000002', '10000000-0000-0000-0000-000000000004', 'modello',      'Modello',          'text',   false, 2, false, NULL, NULL, true),
  ('20000000-0000-0000-0004-000000000003', '10000000-0000-0000-0000-000000000004', 'colore',       'Colore',           'text',   false, 3, false, NULL, NULL, true),
  ('20000000-0000-0000-0004-000000000004', '10000000-0000-0000-0000-000000000004', 'misure_rilevate','Misure Rilevate', 'select', false, 4, false, NULL, NULL, true),
  ('20000000-0000-0000-0004-000000000005', '10000000-0000-0000-0000-000000000004', 'azionamento',  'Azionamento',      'select', false, 5, false, NULL, NULL, true),
  ('20000000-0000-0000-0004-000000000006', '10000000-0000-0000-0000-000000000004', 'sgancio',      'Sgancio',          'select', false, 6, false, NULL, NULL, true),
  ('20000000-0000-0000-0004-000000000007', '10000000-0000-0000-0000-000000000004', 'rete',         'Rete',             'select', false, 7, false, NULL, NULL, true),
  ('20000000-0000-0000-0004-000000000008', '10000000-0000-0000-0000-000000000004', 'note_globali', 'Note',             'text',   false, 8, false, NULL, NULL, true),
  -- Posizione
  ('20000000-0000-0000-0004-000000000101', '10000000-0000-0000-0000-000000000004', 'descrizione',        'Descrizione',              'text',   false, 1,  true, true),
  ('20000000-0000-0000-0004-000000000102', '10000000-0000-0000-0000-000000000004', 'quantita',           'Quantita',                 'number', true,  2,  true, true),
  ('20000000-0000-0000-0004-000000000103', '10000000-0000-0000-0000-000000000004', 'senso_apertura',     'Senso di apertura',        'select', false, 3,  true, true),
  ('20000000-0000-0000-0004-000000000104', '10000000-0000-0000-0000-000000000004', 'larghezza',          'Larghezza (mm)',           'number', true,  4,  true, true),
  ('20000000-0000-0000-0004-000000000105', '10000000-0000-0000-0000-000000000004', 'altezza',            'Altezza (mm)',             'number', true,  5,  true, true),
  ('20000000-0000-0000-0004-000000000106', '10000000-0000-0000-0000-000000000004', 'modello_posizione',  'Modello',                  'select', false, 6,  true, true),
  ('20000000-0000-0000-0004-000000000107', '10000000-0000-0000-0000-000000000004', 'gioco_l',            'Gioco L',                  'number', false, 7,  true, true),
  ('20000000-0000-0000-0004-000000000108', '10000000-0000-0000-0000-000000000004', 'gioco_h',            'Gioco H',                  'number', false, 8,  true, true),
  ('20000000-0000-0000-0004-000000000109', '10000000-0000-0000-0000-000000000004', 'note',               'Note',                     'text',   false, 9,  true, true)
ON CONFLICT (category_id, option_key) DO NOTHING;

INSERT INTO public.category_option_values (category_option_id, value_key, value_label, sort_order) VALUES
  ('20000000-0000-0000-0004-000000000001', 'zanzariera', 'Zanzariera', 1),
  ('20000000-0000-0000-0004-000000000001', 'tenda',      'Tenda',      2),
  ('20000000-0000-0000-0004-000000000004', 'luce_muro',  'Luce muro',  1),
  ('20000000-0000-0000-0004-000000000004', 'incasso',    'Incasso',    2),
  ('20000000-0000-0000-0004-000000000005', 'manuale',    'Manuale',    1),
  ('20000000-0000-0000-0004-000000000005', 'motorizzato','Motorizzato',2),
  ('20000000-0000-0000-0004-000000000006', 'cricchetto',       'Cricchetto',       1),
  ('20000000-0000-0000-0004-000000000006', 'barra_maniglia',   'Barra maniglia',   2),
  ('20000000-0000-0000-0004-000000000006', 'calamita',         'Calamita',         3),
  ('20000000-0000-0000-0004-000000000007', 'nera',     'Nera',      1),
  ('20000000-0000-0000-0004-000000000007', 'grigia',   'Grigia',    2),
  ('20000000-0000-0000-0004-000000000007', 'fabrinet', 'Fabrinet',  3),
  ('20000000-0000-0000-0004-000000000103', 'sx', 'Sinistra', 1),
  ('20000000-0000-0000-0004-000000000103', 'dx', 'Destra',   2),
  ('20000000-0000-0000-0004-000000000106', 'laterale_guida_bassa', 'Laterale guida bassa', 1),
  ('20000000-0000-0000-0004-000000000106', 'verticale',            'Verticale',            2),
  ('20000000-0000-0000-0004-000000000106', 'laterale_guida_alta',  'Laterale guida alta',  3)
ON CONFLICT (category_option_id, value_key) DO NOTHING;

-- ============================================================
-- 5. BLINDATI / PORTONCINI — Opzioni
-- ============================================================

INSERT INTO public.category_options (id, category_id, option_key, option_label, option_type, is_required, sort_order, applies_to_position, depends_on_option_id, depends_on_values_json, is_active) VALUES
  -- Globali
  ('20000000-0000-0000-0005-000000000001', '10000000-0000-0000-0000-000000000005', 'modello',                  'Modello',                    'select',  true,  1,  false, NULL, NULL, true),
  ('20000000-0000-0000-0005-000000000002', '10000000-0000-0000-0000-000000000005', 'pannello_esterno_colore',  'Pannello Esterno - Colore',  'text',    false, 2,  false, NULL, NULL, true),
  ('20000000-0000-0000-0005-000000000003', '10000000-0000-0000-0000-000000000005', 'pannello_interno_colore',  'Pannello Interno - Colore',  'text',    false, 3,  false, NULL, NULL, true),
  ('20000000-0000-0000-0005-000000000004', '10000000-0000-0000-0000-000000000005', 'telaio',                   'Telaio',                     'text',    false, 4,  false, NULL, NULL, true),
  ('20000000-0000-0000-0005-000000000005', '10000000-0000-0000-0000-000000000005', 'coprifilo',                'Coprifilo',                  'select',  false, 5,  false, NULL, NULL, true),
  ('20000000-0000-0000-0005-000000000006', '10000000-0000-0000-0000-000000000005', 'materiale_coprifilo',      'Materiale Coprifilo',        'select',  false, 6,  false, NULL, NULL, true),
  ('20000000-0000-0000-0005-000000000007', '10000000-0000-0000-0000-000000000005', 'soglia',                   'Soglia',                     'boolean', false, 7,  false, NULL, NULL, true),
  ('20000000-0000-0000-0005-000000000008', '10000000-0000-0000-0000-000000000005', 'passata',                  'Passata',                    'boolean', false, 8,  false, NULL, NULL, true),
  ('20000000-0000-0000-0005-000000000009', '10000000-0000-0000-0000-000000000005', 'misura_passata_l',         'Misura Passata - Larghezza', 'number',  false, 9,  false, '20000000-0000-0000-0005-000000000008', NULL, true),
  ('20000000-0000-0000-0005-000000000010', '10000000-0000-0000-0000-000000000005', 'misura_passata_h',         'Misura Passata - Altezza',   'number',  false, 10, false, '20000000-0000-0000-0005-000000000008', NULL, true),
  ('20000000-0000-0000-0005-000000000011', '10000000-0000-0000-0000-000000000005', 'serratura',                'Serratura',                  'select',  false, 11, false, NULL, NULL, true),
  ('20000000-0000-0000-0005-000000000012', '10000000-0000-0000-0000-000000000005', 'spioncino',                'Spioncino',                  'boolean', false, 12, false, NULL, NULL, true),
  -- Posizione
  ('20000000-0000-0000-0005-000000000101', '10000000-0000-0000-0000-000000000005', 'descrizione',     'Descrizione',            'text',   false, 1, true, true),
  ('20000000-0000-0000-0005-000000000102', '10000000-0000-0000-0000-000000000005', 'quantita',        'Quantita',               'number', true,  2, true, true),
  ('20000000-0000-0000-0005-000000000103', '10000000-0000-0000-0000-000000000005', 'larghezza',       'Larghezza (mm)',         'number', true,  3, true, true),
  ('20000000-0000-0000-0005-000000000104', '10000000-0000-0000-0000-000000000005', 'altezza',         'Altezza (mm)',           'number', true,  4, true, true),
  ('20000000-0000-0000-0005-000000000105', '10000000-0000-0000-0000-000000000005', 'senso_apertura',  'Senso Apertura Ante',    'select', false, 5, true, true),
  ('20000000-0000-0000-0005-000000000106', '10000000-0000-0000-0000-000000000005', 'passata_esterna', 'Passata Esterna',        'text',   false, 6, true, true),
  ('20000000-0000-0000-0005-000000000107', '10000000-0000-0000-0000-000000000005', 'note',            'Note',                   'text',   false, 7, true, true)
ON CONFLICT (category_id, option_key) DO NOTHING;

INSERT INTO public.category_option_values (category_option_id, value_key, value_label, sort_order) VALUES
  ('20000000-0000-0000-0005-000000000001', 'pr7',   'PR7',   1),
  ('20000000-0000-0000-0005-000000000001', 'sr2',   'SR2',   2),
  ('20000000-0000-0000-0005-000000000001', 'altro', 'Altro', 3),
  ('20000000-0000-0000-0005-000000000005', 'interno', 'Interno', 1),
  ('20000000-0000-0000-0005-000000000005', 'esterno', 'Esterno', 2),
  ('20000000-0000-0000-0005-000000000006', 'pvc',       'PVC',       1),
  ('20000000-0000-0000-0005-000000000006', 'alluminio', 'Alluminio', 2),
  ('20000000-0000-0000-0005-000000000006', 'legno',     'Legno',     3),
  ('20000000-0000-0000-0005-000000000011', 'standard',           'Standard',           1),
  ('20000000-0000-0000-0005-000000000011', 'elettrica',          'Elettrica',          2),
  ('20000000-0000-0000-0005-000000000011', 'elettronica_smart',  'Elettronica smart',  3),
  ('20000000-0000-0000-0005-000000000105', 'sx', 'Sinistra', 1),
  ('20000000-0000-0000-0005-000000000105', 'dx', 'Destra',   2)
ON CONFLICT (category_option_id, value_key) DO NOTHING;

-- ============================================================
-- 6. PORTE INTERNE — Opzioni
-- ============================================================

INSERT INTO public.category_options (id, category_id, option_key, option_label, option_type, is_required, sort_order, applies_to_position, depends_on_option_id, depends_on_values_json, is_active) VALUES
  -- Globali
  ('20000000-0000-0000-0006-000000000001', '10000000-0000-0000-0000-000000000006', 'serie',            'Serie',            'select', true,  1, false, NULL, NULL, true),
  ('20000000-0000-0000-0006-000000000002', '10000000-0000-0000-0000-000000000006', 'modello',          'Modello',          'text',   false, 2, false, NULL, NULL, true),
  ('20000000-0000-0000-0006-000000000003', '10000000-0000-0000-0000-000000000006', 'colore',           'Colore',           'text',   false, 3, false, NULL, NULL, true),
  ('20000000-0000-0000-0006-000000000004', '10000000-0000-0000-0000-000000000006', 'telaio',           'Telaio',           'select', false, 4, false, NULL, NULL, true),
  ('20000000-0000-0000-0006-000000000005', '10000000-0000-0000-0000-000000000006', 'modello_maniglie', 'Modello Maniglie', 'text',   false, 5, false, NULL, NULL, true),
  -- Posizione
  ('20000000-0000-0000-0006-000000000101', '10000000-0000-0000-0000-000000000006', 'descrizione',               'Descrizione',               'text',    false, 1,  true, true),
  ('20000000-0000-0000-0006-000000000102', '10000000-0000-0000-0000-000000000006', 'quantita',                  'Quantita',                  'number',  true,  2,  true, true),
  ('20000000-0000-0000-0006-000000000103', '10000000-0000-0000-0000-000000000006', 'senso_apertura',            'Senso di apertura',         'select',  false, 3,  true, true),
  ('20000000-0000-0000-0006-000000000104', '10000000-0000-0000-0000-000000000006', 'larghezza_passaggio',       'Larghezza passaggio',       'number',  true,  4,  true, true),
  ('20000000-0000-0000-0006-000000000105', '10000000-0000-0000-0000-000000000006', 'altezza_passaggio',         'Altezza passaggio',         'number',  true,  5,  true, true),
  ('20000000-0000-0000-0006-000000000106', '10000000-0000-0000-0000-000000000006', 'tipologia',                 'Tipologia Porte Interne',   'select',  false, 6,  true, true),
  ('20000000-0000-0000-0006-000000000107', '10000000-0000-0000-0000-000000000006', 'cerniere',                  'Cerniere',                  'select',  false, 7,  true, true),
  ('20000000-0000-0000-0006-000000000108', '10000000-0000-0000-0000-000000000006', 'serratura',                 'Serratura',                 'boolean', false, 8,  true, true),
  ('20000000-0000-0000-0006-000000000109', '10000000-0000-0000-0000-000000000006', 'lama_para_spifferi',        'Lama Para Spifferi',        'boolean', false, 9,  true, true),
  ('20000000-0000-0000-0006-000000000110', '10000000-0000-0000-0000-000000000006', 'mazzetta_muro',             'Mazzetta Muro',             'text',    false, 10, true, true),
  ('20000000-0000-0000-0006-000000000111', '10000000-0000-0000-0000-000000000006', 'misura_interna_cassonetto', 'Misura Interna Cassonetto', 'number',  false, 11, true, true),
  ('20000000-0000-0000-0006-000000000112', '10000000-0000-0000-0000-000000000006', 'note',                      'Note',                      'text',    false, 12, true, true)
ON CONFLICT (category_id, option_key) DO NOTHING;

INSERT INTO public.category_option_values (category_option_id, value_key, value_label, sort_order) VALUES
  -- Serie
  ('20000000-0000-0000-0006-000000000001', 'sololegno',       'Sololegno',       1),
  ('20000000-0000-0000-0006-000000000001', 'trix',            'Trix',            2),
  ('20000000-0000-0000-0006-000000000001', 'visioni',         'Visioni',         3),
  ('20000000-0000-0000-0006-000000000001', 'visioni_profile', 'Visioni Profile', 4),
  ('20000000-0000-0000-0006-000000000001', 'futura',          'Futura',          5),
  -- Telaio
  ('20000000-0000-0000-0006-000000000004', 'standard',     'Standard',                        1),
  ('20000000-0000-0000-0006-000000000004', 'complanare_ts','Complanare a spingere -TS-',       2),
  ('20000000-0000-0000-0006-000000000004', 'complanare_tt','Complanare a tirare -TT-',         3),
  ('20000000-0000-0000-0006-000000000004', 'raso_muro_rs', 'Raso muro a spingere -RS-',       4),
  ('20000000-0000-0000-0006-000000000004', 'raso_muro_rt', 'Raso muro a tirare -RT-',         5),
  -- Senso apertura
  ('20000000-0000-0000-0006-000000000103', 'sx', 'Sinistra', 1),
  ('20000000-0000-0000-0006-000000000103', 'dx', 'Destra',   2),
  -- Tipologia porte interne
  ('20000000-0000-0000-0006-000000000106', 'battente',         'Battente',            1),
  ('20000000-0000-0000-0006-000000000106', 'sim',              'SIM',                 2),
  ('20000000-0000-0000-0006-000000000106', 'sem_con_telaio',   'SEM con telaio',      3),
  ('20000000-0000-0000-0006-000000000106', 'sem_senza_telaio', 'SEM senza telaio',    4),
  ('20000000-0000-0000-0006-000000000106', 'piego',            'Piego',               5),
  ('20000000-0000-0000-0006-000000000106', 'duo',              'Duo',                 6),
  ('20000000-0000-0000-0006-000000000106', 'traslo',           'Traslo',              7),
  ('20000000-0000-0000-0006-000000000106', 'ventola',          'Ventola',             8),
  -- Cerniere
  ('20000000-0000-0000-0006-000000000107', 'scomparsa', 'Scomparsa',  1),
  ('20000000-0000-0000-0006-000000000107', 'a_bilico',  'A bilico',   2),
  ('20000000-0000-0000-0006-000000000107', 'anuba',     'Anuba',      3)
ON CONFLICT (category_option_id, value_key) DO NOTHING;

-- ============================================================
-- 7. GRATE — Opzioni
-- ============================================================

INSERT INTO public.category_options (id, category_id, option_key, option_label, option_type, is_required, sort_order, applies_to_position, depends_on_option_id, depends_on_values_json, is_active) VALUES
  -- Globali
  ('20000000-0000-0000-0007-000000000001', '10000000-0000-0000-0000-000000000007', 'modello',         'Modello (Marca)',  'select', true,  1, false, NULL, NULL, true),
  ('20000000-0000-0000-0007-000000000002', '10000000-0000-0000-0000-000000000007', 'sotto_modello',   'Sotto-modello',    'select', false, 2, false, '20000000-0000-0000-0007-000000000001', NULL, true),
  ('20000000-0000-0000-0007-000000000003', '10000000-0000-0000-0000-000000000007', 'colore',          'Colore',           'text',   false, 3, false, NULL, NULL, true),
  ('20000000-0000-0000-0007-000000000004', '10000000-0000-0000-0000-000000000007', 'telaio',          'Telaio',           'select', false, 4, false, NULL, NULL, true),
  ('20000000-0000-0000-0007-000000000005', '10000000-0000-0000-0000-000000000007', 'snodo',           'Snodo',            'text',   false, 5, false, NULL, NULL, true),
  ('20000000-0000-0000-0007-000000000006', '10000000-0000-0000-0000-000000000007', 'bacchetta',       'Bacchetta',        'select', false, 6, false, NULL, NULL, true),
  ('20000000-0000-0000-0007-000000000007', '10000000-0000-0000-0000-000000000007', 'borchia',         'Borchia',          'select', false, 7, false, NULL, NULL, true),
  -- Posizione
  ('20000000-0000-0000-0007-000000000101', '10000000-0000-0000-0000-000000000007', 'descrizione',       'Descrizione',                        'text',    false, 1,  true, true),
  ('20000000-0000-0000-0007-000000000102', '10000000-0000-0000-0000-000000000007', 'quantita',          'Quantita',                           'number',  true,  2,  true, true),
  ('20000000-0000-0000-0007-000000000103', '10000000-0000-0000-0000-000000000007', 'senso_apertura',    'Senso Apertura (vista interna)',      'select',  false, 3,  true, true),
  ('20000000-0000-0000-0007-000000000104', '10000000-0000-0000-0000-000000000007', 'larghezza',         'Larghezza (mm)',                     'number',  true,  4,  true, true),
  ('20000000-0000-0000-0007-000000000105', '10000000-0000-0000-0000-000000000007', 'altezza',           'Altezza (mm)',                       'number',  true,  5,  true, true),
  ('20000000-0000-0000-0007-000000000106', '10000000-0000-0000-0000-000000000007', 'ante',              'Ante',                               'number',  false, 6,  true, true),
  ('20000000-0000-0000-0007-000000000107', '10000000-0000-0000-0000-000000000007', 'doppia_maniglia',   'Doppia Maniglia',                    'boolean', false, 7,  true, true),
  ('20000000-0000-0000-0007-000000000108', '10000000-0000-0000-0000-000000000007', 'gioco_l',           'Gioco L',                            'number',  false, 8,  true, true),
  ('20000000-0000-0000-0007-000000000109', '10000000-0000-0000-0000-000000000007', 'gioco_h',           'Gioco H',                            'number',  false, 9,  true, true),
  ('20000000-0000-0000-0007-000000000110', '10000000-0000-0000-0000-000000000007', 'larghezza_snodo',   'Larghezza Snodo',                    'number',  false, 10, true, true),
  ('20000000-0000-0000-0007-000000000111', '10000000-0000-0000-0000-000000000007', 'nottolino',         'Nottolino',                          'select',  false, 11, true, true),
  ('20000000-0000-0000-0007-000000000112', '10000000-0000-0000-0000-000000000007', 'tipologia',         'Tipologia',                          'select',  false, 12, true, true),
  ('20000000-0000-0000-0007-000000000113', '10000000-0000-0000-0000-000000000007', 'note',              'Note',                               'text',    false, 13, true, true)
ON CONFLICT (category_id, option_key) DO NOTHING;

-- Valori Grate - Modelli
INSERT INTO public.category_option_values (id, category_option_id, value_key, value_label, sort_order) VALUES
  ('30000000-0000-0007-0001-000000000001', '20000000-0000-0000-0007-000000000001', 'edilia',   'Edilia',   1),
  ('30000000-0000-0007-0001-000000000002', '20000000-0000-0000-0007-000000000001', 'perfekta', 'Perfekta', 2),
  ('30000000-0000-0007-0001-000000000003', '20000000-0000-0000-0007-000000000001', 'evoluta',  'Evoluta',  3),
  ('30000000-0000-0007-0001-000000000004', '20000000-0000-0000-0007-000000000001', 'libera',   'Libera',   4),
  ('30000000-0000-0007-0001-000000000005', '20000000-0000-0000-0007-000000000001', 'sikura',   'Sikura',   5),
  ('30000000-0000-0007-0001-000000000006', '20000000-0000-0000-0007-000000000001', 'combi',    'Combi',    6)
ON CONFLICT (category_option_id, value_key) DO NOTHING;

-- Sotto-modelli Grate (condizionali su modello)
INSERT INTO public.category_option_values (category_option_id, value_key, value_label, sort_order, depends_on_value_id) VALUES
  -- Edilia
  ('20000000-0000-0000-0007-000000000002', 'ed_basic_quadra',  'Basic Quadra',  1, '30000000-0000-0007-0001-000000000001'),
  ('20000000-0000-0000-0007-000000000002', 'ed_basic_tonda',   'Basic Tonda',   2, '30000000-0000-0007-0001-000000000001'),
  ('20000000-0000-0000-0007-000000000002', 'ed_royal_quadra',  'Royal Quadra',  3, '30000000-0000-0007-0001-000000000001'),
  ('20000000-0000-0000-0007-000000000002', 'ed_royal_tonda',   'Royal Tonda',   4, '30000000-0000-0007-0001-000000000001'),
  -- Perfekta
  ('20000000-0000-0000-0007-000000000002', 'pf_basic_quadra',    'Basic Quadra',    5,  '30000000-0000-0007-0001-000000000002'),
  ('20000000-0000-0000-0007-000000000002', 'pf_basic_tonda',     'Basic Tonda',     6,  '30000000-0000-0007-0001-000000000002'),
  ('20000000-0000-0000-0007-000000000002', 'pf_elegance_quadra', 'Elegance Quadra', 7,  '30000000-0000-0007-0001-000000000002'),
  ('20000000-0000-0000-0007-000000000002', 'pf_elegance_tonda',  'Elegance Tonda',  8,  '30000000-0000-0007-0001-000000000002'),
  ('20000000-0000-0000-0007-000000000002', 'pf_royal_quadra',    'Royal Quadra',    9,  '30000000-0000-0007-0001-000000000002'),
  ('20000000-0000-0000-0007-000000000002', 'pf_royal_tonda',     'Royal Tonda',     10, '30000000-0000-0007-0001-000000000002'),
  ('20000000-0000-0000-0007-000000000002', 'pf_style',           'Style',           11, '30000000-0000-0007-0001-000000000002'),
  ('20000000-0000-0000-0007-000000000002', 'pf_onda',            'Onda',            12, '30000000-0000-0007-0001-000000000002'),
  ('20000000-0000-0000-0007-000000000002', 'pf_classic_quadra',  'Classic Quadra',  13, '30000000-0000-0007-0001-000000000002'),
  ('20000000-0000-0000-0007-000000000002', 'pf_classic_tonda',   'Classic Tonda',   14, '30000000-0000-0007-0001-000000000002'),
  ('20000000-0000-0000-0007-000000000002', 'pf_liberty_quadra',  'Liberty Quadra',  15, '30000000-0000-0007-0001-000000000002'),
  ('20000000-0000-0000-0007-000000000002', 'pf_liberty_tonda',   'Liberty Tonda',   16, '30000000-0000-0007-0001-000000000002'),
  -- Evoluta
  ('20000000-0000-0000-0007-000000000002', 'ev_basic_quadra',    'Basic Quadra',    17, '30000000-0000-0007-0001-000000000003'),
  ('20000000-0000-0000-0007-000000000002', 'ev_basic_tonda',     'Basic Tonda',     18, '30000000-0000-0007-0001-000000000003'),
  ('20000000-0000-0000-0007-000000000002', 'ev_plus',            'Plus',            19, '30000000-0000-0007-0001-000000000003'),
  ('20000000-0000-0000-0007-000000000002', 'ev_deluxe',          'Deluxe',          20, '30000000-0000-0007-0001-000000000003'),
  ('20000000-0000-0000-0007-000000000002', 'ev_onda',            'Onda',            21, '30000000-0000-0007-0001-000000000003'),
  ('20000000-0000-0000-0007-000000000002', 'ev_elegance_tonda',  'Elegance Tonda',  22, '30000000-0000-0007-0001-000000000003'),
  ('20000000-0000-0000-0007-000000000002', 'ev_elegance_quadra', 'Elegance Quadra', 23, '30000000-0000-0007-0001-000000000003'),
  ('20000000-0000-0000-0007-000000000002', 'ev_royal_quadra',    'Royal Quadra',    24, '30000000-0000-0007-0001-000000000003'),
  ('20000000-0000-0000-0007-000000000002', 'ev_royal_tonda',     'Royal Tonda',     25, '30000000-0000-0007-0001-000000000003'),
  ('20000000-0000-0000-0007-000000000002', 'ev_style',           'Style',           26, '30000000-0000-0007-0001-000000000003'),
  ('20000000-0000-0000-0007-000000000002', 'ev_retro_quadra',    'Retro'' Quadra',  27, '30000000-0000-0007-0001-000000000003'),
  ('20000000-0000-0000-0007-000000000002', 'ev_retro_tonda',     'Retro'' Tonda',   28, '30000000-0000-0007-0001-000000000003'),
  ('20000000-0000-0000-0007-000000000002', 'ev_classic_quadra',  'Classic Quadra',  29, '30000000-0000-0007-0001-000000000003'),
  ('20000000-0000-0000-0007-000000000002', 'ev_classic_tonda',   'Classic Tonda',   30, '30000000-0000-0007-0001-000000000003'),
  ('20000000-0000-0000-0007-000000000002', 'ev_liberty_quadra',  'Liberty Quadra',  31, '30000000-0000-0007-0001-000000000003'),
  ('20000000-0000-0000-0007-000000000002', 'ev_liberty_tonda',   'Liberty Tonda',   32, '30000000-0000-0007-0001-000000000003'),
  ('20000000-0000-0000-0007-000000000002', 'ev_rombo_quadra',    'Rombo Quadra',    33, '30000000-0000-0007-0001-000000000003'),
  ('20000000-0000-0000-0007-000000000002', 'ev_rombo_tonda',     'Rombo Tonda',     34, '30000000-0000-0007-0001-000000000003'),
  -- Libera (stessi sotto-modelli di Evoluta)
  ('20000000-0000-0000-0007-000000000002', 'lb_basic_quadra',    'Basic Quadra',    35, '30000000-0000-0007-0001-000000000004'),
  ('20000000-0000-0000-0007-000000000002', 'lb_basic_tonda',     'Basic Tonda',     36, '30000000-0000-0007-0001-000000000004'),
  ('20000000-0000-0000-0007-000000000002', 'lb_plus',            'Plus',            37, '30000000-0000-0007-0001-000000000004'),
  ('20000000-0000-0000-0007-000000000002', 'lb_deluxe',          'Deluxe',          38, '30000000-0000-0007-0001-000000000004'),
  ('20000000-0000-0000-0007-000000000002', 'lb_onda',            'Onda',            39, '30000000-0000-0007-0001-000000000004'),
  ('20000000-0000-0000-0007-000000000002', 'lb_elegance_tonda',  'Elegance Tonda',  40, '30000000-0000-0007-0001-000000000004'),
  ('20000000-0000-0000-0007-000000000002', 'lb_elegance_quadra', 'Elegance Quadra', 41, '30000000-0000-0007-0001-000000000004'),
  ('20000000-0000-0000-0007-000000000002', 'lb_royal_quadra',    'Royal Quadra',    42, '30000000-0000-0007-0001-000000000004'),
  ('20000000-0000-0000-0007-000000000002', 'lb_royal_tonda',     'Royal Tonda',     43, '30000000-0000-0007-0001-000000000004'),
  ('20000000-0000-0000-0007-000000000002', 'lb_style',           'Style',           44, '30000000-0000-0007-0001-000000000004'),
  ('20000000-0000-0000-0007-000000000002', 'lb_retro_quadra',    'Retro'' Quadra',  45, '30000000-0000-0007-0001-000000000004'),
  ('20000000-0000-0000-0007-000000000002', 'lb_retro_tonda',     'Retro'' Tonda',   46, '30000000-0000-0007-0001-000000000004'),
  ('20000000-0000-0000-0007-000000000002', 'lb_classic_quadra',  'Classic Quadra',  47, '30000000-0000-0007-0001-000000000004'),
  ('20000000-0000-0000-0007-000000000002', 'lb_classic_tonda',   'Classic Tonda',   48, '30000000-0000-0007-0001-000000000004'),
  ('20000000-0000-0000-0007-000000000002', 'lb_liberty_quadra',  'Liberty Quadra',  49, '30000000-0000-0007-0001-000000000004'),
  ('20000000-0000-0000-0007-000000000002', 'lb_liberty_tonda',   'Liberty Tonda',   50, '30000000-0000-0007-0001-000000000004'),
  ('20000000-0000-0000-0007-000000000002', 'lb_rombo_quadra',    'Rombo Quadra',    51, '30000000-0000-0007-0001-000000000004'),
  ('20000000-0000-0000-0007-000000000002', 'lb_rombo_tonda',     'Rombo Tonda',     52, '30000000-0000-0007-0001-000000000004'),
  -- Sikura
  ('20000000-0000-0000-0007-000000000002', 'sk_basic_quadra',   'Basic Quadra',   53, '30000000-0000-0007-0001-000000000005'),
  ('20000000-0000-0000-0007-000000000002', 'sk_basic_tonda',    'Basic Tonda',    54, '30000000-0000-0007-0001-000000000005'),
  ('20000000-0000-0000-0007-000000000002', 'sk_plus',           'Plus',           55, '30000000-0000-0007-0001-000000000005'),
  ('20000000-0000-0000-0007-000000000002', 'sk_deluxe',         'Deluxe',         56, '30000000-0000-0007-0001-000000000005'),
  ('20000000-0000-0000-0007-000000000002', 'sk_onda',           'Onda',           57, '30000000-0000-0007-0001-000000000005'),
  ('20000000-0000-0000-0007-000000000002', 'sk_royal_quadra',   'Royal Quadra',   58, '30000000-0000-0007-0001-000000000005'),
  ('20000000-0000-0000-0007-000000000002', 'sk_royal_tonda',    'Royal Tonda',    59, '30000000-0000-0007-0001-000000000005'),
  ('20000000-0000-0000-0007-000000000002', 'sk_style',          'Style',          60, '30000000-0000-0007-0001-000000000005'),
  ('20000000-0000-0000-0007-000000000002', 'sk_classic_quadra', 'Classic Quadra', 61, '30000000-0000-0007-0001-000000000005'),
  ('20000000-0000-0000-0007-000000000002', 'sk_classic_tonda',  'Classic Tonda',  62, '30000000-0000-0007-0001-000000000005'),
  ('20000000-0000-0000-0007-000000000002', 'sk_liberty_quadra', 'Liberty Quadra', 63, '30000000-0000-0007-0001-000000000005'),
  ('20000000-0000-0000-0007-000000000002', 'sk_liberty_tonda',  'Liberty Tonda',  64, '30000000-0000-0007-0001-000000000005'),
  -- Combi
  ('20000000-0000-0000-0007-000000000002', 'cb_combi',      'Combi',      65, '30000000-0000-0007-0001-000000000006'),
  ('20000000-0000-0000-0007-000000000002', 'cb_combi_slim', 'Combi Slim', 66, '30000000-0000-0007-0001-000000000006')
ON CONFLICT (category_option_id, value_key) DO NOTHING;

-- Altri valori grate
INSERT INTO public.category_option_values (category_option_id, value_key, value_label, sort_order) VALUES
  ('20000000-0000-0000-0007-000000000004', 'ribassato_da_sopra', 'Ribassato da sopra', 1),
  ('20000000-0000-0000-0007-000000000006', 'tonda',  'Tonda',  1),
  ('20000000-0000-0000-0007-000000000006', 'quadra', 'Quadra', 2),
  ('20000000-0000-0000-0007-000000000007', 'si', 'Si', 1),
  ('20000000-0000-0000-0007-000000000007', 'no', 'No', 2),
  ('20000000-0000-0000-0007-000000000103', 'sx', 'Sinistra', 1),
  ('20000000-0000-0000-0007-000000000103', 'dx', 'Destra',   2),
  ('20000000-0000-0000-0007-000000000111', 'passante', 'Passante', 1)
ON CONFLICT (category_option_id, value_key) DO NOTHING;

-- ============================================================
-- 8. CASSONETTI / CELINI — Opzioni (solo posizione)
-- ============================================================

INSERT INTO public.category_options (id, category_id, option_key, option_label, option_type, is_required, sort_order, applies_to_position, is_active) VALUES
  ('20000000-0000-0000-0008-000000000101', '10000000-0000-0000-0000-000000000008', 'colore',            'Colore',            'text',    false, 1, true, true),
  ('20000000-0000-0000-0008-000000000102', '10000000-0000-0000-0000-000000000008', 'quantita',          'Quantita',          'number',  true,  2, true, true),
  ('20000000-0000-0000-0008-000000000103', '10000000-0000-0000-0000-000000000008', 'altezza_a',         'Altezza A',         'number',  false, 3, true, true),
  ('20000000-0000-0000-0008-000000000104', '10000000-0000-0000-0000-000000000008', 'inferiore_b',       'Inferiore B',       'number',  false, 4, true, true),
  ('20000000-0000-0000-0008-000000000105', '10000000-0000-0000-0000-000000000008', 'superiore_c',       'Superiore C',       'number',  false, 5, true, true),
  ('20000000-0000-0000-0008-000000000106', '10000000-0000-0000-0000-000000000008', 'lunghezza_totale',  'Lunghezza Totale',  'number',  false, 6, true, true),
  ('20000000-0000-0000-0008-000000000107', '10000000-0000-0000-0000-000000000008', 'celino',            'Celino',            'boolean', false, 7, true, true),
  ('20000000-0000-0000-0008-000000000108', '10000000-0000-0000-0000-000000000008', 'note',              'Note',              'text',    false, 8, true, true)
ON CONFLICT (category_id, option_key) DO NOTHING;

-- ============================================================
-- 9. ALTRO — Opzioni
-- ============================================================

INSERT INTO public.category_options (id, category_id, option_key, option_label, option_type, is_required, sort_order, applies_to_position, is_active) VALUES
  -- Globale
  ('20000000-0000-0000-0009-000000000001', '10000000-0000-0000-0000-000000000009', 'descrizione_globale', 'Descrizione', 'text', false, 1, false, true),
  -- Posizione
  ('20000000-0000-0000-0009-000000000101', '10000000-0000-0000-0000-000000000009', 'descrizione', 'Descrizione',    'text',   false, 1, true, true),
  ('20000000-0000-0000-0009-000000000102', '10000000-0000-0000-0000-000000000009', 'quantita',    'Quantita',       'number', true,  2, true, true),
  ('20000000-0000-0000-0009-000000000103', '10000000-0000-0000-0000-000000000009', 'larghezza',   'Larghezza (mm)', 'number', false, 3, true, true),
  ('20000000-0000-0000-0009-000000000104', '10000000-0000-0000-0000-000000000009', 'altezza',     'Altezza (mm)',   'number', false, 4, true, true),
  ('20000000-0000-0000-0009-000000000105', '10000000-0000-0000-0000-000000000009', 'note',        'Note',           'text',   false, 5, true, true)
ON CONFLICT (category_id, option_key) DO NOTHING;
