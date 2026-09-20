package repositories

import (
	"context"
	"database/sql"
	"errors"
	"sync"
	"time"

	"github.com/lampungdevtech/backend/internal/core/domain"
	"github.com/lampungdevtech/backend/internal/core/ports"
)

type postgresOwnerRepo struct {
	db *sql.DB
	mu sync.RWMutex

	// In-memory fallback stores
	banks     map[string]*domain.BankAccount
	materials map[string]*domain.RawMaterial
	pos       map[string]*domain.PurchaseOrder
	shifts    map[string]*domain.StaffShift
	kpis      map[string]*domain.StaffKPI
	promos    map[string]*domain.Promotion
	customers map[string]*domain.CustomerMember
	assets    map[string]*domain.EquipmentAsset
	parking   map[string]*domain.ParkingReport
	sops      map[string]*domain.SOPItem
	audits    []domain.AuditLog
}

func NewPostgresOwnerRepo(db *sql.DB) ports.OwnerRepository {
	repo := &postgresOwnerRepo{
		db:        db,
		banks:     make(map[string]*domain.BankAccount),
		materials: make(map[string]*domain.RawMaterial),
		pos:       make(map[string]*domain.PurchaseOrder),
		shifts:    make(map[string]*domain.StaffShift),
		kpis:      make(map[string]*domain.StaffKPI),
		promos:    make(map[string]*domain.Promotion),
		customers: make(map[string]*domain.CustomerMember),
		assets:    make(map[string]*domain.EquipmentAsset),
		parking:   make(map[string]*domain.ParkingReport),
		sops:      make(map[string]*domain.SOPItem),
		audits:    make([]domain.AuditLog, 0),
	}

	repo.seedInitialData()
	return repo
}

