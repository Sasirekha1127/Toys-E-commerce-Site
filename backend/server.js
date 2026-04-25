import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import pg from 'pg';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = 'your_jwt_secret_key';

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MULTER CONFIG FOR REVIEWS
const reviewStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/reviews/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const uploadReview = multer({ storage: reviewStorage });

// MULTER CONFIG FOR PRODUCTS
const productStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/products/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const uploadProduct = multer({ storage: productStorage });

// REQUEST LOGGER
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// HEALTH CHECK
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date(), message: 'Server version: 1.0.1 - Latest CRUD and Review Fixes' });
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

    // Ensure customer table has numeric id
    await client.query(`
      ALTER TABLE customer ADD COLUMN IF NOT EXISTS id SERIAL;
    `);
    // Backfill id if it's empty/0 (optional but good for consistency)
    await client.query(`
      UPDATE customer SET id = REGEXP_REPLACE(customer_id, '[^0-9]', '', 'g')::int 
      WHERE id IS NULL OR id = 0;
    `);

    console.log('[Schema] Step 2: Creating products table (UUID schema)...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        pid            SERIAL,
        id             VARCHAR(100), -- Custom string ID (e.g. PRDT001)
        product_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        category_id    UUID,
        seller_id      UUID,
        admin_id       UUID,
        name           VARCHAR(255),
        title          VARCHAR(255),
        description    TEXT,
        sku            VARCHAR(100),
        price          DECIMAL(10,2),
        mrp            DECIMAL(10,2),
        stock_quantity INT          DEFAULT 0,
        category       VARCHAR(100),
        weight         DECIMAL(10,2),
        length         DECIMAL(10,2),
        breadth        DECIMAL(10,2),
        height         DECIMAL(10,2),
        brand          VARCHAR(255),
        is_active      BOOLEAN      DEFAULT true,
        weight_unit    VARCHAR(10)  DEFAULT 'kg',
        deleted_at     TIMESTAMP    NULL,
        created_at     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
        updated_at     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await client.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS pid SERIAL;`);
    await client.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS id VARCHAR(100);`);
    await client.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS title VARCHAR(255);`);
    await client.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS category VARCHAR(100);`);
    await client.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS admin_id UUID;`);
    await client.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS weight_unit VARCHAR(10) DEFAULT 'kg';`);
    console.log('[Schema] Products table created or already exists.');

    console.log('[Schema] Step 3: Creating categories table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        admin_id           UUID,
        seller_id          UUID,
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
    await client.query(`ALTER TABLE categories ADD COLUMN IF NOT EXISTS seller_id UUID;`);
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
        order_item_id        INTEGER,
        customer_id          VARCHAR(255),
        order_id             INTEGER,
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
        admin_id     VARCHAR(255),
        seller_id    VARCHAR(255),
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
    await client.query(`ALTER TABLE audit_logs ALTER COLUMN admin_id TYPE VARCHAR(255);`);
    await client.query(`ALTER TABLE audit_logs ALTER COLUMN seller_id TYPE VARCHAR(255);`);
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
        customer_id    VARCHAR(50),
        address_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        full_name      VARCHAR(255),
        phone          VARCHAR(20),
        address_line_1 TEXT,
        address_line_2 TEXT,
        city           VARCHAR(100),
        state          VARCHAR(100),
        pincode        VARCHAR(20),
        address_type   VARCHAR(50) DEFAULT 'Home',
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
        user_ref_id    VARCHAR(255),
        token_hash     VARCHAR(64),
        device_info    VARCHAR(64),
        ip_address     VARCHAR(45),
        is_blacklisted BOOLEAN   DEFAULT false,
        expires_at     TIMESTAMP NOT NULL,
        created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await client.query(`ALTER TABLE auth_sessions ALTER COLUMN user_ref_id TYPE VARCHAR(255);`);
    console.log('[Schema] Auth sessions table created or already exists.');

    console.log('[Schema] Step 8: Creating orders table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        customer_id VARCHAR(50),
        address_id VARCHAR(50),
        coupon_id INTEGER,
        coupon_code VARCHAR(50),
        seller_id VARCHAR(50),
        subtotal NUMERIC(10,2),
        discount_amount NUMERIC(10,2),
        tax_amount NUMERIC(10,2),
        total_amount NUMERIC(10,2),
        shipping_charge NUMERIC(10,2),
        order_status VARCHAR(50),
        payment_status VARCHAR(50),
        items JSONB,
        shipping_address TEXT,
        payment_method VARCHAR(50),
        ordered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('[Schema] Step 9: Creating coupon_usage table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS coupon_usage (
        usage_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        coupon_id INTEGER,
        customer_id VARCHAR(50),
        order_id INTEGER,
        discount_amount NUMERIC(10,2),
        used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('[Schema] Step 9.5: Creating seller_commissions table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS seller_commissions (
        commission_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_item_id INTEGER,
        order_id INTEGER,
        seller_id VARCHAR(50),
        sale_amount NUMERIC(10,2),
        commission_rate NUMERIC(10,2) DEFAULT 10,
        commission_amount NUMERIC(10,2),
        seller_earnings NUMERIC(10,2),
        status VARCHAR(50) DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('[Schema] Step 10: Creating reviews table (Standard Schema)...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        order_item_id UUID,
        customer_id   VARCHAR(50),
        product_id    VARCHAR(50),
        review_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        rating        INT,
        title         VARCHAR(255),
        body          TEXT,
        images        TEXT[],
        video_url     TEXT,
        status        VARCHAR(20) DEFAULT 'Approved',
        helpful_count INT DEFAULT 0,
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
          -- PRODUCTS TABLE: Fix column types (id integer -> varchar)
          -- ================================================
          IF EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'products' 
              AND column_name = 'id' 
              AND data_type = 'integer'
          ) THEN
              ALTER TABLE products ALTER COLUMN id TYPE VARCHAR(100) USING id::text;
          END IF;

          -- ================================================
          -- CART CLEANUP: Remove corrupted normalized IDs
          -- ================================================
          DELETE FROM cart_items WHERE product_id LIKE 'PRDT00%' AND LENGTH(product_id) > 7;
          DELETE FROM carts WHERE customer_id LIKE 'CUS00%' AND LENGTH(customer_id) > 6;
          -- Also clear exact PRDT002, PRDT007 etc if they were likely mismatches from prefixed IDs
          DELETE FROM cart_items WHERE product_id IN ('PRDT001', 'PRDT002', 'PRDT003', 'PRDT007', 'PRDT010');
          
          -- EMERGENCY CLEANUP: Clear duplicated/corrupted session carts
          TRUNCATE cart_items CASCADE;
          TRUNCATE carts CASCADE;

          -- ================================================
          -- CUSTOMER TABLE: Add address1, address2, profile_pic (idempotent)
          -- ================================================
          IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'customer') THEN
              ALTER TABLE customer ADD COLUMN IF NOT EXISTS address1 TEXT;
              ALTER TABLE customer ADD COLUMN IF NOT EXISTS address2 TEXT;
              ALTER TABLE customer ADD COLUMN IF NOT EXISTS profile_pic TEXT;
          END IF;

          -- ================================================
          -- PROFILE_PAGE TABLE: Add missing columns (idempotent)
          -- ================================================
          IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profile_page') THEN
              ALTER TABLE profile_page ADD COLUMN IF NOT EXISTS address1 TEXT;
              ALTER TABLE profile_page ADD COLUMN IF NOT EXISTS address2 TEXT;
              ALTER TABLE profile_page ADD COLUMN IF NOT EXISTS birthdate DATE;
              ALTER TABLE profile_page ADD COLUMN IF NOT EXISTS gender VARCHAR(20);
              -- Add unique constraint on customer_id if it doesn't exist (needed for ON CONFLICT)
              IF NOT EXISTS (
                  SELECT 1 FROM information_schema.table_constraints 
                  WHERE table_name = 'profile_page' 
                  AND constraint_type = 'UNIQUE'
                  AND constraint_name = 'profile_page_customer_id_key'
              ) THEN
                  BEGIN
                      ALTER TABLE profile_page ADD CONSTRAINT profile_page_customer_id_key UNIQUE (customer_id);
                  EXCEPTION WHEN duplicate_table THEN NULL;
                  END;
              END IF;
          END IF;

          -- ================================================
          -- ADDRESSES TABLE: Migrate customer_id from UUID to VARCHAR if needed
          -- ================================================
          IF EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'addresses' 
              AND column_name = 'customer_id' 
              AND data_type = 'uuid'
          ) THEN
              ALTER TABLE addresses ALTER COLUMN customer_id TYPE VARCHAR(50) USING customer_id::text;
          END IF;

          -- ================================================
          -- REVIEWS TABLE: Add missing columns (idempotent)
          -- ================================================
          IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reviews') THEN
              ALTER TABLE reviews ADD COLUMN IF NOT EXISTS images TEXT[];
              ALTER TABLE reviews ADD COLUMN IF NOT EXISTS video_url TEXT;
              ALTER TABLE reviews ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'Approved';
              ALTER TABLE reviews ADD COLUMN IF NOT EXISTS helpful_count INT DEFAULT 0;
              IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'customer_id' AND data_type = 'uuid') THEN
                  ALTER TABLE reviews ALTER COLUMN customer_id TYPE VARCHAR(50) USING customer_id::text;
              END IF;
              IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'product_id' AND data_type = 'uuid') THEN
                  ALTER TABLE reviews ALTER COLUMN product_id TYPE VARCHAR(50) USING product_id::text;
              END IF;
          END IF;

          -- ================================================
          -- COUPON_USAGE & SELLER_COMMISSIONS: Fix column types
          -- ================================================
          IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'coupon_usage') THEN
              IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'coupon_usage' AND column_name = 'coupon_id' AND data_type = 'uuid') THEN
                  ALTER TABLE coupon_usage ALTER COLUMN coupon_id TYPE INTEGER USING NULL;
              END IF;
              IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'coupon_usage' AND column_name = 'order_id' AND data_type = 'uuid') THEN
                  ALTER TABLE coupon_usage ALTER COLUMN order_id TYPE INTEGER USING NULL;
              END IF;
              IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'coupon_usage' AND column_name = 'customer_id' AND data_type = 'uuid') THEN
                  ALTER TABLE coupon_usage ALTER COLUMN customer_id TYPE VARCHAR(50) USING customer_id::text;
              END IF;
              ALTER TABLE coupon_usage ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(10,2);
          END IF;

          IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'seller_commissions') THEN
              IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'seller_commissions' AND column_name = 'order_id' AND data_type = 'uuid') THEN
                  ALTER TABLE seller_commissions ALTER COLUMN order_id TYPE INTEGER USING NULL;
              END IF;
              IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'seller_commissions' AND column_name = 'order_item_id' AND data_type = 'uuid') THEN
                  ALTER TABLE seller_commissions ALTER COLUMN order_item_id TYPE INTEGER USING NULL;
              END IF;
              IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'seller_commissions' AND column_name = 'seller_id' AND data_type = 'uuid') THEN
                  ALTER TABLE seller_commissions ALTER COLUMN seller_id TYPE VARCHAR(50) USING NULL;
              END IF;
              ALTER TABLE seller_commissions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
          END IF;

          IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'seller_payouts') THEN
              IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'seller_payouts' AND column_name = 'id' AND data_type = 'integer') THEN
                  ALTER TABLE seller_payouts DROP COLUMN id;
              END IF;
              ALTER TABLE seller_payouts ADD COLUMN IF NOT EXISTS payout_id UUID PRIMARY KEY DEFAULT gen_random_uuid();
              ALTER TABLE seller_payouts ADD COLUMN IF NOT EXISTS seller_id VARCHAR(50);
              ALTER TABLE seller_payouts ADD COLUMN IF NOT EXISTS order_id INTEGER;
              ALTER TABLE seller_payouts ADD COLUMN IF NOT EXISTS commission_id UUID;
              ALTER TABLE seller_payouts ADD COLUMN IF NOT EXISTS sale_amount NUMERIC(10,2);
              ALTER TABLE seller_payouts ADD COLUMN IF NOT EXISTS commission_amount NUMERIC(10,2);
              ALTER TABLE seller_payouts ADD COLUMN IF NOT EXISTS payout_amount NUMERIC(10,2);
              ALTER TABLE seller_payouts ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Pending';
              ALTER TABLE seller_payouts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
          END IF;

          -- ================================================
          -- ORDERS TABLE: Add missing coupon columns
          -- ================================================
          IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders') THEN
              ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_id INTEGER;
              ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_code VARCHAR(50);
              ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(10,2);
          END IF;

          -- ================================================
          -- ORDER_ITEMS TABLE: Recreate if it was renamed or is empty
          -- ================================================
          -- ================================================
          -- BANK_ACCOUNT TABLE: Fix owner_id type (UUID -> VARCHAR)
          -- ================================================
          IF EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'bank_account' 
              AND column_name = 'owner_id' 
              AND data_type = 'uuid'
          ) THEN
              ALTER TABLE bank_account ALTER COLUMN owner_id TYPE VARCHAR(50) USING owner_id::text;
          END IF;

          -- Add unique constraint if missing
          IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bank_account') THEN
              IF NOT EXISTS (
                  SELECT 1 FROM information_schema.table_constraints 
                  WHERE table_name = 'bank_account' AND constraint_type = 'UNIQUE'
              ) THEN
                  ALTER TABLE bank_account ADD CONSTRAINT bank_account_owner_unique UNIQUE (owner_id, owner_type);
              END IF;
          END IF;

          CREATE TABLE IF NOT EXISTS order_items (
              id SERIAL PRIMARY KEY,
              order_id INTEGER,
              product_id VARCHAR(50),
              quantity INTEGER NOT NULL,
              price_at_time_of_purchase DECIMAL(10, 2) NOT NULL,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );

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
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS admin_id UUID; -- Added for ownership tracking
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
      ALTER TABLE wishlist_items ADD COLUMN IF NOT EXISTS variant_id VARCHAR(50); -- Added variant support
      ALTER TABLE wishlist_items ADD COLUMN IF NOT EXISTS added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

      -- 9.5 UPDATE wishlist_page (the other table being used)
      DO $$ 
      BEGIN
          IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'wishlist_page') THEN
              ALTER TABLE wishlist_page ADD COLUMN IF NOT EXISTS variant_id VARCHAR(50);
              -- If it doesn't have unique constraint on variant, we should add it
              IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name = 'wishlist_page' AND constraint_name = 'wishlist_page_customer_product_variant_key') THEN
                  -- Drop old constraint if exists
                  ALTER TABLE wishlist_page DROP CONSTRAINT IF EXISTS wishlist_page_customer_id_product_id_key;
                  ALTER TABLE wishlist_page ADD CONSTRAINT wishlist_page_customer_product_variant_key UNIQUE (customer_id, product_id, variant_id);
              END IF;
          END IF;
      END $$;

      -- 10. CREATE seller_payouts table
      CREATE TABLE IF NOT EXISTS seller_payouts (
        payout_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        seller_id VARCHAR(50),
        order_id INTEGER,
        commission_id UUID,
        sale_amount NUMERIC(10,2),
        commission_amount NUMERIC(10,2),
        payout_amount NUMERIC(10,2),
        status VARCHAR(50) DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      -- Ensure columns exist for seller_payouts (Robustness)
      DO $$ BEGIN
          ALTER TABLE seller_payouts ADD COLUMN IF NOT EXISTS seller_id VARCHAR(50);
          ALTER TABLE seller_payouts ADD COLUMN IF NOT EXISTS initiated_by VARCHAR(50);
          ALTER TABLE seller_payouts ADD COLUMN IF NOT EXISTS admin_id INTEGER;
          ALTER TABLE seller_payouts ADD COLUMN IF NOT EXISTS amount NUMERIC(10,2);
          ALTER TABLE seller_payouts ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);
          ALTER TABLE seller_payouts ADD COLUMN IF NOT EXISTS transaction_ref VARCHAR(100);
          ALTER TABLE seller_payouts ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Pending';
          ALTER TABLE seller_payouts ADD COLUMN IF NOT EXISTS notes TEXT;
          ALTER TABLE seller_payouts ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
          ALTER TABLE seller_payouts ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP;
          ALTER TABLE seller_payouts ADD COLUMN IF NOT EXISTS payout_period_status VARCHAR(20);
          ALTER TABLE seller_payouts ADD COLUMN IF NOT EXISTS payout_period_end TIMESTAMP;
      END $$;

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
        seller_id VARCHAR(50),
        title VARCHAR(255),
        description TEXT,
        code VARCHAR(50) UNIQUE,
        discount_type VARCHAR(20) DEFAULT 'percentage', -- 'percentage' or 'fixed'
        discount_value NUMERIC(10,2),
        discount_percent NUMERIC(5,2),
        max_discount NUMERIC(10,2),
        min_order_val NUMERIC(10,2),
        used_count INTEGER DEFAULT 0,
        usage_limit INTEGER DEFAULT -1, -- -1 for unlimited
        status VARCHAR(20) DEFAULT 'Active',
        valid_until TIMESTAMP,
        product_id VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      DO $$ 
      BEGIN
          ALTER TABLE coupons ADD COLUMN IF NOT EXISTS seller_id VARCHAR(50);
          ALTER TABLE coupons ADD COLUMN IF NOT EXISTS title VARCHAR(255);
          ALTER TABLE coupons ADD COLUMN IF NOT EXISTS description TEXT;
          ALTER TABLE coupons ADD COLUMN IF NOT EXISTS discount_type VARCHAR(20) DEFAULT 'percentage';
          ALTER TABLE coupons ADD COLUMN IF NOT EXISTS discount_value NUMERIC(10,2);
          ALTER TABLE coupons ADD COLUMN IF NOT EXISTS usage_limit INTEGER DEFAULT -1;
          ALTER TABLE coupons ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'Active';
          ALTER TABLE coupons ADD COLUMN IF NOT EXISTS product_id VARCHAR(50);
      END $$;
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
        product_id UUID, -- Linked to products.product_id (UUID)
        sku VARCHAR(255),
        variant_name VARCHAR(255),
        variant_value VARCHAR(255),
        color_hex VARCHAR(20), -- Added color_hex support
        price NUMERIC(10,2),
        stock_quantity INTEGER DEFAULT 0,
        weight NUMERIC(10,2),
        weight_unit VARCHAR(10) DEFAULT 'kg'
      );

      -- ENSURE ALL COLUMNS EXIST AND TYPES ARE CORRECT (Robustness)
      DO $$ 
      BEGIN
          ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS product_id UUID;
          -- If it existed as integer, we might need to cast it if possible, but for toy app we can just ensure it is UUID
          IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'product_variants' AND column_name = 'product_id' AND data_type = 'integer') THEN
              ALTER TABLE product_variants ALTER COLUMN product_id TYPE UUID USING NULL; -- Resetting due to mismatch
          END IF;
          ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS sku VARCHAR(255);
          ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS variant_name VARCHAR(255);
          ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS variant_value VARCHAR(255);
          ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS color_hex VARCHAR(20);
          ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS price NUMERIC(10,2);
          ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 0;
          ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS weight NUMERIC(10,2);
          ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS weight_unit VARCHAR(10) DEFAULT 'kg';
      END $$;

      -- ADD FOREIGN KEYS FOR product_variants (Force update for UUID architecture)
      DO $$ 
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products') THEN
          -- Drop potentially incorrect legacy constraint
          ALTER TABLE product_variants DROP CONSTRAINT IF EXISTS product_variants_product_id_fkey;
          
          -- Ensure product_id is UUID type (Mismatches prevent FK creation)
          IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'product_variants' AND column_name = 'product_id' AND data_type = 'character varying') THEN
              ALTER TABLE product_variants ALTER COLUMN product_id TYPE UUID USING (CASE WHEN product_id ~ '^[0-9a-fA-F-]{36}$' THEN product_id::uuid ELSE NULL END);
          END IF;

          ALTER TABLE product_variants ADD CONSTRAINT product_variants_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE;
        END IF;
      END $$;
 
      -- 15.5 CREATE product_images TABLE
      CREATE TABLE IF NOT EXISTS product_images (
        image_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id UUID,
        image_url TEXT,
        alt_text VARCHAR(255),
        is_primary BOOLEAN DEFAULT FALSE,
        sort_order INTEGER DEFAULT 0,
        image_type VARCHAR(50) DEFAULT 'gallery',
        variant_reference VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      DO $$ BEGIN
        -- Ensure products(product_id) is unique so it can be referenced
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products') THEN
          IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_product_id_unique') THEN
            ALTER TABLE products ADD CONSTRAINT products_product_id_unique UNIQUE (product_id);
          END IF;
        END IF;

        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products') THEN
          IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'product_images_product_id_fkey') THEN
            ALTER TABLE product_images ADD CONSTRAINT product_images_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE;
          END IF;
        END IF;
        
        -- Add mapping columns if table already existed
        ALTER TABLE product_images ADD COLUMN IF NOT EXISTS image_type VARCHAR(50) DEFAULT 'gallery';
        ALTER TABLE product_images ADD COLUMN IF NOT EXISTS variant_reference VARCHAR(255);

        -- HARMONIZED PRODUCT SEEDER (SOFT004, SOFT007, SOFT010) logic moved to JS sequential calls for better robustness
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

      -- 17. REFACTOR cart_items TABLE (Ensuring UUID architecture)
      DO $$ 
      BEGIN
          RAISE NOTICE 'Checking cart system schema...';
          -- If carts still uses integer ID, we need to restructure
          IF EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'carts' 
                AND column_name = 'cart_id' 
                AND data_type = 'integer'
                AND table_schema = 'public'
          ) THEN
              RAISE NOTICE 'Legacy integer cart system detected. Migrating to UUID...';
              DROP TABLE IF EXISTS cart_items CASCADE;
              DROP TABLE IF EXISTS carts CASCADE;
          END IF;
      END $$;

      CREATE TABLE IF NOT EXISTS carts (
        cart_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_id  VARCHAR(50),
        is_active    BOOLEAN DEFAULT TRUE,
        created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS cart_items (
          cart_item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          cart_id      UUID REFERENCES carts(cart_id) ON DELETE CASCADE,
          product_id   VARCHAR(50),
          variant_id   VARCHAR(50),
          quantity     INT DEFAULT 1,
          price        DECIMAL(10,2),
          created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE (cart_id, product_id, variant_id)
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
            -- Constraint might already exist from CREATE TABLE
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
          owner_id             VARCHAR(50) NOT NULL,
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
          verified_by_admin_id UUID,
          UNIQUE(owner_id, owner_type)
      );

      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_bank_account_updated_at') THEN
            CREATE TRIGGER update_bank_account_updated_at BEFORE UPDATE ON bank_account FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        END IF;
      END $$;

      -- 19. CREATE wishlist_page TABLE
      CREATE TABLE IF NOT EXISTS wishlist_page (
          wishlist_id SERIAL PRIMARY KEY,
          customer_id VARCHAR(50),
          product_id VARCHAR(50),
          name VARCHAR(255),
          price NUMERIC(10,2),
          image TEXT,
          description TEXT,
          category VARCHAR(100),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE (customer_id, product_id)
      );
    `;
    await client.query(migrationQuery);

    // Step 20: Seeding testing products
    console.log('[Schema] Step 20: Seeding testing products...');
    const targetUuids = [
      '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003',
      '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000010',
      '00000000-0000-0001-0000-000000000001', '00000000-0000-0001-0000-000000000002',
      '00000000-0000-0002-0000-000000000001', '00000000-0000-0002-0000-000000000002',
      '00000000-0000-0003-0000-000000000001', '00000000-0000-0003-0000-000000000002'
    ];
    const targetIds = [
      'SOFT001', 'SOFT002', 'SOFT003',
      'SOFT004', 'SOFT007', 'SOFT010',
      'EDU001', 'EDU002',
      'ELE001', 'ELE002',
      'WOD001', 'WOD002'
    ];

    for (let i = 0; i < targetUuids.length; i++) {
      const uid = targetUuids[i];
      const tid = targetIds[i];
      // Clean child tables
      await client.query('DELETE FROM product_images WHERE product_id::text = $1', [uid]);
      await client.query('DELETE FROM product_variants WHERE product_id::text = $1', [uid]);
      // Clean parent table
      await client.query('DELETE FROM products WHERE id = $1 OR product_id::text = $2', [tid, uid]);
    }

    // Parent Products
    // Parent Products - Universal seeding across all categories
    await client.query(`
      INSERT INTO products (id, title, description, price, stock_quantity, category, product_id)
      VALUES 
        ('SOFT001', 'Teddy Bear', 'A lovable classic brown teddy bear with an adorable smile.', 2499.00, 50, 'Soft Toys', '00000000-0000-0000-0000-000000000001'),
        ('SOFT002', 'Rabbit Plush', 'Cute rabbit plush with long floppy ears.', 1999.00, 50, 'Soft Toys', '00000000-0000-0000-0000-000000000002'),
        ('SOFT003', 'Dinosaur Toy', 'Colorful dinosaur plush for fun playtime.', 2799.00, 50, 'Soft Toys', '00000000-0000-0000-0000-000000000003'),
        ('SOFT004', 'Elephant Soft Toy', 'Adorable elephant plush with soft finish.', 2199.00, 50, 'Soft Toys', '00000000-0000-0000-0000-000000000004'),
        ('SOFT007', 'Panda Plush', 'Soft panda plush with a cute black and white look.', 2099.00, 50, 'Soft Toys', '00000000-0000-0000-0000-000000000007'),
        ('SOFT010', 'Penguin Plush', 'Cute penguin plush with a soft rounded body.', 1899.00, 50, 'Soft Toys', '00000000-0000-0000-0000-000000000010'),
        ('EDU001', 'Math Learning Blocks', 'Colorful math blocks for fun number learning.', 1500.00, 50, 'Educational Toys', '00000000-0000-0001-0000-000000000001'),
        ('EDU002', 'Alphabet Wall Chart', 'Sing along and learn the alphabet in no time.', 800.00, 100, 'Educational Toys', '00000000-0000-0001-0000-000000000002'),
        ('ELE001', 'RC Racing Car', 'High-speed remote control car with sleek design.', 4500.00, 20, 'Electronic Toys', '00000000-0000-0002-0000-000000000001'),
        ('ELE002', 'Mini Drone', 'Compact drone for beginners with built-in camera.', 5500.00, 15, 'Electronic Toys', '00000000-0000-0002-0000-000000000002'),
        ('WOD001', 'Wooden Alphabet Blocks', 'Classic wooden blocks for early learning.', 1200.00, 40, 'Wooden Toys', '00000000-0000-0003-0000-000000000001'),
        ('WOD002', 'Wooden Puzzle Box', 'Solve the shapes to open the magic box.', 950.00, 60, 'Wooden Toys', '00000000-0000-0003-0000-000000000002')
      ON CONFLICT (product_id) DO UPDATE SET 
        id = EXCLUDED.id, 
        title = EXCLUDED.title, 
        price = EXCLUDED.price,
        image_urls = EXCLUDED.image_urls
    `);

    // Seed image_urls directly into products table for seeded products
    const seedImageUpdates = [
      { id: 'SOFT001', urls: ['/uploads/products/blue_teddy.png', '/uploads/products/red_teddy.png'] },
      { id: 'SOFT002', urls: ['/images/rabbit_plush.png'] },
      { id: 'SOFT003', urls: ['https://www.hamleys.in/images/hamleys/img/t_image/1200x1200/m_product/images/600x800/DINO4.jpg'] },
      { id: 'SOFT004', urls: ['/uploads/products/blue_elephant.png', '/uploads/products/red_elephant.png'] },
      { id: 'SOFT007', urls: ['https://rukminim2.flixcart.com/image/850/1000/kp3tde80/stuffed-toy/b/w/s/panda-plush-toy-30cm-aukfa-original-imag3bnkq3fmh4yz.jpeg'] },
      { id: 'SOFT010', urls: ['/images/soft-toy-placeholder.png'] },
      { id: 'EDU001', urls: ['/images/edu-toy-placeholder.png'] },
      { id: 'EDU002', urls: ['/images/alphabet_wall_chart.png'] },
      { id: 'ELE001', urls: ['/images/rc_car.png'] },
      { id: 'ELE002', urls: ['/images/elec-toy-placeholder.png'] },
      { id: 'WOD001', urls: ['/images/elec-toy-placeholder.png'] },
      { id: 'WOD002', urls: ['/images/elec-toy-placeholder.png'] },
    ];

    for (const { id, urls } of seedImageUpdates) {
      await client.query(
        'UPDATE products SET image_urls = $1 WHERE id = $2',
        [urls, id]
      );
    }

    //  Ensure product_variants has a unique constraint on SKU for robust seeding
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'product_variants_sku_key'
        ) THEN
          ALTER TABLE product_variants ADD CONSTRAINT product_variants_sku_key UNIQUE (sku);
        END IF;
      END $$;
    `);

    // Ensure ALL products have at least two color variants (Blue and Red)
    // We use CONCAT(id, '-BLUE') and CONCAT(id, '-RED') for ALL products
    await client.query(`
      INSERT INTO product_variants (product_id, variant_name, variant_value, color_hex, price, stock_quantity, sku)
      SELECT product_id, 'Color', 'Default Blue', '#3B82F6', COALESCE(price, 0), CASE WHEN stock_quantity = 0 THEN 25 ELSE stock_quantity END, CONCAT(id, '-BLUE')
      FROM products
      ON CONFLICT (sku) DO UPDATE SET variant_name = 'Color', color_hex = EXCLUDED.color_hex, stock_quantity = EXCLUDED.stock_quantity;
    `);

    await client.query(`
      INSERT INTO product_variants (product_id, variant_name, variant_value, color_hex, price, stock_quantity, sku)
      SELECT product_id, 'Color', 'Classic Red', '#EF4444', COALESCE(price, 0), CASE WHEN stock_quantity = 0 THEN 15 ELSE stock_quantity END, CONCAT(id, '-RED')
      FROM products
      ON CONFLICT (sku) DO UPDATE SET variant_name = 'Color', color_hex = EXCLUDED.color_hex, stock_quantity = EXCLUDED.stock_quantity;
    `);

    // CLEANUP: Remove any images with incorrect variant_references (like -BROWN, -WHITE, -MIX)
    // and replace them with correct ones using -BLUE and -RED
    await client.query(`
      DELETE FROM product_images WHERE variant_reference IS NOT NULL 
      AND variant_reference NOT LIKE '%-BLUE' 
      AND variant_reference NOT LIKE '%-RED';
    `);

    // Ensure images are mapped to these variants for ALL products
    // We map the first image in gallery to -BLUE and second to -RED
    await client.query(`
      INSERT INTO product_images (product_id, image_url, is_primary, variant_reference)
      SELECT p.product_id, p.image_urls[1], false, CONCAT(p.id, '-BLUE')
      FROM products p
      WHERE p.image_urls IS NOT NULL AND array_length(p.image_urls, 1) >= 1
      ON CONFLICT DO NOTHING;
    `);

    await client.query(`
      INSERT INTO product_images (product_id, image_url, is_primary, variant_reference)
      SELECT p.product_id, COALESCE(p.image_urls[2], p.image_urls[1]), false, CONCAT(p.id, '-RED')
      FROM products p
      WHERE p.image_urls IS NOT NULL AND array_length(p.image_urls, 1) >= 1
      ON CONFLICT DO NOTHING;
    `);

    // Specific overrides for key products with high-quality images
    await client.query(`
      INSERT INTO product_images (product_id, image_url, is_primary, variant_reference)
      VALUES 
        ('00000000-0000-0000-0000-000000000001', '/uploads/products/blue_teddy.png', false, 'SOFT001-BLUE'),
        ('00000000-0000-0000-0000-000000000001', '/uploads/products/red_teddy.png', false, 'SOFT001-RED'),
        ('00000000-0000-0000-0000-000000000004', '/uploads/products/blue_elephant.png', false, 'SOFT004-BLUE'),
        ('00000000-0000-0000-0000-000000000004', '/uploads/products/red_elephant.png', false, 'SOFT004-RED')
      ON CONFLICT DO NOTHING;
    `);

    console.log('Schema initialization and seeding completed.');
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
  // Only normalize if it's a numeric string (e.g. "1")
  if (/^\d+$/.test(s)) {
    return `CUS${s.padStart(3, '0')}`;
  }
  return s;
};

