-- ============================================================================
-- MIGRATION: Refactoring Modifiche Roero Infissi
-- Data: 2025-03-XX
-- Descrizione: Implementazione completa delle modifiche richieste dal cliente
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. MODIFICHE TABELLA CATEGORIES (ex-Categorie, ora Prodotti nella UI)
-- ----------------------------------------------------------------------------

-- Template descrizione con placeholder
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS description_template TEXT;

-- Immagine categoria
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS image_url TEXT;

COMMENT ON COLUMN categories.description_template IS 'Template con placeholder {{option_key}} per descrizione dinamica';
COMMENT ON COLUMN categories.image_url IS 'URL immagine categoria mostrata nell''intestazione sezione preventivo';

-- ----------------------------------------------------------------------------
-- 2. MODIFICHE TABELLA PREVENTIVI
-- ----------------------------------------------------------------------------

-- Flag mostra/nascondi totale generale
ALTER TABLE preventivi 
ADD COLUMN IF NOT EXISTS show_grand_total BOOLEAN DEFAULT TRUE;

-- Flag mostra/nascondi IVA
ALTER TABLE preventivi 
ADD COLUMN IF NOT EXISTS show_iva BOOLEAN DEFAULT TRUE;

-- Modalità di pagamento (FK verso payment_methods)
ALTER TABLE preventivi 
ADD COLUMN IF NOT EXISTS payment_method_id UUID REFERENCES payment_methods(id) ON DELETE SET NULL;

-- Note pagamento personalizzato
ALTER TABLE preventivi 
ADD COLUMN IF NOT EXISTS payment_notes TEXT;

COMMENT ON COLUMN preventivi.show_grand_total IS 'Se FALSE, il riepilogo finale non viene mostrato nel PDF';
COMMENT ON COLUMN preventivi.show_iva IS 'Se FALSE, IVA non viene calcolata né mostrata';
COMMENT ON COLUMN preventivi.payment_method_id IS 'Modalità di pagamento selezionata';
COMMENT ON COLUMN preventivi.payment_notes IS 'Note per accordo personalizzato';

-- ----------------------------------------------------------------------------
-- 3. MODIFICHE TABELLA QUOTE_SECTIONS
-- ----------------------------------------------------------------------------

-- Flag mostra/nascondi prezzi singole posizioni
ALTER TABLE quote_sections 
ADD COLUMN IF NOT EXISTS show_line_prices BOOLEAN DEFAULT TRUE;

-- Prezzo totale manuale sovrascrive calcolo automatico
ALTER TABLE quote_sections 
ADD COLUMN IF NOT EXISTS manual_total_override DECIMAL(12,2);

-- Note sezione (differenze, alternative)
ALTER TABLE quote_sections 
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Descrizione libera (per Serramenti e Porte Interne)
ALTER TABLE quote_sections 
ADD COLUMN IF NOT EXISTS free_description TEXT;

COMMENT ON COLUMN quote_sections.show_line_prices IS 'Se FALSE, nasconde prezzi unitari e totali riga nel PDF';
COMMENT ON COLUMN quote_sections.manual_total_override IS 'Se valorizzato, sovrascrive il totale calcolato';
COMMENT ON COLUMN quote_sections.notes IS 'Note/differenze mostrate sotto il totale sezione';
COMMENT ON COLUMN quote_sections.free_description IS 'Campo testo libero per categorie senza template (Serramenti/Porte)';

-- ----------------------------------------------------------------------------
-- 4. MODIFICHE TABELLA RIGHE_PREVENTIVO
-- ----------------------------------------------------------------------------

-- Prezzo manuale sovrascrive calcolo automatico
ALTER TABLE righe_preventivo 
ADD COLUMN IF NOT EXISTS manual_price_override DECIMAL(12,2);

COMMENT ON COLUMN righe_preventivo.manual_price_override IS 'Se valorizzato, sovrascrive il prezzo calcolato';

-- Aggiungo metri_quadri se non esiste (potrebbe già esserci)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'righe_preventivo' AND column_name = 'metri_quadri'
    ) THEN
        ALTER TABLE righe_preventivo ADD COLUMN metri_quadri DECIMAL(10,2);
    END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 5. MODIFICHE TABELLA ALIQUOTE_IVA
-- ----------------------------------------------------------------------------

-- Flag aliquota combinata
ALTER TABLE aliquote_iva 
ADD COLUMN IF NOT EXISTS is_combined BOOLEAN DEFAULT FALSE;

-- Aliquota secondaria (per beni significativi)
ALTER TABLE aliquote_iva 
ADD COLUMN IF NOT EXISTS rate_secondary DECIMAL(5,2);

