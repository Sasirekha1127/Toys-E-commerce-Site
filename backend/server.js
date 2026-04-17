import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import pg from 'pg';
import jwt from 'jsonwebtoken';

const { Pool } = pg;

const app = express();
const PORT = 5000;
const JWT_SECRET = 'your_jwt_secret_key';

app.use(cors());
app.use(express.json());

// REQUEST LOGGER
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// HEALTH CHECK
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date(), message: 'Server is running latest code' });
});

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'local_db',
  password: 'sasi',
  port: 5432,
});

// INITIALIZE SCHEMA
const initializeSchema = async () => {
  console.log('Initializing schema...');
  const client = await pool.connect();
  try {
    console.log('[Schema] Step 1: Enabling pgcrypto extension...');
    await client.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);
    console.log('[Schema] pgcrypto ready.');

    console.log('[Schema] Step 2: Creating products table (UUID schema)...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        category_id    UUID,
        seller_id      UUID,
        product_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name           VARCHAR(255),
        description    TEXT,
        sku            VARCHAR(100),
        price          DECIMAL(10,2),
        mrp            DECIMAL(10,2),
        stock_quantity INT          DEFAULT 0,
        weight         DECIMAL(10,2),
        length         DECIMAL(10,2),
        breadth        DECIMAL(10,2),
        height         DECIMAL(10,2),
        brand          VARCHAR(255),
        is_active      BOOLEAN      DEFAULT true,
        deleted_at     TIMESTAMP    NULL,
        created_at     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
        updated_at     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('[Schema] Products table created or already exists.');
    
    console.log('[Schema] Step 3: Creating categories table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        admin_id           UUID,
        category_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        parent_category_id UUID,
        name               VARCHAR(255),
        slug               VARCHAR(255),
        image_url          TEXT,
        is_active          BOOLEAN   DEFAULT true,
        created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('[Schema] Categories table created or already exists.');

    console.log('[Schema] Step 4: Creating return_requests table...');
    await client.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'refund_status_enum') THEN
            CREATE TYPE refund_status_enum AS ENUM ('pending', 'approved', 'rejected', 'processed');
        END IF;
      END $$;

      CREATE TABLE IF NOT EXISTS return_requests (
        return_request_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_item_id        UUID,
        customer_id          UUID,
        order_id             UUID,
        resolved_by_admin_id UUID,
        reason               TEXT,
        return_type          VARCHAR(100),
        refund_amount        DECIMAL(10,2),
        refund_status        refund_status_enum,
        resolution_note      TEXT,
        requested_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        resolved_at          TIMESTAMP
      );
    `);
    console.log('[Schema] Return requests table created or already exists.');

    console.log('[Schema] Step 5: Creating audit_logs table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        audit_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        admin_id     UUID,
        table_name   VARCHAR(255),
        record_id    VARCHAR(255),
        action       VARCHAR(100),
        old_values   JSONB,
        new_values   JSONB,
        ip_address   VARCHAR(45),
        user_agent   VARCHAR(64),
        created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('[Schema] Audit logs table created or already exists.');

    console.log('[Schema] Step 6: Creating order_status_history table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS order_status_history (
        history_id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id    UUID,
        status      VARCHAR(100),
        changed_by  VARCHAR(255),
        notes       TEXT,
        changed_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('[Schema] Order status history table created or already exists.');

    console.log('[Schema] Step 7: Creating addresses table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS addresses (
        customer_id    UUID,
        address_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        full_name      VARCHAR(255),
        phone          VARCHAR(20),
        address_line_1 TEXT,
        address_line_2 TEXT,
        city           VARCHAR(100),
        state          VARCHAR(100),
        pincode        VARCHAR(20),
        address_type   VARCHAR(50),
        is_default     BOOLEAN   DEFAULT false,
        deleted_at     TIMESTAMP,
        created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('[Schema] Addresses table created or already exists.');

    console.log('[Schema] Step 8: Creating auth_sessions table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS auth_sessions (
        session_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_type      VARCHAR(100),
        user_ref_id    UUID,
        token_hash     VARCHAR(64),
        device_info    VARCHAR(64),
        ip_address     VARCHAR(45),
        is_blacklisted BOOLEAN   DEFAULT false,
        expires_at     TIMESTAMP NOT NULL,
        created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('[Schema] Auth sessions table created or already exists.');

    console.log('[Schema] Step 9: Creating coupon_usage table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS coupon_usage (
        usage_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        coupon_id   UUID,
        customer_id UUID,
        order_id    UUID,
        used_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('[Schema] Coupon usage table created or already exists.');

    console.log('[Schema] Step 10: Creating reviews table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        order_item_id UUID,
        customer_id   UUID,
        product_id    UUID,
        review_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        rating        INT,
        title         VARCHAR(255),
        body          TEXT,
        created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('[Schema] Reviews table created or already exists.');

    console.log('[Schema] Step 11: Creating shiprocket_tracking table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS shiprocket_tracking (
        tracking_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        sr_order_id        UUID,
        awb_code          VARCHAR(255),
        current_status    VARCHAR(100),
        current_location  VARCHAR(50),
        estimated_delivery DATE,
        activity_log      JSONB,
        updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('[Schema] Shiprocket tracking table created or already exists.');

    const migrationQuery = `
      DO $$ 
      BEGIN 
          -- ================================================
          -- PRODUCTS TABLE: Add all required columns (idempotent)
          -- ================================================
          -- UUID primary key (new architecture)
          ALTER TABLE products ADD COLUMN IF NOT EXISTS product_id UUID DEFAULT gen_random_uuid();
          ALTER TABLE products ADD COLUMN IF NOT EXISTS category_id UUID;
          ALTER TABLE products ADD COLUMN IF NOT EXISTS seller_id   UUID;
          ALTER TABLE products ADD COLUMN IF NOT EXISTS name        VARCHAR(255);
          ALTER TABLE products ADD COLUMN IF NOT EXISTS description TEXT;
          ALTER TABLE products ADD COLUMN IF NOT EXISTS sku         VARCHAR(100);
          ALTER TABLE products ADD COLUMN IF NOT EXISTS price       DECIMAL(10,2);
          ALTER TABLE products ADD COLUMN IF NOT EXISTS mrp         DECIMAL(10,2);
          ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_quantity INT DEFAULT 0;
          ALTER TABLE products ADD COLUMN IF NOT EXISTS weight      DECIMAL(10,2);
          ALTER TABLE products ADD COLUMN IF NOT EXISTS length      DECIMAL(10,2);
          ALTER TABLE products ADD COLUMN IF NOT EXISTS breadth     DECIMAL(10,2);
          ALTER TABLE products ADD COLUMN IF NOT EXISTS height      DECIMAL(10,2);
          ALTER TABLE products ADD COLUMN IF NOT EXISTS brand       VARCHAR(255);
          ALTER TABLE products ADD COLUMN IF NOT EXISTS is_active   BOOLEAN DEFAULT TRUE;
          ALTER TABLE products ADD COLUMN IF NOT EXISTS deleted_at  TIMESTAMP NULL;
          ALTER TABLE products ADD COLUMN IF NOT EXISTS created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
          ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
          -- Extra columns used by existing route handlers
          ALTER TABLE products ADD COLUMN IF NOT EXISTS title          VARCHAR(255);
          ALTER TABLE products ADD COLUMN IF NOT EXISTS category       VARCHAR(255);
          ALTER TABLE products ADD COLUMN IF NOT EXISTS image_urls     TEXT[];
          ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url      TEXT;
          ALTER TABLE products ADD COLUMN IF NOT EXISTS age_group      VARCHAR(255);
          ALTER TABLE products ADD COLUMN IF NOT EXISTS material       VARCHAR(255);
          ALTER TABLE products ADD COLUMN IF NOT EXISTS featured       BOOLEAN DEFAULT FALSE;
          ALTER TABLE products ADD COLUMN IF NOT EXISTS product_status VARCHAR(50) DEFAULT 'active';
          ALTER TABLE products ADD COLUMN IF NOT EXISTS variant_name   VARCHAR(255);
          ALTER TABLE products ADD COLUMN IF NOT EXISTS variant_value  VARCHAR(255);
          ALTER TABLE products ADD COLUMN IF NOT EXISTS is_variant     BOOLEAN DEFAULT FALSE;

          -- ================================================
          -- CUSTOMER ID MIGRATION (C001 -> CUS001 format)
          -- ================================================
          IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'customer') THEN
              ALTER TABLE profile_page DROP CONSTRAINT IF EXISTS profile_page_customer_id_fkey;
              ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_customer_id_fkey;
              ALTER TABLE order_table DROP CONSTRAINT IF EXISTS order_table_customer_id_fkey;
              ALTER TABLE order_table DROP CONSTRAINT IF EXISTS orders_customer_id_fkey;
              ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_customer_id_fkey;
              ALTER TABLE carts DROP CONSTRAINT IF EXISTS carts_customer_id_fkey;
              ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_customer_id_fkey;
              ALTER TABLE wishlist_page DROP CONSTRAINT IF EXISTS wishlist_page_customer_id_fkey;
              UPDATE customer SET customer_id = CONCAT('CUS', SUBSTRING(customer_id FROM 2)) WHERE customer_id LIKE 'C%' AND customer_id NOT LIKE 'CUS%';
              IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profile_page') THEN
                  UPDATE profile_page SET customer_id = CONCAT('CUS', SUBSTRING(customer_id FROM 2)) WHERE customer_id LIKE 'C%' AND customer_id NOT LIKE 'CUS%';
              END IF;
              IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders') THEN
                  UPDATE orders SET customer_id = CONCAT('CUS', SUBSTRING(customer_id FROM 2)) WHERE customer_id LIKE 'C%' AND customer_id NOT LIKE 'CUS%';
              END IF;
              IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'order_table') THEN
                  UPDATE order_table SET customer_id = CONCAT('CUS', SUBSTRING(customer_id FROM 2)) WHERE customer_id LIKE 'C%' AND customer_id NOT LIKE 'CUS%';
              END IF;
              IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payments') THEN
                  UPDATE payments SET customer_id = CONCAT('CUS', SUBSTRING(customer_id FROM 2)) WHERE customer_id LIKE 'C%' AND customer_id NOT LIKE 'CUS%';
              END IF;
              IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'carts') THEN
                  UPDATE carts SET customer_id = CONCAT('CUS', SUBSTRING(customer_id FROM 2)) WHERE customer_id LIKE 'C%' AND customer_id NOT LIKE 'CUS%';
              END IF;
              IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications') THEN
                  UPDATE notifications SET customer_id = CONCAT('CUS', SUBSTRING(customer_id FROM 2)) WHERE customer_id LIKE 'C%' AND customer_id NOT LIKE 'CUS%';
              END IF;
              IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'wishlist_page') THEN
                  UPDATE wishlist_page SET customer_id = CONCAT('CUS', SUBSTRING(customer_id FROM 2)) WHERE customer_id LIKE 'C%' AND customer_id NOT LIKE 'CUS%';
              END IF;
          END IF;
          -- ================================================
          -- PRODUCTS TABLE CONSTRAINTS
          -- ================================================
          -- Primary key on product_id (only if no PK exists yet)
          IF NOT EXISTS (
              SELECT 1 FROM information_schema.table_constraints
              WHERE table_name = 'products' AND constraint_type = 'PRIMARY KEY'
          ) THEN
              BEGIN
                  ALTER TABLE products ADD CONSTRAINT products_pkey PRIMARY KEY (product_id);
              EXCEPTION WHEN others THEN
                  RAISE NOTICE 'Could not add products PK: %', SQLERRM;
              END;
          END IF;

          -- UNIQUE constraint for sku
          IF NOT EXISTS (
              SELECT 1 FROM pg_constraint WHERE conname = 'products_sku_unique'
          ) THEN
              BEGIN
                  ALTER TABLE products ADD CONSTRAINT products_sku_unique UNIQUE (sku);
              EXCEPTION WHEN others THEN
                  RAISE NOTICE 'Could not add sku unique constraint: %', SQLERRM;
              END;
          END IF;

          -- FK: seller_id -> sellers(seller_id)
          IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sellers') THEN
              IF NOT EXISTS (
                  SELECT 1 FROM pg_constraint WHERE conname = 'products_seller_id_fkey'
              ) THEN
                  BEGIN
                      ALTER TABLE products ADD CONSTRAINT products_seller_id_fkey
                        FOREIGN KEY (seller_id) REFERENCES sellers(seller_id) ON DELETE CASCADE;
                  EXCEPTION WHEN others THEN
                      RAISE NOTICE 'Could not add seller_id FK: %', SQLERRM;
                  END;
              END IF;
          END IF;

          -- FK: category_id -> categories(category_id)
          IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'categories') THEN
              IF NOT EXISTS (
                  SELECT 1 FROM pg_constraint WHERE conname = 'products_category_id_fkey'
              ) THEN
                  BEGIN
                      ALTER TABLE products ADD CONSTRAINT products_category_id_fkey
                        FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE SET NULL;
                  EXCEPTION WHEN others THEN
                      RAISE NOTICE 'Could not add category_id FK: %', SQLERRM;
                  END;
              END IF;
          END IF;

      END $$;

      -- ORDER SYSTEM RESTRUCTURING
      DO $$ 
      BEGIN
        -- 1. Backup existing orders table if it hasn''t been backed up yet
        IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'orders') 
           AND NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'orders_legacy') 
           AND NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'order_table') THEN
          ALTER TABLE orders RENAME TO orders_legacy;
        END IF;

        -- 2. Rename order_items to orders if order_items exists and orders doesn''t
        IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'order_items') 
           AND NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'orders') THEN
          ALTER TABLE order_items RENAME TO orders;
        END IF;

        -- 3. If neither orders nor order_items exist, create orders from scratch
        IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'orders') THEN
          CREATE TABLE orders (
            id SERIAL PRIMARY KEY,
            customer_id VARCHAR(50),
            ordered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        END IF;
      END $$;

      -- 4. Correct primary key sequence if needed (handled by SERIAL)
      
      -- 5. Modify/Expand the orders table (header table)
      ALTER TABLE orders DROP COLUMN IF EXISTS product_id;
      ALTER TABLE orders DROP COLUMN IF EXISTS quantity;
      ALTER TABLE orders DROP COLUMN IF EXISTS price_at_time_of_purchase;

      ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_id VARCHAR(50);
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS address_id INTEGER;
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_id INTEGER;
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS seller_id VARCHAR(50);
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS subtotal NUMERIC(10,2);
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(10,2) DEFAULT 0;
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS tax_amount NUMERIC(10,2) DEFAULT 0;
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS total_amount NUMERIC(10,2);
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_charge NUMERIC(10,2) DEFAULT 0;
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_address TEXT;
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_status VARCHAR(50);
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50);
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS items JSONB;
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS ordered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

      -- Expanding order_table (legacy/backup)
      DO $$ 
      BEGIN
        IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'orders_legacy') 
           AND NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'order_table') THEN
          ALTER TABLE orders_legacy RENAME TO order_table;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'order_table') THEN
          CREATE TABLE order_table (
            id SERIAL PRIMARY KEY,
            order_id VARCHAR(50),
            customer_id VARCHAR(50)
          );
        END IF;
      END $$;

      ALTER TABLE order_table ADD COLUMN IF NOT EXISTS order_id VARCHAR(50);
      ALTER TABLE order_table ADD COLUMN IF NOT EXISTS customer_id VARCHAR(50);
      ALTER TABLE order_table ADD COLUMN IF NOT EXISTS address_id INTEGER;
      ALTER TABLE order_table ADD COLUMN IF NOT EXISTS stocks INTEGER;
      ALTER TABLE order_table ADD COLUMN IF NOT EXISTS total_amount NUMERIC(10,2);
      ALTER TABLE order_table ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(10,2) DEFAULT 0;
      ALTER TABLE order_table ADD COLUMN IF NOT EXISTS final_amount NUMERIC(10,2);
      ALTER TABLE order_table ADD COLUMN IF NOT EXISTS coupon_code VARCHAR(100);
      ALTER TABLE order_table ADD COLUMN IF NOT EXISTS ordered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

      -- 13. CREATE deliveries TABLE
      CREATE TABLE IF NOT EXISTS deliveries (
        delivery_id SERIAL PRIMARY KEY,
        order_id INTEGER,
        order_item_id INTEGER,
        seller_id VARCHAR(50),
        address_id INTEGER,
        pickup_loc_id VARCHAR(50),
        processed_webhook_id VARCHAR(100),
        shipping_address_snapshot JSONB,
        shiprocket_order_id VARCHAR(50),
        shipment_id VARCHAR(50),
        awb_code VARCHAR(50),
        courier_name VARCHAR(100),
        shipping_status VARCHAR(50),
        estimated_delivery_date TIMESTAMP,
        dispatched_at TIMESTAMP,
        delivered_at TIMESTAMP
      );

      -- ENSURE ALL COLUMNS EXIST (Robustness)
      DO $$ 
      BEGIN
          ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS order_id INTEGER;
          ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS order_item_id INTEGER;
          ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS seller_id VARCHAR(50);
          ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS address_id INTEGER;
          ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS pickup_loc_id VARCHAR(50);
          ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS processed_webhook_id VARCHAR(100);
          ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS shipping_address_snapshot JSONB;
          ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS shiprocket_order_id VARCHAR(50);
          ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS shipment_id VARCHAR(50);
          ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS awb_code VARCHAR(50);
          ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS courier_name VARCHAR(100);
          ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS shipping_status VARCHAR(50);
          ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS estimated_delivery_date TIMESTAMP;
          ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS dispatched_at TIMESTAMP;
          ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP;
      END $$;

      -- ADD FOREIGN KEYS FOR deliveries
      DO $$ 
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders') THEN
          IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'deliveries_order_id_fkey') THEN
            ALTER TABLE deliveries ADD CONSTRAINT deliveries_order_id_fkey FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;
          END IF;
        END IF;

        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'order_items') THEN
          IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'deliveries_order_item_id_fkey') THEN
            ALTER TABLE deliveries ADD CONSTRAINT deliveries_order_item_id_fkey FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE CASCADE;
          END IF;
        END IF;

        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sellers') THEN
          IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'deliveries_seller_id_fkey') THEN
            ALTER TABLE deliveries ADD CONSTRAINT deliveries_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES sellers(seller_id) ON DELETE SET NULL;
          END IF;
        END IF;

        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'address') THEN
          IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'deliveries_address_id_fkey') THEN
            ALTER TABLE deliveries ADD CONSTRAINT deliveries_address_id_fkey FOREIGN KEY (address_id) REFERENCES address(id) ON DELETE SET NULL;
          END IF;
        END IF;
      END $$;

      -- 6. CREATE PAYMENTS TABLE
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        order_id INTEGER,
        customer_id VARCHAR(50),
        payment_method VARCHAR(50),
        amount NUMERIC(10,2),
        payment_status VARCHAR(50),
        gateway_name VARCHAR(50),
        gateway_response JSONB,
        failure_reason TEXT,
        paid_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- 7. MIGRATE EXISTING ORDERS TO PAYMENTS
      INSERT INTO payments (order_id, customer_id, amount, payment_status, payment_method, paid_at, created_at, updated_at)
      SELECT 
        o.id, 
        o.customer_id, 
        o.total_amount, 
        o.payment_status, 
        'Unknown', 
        CASE WHEN o.payment_status = 'paid' THEN o.ordered_at ELSE NULL END,
        o.ordered_at,
        o.ordered_at
      FROM orders o
      LEFT JOIN payments p ON o.id = p.order_id
      WHERE p.id IS NULL;

      -- 8. FIX SELLERS TABLE FOR NEW REGISTRATION FLOW
      ALTER TABLE sellers ALTER COLUMN name DROP NOT NULL;

      -- 9. ADD COLUMNS TO wishlist_items
      ALTER TABLE wishlist_items ADD COLUMN IF NOT EXISTS wishlist_item_id SERIAL;
      ALTER TABLE wishlist_items ADD COLUMN IF NOT EXISTS wishlist_id INTEGER;
      ALTER TABLE wishlist_items ADD COLUMN IF NOT EXISTS product_id INTEGER;
      ALTER TABLE wishlist_items ADD COLUMN IF NOT EXISTS added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

      -- 10. ADD COLUMNS TO seller_payouts
      CREATE TABLE IF NOT EXISTS seller_payouts (id SERIAL PRIMARY KEY);
      ALTER TABLE seller_payouts ADD COLUMN IF NOT EXISTS payout_id SERIAL;
      ALTER TABLE seller_payouts ADD COLUMN IF NOT EXISTS seller_id VARCHAR(50);
      ALTER TABLE seller_payouts ADD COLUMN IF NOT EXISTS initiated_by VARCHAR(50);
      ALTER TABLE seller_payouts ADD COLUMN IF NOT EXISTS admin_id INTEGER;
      ALTER TABLE seller_payouts ADD COLUMN IF NOT EXISTS amount NUMERIC(10,2);
      ALTER TABLE seller_payouts ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);
      ALTER TABLE seller_payouts ADD COLUMN IF NOT EXISTS transaction_ref VARCHAR(100);
      ALTER TABLE seller_payouts ADD COLUMN IF NOT EXISTS status VARCHAR(50);
      ALTER TABLE seller_payouts ADD COLUMN IF NOT EXISTS notes TEXT;
      ALTER TABLE seller_payouts ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
      ALTER TABLE seller_payouts ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP NULL;
      ALTER TABLE seller_payouts ADD COLUMN IF NOT EXISTS payout_period_status VARCHAR(50);
      ALTER TABLE seller_payouts ADD COLUMN IF NOT EXISTS payout_period_end TIMESTAMP NULL;

      -- 11. CREATE order_coupons TABLE
      CREATE TABLE IF NOT EXISTS order_coupons (
        order_coupon_id SERIAL PRIMARY KEY,
        order_id INTEGER,
        coupon_id INTEGER,
        discount_amount NUMERIC(10,2),
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- 12. CREATE coupons TABLE
      CREATE TABLE IF NOT EXISTS coupons (
        coupon_id SERIAL PRIMARY KEY,
        admin_id INTEGER,
        code VARCHAR(50) UNIQUE,
        type VARCHAR(50),
        discount_percent NUMERIC(5,2),
        max_discount NUMERIC(10,2),
        min_order_val NUMERIC(10,2),
        used_count INTEGER DEFAULT 0,
        valid_until TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      -- 14. CREATE shiprocket TABLE
      CREATE TABLE IF NOT EXISTS shiprocket (
        sr_order_id VARCHAR(50) PRIMARY KEY,
        order_id INTEGER,
        payment_id INTEGER,
        channel_order_id VARCHAR(50),
        awb_code VARCHAR(50),
        shipment_id VARCHAR(50),
        courier_id VARCHAR(50),
        courier_name VARCHAR(100),
        pickup_location VARCHAR(100),
        sr_status VARCHAR(50),
        sr_status_code INTEGER,
        sr_created_at TIMESTAMP,
        updated_at TIMESTAMP
      );

      -- ENSURE ALL COLUMNS EXIST (Robustness)
      DO $$ 
      BEGIN
          ALTER TABLE shiprocket ADD COLUMN IF NOT EXISTS sr_order_id VARCHAR(50);
          ALTER TABLE shiprocket ADD COLUMN IF NOT EXISTS order_id INTEGER;
          ALTER TABLE shiprocket ADD COLUMN IF NOT EXISTS payment_id INTEGER;
          ALTER TABLE shiprocket ADD COLUMN IF NOT EXISTS channel_order_id VARCHAR(50);
          ALTER TABLE shiprocket ADD COLUMN IF NOT EXISTS awb_code VARCHAR(50);
          ALTER TABLE shiprocket ADD COLUMN IF NOT EXISTS shipment_id VARCHAR(50);
          ALTER TABLE shiprocket ADD COLUMN IF NOT EXISTS courier_id VARCHAR(50);
          ALTER TABLE shiprocket ADD COLUMN IF NOT EXISTS courier_name VARCHAR(100);
          ALTER TABLE shiprocket ADD COLUMN IF NOT EXISTS pickup_location VARCHAR(100);
          ALTER TABLE shiprocket ADD COLUMN IF NOT EXISTS sr_status VARCHAR(50);
          ALTER TABLE shiprocket ADD COLUMN IF NOT EXISTS sr_status_code INTEGER;
          ALTER TABLE shiprocket ADD COLUMN IF NOT EXISTS sr_created_at TIMESTAMP;
          ALTER TABLE shiprocket ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP;
      END $$;

      -- ADD FOREIGN KEYS FOR shiprocket
      DO $$ 
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders') THEN
          IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'shiprocket_order_id_fkey') THEN
            ALTER TABLE shiprocket ADD CONSTRAINT shiprocket_order_id_fkey FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;
          END IF;
        END IF;

        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payments') THEN
          IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'shiprocket_payment_id_fkey') THEN
            ALTER TABLE shiprocket ADD CONSTRAINT shiprocket_payment_id_fkey FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE;
          END IF;
        END IF;
      END $$;
 
      -- 15. CREATE product_variants TABLE
      CREATE TABLE IF NOT EXISTS product_variants (
        variant_id SERIAL PRIMARY KEY,
        product_id INTEGER,
        sku VARCHAR(255),
        variant_name VARCHAR(255),
        variant_value VARCHAR(255),
        price NUMERIC(10,2),
        stock_quantity INTEGER DEFAULT 0,
        weight NUMERIC(10,2)
      );
 
      -- ENSURE ALL COLUMNS EXIST (Robustness)
      DO $$ 
      BEGIN
          ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS product_id INTEGER;
          ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS sku VARCHAR(255);
          ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS variant_name VARCHAR(255);
          ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS variant_value VARCHAR(255);
          ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS price NUMERIC(10,2);
          ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 0;
          ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS weight NUMERIC(10,2);
      END $$;
 
      -- ADD FOREIGN KEYS FOR product_variants
      DO $$ 
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products') THEN
          IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'product_variants_product_id_fkey') THEN
            ALTER TABLE product_variants ADD CONSTRAINT product_variants_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
          END IF;
        END IF;
      END $$;
 
      -- 16. CREATE notifications TABLE
      CREATE TABLE IF NOT EXISTS notifications (
        notification_id SERIAL PRIMARY KEY,
        customer_id VARCHAR(50),
        seller_id VARCHAR(50),
        order_id INTEGER,
        type VARCHAR(50),
        message TEXT,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Notifications Constraints Logic
      DO $$ BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'customer') THEN
          IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'notifications_customer_id_fkey') THEN
            ALTER TABLE notifications ADD CONSTRAINT notifications_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES customer(customer_id) ON DELETE CASCADE;
          END IF;
        END IF;

        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sellers') THEN
          IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'notifications_seller_id_fkey') THEN
            ALTER TABLE notifications ADD CONSTRAINT notifications_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES sellers(seller_id) ON DELETE CASCADE;
          END IF;
        END IF;
      END $$;

      -- 17. REFACTOR cart_items TABLE
      DROP TABLE IF EXISTS cart_items CASCADE;
      CREATE TABLE cart_items (
          variant_id   UUID,
          product_id   UUID,
          cart_id      UUID,
          cart_item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          quantity     INT DEFAULT 1,
          price        DECIMAL(10,2),
          created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Cart Items Constraints Logic
      DO $$ BEGIN
        -- Attempt to add foreign keys (safety wrapped)
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'product_variants') THEN
          BEGIN
            ALTER TABLE cart_items ADD CONSTRAINT cart_items_variant_id_fkey 
              FOREIGN KEY (variant_id) REFERENCES product_variants(variant_id) ON DELETE CASCADE;
          EXCEPTION WHEN others THEN
            RAISE NOTICE 'Skipped FK for variant_id.';
          END;
        END IF;

        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products') THEN
          BEGIN
            ALTER TABLE cart_items ADD CONSTRAINT cart_items_product_id_fkey 
              FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE;
          EXCEPTION WHEN others THEN
            RAISE NOTICE 'Skipped FK for product_id.';
          END;
        END IF;

        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'carts') THEN
          BEGIN
            ALTER TABLE cart_items ADD CONSTRAINT cart_items_cart_id_fkey 
              FOREIGN KEY (cart_id) REFERENCES carts(cart_id) ON DELETE CASCADE;
          EXCEPTION WHEN others THEN
            RAISE NOTICE 'Skipped FK for cart_id.';
          END;
        END IF;

        -- Trigger function for updated_at
        IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
          EXECUTE 'CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $func$ BEGIN NEW.updated_at = CURRENT_TIMESTAMP; RETURN NEW; END; $func$ LANGUAGE plpgsql;';
        END IF;

        -- Apply trigger to cart_items
        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_cart_items_updated_at') THEN
          CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        END IF;
      END $$;

      -- 18. CREATE bank_account TABLE
      -- Enums must be created in a separate step if we want to check for existence
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'owner_type_enum') THEN
            CREATE TYPE owner_type_enum AS ENUM ('seller_id', 'customer_id');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'account_type_enum') THEN
            CREATE TYPE account_type_enum AS ENUM ('savings', 'current');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'verification_status_enum') THEN
            CREATE TYPE verification_status_enum AS ENUM ('pending', 'verified', 'rejected');
        END IF;
      END $$;

      CREATE TABLE IF NOT EXISTS bank_account (
          bank_account_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          owner_id             UUID NOT NULL,
          owner_type          owner_type_enum,
          account_number       VARCHAR(20),
          account_holder_name VARCHAR(255),
          upi_id              VARCHAR(100),
          bank_name           VARCHAR(100),
          ifsc_code           VARCHAR(20),
          account_type        account_type_enum,
          verification_status verification_status_enum DEFAULT 'pending',
          verified_at         TIMESTAMP,
          is_active           BOOLEAN DEFAULT true,
          is_primary          BOOLEAN DEFAULT false,
          created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          verified_by_admin_id UUID
      );

      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_bank_account_updated_at') THEN
            CREATE TRIGGER update_bank_account_updated_at BEFORE UPDATE ON bank_account FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        END IF;
      END $$;
    `;
    await client.query(migrationQuery);
    console.log('Schema initialization completed.');
  } catch (err) {
    console.error('Schema initialization failed:', err);
  } finally {
    client.release();
  }
};

initializeSchema();

pool.on('connect', () => {
  console.log('Connected to PostgreSQL: local_db');
});

app.get('/', (req, res) => {
  res.send('Server running');
});

// HELPER: GENERATE CUSTOM ID
const generateCustomId = async (tableName, columnName, prefix) => {
  try {
    // We filter for IDs matching the prefix and suffix pattern, then sort numerically by the suffix
    const result = await pool.query(
      `SELECT ${columnName} FROM ${tableName} 
       WHERE ${columnName} ~ $1 
       ORDER BY CAST(SUBSTRING(${columnName} FROM ${prefix.length + 1}) AS INTEGER) DESC 
       LIMIT 1`,
      [`^${prefix}[0-9]+$`]
    );

    if (result.rows.length === 0) {
      return `${prefix}001`;
    }

    const lastId = result.rows[0][columnName];
    const match = lastId.match(/\d+$/);
    const lastNumber = match ? parseInt(match[0], 10) : 0;
    const nextNumber = lastNumber + 1;

    // Maintain at least 3 digits of padding as per CUS001/PRDT001 examples
    return `${prefix}${nextNumber.toString().padStart(3, '0')}`;
  } catch (err) {
    console.error(`Error generating custom ID for ${tableName}:`, err);
    throw err;
  }
};

// HELPER: NORMALIZE CUSTOMER ID (e.g. 7 -> CUS007, C007 -> CUS007)
const normalizeCustomerId = (id) => {
  if (!id) return id;
  const s = String(id).trim();
  if (s.startsWith('CUS')) return s;
  const match = s.match(/\d+/);
  if (match) {
    return `CUS${match[0].padStart(3, '0')}`;
  }
  return s;
};

// HELPER: NORMALIZE PRODUCT ID (e.g. 2 -> PRDT002)
const normalizeProductId = (id) => {
  if (!id) return id;
  const s = String(id).trim();
  if (s.startsWith('PRDT')) return s;
  const match = s.match(/\d+/);
  if (match) {
    return `PRDT${match[0].padStart(3, '0')}`;
  }
  return s;
};

// USER REGISTER
app.post('/api/auth/user/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existing = await pool.query(
      'SELECT customer_id FROM customer WHERE email = $1',
      [email]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const customer_id = await generateCustomId('customer', 'customer_id', 'CUS');

    const result = await pool.query(
      "INSERT INTO customer (customer_id, name, email, password) VALUES ($1, $2, $3, $4) RETURNING customer_id, name, email",
      [customer_id, name, email, hashedPassword]
    );

    res.status(201).json({
      user: result.rows[0],
      message: 'User registered successfully',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'User registration failed', details: err.message });
  }
});

// COMBINED LOGIN
app.post('/api/auth/user/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Admin
    let result = await pool.query('SELECT * FROM admins WHERE email = $1', [email]);
    if (result.rows.length > 0) {
      const admin = result.rows[0];
      const isMatched = await bcrypt.compare(password, admin.password);

      if (isMatched) {
        const token = jwt.sign(
          { id: admin.id, role: 'admin' },
          JWT_SECRET,
          { expiresIn: '1d' }
        );

        return res.json({
          token,
          user: { id: admin.id, email: admin.email, role: 'admin' },
        });
      }
    }

    // Seller
    result = await pool.query('SELECT * FROM sellers WHERE email = $1', [email]);
    if (result.rows.length > 0) {
      const seller = result.rows[0];
      const isMatched = await bcrypt.compare(password, seller.password);

      if (isMatched) {
        const token = jwt.sign(
          { id: seller.seller_id, role: 'seller' },
          JWT_SECRET,
          { expiresIn: '1d' }
        );

        return res.json({
          token,
          user: {
            id: seller.seller_id,
            name: seller.name,
            email: seller.email,
            role: 'seller',
            onboardingCompleted: seller.onboarding_completed,
          },
        });
      }
    }

    // User
    result = await pool.query('SELECT * FROM customer WHERE email = $1', [email]);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      const isMatched = await bcrypt.compare(password, user.password);

      if (isMatched) {
        const normalizedId = normalizeCustomerId(user.customer_id);
        const token = jwt.sign(
          { id: normalizedId, role: 'user' },
          JWT_SECRET,
          { expiresIn: '1d' }
        );

        return res.json({
          token,
          user: {
            id: normalizedId,
            name: user.name,
            email: user.email,
            phone: user.phone,
            address: user.address,
            role: 'user',
          },
        });
      }
    }

    return res.status(401).json({ error: 'Invalid credentials' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed', details: err.message });
  }
});

// GET USER PROFILE
app.get('/api/user/profile/:id', async (req, res) => {
  const { id } = req.params;
  const normalizedId = normalizeCustomerId(id);
  try {
    const result = await pool.query(
      `
      SELECT 
        u.customer_id,
        u.name,
        u.email,
        p.phone,
        p.address,
        p.bio,
        p.birthdate
      FROM customer u
      LEFT JOIN profile_page p ON u.customer_id = p.customer_id
      WHERE u.customer_id = $1
      `,
      [normalizedId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ error: 'Failed to fetch user profile', details: err.message });
  }
});

// UPDATE USER PROFILE
app.put('/api/user/profile/:id', async (req, res) => {
  const { id } = req.params;
  const normalizedId = normalizeCustomerId(id);
  const { name, email, phone, address, bio, birthdate } = req.body;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const userUpdate = await client.query(
      `
      UPDATE customer
      SET name = $1, email = $2
      WHERE customer_id = $3
      RETURNING customer_id, name, email
      `,
      [name, email, normalizedId]
    );

    if (userUpdate.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'User not found' });
    }

    const profileUpdate = await client.query(
      `
      INSERT INTO profile_page (customer_id, phone, address, bio, birthdate)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (customer_id) DO UPDATE
      SET phone = EXCLUDED.phone,
          address = EXCLUDED.address,
          bio = EXCLUDED.bio,
          birthdate = EXCLUDED.birthdate,
          updated_at = CURRENT_TIMESTAMP
      RETURNING phone, address, bio, birthdate
      `,
      [id, phone, address, bio, birthdate]
    );

    await client.query('COMMIT');

    res.json({
      user: {
        ...userUpdate.rows[0],
        ...profileUpdate.rows[0],
      },
      message: 'Profile updated successfully',
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error updating profile:', err);

    if (err.code === '23505') {
      return res.status(400).json({ error: 'Email already exists' });
    }

    res.status(500).json({ error: 'Failed to update profile', details: err.message });
  } finally {
    client.release();
  }
});

// ADMIN LOGIN
app.post('/api/auth/admin/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM admins WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const admin = result.rows[0];
    const isMatched = await bcrypt.compare(password, admin.password);

    if (!isMatched) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: admin.id, role: 'admin' },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: { id: admin.id, email: admin.email, role: 'admin' },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed', details: err.message });
  }
});

// SELLER REGISTER
// SELLER REGISTER
app.post('/api/auth/seller/register', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Use a clean email for searching and inserting
    const cleanEmail = email.trim().toLowerCase();

    const existing = await pool.query(
      'SELECT seller_id FROM sellers WHERE LOWER(email) = $1',
      [cleanEmail]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `
      INSERT INTO sellers (seller_id, email, password, onboarding_completed, name)
      VALUES (
        CONCAT('S', LPAD(NEXTVAL('seller_id_seq')::text, 3, '0')),
        $1,
        $2,
        FALSE,
        'New Seller'
      )
      RETURNING seller_id, email, onboarding_completed, name
      `,
      [cleanEmail, hashedPassword]
    );

    const seller = result.rows[0];
    console.log(`[SUCCESS] New seller registered: ${seller.seller_id} (${seller.email})`);

    res.status(201).json({
      seller: {
        id: seller.seller_id,
        email: seller.email,
        name: seller.name,
        role: 'seller',
        onboardingCompleted: !!seller.onboarding_completed,
      },
      message: 'Seller registered successfully',
    });
  } catch (err) {
    console.error('DETAILED Seller registration error:', {
      message: err.message,
      code: err.code,
      detail: err.detail,
    });
    res.status(500).json({
      error: 'Seller registration failed',
      details: err.message
    });
  }
});

// SELLER LOGIN
app.post('/api/auth/seller/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await pool.query(
      'SELECT * FROM sellers WHERE email = $1',
      [email.trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const seller = result.rows[0];
    const isMatched = await bcrypt.compare(password, seller.password);

    if (!isMatched) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: seller.seller_id, role: 'seller' },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: seller.seller_id,
        email: seller.email,
        role: 'seller',
        onboardingCompleted: !!seller.onboarding_completed,
      },
      message: 'Seller login successful',
    });
  } catch (err) {
    console.error('Seller login error:', err);
    res.status(500).json({ error: 'Login failed', details: err.message });
  }
});

// SELLER ONBOARDING COMPLETE
app.post('/api/auth/seller/onboarding/complete', async (req, res) => {
  const { seller_id, email } = req.body;

  try {
    let result;

    if (seller_id) {
      result = await pool.query(
        `
        UPDATE sellers
        SET onboarding_completed = TRUE
        WHERE seller_id = $1
        RETURNING seller_id, email, onboarding_completed
        `,
        [seller_id]
      );
    } else if (email) {
      result = await pool.query(
        `
        UPDATE sellers
        SET onboarding_completed = TRUE
        WHERE email = $1
        RETURNING seller_id, email, onboarding_completed
        `,
        [email]
      );
    } else {
      return res.status(400).json({ error: 'seller_id or email is required' });
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Seller not found' });
    }

    const seller = result.rows[0];

    res.json({
      seller: {
        id: seller.seller_id,
        email: seller.email,
        role: 'seller',
        onboardingCompleted: !!seller.onboarding_completed,
      },
      message: 'Onboarding marked as complete',
    });
  } catch (err) {
    console.error('Onboarding completion error:', err);
    res.status(500).json({ error: 'Failed to update onboarding status', details: err.message });
  }
});

// SELLER UPDATE PASSWORD
app.post('/api/auth/seller/update-password', async (req, res) => {
  const { email, currentPassword, newPassword } = req.body;

  try {
    const result = await pool.query('SELECT * FROM sellers WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Seller not found' });
    }

    const seller = result.rows[0];
    const isMatched = await bcrypt.compare(currentPassword, seller.password);

    if (!isMatched) {
      return res.status(401).json({ error: 'Incorrect current password' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query(
      'UPDATE sellers SET password = $1 WHERE email = $2',
      [hashedPassword, email]
    );

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Update password error:', err);
    res.status(500).json({ error: 'Failed to update password', details: err.message });
  }
});

// GET SELLER PROFILE
app.get('/api/auth/seller/profile/:id', async (req, res) => {
  const { id } = req.params;
  console.log(`>>> HIT: GET Seller Profile for ID: ${id}`);

  try {
    const result = await pool.query(
      `
      SELECT
        s.seller_id,
        s.name,
        s.email,
        s.onboarding_completed,
        COALESCE(s.store_name, '') AS store_name,
        COALESCE(sp.phone, '') AS phone,
        COALESCE(sp.location, '') AS location,
        COALESCE(sp.bio, '') AS bio
      FROM sellers s
      LEFT JOIN seller_profile sp ON s.seller_id = sp.seller_id
      WHERE s.seller_id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      console.log(`Seller not found: ${id}`);
      return res.status(404).json({ error: 'Seller not found' });
    }

    const sellerData = result.rows[0];
    console.log(`Successfully fetched profile for seller: ${id}`);
    res.json({
      seller: {
        ...sellerData,
        onboardingCompleted: !!sellerData.onboarding_completed,
      }
    });
  } catch (err) {
    console.error('Error fetching seller profile:', err);
    res.status(500).json({ error: 'Failed to fetch seller profile', details: err.message });
  }
});

