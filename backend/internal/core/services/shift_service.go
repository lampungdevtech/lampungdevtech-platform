package services

import (
	"context"
	"errors"
	"time"

	"github.com/lampungdevtech/backend/internal/core/domain"
	"github.com/lampungdevtech/backend/internal/core/ports"
	"github.com/oklog/ulid/v2"
)

type shiftService struct {
	shiftRepo ports.ShiftRepository
	publisher ports.EventPublisher
}

func NewShiftService(shiftRepo ports.ShiftRepository, publisher ports.EventPublisher) ports.ShiftService {
	return &shiftService{
		shiftRepo: shiftRepo,
		publisher: publisher,
	}
}

func (s *shiftService) OpenShift(ctx context.Context, req domain.OpenShiftRequest) (*domain.CashierShift, error) {
	// Cek apakah kasir masih punya shift aktif
	active, _ := s.shiftRepo.FindActiveByStaff(ctx, req.StaffID)
	if active != nil {
		return nil, errors.New("staf kasir masih memiliki sesi shift yang belum ditutup")
	}

	shift := &domain.CashierShift{
		ID:               ulid.Make().String(),
		MerchantID:       req.MerchantID,
		BranchID:         req.BranchID,
		StaffID:          req.StaffID,
		CashFloatInitial: req.CashFloatInitial,
		TotalCashSales:   0,
		TotalNonCash:     0,
		TotalOrdersCount: 0,
		ActualCashEnd:    0,
		ExpectedCashEnd:  req.CashFloatInitial,
		CashVariance:     0,
		Status:           domain.ShiftOpen,
		OpenedAt:         time.Now(),
	}

	err := s.shiftRepo.Save(ctx, shift)
	if err != nil {
		return nil, err
	}

	return shift, nil
}

func (s *shiftService) CloseShift(ctx context.Context, req domain.CloseShiftRequest) (*domain.CashierShift, error) {
	shift, err := s.shiftRepo.FindByID(ctx, req.ShiftID)
	if err != nil || shift == nil {
		return nil, errors.New("data shift kasir tidak ditemukan")
	}

	if shift.Status == domain.ShiftClosed {
		return nil, errors.New("shift kasir ini sudah pernah ditutup sebelumnya")
	}

	// Validasi kepemilikan tenant & kasir
	if req.MerchantID != "" && shift.MerchantID != req.MerchantID {
		return nil, errors.New("akses ditolak: sesi shift ini milik merchant/toko lain")
	}
	if req.StaffID != "" && shift.StaffID != req.StaffID {
		return nil, errors.New("akses ditolak: sesi shift ini milik staf kasir lain")
	}

	now := time.Now()
	shift.ClosedAt = &now
	shift.Status = domain.ShiftClosed
	shift.ActualCashEnd = req.ActualCashEnd
	shift.ExpectedCashEnd = shift.CashFloatInitial + shift.TotalCashSales
	shift.CashVariance = shift.ActualCashEnd - shift.ExpectedCashEnd

	err = s.shiftRepo.Update(ctx, shift)
	if err != nil {
		return nil, err
	}

	// Terbitkan event 'shift.closed' untuk rekap Z-Report dan analitik Owner
	_ = s.publisher.Publish(ctx, "shift.closed", shift)

	return shift, nil
}

func (s *shiftService) GetActiveShift(ctx context.Context, staffID string) (*domain.CashierShift, error) {
	return s.shiftRepo.FindActiveByStaff(ctx, staffID)
}
