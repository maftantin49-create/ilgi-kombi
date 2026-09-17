-- ─────────────────────────────────────────────────────────────────────────────
-- Migration  : 014_brands_name_unique.sql
-- Purpose    : brands.name sütununa UNIQUE constraint ekler.
--              brands.actions.ts zaten brands_name_key hatasını yakalıyor;
--              bu migration ölü error handler bloklarını aktif eder.
-- Depends on : 002_core_tables.sql (brands tablosu)
-- Safe to rerun: HAYIR — constraint zaten varsa ERROR: duplicate constraint name
-- Rollback   : ALTER TABLE brands DROP CONSTRAINT brands_name_key;
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE brands
  ADD CONSTRAINT brands_name_key UNIQUE (name);
