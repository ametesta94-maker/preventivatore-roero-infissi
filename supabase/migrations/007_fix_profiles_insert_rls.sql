-- Migration 007: Fix profile insertion during sign up
-- Il trigger auth.users che crea il profilo puo' fallire se la RLS e' troppo stringente (forzando auth.uid()).
-- Poiche' le policies su INSERT sono state restrittive in 004_fix_rls, un utente in fase di sing-up 
-- potrebbe non riuscire a scrivere il proprio profilo.



-- Rimuoviamo la policy di insert restrittiva
DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;

-- Creiamo una policy che consenta a un nuovo utente (in fase di signup) di scrivere nell'id corrispondente 
-- o diamo accesso in base al postgres role service_role/postgres (usato dal trigger)
-- La soluzione migliore per un trigger SECURITY DEFINER e' che bypassi RLS, 
-- ma assicuriamoci che da API gli utenti possano inserire se stessi.
CREATE POLICY "profiles_insert" ON public.profiles
FOR INSERT TO authenticated, anon
WITH CHECK (auth.uid() = id);

-- Per evitare problemi con il trigger auth, assicuriamoci che la funzione trigger
-- public.handle_new_user() sia dichiarata come SECURITY DEFINER in modo che scavalchi RLS:
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nome, cognome, ruolo, attivo)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nome', ''),
    COALESCE(NEW.raw_user_meta_data->>'cognome', ''),
    'operatore', -- default role matching frontend
    true
  );
  RETURN NEW;
END;
$$;
