-- ============================================================
-- Migration 001: Sistema Opzioni Categorie
-- Crea le tabelle per categorie dinamiche, opzioni configurabili
-- per categoria, sezioni preventivo e opzioni selezionate.
-- ============================================================

-- 1. CATEGORIES — Categorie prodotto dinamiche
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  nome TEXT NOT NULL,
  descrizione TEXT,
  icona TEXT,
  ordine INTEGER NOT NULL DEFAULT 0,
  attiva BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.categories IS 'Categorie prodotto dinamiche (Serramenti, Persiane, ecc.)';

-- 2. CATEGORY_OPTIONS — Opzioni configurabili per categoria
CREATE TABLE IF NOT EXISTS public.category_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  option_key TEXT NOT NULL,
  option_label TEXT NOT NULL,
  option_type TEXT NOT NULL CHECK (option_type IN ('select', 'multi_select', 'boolean', 'text', 'number')),
  is_required BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  applies_to_position BOOLEAN NOT NULL DEFAULT true,
  price_adjustment_default NUMERIC(12,2) DEFAULT 0,
  depends_on_option_id UUID REFERENCES public.category_options(id) ON DELETE SET NULL,
  depends_on_values_json JSONB,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(category_id, option_key)
);

COMMENT ON TABLE public.category_options IS 'Opzioni configurabili per categoria (es. Materiale, Telaio, Cerniere)';
COMMENT ON COLUMN public.category_options.applies_to_position IS 'true = opzione per posizione/riga, false = opzione globale per sezione';
COMMENT ON COLUMN public.category_options.depends_on_option_id IS 'Opzione genitore da cui dipende la visibilita';
COMMENT ON COLUMN public.category_options.depends_on_values_json IS 'Valori del genitore che attivano questa opzione, es. ["PVC","KAB"]';

-- 3. CATEGORY_OPTION_VALUES — Valori predefiniti per opzioni select/multi_select
CREATE TABLE IF NOT EXISTS public.category_option_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_option_id UUID NOT NULL REFERENCES public.category_options(id) ON DELETE CASCADE,
  value_key TEXT NOT NULL,
  value_label TEXT NOT NULL,
  price_adjustment NUMERIC(12,2) DEFAULT 0,
  price_mode TEXT NOT NULL DEFAULT 'fixed' CHECK (price_mode IN ('fixed', 'percentage', 'per_sqm', 'per_unit')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  depends_on_value_id UUID REFERENCES public.category_option_values(id) ON DELETE SET NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  metadata_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(category_option_id, value_key)
);

COMMENT ON TABLE public.category_option_values IS 'Valori disponibili per opzioni di tipo select/multi_select';
COMMENT ON COLUMN public.category_option_values.depends_on_value_id IS 'Sotto-opzione condizionale: visibile solo se questo valore genitore e selezionato';

-- 4. QUOTE_SECTIONS — Sezioni del preventivo (una per categoria)
CREATE TABLE IF NOT EXISTS public.quote_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  preventivo_id UUID NOT NULL REFERENCES public.preventivi(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id),
  ordine INTEGER NOT NULL DEFAULT 0,
  note_sezione TEXT,
  trasporto NUMERIC(12,2) DEFAULT 0,
  posa NUMERIC(12,2) DEFAULT 0,
  sconto_percentuale NUMERIC(5,2) DEFAULT 0,
  subtotale_sezione NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(preventivo_id, category_id)
);

COMMENT ON TABLE public.quote_sections IS 'Sezioni del preventivo, una per categoria prodotto';

-- 5. QUOTE_SECTION_OPTIONS — Opzioni globali selezionate per sezione
CREATE TABLE IF NOT EXISTS public.quote_section_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_section_id UUID NOT NULL REFERENCES public.quote_sections(id) ON DELETE CASCADE,
  category_option_id UUID NOT NULL REFERENCES public.category_options(id),
  selected_value_id UUID REFERENCES public.category_option_values(id),
  selected_text TEXT,
  selected_boolean BOOLEAN,
  price_adjustment NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.quote_section_options IS 'Opzioni globali selezionate per sezione del preventivo';

-- 6. QUOTE_ITEM_OPTIONS — Opzioni selezionate per riga/posizione
CREATE TABLE IF NOT EXISTS public.quote_item_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  riga_preventivo_id UUID NOT NULL REFERENCES public.righe_preventivo(id) ON DELETE CASCADE,
  category_option_id UUID NOT NULL REFERENCES public.category_options(id),
  selected_value_id UUID REFERENCES public.category_option_values(id),
  selected_text TEXT,
  selected_boolean BOOLEAN,
  price_adjustment NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.quote_item_options IS 'Opzioni selezionate per ogni riga/posizione del preventivo';

-- 7. AGGIUNTA COLONNE alle tabelle esistenti

-- Aggiungere category_id a prodotti
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'prodotti' AND column_name = 'category_id'
  ) THEN
    ALTER TABLE public.prodotti ADD COLUMN category_id UUID REFERENCES public.categories(id);
  END IF;
END $$;

