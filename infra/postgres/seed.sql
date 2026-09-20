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

-- ==========================================================
-- SEED DATA EDTECH CLASS OPERATIONS & SELF-SERVE ENROLLMENT
-- ==========================================================

-- 12. EdTech Programs
INSERT INTO edutech_programs (id, tenant_id, title, description, age_group, category, thumbnail_url, is_active)
VALUES 
    ('EDP-01', 'tenant-lampung-01', 'Logika & Koding Anak (Roblox & Scratch)', 'Membangun logika berpikir komputasional, algoritma loop, dan game development interaktif.', '7-12 Tahun (SD)', 'CODING', 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80', TRUE),
    ('EDP-02', 'tenant-lampung-01', 'Matematika Interaktif & Problem Solving', 'Mengubah konsep pecahan, geometri, dan aljabar menjadi teka-teki visual yang menyenangkan.', '8-14 Tahun (SD/SMP)', 'MATH', 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80', TRUE),
    ('EDP-03', 'tenant-lampung-01', 'Calistung Kreatif & Literasi Visual', 'Membaca, menulis, dan berhitung dengan dongeng petualangan untuk usia dini.', '4-6 Tahun (TK/PAUD)', 'CREATIVE', 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=600&q=80', TRUE),
    ('EDP-04', 'tenant-lampung-01', 'Ottodot Roblox Science & Galaxy Quests', 'Eksplorasi gravitasi, tata surya, dan sirkuit listrik dalam 200+ game sains 3D Roblox.', '7-13 Tahun (SD/SMP)', 'SCIENCE_ROBLOX', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80', TRUE)
ON CONFLICT (id) DO NOTHING;

-- 13. EdTech Classes
INSERT INTO edutech_classes (id, tenant_id, program_id, teacher_id, teacher_name, schedule_time, max_seats, booked_seats, price, session_link, status)
VALUES 
    ('EDC-01', 'tenant-lampung-01', 'EDP-01', 'TCH-01', 'Kak Fikri Ramadhan (Lead Instructor)', 'Sabtu & Minggu, 09:00 - 10:30 WIB', 10, 7, 350000, 'https://meet.google.com/abc-edtech-01', 'ACTIVE'),
    ('EDC-02', 'tenant-lampung-01', 'EDP-02', 'TCH-02', 'Kak Sarah Azhari (Math Specialist)', 'Selasa & Kamis, 16:00 - 17:30 WIB', 8, 6, 300000, 'https://meet.google.com/def-edtech-02', 'ACTIVE'),
    ('EDC-03', 'tenant-lampung-01', 'EDP-04', 'TCH-03', 'Coach Randy Pratama (Roblox Mentor)', 'Jumat, 15:30 - 17:00 WIB', 12, 4, 450000, 'https://meet.google.com/ghi-edtech-03', 'ACTIVE'),
    ('EDC-04', 'tenant-lampung-01', 'EDP-03', 'TCH-02', 'Kak Sarah Azhari (Early Childhood)', 'Rabu, 10:00 - 11:30 WIB', 6, 6, 250000, 'https://meet.google.com/jkl-edtech-04', 'FULL')
ON CONFLICT (id) DO NOTHING;

-- 14. EdTech Enrollments
INSERT INTO edutech_enrollments (id, tenant_id, class_id, student_id, student_name, parent_id, parent_name, parent_phone, status, payment_reference)
VALUES 
    ('EDE-01', 'tenant-lampung-01', 'EDC-01', 'STU-01', 'Kenzo Al-Ghifari (9 thn)', 'PAR-01', 'Budi Santoso', '0812-7890-1234', 'CONFIRMED', 'INV/2026/09/EDT-001'),
    ('EDE-02', 'tenant-lampung-01', 'EDC-02', 'STU-02', 'Alya Putri (11 thn)', 'PAR-02', 'Dewi Lestari', '0813-8899-0011', 'CONFIRMED', 'INV/2026/09/EDT-002'),
    ('EDE-03', 'tenant-lampung-01', 'EDC-03', 'STU-01', 'Kenzo Al-Ghifari (9 thn)', 'PAR-01', 'Budi Santoso', '0812-7890-1234', 'CONFIRMED', 'INV/2026/09/EDT-003')
ON CONFLICT (id) DO NOTHING;

-- 15. EdTech Homework Logs
INSERT INTO edutech_homework_logs (id, enrollment_id, title, score, teacher_feedback, completed_at)
VALUES 
    ('EDH-01', 'EDE-01', 'Misi Loop & Algoritma Labirin Roblox', 95, 'Kenzo sangat cepat memahami konsep perulangan bertingkat. Logika berpikirnya sangat rapi!', '2026-09-18 14:20:00+07'),
    ('EDH-02', 'EDE-02', 'Tantangan Pecahan Pizza 3D', 90, 'Alya mampu memvisualisasikan penjumlahan pecahan dengan sangat tepat.', '2026-09-19 11:15:00+07'),
    ('EDH-03', 'EDE-03', 'Quest Sirkuit Gravitasi Planet Mars', 98, 'Eksperimen gravitasi planet diselesaikan dengan skor sempurna dan kreatif.', '2026-09-20 10:00:00+07')
ON CONFLICT (id) DO NOTHING;

-- 16. EdTech Weekly Summaries (AI Progress Summarizer)
INSERT INTO edutech_weekly_summaries (id, student_id, week_number, ai_generated_summary, raw_teacher_notes, concepts_mastered)
VALUES 
    ('EDS-01', 'STU-01', 38, 
     '🌟 Evaluasi Mingguan Kenzo: Minggu ini Kenzo menunjukkan kemajuan luar biasa dalam sesi Koding & Sains Roblox! Ia berhasil memecahkan 3 tantangan algoritma perulangan dan antusias membantu teman sekelasnya. Kenzo sudah menguasai konsep dasar loop dan gaya gravitasi planet. Saran untuk orang tua: ajak Kenzo mencoba tantangan variabel skor mandiri selama 15 menit di rumah!', 
     'Kenzo sangat fokus, nilai kuis 95 dan 98, aktif bertanya saat simulasi loop Roblox.', 
     '["Looping Algorithms", "Planetary Gravity", "Sequential Logic"]'::jsonb),
    ('EDS-02', 'STU-02', 38, 
     '✨ Evaluasi Mingguan Alya: Alya menunjukkan perkembangan pesat pada topik pecahan interaktif! Ketelitiannya dalam menyelesaikan soal cerita bertema puzzle 3D patut diacungi jempol. Alya semakin percaya diri mengemukakan argumen matematika di hadapan teman-temannya.', 
     'Alya aktif di kelas, skor 90, mampu menyelesaikan soal pecahan pizza tanpa ragu.', 
     '["Fraction Addition", "Visual Geometry", "Mathematical Communication"]'::jsonb)
ON CONFLICT (id) DO NOTHING;

