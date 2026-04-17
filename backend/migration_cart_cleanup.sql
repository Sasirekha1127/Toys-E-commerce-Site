-- Migration: Remove cached data from cart_items and enforce schema

-- 1. Drop unwanted columns (cached product info)
ALTER TABLE cart_items
DROP COLUMN IF EXISTS name,
DROP COLUMN IF EXISTS image,
DROP COLUMN IF EXISTS description,
DROP COLUMN IF EXISTS category; -- Also dropping category as it was in the old schema but not requested in the new refinement

-- 2. Standardize current columns
-- Ensure types and defaults correctly match the refined request
ALTER TABLE cart_items 
ALTER COLUMN quantity SET DEFAULT 1,
ALTER COLUMN unit_price TYPE NUMERIC(10,2),
ALTER COLUMN is_deleted SET DEFAULT FALSE;

-- Note: cart_items_id, cart_id, product_id, created_at, updated_at 
-- are already properly set from the previous migration.
