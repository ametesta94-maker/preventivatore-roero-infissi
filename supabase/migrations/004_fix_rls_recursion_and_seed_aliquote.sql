-- ============================================================
-- Migration 004: Fix RLS infinite recursion + Seed aliquote IVA
--
-- PROBLEMA: Le policy RLS sulla tabella "profiles" creano ricorsione
-- infinita perche' cercano di leggere "profiles" per verificare il
-- ruolo, ma per leggere "profiles" devono prima controllare le policy...
--
-- SOLUZIONE:
-- 1. get_my_role() con SECURITY DEFINER bypassa le RLS
-- 2. Le policy su profiles usano solo auth.uid() = id (senza subquery)
-- 3. Tutte le altre tabelle usano get_my_role() per i controlli admin
-- ============================================================

-- ============================================================
-- 1. FUNZIONE get_my_role() - SECURITY DEFINER (bypassa RLS)
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text AS $$
DECLARE
  user_role text;
BEGIN
  SELECT ruolo INTO user_role
  FROM public.profiles
  WHERE id = auth.uid();

  RETURN COALESCE(user_role, 'operatore');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================================
-- 2. FIX PROFILES - Rimuovi TUTTE le policy esistenti e ricreale
-- ============================================================

-- Drop tutte le policy esistenti su profiles
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies WHERE tablename = 'profiles' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', pol.policyname);
  END LOOP;
END $$;

-- Assicurati che RLS sia abilitato
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy SELECT: ogni utente vede il proprio profilo (+ admin vede tutti)
-- IMPORTANTE: non subquery su profiles qui! Usiamo get_my_role() per admin
CREATE POLICY "profiles_select_own_or_admin" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id OR get_my_role() = 'admin');

-- Policy INSERT: solo tramite trigger di auth (o admin)
CREATE POLICY "profiles_insert" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- Policy UPDATE: ogni utente aggiorna il proprio profilo (o admin)
CREATE POLICY "profiles_update_own_or_admin" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id OR get_my_role() = 'admin');

-- ============================================================
-- 3. FIX CLIENTI - Rimuovi e ricrea policy
-- ============================================================
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies WHERE tablename = 'clienti' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.clienti', pol.policyname);
  END LOOP;
END $$;

ALTER TABLE public.clienti ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clienti_select_all" ON public.clienti
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "clienti_insert" ON public.clienti
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "clienti_update" ON public.clienti
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "clienti_delete" ON public.clienti
  FOR DELETE TO authenticated USING (get_my_role() = 'admin');

-- ============================================================
-- 4. FIX SEDI
-- ============================================================
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies WHERE tablename = 'sedi' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.sedi', pol.policyname);
  END LOOP;
END $$;

ALTER TABLE public.sedi ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sedi_select_all" ON public.sedi
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "sedi_insert" ON public.sedi
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "sedi_update" ON public.sedi
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "sedi_delete" ON public.sedi
  FOR DELETE TO authenticated USING (true);

-- ============================================================
-- 5. FIX PRODOTTI
-- ============================================================
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies WHERE tablename = 'prodotti' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.prodotti', pol.policyname);
  END LOOP;
END $$;

ALTER TABLE public.prodotti ENABLE ROW LEVEL SECURITY;

CREATE POLICY "prodotti_select_all" ON public.prodotti
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "prodotti_insert" ON public.prodotti
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "prodotti_update" ON public.prodotti
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "prodotti_delete" ON public.prodotti
  FOR DELETE TO authenticated USING (get_my_role() = 'admin');

-- ============================================================
-- 6. FIX PREVENTIVI
-- ============================================================
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies WHERE tablename = 'preventivi' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.preventivi', pol.policyname);
  END LOOP;
END $$;

ALTER TABLE public.preventivi ENABLE ROW LEVEL SECURITY;

CREATE POLICY "preventivi_select_all" ON public.preventivi
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "preventivi_insert" ON public.preventivi
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "preventivi_update" ON public.preventivi
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "preventivi_delete" ON public.preventivi
  FOR DELETE TO authenticated USING (get_my_role() = 'admin');