-- Aggiungere quote_section_id a righe_preventivo
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'righe_preventivo' AND column_name = 'quote_section_id'
  ) THEN
    ALTER TABLE public.righe_preventivo ADD COLUMN quote_section_id UUID REFERENCES public.quote_sections(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 8. INDICI per performance
CREATE INDEX IF NOT EXISTS idx_category_options_category ON public.category_options(category_id);
CREATE INDEX IF NOT EXISTS idx_category_options_depends ON public.category_options(depends_on_option_id);
CREATE INDEX IF NOT EXISTS idx_category_option_values_option ON public.category_option_values(category_option_id);
CREATE INDEX IF NOT EXISTS idx_category_option_values_depends ON public.category_option_values(depends_on_value_id);
CREATE INDEX IF NOT EXISTS idx_quote_sections_preventivo ON public.quote_sections(preventivo_id);
CREATE INDEX IF NOT EXISTS idx_quote_sections_category ON public.quote_sections(category_id);
CREATE INDEX IF NOT EXISTS idx_quote_section_options_section ON public.quote_section_options(quote_section_id);
CREATE INDEX IF NOT EXISTS idx_quote_item_options_riga ON public.quote_item_options(riga_preventivo_id);
CREATE INDEX IF NOT EXISTS idx_prodotti_category ON public.prodotti(category_id);
CREATE INDEX IF NOT EXISTS idx_righe_preventivo_section ON public.righe_preventivo(quote_section_id);

-- 9. RLS POLICIES

-- Abilita RLS sulle nuove tabelle
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_option_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_section_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_item_options ENABLE ROW LEVEL SECURITY;

-- Categories: tutti possono leggere, solo admin modifica
CREATE POLICY "categories_select_all" ON public.categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "categories_admin_insert" ON public.categories FOR INSERT TO authenticated WITH CHECK (get_my_role() = 'admin');
CREATE POLICY "categories_admin_update" ON public.categories FOR UPDATE TO authenticated USING (get_my_role() = 'admin');
CREATE POLICY "categories_admin_delete" ON public.categories FOR DELETE TO authenticated USING (get_my_role() = 'admin');

-- Category options: tutti possono leggere, solo admin modifica
CREATE POLICY "cat_options_select_all" ON public.category_options FOR SELECT TO authenticated USING (true);
CREATE POLICY "cat_options_admin_insert" ON public.category_options FOR INSERT TO authenticated WITH CHECK (get_my_role() = 'admin');
CREATE POLICY "cat_options_admin_update" ON public.category_options FOR UPDATE TO authenticated USING (get_my_role() = 'admin');
CREATE POLICY "cat_options_admin_delete" ON public.category_options FOR DELETE TO authenticated USING (get_my_role() = 'admin');

-- Category option values: tutti possono leggere, solo admin modifica
CREATE POLICY "cat_values_select_all" ON public.category_option_values FOR SELECT TO authenticated USING (true);
CREATE POLICY "cat_values_admin_insert" ON public.category_option_values FOR INSERT TO authenticated WITH CHECK (get_my_role() = 'admin');
CREATE POLICY "cat_values_admin_update" ON public.category_option_values FOR UPDATE TO authenticated USING (get_my_role() = 'admin');
CREATE POLICY "cat_values_admin_delete" ON public.category_option_values FOR DELETE TO authenticated USING (get_my_role() = 'admin');

-- Quote sections: utenti autenticati CRUD
CREATE POLICY "quote_sections_select" ON public.quote_sections FOR SELECT TO authenticated USING (true);
CREATE POLICY "quote_sections_insert" ON public.quote_sections FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "quote_sections_update" ON public.quote_sections FOR UPDATE TO authenticated USING (true);
CREATE POLICY "quote_sections_delete" ON public.quote_sections FOR DELETE TO authenticated USING (true);

-- Quote section options: utenti autenticati CRUD
CREATE POLICY "quote_sec_opts_select" ON public.quote_section_options FOR SELECT TO authenticated USING (true);
CREATE POLICY "quote_sec_opts_insert" ON public.quote_section_options FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "quote_sec_opts_update" ON public.quote_section_options FOR UPDATE TO authenticated USING (true);
CREATE POLICY "quote_sec_opts_delete" ON public.quote_section_options FOR DELETE TO authenticated USING (true);

-- Quote item options: utenti autenticati CRUD
CREATE POLICY "quote_item_opts_select" ON public.quote_item_options FOR SELECT TO authenticated USING (true);
CREATE POLICY "quote_item_opts_insert" ON public.quote_item_options FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "quote_item_opts_update" ON public.quote_item_options FOR UPDATE TO authenticated USING (true);
CREATE POLICY "quote_item_opts_delete" ON public.quote_item_options FOR DELETE TO authenticated USING (true);

-- 10. TRIGGER per updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_categories') THEN
    CREATE TRIGGER set_updated_at_categories BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_category_options') THEN
    CREATE TRIGGER set_updated_at_category_options BEFORE UPDATE ON public.category_options FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_updated_at_quote_sections') THEN
    CREATE TRIGGER set_updated_at_quote_sections BEFORE UPDATE ON public.quote_sections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;