// UPDATE SELLER PROFILE
app.put('/api/auth/seller/profile/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, store_name, phone, location, bio } = req.body;
  console.log(`>>> HIT: PUT Seller Profile for ID: ${id}`);

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const sellerCheck = await client.query(
      'SELECT seller_id FROM sellers WHERE seller_id = $1',
      [id]
    );

    if (sellerCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      console.log(`Seller not found for update: ${id}`);
      return res.status(404).json({ error: 'Seller not found' });
    }

    const sellerUpdate = await client.query(
      `
      UPDATE sellers
      SET name = $1,
          email = $2,
          store_name = $3
      WHERE seller_id = $4
      RETURNING seller_id as id, name, email, store_name
      `,
      [name, email, store_name, id]
    );

    const profileUpdate = await client.query(
      `
      INSERT INTO seller_profile (seller_id, phone, location, bio)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (seller_id) DO UPDATE
      SET phone = EXCLUDED.phone,
          location = EXCLUDED.location,
          bio = EXCLUDED.bio,
          updated_at = CURRENT_TIMESTAMP
      RETURNING phone, location, bio
      `,
      [id, phone, location, bio]
    );

    await client.query('COMMIT');
    console.log(`Successfully updated profile for seller: ${id}`);

    res.json({
      seller: {
        ...sellerUpdate.rows[0],
        ...profileUpdate.rows[0],
      },
      message: 'Profile updated successfully',
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error updating seller profile:', err);

    if (err.code === '23505') {
      return res.status(400).json({ error: 'Email already exists' });
    }

    res.status(500).json({ error: 'Failed to update profile', details: err.message });
  } finally {
    client.release();
  }
});

