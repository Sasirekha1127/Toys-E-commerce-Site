-- ToyStore Database Initialization Script

-- 1. Organizations/Users
CREATE SEQUENCE IF NOT EXISTS customer_id_seq START WITH 1;
CREATE SEQUENCE IF NOT EXISTS seller_id_seq START WITH 1;

CREATE TABLE IF NOT EXISTS customer (
    customer_id VARCHAR(20) PRIMARY KEY DEFAULT CONCAT('C', LPAD(NEXTVAL('customer_id_seq')::text, 3, '0')),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS profile_page (
    id SERIAL PRIMARY KEY,
    customer_id VARCHAR(20) UNIQUE REFERENCES customer(customer_id) ON DELETE CASCADE,
    phone VARCHAR(20),
    address TEXT,
    bio TEXT,
    birthdate DATE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sellers (
    seller_id VARCHAR(20) PRIMARY KEY DEFAULT CONCAT('S', LPAD(NEXTVAL('seller_id_seq')::text, 3, '0')),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    store_name VARCHAR(255),
    onboarding_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS seller_profile (
    id SERIAL PRIMARY KEY,
    seller_id VARCHAR(20) UNIQUE REFERENCES sellers(seller_id) ON DELETE CASCADE,
    phone VARCHAR(20),
    location TEXT,
    bio TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Products
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    seller_id VARCHAR(20),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock_quantity INTEGER DEFAULT 0,
    category VARCHAR(100),
    image_urls TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS seller_products (
    id SERIAL PRIMARY KEY,
    seller_id VARCHAR(20) REFERENCES sellers(seller_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock_quantity INTEGER DEFAULT 0,
    category VARCHAR(100),
    image_urls TEXT[],
    mrp DECIMAL(10, 2),
    sku VARCHAR(100),
    brand VARCHAR(100),
    age_group VARCHAR(50),
    material VARCHAR(100),
    featured BOOLEAN DEFAULT FALSE,
    product_status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Shopping
CREATE TABLE IF NOT EXISTS carts (
    cart_id SERIAL PRIMARY KEY,
    customer_id VARCHAR(20) UNIQUE REFERENCES customer(customer_id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cart_items (
    cart_items_id SERIAL PRIMARY KEY,
    cart_id INTEGER REFERENCES carts(cart_id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL,
    unit_price NUMERIC(10, 2),
    quantity INTEGER DEFAULT 1,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(cart_id, product_id)
);

CREATE TABLE IF NOT EXISTS wishlist_page (
    id SERIAL PRIMARY KEY,
    customer_id VARCHAR(20) NOT NULL REFERENCES customer(customer_id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL,
    name VARCHAR(255),
    price DECIMAL(10, 2),
    image TEXT,
    description TEXT,
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(customer_id, product_id)
);

-- 4. Orders & Payments
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    customer_id VARCHAR(20) REFERENCES customer(customer_id) ON DELETE SET NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    shipping_address TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    payment_status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER, 
    quantity INTEGER NOT NULL,
    price_at_time_of_purchase DECIMAL(10, 2) NOT NULL
);

-- 5. Marketing
CREATE TABLE IF NOT EXISTS discounts (
    id SERIAL PRIMARY KEY,
    seller_id VARCHAR(20) REFERENCES sellers(seller_id) ON DELETE CASCADE,
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_type VARCHAR(20), -- 'percentage' or 'fixed'
    discount_value DECIMAL(10, 2) NOT NULL,
    valid_from TIMESTAMP,
    valid_until TIMESTAMP,
    usage_limit INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
