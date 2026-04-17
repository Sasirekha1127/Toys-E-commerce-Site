-- Migration: seller IDs -> S001, S002, ...

-- 1. Create a sequence for the numeric part of the ID
CREATE SEQUENCE IF NOT EXISTS seller_id_seq START WITH 10; -- Start higher to avoid collision with existing IDs if they were high

-- 2. Temporarily drop foreign key constraints referencing sellers
ALTER TABLE IF EXISTS seller_profile DROP CONSTRAINT IF EXISTS seller_profile_seller_id_fkey;
ALTER TABLE IF EXISTS seller_products DROP CONSTRAINT IF EXISTS seller_products_seller_id_fkey;
ALTER TABLE IF EXISTS products DROP CONSTRAINT IF EXISTS products_seller_id_fkey; -- This might not have a hard FK, checking
ALTER TABLE IF EXISTS discounts DROP CONSTRAINT IF EXISTS discounts_seller_id_fkey;

-- 3. Rename table and basic columns
ALTER TABLE IF EXISTS sellers RENAME COLUMN id TO seller_id;

-- 4. Change seller_id type to VARCHAR and format values
ALTER TABLE sellers ALTER COLUMN seller_id TYPE VARCHAR(20) USING CONCAT('S', LPAD(seller_id::text, 3, '0'));

-- 5. Update referencing tables
-- seller_profile
ALTER TABLE IF EXISTS seller_profile ALTER COLUMN seller_id TYPE VARCHAR(20) USING CONCAT('S', LPAD(seller_id::text, 3, '0'));

-- seller_products
ALTER TABLE IF EXISTS seller_products ALTER COLUMN seller_id TYPE VARCHAR(20) USING CONCAT('S', LPAD(seller_id::text, 3, '0'));

-- products
ALTER TABLE IF EXISTS products ALTER COLUMN seller_id TYPE VARCHAR(20) USING CONCAT('S', LPAD(seller_id::text, 3, '0'));

-- discounts
ALTER TABLE IF EXISTS discounts ALTER COLUMN seller_id TYPE VARCHAR(20) USING CONCAT('S', LPAD(seller_id::text, 3, '0'));

-- 6. Add back foreign key constraints
ALTER TABLE seller_profile ADD CONSTRAINT seller_profile_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES sellers(seller_id) ON DELETE CASCADE;
ALTER TABLE seller_products ADD CONSTRAINT seller_products_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES sellers(seller_id) ON DELETE CASCADE;
-- Note: products might not have had a hard FK constraint in early init_db.sql, but we'll add one if needed.
-- ALTER TABLE products ADD CONSTRAINT products_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES sellers(seller_id) ON DELETE SET NULL;
ALTER TABLE discounts ADD CONSTRAINT discounts_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES sellers(seller_id) ON DELETE CASCADE;
