package services

import (
	"context"
	"errors"

	"github.com/lampungdevtech/backend/internal/core/domain"
	"github.com/lampungdevtech/backend/internal/core/ports"
)

type ownerService struct {
	repo ports.OwnerRepository
}

func NewOwnerService(repo ports.OwnerRepository) ports.OwnerService {
	return &ownerService{repo: repo}
}

func (s *ownerService) GetFinancialSummary(ctx context.Context, merchantID, branchID string) (*domain.FinancialSummary, error) {
	banks, err := s.repo.GetBankAccounts(ctx, merchantID)
	if err != nil {
		return nil, err
	}

	var totalBank int64
	for _, b := range banks {
		totalBank += b.Balance
	}

	// Financial allocations
	drawerCash := int64(1850000)
	pettyCash := int64(1420000)
	parkingCash := int64(500000)
	gatewayBalance := int64(6350000)

	totalConsolidated := totalBank + drawerCash + pettyCash + parkingCash + gatewayBalance

	return &domain.FinancialSummary{
		TotalConsolidatedCash: totalConsolidated,
		TotalBankBalance:      totalBank,
		PhysicalCashDrawer:    drawerCash,
		PettyCashExpense:      pettyCash,
		ParkingCash:           parkingCash,
		PaymentGatewayBalance: gatewayBalance,
		MonthlyInflow:         84750000,
		MonthlyOutflow:        56050000,
		ElectricityKwh:        1420,
		ElectricityCost:       2130000,
	}, nil
}

func (s *ownerService) WithdrawGatewayFunds(ctx context.Context, merchantID, targetBankID string, amount int64) error {
	if amount <= 0 {
		return errors.New("nominal penarikan dana harus lebih besar dari 0")
	}

	banks, err := s.repo.GetBankAccounts(ctx, merchantID)
	if err != nil {
		return err
	}

	var targetBank *domain.BankAccount
	for _, b := range banks {
		if b.ID == targetBankID {
			targetBank = &b
			break
		}
	}

	if targetBank == nil {
		return errors.New("rekening bank tujuan tidak ditemukan")
	}

	targetBank.Balance += amount
	return s.repo.UpdateBankAccount(ctx, targetBank)
}

func (s *ownerService) ReceivePO(ctx context.Context, poID string) error {
	return s.repo.ReceivePurchaseOrder(ctx, poID)
}

func (s *ownerService) RotateShift(ctx context.Context, shiftID string) error {
	return s.repo.UpdateStaffShift(ctx, shiftID, "MALAM", "15:00 - 23:00")
}

func (s *ownerService) TogglePromoStatus(ctx context.Context, promoID string) error {
	return s.repo.TogglePromotion(ctx, promoID, true)
}