// ADD PRODUCT
app.post('/api/products', async (req, res) => {
  const {
    seller_id,
    title,
    description,
    price,
    stock_quantity,
    category,
    image_urls,
  } = req.body;

  try {
    const product_id = await generateCustomId('products', 'id', 'PRDT');

    const result = await pool.query(
      `
      INSERT INTO products (
        id,
        seller_id,
        title,
        description,
        price,
        stock_quantity,
        category,
        image_urls
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
      `,
      [
        product_id,
        seller_id,
        title,
        description,
        price,
        stock_quantity || 0,
        category,
        image_urls || [],
      ]
    );


    res.status(201).json({
      product: result.rows[0],
      message: 'Product added successfully',
    });
  } catch (err) {
    console.error('Error adding product:', err);
    res.status(500).json({ error: 'Failed to add product', details: err.message });
  }
});

// GET PRODUCTS
app.get('/api/products', async (req, res) => {
  const { seller_id } = req.query;

  try {
    let result;

    if (seller_id) {
      result = await pool.query(
        'SELECT * FROM products WHERE seller_id = $1 ORDER BY created_at DESC',
        [seller_id]
      );
    } else {
      result = await pool.query(
        'SELECT * FROM products ORDER BY created_at DESC'
      );
    }

    res.json({ products: result.rows });
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Failed to fetch products', details: err.message });
  }
});

