package domain

import "time"

type ShiftStatus string

const (
	ShiftOpen   ShiftStatus = "OPEN"
	ShiftClosed ShiftStatus = "CLOSED"
)

type CashierShift struct {
	ID               string      `json:"id"` // ULID
	MerchantID       string      `json:"merchant_id"`
	BranchID         string      `json:"branch_id"`
	StaffID          string      `json:"staff_id"`
	CashFloatInitial int64       `json:"cash_float_initial"` // Modal kas laci awal
	TotalCashSales   int64       `json:"total_cash_sales"`
	TotalNonCash     int64       `json:"total_non_cash"`
	TotalOrdersCount int         `json:"total_orders_count"`
	ActualCashEnd    int64       `json:"actual_cash_end"`    // Uang fisik saat tutup kasir
	ExpectedCashEnd  int64       `json:"expected_cash_end"`  // Kas awal + penjualan kas
	CashVariance     int64       `json:"cash_variance"`      // Selisih uang kas
	Status           ShiftStatus `json:"status"`
	OpenedAt         time.Time   `json:"opened_at"`
	ClosedAt         *time.Time  `json:"closed_at,omitempty"`
}

type OpenShiftRequest struct {
	MerchantID       string `json:"merchant_id"`
	BranchID         string `json:"branch_id"`
	StaffID          string `json:"staff_id"`
	CashFloatInitial int64  `json:"cash_float_initial"`
}

type CloseShiftRequest struct {
	ShiftID       string `json:"shift_id"`
	StaffID       string `json:"staff_id,omitempty"`
	MerchantID    string `json:"merchant_id,omitempty"`
	ActualCashEnd int64  `json:"actual_cash_end"`
}