func (r *postgresOwnerRepo) seedInitialData() {
	r.mu.Lock()
	defer r.mu.Unlock()

	// Banks
	r.banks["BANK-01"] = &domain.BankAccount{
		ID:            "BANK-01",
		MerchantID:    "MCH-01",
		BankName:      "Bank BCA",
		AccountNumber: "890-552-1920",
		HolderName:    "PT Kopi Ruang Temu",
		Balance:       42500000,
		IsPrimary:     true,
		CreatedAt:     time.Now(),
		UpdatedAt:     time.Now(),
	}
	r.banks["BANK-02"] = &domain.BankAccount{
		ID:            "BANK-02",
		MerchantID:    "MCH-01",
		BankName:      "Bank BNI",
		AccountNumber: "028-119-4821",
		HolderName:    "Kopi Ruang Temu Rek 2",
		Balance:       18200000,
		IsPrimary:     false,
		CreatedAt:     time.Now(),
		UpdatedAt:     time.Now(),
	}
	r.banks["BANK-03"] = &domain.BankAccount{
		ID:            "BANK-03",
		MerchantID:    "MCH-01",
		BankName:      "Bank Mandiri",
		AccountNumber: "114-00-982145-2",
		HolderName:    "Operasional Outlet Kemiling",
		Balance:       25800000,
		IsPrimary:     false,
		CreatedAt:     time.Now(),
		UpdatedAt:     time.Now(),
	}

	// Materials
	r.materials["MAT-01"] = &domain.RawMaterial{
		ID:           "MAT-01",
		MerchantID:   "MCH-01",
		BranchID:     "01-MAIN",
		Name:         "Biji Kopi Arabika Ulubelu",
		Category:     "Coffee Beans",
		CurrentStock: 3.5,
		MinStock:     8.0,
		Unit:         "kg",
		CostPerUnit:  140000,
		Supplier:     "Koperasi Tani Lampung Coffee",
		UpdatedAt:    time.Now(),
	}
	r.materials["MAT-02"] = &domain.RawMaterial{
		ID:           "MAT-02",
		MerchantID:   "MCH-01",
		BranchID:     "01-MAIN",
		Name:         "Susu Fresh Milk Pasteurisasi",
		Category:     "Dairy",
		CurrentStock: 6.0,
		MinStock:     20.0,
		Unit:         "liter",
		CostPerUnit:  21000,
		Supplier:     "Greenfields Dairy Direct",
		UpdatedAt:    time.Now(),
	}
	r.materials["MAT-03"] = &domain.RawMaterial{
		ID:           "MAT-03",
		MerchantID:   "MCH-01",
		BranchID:     "01-MAIN",
		Name:         "Paper Cup Cold 16oz + Tutup",
		Category:     "Packaging",
		CurrentStock: 80,
		MinStock:     250,
		Unit:         "pcs",
		CostPerUnit:  850,
		Supplier:     "Mitra Kemasan Utama",
		UpdatedAt:    time.Now(),
	}

	// KPIs
	r.kpis["STF-01"] = &domain.StaffKPI{
		StaffID:         "STF-01",
		Name:            "Ahmad Fauzi",
		Role:            "Senior Cashier",
		Rank:            1,
		OrdersServed:    124,
		TotalRevenue:    3720000,
		AvgSpeedMinutes: 1.4,
		CustomerRating:  4.95,
		CashDiscrepancy: 0,
	}
	r.kpis["STF-02"] = &domain.StaffKPI{
		StaffID:         "STF-02",
		Name:            "Citra Dewi",
		Role:            "Outlet Cashier",
		Rank:            2,
		OrdersServed:    98,
		TotalRevenue:    2940000,
		AvgSpeedMinutes: 1.7,
		CustomerRating:  4.88,
		CashDiscrepancy: 0,
	}

	// Shifts
	r.shifts["SFT-01"] = &domain.StaffShift{
		ID:               "SFT-01",
		MerchantID:       "MCH-01",
		BranchID:         "01-MAIN",
		StaffID:          "STF-01",
		StaffName:        "Ahmad Fauzi",
		Role:             "CASHIER",
		Date:             time.Now().Format("2006-01-02"),
		DayName:          "Hari Ini",
		ShiftType:        "PAGI",
		ShiftHours:       "07:00 - 15:00",
		AttendanceStatus: "ON_TIME",
		LateMinutes:      0,
		CreatedAt:        time.Now(),
	}

	// Promos
	r.promos["PRM-01"] = &domain.Promotion{
		ID:            "PRM-01",
		MerchantID:    "MCH-01",
		Code:          "WESELHEMAT",
		Title:         "Potongan Rp 10.000 QRIS Wesel Aja",
		DiscountType:  "FIXED",
		DiscountValue: 10000,
		MinSpend:      50000,
		QuotaTotal:    50,
		QuotaUsed:     31,
		IsActive:      true,
		ValidUntil:    "2026-09-28",
		CreatedAt:     time.Now(),
	}

	// Customers
	r.customers["CUST-01"] = &domain.CustomerMember{
		ID:            "CUST-01",
		MerchantID:    "MCH-01",
		Name:          "Reza Pratama",
		Email:         "reza.pratama@gmail.com",
		Phone:         "0812-7890-1234",
		Tier:          "GOLD",
		LoyaltyPoints: 450,
		TotalSpent:    1140000,
		CanOrderWeb:   true,
		CreatedAt:     time.Now(),
	}

	// Assets
	r.assets["AST-01"] = &domain.EquipmentAsset{
		ID:              "AST-01",
		MerchantID:      "MCH-01",
		BranchID:        "01-MAIN",
		AssetCode:       "EQ-LMR-01",
		Name:            "La Marzocco Linea Classic 2-Group",
		Category:        "La Marzocco / Italy 2024 (EQUIPMENT)",
		PurchaseCost:    145000000,
		PurchaseDate:    "2024-03-15",
		ConditionStatus: "EXCELLENT",
		CreatedAt:       time.Now(),
	}

	// Parking
	r.parking["PRK-01"] = &domain.ParkingReport{
		ID:              "PRK-01",
		MerchantID:      "MCH-01",
		BranchID:        "01-MAIN",
		PeriodLabel:     "08 Sep - 14 Sep 2026",
		CoordinatorName: "Pak Sukirno (Koordinator Parkir)",
		GrossAmount:     4390000,
		StoreShare:      2634000,
		KeeperShare:     1756000,
		MotorcycleCount: 1420,
		CarCount:        310,
		Status:          "SETTLED",
		CreatedAt:       time.Now(),
	}
}