COMMENT ON COLUMN aliquote_iva.is_combined IS 'TRUE per aliquote combinate (es. 10% + 22%)';
COMMENT ON COLUMN aliquote_iva.rate_secondary IS 'Percentuale seconda aliquota per IVA combinata';

-- ----------------------------------------------------------------------------
-- 6. NUOVA TABELLA: PAYMENT_METHODS
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE payment_methods IS 'Modalità di pagamento gestibili';

-- Indice per ordinamento
CREATE INDEX IF NOT EXISTS idx_payment_methods_sort ON payment_methods(sort_order, name);

-- Dati iniziali modalità di pagamento
INSERT INTO payment_methods (name, description, is_active, sort_order) VALUES
('50% all''ordine + 50% fine lavori', '50% all''accettazione ordine + 50% a fine lavori', TRUE, 1),
('50% all''ordine + 40% merce magazzino + 10% fine lavori', '50% all''accettazione ordine + 40% alla merce in magazzino + 10% a fine lavori', TRUE, 2),
('50% all''ordine + 30% merce magazzino + 20% fine lavori', '50% all''accettazione ordine + 30% alla merce in magazzino + 20% a fine lavori', TRUE, 3),
('50% all''ordine + 50% finanziamento', '50% all''accettazione ordine + 50% tramite finanziamento', TRUE, 4),
('Accordo personalizzato', 'Modalità personalizzata da specificare nelle note', TRUE, 5)
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------------------
-- 7. NUOVA TABELLA: ORDERS
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_id UUID NOT NULL REFERENCES preventivi(id) ON DELETE CASCADE,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    status VARCHAR(50) DEFAULT 'confermato',
    deduction_type VARCHAR(100),
    order_date DATE DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE orders IS 'Ordini generati dalla conversione preventivi';
COMMENT ON COLUMN orders.status IS 'Stati: confermato, in_lavorazione, completato';
COMMENT ON COLUMN orders.deduction_type IS 'Tipo detrazione: ecobonus_50, bonus_casa_36, bonus_sicurezza, nessuna';

-- Indici
CREATE INDEX IF NOT EXISTS idx_orders_quote ON orders(quote_id);
CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(order_date DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- ----------------------------------------------------------------------------
-- 8. NUOVA TABELLA: ORDER_DOCUMENTS
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS order_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE order_documents IS 'Documenti generati automaticamente per ordine';
COMMENT ON COLUMN order_documents.document_type IS 'Tipo: privacy, iva_declaration, payment_terms, atto_notorio, scheda_enea';

-- Indici
CREATE INDEX IF NOT EXISTS idx_order_docs_order ON order_documents(order_id);
CREATE INDEX IF NOT EXISTS idx_order_docs_type ON order_documents(document_type);

-- ----------------------------------------------------------------------------
-- 9. NUOVA TABELLA: SERVICES
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE,
    description TEXT,
    price DECIMAL(12,2) NOT NULL DEFAULT 0,
    unit VARCHAR(50) DEFAULT 'pezzo',
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE services IS 'Servizi aggiuntivi (Pratica ENEA, Smaltimento, Trasporto, ecc.)';

-- Indici
CREATE INDEX IF NOT EXISTS idx_services_active ON services(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_services_code ON services(code);

-- Dati iniziali servizi
INSERT INTO services (name, code, description, price, unit, is_active, sort_order) VALUES
('Pratica ENEA', 'SRV-ENEA', 'Gestione pratica ENEA per detrazione fiscale', 0, 'forfait', TRUE, 1),
('Smaltimento', 'SRV-SMALT', 'Smaltimento serramenti e materiali vecchi', 0, 'forfait', TRUE, 2),
('Trasporto al piano con scala montacarichi', 'SRV-TRASP', 'Trasporto serramenti ai piani superiori con scala montacarichi', 0, 'forfait', TRUE, 3)
ON CONFLICT (code) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 10. NUOVA TABELLA: QUOTE_SERVICES
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS quote_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_id UUID NOT NULL REFERENCES preventivi(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(12,2) NOT NULL,
    notes TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE quote_services IS 'Servizi aggiunti al preventivo';

-- Indici
CREATE INDEX IF NOT EXISTS idx_quote_services_quote ON quote_services(quote_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_quote_services_service ON quote_services(service_id);

-- ----------------------------------------------------------------------------
-- 11. AGGIORNAMENTO IMPOSTAZIONI
-- ----------------------------------------------------------------------------

-- Nuovi campi in tabella impostazioni
ALTER TABLE impostazioni 
ADD COLUMN IF NOT EXISTS testo_informativa_privacy TEXT;

ALTER TABLE impostazioni 
ADD COLUMN IF NOT EXISTS testo_condizioni_vendita TEXT;

COMMENT ON COLUMN impostazioni.testo_informativa_privacy IS 'Testo informativa privacy (fisso)';
COMMENT ON COLUMN impostazioni.testo_condizioni_vendita IS 'Template condizioni vendita con {{modalita_pagamento}}';

-- ----------------------------------------------------------------------------
-- 12. FUNZIONE: GENERA NUMERO ORDINE
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION genera_numero_ordine()
RETURNS VARCHAR AS $$
DECLARE
    v_anno_corrente INT;
    v_ultimo_numero INT;
    v_prefisso VARCHAR(20);
    v_nuovo_numero VARCHAR(50);
BEGIN
    -- Prende configurazione da impostazioni
    SELECT 
        COALESCE(impostazioni.anno_corrente, EXTRACT(YEAR FROM CURRENT_DATE)),
        COALESCE(impostazioni.prefisso_preventivo, 'ORD')
    INTO v_anno_corrente, v_prefisso
    FROM impostazioni
    LIMIT 1;

    -- Fallback safety se impostazioni è vuota
    IF v_anno_corrente IS NULL THEN
        v_anno_corrente := EXTRACT(YEAR FROM CURRENT_DATE);
        v_prefisso := 'ORD';
    END IF;

    -- Conta ordini esistenti per l'anno
    SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM '[0-9]+$') AS INT)), 0)
    INTO v_ultimo_numero
    FROM orders
    WHERE order_number LIKE v_prefisso || '-' || v_anno_corrente::TEXT || '-%';

    -- Genera nuovo numero
    v_nuovo_numero := v_prefisso || '-' || v_anno_corrente::TEXT || '-' || LPAD((v_ultimo_numero + 1)::TEXT, 4, '0');
    
    RETURN v_nuovo_numero;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION genera_numero_ordine IS 'Genera numero progressivo ordine (es. ORD-2025-0001)';

