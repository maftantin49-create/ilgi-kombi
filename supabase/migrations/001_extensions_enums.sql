-- ─────────────────────────────────────────────────────────────────────────────
-- 001_extensions_enums.sql
-- Extension'lar ve enum tipleri — diğer tüm migration'lardan önce çalışmalı
-- ─────────────────────────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Sipariş durumu ────────────────────────────────────────────────────────────
CREATE TYPE order_status AS ENUM (
  'draft',
  'pending_payment',
  'paid',
  'preparing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
  'partially_refunded'
);

-- ── Ödeme durumu ──────────────────────────────────────────────────────────────
CREATE TYPE payment_status AS ENUM (
  'initialized',
  'pending',
  'success',
  'failed',
  'cancelled',
  'refunded'
);

-- ── Stok hareketi tipi ────────────────────────────────────────────────────────
CREATE TYPE inventory_movement_type AS ENUM (
  'sale',
  'return',
  'manual_adjustment',
  'restock',
  'reservation',
  'reservation_release'
);

-- ── Adres tipi ────────────────────────────────────────────────────────────────
CREATE TYPE address_type AS ENUM (
  'shipping',
  'billing',
  'both'
);

-- ── Admin rolü ────────────────────────────────────────────────────────────────
CREATE TYPE admin_role AS ENUM (
  'super_admin',
  'admin',
  'staff'
);

-- ── Rezervasyon durumu ────────────────────────────────────────────────────────
CREATE TYPE reservation_status AS ENUM (
  'active',
  'converted',
  'released',
  'expired'
);
