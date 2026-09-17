-- Inisialisasi Skema Database POS Kafe (PostgreSQL 16)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabel Usaha / Merchant (Owner Kafe)
CREATE TABLE IF NOT EXISTS merchants (
    id VARCHAR(26) PRIMARY KEY, -- ULID
    owner_user_id VARCHAR(100) NOT NULL,
    brand_name VARCHAR(150) NOT NULL,
    concept VARCHAR(100) DEFAULT 'Coffee Shop & Cafe',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabel Cabang (Multi-Cabang & Flagship Main Branch)
CREATE TABLE IF NOT EXISTS branches (
    id VARCHAR(26) PRIMARY KEY, -- ULID
    merchant_id VARCHAR(26) NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(30),
    is_main BOOLEAN DEFAULT FALSE,
    tables_count INT DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabel Karyawan & Kasir (dengan Kode Unik 6-Digit PIN)
CREATE TABLE IF NOT EXISTS staff_members (
    id VARCHAR(26) PRIMARY KEY, -- ULID
    merchant_id VARCHAR(26) NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    branch_id VARCHAR(26) NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    pin_hash VARCHAR(255) NOT NULL, -- bcrypt hash dari PIN 6-digit
    role VARCHAR(30) NOT NULL DEFAULT 'CASHIER', -- 'CASHIER', 'BARISTA', 'KITCHEN', 'BRANCH_MANAGER'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(branch_id, email)
);

-- 4. Tabel Modal Investasi Awal (CapEx & Kas Float)
CREATE TABLE IF NOT EXISTS investments (
    id VARCHAR(26) PRIMARY KEY, -- ULID
    merchant_id VARCHAR(26) NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    branch_id VARCHAR(26) REFERENCES branches(id) ON DELETE SET NULL,
    category VARCHAR(50) NOT NULL, -- 'TEMPAT', 'MESIN_BAR', 'RENOVASI', 'KAS_AWAL'
    item_name VARCHAR(200) NOT NULL,
    amount BIGINT NOT NULL, -- dalam satuan Rupiah
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tabel Shift Kasir (Buka Shift & Tutup Shift Rekonsiliasi)
CREATE TABLE IF NOT EXISTS cashier_shifts (
    id VARCHAR(26) PRIMARY KEY, -- ULID
    merchant_id VARCHAR(26) NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    branch_id VARCHAR(26) NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    staff_id VARCHAR(26) NOT NULL REFERENCES staff_members(id),
    cash_float_initial BIGINT NOT NULL DEFAULT 0, -- Kas modal awal laci
    total_cash_sales BIGINT DEFAULT 0,
    total_non_cash BIGINT DEFAULT 0,
    total_orders_count INT DEFAULT 0,
    actual_cash_end BIGINT, -- Uang fisik saat tutup kasir
    expected_cash_end BIGINT,
    cash_variance BIGINT DEFAULT 0, -- Selisih kas (actual - expected)
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN', -- 'OPEN' | 'CLOSED'
    opened_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP WITH TIME ZONE
);

-- 6. Tabel Pesanan (Orders)
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(26) PRIMARY KEY, -- ULID dari client mobile (offline-first)
    merchant_id VARCHAR(26) NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    branch_id VARCHAR(26) NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    shift_id VARCHAR(26) REFERENCES cashier_shifts(id),
    staff_id VARCHAR(26) REFERENCES staff_members(id),
    table_number VARCHAR(20),
    customer_name VARCHAR(100),
    subtotal BIGINT NOT NULL,
    tax_amount BIGINT DEFAULT 0,
    discount_amount BIGINT DEFAULT 0,
    total_amount BIGINT NOT NULL,
    payment_method VARCHAR(20) NOT NULL, -- 'CASH', 'QRIS', 'CARD'
    payment_status VARCHAR(20) NOT NULL DEFAULT 'PAID', -- 'PENDING', 'PAID', 'REFUNDED'
    status VARCHAR(20) NOT NULL DEFAULT 'COMPLETED', -- 'SUBMITTED', 'IN_PREPARATION', 'READY', 'COMPLETED', 'CANCELLED'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    synced_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Detail Item Pesanan
CREATE TABLE IF NOT EXISTS order_items (
    id VARCHAR(26) PRIMARY KEY,
    order_id VARCHAR(26) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id VARCHAR(100) NOT NULL,
    product_name VARCHAR(150) NOT NULL,
    quantity INT NOT NULL,
    unit_price BIGINT NOT NULL,
    subtotal BIGINT NOT NULL,
    notes TEXT
);

-- 8. Master Bahan Baku & Stok Cabang
CREATE TABLE IF NOT EXISTS ingredients (
    id VARCHAR(26) PRIMARY KEY,
    merchant_id VARCHAR(26) NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    unit VARCHAR(20) NOT NULL, -- 'GRAM', 'ML', 'PCS'
    cost_per_unit NUMERIC(12, 2) NOT NULL,
    min_alert_threshold NUMERIC(12, 2) DEFAULT 500
);

CREATE TABLE IF NOT EXISTS branch_stocks (
    id VARCHAR(26) PRIMARY KEY,
    branch_id VARCHAR(26) NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    ingredient_id VARCHAR(26) NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
    current_quantity NUMERIC(12, 2) NOT NULL DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(branch_id, ingredient_id)
);

-- 9. Transactional Outbox Table (RabbitMQ Event Publisher)
CREATE TABLE IF NOT EXISTS outbox_events (
    id VARCHAR(26) PRIMARY KEY,
    aggregate_type VARCHAR(50) NOT NULL,
    aggregate_id VARCHAR(26) NOT NULL,
    event_type VARCHAR(50) NOT NULL, -- 'order.created', 'stock.low_alert', 'shift.closed'
    payload JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING', -- 'PENDING', 'PUBLISHED', 'FAILED'
    retry_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP WITH TIME ZONE
);

-- Index Penting untuk Performa Tinggi
CREATE INDEX IF NOT EXISTS idx_orders_branch ON orders(branch_id, created_at);
CREATE INDEX IF NOT EXISTS idx_shifts_staff ON cashier_shifts(staff_id, status);
CREATE INDEX IF NOT EXISTS idx_outbox_pending ON outbox_events(status) WHERE status = 'PENDING';