-- ----------------------------------------------------------------------------
-- 13. AGGIUNGI STATO 'convertito_ordine' AI PREVENTIVI
-- ----------------------------------------------------------------------------

-- Verifica che il campo stato in preventivi supporti il nuovo valore
-- (Se usi ENUM, dovrai aggiungere il valore. Se usi VARCHAR, è già OK)

COMMENT ON COLUMN preventivi.stato IS 'Stati: bozza, inviato, accettato, rifiutato, scaduto, convertito_ordine';

-- ----------------------------------------------------------------------------
-- 14. TRIGGER: AGGIORNA TIMESTAMP
-- ----------------------------------------------------------------------------

-- Trigger per updated_at su payment_methods
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS payment_methods_updated_at ON payment_methods;
CREATE TRIGGER payment_methods_updated_at
    BEFORE UPDATE ON payment_methods
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS orders_updated_at ON orders;
CREATE TRIGGER orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS services_updated_at ON services;
CREATE TRIGGER services_updated_at
    BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ----------------------------------------------------------------------------
-- 15. RLS POLICIES (se necessario)
-- ----------------------------------------------------------------------------

-- Abilita RLS sulle nuove tabelle
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_services ENABLE ROW LEVEL SECURITY;

-- Policy SELECT: tutti gli utenti autenticati possono leggere
CREATE POLICY payment_methods_select_policy ON payment_methods
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY orders_select_policy ON orders
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY order_documents_select_policy ON order_documents
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY services_select_policy ON services
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY quote_services_select_policy ON quote_services
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Policy INSERT/UPDATE/DELETE: solo admin
CREATE POLICY payment_methods_modify_policy ON payment_methods
    FOR ALL USING (get_my_role() = 'admin')
    WITH CHECK (get_my_role() = 'admin');

CREATE POLICY orders_modify_policy ON orders
    FOR ALL USING (get_my_role() = 'admin' OR get_my_role() = 'operatore')
    WITH CHECK (get_my_role() = 'admin' OR get_my_role() = 'operatore');

CREATE POLICY order_documents_modify_policy ON order_documents
    FOR ALL USING (get_my_role() = 'admin' OR get_my_role() = 'operatore')
    WITH CHECK (get_my_role() = 'admin' OR get_my_role() = 'operatore');

CREATE POLICY services_modify_policy ON services
    FOR ALL USING (get_my_role() = 'admin')
    WITH CHECK (get_my_role() = 'admin');

CREATE POLICY quote_services_modify_policy ON quote_services
    FOR ALL USING (get_my_role() = 'admin' OR get_my_role() = 'operatore')
    WITH CHECK (get_my_role() = 'admin' OR get_my_role() = 'operatore');

-- ----------------------------------------------------------------------------
-- FINE MIGRATION
-- ----------------------------------------------------------------------------

-- Verifica tabelle create
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
    AND table_name IN ('payment_methods', 'orders', 'order_documents', 'services', 'quote_services')
ORDER BY table_name;
