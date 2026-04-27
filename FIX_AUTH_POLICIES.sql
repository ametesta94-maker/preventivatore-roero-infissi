-- ============================================================================
-- FIX AUTENTICAZIONE E RLS POLICIES
-- ============================================================================
-- Esegui questo script nell'SQL Editor di Supabase Dashboard
-- https://supabase.com/dashboard/project/YOUR_PROJECT/sql/new

-- ----------------------------------------------------------------------------
-- 1. Funzione per ottenere il ruolo senza recursione
-- ----------------------------------------------------------------------------
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- 2. Trigger per creare automaticamente il profilo alla registrazione
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nome, cognome, ruolo, attivo)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nome', ''),
    COALESCE(NEW.raw_user_meta_data->>'cognome', ''),
    'operatore',
    true
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Rimuovi trigger esistente se presente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Crea il trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ----------------------------------------------------------------------------
-- 3. RLS Policies per la tabella profiles
-- ----------------------------------------------------------------------------

-- Rimuovi tutte le policy esistenti
DROP POLICY IF EXISTS "Profiles visibili a admin e utente stesso" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Abilita RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy SELECT: Utenti vedono solo il proprio profilo, admin vede tutti
CREATE POLICY "profiles_select_policy" ON public.profiles
FOR SELECT USING (
  auth.uid() = id OR get_my_role() = 'admin'
);

-- Policy INSERT: Gli utenti possono creare solo il proprio profilo
CREATE POLICY "profiles_insert_policy" ON public.profiles
FOR INSERT WITH CHECK (
  auth.uid() = id
);

-- Policy UPDATE: Gli utenti possono aggiornare solo il proprio profilo, admin può aggiornare tutti
CREATE POLICY "profiles_update_policy" ON public.profiles
FOR UPDATE USING (
  auth.uid() = id OR get_my_role() = 'admin'
) WITH CHECK (
  auth.uid() = id OR get_my_role() = 'admin'
);

-- Policy DELETE: Solo admin può eliminare profili
CREATE POLICY "profiles_delete_policy" ON public.profiles
FOR DELETE USING (
  get_my_role() = 'admin'
);

-- ----------------------------------------------------------------------------
-- 4. Verifica e creazione primo utente admin (OPZIONALE)
-- ----------------------------------------------------------------------------
-- Se vuoi creare un utente admin manualmente, usa questo dopo la registrazione:
-- 
-- UPDATE public.profiles
-- SET ruolo = 'admin'
-- WHERE email = 'tua-email@esempio.com';

-- ----------------------------------------------------------------------------
-- 5. Test delle policies
-- ----------------------------------------------------------------------------
-- Verifica che le policies siano attive
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'profiles';

SELECT * FROM public.profiles LIMIT 5;
