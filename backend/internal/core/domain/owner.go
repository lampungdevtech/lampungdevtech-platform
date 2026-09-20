package domain

import (
	"time"
)

// 1. Financial & Bank Accounts
type BankAccount struct {
	ID            string    `json:"id"`
	MerchantID    string    `json:"merchantId"`
	BranchID      string    `json:"branchId,omitempty"`
	BankName      string    `json:"bankName"`
	AccountNumber string    `json:"accountNumber"`
	HolderName    string    `json:"holderName"`
	Balance       int64     `json:"balance"`
	IsPrimary     bool      `json:"isPrimary"`
	CreatedAt     time.Time `json:"createdAt"`
	UpdatedAt     time.Time `json:"updatedAt"`
}

type FinancialSummary struct {
	TotalConsolidatedCash int64 `json:"totalConsolidatedCash"`
	TotalBankBalance      int64 `json:"totalBankBalance"`
	PhysicalCashDrawer    int64 `json:"physicalCashDrawer"`
	PettyCashExpense      int64 `json:"pettyCashExpense"`
	ParkingCash           int64 `json:"parkingCash"`
	PaymentGatewayBalance int64 `json:"paymentGatewayBalance"`
	MonthlyInflow         int64 `json:"monthlyInflow"`
	MonthlyOutflow        int64 `json:"monthlyOutflow"`
	ElectricityKwh        int   `json:"electricityKwh"`
	ElectricityCost       int64 `json:"electricityCost"`
}

// 2. Inventory & Purchasing
type RawMaterial struct {
	ID           string    `json:"id"`
	MerchantID   string    `json:"merchantId"`
	BranchID     string    `json:"branchId"`
	Name         string    `json:"name"`
	Category     string    `json:"category"`
	CurrentStock float64   `json:"currentStock"`
	MinStock     float64   `json:"minStock"`
	Unit         string    `json:"unit"`
	CostPerUnit  int64     `json:"costPerUnit"`
	Supplier     string    `json:"supplier"`
	UpdatedAt    time.Time `json:"updatedAt"`
}

type PurchaseOrder struct {
	ID           string     `json:"id"`
	MerchantID   string     `json:"merchantId"`
	BranchID     string     `json:"branchId"`
	PONumber     string     `json:"poNumber"`
	MaterialID   string     `json:"materialId"`
	MaterialName string     `json:"materialName"`
	Quantity     float64    `json:"quantity"`
	Unit         string     `json:"unit"`
	TotalCost    int64      `json:"totalCost"`
	SupplierName string     `json:"supplierName"`
	Status       string     `json:"status"` // PENDING, APPROVED, RECEIVED
	OrderDate    string     `json:"orderDate"`
	ReceivedDate *string    `json:"receivedDate,omitempty"`
	CreatedAt    time.Time  `json:"createdAt"`
}

// 3. Staff & Shifts
type StaffShift struct {
	ID               string    `json:"id"`
	MerchantID       string    `json:"merchantId"`
	BranchID         string    `json:"branchId"`
	StaffID          string    `json:"staffId"`
	StaffName        string    `json:"staffName"`
	Role             string    `json:"role"`
	Date             string    `json:"date"`
	DayName          string    `json:"dayName"`
	ShiftType        string    `json:"shiftType"` // PAGI, MALAM, OFF
	ShiftHours       string    `json:"shiftHours"`
	AttendanceStatus string    `json:"attendanceStatus"` // ON_TIME, LATE, ABSENT, UPCOMING
	LateMinutes      int       `json:"lateMinutes"`
	CreatedAt        time.Time `json:"createdAt"`
}

type StaffKPI struct {
	StaffID         string  `json:"staffId"`
	Name            string  `json:"name"`
	Role            string  `json:"role"`
	Rank            int     `json:"rank"`
	OrdersServed    int     `json:"ordersServed"`
	TotalRevenue    int64   `json:"totalRevenue"`
	AvgSpeedMinutes float64 `json:"avgSpeedMinutes"`
	CustomerRating  float64 `json:"customerRating"`
	CashDiscrepancy int64   `json:"cashDiscrepancy"`
}

// 4. Marketing & CRM
type Promotion struct {
	ID            string    `json:"id"`
	MerchantID    string    `json:"merchantId"`
	Code          string    `json:"code"`
	Title         string    `json:"title"`
	DiscountType  string    `json:"discountType"` // PERCENTAGE, FIXED, BUY1GET1
	DiscountValue int64     `json:"discountValue"`
	MinSpend      int64     `json:"minSpend"`
	QuotaTotal    int       `json:"quotaTotal"`
	QuotaUsed     int       `json:"quotaUsed"`
	IsActive      bool      `json:"isActive"`
	ValidUntil    string    `json:"validUntil"`
	CreatedAt     time.Time `json:"createdAt"`
}

type CustomerMember struct {
	ID            string    `json:"id"`
	MerchantID    string    `json:"merchantId"`
	Name          string    `json:"name"`
	Email         string    `json:"email"`
	Phone         string    `json:"phone"`
	Tier          string    `json:"tier"` // BRONZE, SILVER, GOLD, PLATINUM
	LoyaltyPoints int       `json:"loyaltyPoints"`
	TotalSpent    int64     `json:"totalSpent"`
	CanOrderWeb   bool      `json:"canOrderWeb"`
	CreatedAt     time.Time `json:"createdAt"`
}

// 5. Operations, Assets, SOP & Audit
type EquipmentAsset struct {
	ID              string    `json:"id"`
	MerchantID      string    `json:"merchantId"`
	BranchID        string    `json:"branchId,omitempty"`
	AssetCode       string    `json:"assetCode"`
	Name            string    `json:"name"`
	Category        string    `json:"category"`
	PurchaseCost    int64     `json:"purchaseCost"`
	PurchaseDate    string    `json:"purchaseDate"`
	ConditionStatus string    `json:"conditionStatus"` // EXCELLENT, GOOD, REPAIR
	CreatedAt       time.Time `json:"createdAt"`
}

type ParkingReport struct {
	ID              string    `json:"id"`
	MerchantID      string    `json:"merchantId"`
	BranchID        string    `json:"branchId"`
	PeriodLabel     string    `json:"periodLabel"`
	CoordinatorName string    `json:"coordinatorName"`
	GrossAmount     int64     `json:"grossAmount"`
	StoreShare      int64     `json:"storeShare"`  // 60%
	KeeperShare     int64     `json:"keeperShare"` // 40%
	MotorcycleCount int       `json:"motorcycleCount"`
	CarCount        int       `json:"carCount"`
	Status          string    `json:"status"` // SETTLED, ONGOING
	CreatedAt       time.Time `json:"createdAt"`
}

type SOPStep struct {
	ID          string `json:"id"`
	Text        string `json:"text"`
	IsCompleted bool   `json:"isCompleted"`
}

type SOPItem struct {
	ID         string    `json:"id"`
	MerchantID string    `json:"merchantId"`
	Title      string    `json:"title"`
	Category   string    `json:"category"`
	RoleTarget string    `json:"roleTarget"`
	Steps      []SOPStep `json:"steps"`
	UpdatedAt  time.Time `json:"updatedAt"`
}

type AuditLog struct {
	ID         string    `json:"id"`
	MerchantID string    `json:"merchantId"`
	BranchID   string    `json:"branchId,omitempty"`
	StaffID    string    `json:"staffId,omitempty"`
	StaffName  string    `json:"staffName"`
	Action     string    `json:"action"`
	IPAddress  string    `json:"ipAddress"`
	Device     string    `json:"device"`
	Status     string    `json:"status"`
	Timestamp  time.Time `json:"timestamp"`
}
