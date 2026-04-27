/*
  # Schema Iniziale Preventivatore

  1. Tabelle Base
    - `profiles` - Profili utente
    - `aliquote_iva` - Aliquote IVA
    - `clienti` - Anagrafica clienti
    - `sedi` - Sedi cliente
    - `prodotti` - Catalogo prodotti
    - `configurazioni_prodotto` - Configurazioni prodotto
    - `preventivi` - Preventivi
    - `righe_preventivo` - Righe preventivo
    - `configurazioni_riga` - Configurazioni applicate a riga
    - `costi_indiretti` - Costi indiretti
    - `costi_preventivo` - Costi applicati a preventivo
    - `impostazioni` - Impostazioni globali

  2. Sicurezza
    - Abilitazione RLS su tutte le tabelle
    - Policy per accesso autenticato
    - Funzioni helper per ruoli

  3. Trigger
    - Auto-creazione profilo utente
    - Aggiornamento timestamp
    - Generazione numero preventivo
*/

-- ===========================================================
-- 1. PROFILES TABLE
-- ===========================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  nome TEXT,
  cognome TEXT,
  ruolo TEXT NOT NULL DEFAULT 'operatore' CHECK (ruolo IN ('admin', 'operatore', 'visualizzatore')),
  attivo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Trigger per auto-creare profilo quando utente si registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, ruolo, attivo)
  VALUES (NEW.id, NEW.email, 'operatore', true);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;

