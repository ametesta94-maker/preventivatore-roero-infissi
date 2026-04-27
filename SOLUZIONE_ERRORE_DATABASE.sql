-- SOLUZIONE ERRORE "Infinite recursion detected in policy for relation profiles"

-- Il problema nasce perché la Policy di sicurezza sta cercando di leggere la tabella "profiles" 
-- per controllare se sei admin, ma per leggere la tabella deve controllare la Policy... creando un ciclo infinito.

-- PER RISOLVERE:
-- Copia e incolla il seguente codice ed eseguilo nell'SQL Editor della tua Dashboard Supabase:

-- 1. Creiamo una funzione di sistema che legge il ruolo aggirando i controlli di sicurezza (SECURITY DEFINER)
-- Questo rompe il ciclo infinito.
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text AS $$
DECLARE
  user_role text;
BEGIN
  SELECT ruolo INTO user_role
  FROM public.profiles
  WHERE id = auth.uid();
  
  RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Esempio di come aggiornare la Policy (Devi farlo manualmente nella sezione Authentication > Policies)

-- Se la tua policy attuale è qualcosa di simile a:
-- (SELECT ruolo FROM profiles WHERE id = auth.uid()) = 'admin'

-- CAMBIALA con questa:
-- get_my_role() = 'admin'

-- ESEMPIO COMPLETO per permettere agli Admin di vedere tutto e agli utenti solo il proprio profilo:
/*
DROP POLICY IF EXISTS "Profiles visibili a admin e utente stesso" ON public.profiles;

CREATE POLICY "Profiles visibili a admin e utente stesso" ON public.profiles
FOR SELECT USING (
  auth.uid() = id OR get_my_role() = 'admin'
);
*/
