-- Add metadata columns to cart_items to support items not in the products table
ALTER TABLE cart_items
ADD COLUMN IF NOT EXISTS name VARCHAR(255),
ADD COLUMN IF NOT EXISTS image TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS category VARCHAR(100);