-- ============================================================
-- 7. FIX RIGHE_PREVENTIVO
-- ============================================================
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies WHERE tablename = 'righe_preventivo' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.righe_preventivo', pol.policyname);
  END LOOP;
END $$;

ALTER TABLE public.righe_preventivo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "righe_preventivo_select" ON public.righe_preventivo
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "righe_preventivo_insert" ON public.righe_preventivo
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "righe_preventivo_update" ON public.righe_preventivo
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "righe_preventivo_delete" ON public.righe_preventivo
  FOR DELETE TO authenticated USING (true);

-- ============================================================
-- 8. FIX CONFIGURAZIONI_PRODOTTO
-- ============================================================
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies WHERE tablename = 'configurazioni_prodotto' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.configurazioni_prodotto', pol.policyname);
  END LOOP;
END $$;

ALTER TABLE public.configurazioni_prodotto ENABLE ROW LEVEL SECURITY;

CREATE POLICY "config_prodotto_select" ON public.configurazioni_prodotto
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "config_prodotto_insert" ON public.configurazioni_prodotto
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "config_prodotto_update" ON public.configurazioni_prodotto
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "config_prodotto_delete" ON public.configurazioni_prodotto
  FOR DELETE TO authenticated USING (true);

-- ============================================================
-- 9. FIX CONFIGURAZIONI_RIGA
-- ============================================================
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies WHERE tablename = 'configurazioni_riga' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.configurazioni_riga', pol.policyname);
  END LOOP;
END $$;

ALTER TABLE public.configurazioni_riga ENABLE ROW LEVEL SECURITY;

CREATE POLICY "config_riga_select" ON public.configurazioni_riga
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "config_riga_insert" ON public.configurazioni_riga
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "config_riga_update" ON public.configurazioni_riga
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "config_riga_delete" ON public.configurazioni_riga
  FOR DELETE TO authenticated USING (true);

-- ============================================================
-- 10. FIX COSTI_INDIRETTI
-- ============================================================
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies WHERE tablename = 'costi_indiretti' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.costi_indiretti', pol.policyname);
  END LOOP;
END $$;

ALTER TABLE public.costi_indiretti ENABLE ROW LEVEL SECURITY;

CREATE POLICY "costi_indiretti_select" ON public.costi_indiretti
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "costi_indiretti_insert" ON public.costi_indiretti
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "costi_indiretti_update" ON public.costi_indiretti
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "costi_indiretti_delete" ON public.costi_indiretti
  FOR DELETE TO authenticated USING (get_my_role() = 'admin');

-- ============================================================
-- 11. FIX COSTI_PREVENTIVO
-- ============================================================
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies WHERE tablename = 'costi_preventivo' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.costi_preventivo', pol.policyname);
  END LOOP;
END $$;

ALTER TABLE public.costi_preventivo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "costi_preventivo_select" ON public.costi_preventivo
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "costi_preventivo_insert" ON public.costi_preventivo
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "costi_preventivo_update" ON public.costi_preventivo
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "costi_preventivo_delete" ON public.costi_preventivo
  FOR DELETE TO authenticated USING (true);

-- ============================================================
-- 12. FIX IMPOSTAZIONI
-- ============================================================
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies WHERE tablename = 'impostazioni' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.impostazioni', pol.policyname);
  END LOOP;
END $$;

ALTER TABLE public.impostazioni ENABLE ROW LEVEL SECURITY;

CREATE POLICY "impostazioni_select" ON public.impostazioni
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "impostazioni_update" ON public.impostazioni
  FOR UPDATE TO authenticated USING (get_my_role() = 'admin');
CREATE POLICY "impostazioni_insert" ON public.impostazioni
  FOR INSERT TO authenticated WITH CHECK (get_my_role() = 'admin');

-- ============================================================
-- 13. FIX ALIQUOTE_IVA
-- ============================================================
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies WHERE tablename = 'aliquote_iva' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.aliquote_iva', pol.policyname);
  END LOOP;
END $$;

ALTER TABLE public.aliquote_iva ENABLE ROW LEVEL SECURITY;

