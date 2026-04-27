-- Storage Policies per bucket 'assets'
-- Esegui questo SQL nel Supabase SQL Editor

-- Policy per permettere agli utenti autenticati di caricare file nella folder logos
CREATE POLICY "Allow authenticated users to upload logos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'assets'
    AND (storage.foldername(name))[1] = 'logos'
);

-- Policy per permettere lettura pubblica di tutti i file nel bucket assets
CREATE POLICY "Public read access for assets"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'assets');

-- Policy per permettere agli utenti autenticati di aggiornare i loro file
CREATE POLICY "Allow authenticated users to update their logos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'assets' AND (storage.foldername(name))[1] = 'logos')
WITH CHECK (bucket_id = 'assets' AND (storage.foldername(name))[1] = 'logos');

-- Policy per permettere agli utenti autenticati di eliminare i loro file
CREATE POLICY "Allow authenticated users to delete their logos"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'assets' AND (storage.foldername(name))[1] = 'logos');