// UPDATE PRODUCT
app.put('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  const normalizedId = normalizeProductId(id);
  const {
    title,
    description,
    price,
    stock_quantity,
    category,
    image_urls,
  } = req.body;

  try {
    const result = await pool.query(
      `
      UPDATE products
      SET title = $1,
          description = $2,
          price = $3,
          stock_quantity = $4,
          category = $5,
          image_urls = $6,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *
      `,
      [title, description, price, stock_quantity, category, image_urls || [], normalizedId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({
      product: result.rows[0],
      message: 'Product updated successfully',
    });
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ error: 'Failed to update product', details: err.message });
  }
});

// UPDATE PRODUCT STOCK
app.put('/api/products/:id/stock', async (req, res) => {
  const { id } = req.params;
  const normalizedId = normalizeProductId(id);
  const { stock_quantity } = req.body;

  try {
    const result = await pool.query(
      `
      UPDATE products
      SET stock_quantity = $1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
      `,
      [stock_quantity, normalizedId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({
      product: result.rows[0],
      message: 'Stock updated',
    });
  } catch (err) {
    console.error('Error updating stock:', err);
    res.status(500).json({ error: 'Failed to update stock', details: err.message });
  }
});

// DELETE PRODUCT
app.delete('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  const normalizedId = normalizeProductId(id);

  try {
    const result = await pool.query(
      'DELETE FROM products WHERE id = $1 RETURNING *',
      [normalizedId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error: 'Failed to delete product', details: err.message });
  }
});

// ADD SELLER PRODUCT
app.post('/api/seller-products', async (req, res) => {
  const {
    seller_id,
    title,
    description,
    price,
    stock_quantity,
    category,
    image_urls,
    mrp,
    sku,
    brand,
    age_group,
    material,
    featured,
    product_status,
  } = req.body;

  try {
    const product_id = await generateCustomId('products', 'id', 'PRDT');

    const result = await pool.query(
      `
      INSERT INTO products (
        id, seller_id, title, description, price, stock_quantity, category, image_urls,
        mrp, sku, brand, age_group, material, featured, product_status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
      `,
      [
        product_id,
        seller_id,
        title,
        description,
        price,
        stock_quantity || 0,
        category,
        image_urls || [],
        mrp,
        sku,
        brand,
        age_group,
        material,
        featured,
        product_status,
      ]
    );

    res.status(201).json({
      product: result.rows[0],
      message: 'Product added successfully',
    });
  } catch (err) {
    console.error('Error adding product:', err);
    res.status(500).json({ error: 'Failed to add product', details: err.message });
  }
});

// GET SELLER PRODUCTS
app.get('/api/seller-products', async (req, res) => {
  const { seller_id } = req.query;

  try {
    let result;

    if (seller_id) {
      result = await pool.query(
        'SELECT * FROM products WHERE seller_id = $1 ORDER BY created_at DESC',
        [seller_id]
      );
    } else {
      result = await pool.query(
        'SELECT * FROM products ORDER BY created_at DESC'
      );
    }

    res.json({ products: result.rows });
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Failed to fetch products', details: err.message, stack: err.stack });
  }
});

// UPDATE SELLER PRODUCT
app.put('/api/seller-products/:id', async (req, res) => {
  const { id } = req.params;
  const {
    title,
    description,
    price,
    stock_quantity,
    category,
    image_urls,
    mrp,
    sku,
    brand,
    age_group,
    material,
    featured,
    product_status,
  } = req.body;

  try {
    const result = await pool.query(
      `
      UPDATE products
      SET title = $1,
          description = $2,
          price = $3,
          stock_quantity = $4,
          category = $5,
          image_urls = $6,
          mrp = $7,
          sku = $8,
          brand = $9,
          age_group = $10,
          material = $11,
          featured = $12,
          product_status = $13,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $14
      RETURNING *
      `,
      [
        title,
        description,
        price,
        stock_quantity,
        category,
        image_urls || [],
        mrp,
        sku,
        brand,
        age_group,
        material,
        featured,
        product_status,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({
      product: result.rows[0],
      message: 'Product updated successfully',
    });
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ error: 'Failed to update product', details: err.message });
  }
});

// DELETE SELLER PRODUCT
app.delete('/api/seller-products/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM products WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error: 'Failed to delete product', details: err.message });
  }
});