// HELPER: NORMALIZE PRODUCT ID (e.g. 2 -> PRDT002)
const normalizeProductId = (id) => {
  if (!id) return id;
  return String(id).trim();
};

// HELPER: AUDIT LOGGING
const logAudit = async (client, { admin_id, seller_id, table_name, record_id, action, old_values, new_values, req }) => {
  console.log(`[Audit Debug] logAudit called for action: ${action}, table: ${table_name}, record: ${record_id}`);
  try {
    const ip_address = req?.ip || req?.headers?.['x-forwarded-for'] || req?.connection?.remoteAddress || 'unknown';
    const user_agent = req?.headers?.['user-agent'] || 'unknown';
    
    console.log(`[Audit Debug] IP: ${ip_address}, User Agent: ${user_agent}`);
    
    await client.query(
      `INSERT INTO audit_logs (admin_id, seller_id, table_name, record_id, action, old_values, new_values, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        admin_id || null, 
        seller_id || null, 
        table_name, 
        record_id, 
        action, 
        old_values ? JSON.stringify(old_values) : null, 
        new_values ? JSON.stringify(new_values) : null, 
        ip_address, 
        user_agent
      ]
    );
    console.log(`[Audit] Logged ${action} on ${table_name}:${record_id}`);
  } catch (err) {
    console.error(`[Audit Error] Logging failed for ${action} on ${table_name}:${record_id}:`, err);
  }
};

// HELPER: CREATE AUTH SESSION
const createAuthSession = async (pool, { user_type, user_ref_id, req }) => {
  try {
    const ip_address = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
    const user_agent = req.headers['user-agent'] || 'unknown';
    // Expire in 24 hours
    const expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await pool.query(
      `INSERT INTO auth_sessions (user_type, user_ref_id, ip_address, device_info, expires_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [user_type, user_ref_id, ip_address, user_agent.substring(0, 64), expires_at]
    );
    console.log(`[Auth] Session created for ${user_type}:${user_ref_id}`);
  } catch (err) {
    console.error('[Auth] Failed to create session:', err);
  }
};

// INTERNAL ENRICHMENT HELPERS (PRIVATE)
const enrichProductData = async (product) => {
  if (!product) return null;
  console.log(`[DEBUG] Enriching product: ${product.id} (UUID: ${product.product_id})`);
  try {
    const uuid = product.product_id;

    // Fetch variants and filter for 'Color' only as per requirements
    const variantsRes = await pool.query(
      "SELECT *, variant_id as id FROM product_variants WHERE product_id = $1 AND LOWER(variant_name) LIKE '%color%' ORDER BY variant_id ASC",
      [uuid]
    );

    const imagesRes = await pool.query(
      'SELECT * FROM product_images WHERE product_id = $1 ORDER BY sort_order ASC',
      [uuid]
    );

    const images = imagesRes.rows;
    const variants = variantsRes.rows;
    console.log(`[DEBUG] Found ${variants.length} color variants for ${product.id}`);

    const PLACEHOLDER_PATTERNS = ['via.placeholder.com', 'placehold.co', 'text=No+Image', 'text=Toy+Image', 'text=No_Image'];
    const isPlaceholder = (url) => !url || PLACEHOLDER_PATTERNS.some(p => url.includes(p));

    const getCategoryPlaceholder = (category) => {
      const cat = (category || '').toLowerCase();
      if (cat.includes('soft')) return '/images/soft-toy-placeholder.png';
      if (cat.includes('edu')) return '/images/edu-toy-placeholder.png';
      if (cat.includes('elec')) return '/images/elec-toy-placeholder.png';
      if (cat.includes('wood')) return '/images/elec-toy-placeholder.png'; // Fallback to elec if wood not found
      return '/images/toy-placeholder.png';
    };

    // Inject variant-specific data
    const enrichedVariants = variants.map(v => {
      const matchingImages = images.filter(img => img.variant_reference === v.sku);
      const galleryImages = matchingImages
        .map(img => img.image_url)
        .filter(url => url && !isPlaceholder(url));

      const vImageUrl = galleryImages.length > 0 ? galleryImages[0] : getCategoryPlaceholder(product.category);

      return {
        ...v,
        color_name: v.variant_value, // Alias for requirement
        color_hex: v.color_hex || '#E5E7EB', // Fallback
        image_url: vImageUrl,
        gallery_images: galleryImages.length > 0 ? galleryImages : [vImageUrl],
      };
    });

    // Build deduplicated, clean image URL list
    const buildImageUrls = () => {
      // Start from stored image_urls column (deduplicated)
      let urls = [];
      if (Array.isArray(product.image_urls)) {
        const seen = new Set();
        for (const url of product.image_urls) {
          if (url && url.trim() && !isPlaceholder(url) && !seen.has(url)) {
            seen.add(url);
            urls.push(url);
          }
        }
      }

      // Fall back to product_images table (deduplicated)
      if (urls.length === 0) {
        const seen = new Set();
        for (const img of images) {
          const url = img?.image_url;
          if (url && !isPlaceholder(url) && !seen.has(url)) {
            seen.add(url);
            urls.push(url);
          }
        }
      }

      // Final fallback - UNIQUE per category
      if (urls.length === 0) {
        urls.push(getCategoryPlaceholder(product.category));
      }

      return urls;
    };

    const cleanImageUrls = buildImageUrls();
    const primaryImage = cleanImageUrls[0];

    return {
      ...product,
      id: product.id || product.product_id,
      image: primaryImage,          // ← explicit top-level image field
      variants: enrichedVariants,
      additional_images: images,
      image_urls: cleanImageUrls,
    };
  } catch (err) {
    console.error(`Error enriching product ${product.product_id || product.id}:`, err);
    return product;
  }
};


const enrichProductsList = async (products) => {
  return Promise.all(products.map(p => enrichProductData(p)));
};


// USER REGISTER
app.post('/api/auth/user/register', async (req, res) => {
  const { name, email, password, phone, address1, address2, city, state, pincode, country, dob, gender, profilePic } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const existing = await pool.query(
      'SELECT customer_id FROM customer WHERE email = $1',
      [email]
    );

    if (existing.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const customer_id = await generateCustomId('customer', 'customer_id', 'CUS');

    // 1. Save to customer table
    const userResult = await client.query(
      `INSERT INTO customer (
        customer_id, name, email, password, phone, address1, address2, city, state, pincode, country, profile_pic
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
      RETURNING customer_id, name, email, profile_pic, phone, address1, address2, city, state, pincode, country`,
      [customer_id, name, email, hashedPassword, phone, address1, address2, city, state, pincode, country || 'India', profilePic]
    );

    const newUser = userResult.rows[0];

    // 2. Save to profile_page table (for birthdate and gender)
    await client.query(
      `INSERT INTO profile_page (customer_id, birthdate, gender)
       VALUES ($1, $2, $3)
       ON CONFLICT (customer_id) DO UPDATE SET birthdate = EXCLUDED.birthdate, gender = EXCLUDED.gender`,
      [customer_id, dob, gender]
    );

    // 3. Save as initial entry in addresses table
    const addressRes = await client.query(
      `INSERT INTO addresses (
        customer_id, full_name, phone, address_line_1, address_line_2, city, state, pincode, address_type, is_default
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Home', true)
      RETURNING address_id`,
      [customer_id, name, phone, address1, address2, city, state, pincode]
    );

    await client.query('COMMIT');

    res.status(201).json({
      token: jwt.sign({ id: customer_id, role: 'user' }, JWT_SECRET, { expiresIn: '1d' }),
      user: {
        id: newUser.customer_id,          // consistent with login response
        customer_id: newUser.customer_id, // explicit alias
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        address1: newUser.address1,
        address2: newUser.address2,
        city: newUser.city,
        state: newUser.state,
        pincode: newUser.pincode,
        country: newUser.country,
        profile_pic: newUser.profile_pic,
        profileImage: newUser.profile_pic,  // alias for header display
        dob,
        gender,
        role: 'user',
        default_address_id: addressRes.rows[0].address_id
      },
      message: 'User registered successfully',
    });
  } catch (err) {
    if (client) await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'User registration failed', details: err.message });
  } finally {
    if (client) client.release();
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

        // CREATE AUTH SESSION
        await createAuthSession(pool, { user_type: 'admin', user_ref_id: admin.id, req });

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

        // CREATE AUTH SESSION
        await createAuthSession(pool, { user_type: 'seller', user_ref_id: seller.seller_id, req });

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

        // CREATE AUTH SESSION
        await createAuthSession(pool, { user_type: 'customer', user_ref_id: normalizedId, req });

        return res.json({
          token,
          user: {
            id: normalizedId,
            customer_id: normalizedId, // Explicit alias so all code paths use customer_id
            name: user.name,
            email: user.email,
            phone: user.phone,
            address1: user.address1,
            address2: user.address2,
            city: user.city,
            state: user.state,
            pincode: user.pincode,
            country: user.country,
            profile_pic: user.profile_pic,
            profileImage: user.profile_pic, // Alias for Header/profile pic display
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

// SELLER ONBOARDING API
app.post(['/api/seller/onboarding', '/api/auth/seller/onboarding'], async (req, res) => {
  const {
    seller_id,
    fullName, mobile,
    businessName, businessAddress, city, state, pincode, country,
    panNumber, aadhaarNumber,
    accountHolderName, bankName, accountNumber, ifscCode,
    storeName, storeDescription, storeAddress, returnAddress, storePincode
  } = req.body;

  if (!seller_id) {
    return res.status(400).json({ error: 'Seller ID is required' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Update sellers table
    await client.query(
      `UPDATE sellers 
       SET full_name = $1, 
           phone = $2, 
           store_name = $3, 
           store_description = $4, 
           onboarding_completed = true,
           updated_at = CURRENT_TIMESTAMP
       WHERE seller_id = $5`,
      [fullName, mobile, storeName || businessName, storeDescription, seller_id]
    );

    // 2. Insert or update bank details
    await client.query(
      `INSERT INTO bank_account (
        owner_id, owner_type, account_holder_name, bank_name, account_number, ifsc_code, is_primary, updated_at
      ) VALUES ($1, 'seller_id', $2, $3, $4, $5, true, CURRENT_TIMESTAMP)
      ON CONFLICT (owner_id, owner_type) DO UPDATE SET 
        account_holder_name = EXCLUDED.account_holder_name,
        bank_name = EXCLUDED.bank_name,
        account_number = EXCLUDED.account_number,
        ifsc_code = EXCLUDED.ifsc_code,
        updated_at = CURRENT_TIMESTAMP`,
      [seller_id, accountHolderName, bankName, accountNumber, ifscCode]
    );

    // 3. Update seller_profile if it exists (optional but good for consistency)
    await client.query(
      `INSERT INTO seller_profile (seller_id, phone, location, bio)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (seller_id) DO UPDATE SET phone = EXCLUDED.phone, location = EXCLUDED.location, bio = EXCLUDED.bio`,
      [seller_id, mobile, `${city}, ${state}`, storeDescription]
    );

    await client.query('COMMIT');
    res.json({ success: true, message: 'Onboarding completed and bank details saved' });
  } catch (err) {
    if (client) await client.query('ROLLBACK');
    console.error('Onboarding error:', err);
    res.status(500).json({ error: 'Onboarding failed', details: err.message });
  } finally {
    if (client) client.release();
  }
});



// Migration: ensure categories has UI-specific columns and sync with products
const syncCategories = async () => {
  try {
    // 1. Ensure columns exist
    await pool.query(`
      ALTER TABLE categories ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT '🧸';
      ALTER TABLE categories ADD COLUMN IF NOT EXISTS description TEXT;
      ALTER TABLE categories ADD COLUMN IF NOT EXISTS age_range TEXT;
    `);

    // 2. Get unique categories from products
    const prodCatsRes = await pool.query("SELECT DISTINCT category FROM products WHERE category IS NOT NULL AND category != ''");
    const productCategories = prodCatsRes.rows.map(r => r.category.trim());

    // 3. Insert missing categories
    for (const catName of productCategories) {
      const slug = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      await pool.query(`
        INSERT INTO categories (category_id, name, slug, is_active)
        SELECT gen_random_uuid(), $1::text, $2::text, true
        WHERE NOT EXISTS (SELECT 1 FROM categories WHERE LOWER(name) = LOWER($1::text))
      `, [catName, slug]);
    }

    console.log('[Sync] Categories synchronized with product data.');
  } catch (err) {
    console.error('Error syncing categories:', err);
  }
};

const initCategoriesSchema = async () => {
  await syncCategories();
};
initCategoriesSchema();

app.get('/api/categories', async (req, res) => {
  const { admin_id, seller_id } = req.query;
  try {
    // Return categories with product counts
    const query = `
      SELECT c.*, 
             (SELECT COUNT(*) FROM products p 
              WHERE p.category = c.name 
              ${admin_id ? 'AND (p.admin_id IS NOT NULL OR p.seller_id IS NOT NULL)' : ''}
             ) as product_count
      FROM categories c
      ${admin_id ? '' : (seller_id ? 'WHERE c.admin_id IS NOT NULL OR c.seller_id = $1' : 'WHERE c.is_active = true')}
      ORDER BY c.name ASC
    `;
    const params = admin_id ? [] : (seller_id ? [seller_id] : []);
    const result = await pool.query(query, params);
    res.json({ categories: result.rows });
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

app.post('/api/categories', async (req, res) => {
  const { admin_id, seller_id, name, slug, image_url, parent_category_id, icon, description, age_range, is_active } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO categories (category_id, admin_id, seller_id, name, slug, image_url, parent_category_id, icon, description, age_range, is_active)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [admin_id || null, seller_id || null, name, slug, image_url, parent_category_id, icon || '🧸', description, age_range, is_active !== undefined ? is_active : true]
    );
    res.status(201).json({ category: result.rows[0] });
  } catch (err) {
    console.error('Error creating category:', err);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

app.put('/api/categories/:id', async (req, res) => {
  const { id } = req.params;
  const { name, slug, image_url, parent_category_id, icon, description, age_range, is_active } = req.body;
  try {
    const fields = { name, slug, image_url, parent_category_id, icon, description, age_range, is_active };
    const updates = [];
    const values = [];
    let idx = 1;

    Object.keys(fields).forEach(key => {
      if (fields[key] !== undefined) {
        updates.push(`${key} = $${idx}`);
        values.push(fields[key]);
        idx++;
      }
    });

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);
    const query = `UPDATE categories SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE category_id = $${idx} RETURNING *`;

    const result = await pool.query(query, values);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Category not found' });
    res.json({ category: result.rows[0] });
  } catch (err) {
    console.error('Error updating category:', err);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

app.delete('/api/categories/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM categories WHERE category_id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Category not found' });
    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    console.error('Error deleting category:', err);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});


// REVIEWS ENDPOINTS
// GET REVIEWS
app.get('/api/reviews', async (req, res) => {
  const { admin_id, seller_id } = req.query;
  try {
    let query;
    let params = [];

    if (admin_id) {
      // Admin sees ALL reviews with customer and product details
      query = `
        SELECT r.*, users.name as customer_name, p.title as product_title, p.product_id as product_uuid,
               (SELECT image_url FROM product_images WHERE product_id = p.product_id ORDER BY is_primary DESC, sort_order ASC LIMIT 1) as product_image,
               p.image_urls as product_image_urls,
               'C' || LPAD(users.id::text, 3, '0') AS customer_code
        FROM reviews r
        JOIN customer users ON r.customer_id = users.customer_id
        LEFT JOIN products p ON r.product_id::text = p.product_id::text OR r.product_id = p.id
        ORDER BY r.created_at DESC
      `;
    } else if (seller_id) {
      // Seller sees reviews for THEIR products only
      query = `
        SELECT r.*, 
               r.body as comment,
               users.name as customer_name, 
               users.email as customer_email,
               p.title as product_name, 
               p.title as product_title, 
               p.product_id as product_uuid,
               (SELECT image_url FROM product_images WHERE product_id = p.product_id ORDER BY is_primary DESC, sort_order ASC LIMIT 1) as product_image,
               p.image_urls as product_image_urls,
               'C' || LPAD(users.id::text, 3, '0') AS customer_code
        FROM reviews r
        JOIN products p ON r.product_id::text = p.product_id::text OR r.product_id = p.id OR r.product_id = p.pid::text
        JOIN customer users ON r.customer_id = users.customer_id
        WHERE p.seller_id::text = $1
        ORDER BY r.created_at DESC
      `;
      params = [seller_id];
    } else {
      query = `
        SELECT r.*, 
               r.body as comment,
               users.name as customer_name, 
               users.email as customer_email,
               p.title as product_name, 
               p.title as product_title, 
               p.product_id as product_uuid,
               (SELECT image_url FROM product_images WHERE product_id = p.product_id ORDER BY is_primary DESC, sort_order ASC LIMIT 1) as product_image,
               'C' || LPAD(users.id::text, 3, '0') AS customer_code
        FROM reviews r
        JOIN customer users ON r.customer_id = users.customer_id
        LEFT JOIN products p ON r.product_id::text = p.product_id::text OR r.product_id = p.id OR r.product_id = p.pid::text
        WHERE r.status = 'Approved' 
        ORDER BY r.created_at DESC
      `;
    }

    const result = await pool.query(query, params);
    if (seller_id) {
      console.log(`[DEBUG] Fetched ${result.rows.length} reviews for seller ${seller_id}`);
    }
    res.json({ reviews: result.rows });
  } catch (err) {
    console.error('[API] Error fetching reviews:', err);
    res.status(500).json({ error: 'Failed to fetch reviews', details: err.message });
  }
});


app.get('/api/reviews/:productId', async (req, res) => {
  const { productId } = req.params;
  try {
    // Resolve productId if it's a custom ID
    const isUUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(productId);
    const isNumeric = /^\d+$/.test(productId);
    let uuid = productId;

    if (!isUUID) {
      let query = 'SELECT product_id FROM products WHERE id = $1 OR sku = $1';
      let params = [productId];
      if (isNumeric) {
        query = 'SELECT product_id FROM products WHERE pid = $1';
        params = [parseInt(productId, 10)];
      }
      const productRes = await pool.query(query, params);
      if (productRes.rows.length > 0) {
        uuid = productRes.rows[0].product_id;
      }
    }

    const result = await pool.query(
      "SELECT * FROM reviews WHERE (product_id::text = $1) AND status = 'Approved' ORDER BY created_at DESC",
      [uuid]
    );
    res.json({ reviews: result.rows });
  } catch (err) {
    console.error('[API] Error fetching reviews for product:', err);
    res.status(500).json({ error: 'Failed to fetch reviews', details: err.message });
  }
});

app.post('/api/reviews', uploadReview.fields([{ name: 'images', maxCount: 5 }, { name: 'video', maxCount: 1 }]), async (req, res) => {
  const { productId, customerId, rating, title, body } = req.body;
  const images = req.files['images'] ? req.files['images'].map(f => `/uploads/reviews/${f.filename}`) : [];
  const video_url = req.files['video'] ? `/uploads/reviews/${req.files['video'][0].filename}` : null;

  try {
    // Resolve productId to UUID if needed
    const isUUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(productId);
    const isNumeric = /^\d+$/.test(productId);
    let uuid = productId;

    if (!isUUID) {
      let query = 'SELECT product_id FROM products WHERE id = $1 OR sku = $1';
      let params = [productId];
      if (isNumeric) {
        query = 'SELECT product_id FROM products WHERE pid = $1';
        params = [parseInt(productId, 10)];
      }
      const productRes = await pool.query(query, params);
      if (productRes.rows.length > 0) {
        uuid = productRes.rows[0].product_id;
      } else {
        return res.status(404).json({ error: 'Product not found' });
      }
    }

    const normalizedCustomerId = normalizeCustomerId(customerId);

    console.log('[DEBUG] Review submission payload:', { productId, customerId, rating, title, body });
    const result = await pool.query(
      `INSERT INTO reviews (review_id, product_id, customer_id, rating, title, body, images, video_url, created_at, helpful_count, status)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, 0, 'Approved')
       RETURNING *`,
      [uuid, normalizedCustomerId, rating, title, body, images, video_url]
    );
    console.log('[DEBUG] Saved review response:', result.rows[0]);
    res.status(201).json({ review: result.rows[0] });
  } catch (err) {
    console.error('[API] Error submitting review:', err);
    res.status(500).json({ error: 'Failed to submit review', details: err.message });
  }
});

// UPDATE REVIEW STATUS
app.put('/api/reviews/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const result = await pool.query(
      'UPDATE reviews SET status = $1 WHERE review_id = $2 RETURNING *',
      [status, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Review not found' });
    res.json({ review: result.rows[0], message: `Review ${status.toLowerCase()} successfully` });
  } catch (err) {
    console.error('[API] Error updating review status:', err);
    res.status(500).json({ error: 'Failed to update review status', details: err.message });
  }
});

// DELETE REVIEW
// DELETE REVIEW (Generic and Admin-specific aliases)
const deleteReviewHandler = async (req, res) => {
  const { id } = req.params;

  // Basic validation for UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    console.warn(`[API] Attempted deletion with invalid UUID format: ${id}`);
  }

  try {
    console.log(`[API] Deleting review: ${id}`);
    const result = await pool.query('DELETE FROM reviews WHERE review_id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      console.warn(`[API] Review not found for deletion: ${id}`);
      return res.status(404).json({ error: 'Review not found' });
    }

    console.log(`[API] Successfully deleted review: ${id}`);
    res.json({ message: 'Review deleted successfully', deleted: result.rows[0] });
  } catch (err) {
    console.error('[API] Error deleting review:', err);
    res.status(500).json({ error: 'Failed to delete review', details: err.message });
  }
};

app.delete('/api/reviews/:id', deleteReviewHandler);
app.delete('/api/admin/reviews/:id', deleteReviewHandler);



// GET ALL CUSTOMERS (ADMIN)
app.get('/api/admin/customers', async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT 
        u.customer_id,
        u.name,
        u.email,
        u.phone,
        u.address1,
        u.address2,
        u.city,
        u.state,
        u.country,
        u.profile_pic,
        u.created_at
      FROM customer u
      ORDER BY u.created_at DESC
      `
    );
    res.json({ customers: result.rows });
  } catch (err) {
    console.error('Error fetching customers:', err);
    res.status(500).json({ error: 'Failed to fetch customers', details: err.message });
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
        u.phone,
        u.address1,
        u.address2,
        u.city,
        u.state,
        u.pincode,
        u.country,
        u.profile_pic,
        p.bio,
        p.birthdate,
        p.gender
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
  const { name, email, phone, address1, address2, city, state, pincode, country, bio, birthdate, gender, profile_pic } = req.body;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const userUpdate = await client.query(
      `
      UPDATE customer
      SET name = $1, email = $2, phone = $3, address1 = $4, address2 = $5, city = $6, state = $7, pincode = $8, country = $9, profile_pic = $10
      WHERE customer_id = $11
      RETURNING customer_id, name, email, phone, address1, address2, city, state, pincode, country, profile_pic
      `,
      [name, email, phone, address1, address2, city, state, pincode, country, profile_pic, normalizedId]
    );

    if (userUpdate.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'User not found' });
    }

    const profileUpdate = await client.query(
      `
      INSERT INTO profile_page (customer_id, phone, address1, address2, bio, birthdate, gender)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (customer_id) DO UPDATE
      SET phone = EXCLUDED.phone,
          address1 = EXCLUDED.address1,
          address2 = EXCLUDED.address2,
          bio = EXCLUDED.bio,
          birthdate = EXCLUDED.birthdate,
          gender = EXCLUDED.gender,
          updated_at = CURRENT_TIMESTAMP
      RETURNING phone, address1, address2, bio, birthdate, gender
      `,
      [normalizedId, phone, address1, address2, bio, birthdate, gender]
    );

    // Sync the default address in addresses table with the new profile data
    await client.query(
      `
      UPDATE addresses
      SET full_name = $1, phone = $2, address_line_1 = $3, address_line_2 = $4, city = $5, state = $6, pincode = $7
      WHERE customer_id = $8 AND is_default = true
      `,
      [name, phone, address1, address2, city, state, pincode, normalizedId]
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

// GET USER ADDRESSES
app.get('/api/addresses/:customerId', async (req, res) => {
  const { customerId } = req.params;
  const normalizedId = normalizeCustomerId(customerId);
  try {
    const result = await pool.query(
      'SELECT * FROM addresses WHERE customer_id = $1 AND deleted_at IS NULL ORDER BY is_default DESC, created_at DESC',
      [normalizedId]
    );
    res.json({ addresses: result.rows });
  } catch (err) {
    console.error('Error fetching addresses:', err);
    res.status(500).json({ error: 'Failed to fetch addresses' });
  }
});

// ADD NEW ADDRESS
app.post('/api/addresses/:customerId', async (req, res) => {
  const { customerId } = req.params;
  const { full_name, phone, address_line_1, address_line_2, city, state, pincode, address_type, is_default } = req.body;
  const normalizedId = normalizeCustomerId(customerId);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    if (is_default) {
      await client.query('UPDATE addresses SET is_default = false WHERE customer_id = $1', [normalizedId]);
    }
    const result = await client.query(
      `INSERT INTO addresses (customer_id, full_name, phone, address_line_1, address_line_2, city, state, pincode, address_type, is_default)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [normalizedId, full_name, phone, address_line_1, address_line_2, city, state, pincode, address_type, is_default]
    );
    await client.query('COMMIT');
    res.status(201).json({ address: result.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Failed to add address', details: err.message });
  } finally {
    client.release();
  }
});

// UPDATE ADDRESS
app.put('/api/addresses/:customerId/:addressId', async (req, res) => {
  const { customerId, addressId } = req.params;
  const { full_name, phone, address_line_1, address_line_2, city, state, pincode, address_type, is_default } = req.body;
  const normalizedId = normalizeCustomerId(customerId);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    if (is_default) {
      await client.query('UPDATE addresses SET is_default = false WHERE customer_id = $1', [normalizedId]);
    }
    const result = await client.query(
      `UPDATE addresses 
       SET full_name = $1, phone = $2, address_line_1 = $3, address_line_2 = $4, city = $5, state = $6, pincode = $7, address_type = $8, is_default = $9, updated_at = CURRENT_TIMESTAMP
       WHERE address_id = $10 AND customer_id = $11
       RETURNING *`,
      [full_name, phone, address_line_1, address_line_2, city, state, pincode, address_type, is_default, addressId, normalizedId]
    );
    await client.query('COMMIT');
    res.json({ address: result.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Failed to update address' });
  } finally {
    client.release();
  }
});

// DELETE ADDRESS (Soft Delete)
app.delete('/api/addresses/:customerId/:addressId', async (req, res) => {
  const { customerId, addressId } = req.params;
  const normalizedId = normalizeCustomerId(customerId);
  try {
    await pool.query(
      'UPDATE addresses SET deleted_at = CURRENT_TIMESTAMP WHERE address_id = $1 AND customer_id = $2',
      [addressId, normalizedId]
    );
    res.json({ message: 'Address deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete address' });
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

    // CREATE AUTH SESSION
    await createAuthSession(pool, { user_type: 'admin', user_ref_id: admin.id, req });

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

    // CREATE AUTH SESSION
    await createAuthSession(pool, { user_type: 'seller', user_ref_id: seller.seller_id, req });

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
  const { admin_id, seller_id, title, description, price, stock_quantity, category, image_urls, variants, additional_images } = req.body;

  const cleanUrls = (() => {
    let urls = [];
    if (Array.isArray(image_urls)) {
      urls = image_urls.filter(u => u && typeof u === 'string' && u.trim() !== '');
    } else if (typeof image_urls === 'string' && image_urls.trim() !== '') {
      urls = [image_urls.trim()];
    }
    if (urls.length === 0) {
      urls = ['/images/toy-placeholder.png'];
    }
    return urls;
  })();

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const product_id = await generateCustomId('products', 'id', 'PRDT');

    const result = await client.query(
      `
            INSERT INTO products (
                id, seller_id, admin_id, title, description, price, stock_quantity, category, image_urls
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *
            `,
      [
        product_id,
        seller_id || null,
        admin_id || null,
        title,
        description,
        price,
        stock_quantity || 0,
        category,
        cleanUrls,
      ]
    );

    const savedProduct = result.rows[0];
    const uuidId = savedProduct.product_id;
    console.log("DEBUG: Product Saved (BASE)", { id: savedProduct.id, uuid: uuidId });


    if (variants && Array.isArray(variants)) {
      console.log(`DEBUG: Found ${variants.length} variants to process in POST`);
      for (const v of variants) {
        console.log("DEBUG: Inserting Variant:", v.sku || v.variant_name);
        await client.query(
          `INSERT INTO product_variants (product_id, sku, variant_name, variant_value, price, stock_quantity, weight, weight_unit)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [uuidId, v.sku, v.variant_name, v.variant_value, v.price, v.stock_quantity, v.weight, v.weight_unit || 'kg']
        );
      }
    }


    // Save Additional Images
    if (additional_images && Array.isArray(additional_images)) {
      console.log(`DEBUG: Found ${additional_images.length} images to insert in BASE POST for product ${uuidId}`);
      for (let i = 0; i < additional_images.length; i++) {
        const img = additional_images[i];
        const imageUrl = img.url || img.image_url || (typeof img === 'string' ? img : null);

        if (!imageUrl) continue;

        const imageType = img.image_type || (img.is_primary ? 'main' : 'gallery');
        const variantRef = img.variant_reference || img.variant_id || null;
        const sortOrder = img.sort_order !== undefined ? img.sort_order : i + 1;

        console.log("DEBUG: Inserting Image (BASE):", imageUrl);
        await client.query(
          `INSERT INTO product_images (product_id, image_id, image_url, alt_text, is_primary, sort_order, image_type, variant_reference)
           VALUES ($1, gen_random_uuid(), $2, $3, $4, $5, $6, $7)`,
          [uuidId || savedProduct.product_id, imageUrl, img.alt || img.alt_text || title, img.is_primary || false, sortOrder, imageType, variantRef]
        );
      }
    }


    await client.query('COMMIT');
    
    // AUDIT LOG
    await logAudit(pool, {
      admin_id: admin_id,
      seller_id: seller_id,
      table_name: 'products',
      record_id: product_id,
      action: 'CREATE',
      new_values: savedProduct,
      req: req
    });

    await syncCategories();
    const enriched = await enrichProductData(savedProduct);
    res.status(201).json({ product: enriched, message: 'Product added successfully' });
  } catch (err) {
    if (client) await client.query('ROLLBACK');
    console.error('Error adding product:', err);
    res.status(500).json({ error: 'Failed to add product', details: err.message });
  } finally {
    if (client) client.release();
  }
});


// GET PRODUCTS
app.get('/api/products', async (req, res) => {
  const { seller_id, admin_id } = req.query;

  try {
    let result;

    if (admin_id) {
      // Admin sees products added by admins or sellers
      result = await pool.query('SELECT * FROM products WHERE admin_id IS NOT NULL OR seller_id IS NOT NULL ORDER BY created_at DESC');
    } else if (seller_id) {
      // Seller sees ONLY their own products
      // items with admin_id are excluded as they have different ownership
      result = await pool.query(
        'SELECT * FROM products WHERE seller_id = $1 ORDER BY created_at DESC',
        [seller_id]
      );
    } else {
      // Public / User view: Usually show active items (can include both)
      result = await pool.query(
        'SELECT * FROM products WHERE is_active = true ORDER BY created_at DESC'
      );
    }

    const enriched = await enrichProductsList(result.rows);
    res.json({ products: enriched });
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Failed to fetch products', details: err.message });
  }
});

// GET PRODUCTS BY CATEGORY
app.get('/api/products/category/:category', async (req, res) => {
  const { category } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM products WHERE category = $1 AND is_active = true ORDER BY created_at DESC',
      [category]
    );
    const enriched = await enrichProductsList(result.rows);
    res.json({ products: enriched });
  } catch (err) {
    console.error('Error fetching products by category:', err);
    res.status(500).json({ error: 'Failed to fetch products by category' });
  }
});

// GET SINGLE PRODUCT BY ID (UUID or Custom ID)
app.get('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Check if the provided ID is a UUID
    const isUUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id);

    let result;
    if (isUUID) {
      result = await pool.query('SELECT * FROM products WHERE product_id = $1', [id]);
    } else {
      // Look up by custom ID (e.g. SOFT010) or SKU
      result = await pool.query('SELECT * FROM products WHERE id = $1 OR sku = $1', [id]);
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const enriched = await enrichProductData(result.rows[0]);
    res.json({ product: enriched });
  } catch (err) {
    console.error('Error fetching single product:', err);
    res.status(500).json({ error: 'Failed to fetch product details', details: err.message });
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
    variants,
    additional_images,
  } = req.body;

  const cleanUrls = (() => {
    let urls = [];
    if (Array.isArray(image_urls)) {
      urls = image_urls.filter(u => u && typeof u === 'string' && u.trim() !== '');
    } else if (typeof image_urls === 'string' && image_urls.trim() !== '') {
      urls = [image_urls.trim()];
    }
    if (urls.length === 0) {
      urls = ['/images/toy-placeholder.png'];
    }
    return urls;
  })();

  console.log("-----------------------------------------");
  console.log("DEBUG: PUT /api/products/:id RECEIVED (BASE)", id);
  console.log("DEBUG: Body Payload:", JSON.stringify(req.body, null, 2));

  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    // FETCH OLD VALUES FOR AUDIT
    const oldRes = await client.query('SELECT * FROM products WHERE id = $1', [normalizedId]);
    const oldValues = oldRes.rows[0];

    const result = await client.query(
      `
      UPDATE products
      SET title = $1, description = $2, price = $3, stock_quantity = $4, category = $5, image_urls = $6, updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *
      `,
      [title, description, price, stock_quantity, category, cleanUrls, normalizedId]
    );

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Product not found' });
    }

    const updatedProduct = result.rows[0];
    const uuidId = updatedProduct.product_id;

    await client.query('DELETE FROM product_variants WHERE product_id = $1', [uuidId]);
    if (variants && Array.isArray(variants)) {
      console.log(`DEBUG: Syncing ${variants.length} variants in BASE PUT`);
      for (const v of variants) {
        console.log("DEBUG: Syncing Variant (BASE):", v.sku || v.variant_name);
        await client.query(
          `INSERT INTO product_variants (product_id, sku, variant_name, variant_value, price, stock_quantity, weight)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [uuidId, v.sku, v.variant_name, v.variant_value, v.price, v.stock_quantity, v.weight]
        );
      }
    }


    // Sync Additional Images
    await client.query('DELETE FROM product_images WHERE product_id = $1', [uuidId]);
    if (additional_images && Array.isArray(additional_images)) {
      console.log(`DEBUG: Syncing ${additional_images.length} images in BASE PUT for product ${uuidId}`);
      for (let i = 0; i < additional_images.length; i++) {
        const img = additional_images[i];
        const imageUrl = img.url || img.image_url || (typeof img === 'string' ? img : null);

        if (!imageUrl) continue;

        const imageType = img.image_type || (img.is_primary ? 'main' : 'gallery');
        const variantRef = img.variant_reference || img.variant_id || null;
        const sortOrder = img.sort_order !== undefined ? img.sort_order : i + 1;

        console.log("DEBUG: Syncing Image (BASE):", imageUrl);
        await client.query(
          `INSERT INTO product_images (product_id, image_id, image_url, alt_text, is_primary, sort_order, image_type, variant_reference)
           VALUES ($1, gen_random_uuid(), $2, $3, $4, $5, $6, $7)`,
          [uuidId, imageUrl, img.alt || img.alt_text || title, img.is_primary || false, sortOrder, imageType, variantRef]
        );
      }
    }


    await client.query('COMMIT');

    // AUDIT LOG
    await logAudit(pool, {
      admin_id: updatedProduct.admin_id,
      seller_id: updatedProduct.seller_id,
      table_name: 'products',
      record_id: updatedProduct.id,
      action: 'UPDATE',
      old_values: oldValues,
      new_values: updatedProduct,
      req: req
    });

    await syncCategories();
    const enriched = await enrichProductData(updatedProduct);
    res.json({ product: enriched, message: 'Product updated successfully' });
  } catch (err) {
    if (client) await client.query('ROLLBACK');
    console.error('Error updating product:', err);
    res.status(500).json({ error: 'Failed to update product', details: err.message });
  } finally {
    if (client) client.release();
  }
});


// UPDATE PRODUCT STOCK
app.put('/api/products/:id/stock', async (req, res) => {
  const { id } = req.params;
  const normalizedId = normalizeProductId(id);
  const { stock_quantity } = req.body;

  try {
    // FETCH FOR AUDIT
    const oldRes = await pool.query('SELECT * FROM products WHERE id = $1', [normalizedId]);
    const oldValues = oldRes.rows[0];

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

    const updatedProduct = result.rows[0];

    // AUDIT LOG
    await logAudit(pool, {
      admin_id: updatedProduct.admin_id,
      seller_id: updatedProduct.seller_id,
      table_name: 'products',
      record_id: updatedProduct.id,
      action: 'STOCK_UPDATE',
      old_values: { stock_quantity: oldValues ? oldValues.stock_quantity : null },
      new_values: { stock_quantity: updatedProduct.stock_quantity },
      req: req
    });

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

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // FETCH FOR AUDIT
    const productRes = await client.query('SELECT * FROM products WHERE id = $1', [normalizedId]);
    if (productRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Product not found' });
    }
    const oldValues = productRes.rows[0];
    const uuidId = oldValues.product_id;

    // Delete subordinates
    await client.query('DELETE FROM product_variants WHERE product_id = $1', [uuidId]);
    await client.query('DELETE FROM product_images WHERE product_id = $1', [uuidId]);

    // Delete main
    await client.query('DELETE FROM products WHERE id = $1', [normalizedId]);

    await client.query('COMMIT');

    // AUDIT LOG
    await logAudit(pool, {
      admin_id: oldValues.admin_id,
      seller_id: oldValues.seller_id,
      table_name: 'products',
      record_id: oldValues.id,
      action: 'DELETE',
      old_values: oldValues,
      req: req
    });

    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    if (client) await client.query('ROLLBACK');
    console.error('Error deleting product:', err);
    res.status(500).json({ error: 'Failed to delete product', details: err.message });
  } finally {
    if (client) client.release();
  }
});


// ADD SELLER PRODUCT
app.post('/api/seller-products', uploadProduct.fields([{ name: 'main_image', maxCount: 1 }, { name: 'gallery_images', maxCount: 10 }]), async (req, res) => {
  // Parse fields from req.body (handling potential FormData stringification)
  const parseJsonField = (field) => {
    if (typeof field === 'string') {
      try { return JSON.parse(field); } catch (e) { return field; }
    }
    return field;
  };

  const seller_id = req.body.seller_id;
  const title = req.body.title;
  const description = req.body.description;
  const price = req.body.price;
  const stock_quantity = req.body.stock_quantity;
  const category = req.body.category;
  const mrp = req.body.mrp;
  const sku = req.body.sku;
  const brand = req.body.brand;
  const age_group = req.body.age_group;
  const material = req.body.material;
  const featured = req.body.featured === 'true' || req.body.featured === true;
  const product_status = req.body.product_status;

  const variants = parseJsonField(req.body.variants) || [];
  let additional_images = parseJsonField(req.body.additional_images) || [];
  let image_urls = parseJsonField(req.body.image_urls) || [];

  // Handle uploaded files
  if (req.files) {
    if (req.files['main_image'] && req.files['main_image'][0]) {
      const mainImageUrl = `/uploads/products/${req.files['main_image'][0].filename}`;
      // Replace or prepend the main image URL
      image_urls = [mainImageUrl, ...image_urls.filter(url => url !== mainImageUrl)];

      // Update/Add to additional_images
      additional_images = additional_images.filter(img => img.image_type !== 'main');
      additional_images.unshift({
        url: mainImageUrl,
        alt: title,
        is_primary: true,
        sort_order: 0,
        image_type: 'main'
      });
    }

    if (req.files['gallery_images'] && req.files['gallery_images'].length > 0) {
      const galleryUrls = req.files['gallery_images'].map(f => `/uploads/products/${f.filename}`);
      image_urls = [...image_urls, ...galleryUrls];

      galleryUrls.forEach((url, idx) => {
        additional_images.push({
          url: url,
          alt: title,
          is_primary: false,
          sort_order: additional_images.length,
          image_type: 'gallery'
        });
      });
    }
  }

  console.log("-----------------------------------------");
  console.log("DEBUG: POST /api/seller-products RECEIVED");
  console.log("DEBUG: Body Payload:", JSON.stringify(req.body, null, 2));

  const client = await pool.connect();
  try {

    await client.query('BEGIN');
    const product_id = await generateCustomId('products', 'id', 'PRDT');

    const result = await client.query(
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

    const savedProduct = result.rows[0];
    const uuidId = savedProduct.product_id;
    console.log("DEBUG: Product Saved", { id: savedProduct.id, uuid: uuidId });

    if (variants && Array.isArray(variants)) {
      console.log(`DEBUG: Found ${variants.length} variants`);
      for (const v of variants) {
        console.log("DEBUG: Inserting Variant", v.sku);

        await client.query(
          `INSERT INTO product_variants (product_id, sku, variant_name, variant_value, price, stock_quantity, weight)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [uuidId, v.sku, v.variant_name, v.variant_value, v.price, v.stock_quantity, v.weight]
        );
      }
    }

    // Save Additional Images
    if (additional_images && Array.isArray(additional_images)) {
      console.log(`DEBUG: Found ${additional_images.length} images to insert for product ${uuidId || product_id}`);
      for (let i = 0; i < additional_images.length; i++) {
        const img = additional_images[i];
        const imageUrl = img.url || img.image_url || (typeof img === 'string' ? img : null);

        if (!imageUrl) continue;

        const imageType = img.image_type || (img.is_primary ? 'main' : 'gallery');
        const variantRef = img.variant_reference || img.variant_id || null;
        const sortOrder = img.sort_order !== undefined ? img.sort_order : i + 1;

        console.log("DEBUG: Inserting Image:", imageUrl);
        await client.query(
          `INSERT INTO product_images (product_id, image_id, image_url, alt_text, is_primary, sort_order, image_type, variant_reference)
           VALUES ($1, gen_random_uuid(), $2, $3, $4, $5, $6, $7)`,
          [uuidId || savedProduct.product_id, imageUrl, img.alt || img.alt_text || title, img.is_primary || false, sortOrder, imageType, variantRef]
        );
      }
    }


    await client.query('COMMIT');
    
    // AUDIT LOG
    await logAudit(pool, {
      seller_id: seller_id,
      table_name: 'products',
      record_id: product_id,
      action: 'CREATE',
      new_values: savedProduct,
      req: req
    });

    await syncCategories();
    const enriched = await enrichProductData(savedProduct);
    res.status(201).json({ product: enriched, message: 'Product added successfully' });
  } catch (err) {
    if (client) await client.query('ROLLBACK');
    console.error('Error adding seller product:', err);
    res.status(500).json({ error: 'Failed to add product', details: err.message });
  } finally {
    if (client) client.release();
  }
});


// GET SELLER PRODUCTS
app.get('/api/seller-products', async (req, res) => {
  const { seller_id, admin_id } = req.query;

  try {
    let result;

    if (admin_id) {
      // Admin sees products added by admins or sellers
      result = await pool.query('SELECT * FROM products WHERE admin_id IS NOT NULL OR seller_id IS NOT NULL ORDER BY created_at DESC');
    } else if (seller_id) {
      result = await pool.query(
        'SELECT * FROM products WHERE seller_id = $1 ORDER BY created_at DESC',
        [seller_id]
      );
    } else {
      result = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
    }

    const enriched = await enrichProductsList(result.rows);
    res.json({ products: enriched });
  } catch (err) {
    console.error('Error fetching seller products:', err);
    res.status(500).json({ error: 'Failed to fetch products', details: err.message });
  }
});


// UPDATE SELLER PRODUCT
app.put('/api/seller-products/:id', uploadProduct.fields([{ name: 'main_image', maxCount: 1 }, { name: 'gallery_images', maxCount: 10 }]), async (req, res) => {
  const { id } = req.params;

  // Parse fields from req.body (handling potential FormData stringification)
  const parseJsonField = (field) => {
    if (typeof field === 'string') {
      try { return JSON.parse(field); } catch (e) { return field; }
    }
    return field;
  };

  const title = req.body.title;
  const description = req.body.description;
  const price = req.body.price;
  const stock_quantity = req.body.stock_quantity;
  const category = req.body.category;
  const mrp = req.body.mrp;
  const sku = req.body.sku;
  const brand = req.body.brand;
  const age_group = req.body.age_group;
  const material = req.body.material;
  const featured = req.body.featured === 'true' || req.body.featured === true;
  const product_status = req.body.product_status;

  const variants = parseJsonField(req.body.variants) || [];
  let additional_images = parseJsonField(req.body.additional_images) || [];
  let image_urls = parseJsonField(req.body.image_urls) || [];

  // Handle uploaded files
  if (req.files) {
    if (req.files['main_image'] && req.files['main_image'][0]) {
      const mainImageUrl = `/uploads/products/${req.files['main_image'][0].filename}`;
      // Replace or prepend the main image URL
      image_urls = [mainImageUrl, ...image_urls.filter(url => url !== mainImageUrl)];

      // Update/Add to additional_images
      additional_images = additional_images.filter(img => img.image_type !== 'main');
      additional_images.unshift({
        url: mainImageUrl,
        alt: title,
        is_primary: true,
        sort_order: 0,
        image_type: 'main'
      });
    }

    if (req.files['gallery_images'] && req.files['gallery_images'].length > 0) {
      const galleryUrls = req.files['gallery_images'].map(f => `/uploads/products/${f.filename}`);
      image_urls = [...image_urls, ...galleryUrls];

      galleryUrls.forEach((url, idx) => {
        additional_images.push({
          url: url,
          alt: title,
          is_primary: false,
          sort_order: additional_images.length,
          image_type: 'gallery'
        });
      });
    }
  }

  console.log("-----------------------------------------");
  console.log("DEBUG: PUT /api/seller-products/:id RECEIVED", id);
  console.log("DEBUG: Body Payload:", JSON.stringify(req.body, null, 2));

  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    // FETCH OLD VALUES FOR AUDIT
    const oldRes = await client.query('SELECT * FROM products WHERE id = $1', [id]);
    const oldValues = oldRes.rows[0];

    const result = await client.query(
      `
      UPDATE products
      SET title = $1, description = $2, price = $3, stock_quantity = $4, category = $5, image_urls = $6, mrp = $7, sku = $8, brand = $9, age_group = $10, material = $11, featured = $12, product_status = $13, updated_at = CURRENT_TIMESTAMP
      WHERE id = $14
      RETURNING *
      `,
      [title, description, price, stock_quantity, category, image_urls || [], mrp, sku, brand, age_group, material, featured, product_status, id]
    );

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Product not found' });
    }

    const updatedProduct = result.rows[0];
    const uuidId = updatedProduct.product_id;

    await client.query('DELETE FROM product_variants WHERE product_id = $1', [uuidId]);
    if (variants && Array.isArray(variants)) {
      console.log(`DEBUG: Syncing ${variants.length} variants in PUT`);
      for (const v of variants) {
        console.log("DEBUG: Syncing Variant:", v.sku || v.variant_name);
        await client.query(
          `INSERT INTO product_variants (product_id, sku, variant_name, variant_value, price, stock_quantity, weight, weight_unit)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [uuidId, v.sku, v.variant_name, v.variant_value, v.price, v.stock_quantity, v.weight, v.weight_unit || 'kg']
        );
      }
    }


    // Sync Additional Images
    await client.query('DELETE FROM product_images WHERE product_id = $1', [uuidId]);
    if (additional_images && Array.isArray(additional_images)) {
      console.log(`DEBUG: Syncing ${additional_images.length} images in PUT for product ${uuidId}`);
      for (let i = 0; i < additional_images.length; i++) {
        const img = additional_images[i];
        const imageUrl = img.url || img.image_url || (typeof img === 'string' ? img : null);

        if (!imageUrl) continue;

        const imageType = img.image_type || (img.is_primary ? 'main' : 'gallery');
        const variantRef = img.variant_reference || img.variant_id || null;
        const sortOrder = img.sort_order !== undefined ? img.sort_order : i + 1;

        console.log("DEBUG: Inserting Image:", imageUrl);
        await client.query(
          `INSERT INTO product_images (product_id, image_id, image_url, alt_text, is_primary, sort_order, image_type, variant_reference)
           VALUES ($1, gen_random_uuid(), $2, $3, $4, $5, $6, $7)`,
          [uuidId, imageUrl, img.alt || img.alt_text || title, img.is_primary || false, sortOrder, imageType, variantRef]
        );
      }
    }


    await client.query('COMMIT');

    // AUDIT LOG
    await logAudit(pool, {
      seller_id: updatedProduct.seller_id,
      table_name: 'products',
      record_id: updatedProduct.id,
      action: 'UPDATE',
      old_values: oldValues,
      new_values: updatedProduct,
      req: req
    });

    await syncCategories();
    const enriched = await enrichProductData(updatedProduct);
    res.json({ product: enriched, message: 'Product updated successfully' });
  } catch (err) {
    if (client) await client.query('ROLLBACK');
    console.error('Error updating seller product:', err);
    res.status(500).json({ error: 'Failed to update product', details: err.message });
  } finally {
    if (client) client.release();
  }
});


// DELETE SELLER PRODUCT
app.delete('/api/seller-products/:id', async (req, res) => {
  const { id } = req.params;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // FETCH FOR AUDIT
    const productRes = await client.query('SELECT * FROM products WHERE id = $1', [id]);
    if (productRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Product not found' });
    }
    const oldValues = productRes.rows[0];
    const uuidId = oldValues.product_id;

    // Delete subordinates
    await client.query('DELETE FROM product_variants WHERE product_id = $1', [uuidId]);
    await client.query('DELETE FROM product_images WHERE product_id = $1', [uuidId]);

    // Delete main
    await client.query('DELETE FROM products WHERE id = $1', [id]);

    await client.query('COMMIT');
    
    // AUDIT LOG
    await logAudit(pool, {
      seller_id: oldValues.seller_id,
      table_name: 'products',
      record_id: oldValues.id,
      action: 'DELETE',
      old_values: oldValues,
      req: req
    });

    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    if (client) await client.query('ROLLBACK');
    console.error('Error deleting seller product:', err);
    res.status(500).json({ error: 'Failed to delete product', details: err.message });
  } finally {
    if (client) client.release();
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

// GET SELLER DISCOUNTS (Legacy - keeping for compatibility but will migrate to coupons)
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

// --- NEW COUPONS API ---

// GET COUPONS (Admin pulls all, Seller pulls their own)
app.get('/api/coupons', async (req, res) => {
  const { seller_id, admin_id } = req.query;

  try {
    let result;
    const baseQuery = `
      SELECT c.*, COALESCE(p.name, p.title) AS product_name, p.sku AS product_sku
      FROM coupons c
      LEFT JOIN products p ON c.product_id::text = p.product_id::text OR c.product_id = p.id
    `;

    if (admin_id) {
      // Admin Dashboard: See EVERYTHING
      result = await pool.query(`${baseQuery} ORDER BY c.created_at DESC`);
    } else if (seller_id) {
      // Seller Dashboard: See ONLY their own coupons
      result = await pool.query(`${baseQuery} WHERE c.seller_id = $1 ORDER BY c.created_at DESC`, [seller_id]);
    } else {
      // Public / General View: Show only active coupons
      result = await pool.query(`${baseQuery} WHERE c.status = 'Active' ORDER BY c.created_at DESC`);
    }

    res.json({ coupons: result.rows });
  } catch (err) {
    console.error('Error fetching coupons:', err);
    res.status(500).json({ error: 'Failed to fetch coupons', details: err.message });
  }
});

// GET AVAILABLE COUPONS FOR USERS
app.get('/api/coupons/available', async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM coupons WHERE status = 'Active' AND (valid_until IS NULL OR valid_until > CURRENT_TIMESTAMP) ORDER BY created_at DESC"
    );
    res.json({ coupons: result.rows });
  } catch (err) {
    console.error('Error fetching available coupons:', err);
    res.status(500).json({ error: 'Failed to fetch available coupons' });
  }
});

// CREATE COUPON
app.post('/api/coupons', async (req, res) => {
  const {
    admin_id, seller_id, title, description, code,
    discount_type, discount_value, discount_percent,
    max_discount, min_order_val, usage_limit, valid_until, status,
    product_id
  } = req.body;

  try {
    const result = await pool.query(
      `
      INSERT INTO coupons (
        admin_id, seller_id, title, description, code,
        discount_type, discount_value, discount_percent,
        max_discount, min_order_val, usage_limit, valid_until, status,
        product_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
      `,
      [
        admin_id || null,
        seller_id || null,
        title,
        description,
        code.toUpperCase(),
        discount_type || 'percentage',
        discount_value || 0,
        discount_percent || 0,
        max_discount || 0,
        min_order_val || 0,
        usage_limit || -1,
        valid_until || null,
        status || 'Active',
        product_id || null
      ]
    );

    res.status(201).json({ coupon: result.rows[0], message: 'Coupon created successfully' });
  } catch (err) {
    console.error('Error creating coupon:', err);
    if (err.code === '23505') return res.status(400).json({ error: 'Coupon code already exists' });
    res.status(500).json({ error: 'Failed to create coupon', details: err.message });
  }
});

// UPDATE COUPON
app.put('/api/coupons/:id', async (req, res) => {
  const { id } = req.params;
  const {
    title, description, code,
    discount_type, discount_value, discount_percent,
    max_discount, min_order_val, usage_limit, valid_until, status,
    product_id
  } = req.body;

  try {
    const result = await pool.query(
      `
      UPDATE coupons
      SET title = $1, description = $2, code = $3,
          discount_type = $4, discount_value = $5, discount_percent = $6,
          max_discount = $7, min_order_val = $8, usage_limit = $9,
          valid_until = $10, status = $11,
          product_id = $12
      WHERE coupon_id = $13
      RETURNING *
      `,
      [
        title, description, code.toUpperCase(),
        discount_type, discount_value, discount_percent,
        max_discount, min_order_val, usage_limit,
        valid_until, status,
        product_id || null,
        id
      ]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Coupon not found' });
    res.json({ coupon: result.rows[0], message: 'Coupon updated successfully' });
  } catch (err) {
    console.error('Error updating coupon:', err);
    res.status(500).json({ error: 'Failed to update coupon', details: err.message });
  }
});

// DELETE COUPON
app.delete('/api/coupons/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM coupons WHERE coupon_id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Coupon not found' });
    res.json({ message: 'Coupon deleted successfully' });
  } catch (err) {
    console.error('Error deleting coupon:', err);
    res.status(500).json({ error: 'Failed to delete coupon', details: err.message });
  }
});

// VALIDATE COUPON
app.post('/api/coupons/validate', async (req, res) => {
  const { code, subtotal } = req.body;

  try {
    const result = await pool.query(
      "SELECT * FROM coupons WHERE code = $1 AND status = 'Active' AND (valid_until IS NULL OR valid_until > CURRENT_TIMESTAMP)",
      [code.toUpperCase()]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired coupon code' });
    }

    const coupon = result.rows[0];

    // Check usage limit
    if (coupon.usage_limit !== -1 && coupon.used_count >= coupon.usage_limit) {
      return res.status(400).json({ error: 'Coupon usage limit reached' });
    }

    // Check minimum order value
    if (subtotal < coupon.min_order_val) {
      return res.status(400).json({ error: `Minimum order value for this coupon is ₹${coupon.min_order_val}` });
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discount_type === 'percentage') {
      discountAmount = (subtotal * coupon.discount_percent) / 100;
      if (coupon.max_discount > 0 && discountAmount > coupon.max_discount) {
        discountAmount = coupon.max_discount;
      }
    } else {
      discountAmount = coupon.discount_value;
    }

    res.json({
      valid: true,
      coupon_id: coupon.coupon_id,
      code: coupon.code,
      discount_amount: discountAmount,
      discount_type: coupon.discount_type,
      message: 'Coupon applied successfully'
    });
  } catch (err) {
    console.error('Error validating coupon:', err);
    res.status(500).json({ error: 'Failed to validate coupon' });
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
    coupon_id,
    order_id: display_id,
    payment_method, // New field for payments table
  } = req.body;

  console.log("REQ BODY COUPON DATA:", {
    coupon_id: req.body.coupon_id,
    coupon_code: req.body.coupon_code,
    discount_amount: req.body.discount_amount
  });

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
        coupon_code,
        ordered_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'Confirmed', 'paid', $10, $11, $12, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
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
        coupon_id || null,
        coupon_code || null
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

    console.log('[API] Received order payload with coupon:', { coupon_id, coupon_code, discount_amount });

    // 4. Update Inventory & Insert Order Items
    if (normalizedItems && Array.isArray(normalizedItems)) {
      for (const item of normalizedItems) {
        // Update Inventory
        await client.query(
          `
          UPDATE products
          SET stock_quantity = GREATEST(0, stock_quantity - $1),
              updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
          `,
          [item.qty || item.quantity || 1, item.id]
        );

        // Insert into order_items
        const orderItemRes = await client.query(
          `
          INSERT INTO order_items (order_id, product_id, quantity, price_at_time_of_purchase)
          VALUES ($1, $2, $3, $4)
          RETURNING id
          `,
          [dbOrderId, item.id, item.qty || item.quantity || 1, item.price]
        );
        const orderItemId = orderItemRes.rows[0].id;

        // Calculate and Store Seller Commission
        try {
          const productInfo = await client.query('SELECT seller_id FROM products WHERE id = $1', [item.id]);
          const itemSellerId = productInfo.rows[0]?.seller_id || seller_id || 'S001';
          const saleAmount = (item.price || 0) * (item.qty || item.quantity || 1);
          const commissionRate = 10;
          const commissionAmount = (saleAmount * commissionRate) / 100;
          const sellerEarnings = saleAmount - commissionAmount;

          console.log("SELLER COMMISSION INSERT START", {
            order_item_id: orderItemId,
            seller_id: itemSellerId,
            order_id: dbOrderId,
            sale_amount: saleAmount
          });

          await client.query(
            `INSERT INTO seller_commissions (
              order_item_id, seller_id, order_id, sale_amount, 
              commission_rate, commission_amount, seller_earnings, status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'Pending')`,
            [orderItemId, itemSellerId, dbOrderId, saleAmount, commissionRate, commissionAmount, sellerEarnings]
          );
          console.log("SELLER COMMISSION INSERTED SUCCESSFULLY");

          const commissionIdResult = await client.query('SELECT commission_id FROM seller_commissions WHERE order_item_id = $1', [orderItemId]);
          const commissionId = commissionIdResult.rows[0].commission_id;

          // Calculate and Store Seller Payout
          try {
            const payoutAmount = saleAmount - commissionAmount;

            console.log("SELLER PAYOUT INSERT START");
            console.log({ seller_id: itemSellerId, order_id: dbOrderId, sale_amount: saleAmount, commission_amount: commissionAmount, payout_amount: payoutAmount });

            await client.query(
              `INSERT INTO seller_payouts (
                seller_id, order_id, commission_id, sale_amount, 
                commission_amount, payout_amount, status
              ) VALUES ($1, $2, $3, $4, $5, $6, 'Pending')`,
              [itemSellerId, dbOrderId, commissionId, saleAmount, commissionAmount, payoutAmount]
            );
            console.log("SELLER PAYOUT INSERTED SUCCESSFULLY");
          } catch (payoutError) {
            console.error("SELLER PAYOUT INSERT ERROR:", payoutError);
            throw payoutError;
          }
        } catch (error) {
          console.error("SELLER COMMISSION INSERT ERROR:", error);
          throw error; // Rollback main transaction
        }
      }
      console.log(`[API] Inserted ${normalizedItems.length} order items for order ${dbOrderId}`);
    }

    // 5. Track Coupon Usage
    if (coupon_id || coupon_code) {
      try {
        const couponLookup = await client.query(
          "SELECT coupon_id FROM coupons WHERE coupon_id=$1 OR code=$2 LIMIT 1",
          [coupon_id || null, coupon_code || null]
        );

        if (couponLookup.rows.length > 0) {
          const actualCouponId = couponLookup.rows[0].coupon_id;

          // 5a. Insert into coupon_usage
          await client.query(
            `INSERT INTO coupon_usage (coupon_id, customer_id, order_id, discount_amount, used_at)
             VALUES ($1, $2, $3, $4, NOW())`,
            [actualCouponId, final_customer_id, dbOrderId, discount_amount || 0]
          );

          // 5b. Update coupons usage count
          await client.query(
            "UPDATE coupons SET used_count = used_count + 1 WHERE coupon_id = $1",
            [actualCouponId]
          );

          // 5c. Insert into order_coupons
          await client.query(
            `INSERT INTO order_coupons (order_id, coupon_id, discount_amount, applied_at)
             VALUES ($1, $2, $3, NOW())
             ON CONFLICT DO NOTHING`,
            [dbOrderId, actualCouponId, discount_amount || 0]
          );
          console.log(`[API] Coupon ${actualCouponId} tracked successfully for order ${dbOrderId}`);
        } else {
          console.log("[API] Coupon lookup failed, not tracking usage for:", { coupon_id, coupon_code });
        }
      } catch (error) {
        console.error("COUPON INSERT ERROR:", error);
        throw error; // Re-throw to trigger transaction rollback
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
  const { seller_id, admin_id } = req.query;

  try {
    let query;
    let params = [];

    if (admin_id) {
      // Admin sees ALL orders
      query = `
        SELECT
          o.id AS order_id,
          o.customer_id,
          o.admin_id,
          o.seller_id,
          o.total_amount,
          o.shipping_address,
          o.order_status,
          o.payment_status,
          o.ordered_at,
          o.items,
          c.name as customer_name,
          c.email as customer_email,
          c.id as customer_db_id
        FROM orders o
        LEFT JOIN customer c ON o.customer_id = c.customer_id
        ORDER BY o.ordered_at DESC
      `;
    } else if (seller_id) {
      // Seller sees ONLY their own orders
      query = `
        SELECT
          o.id AS order_id,
          o.customer_id,
          o.admin_id,
          o.seller_id,
          o.total_amount,
          o.shipping_address,
          o.order_status,
          o.payment_status,
          o.ordered_at,
          o.items,
          c.name as customer_name,
          c.email as customer_email,
          c.id as customer_db_id
        FROM orders o
        LEFT JOIN customer c ON o.customer_id = c.customer_id
        WHERE o.seller_id = $1 OR EXISTS (
            SELECT 1 FROM jsonb_array_elements(o.items) AS item 
            JOIN products p ON (item->>'id') = p.id
            WHERE p.seller_id = $1
        )
        ORDER BY o.ordered_at DESC
      `;
      params = [seller_id];
    } else {
      return res.status(400).json({ error: 'Missing ownership ID (seller_id or admin_id)' });
    }

    const result = await pool.query(query, params);
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


// SELLER ANALYTICS
app.get('/api/seller/analytics', async (req, res) => {
  const { seller_id } = req.query;
  console.log(`[DEBUG] Analytics requested for seller_id: "${seller_id}"`);

  if (!seller_id) {
    return res.status(400).json({ error: 'seller_id is required' });
  }

  try {
    // 0. Raw check for debugging
    const rawCheck = await pool.query(
      'SELECT COUNT(DISTINCT o.id) FROM orders o JOIN order_items oi ON o.id = oi.order_id JOIN products p ON oi.product_id = p.id WHERE p.seller_id = $1',
      [seller_id]
    );
    console.log(`[DEBUG] Raw order count for seller ${seller_id}:`, rawCheck.rows[0].count);

    // 1. Basic Stats (Revenue, Orders)
    const statsRes = await pool.query(`
      SELECT
        COUNT(DISTINCT o.id) AS total_orders,
        COALESCE(SUM(oi.quantity * oi.price_at_time_of_purchase), 0) AS total_revenue
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      WHERE p.seller_id = $1 
        AND (
          LOWER(o.order_status) IN ('delivered', 'confirmed', 'shipped', 'pending', 'processing', 'placed') 
          OR LOWER(o.payment_status) IN ('paid', 'success', 'completed')
        )
    `, [seller_id]);

    // 2. Sales Over Time (Last 6 months)
    const chartRes = await pool.query(
      `
      SELECT 
        DATE_TRUNC('month', o.ordered_at) AS month, 
        COALESCE(SUM(oi.quantity * oi.price_at_time_of_purchase), 0) AS revenue
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      WHERE p.seller_id = $1
        AND (
          LOWER(o.order_status) IN ('delivered', 'confirmed', 'shipped', 'pending', 'processing', 'placed') 
          OR LOWER(o.payment_status) IN ('paid', 'success', 'completed')
        )
      GROUP BY month 
      ORDER BY month DESC 
      LIMIT 6
      `,
      [seller_id]
    );

    // 3. Top Performing Products
    const topProductsRes = await pool.query(
      `
      SELECT 
        COALESCE(p.name, p.title, 'Product ' || p.id) as name,
        SUM(oi.quantity) as sales
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      JOIN products p ON oi.product_id = p.id
      WHERE p.seller_id = $1
        AND (
          LOWER(o.order_status) IN ('delivered', 'confirmed', 'shipped', 'pending', 'processing', 'placed') 
          OR LOWER(o.payment_status) IN ('paid', 'success', 'completed')
        )
      GROUP BY p.id, p.name, p.title
      ORDER BY sales DESC
      LIMIT 5
      `,
      [seller_id]
    );

    // Pad last 6 months
    const salesOverview = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthLabel = d.toLocaleString('default', { month: 'short' });
      const year = d.getFullYear();
      const monthNum = d.getMonth();
      const dbMatch = chartRes.rows.find(r => {
        const rDate = new Date(r.month);
        return rDate.getMonth() === monthNum && rDate.getFullYear() === year;
      });
      salesOverview.push({ month: monthLabel, revenue: dbMatch ? parseFloat(dbMatch.revenue) : 0 });
    }

    res.json({
      revenue: parseFloat(statsRes.rows[0]?.total_revenue || 0),
      orders: parseInt(statsRes.rows[0]?.total_orders || 0),
      visitors: 0, 
      conversionRate: 0,
      topProducts: topProductsRes.rows,
      salesOverview
    });
  } catch (err) {
    console.error('Error fetching analytics:', err);
    res.status(500).json({ error: 'Failed to fetch analytics', details: err.message });
  }
});

// REVENUE TREND API
app.get('/api/seller/revenue-trend', async (req, res) => {
  const { seller_id, period = 'monthly' } = req.query;
  if (!seller_id) return res.status(400).json({ error: 'seller_id is required' });

  try {
    let interval, date_trunc_unit, limit;
    switch (period) {
      case 'weekly':
        interval = '8 weeks';
        date_trunc_unit = 'week';
        limit = 8;
        break;
      case 'yearly':
        interval = '5 years';
        date_trunc_unit = 'year';
        limit = 5;
        break;
      case 'monthly':
      default:
        interval = '6 months';
        date_trunc_unit = 'month';
        limit = 6;
        break;
    }

    const query = `
      SELECT 
        DATE_TRUNC($2, o.ordered_at) AS period_date, 
        COALESCE(SUM(oi.quantity * oi.price_at_time_of_purchase), 0) AS revenue
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      WHERE p.seller_id = $1
        AND (
          LOWER(o.order_status) IN ('delivered', 'confirmed', 'shipped', 'pending', 'processing', 'placed') 
          OR LOWER(o.payment_status) IN ('paid', 'success', 'completed')
        )
        AND o.ordered_at >= NOW() - CAST($3 AS INTERVAL)
      GROUP BY period_date
      ORDER BY period_date ASC;
    `;

    const result = await pool.query(query, [seller_id, date_trunc_unit, interval]);

    const trendData = [];
    for (let i = limit - 1; i >= 0; i--) {
      const d = new Date();
      if (period === 'weekly') d.setDate(d.getDate() - (i * 7));
      else if (period === 'yearly') d.setFullYear(d.getFullYear() - i);
      else d.setMonth(d.getMonth() - i);

      // Normalize for matching
      if (period === 'weekly') {
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        d.setHours(0, 0, 0, 0);
        d.setDate(diff);
      } else if (period === 'yearly') {
        d.setMonth(0, 1);
        d.setHours(0, 0, 0, 0);
      } else {
        d.setDate(1);
        d.setHours(0, 0, 0, 0);
      }

      const match = result.rows.find(r => {
        const rDate = new Date(r.period_date);
        if (period === 'weekly') return Math.abs(rDate - d) < 172800000; // 2 days tolerance for TZ
        if (period === 'yearly') return rDate.getFullYear() === d.getFullYear();
        return rDate.getMonth() === d.getMonth() && rDate.getFullYear() === d.getFullYear();
      });

      let label;
      if (period === 'weekly') label = `W${d.toLocaleDateString('default', { month: '2-digit', day: '2-digit' })}`;
      else if (period === 'yearly') label = d.getFullYear().toString();
      else label = d.toLocaleString('default', { month: 'short' });

      trendData.push({
        label,
        revenue: match ? parseFloat(match.revenue) : 0
      });
    }

    res.json(trendData);
  } catch (err) {
    console.error('Revenue trend error:', err);
    res.status(500).json({ error: 'Failed to fetch revenue trend' });
  }
});


// COMPREHENSIVE SELLER REPORTS
app.get('/api/seller/reports', async (req, res) => {
  const { seller_id, period } = req.query;

  if (!seller_id) return res.status(400).json({ error: 'seller_id is required' });

  let timeFilter = "AND DATE_TRUNC('month', ordered_at) = DATE_TRUNC('month', CURRENT_DATE)"; // Default current month
  if (period === 'daily') timeFilter = "AND ordered_at >= CURRENT_DATE";
  else if (period === 'weekly') timeFilter = "AND DATE_TRUNC('week', ordered_at) = DATE_TRUNC('week', CURRENT_DATE)";
  else if (period === 'monthly') timeFilter = "AND DATE_TRUNC('month', ordered_at) = DATE_TRUNC('month', CURRENT_DATE)";
  else if (period === 'yearly') timeFilter = "AND DATE_TRUNC('year', ordered_at) = DATE_TRUNC('year', CURRENT_DATE)";

  try {
    // 1. Summary Stats
    const summaryRes = await pool.query(`
      SELECT
        COUNT(id) AS total_orders,
        COALESCE(SUM(total_amount), 0) AS total_revenue,
        COALESCE(SUM(discount_amount), 0) AS total_discounts,
        COALESCE(SUM(tax_amount), 0) AS total_tax,
        COUNT(CASE WHEN LOWER(payment_status) = 'paid' THEN 1 END) AS paid_orders,
        COUNT(CASE WHEN LOWER(payment_status) = 'pending' THEN 1 END) AS pending_orders
      FROM orders
      WHERE seller_id = $1 ${timeFilter}
    `, [seller_id]);

    // 2. Detailed Orders Table
    const ordersRes = await pool.query(`
      SELECT
        id,
        items,
        total_amount,
        discount_amount,
        tax_amount,
        payment_method,
        payment_status,
        order_status,
        ordered_at
      FROM orders
      WHERE seller_id = $1 ${timeFilter}
      ORDER BY ordered_at DESC
    `, [seller_id]);

    res.json({
      summary: summaryRes.rows[0],
      orders: ordersRes.rows
    });
  } catch (err) {
    console.error('Error fetching seller reports:', err);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// SELLER FINANCE SUMMARY
app.get('/api/seller/finance/summary', async (req, res) => {
  const { seller_id } = req.query;
  if (!seller_id) return res.status(400).json({ error: 'seller_id is required' });

  try {
    // 1. Earnings from Delivered & Paid Orders
    const earningsRes = await pool.query(`
      SELECT 
        COALESCE(SUM(sc.seller_earnings), 0) as total_earnings,
        COALESCE(SUM(sc.seller_earnings) FILTER (WHERE sc.created_at >= date_trunc('month', CURRENT_DATE)), 0) as earnings_this_month
      FROM seller_commissions sc
      JOIN orders o ON sc.order_id = o.id
      WHERE sc.seller_id = $1 
        AND (
          LOWER(o.order_status) IN ('delivered', 'confirmed', 'shipped', 'pending', 'processing', 'placed') 
          OR LOWER(o.payment_status) IN ('paid', 'success', 'completed')
        )
    `, [seller_id]);

    // 2. Payouts Stats
    const payoutRes = await pool.query(`
      SELECT 
        COALESCE(SUM(payout_amount) FILTER (WHERE LOWER(status) = 'pending'), 0) as pending_payout,
        COALESCE(SUM(payout_amount) FILTER (WHERE LOWER(status) = 'completed'), 0) as completed_payout
      FROM seller_payouts
      WHERE seller_id = $1
    `, [seller_id]);

    // 3. Total Transactions Count
    const transCountRes = await pool.query(`
      SELECT COUNT(*) as total_transactions
      FROM orders
      WHERE seller_id = $1
    `, [seller_id]);

    const earnings = earningsRes.rows[0];
    const payouts = payoutRes.rows[0];

    res.json({
      totalEarnings: parseFloat(earnings.total_earnings),
      thisMonth: parseFloat(earnings.earnings_this_month),
      pendingPayout: parseFloat(payouts.pending_payout),
      completedPayout: parseFloat(payouts.completed_payout),
      totalTransactions: parseInt(transCountRes.rows[0].total_transactions)
    });
  } catch (err) {
    console.error('Error fetching seller finance summary:', err);
    res.status(500).json({ error: 'Failed to fetch finance summary' });
  }
});

// SELLER PAYOUTS/TRANSACTIONS
app.get('/api/seller/finance/payouts', async (req, res) => {
  const { seller_id } = req.query;
  if (!seller_id) return res.status(400).json({ error: 'seller_id is required' });

  try {
    const result = await pool.query(`
      SELECT 
        payout_id,
        order_id,
        seller_id,
        sale_amount,
        commission_amount,
        payout_amount,
        status,
        created_at as date
      FROM seller_payouts
      WHERE seller_id = $1
      ORDER BY created_at DESC
    `, [seller_id]);

    res.json({ payouts: result.rows });
  } catch (err) {
    console.error('Error fetching seller payouts:', err);
    res.status(500).json({ error: 'Failed to fetch payouts' });
  }
});

// SELLER RECENT TRANSACTIONS (Customer order transactions)
app.get('/api/seller/finance/transactions', async (req, res) => {
  const { seller_id } = req.query;
  if (!seller_id) return res.status(400).json({ error: 'seller_id is required' });

  try {
    const result = await pool.query(`
      SELECT 
        o.id as id,
        o.id as order_id,
        c.name as customer,
        o.total_amount as amount,
        'Credit' as type,
        o.payment_status as status,
        o.ordered_at as date
      FROM orders o
      LEFT JOIN customer c ON o.customer_id = c.customer_id
      WHERE o.seller_id = $1
      ORDER BY o.ordered_at DESC
      LIMIT 20
    `, [seller_id]);

    res.json({ transactions: result.rows });
  } catch (err) {
    console.error('Error fetching seller transactions:', err);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// SELLER DASHBOARD SUMMARY
app.get('/api/seller/dashboard', async (req, res) => {
  const { seller_id } = req.query;
  if (!seller_id) return res.status(400).json({ error: 'seller_id is required' });

  try {
    const productsRes = await pool.query('SELECT COUNT(*) FROM products WHERE seller_id = $1', [seller_id]);
    const totalProducts = parseInt(productsRes.rows[0].count, 10);

    const lowStockRes = await pool.query('SELECT COUNT(*) FROM products WHERE seller_id = $1 AND stock_quantity <= 5', [seller_id]);
    const lowStockCount = parseInt(lowStockRes.rows[0].count, 10);

    const statsRes = await pool.query(`
      SELECT
        COUNT(DISTINCT o.id) AS total_orders,
        COALESCE(SUM(oi.quantity * oi.price_at_time_of_purchase), 0) AS total_sales
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      WHERE p.seller_id = $1
        AND (
          LOWER(o.order_status) IN ('delivered', 'confirmed', 'shipped', 'pending', 'processing', 'placed') 
          OR LOWER(o.payment_status) IN ('paid', 'success', 'completed')
        )
    `, [seller_id]);

    const totalOrders = parseInt(statsRes.rows[0].total_orders, 10);
    const totalSales = parseFloat(statsRes.rows[0].total_sales);

    const pendingRes = await pool.query(`
      SELECT COUNT(DISTINCT o.id) 
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      WHERE p.seller_id = $1
        AND LOWER(o.order_status) IN ('placed', 'pending', 'processing')
    `, [seller_id]);
    const pendingOrders = parseInt(pendingRes.rows[0].count, 10);

    const trendRes = await pool.query(`
      SELECT 
        DATE_TRUNC('month', o.ordered_at) AS month_date,
        SUM(oi.quantity * oi.price_at_time_of_purchase) AS revenue
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      WHERE p.seller_id = $1
        AND o.ordered_at >= NOW() - INTERVAL '6 months'
        AND (
          LOWER(o.order_status) IN ('delivered', 'confirmed', 'shipped', 'pending', 'processing', 'placed') 
          OR LOWER(o.payment_status) IN ('paid', 'success', 'completed')
        )
      GROUP BY month_date
      ORDER BY month_date ASC;
    `, [seller_id]);

    const revenueTrend = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthLabel = d.toLocaleString('default', { month: 'short' });
      const year = d.getFullYear();
      const monthNum = d.getMonth();

      const dbMatch = trendRes.rows.find(r => {
        const rDate = new Date(r.month_date);
        return rDate.getMonth() === monthNum && rDate.getFullYear() === year;
      });

      revenueTrend.push({
        month: monthLabel,
        revenue: dbMatch ? parseFloat(dbMatch.revenue) : 0
      });
    }

    res.json({
      summary: {
        totalProducts,
        lowStockCount,
        totalOrders,
        totalSales,
        pendingOrders
      },
      revenueTrend
    });
  } catch (err) {
    console.error('Error fetching dashboard summary:', err);
    res.status(500).json({ error: 'Failed to get dashboard summary' });
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
        COALESCE(p.name, p.title) AS name,
        (CASE WHEN array_length(p.image_urls, 1) > 0 THEN p.image_urls[1] ELSE NULL END) AS image,
        p.description,
        p.category
      FROM cart_items ci
      JOIN carts c ON ci.cart_id = c.cart_id
      LEFT JOIN products p ON ci.product_id = p.id
      WHERE c.customer_id = $1
        AND c.is_active = TRUE
      ORDER BY ci.created_at DESC
      `,
      [normalizedUserId]
    );

    res.json({ cart: result.rows });
  } catch (err) {
    console.error('CRITICAL: Error fetching cart for user:', userId);
    console.error('Stack:', err.stack);
    console.error('Details:', err.message);
    res.status(500).json({ error: 'Failed to fetch cart', details: err.message, stack: err.stack });
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
  const { customer_id: raw_customer_id, product_id: raw_product_id, variant_id, quantity } = req.body;
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
          AND (ci.variant_id = $4 OR ($4 IS NULL AND ci.variant_id IS NULL))
          AND c.is_active = TRUE
        RETURNING ci.*
        `,
      [quantity, customer_id, product_id, variant_id || null]
    );

    if (result.rows.length === 0) {
      // Return 200 even if 0 rows updated to make the operation idempotent
      return res.json({ message: 'Item already removed or not found' });
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
// REMOVE FROM CART
app.delete('/api/cart/:customerId/:productId', async (req, res) => {
  const { customerId, productId } = req.params;
  const { variantId } = req.query;

  console.log(`[API] DELETE /api/cart - Customer: ${customerId}, Product: ${productId}, Variant: ${variantId || 'none'}`);

  const normalizedUserId = normalizeCustomerId(customerId);
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
      AND (product_id = $2 OR product_id IN (SELECT product_id::text FROM products WHERE id = $2))
      AND (variant_id = $3 OR ($3 IS NULL AND variant_id IS NULL))
      RETURNING *
      `,
      [normalizedUserId, normalizedProductId, variantId || null]
    );

    if (result.rows.length === 0) {
      console.log(`[API] Delete: No matching item found for ${productId} in cart of ${customerId}`);
      return res.json({ success: true, message: 'Item already removed or not found' });
    }

    console.log(`[API] Successfully removed ${productId} from cart of ${customerId}`);
    res.json({ success: true, message: 'Item removed from cart' });
  } catch (err) {
    console.error('[API] Error removing from cart:', err);
    res.status(500).json({ success: false, error: 'Failed to remove from cart', details: err.message });
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
  const { customer_id: raw_customer_id, product_id: raw_product_id, variant_id, name, price, image, description, category } = req.body;
  const customer_id = normalizeCustomerId(raw_customer_id);
  const product_id = normalizeProductId(raw_product_id);
  try {
    const result = await pool.query(
      `
      INSERT INTO wishlist_page (customer_id, product_id, variant_id, name, price, image, description, category)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (customer_id, product_id, variant_id) DO NOTHING
      RETURNING *
      `,
      [customer_id, product_id, variant_id || null, name, price, image, description, category]
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
  const { variantId } = req.query; // Optional variantId
  const normalizedUserId = normalizeCustomerId(userId);
  const normalizedProductId = normalizeProductId(productId);
  try {
    await pool.query(
      'DELETE FROM wishlist_page WHERE customer_id = $1 AND product_id = $2 AND (variant_id = $3 OR ($3 IS NULL AND variant_id IS NULL))',
      [normalizedUserId, normalizedProductId, variantId || null]
    );
    res.json({ message: 'Item removed from wishlist' });
  } catch (err) {
    console.error('Error removing from wishlist:', err);
    res.status(500).json({ error: 'Failed to remove from wishlist', details: err.message });
  }
});

// ==========================================
// ADMIN DASHBOARD NEW APIs
// ==========================================

// Helper to ensure expenses table exists
const initFinanceSchema = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id SERIAL PRIMARY KEY,
        category TEXT,
        amount DECIMAL(12,2),
        description TEXT,
        date DATE DEFAULT CURRENT_DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } catch (err) {
    console.error('Error initializing finance schema:', err);
  }
};
initFinanceSchema();

// Sync finance data helper
const syncFinanceData = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Daily Finances
    await client.query(`
      INSERT INTO daily_finances (seller_id, date, total_revenue, platform_commission, net_seller_earnings)
      SELECT 
        seller_id, 
        DATE(ordered_at) as date, 
        SUM(total_amount) as total_revenue,
        SUM(total_amount) * 0.10 as platform_commission,
        SUM(total_amount) * 0.90 as net_seller_earnings
      FROM orders
      WHERE payment_status = 'paid'
      GROUP BY seller_id, DATE(ordered_at)
      ON CONFLICT ON CONSTRAINT unique_seller_date DO UPDATE SET
        total_revenue = EXCLUDED.total_revenue,
        platform_commission = EXCLUDED.platform_commission,
        net_seller_earnings = EXCLUDED.net_seller_earnings,
        created_at = CURRENT_TIMESTAMP
    `);

    // 1.1 Weekly Finances
    await client.query(`
      INSERT INTO weekly_finances (seller_id, week_number, year, total_revenue, platform_commission, net_seller_earnings)
      SELECT 
        seller_id, 
        EXTRACT(WEEK FROM date) as week_number,
        EXTRACT(YEAR FROM date) as year,
        SUM(total_revenue) as total_revenue,
        SUM(platform_commission) as platform_commission,
        SUM(net_seller_earnings) as net_seller_earnings
      FROM daily_finances
      GROUP BY seller_id, year, week_number
      ON CONFLICT ON CONSTRAINT unique_seller_week DO UPDATE SET
        total_revenue = EXCLUDED.total_revenue,
        platform_commission = EXCLUDED.platform_commission,
        net_seller_earnings = EXCLUDED.net_seller_earnings,
        created_at = CURRENT_TIMESTAMP
    `);

    // 2. Monthly Finances
    await client.query(`
      INSERT INTO monthly_finances (seller_id, month_number, year, total_revenue, platform_commission, net_seller_earnings)
      SELECT 
        seller_id, 
        EXTRACT(MONTH FROM date) as month_number,
        EXTRACT(YEAR FROM date) as year,
        SUM(total_revenue) as total_revenue,
        SUM(platform_commission) as platform_commission,
        SUM(net_seller_earnings) as net_seller_earnings
      FROM daily_finances
      GROUP BY seller_id, year, month_number
      ON CONFLICT ON CONSTRAINT unique_seller_month DO UPDATE SET
        total_revenue = EXCLUDED.total_revenue,
        platform_commission = EXCLUDED.platform_commission,
        net_seller_earnings = EXCLUDED.net_seller_earnings,
        created_at = CURRENT_TIMESTAMP
    `);

    // 3. Quarterly Finances
    await client.query(`
      INSERT INTO quarterly_finances (seller_id, quarter_number, year, total_revenue, platform_commission, net_seller_earnings)
      SELECT 
        seller_id, 
        EXTRACT(QUARTER FROM DATE(year || '-' || month_number || '-01')) as quarter_number,
        year,
        SUM(total_revenue) as total_revenue,
        SUM(platform_commission) as platform_commission,
        SUM(net_seller_earnings) as net_seller_earnings
      FROM monthly_finances
      GROUP BY seller_id, year, quarter_number
      ON CONFLICT ON CONSTRAINT unique_seller_quarter DO UPDATE SET
        total_revenue = EXCLUDED.total_revenue,
        platform_commission = EXCLUDED.platform_commission,
        net_seller_earnings = EXCLUDED.net_seller_earnings,
        created_at = CURRENT_TIMESTAMP
    `);

    // 4. Half Yearly Finances
    await client.query(`
      INSERT INTO half_yearly_finances (seller_id, half_number, year, total_revenue, platform_commission, net_seller_earnings)
      SELECT 
        seller_id, 
        CASE WHEN quarter_number <= 2 THEN 1 ELSE 2 END as half_number,
        year,
        SUM(total_revenue) as total_revenue,
        SUM(platform_commission) as platform_commission,
        SUM(net_seller_earnings) as net_seller_earnings
      FROM quarterly_finances
      GROUP BY seller_id, year, half_number
      ON CONFLICT ON CONSTRAINT unique_seller_half DO UPDATE SET
        total_revenue = EXCLUDED.total_revenue,
        platform_commission = EXCLUDED.platform_commission,
        net_seller_earnings = EXCLUDED.net_seller_earnings,
        created_at = CURRENT_TIMESTAMP
    `);

    // 5. Annual Finances
    await client.query(`
      INSERT INTO annual_finances (seller_id, year, total_revenue, platform_commission, net_seller_earnings)
      SELECT 
        seller_id, 
        year,
        SUM(total_revenue) as total_revenue,
        SUM(platform_commission) as platform_commission,
        SUM(net_seller_earnings) as net_seller_earnings
      FROM half_yearly_finances
      GROUP BY seller_id, year
      ON CONFLICT ON CONSTRAINT unique_seller_annual DO UPDATE SET
        total_revenue = EXCLUDED.total_revenue,
        platform_commission = EXCLUDED.platform_commission,
        net_seller_earnings = EXCLUDED.net_seller_earnings,
        created_at = CURRENT_TIMESTAMP
    `);

    await client.query('COMMIT');
    return true;
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error syncing finance data:', err);
    throw err;
  } finally {
    client.release();
  }
};

// 1. PAYMENTS
app.get('/api/admin/payments', async (req, res) => {
  try {
    const query = `
      SELECT p.*, o.id as order_id_display, c.name as customer_name
      FROM payments p
      LEFT JOIN orders o ON p.order_id = o.id
      LEFT JOIN customer c ON p.customer_id = c.customer_id
      ORDER BY p.created_at DESC
    `;
    const result = await pool.query(query);
    res.json({ payments: result.rows });
  } catch (err) {
    console.error('Error fetching admin payments:', err);
    res.status(500).json({ error: 'Failed to fetch payments', details: err.message });
  }
});

app.put('/api/admin/payments/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const result = await pool.query(
      'UPDATE payments SET payment_status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Payment not found' });
    res.json({ payment: result.rows[0], message: 'Payment status updated' });
  } catch (err) {
    console.error('Error updating payment status:', err);
    res.status(500).json({ error: 'Failed to update payment status', details: err.message });
  }
});

// 2. RETURNS
app.get('/api/admin/returns', async (req, res) => {
  try {
    const query = `
      SELECT r.*, c.name as customer_name, o.id as order_id_display
      FROM return_requests r
      LEFT JOIN customer c ON r.customer_id = c.customer_id
      LEFT JOIN orders o ON r.order_id = o.id
      ORDER BY r.requested_at DESC
    `;
    const result = await pool.query(query);
    res.json({ returns: result.rows });
  } catch (err) {
    console.error('Error fetching admin returns:', err);
    res.status(500).json({ error: 'Failed to fetch returns', details: err.message });
  }
});

app.put('/api/admin/returns/:id', async (req, res) => {
  const { id } = req.params;
  const { status, note, admin_id } = req.body;
  try {
    const result = await pool.query(
      `UPDATE return_requests 
       SET refund_status = $1, resolution_note = $2, resolved_by_admin_id = $3, resolved_at = CURRENT_TIMESTAMP
       WHERE return_request_id = $4 RETURNING *`,
      [status, note, admin_id || null, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Return request not found' });
    res.json({ returnRequest: result.rows[0], message: 'Return request updated' });
  } catch (err) {
    console.error('Error updating return request:', err);
    res.status(500).json({ error: 'Failed to update return request', details: err.message });
  }
});

// 3. VENDORS
app.get('/api/admin/vendors', async (req, res) => {
  try {
    const query = `
      SELECT s.*, 
             s.store_name,
             s.phone as contact_number,
             'Retail' as business_type,
             (SELECT COUNT(*) FROM products p WHERE p.seller_id = s.seller_id) as total_products
      FROM sellers s
      LEFT JOIN seller_profile sp ON s.seller_id = sp.seller_id
      ORDER BY s.created_at DESC
    `;
    const result = await pool.query(query);
    res.json({ vendors: result.rows });
  } catch (err) {
    console.error('Error fetching vendors:', err);
    res.status(500).json({ error: 'Failed to fetch vendors', details: err.message });
  }
});

app.put('/api/admin/vendors/:id/status', async (req, res) => {
  const { id } = req.params;
  const { is_verified, status } = req.body;
  try {
    // Assuming sellers table has an is_verified or status column. Adjust if different.
    // If we only have name, email, password_hash etc, we might need to alter it or use seller_profile.
    // Let's assume we update seller_profile verification status or sellers active status
    const result = await pool.query(
      'UPDATE sellers SET updated_at = CURRENT_TIMESTAMP WHERE seller_id = $1 RETURNING *',
      [id]
    );
    res.json({ vendor: result.rows[0], message: 'Vendor status updated' });
  } catch (err) {
    console.error('Error updating vendor:', err);
    res.status(500).json({ error: 'Failed to update vendor', details: err.message });
  }
});

// 4. FINANCE
app.get('/api/admin/finance', async (req, res) => {
  try {
    const statsRes = await pool.query(`
      SELECT 
        COALESCE(SUM(total_amount), 0) as total_revenue,
        COALESCE(SUM(tax_amount), 0) as total_tax,
        COALESCE(SUM(shipping_charge), 0) as total_shipping
      FROM orders 
      WHERE payment_status = 'paid'
    `);

    const expensesRes = await pool.query('SELECT COALESCE(SUM(amount), 0) as total_expenses FROM expenses');

    // Monthly breakdown for chart (Last 6 months)
    const monthlyRes = await pool.query(`
      SELECT 
        DATE_TRUNC('month', ordered_at) as month_date, 
        SUM(total_amount) as revenue
      FROM orders 
      WHERE payment_status = 'paid' AND ordered_at >= NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', ordered_at)
      ORDER BY month_date ASC
    `);

    // Pad last 6 months with 0s
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthLabel = d.toLocaleString('default', { month: 'short' });
      const year = d.getFullYear();
      const monthNum = d.getMonth();

      const dbMatch = monthlyRes.rows.find(r => {
        const rowDate = new Date(r.month_date);
        return rowDate.getMonth() === monthNum && rowDate.getFullYear() === year;
      });

      last6Months.push({
        month: monthLabel,
        revenue: dbMatch ? parseFloat(dbMatch.revenue) : 0,
        target: 15000 // Placeholder target as seen in dashboard
      });
    }

    res.json({
      finance: {
        totalRevenue: parseFloat(statsRes.rows[0].total_revenue),
        totalTax: parseFloat(statsRes.rows[0].total_tax),
        totalShipping: parseFloat(statsRes.rows[0].total_shipping),
        totalExpenses: parseFloat(expensesRes.rows[0].total_expenses),
        netProfit: parseFloat(statsRes.rows[0].total_revenue) - parseFloat(expensesRes.rows[0].total_expenses),
        monthlyRevenue: last6Months
      }
    });
  } catch (err) {
    console.error('Error fetching finance data:', err);
    res.status(500).json({ error: 'Failed to fetch finance data', details: err.message });
  }
});

// NEW: SYNC FINANCE DATA
app.post('/api/admin/finance/sync', async (req, res) => {
  try {
    await syncFinanceData();
    res.json({ success: true, message: 'Finance data synchronized successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Sync failed', details: err.message });
  }
});

// NEW: GET FINANCE STATS BY PERIOD
app.get('/api/admin/finance/stats', async (req, res) => {
  const { period = 'monthly', seller_id } = req.query;
  try {
    let query = '';
    let table = '';

    switch (period) {
      case 'annual': table = 'annual_finances'; break;
      case 'half-yearly': table = 'half_yearly_finances'; break;
      case 'quarterly': table = 'quarterly_finances'; break;
      case 'monthly': table = 'monthly_finances'; break;
      case 'weekly': table = 'weekly_finances'; break;
      default: table = 'monthly_finances'; break;
    }

    if (seller_id) {
      const orderCol = period === 'weekly' ? 'week_number' : period === 'monthly' ? 'month_number' : period === 'quarterly' ? 'quarter_number' : period === 'half-yearly' ? 'half_number' : 'year';
      query = `SELECT * FROM ${table} WHERE seller_id = $1 ORDER BY year DESC, ${orderCol} DESC`;
      const result = await pool.query(query, [seller_id]);
      res.json(result.rows);
    } else {
      // Platform wide aggregation from these tables
      if (period === 'weekly') {
        query = `
          SELECT year, week_number, SUM(total_revenue) as revenue, SUM(platform_commission) as commission, SUM(net_seller_earnings) as earnings 
          FROM weekly_finances 
          GROUP BY year, week_number 
          ORDER BY year DESC, week_number DESC 
          LIMIT 12
        `;
      } else if (period === 'monthly') {
        query = `
          SELECT year, month_number, SUM(total_revenue) as revenue, SUM(platform_commission) as commission, SUM(net_seller_earnings) as earnings 
          FROM monthly_finances 
          GROUP BY year, month_number 
          ORDER BY year DESC, month_number DESC 
          LIMIT 12
        `;
      } else if (period === 'quarterly') {
        query = `
          SELECT year, quarter_number, SUM(total_revenue) as revenue, SUM(platform_commission) as commission, SUM(net_seller_earnings) as earnings 
          FROM quarterly_finances 
          GROUP BY year, quarter_number 
          ORDER BY year DESC, quarter_number DESC
        `;
      } else if (period === 'half-yearly') {
        query = `
          SELECT year, half_number, SUM(total_revenue) as revenue, SUM(platform_commission) as commission, SUM(net_seller_earnings) as earnings 
          FROM half_yearly_finances 
          GROUP BY year, half_number 
          ORDER BY year DESC, half_number DESC
        `;
      } else {
        query = `
          SELECT year, SUM(total_revenue) as revenue, SUM(platform_commission) as commission, SUM(net_seller_earnings) as earnings 
          FROM annual_finances 
          GROUP BY year 
          ORDER BY year DESC
        `;
      }
      const result = await pool.query(query);
      res.json(result.rows);
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch period stats', details: err.message });
  }
});

// Alias for specific request
app.get('/api/finance/summary', async (req, res) => {
  try {
    const statsRes = await pool.query(`
      SELECT 
        COALESCE(SUM(total_amount), 0) as total_revenue,
        COALESCE(SUM(tax_amount), 0) as total_tax,
        COALESCE(SUM(shipping_charge), 0) as total_shipping
      FROM orders 
      WHERE payment_status = 'paid'
    `);
    const expensesRes = await pool.query('SELECT COALESCE(SUM(amount), 0) as total_expenses FROM expenses');

    const revenue = parseFloat(statsRes.rows[0].total_revenue);
    const expenses = parseFloat(expensesRes.rows[0].total_expenses);

    res.json({
      totalRevenue: revenue,
      totalTax: parseFloat(statsRes.rows[0].total_tax),
      totalShipping: parseFloat(statsRes.rows[0].total_shipping),
      totalExpenses: expenses,
      netProfit: revenue - expenses
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/finance/monthly-revenue', async (req, res) => {
  try {
    const monthlyRes = await pool.query(`
      SELECT 
        DATE_TRUNC('month', ordered_at) as month_date, 
        SUM(total_amount) as revenue
      FROM orders 
      WHERE payment_status = 'paid' AND ordered_at >= NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', ordered_at)
      ORDER BY month_date ASC
    `);

    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthLabel = d.toLocaleString('default', { month: 'short' });
      const year = d.getFullYear();
      const monthNum = d.getMonth();

      const dbMatch = monthlyRes.rows.find(r => {
        const rowDate = new Date(r.month_date);
        return rowDate.getMonth() === monthNum && rowDate.getFullYear() === year;
      });

      last6Months.push({
        month: monthLabel,
        revenue: dbMatch ? parseFloat(dbMatch.revenue) : 0,
        target: 15000
      });
    }
    res.json(last6Months);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/finance/payments-stats', async (req, res) => {
  try {
    const monthlyRes = await pool.query(`
      SELECT 
        DATE_TRUNC('month', created_at) as month_date, 
        COUNT(*) as count,
        SUM(amount) as total
      FROM payments 
      WHERE payment_status = 'paid' AND created_at >= NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month_date ASC
    `);

    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthLabel = d.toLocaleString('default', { month: 'short' });
      const year = d.getFullYear();
      const monthNum = d.getMonth();

      const dbMatch = monthlyRes.rows.find(r => {
        const rowDate = new Date(r.month_date);
        return rowDate.getMonth() === monthNum && rowDate.getFullYear() === year;
      });

      last6Months.push({
        month: monthLabel,
        payments: dbMatch ? parseInt(dbMatch.count) : 0,
        amount: dbMatch ? parseFloat(dbMatch.total) : 0
      });
    }
    res.json(last6Months);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. SALES REPORTS
app.get('/api/admin/sales', async (req, res) => {
  try {
    const totalOrdersRes = await pool.query(`
      SELECT COUNT(*) as total_orders, COALESCE(SUM(total_amount), 0) as total_sales 
      FROM orders 
      WHERE payment_status = 'paid'
    `);

    // Top selling categories
    const topCategoriesRes = await pool.query(`
      SELECT p.category, SUM(CAST(item->>'quantity' AS INTEGER)) as items_sold
      FROM orders o, jsonb_array_elements(o.items) as item
      JOIN products p ON (item->>'id') = p.id
      WHERE o.payment_status = 'paid'
      GROUP BY p.category
      ORDER BY items_sold DESC
      LIMIT 5
    `);

    // Recent 7 days sales padded
    const dailySalesRes = await pool.query(`
      SELECT DATE(ordered_at) as order_date, SUM(total_amount) as sales, COUNT(id) as orders_count
      FROM orders
      WHERE ordered_at >= CURRENT_DATE - INTERVAL '6 days' AND payment_status = 'paid'
      GROUP BY DATE(ordered_at)
      ORDER BY order_date ASC
    `);

    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('default', { weekday: 'short' });

      const dbMatch = dailySalesRes.rows.find(r => {
        const rowDate = new Date(r.order_date).toISOString().split('T')[0];
        return rowDate === dateStr;
      });

      last7Days.push({
        date: dayLabel,
        sales: dbMatch ? parseFloat(dbMatch.sales) : 0,
        orders: dbMatch ? parseInt(dbMatch.orders_count) : 0
      });
    }

    res.json({
      sales: {
        totalOrders: parseInt(totalOrdersRes.rows[0].total_orders),
        totalSales: parseFloat(totalOrdersRes.rows[0].total_sales),
        topCategories: topCategoriesRes.rows.map(r => ({
          category: r.category || 'Unknown',
          sold: parseInt(r.items_sold)
        })),
        dailyTrends: last7Days
      }
    });
  } catch (err) {
    console.error('Error fetching sales report:', err);
    res.status(500).json({ error: 'Failed to fetch sales report', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});