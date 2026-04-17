import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'local_db',
  password: 'sasi',
  port: 5432,
});

async function runMigration() {
  const migrationQuery = `
    DO $$ 
    BEGIN
      -- 1. Backup existing orders table if it hasn't been backed up yet
      IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'orders') 
         AND NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'orders_legacy') THEN
        ALTER TABLE orders RENAME TO orders_legacy;
      END IF;

      -- 2. Rename order_items to orders if order_items exists and orders doesn't
      IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'order_items') 
         AND NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'orders') THEN
        ALTER TABLE order_items RENAME TO orders;
      END IF;
    END $$;

    -- 3. Modify the new orders table
    ALTER TABLE orders DROP COLUMN IF EXISTS product_id;
    ALTER TABLE orders DROP COLUMN IF EXISTS quantity;
    ALTER TABLE orders DROP COLUMN IF EXISTS price_at_time_of_purchase;
    ALTER TABLE orders DROP COLUMN IF EXISTS order_id;

    ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_id VARCHAR(20);
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS address_id INTEGER;
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_id INTEGER;
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS seller_id VARCHAR(20);
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS subtotal NUMERIC(10,2);
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(10,2) DEFAULT 0;
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS tax_amount NUMERIC(10,2) DEFAULT 0;
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS total_amount NUMERIC(10,2);
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_charge NUMERIC(10,2) DEFAULT 0;
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_status VARCHAR(50);
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50);
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS ordered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
  `;

  try {
    console.log('Running final restructure migration...');
    await pool.query(migrationQuery);
    console.log('Migration success!');

    const res = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'orders'");
    console.log('New orders schema:', res.rows);
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await pool.end();
  }
}

runMigration();
