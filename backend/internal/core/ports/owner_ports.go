package ports

import (
	"context"

	"github.com/lampungdevtech/backend/internal/core/domain"
)

type OwnerRepository interface {
	// Bank Accounts
	GetBankAccounts(ctx context.Context, merchantID string) ([]domain.BankAccount, error)
	CreateBankAccount(ctx context.Context, bank *domain.BankAccount) error
	UpdateBankAccount(ctx context.Context, bank *domain.BankAccount) error
	DeleteBankAccount(ctx context.Context, id string) error

	// Raw Materials & PO
	GetRawMaterials(ctx context.Context, merchantID, branchID string) ([]domain.RawMaterial, error)
	CreateRawMaterial(ctx context.Context, mat *domain.RawMaterial) error
	UpdateRawMaterialStock(ctx context.Context, id string, newStock float64) error
	DeleteRawMaterial(ctx context.Context, id string) error
	GetPurchaseOrders(ctx context.Context, merchantID, branchID string) ([]domain.PurchaseOrder, error)
	CreatePurchaseOrder(ctx context.Context, po *domain.PurchaseOrder) error
	ReceivePurchaseOrder(ctx context.Context, id string) error

	// Staff Shifts & KPI
	GetStaffShifts(ctx context.Context, merchantID, branchID string) ([]domain.StaffShift, error)
	CreateStaffShift(ctx context.Context, shift *domain.StaffShift) error
	UpdateStaffShift(ctx context.Context, id string, shiftType, shiftHours string) error
	GetStaffKPIs(ctx context.Context, merchantID, branchID string) ([]domain.StaffKPI, error)

	// Promos & CRM
	GetPromotions(ctx context.Context, merchantID string) ([]domain.Promotion, error)
	CreatePromotion(ctx context.Context, promo *domain.Promotion) error
	TogglePromotion(ctx context.Context, id string, isActive bool) error
	DeletePromotion(ctx context.Context, id string) error
	GetCustomers(ctx context.Context, merchantID string) ([]domain.CustomerMember, error)
	CreateCustomer(ctx context.Context, customer *domain.CustomerMember) error

	// Operations: Assets, Parking, SOP, Audit
	GetAssets(ctx context.Context, merchantID string) ([]domain.EquipmentAsset, error)
	CreateAsset(ctx context.Context, asset *domain.EquipmentAsset) error
	UpdateAssetCondition(ctx context.Context, id, condition string) error
	DeleteAsset(ctx context.Context, id string) error

	GetParkingReports(ctx context.Context, merchantID, branchID string) ([]domain.ParkingReport, error)
	CreateParkingReport(ctx context.Context, report *domain.ParkingReport) error

	GetSOPItems(ctx context.Context, merchantID string) ([]domain.SOPItem, error)
	ToggleSOPStep(ctx context.Context, sopID, stepID string) error

	GetAuditLogs(ctx context.Context, merchantID string, limit int) ([]domain.AuditLog, error)
	CreateAuditLog(ctx context.Context, log *domain.AuditLog) error
}

type OwnerService interface {
	GetFinancialSummary(ctx context.Context, merchantID, branchID string) (*domain.FinancialSummary, error)
	WithdrawGatewayFunds(ctx context.Context, merchantID, targetBankID string, amount int64) error
	ReceivePO(ctx context.Context, poID string) error
	RotateShift(ctx context.Context, shiftID string) error
	TogglePromoStatus(ctx context.Context, promoID string) error
}
