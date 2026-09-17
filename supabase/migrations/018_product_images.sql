-- 018_product_images.sql
-- Gallery images table for products (max 10 per product).
-- products.image_url / hover_image_url remain for the two primary card images.
-- This table stores the additional gallery grid managed by the admin upload UI.

CREATE TABLE public.product_images (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id    UUID         NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  url           TEXT         NOT NULL,
  storage_path  TEXT         NOT NULL,
  alt_text      TEXT,
  sort_order    SMALLINT     NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
  CONSTRAINT product_images_storage_path_unique UNIQUE (storage_path)
);

CREATE INDEX product_images_product_sort_idx
  ON public.product_images(product_id, sort_order);

ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
-- No explicit RLS policies: service_role bypasses RLS.
-- anon and authenticated roles receive an implicit DENY on all operations.
