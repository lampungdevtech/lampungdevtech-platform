package domain

import "time"

type OrderStatus string
type PaymentMethod string
type PaymentStatus string

const (
	StatusSubmitted     OrderStatus = "SUBMITTED"
	StatusInPreparation OrderStatus = "IN_PREPARATION"
	StatusReady         OrderStatus = "READY"
	StatusCompleted     OrderStatus = "COMPLETED"
	StatusCancelled     OrderStatus = "CANCELLED"

	PaymentCash PaymentMethod = "CASH"
	PaymentQRIS PaymentMethod = "QRIS"
	PaymentCard PaymentMethod = "CARD"

	PaymentPaid    PaymentStatus = "PAID"
	PaymentPending PaymentStatus = "PENDING"
)

type OrderItem struct {
	ID          string `json:"id"`
	OrderID     string `json:"order_id"`
	ProductID   string `json:"product_id"`
	ProductName string `json:"product_name"`
	Quantity    int    `json:"quantity"`
	UnitPrice   int64  `json:"unit_price"`
	Subtotal    int64  `json:"subtotal"`
	Notes       string `json:"notes,omitempty"`
}

type Order struct {
	ID             string        `json:"id"` // ULID dari client mobile
	MerchantID     string        `json:"merchant_id"`
	BranchID       string        `json:"branch_id"`
	ShiftID        string        `json:"shift_id"`
	CashierStaffID string        `json:"cashier_staff_id"`
	TableNumber    string        `json:"table_number"`
	CustomerName   string        `json:"customer_name"`
	Subtotal       int64         `json:"subtotal"`
	TaxAmount      int64         `json:"tax_amount"`
	DiscountAmount int64         `json:"discount_amount"`
	TotalAmount    int64         `json:"total_amount"`
	PaymentMethod  PaymentMethod `json:"payment_method"`
	PaymentStatus  PaymentStatus `json:"payment_status"`
	Status         OrderStatus   `json:"status"`
	Items          []OrderItem   `json:"items"`
	CreatedAt      time.Time     `json:"created_at"`
	SyncedAt       time.Time     `json:"synced_at"`
}
