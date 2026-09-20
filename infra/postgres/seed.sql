-- Seed Data untuk POS Kafe (pos_db)

-- 1. Merchant
INSERT INTO merchants (id, owner_user_id, brand_name, concept)
VALUES ('MCH-01', 'USR-OWNER-01', 'Kopi Ruang Temu', 'Specialty Coffee & Eatery')
ON CONFLICT (id) DO NOTHING;

-- 2. Branches
INSERT INTO branches (id, merchant_id, name, address, phone, is_main, tables_count)
VALUES 
    ('01-MAIN', 'MCH-01', 'Cabang 01: Enggal (Pusat)', 'Jl. Raden Intan No. 45, Enggal, Bandar Lampung', '0812-7890-0001', TRUE, 14),
    ('02-KEMILING', 'MCH-01', 'Cabang 02: Kemiling Outlet', 'Jl. Imam Bonjol No. 88, Kemiling, Bandar Lampung', '0812-7890-0002', FALSE, 8)
ON CONFLICT (id) DO NOTHING;

-- 3. Staff Members (PIN: 123456 -> bcrypt hash: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy)
INSERT INTO staff_members (id, merchant_id, branch_id, name, email, pin_hash, role, is_active)
VALUES 
    ('STF-01', 'MCH-01', '01-MAIN', 'Ahmad Fauzi', 'ahmad@kopitemu.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'CASHIER', TRUE),
    ('STF-02', 'MCH-01', '01-MAIN', 'Citra Dewi', 'citra@kopitemu.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'CASHIER', TRUE),
    ('STF-03', 'MCH-01', '01-MAIN', 'Budi Santoso', 'budi@kopitemu.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'BARISTA', TRUE)
ON CONFLICT (branch_id, email) DO NOTHING;

-- 4. Bank Accounts
INSERT INTO bank_accounts (id, merchant_id, branch_id, bank_name, account_number, holder_name, balance, is_primary)
VALUES 
    ('BANK-01', 'MCH-01', '01-MAIN', 'Bank BCA', '890-552-1920', 'PT Kopi Ruang Temu', 42500000, TRUE),
    ('BANK-02', 'MCH-01', '01-MAIN', 'Bank BNI', '028-119-4821', 'Kopi Ruang Temu Rek 2', 18200000, FALSE),
    ('BANK-03', 'MCH-01', '02-KEMILING', 'Bank Mandiri', '114-00-982145-2', 'Operasional Outlet Kemiling', 25800000, FALSE)
ON CONFLICT (id) DO NOTHING;

-- 5. Ingredients & Branch Stocks
INSERT INTO ingredients (id, merchant_id, name, unit, cost_per_unit, min_alert_threshold)
VALUES 
    ('MAT-01', 'MCH-01', 'Biji Kopi Arabika Ulubelu', 'kg', 140000, 8),
    ('MAT-02', 'MCH-01', 'Susu Fresh Milk Pasteurisasi', 'liter', 21000, 20),
    ('MAT-03', 'MCH-01', 'Paper Cup Cold 16oz + Tutup', 'pcs', 850, 250),
    ('MAT-04', 'MCH-01', 'Gula Aren Cair Organik', 'liter', 35000, 10)
ON CONFLICT (id) DO NOTHING;

INSERT INTO branch_stocks (id, branch_id, ingredient_id, current_quantity)
VALUES 
    ('STK-01', '01-MAIN', 'MAT-01', 3.5),
    ('STK-02', '01-MAIN', 'MAT-02', 6.0),
    ('STK-03', '01-MAIN', 'MAT-03', 80.0),
    ('STK-04', '01-MAIN', 'MAT-04', 18.0)
ON CONFLICT (branch_id, ingredient_id) DO UPDATE SET current_quantity = EXCLUDED.current_quantity;

-- 6. Promotions
INSERT INTO promotions (id, merchant_id, code, title, discount_type, discount_value, min_spend, quota_total, quota_used, is_active, valid_until)
VALUES 
    ('PRM-01', 'MCH-01', 'WESELHEMAT', 'Potongan Rp 10.000 QRIS Wesel Aja', 'FIXED', 10000, 50000, 50, 31, TRUE, '2026-09-28'),
    ('PRM-02', 'MCH-01', 'HAPPYCOFFEE', 'Happy Hour Coffee 20%', 'PERCENTAGE', 20, 35000, 100, 43, TRUE, '2026-09-30'),
    ('PRM-03', 'MCH-01', 'BOGODONUT', 'Beli 1 Kopi Susu Gratis Donat', 'BUY1GET1', 1, 25000, 30, 18, FALSE, '2026-09-25')
ON CONFLICT (id) DO NOTHING;

-- 7. Customers (CRM)
INSERT INTO customers (id, merchant_id, name, email, phone, tier, loyalty_points, total_spent, can_order_web)
VALUES 
    ('CUST-01', 'MCH-01', 'Reza Pratama', 'reza.pratama@gmail.com', '0812-7890-1234', 'GOLD', 450, 1140000, TRUE),
    ('CUST-02', 'MCH-01', 'Nadya Safitri', 'nadya.s@yahoo.com', '0857-8912-3456', 'SILVER', 210, 570000, TRUE),
    ('CUST-03', 'MCH-01', 'Doni Iskandar', 'doni.iskandar@outlook.com', '0821-3456-7890', 'BRONZE', 80, 180000, FALSE)
ON CONFLICT (id) DO NOTHING;

-- 8. Equipment Assets
INSERT INTO equipment_assets (id, merchant_id, branch_id, asset_code, name, category, purchase_cost, purchase_date, condition_status)
VALUES 
    ('AST-01', 'MCH-01', '01-MAIN', 'EQ-LMR-01', 'La Marzocco Linea Classic 2-Group', 'EQUIPMENT', 145000000, '2024-03-15', 'EXCELLENT'),
    ('AST-02', 'MCH-01', '01-MAIN', 'EQ-MHL-02', 'Grinder Mahlkonig EK43', 'EQUIPMENT', 48000000, '2024-04-20', 'GOOD'),
    ('AST-03', 'MCH-01', '01-MAIN', 'EQ-TAB-01', 'Samsung Galaxy Tab A9 (POS Kasir 1)', 'IT_HARDWARE', 3200000, '2025-01-10', 'EXCELLENT')
ON CONFLICT (id) DO NOTHING;

-- 9. Parking Reports
INSERT INTO parking_reports (id, merchant_id, branch_id, period_label, coordinator_name, gross_amount, store_share, keeper_share, motorcycle_count, car_count, status)
VALUES 
    ('PRK-01', 'MCH-01', '01-MAIN', '08 Sep - 14 Sep 2026', 'Pak Sukirno (Koordinator Parkir)', 4390000, 2634000, 1756000, 1420, 310, 'SETTLED'),
    ('PRK-02', 'MCH-01', '01-MAIN', '15 Sep - 20 Sep 2026 (Berjalan)', 'Pak Sukirno (Koordinator Parkir)', 3685000, 2211000, 1474000, 1180, 265, 'ONGOING')
ON CONFLICT (id) DO NOTHING;

-- 10. SOP
INSERT INTO standard_operating_procedures (id, merchant_id, title, category, role_target, steps)
VALUES 
    ('SOP-01', 'MCH-01', 'SOP Pembukaan Kafe (Opening 06:30)', 'OPENING', 'BARISTA', '[{"id":"st-1","text":"Nyalakan mesin espresso La Marzocco & tunggu pemanasan boiler hingga 9 bar stabil","isCompleted":true},{"id":"st-2","text":"Kalibrasi grinder dengan dose 18g yield 36g waktu ekstraksi 26-28 detik","isCompleted":true},{"id":"st-3","text":"Siapkan es batu kristal higienis dan periksa stok susu fresh milk di chiller","isCompleted":true}]'::jsonb),
    ('SOP-02', 'MCH-01', 'SOP Tutup Kasir & Rekonsiliasi Kas (Closing 23:00)', 'CLOSING', 'CASHIER', '[{"id":"st-4","text":"Cetak struk X/Z report harian dari tablet POS","isCompleted":false},{"id":"st-5","text":"Hitung uang fisik di laci kasir dan pisahkan modal kas float Rp 200.000","isCompleted":false},{"id":"st-6","text":"Setor uang fisik ke brankas atau rekening utama BCA toko","isCompleted":false}]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 11. Audit Logs
INSERT INTO audit_logs (id, merchant_id, branch_id, staff_id, staff_name, action, ip_address, device, status)
VALUES 
    ('LOG-01', 'MCH-01', '01-MAIN', 'STF-01', 'Ahmad Fauzi', 'Login Kasir Tablet (Turnstile Verified)', '182.1.204.88', 'Samsung Tab A9 • Android', 'SUCCESS'),
    ('LOG-02', 'MCH-01', '01-MAIN', 'STF-03', 'Budi Santoso', 'Presensi Masuk (Terlambat 14 menit)', '182.1.204.88', 'Xiaomi Note 13 • Android', 'WARNING'),
    ('LOG-03', 'MCH-01', '01-MAIN', 'STF-01', 'Ahmad Fauzi', 'Pembukaan Shift 1 (Modal Kas Rp 200.000)', '182.1.204.88', 'Samsung Tab A9 • POS App', 'SUCCESS')
ON CONFLICT (id) DO NOTHING;
