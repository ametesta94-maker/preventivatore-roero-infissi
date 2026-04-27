-- Migration 015: Seed description templates for Avvolgibili, Persiane, Zanzariere
-- Uses option_key placeholders that resolve via resolveDescriptionTemplate()

UPDATE categories
SET description_template = E'Avvolgibili in {{materiale}} colore {{colore}}\nAzionamento {{azionamento}} completi di: guide, rullo, cuscinetti e di tutti gli accessori d''uso per renderli perfettamente funzionali.'
WHERE LOWER(nome) = 'avvolgibili' AND (description_template IS NULL OR description_template = '');

UPDATE categories
SET description_template = E'Persiane in alluminio verniciato colore {{colore}}\nModello {{modello}} {{tipologia}}, ancoraggio con tasselli chimici, ovaline {{ovalina}}, chiusura tipo {{chiusura}}, distanziale tra ovaline in alluminio. Ferma persiane a parete modello {{fermapersiana}}\nComplete di tutti gli accessori d''uso per renderle perfettamente funzionali.\nAccessori colore nero.'
WHERE LOWER(nome) = 'persiane' AND (description_template IS NULL OR description_template = '');

UPDATE categories
SET description_template = E'Zanzariere in alluminio verniciato colore {{colore}}\n- modello verticale per finestra con rallentatore, spazzolino antivento, barra maniglia;\n- modello laterale per porta con rete tesa e guida inferiore calpestabile da mm.5, barra maniglia;\nComplete di tutti gli accessori d''uso per renderle perfettamente funzionanti.'
WHERE LOWER(nome) LIKE 'zanzariere%' AND (description_template IS NULL OR description_template = '');
