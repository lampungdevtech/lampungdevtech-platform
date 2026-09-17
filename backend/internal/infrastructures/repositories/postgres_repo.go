package repositories

import (
	"context"
	"database/sql"
	"errors"
	"sync"
	"time"

	"github.com/lampungdevtech/backend/internal/core/domain"
	"github.com/lampungdevtech/backend/internal/core/ports"
	_ "github.com/lib/pq"
)

// In-memory fallback map jika DB belum terkoneksi
var (
	staffStore = make(map[string]*domain.Staff)
	orderStore = make(map[string]*domain.Order)
	shiftStore = make(map[string]*domain.CashierShift)
	mu         sync.RWMutex
)

// 1. Staff Repository
type postgresStaffRepo struct {
	db *sql.DB
}

func NewPostgresStaffRepo(db *sql.DB) ports.StaffRepository {
	return &postgresStaffRepo{db: db}
}

func (r *postgresStaffRepo) FindByEmailAndBranch(ctx context.Context, email, branchID string) (*domain.Staff, error) {
	if r.db == nil {
		mu.RLock()
		defer mu.RUnlock()
		for _, s := range staffStore {
			if s.Email == email && s.BranchID == branchID {
				return s, nil
			}
		}
		// Data dummy kasir untuk dev lokal cepat
		if email == "kasir@kopitemu.com" {
			return &domain.Staff{
				ID:         "STF-DEMO",
				MerchantID: "MCH-01",
				BranchID:   branchID,
				Name:       "Kasir Uji Coba",
				Email:      email,
				PinHash:    "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy", // PIN: 123456
				Role:       domain.RoleCashier,
				IsActive:   true,
				CreatedAt:  time.Now(),
				UpdatedAt:  time.Now(),
			}, nil
		}
		return nil, errors.New("staf tidak ditemukan")
	}

	query := `SELECT id, merchant_id, branch_id, name, email, pin_hash, role, is_active, created_at, updated_at 
              FROM staff_members WHERE email = $1 AND branch_id = $2 LIMIT 1`
	var s domain.Staff
	err := r.db.QueryRowContext(ctx, query, email, branchID).Scan(
		&s.ID, &s.MerchantID, &s.BranchID, &s.Name, &s.Email, &s.PinHash, &s.Role, &s.IsActive, &s.CreatedAt, &s.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &s, nil
}

func (r *postgresStaffRepo) Save(ctx context.Context, staff *domain.Staff) error {
	if r.db == nil {
		mu.Lock()
		defer mu.Unlock()
		staffStore[staff.ID] = staff
		return nil
	}

	query := `INSERT INTO staff_members (id, merchant_id, branch_id, name, email, pin_hash, role, is_active, created_at, updated_at)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`
	_, err := r.db.ExecContext(ctx, query,
		staff.ID, staff.MerchantID, staff.BranchID, staff.Name, staff.Email, staff.PinHash, staff.Role, staff.IsActive, staff.CreatedAt, staff.UpdatedAt,
	)
	return err
}

func (r *postgresStaffRepo) FindByID(ctx context.Context, id string) (*domain.Staff, error) {
	if r.db == nil {
		mu.RLock()
		defer mu.RUnlock()
		s, ok := staffStore[id]
		if !ok {
			return nil, errors.New("staf tidak ditemukan")
		}
		return s, nil
	}

	query := `SELECT id, merchant_id, branch_id, name, email, pin_hash, role, is_active, created_at, updated_at 
              FROM staff_members WHERE id = $1 LIMIT 1`
	var s domain.Staff
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&s.ID, &s.MerchantID, &s.BranchID, &s.Name, &s.Email, &s.PinHash, &s.Role, &s.IsActive, &s.CreatedAt, &s.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &s, nil
}

// 2. Order Repository
type postgresOrderRepo struct {
	db *sql.DB
}

func NewPostgresOrderRepo(db *sql.DB) ports.OrderRepository {
	return &postgresOrderRepo{db: db}
}

func (r *postgresOrderRepo) Save(ctx context.Context, order *domain.Order) error {
	if r.db == nil {
		mu.Lock()
		defer mu.Unlock()
		orderStore[order.ID] = order
		return nil
	}

	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	query := `INSERT INTO orders (id, merchant_id, branch_id, shift_id, staff_id, table_number, customer_name, subtotal, tax_amount, discount_amount, total_amount, payment_method, payment_status, status, created_at, synced_at)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`
	_, err = tx.ExecContext(ctx, query,
		order.ID, order.MerchantID, order.BranchID, order.ShiftID, order.CashierStaffID, order.TableNumber, order.CustomerName, order.Subtotal, order.TaxAmount, order.DiscountAmount, order.TotalAmount, order.PaymentMethod, order.PaymentStatus, order.Status, order.CreatedAt, order.SyncedAt,
	)
	if err != nil {
		return err
	}

	for _, item := range order.Items {
		itemQuery := `INSERT INTO order_items (id, order_id, product_id, product_name, quantity, unit_price, subtotal, notes)
                      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`
		_, err = tx.ExecContext(ctx, itemQuery,
			item.ID, order.ID, item.ProductID, item.ProductName, item.Quantity, item.UnitPrice, item.Subtotal, item.Notes,
		)
		if err != nil {
			return err
		}
	}

	return tx.Commit()
}

func (r *postgresOrderRepo) FindByID(ctx context.Context, id string) (*domain.Order, error) {
	if r.db == nil {
		mu.RLock()
		defer mu.RUnlock()
		o, ok := orderStore[id]
		if !ok {
			return nil, errors.New("order tidak ditemukan")
		}
		return o, nil
	}

	query := `SELECT id, merchant_id, branch_id, shift_id, staff_id, table_number, customer_name, subtotal, tax_amount, discount_amount, total_amount, payment_method, payment_status, status, created_at, synced_at 
              FROM orders WHERE id = $1 LIMIT 1`
	var o domain.Order
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&o.ID, &o.MerchantID, &o.BranchID, &o.ShiftID, &o.CashierStaffID, &o.TableNumber, &o.CustomerName, &o.Subtotal, &o.TaxAmount, &o.DiscountAmount, &o.TotalAmount, &o.PaymentMethod, &o.PaymentStatus, &o.Status, &o.CreatedAt, &o.SyncedAt,
	)
	if err != nil {
		return nil, err
	}
	return &o, nil
}

