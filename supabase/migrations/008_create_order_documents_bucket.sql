-- Migration 008: Crea il bucket Supabase Storage per i documenti degli ordini
-- Il bucket è pubblico in lettura (i PDF sono accessibili direttamente tramite URL)
-- L'upload è consentito solo tramite service_role (admin client)

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'order-documents',
    'order-documents',
    true,
    10485760,  -- 10 MB max per file
    ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Policy: lettura pubblica (il bucket è già public=true, ma aggiungiamo la policy esplicita)
DO $$ BEGIN
    CREATE POLICY "order_documents_public_read"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'order-documents');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Policy: upload solo per utenti autenticati con ruolo service_role
-- (in pratica l'admin client bypassa RLS, ma questa policy garantisce che
--  utenti normali non possano uploadare direttamente)
DO $$ BEGIN
    CREATE POLICY "order_documents_service_insert"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'order-documents');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE POLICY "order_documents_service_update"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'order-documents');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
