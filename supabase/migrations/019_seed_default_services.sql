-- 019_seed_default_services.sql
-- Ensure services exist with correct prices as requested by client
-- Services were originally created in 005 with codes SRV-ENEA, SRV-SMALT, SRV-TRASP
-- Prices were updated in 016 but this migration ensures they are correct

UPDATE services SET price = 200.00, description = 'Pratica ENEA per detrazione fiscale', is_active = true
WHERE code = 'SRV-ENEA';

UPDATE services SET price = 20.00, unit = 'pezzo', description = 'Smaltimento materiali (cad.)', is_active = true
WHERE code = 'SRV-SMALT';

UPDATE services SET price = 300.00, description = 'Trasporto al piano dei serramenti nuovi con scala montacarichi', is_active = true
WHERE code = 'SRV-TRASP';

-- Zanzariere: aggiornare description_template per dividere verticale/laterale
-- con condizionali basati su modello_posizione (option già esistente)
UPDATE categories
SET description_template = E'Zanzariere in alluminio verniciato colore {{colore}}.\n{{#if modello_posizione=verticale}}Modello verticale per finestra con rallentatore, spazzolino antivento, barra maniglia.{{/if}}\n{{#if modello_posizione=laterale_guida_bassa}}Modello laterale per porta con rete tesa e guida inferiore calpestabile da mm.5, barra maniglia.{{/if}}\n{{#if modello_posizione=laterale_guida_alta}}Modello laterale per porta con rete tesa e guida inferiore calpestabile da mm.5, barra maniglia.{{/if}}\nComplete di tutti gli accessori d''uso per renderle perfettamente funzionanti.\n{{altro}}'
WHERE slug = 'zanzariere_tende' OR nome ILIKE 'Zanzariere%';

-- Blindato: aggiornare description_template per includere kit_pomolo condizionale
UPDATE categories
SET description_template = E'Porta blindata {{modello}}: realizzata a 2 livelli di lamiera con piastra di protezione serratura, coibentazione interna con doppio strato di isolamento in polistirene espanso, 4 punti di chiusura fissi sul lato cerniera, cerniere con perno in acciaio a sfera, carenatura in lamiera zincata plastificata con finitura effetto inox, lama paraspifferi; cilindro europeo a 5 chiavi e scheda di duplicazione, protezione cilindro a forma conica che limita il tentativo di strappo o estrazione; pannello esterno {{pannello_esterno_colore}}, pannello interno {{pannello_interno_colore}}{{#if kit_pomolo=true}} e Pomolo esterno fisso e maniglia interna cromo satinati{{/if}}.\nClasse antieffrazione 3.'
WHERE slug = 'blindati_portoncini' OR nome ILIKE 'Blind%';
