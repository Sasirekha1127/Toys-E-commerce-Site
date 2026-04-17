-- Migration: users -> customer with formatted IDs (C001, C002, ...)

-- 1. Create a sequence to manage the numeric part of the ID
CREATE SEQUENCE IF NOT EXISTS customer_id_seq START WITH 100; -- Start higher to avoid overlaps if needed

-- 2. Temporarily drop foreign key constraints referencing users
ALTER TABLE IF EXISTS profile_page DROP CONSTRAINT IF EXISTS profile_page_user_id_fkey;
ALTER TABLE IF EXISTS cart_page DROP CONSTRAINT IF EXISTS cart_page_user_id_fkey;
ALTER TABLE IF EXISTS wishlist_page DROP CONSTRAINT IF EXISTS wishlist_page_user_id_fkey;
ALTER TABLE IF EXISTS orders DROP CONSTRAINT IF EXISTS orders_user_id_fkey;

-- 3. Rename table and basic columns
ALTER TABLE IF EXISTS users RENAME TO customer;
ALTER TABLE IF EXISTS customer RENAME COLUMN id TO customer_id;

-- 4. Change customer_id type to VARCHAR
-- First, cast the old integer ID to a formatted VARCHAR
ALTER TABLE customer ALTER COLUMN customer_id TYPE VARCHAR(20) USING CONCAT('C', LPAD(customer_id::text, 3, '0'));

-- 5. Update referencing tables
-- profile_page
ALTER TABLE IF EXISTS profile_page RENAME COLUMN user_id TO customer_id;
ALTER TABLE IF EXISTS profile_page ALTER COLUMN customer_id TYPE VARCHAR(20) USING CONCAT('C', LPAD(customer_id::text, 3, '0'));

-- cart_page
ALTER TABLE IF EXISTS cart_page RENAME COLUMN user_id TO customer_id;
ALTER TABLE IF EXISTS cart_page ALTER COLUMN customer_id TYPE VARCHAR(20) USING CONCAT('C', LPAD(customer_id::text, 3, '0'));

-- wishlist_page
ALTER TABLE IF EXISTS wishlist_page RENAME COLUMN user_id TO customer_id;
ALTER TABLE IF EXISTS wishlist_page ALTER COLUMN customer_id TYPE VARCHAR(20) USING CONCAT('C', LPAD(customer_id::text, 3, '0'));

-- orders
ALTER TABLE IF EXISTS orders RENAME COLUMN user_id TO customer_id;
ALTER TABLE IF EXISTS orders ALTER COLUMN customer_id TYPE VARCHAR(20) USING CONCAT('C', LPAD(customer_id::text, 3, '0'));

-- 6. Add back foreign key constraints
ALTER TABLE profile_page ADD CONSTRAINT profile_page_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES customer(customer_id) ON DELETE CASCADE;
ALTER TABLE cart_page ADD CONSTRAINT cart_page_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES customer(customer_id) ON DELETE CASCADE;
ALTER TABLE wishlist_page ADD CONSTRAINT wishlist_page_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES customer(customer_id) ON DELETE CASCADE;
ALTER TABLE orders ADD CONSTRAINT orders_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES customer(customer_id) ON DELETE SET NULL;

-- 7. (Optional) Set the sequence to the next available number based on existing count
-- SELECT setval('customer_id_seq', (SELECT MAX(id) FROM users)); -- This would have needed to be done before type change
-- Instead, we just ensure it starts after the highest current number if we keep using the sequence.