-- ===========================================================
-- 2. ALIQUOTE IVA
-- ===========================================================
CREATE TABLE IF NOT EXISTS public.aliquote_iva (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  percentuale NUMERIC(5,2) NOT NULL,
  descrizione TEXT,
  richiede_dichiarazione BOOLEAN NOT NULL DEFAULT false,
  ordine INTEGER NOT NULL DEFAULT 0,
  attiva BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.aliquote_iva ENABLE ROW LEVEL SECURITY;

-- ===========================================================
-- 3. CLIENTI
-- ===========================================================
CREATE TABLE IF NOT EXISTS public.clienti (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ragione_sociale TEXT NOT NULL,
  tipo_cliente TEXT NOT NULL CHECK (tipo_cliente IN ('privato', 'azienda', 'ente_pubblico')),
  codice_fiscale TEXT,
  partita_iva TEXT,
  indirizzo TEXT NOT NULL,
  citta TEXT NOT NULL,
  provincia TEXT NOT NULL,
  cap TEXT NOT NULL,
  telefono_principale TEXT NOT NULL,
  telefono_secondario TEXT,
  email TEXT,
  pec TEXT,
  note TEXT,
  attivo BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.clienti ENABLE ROW LEVEL SECURITY;

-- ===========================================================
-- 4. SEDI CLIENTE
-- ===========================================================
CREATE TABLE IF NOT EXISTS public.sedi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES public.clienti(id) ON DELETE CASCADE,
  nome_sede TEXT NOT NULL,
  indirizzo TEXT NOT NULL,
  citta TEXT NOT NULL,
  provincia TEXT NOT NULL,
  cap TEXT NOT NULL,
  referente TEXT,
  telefono_referente TEXT,
  note TEXT,
  attiva BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.sedi ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_sedi_cliente ON public.sedi(cliente_id);

-- ===========================================================
-- 5. PRODOTTI
-- ===========================================================
CREATE TABLE IF NOT EXISTS public.prodotti (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codice TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  descrizione_breve TEXT NOT NULL,
  descrizione_estesa TEXT,
  categoria TEXT NOT NULL,
  unita_misura TEXT NOT NULL CHECK (unita_misura IN ('pezzo', 'mq', 'ml')),
  prezzo_listino NUMERIC(12,2) NOT NULL,
  costo_acquisto NUMERIC(12,2),
  percentuale_ricarico NUMERIC(5,2) NOT NULL DEFAULT 30,
  costo_posa NUMERIC(12,2) NOT NULL DEFAULT 0,
  richiede_dimensioni BOOLEAN NOT NULL DEFAULT false,
  richiede_configurazione BOOLEAN NOT NULL DEFAULT false,
  immagine_url TEXT,
  note TEXT,
  attivo BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.prodotti ENABLE ROW LEVEL SECURITY;

-- ===========================================================
-- 6. CONFIGURAZIONI PRODOTTO
-- ===========================================================
CREATE TABLE IF NOT EXISTS public.configurazioni_prodotto (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prodotto_id UUID NOT NULL REFERENCES public.prodotti(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descrizione TEXT,
  tipo TEXT NOT NULL CHECK (tipo IN ('vetro', 'colore', 'accessorio', 'maniglieria', 'motorizzazione', 'altro')),
  applicazione TEXT NOT NULL DEFAULT 'entrambi' CHECK (applicazione IN ('base', 'riga', 'entrambi')),
  tipo_maggiorazione TEXT NOT NULL CHECK (tipo_maggiorazione IN ('fisso', 'percentuale', 'mq', 'ml')),
  valore_maggiorazione NUMERIC(12,2) NOT NULL DEFAULT 0,
  obbligatoria BOOLEAN NOT NULL DEFAULT false,
  ordine INTEGER NOT NULL DEFAULT 0,
  attiva BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.configurazioni_prodotto ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_configurazioni_prodotto ON public.configurazioni_prodotto(prodotto_id);

-- ===========================================================
-- 7. PREVENTIVI
-- ===========================================================
CREATE TABLE IF NOT EXISTS public.preventivi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero TEXT NOT NULL UNIQUE,
  cliente_id UUID NOT NULL REFERENCES public.clienti(id),
  sede_id UUID REFERENCES public.sedi(id),
  data_preventivo DATE NOT NULL DEFAULT CURRENT_DATE,
  data_validita DATE NOT NULL,
  aliquota_iva_id UUID NOT NULL REFERENCES public.aliquote_iva(id),
  stato TEXT NOT NULL DEFAULT 'bozza' CHECK (stato IN ('bozza', 'inviato', 'accettato', 'rifiutato', 'scaduto', 'convertito_ordine')),
  condizioni_pagamento TEXT,
  note_preventivo TEXT,
  note_interne TEXT,
  sconto_globale_1 NUMERIC(5,2),
  sconto_globale_2 NUMERIC(5,2),
  totale_imponibile NUMERIC(12,2) NOT NULL DEFAULT 0,
  totale_imponibile_scontato NUMERIC(12,2) NOT NULL DEFAULT 0,
  totale_iva NUMERIC(12,2) NOT NULL DEFAULT 0,
  totale_preventivo NUMERIC(12,2) NOT NULL DEFAULT 0,
  costo_totale_azienda NUMERIC(12,2),
  margine_previsto NUMERIC(12,2),
  percentuale_margine NUMERIC(5,2),
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.preventivi ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_preventivi_cliente ON public.preventivi(cliente_id);
CREATE INDEX IF NOT EXISTS idx_preventivi_stato ON public.preventivi(stato);

-- ===========================================================
-- 8. RIGHE PREVENTIVO
-- ===========================================================
CREATE TABLE IF NOT EXISTS public.righe_preventivo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  preventivo_id UUID NOT NULL REFERENCES public.preventivi(id) ON DELETE CASCADE,
  prodotto_id UUID NOT NULL REFERENCES public.prodotti(id),
  numero_riga INTEGER NOT NULL,
  descrizione_personalizzata TEXT,
  quantita NUMERIC(10,2) NOT NULL DEFAULT 1,
  larghezza_mm INTEGER,
  altezza_mm INTEGER,
  metri_quadri NUMERIC(10,4),
  numero_ante INTEGER,
  posizione_locale TEXT,
  tipo_montaggio TEXT,
  includi_controtelaio BOOLEAN,
  prezzo_unitario_effettivo NUMERIC(12,2) NOT NULL,
  usa_prezzo_personalizzato BOOLEAN NOT NULL DEFAULT false,
  prezzo_unitario_personalizzato NUMERIC(12,2),
  costo_posa_unitario NUMERIC(12,2) NOT NULL DEFAULT 0,
  totale_maggiorazioni NUMERIC(12,2) NOT NULL DEFAULT 0,
  subtotale_riga NUMERIC(12,2) NOT NULL DEFAULT 0,
  costo_riga_azienda NUMERIC(12,2),
  aggiorna_prodotto_originale BOOLEAN,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.righe_preventivo ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_righe_preventivo ON public.righe_preventivo(preventivo_id);

-- ===========================================================
-- 9. CONFIGURAZIONI RIGA
-- ===========================================================
CREATE TABLE IF NOT EXISTS public.configurazioni_riga (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  riga_preventivo_id UUID NOT NULL REFERENCES public.righe_preventivo(id) ON DELETE CASCADE,
  configurazione_id UUID NOT NULL REFERENCES public.configurazioni_prodotto(id),
  valore_selezionato TEXT,
  maggiorazione_applicata NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.configurazioni_riga ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_configurazioni_riga ON public.configurazioni_riga(riga_preventivo_id);

-- ===========================================================
-- 10. COSTI INDIRETTI
-- ===========================================================
CREATE TABLE IF NOT EXISTS public.costi_indiretti (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descrizione TEXT,
  categoria TEXT NOT NULL CHECK (categoria IN ('trasporto', 'attrezzature', 'pratiche', 'compensi', 'altro')),
  tipo_calcolo TEXT NOT NULL CHECK (tipo_calcolo IN ('fisso', 'percentuale')),
  importo NUMERIC(12,2) NOT NULL,
  costo_azienda NUMERIC(12,2),
  attivo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.costi_indiretti ENABLE ROW LEVEL SECURITY;

-- ===========================================================
-- 11. COSTI PREVENTIVO
-- ===========================================================
CREATE TABLE IF NOT EXISTS public.costi_preventivo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  preventivo_id UUID NOT NULL REFERENCES public.preventivi(id) ON DELETE CASCADE,
  costo_id UUID NOT NULL REFERENCES public.costi_indiretti(id),
  quantita NUMERIC(10,2) NOT NULL DEFAULT 1,
  importo_totale NUMERIC(12,2) NOT NULL DEFAULT 0,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.costi_preventivo ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_costi_preventivo ON public.costi_preventivo(preventivo_id);

-- ===========================================================
-- 12. IMPOSTAZIONI
-- ===========================================================
CREATE TABLE IF NOT EXISTS public.impostazioni (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_azienda TEXT NOT NULL DEFAULT 'La Mia Azienda',
  indirizzo_azienda TEXT,
  citta_azienda TEXT,
  provincia_azienda TEXT,
  cap_azienda TEXT,
  partita_iva TEXT,
  codice_fiscale TEXT,
  telefono TEXT,
  email TEXT,
  pec TEXT,
  sito_web TEXT,
  logo_url TEXT,
  iban TEXT,
  banca TEXT,
  prefisso_preventivo TEXT,
  formato_numero TEXT,
  anno_corrente INTEGER,
  ultimo_numero_anno INTEGER,
  reset_annuale BOOLEAN,
  validita_preventivo_giorni INTEGER NOT NULL DEFAULT 30,
  condizioni_pagamento_standard TEXT,
  note_pie_pagina TEXT,
  termini_condizioni TEXT,
  informativa_privacy TEXT,
  dichiarazione_iva_agevolata TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.impostazioni ENABLE ROW LEVEL SECURITY;

-- Inserisci record impostazioni di default
INSERT INTO public.impostazioni (nome_azienda) VALUES ('La Mia Azienda')
ON CONFLICT DO NOTHING;

-- ===========================================================
-- 13. FUNZIONI HELPER
-- ===========================================================

-- Funzione per generare numero preventivo
CREATE OR REPLACE FUNCTION public.genera_numero_preventivo()
RETURNS TEXT AS $$
DECLARE
  anno_corrente INTEGER;
  ultimo_numero INTEGER;
  nuovo_numero TEXT;
  prefisso TEXT;
  formato TEXT;
BEGIN
  SELECT 
    COALESCE(anno_corrente, EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER),
    COALESCE(ultimo_numero_anno, 0),
    COALESCE(prefisso_preventivo, 'PREV'),
    COALESCE(formato_numero, '{prefisso}-{numero}/{anno}')
  INTO anno_corrente, ultimo_numero, prefisso, formato
  FROM public.impostazioni
  LIMIT 1;

  IF EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER > anno_corrente THEN
    anno_corrente := EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER;
    ultimo_numero := 0;
  END IF;

  ultimo_numero := ultimo_numero + 1;

  nuovo_numero := REPLACE(REPLACE(REPLACE(
    formato,
    '{prefisso}', prefisso),
    '{numero}', LPAD(ultimo_numero::TEXT, 4, '0')),
    '{anno}', anno_corrente::TEXT
  );

  UPDATE public.impostazioni
  SET 
    anno_corrente = anno_corrente,
    ultimo_numero_anno = ultimo_numero;

  RETURN nuovo_numero;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger per updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Applica trigger updated_at a tutte le tabelle
DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN 
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
    AND table_name IN ('profiles', 'aliquote_iva', 'clienti', 'sedi', 'prodotti', 'configurazioni_prodotto', 'preventivi', 'righe_preventivo', 'costi_indiretti', 'impostazioni')
  LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS set_updated_at_%I ON public.%I;
      CREATE TRIGGER set_updated_at_%I 
        BEFORE UPDATE ON public.%I 
        FOR EACH ROW 
        EXECUTE FUNCTION public.update_updated_at_column();
    ', t, t, t, t);
  END LOOP;
END $$;

-- ===========================================================
-- 14. RLS POLICIES (Basic - da raffinare con migration 004)
-- ===========================================================

-- Profiles: ogni utente vede il proprio profilo
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);

-- Altre tabelle: accesso completo per utenti autenticati (policy semplificate)
CREATE POLICY "aliquote_iva_select" ON public.aliquote_iva FOR SELECT TO authenticated USING (true);
CREATE POLICY "clienti_all" ON public.clienti FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "sedi_all" ON public.sedi FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "prodotti_all" ON public.prodotti FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "configurazioni_prodotto_all" ON public.configurazioni_prodotto FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "preventivi_all" ON public.preventivi FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "righe_preventivo_all" ON public.righe_preventivo FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "configurazioni_riga_all" ON public.configurazioni_riga FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "costi_indiretti_all" ON public.costi_indiretti FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "costi_preventivo_all" ON public.costi_preventivo FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "impostazioni_select" ON public.impostazioni FOR SELECT TO authenticated USING (true);