CREATE POLICY "aliquote_iva_select" ON public.aliquote_iva
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "aliquote_iva_insert" ON public.aliquote_iva
  FOR INSERT TO authenticated WITH CHECK (get_my_role() = 'admin');
CREATE POLICY "aliquote_iva_update" ON public.aliquote_iva
  FOR UPDATE TO authenticated USING (get_my_role() = 'admin');

-- ============================================================
-- 14. FIX CATEGORIES (ricrea le policy correttamente)
-- ============================================================
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies WHERE tablename = 'categories' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.categories', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "categories_select_all" ON public.categories
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "categories_admin_insert" ON public.categories
  FOR INSERT TO authenticated WITH CHECK (get_my_role() = 'admin');
CREATE POLICY "categories_admin_update" ON public.categories
  FOR UPDATE TO authenticated USING (get_my_role() = 'admin');
CREATE POLICY "categories_admin_delete" ON public.categories
  FOR DELETE TO authenticated USING (get_my_role() = 'admin');

-- ============================================================
-- 15. FIX CATEGORY_OPTIONS (ricrea le policy correttamente)
-- ============================================================
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies WHERE tablename = 'category_options' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.category_options', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "cat_options_select_all" ON public.category_options
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "cat_options_admin_insert" ON public.category_options
  FOR INSERT TO authenticated WITH CHECK (get_my_role() = 'admin');
CREATE POLICY "cat_options_admin_update" ON public.category_options
  FOR UPDATE TO authenticated USING (get_my_role() = 'admin');
CREATE POLICY "cat_options_admin_delete" ON public.category_options
  FOR DELETE TO authenticated USING (get_my_role() = 'admin');

-- ============================================================
-- 16. FIX CATEGORY_OPTION_VALUES (ricrea le policy correttamente)
-- ============================================================
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies WHERE tablename = 'category_option_values' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.category_option_values', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "cat_values_select_all" ON public.category_option_values
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "cat_values_admin_insert" ON public.category_option_values
  FOR INSERT TO authenticated WITH CHECK (get_my_role() = 'admin');
CREATE POLICY "cat_values_admin_update" ON public.category_option_values
  FOR UPDATE TO authenticated USING (get_my_role() = 'admin');
CREATE POLICY "cat_values_admin_delete" ON public.category_option_values
  FOR DELETE TO authenticated USING (get_my_role() = 'admin');

-- ============================================================
-- 17. SEED ALIQUOTE IVA (22%, 10%, 4%)
-- ============================================================
INSERT INTO public.aliquote_iva (nome, percentuale, descrizione, richiede_dichiarazione, ordine, attiva)
VALUES
  ('IVA 22%', 22, 'Aliquota IVA ordinaria', false, 1, true),
  ('IVA 10%', 10, 'Aliquota IVA ridotta per ristrutturazioni edilizie', true, 2, true),
  ('IVA 4%', 4, 'Aliquota IVA super-ridotta per prima casa', true, 3, true)
ON CONFLICT DO NOTHING;

-- Verifica: se non inseriti per ON CONFLICT, forza l'esistenza
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.aliquote_iva WHERE percentuale = 22) THEN
    INSERT INTO public.aliquote_iva (nome, percentuale, descrizione, richiede_dichiarazione, ordine, attiva)
    VALUES ('IVA 22%', 22, 'Aliquota IVA ordinaria', false, 1, true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.aliquote_iva WHERE percentuale = 10) THEN
    INSERT INTO public.aliquote_iva (nome, percentuale, descrizione, richiede_dichiarazione, ordine, attiva)
    VALUES ('IVA 10%', 10, 'Aliquota IVA ridotta per ristrutturazioni edilizie', true, 2, true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.aliquote_iva WHERE percentuale = 4) THEN
    INSERT INTO public.aliquote_iva (nome, percentuale, descrizione, richiede_dichiarazione, ordine, attiva)
    VALUES ('IVA 4%', 4, 'Aliquota IVA super-ridotta per prima casa', true, 3, true);
  END IF;
END $$;