// Bank methods
func (r *postgresOwnerRepo) GetBankAccounts(ctx context.Context, merchantID string) ([]domain.BankAccount, error) {
	if r.db != nil {
		rows, err := r.db.QueryContext(ctx, `SELECT id, merchant_id, bank_name, account_number, holder_name, balance, is_primary, created_at, updated_at FROM bank_accounts WHERE merchant_id = $1 ORDER BY is_primary DESC, created_at ASC`, merchantID)
		if err == nil {
			defer rows.Close()
			var list []domain.BankAccount
			for rows.Next() {
				var b domain.BankAccount
				if err := rows.Scan(&b.ID, &b.MerchantID, &b.BankName, &b.AccountNumber, &b.HolderName, &b.Balance, &b.IsPrimary, &b.CreatedAt, &b.UpdatedAt); err == nil {
					list = append(list, b)
				}
			}
			if len(list) > 0 {
				return list, nil
			}
		}
	}

	r.mu.RLock()
	defer r.mu.RUnlock()
	var list []domain.BankAccount
	for _, b := range r.banks {
		list = append(list, *b)
	}
	return list, nil
}

func (r *postgresOwnerRepo) CreateBankAccount(ctx context.Context, bank *domain.BankAccount) error {
	if r.db != nil {
		_, _ = r.db.ExecContext(ctx, `INSERT INTO bank_accounts (id, merchant_id, bank_name, account_number, holder_name, balance, is_primary, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
			bank.ID, bank.MerchantID, bank.BankName, bank.AccountNumber, bank.HolderName, bank.Balance, bank.IsPrimary, bank.CreatedAt, bank.UpdatedAt)
	}
	r.mu.Lock()
	defer r.mu.Unlock()
	r.banks[bank.ID] = bank
	return nil
}

func (r *postgresOwnerRepo) UpdateBankAccount(ctx context.Context, bank *domain.BankAccount) error {
	if r.db != nil {
		_, _ = r.db.ExecContext(ctx, `UPDATE bank_accounts SET balance = $1, updated_at = $2 WHERE id = $3`, bank.Balance, time.Now(), bank.ID)
	}
	r.mu.Lock()
	defer r.mu.Unlock()
	r.banks[bank.ID] = bank
	return nil
}

func (r *postgresOwnerRepo) DeleteBankAccount(ctx context.Context, id string) error {
	if r.db != nil {
		_, _ = r.db.ExecContext(ctx, `DELETE FROM bank_accounts WHERE id = $1`, id)
	}
	r.mu.Lock()
	defer r.mu.Unlock()
	delete(r.banks, id)
	return nil
}

// Raw Materials
func (r *postgresOwnerRepo) GetRawMaterials(ctx context.Context, merchantID, branchID string) ([]domain.RawMaterial, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	var list []domain.RawMaterial
	for _, m := range r.materials {
		list = append(list, *m)
	}
	return list, nil
}

func (r *postgresOwnerRepo) CreateRawMaterial(ctx context.Context, mat *domain.RawMaterial) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.materials[mat.ID] = mat
	return nil
}

func (r *postgresOwnerRepo) UpdateRawMaterialStock(ctx context.Context, id string, newStock float64) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	if m, ok := r.materials[id]; ok {
		m.CurrentStock = newStock
		m.UpdatedAt = time.Now()
	}
	return nil
}

func (r *postgresOwnerRepo) DeleteRawMaterial(ctx context.Context, id string) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	delete(r.materials, id)
	return nil
}

// Purchase Orders
func (r *postgresOwnerRepo) GetPurchaseOrders(ctx context.Context, merchantID, branchID string) ([]domain.PurchaseOrder, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	var list []domain.PurchaseOrder
	for _, p := range r.pos {
		list = append(list, *p)
	}
	return list, nil
}

func (r *postgresOwnerRepo) CreatePurchaseOrder(ctx context.Context, po *domain.PurchaseOrder) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.pos[po.ID] = po
	return nil
}

func (r *postgresOwnerRepo) ReceivePurchaseOrder(ctx context.Context, id string) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	po, ok := r.pos[id]
	if !ok {
		return errors.New("purchase order tidak ditemukan")
	}
	po.Status = "RECEIVED"
	now := time.Now().Format("2006-01-02")
	po.ReceivedDate = &now

	// Increment raw material stock
	if mat, ok := r.materials[po.MaterialID]; ok {
		mat.CurrentStock += po.Quantity
		mat.UpdatedAt = time.Now()
	}
	return nil
}

// Staff Shifts & KPI
func (r *postgresOwnerRepo) GetStaffShifts(ctx context.Context, merchantID, branchID string) ([]domain.StaffShift, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	var list []domain.StaffShift
	for _, s := range r.shifts {
		list = append(list, *s)
	}
	return list, nil
}

func (r *postgresOwnerRepo) CreateStaffShift(ctx context.Context, shift *domain.StaffShift) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.shifts[shift.ID] = shift
	return nil
}

func (r *postgresOwnerRepo) UpdateStaffShift(ctx context.Context, id string, shiftType, shiftHours string) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	if s, ok := r.shifts[id]; ok {
		s.ShiftType = shiftType
		s.ShiftHours = shiftHours
	}
	return nil
}

func (r *postgresOwnerRepo) GetStaffKPIs(ctx context.Context, merchantID, branchID string) ([]domain.StaffKPI, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	var list []domain.StaffKPI
	for _, k := range r.kpis {
		list = append(list, *k)
	}
	return list, nil
}

// Promos & CRM
func (r *postgresOwnerRepo) GetPromotions(ctx context.Context, merchantID string) ([]domain.Promotion, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	var list []domain.Promotion
	for _, p := range r.promos {
		list = append(list, *p)
	}
	return list, nil
}

func (r *postgresOwnerRepo) CreatePromotion(ctx context.Context, promo *domain.Promotion) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.promos[promo.ID] = promo
	return nil
}

func (r *postgresOwnerRepo) TogglePromotion(ctx context.Context, id string, isActive bool) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	if p, ok := r.promos[id]; ok {
		p.IsActive = isActive
	}
	return nil
}

func (r *postgresOwnerRepo) DeletePromotion(ctx context.Context, id string) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	delete(r.promos, id)
	return nil
}

func (r *postgresOwnerRepo) GetCustomers(ctx context.Context, merchantID string) ([]domain.CustomerMember, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	var list []domain.CustomerMember
	for _, c := range r.customers {
		list = append(list, *c)
	}
	return list, nil
}

func (r *postgresOwnerRepo) CreateCustomer(ctx context.Context, customer *domain.CustomerMember) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.customers[customer.ID] = customer
	return nil
}

// Operations: Assets, Parking, SOP, Audit
func (r *postgresOwnerRepo) GetAssets(ctx context.Context, merchantID string) ([]domain.EquipmentAsset, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	var list []domain.EquipmentAsset
	for _, a := range r.assets {
		list = append(list, *a)
	}
	return list, nil
}

func (r *postgresOwnerRepo) CreateAsset(ctx context.Context, asset *domain.EquipmentAsset) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.assets[asset.ID] = asset
	return nil
}

func (r *postgresOwnerRepo) UpdateAssetCondition(ctx context.Context, id, condition string) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	if a, ok := r.assets[id]; ok {
		a.ConditionStatus = condition
	}
	return nil
}

func (r *postgresOwnerRepo) DeleteAsset(ctx context.Context, id string) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	delete(r.assets, id)
	return nil
}

func (r *postgresOwnerRepo) GetParkingReports(ctx context.Context, merchantID, branchID string) ([]domain.ParkingReport, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	var list []domain.ParkingReport
	for _, p := range r.parking {
		list = append(list, *p)
	}
	return list, nil
}

func (r *postgresOwnerRepo) CreateParkingReport(ctx context.Context, report *domain.ParkingReport) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.parking[report.ID] = report
	return nil
}

func (r *postgresOwnerRepo) GetSOPItems(ctx context.Context, merchantID string) ([]domain.SOPItem, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	var list []domain.SOPItem
	for _, s := range r.sops {
		list = append(list, *s)
	}
	return list, nil
}

func (r *postgresOwnerRepo) ToggleSOPStep(ctx context.Context, sopID, stepID string) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	if sop, ok := r.sops[sopID]; ok {
		for i := range sop.Steps {
			if sop.Steps[i].ID == stepID {
				sop.Steps[i].IsCompleted = !sop.Steps[i].IsCompleted
				sop.UpdatedAt = time.Now()
				break
			}
		}
	}
	return nil
}

func (r *postgresOwnerRepo) GetAuditLogs(ctx context.Context, merchantID string, limit int) ([]domain.AuditLog, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	if len(r.audits) > limit {
		return r.audits[:limit], nil
	}
	return r.audits, nil
}

func (r *postgresOwnerRepo) CreateAuditLog(ctx context.Context, log *domain.AuditLog) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.audits = append([]domain.AuditLog{*log}, r.audits...)
	return nil
}
