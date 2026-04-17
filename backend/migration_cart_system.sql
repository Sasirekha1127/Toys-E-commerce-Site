-- Migration: Refactor cart_page to carts + cart_items

-- 1. Create the parent carts table
CREATE TABLE IF NOT EXISTS carts (
    cart_id SERIAL PRIMARY KEY,
    customer_id VARCHAR(20) UNIQUE REFERENCES customer(customer_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Rename existing cart_page to cart_items
ALTER TABLE IF EXISTS cart_page RENAME TO cart_items;

-- 3. Populate carts table with existing customers who have items
INSERT INTO carts (customer_id)
SELECT DISTINCT customer_id FROM cart_items
ON CONFLICT (customer_id) DO NOTHING;

-- 4. Modify cart_items table structure
-- Add new columns first
ALTER TABLE cart_items
ADD COLUMN IF NOT EXISTS cart_items_id SERIAL,
ADD COLUMN IF NOT EXISTS cart_id INTEGER REFERENCES carts(cart_id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS unit_price NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

-- 5. Migrate data within cart_items
-- Update cart_id based on the customer_id mapping
UPDATE cart_items ci
SET cart_id = c.cart_id,
    quantity = ci.qty,
    unit_price = ci.price
FROM carts c
WHERE ci.customer_id = c.customer_id;

-- 6. Cleanup cart_items columns
-- Drop old columns after data is migrated
ALTER TABLE cart_items DROP COLUMN IF EXISTS id;
ALTER TABLE cart_items DROP COLUMN IF EXISTS customer_id;
ALTER TABLE cart_items DROP COLUMN IF EXISTS qty;
ALTER TABLE cart_items DROP COLUMN IF EXISTS price;

-- 7. Set cart_items_id as PRIMARY KEY
-- (Using a new name for the ID as requested by user)
ALTER TABLE cart_items ADD PRIMARY KEY (cart_items_id);

-- 8. Add constraints
-- Ensure each product unique within a cart
ALTER TABLE cart_items ADD CONSTRAINT unique_product_per_cart UNIQUE (cart_id, product_id);
