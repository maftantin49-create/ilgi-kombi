-- ─────────────────────────────────────────────────────────────────────────────
-- 027_storage_rls.sql
-- Storage bucket policies for product-images.
-- Bucket created separately (Supabase dashboard / Management API).
-- These policies are idempotent: DROP IF EXISTS before CREATE.
-- ─────────────────────────────────────────────────────────────────────────────

-- Public read: anyone can view images in the product-images bucket
DROP POLICY IF EXISTS "product-images: public read"  ON storage.objects;
DROP POLICY IF EXISTS "product-images: admin insert" ON storage.objects;
DROP POLICY IF EXISTS "product-images: admin update" ON storage.objects;
DROP POLICY IF EXISTS "product-images: admin delete" ON storage.objects;

CREATE POLICY "product-images: public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "product-images: admin insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images'
    AND auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM public.admin_profiles
      WHERE id = auth.uid()
        AND is_active = true
    )
  );

CREATE POLICY "product-images: admin update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'product-images'
    AND auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM public.admin_profiles
      WHERE id = auth.uid()
        AND is_active = true
    )
  );

CREATE POLICY "product-images: admin delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'product-images'
    AND auth.role() = 'authenticated'
    AND EXISTS (
      SELECT 1 FROM public.admin_profiles
      WHERE id = auth.uid()
        AND is_active = true
    )
  );