func (r *postgresOrderRepo) FindByBranch(ctx context.Context, branchID string, limit int) ([]domain.Order, error) {
	if r.db == nil {
		mu.RLock()
		defer mu.RUnlock()
		var list []domain.Order
		for _, o := range orderStore {
			if o.BranchID == branchID {
				list = append(list, *o)
			}
		}
		return list, nil
	}

	query := `SELECT id, merchant_id, branch_id, shift_id, staff_id, table_number, customer_name, subtotal, tax_amount, discount_amount, total_amount, payment_method, payment_status, status, created_at, synced_at 
              FROM orders WHERE branch_id = $1 ORDER BY created_at DESC LIMIT $2`
	rows, err := r.db.QueryContext(ctx, query, branchID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var orders []domain.Order
	for rows.Next() {
		var o domain.Order
		if err := rows.Scan(
			&o.ID, &o.MerchantID, &o.BranchID, &o.ShiftID, &o.CashierStaffID, &o.TableNumber, &o.CustomerName, &o.Subtotal, &o.TaxAmount, &o.DiscountAmount, &o.TotalAmount, &o.PaymentMethod, &o.PaymentStatus, &o.Status, &o.CreatedAt, &o.SyncedAt,
		); err == nil {
			orders = append(orders, o)
		}
	}
	return orders, nil
}

// 3. Shift Repository
type postgresShiftRepo struct {
	db *sql.DB
}

func NewPostgresShiftRepo(db *sql.DB) ports.ShiftRepository {
	return &postgresShiftRepo{db: db}
}

func (r *postgresShiftRepo) Save(ctx context.Context, shift *domain.CashierShift) error {
	if r.db == nil {
		mu.Lock()
		defer mu.Unlock()
		shiftStore[shift.ID] = shift
		return nil
	}

	query := `INSERT INTO cashier_shifts (id, merchant_id, branch_id, staff_id, cash_float_initial, total_cash_sales, total_non_cash, total_orders_count, actual_cash_end, expected_cash_end, cash_variance, status, opened_at)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`
	_, err := r.db.ExecContext(ctx, query,
		shift.ID, shift.MerchantID, shift.BranchID, shift.StaffID, shift.CashFloatInitial, shift.TotalCashSales, shift.TotalNonCash, shift.TotalOrdersCount, shift.ActualCashEnd, shift.ExpectedCashEnd, shift.CashVariance, shift.Status, shift.OpenedAt,
	)
	return err
}

func (r *postgresShiftRepo) FindByID(ctx context.Context, id string) (*domain.CashierShift, error) {
	if r.db == nil {
		mu.RLock()
		defer mu.RUnlock()
		s, ok := shiftStore[id]
		if !ok {
			return nil, errors.New("shift tidak ditemukan")
		}
		return s, nil
	}

	query := `SELECT id, merchant_id, branch_id, staff_id, cash_float_initial, total_cash_sales, total_non_cash, total_orders_count, actual_cash_end, expected_cash_end, cash_variance, status, opened_at, closed_at 
              FROM cashier_shifts WHERE id = $1 LIMIT 1`
	var s domain.CashierShift
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&s.ID, &s.MerchantID, &s.BranchID, &s.StaffID, &s.CashFloatInitial, &s.TotalCashSales, &s.TotalNonCash, &s.TotalOrdersCount, &s.ActualCashEnd, &s.ExpectedCashEnd, &s.CashVariance, &s.Status, &s.OpenedAt, &s.ClosedAt,
	)
	if err != nil {
		return nil, err
	}
	return &s, nil
}