// CREATE DISCOUNT
app.post('/api/discounts', async (req, res) => {
  const {
    seller_id,
    code,
    discount_type,
    discount_value,
    valid_from,
    valid_until,
    usage_limit,
  } = req.body;

  try {
    const result = await pool.query(
      `
      INSERT INTO discounts (
        seller_id,
        code,
        discount_type,
        discount_value,
        valid_from,
        valid_until,
        usage_limit
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
      `,
      [
        seller_id,
        code.toUpperCase(),
        discount_type,
        discount_value,
        valid_from,
        valid_until,
        usage_limit,
      ]
    );

    res.status(201).json({
      discount: result.rows[0],
      message: 'Discount created successfully',
    });
  } catch (err) {
    console.error('Error creating discount:', err);

    if (err.code === '23505') {
      return res.status(400).json({ error: 'Discount code already exists' });
    }

    res.status(500).json({ error: 'Failed to create discount', details: err.message });
  }
});

// GET SELLER DISCOUNTS
app.get('/api/discounts', async (req, res) => {
  const { seller_id } = req.query;

  try {
    const result = await pool.query(
      'SELECT * FROM discounts WHERE seller_id = $1 ORDER BY created_at DESC',
      [seller_id]
    );

    res.json({ discounts: result.rows });
  } catch (err) {
    console.error('Error fetching discounts:', err);
    res.status(500).json({ error: 'Failed to fetch discounts', details: err.message });
  }
});