func (r *postgresShiftRepo) FindActiveByStaff(ctx context.Context, staffID string) (*domain.CashierShift, error) {
	if r.db == nil {
		mu.RLock()
		defer mu.RUnlock()
		for _, s := range shiftStore {
			if s.StaffID == staffID && s.Status == domain.ShiftOpen {
				return s, nil
			}
		}
		return nil, nil
	}

	query := `SELECT id, merchant_id, branch_id, staff_id, cash_float_initial, total_cash_sales, total_non_cash, total_orders_count, actual_cash_end, expected_cash_end, cash_variance, status, opened_at, closed_at 
              FROM cashier_shifts WHERE staff_id = $1 AND status = 'OPEN' ORDER BY opened_at DESC LIMIT 1`
	var s domain.CashierShift
	err := r.db.QueryRowContext(ctx, query, staffID).Scan(
		&s.ID, &s.MerchantID, &s.BranchID, &s.StaffID, &s.CashFloatInitial, &s.TotalCashSales, &s.TotalNonCash, &s.TotalOrdersCount, &s.ActualCashEnd, &s.ExpectedCashEnd, &s.CashVariance, &s.Status, &s.OpenedAt, &s.ClosedAt,
	)
	if err != nil {
		return nil, nil // tidak ada shift aktif
	}
	return &s, nil
}

func (r *postgresShiftRepo) Update(ctx context.Context, shift *domain.CashierShift) error {
	if r.db == nil {
		mu.Lock()
		defer mu.Unlock()
		shiftStore[shift.ID] = shift
		return nil
	}

	query := `UPDATE cashier_shifts SET actual_cash_end = $1, expected_cash_end = $2, cash_variance = $3, status = $4, closed_at = $5 WHERE id = $6`
	_, err := r.db.ExecContext(ctx, query,
		shift.ActualCashEnd, shift.ExpectedCashEnd, shift.CashVariance, shift.Status, shift.ClosedAt, shift.ID,
	)
	return err
}