// PLACE ORDER
app.post('/api/orders', async (req, res) => {
  const {
    user_id,
    customer_id,
    address_id,
    seller_id,
    subtotal,
    discount_amount,
    tax_amount,
    shipping_charge,
    total_amount,
    shipping_address,
    items,
    coupon_code,
    order_id: display_id,
    payment_method, // New field for payments table
  } = req.body;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const final_customer_id = normalizeCustomerId(user_id || customer_id);

    // Normalize item IDs in the items array
    const normalizedItems = (items || []).map(item => ({
      ...item,
      id: normalizeProductId(item.id || item.product_id),
      product_id: normalizeProductId(item.id || item.product_id)
    }));

    // 1. Insert into 'orders' master table (restructured from order_items)
    const orderRes = await client.query(
      `
      INSERT INTO orders (
        customer_id,
        address_id,
        seller_id,
        subtotal,
        discount_amount,
        tax_amount,
        shipping_charge,
        total_amount,
        shipping_address,
        order_status,
        payment_status,
        items,
        coupon_id,
        ordered_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'Confirmed', 'paid', $10, $11, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING id
      `,
      [
        final_customer_id,
        address_id || 1,
        seller_id || 'S001',
        subtotal || total_amount,
        discount_amount || 0,
        tax_amount || 0,
        shipping_charge || 0,
        total_amount,
        shipping_address || '',
        JSON.stringify(normalizedItems),
        null // coupon_id
      ]
    );

    const dbOrderId = orderRes.rows[0].id;

    // 2. Sync with 'order_table' (expanded legacy table)
    await client.query(
      `
      INSERT INTO order_table (
        order_id,
        customer_id,
        address_id,
        total_amount,
        discount_amount,
        final_amount,
        coupon_code,
        ordered_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
      `,
      [
        display_id || `ORD-${dbOrderId}`,
        final_customer_id,
        address_id || 1,
        subtotal || total_amount,
        discount_amount || 0,
        total_amount,
        coupon_code || ''
      ]
    );

    // 3. Insert into 'payments' table
    await client.query(
      `
      INSERT INTO payments (
        order_id,
        customer_id,
        payment_method,
        amount,
        payment_status,
        gateway_name,
        paid_at,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `,
      [
        dbOrderId,
        final_customer_id,
        payment_method || 'Card',
        total_amount,
        'paid', // Assuming success for now as per current flow
        'razorpay' // Default gateway
      ]
    );

    // 4. Update Inventory for each item
    if (normalizedItems && Array.isArray(normalizedItems)) {
      for (const item of normalizedItems) {
        await client.query(
          `
          UPDATE products
          SET stock_quantity = GREATEST(0, stock_quantity - $1),
              updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
          `,
          [item.qty || item.quantity || 1, item.id]
        );
      }
    }

    await client.query('COMMIT');

    res.status(201).json({
      orderId: display_id || dbOrderId,
      dbId: dbOrderId,
      message: 'Order placed successfully and persisted in database',
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error placing order:', err);
    res.status(500).json({ error: err.message || 'Failed to place order' });
  } finally {
    client.release();
  }
});

// GET SELLER ORDERS
app.get('/api/orders', async (req, res) => {
  const { seller_id } = req.query;

  try {
    const result = await pool.query(
      `
      SELECT
        o.id AS order_id,
        o.customer_id,
        o.total_amount,
        o.shipping_address,
        o.order_status,
        o.payment_status,
        o.ordered_at,
        o.items
      FROM orders o
      WHERE o.seller_id = $1 OR EXISTS (
          SELECT 1 FROM jsonb_array_elements(o.items) AS item 
          JOIN products p ON (item->>'id') = p.id
          WHERE p.seller_id = $1
      )
      ORDER BY o.ordered_at DESC
      `,
      [seller_id]
    );

    res.json({ orders: result.rows });
  } catch (err) {
    console.error('Error fetching seller orders:', err);
    res.status(500).json({ error: 'Failed to fetch orders', details: err.message });
  }
});

// UPDATE ORDER STATUS
app.put('/api/orders/:id/status', async (req, res) => {
  const { id } = req.params;
  const { order_status, status, payment_status } = req.body;

  try {
    const result = await pool.query(
      `
      UPDATE orders
      SET order_status = COALESCE($1, $2, order_status),
          payment_status = COALESCE($3, payment_status),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *
      `,
      [order_status, status, payment_status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({
      order: result.rows[0],
      message: 'Order updated successfully',
    });
  } catch (err) {
    console.error('Error updating order status:', err);
    res.status(500).json({ error: 'Failed to update order status', details: err.message });
  }
});

// SELLER DASHBOARD SUMMARY
app.get('/api/seller/dashboard', async (req, res) => {
  const { seller_id } = req.query;

  if (!seller_id) {
    return res.status(400).json({ error: 'seller_id is required' });
  }

  try {
    const productsRes = await pool.query(
      'SELECT COUNT(*) FROM products WHERE seller_id = $1',
      [seller_id]
    );
    const totalProducts = parseInt(productsRes.rows[0].count, 10);

    const lowStockRes = await pool.query(
      'SELECT COUNT(*) FROM products WHERE seller_id = $1 AND stock_quantity <= 5',
      [seller_id]
    );
    const lowStockCount = parseInt(lowStockRes.rows[0].count, 10);

    const statsRes = await pool.query(
      `
      SELECT
        COUNT(DISTINCT id) AS total_orders,
        COALESCE(SUM(total_amount), 0) AS total_sales
      FROM orders
      WHERE seller_id = $1
      `,
      [seller_id]
    );

    const totalOrders = parseInt(statsRes.rows[0].total_orders, 10);
    const totalSales = parseFloat(statsRes.rows[0].total_sales);

    res.json({
      summary: {
        totalProducts,
        lowStockCount,
        totalOrders,
        totalSales,
      },
    });
  } catch (err) {
    console.error('Error fetching dashboard summary:', err);
    res.status(500).json({ error: 'Failed to get dashboard summary', details: err.message });
  }
});

// GET CART
// GET CART
app.get('/api/cart/:userId', async (req, res) => {
  const { userId } = req.params;
  const normalizedUserId = normalizeCustomerId(userId);

  try {
    const result = await pool.query(
      `
      SELECT 
        ci.cart_item_id,
        ci.cart_id,
        ci.product_id,
        ci.variant_id,
        ci.quantity,
        ci.price,
        ci.created_at,
        ci.updated_at,
        p.name,
        p.image_url AS image,
        p.description,
        p.category
      FROM cart_items ci
      JOIN carts c ON ci.cart_id = c.cart_id
      LEFT JOIN products p ON ci.product_id = p.product_id
      WHERE c.customer_id = $1
        AND c.is_active = TRUE
      ORDER BY ci.created_at DESC
      `,
      [normalizedUserId]
    );

    res.json({ cart: result.rows });
  } catch (err) {
    console.error('Error fetching cart:', err);
    res.status(500).json({ error: 'Failed to fetch cart', details: err.message });
  }
});

// ADD TO CART
app.post('/api/cart', async (req, res) => {
  const { customer_id: raw_customer_id, product_id: raw_product_id, quantity, unit_price, name, image, description, category } = req.body;
  const customer_id = normalizeCustomerId(raw_customer_id);
  const product_id = normalizeProductId(raw_product_id);
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    if (!customer_id || !product_id) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'customer_id and product_id are required' });
    }

    // Get latest product price from DB if available
    const productRes = await client.query(
      'SELECT price FROM products WHERE id = $1',
      [product_id]
    );

    const currentPrice = productRes.rows[0]?.price ?? unit_price ?? 0;

    // Get or create active cart
    let cartRes = await client.query(
      `
      SELECT cart_id
      FROM carts
      WHERE customer_id = $1 AND is_active = TRUE
      LIMIT 1
      `,
      [customer_id]
    );

    let cart_id;

    if (cartRes.rows.length > 0) {
      cart_id = cartRes.rows[0].cart_id;
    } else {
      const newCartRes = await client.query(
        `
        INSERT INTO carts (customer_id, is_active, created_at, updated_at)
        VALUES ($1, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING cart_id
        `,
        [customer_id]
      );
      cart_id = newCartRes.rows[0].cart_id;
    }

    // Insert or update cart item
    const result = await client.query(
      `
      INSERT INTO cart_items (
        cart_id,
        product_id,
        variant_id,
        quantity,
        price,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT (cart_id, product_id, variant_id)
      DO UPDATE SET
        quantity = cart_items.quantity + EXCLUDED.quantity,
        price = EXCLUDED.price,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
      `,
      [cart_id, product_id, req.body.variant_id || null, quantity || 1, currentPrice]
    );

    await client.query(
      `
      UPDATE carts
      SET updated_at = CURRENT_TIMESTAMP
      WHERE cart_id = $1
      `,
      [cart_id]
    );

    await client.query('COMMIT');

    res.status(201).json({
      item: result.rows[0],
      message: 'Cart updated successfully',
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error adding to cart:', err);
    res.status(500).json({
      error: 'Failed to add to cart',
      details: err.message,
    });
  } finally {
    client.release();
  }
});

// UPDATE CART QTY
app.put('/api/cart/update-qty', async (req, res) => {
  const { customer_id: raw_customer_id, product_id: raw_product_id, quantity } = req.body;
  const customer_id = normalizeCustomerId(raw_customer_id);
  const product_id = normalizeProductId(raw_product_id);

  try {
    if (!customer_id || !product_id || quantity == null) {
      return res.status(400).json({ error: 'customer_id, product_id and quantity are required' });
    }

    const result = await pool.query(
      `
      UPDATE cart_items ci
      SET quantity = $1,
          updated_at = CURRENT_TIMESTAMP
      FROM carts c
      WHERE ci.cart_id = c.cart_id
        AND c.customer_id = $2
        AND ci.product_id = $3
        AND c.is_active = TRUE
      RETURNING ci.*
      `,
      [quantity, customer_id, product_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found in cart' });
    }

    res.json({
      item: result.rows[0],
      message: 'Quantity updated successfully',
    });
  } catch (err) {
    console.error('Error updating cart qty:', err);
    res.status(500).json({ error: 'Failed to update quantity', details: err.message });
  }
});

// REMOVE FROM CART
app.delete('/api/cart/:userId/:productId', async (req, res) => {
  const { userId, productId } = req.params;
  const normalizedUserId = normalizeCustomerId(userId);
  const normalizedProductId = normalizeProductId(productId);

  try {
    const result = await pool.query(
      `
      DELETE FROM cart_items
      WHERE cart_id IN (
        SELECT cart_id
        FROM carts
        WHERE customer_id = $1
          AND is_active = TRUE
      )
      AND product_id = $2
      RETURNING *
      `,
      [normalizedUserId, normalizedProductId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found in cart' });
    }

    res.json({ message: 'Item removed from cart' });
  } catch (err) {
    console.error('Error removing from cart:', err);
    res.status(500).json({ error: 'Failed to remove from cart', details: err.message });
  }
});
// GET WISHLIST
app.get('/api/wishlist/:userId', async (req, res) => {
  const { userId } = req.params;
  const normalizedUserId = normalizeCustomerId(userId);
  try {
    const result = await pool.query(
      'SELECT * FROM wishlist_page WHERE customer_id = $1 ORDER BY created_at DESC',
      [normalizedUserId]
    );
    res.json({ wishlist: result.rows });
  } catch (err) {
    console.error('Error fetching wishlist:', err);
    res.status(500).json({ error: 'Failed to fetch wishlist', details: err.message });
  }
});

// ADD TO WISHLIST
app.post('/api/wishlist', async (req, res) => {
  const { customer_id: raw_customer_id, product_id: raw_product_id, name, price, image, description, category } = req.body;
  const customer_id = normalizeCustomerId(raw_customer_id);
  const product_id = normalizeProductId(raw_product_id);
  try {
    const result = await pool.query(
      `
      INSERT INTO wishlist_page (customer_id, product_id, name, price, image, description, category)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (customer_id, product_id) DO NOTHING
      RETURNING *
      `,
      [customer_id, product_id, name, price, image, description, category]
    );

    res.status(201).json({ item: result.rows[0], message: 'Wishlist updated' });
  } catch (err) {
    console.error('Error adding to wishlist:', err);
    res.status(500).json({ error: 'Failed to add to wishlist', details: err.message });
  }
});

// REMOVE FROM WISHLIST
app.delete('/api/wishlist/:userId/:productId', async (req, res) => {
  const { userId, productId } = req.params;
  const normalizedUserId = normalizeCustomerId(userId);
  const normalizedProductId = normalizeProductId(productId);
  try {
    await pool.query(
      'DELETE FROM wishlist_page WHERE customer_id = $1 AND product_id = $2',
      [normalizedUserId, normalizedProductId]
    );
    res.json({ message: 'Item removed from wishlist' });
  } catch (err) {
    console.error('Error removing from wishlist:', err);
    res.status(500).json({ error: 'Failed to remove from wishlist', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});