package services

import (
	"context"
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/lampungdevtech/backend/internal/core/domain"
	"github.com/lampungdevtech/backend/internal/core/ports"
	"golang.org/x/crypto/bcrypt"
)

type authService struct {
	staffRepo ports.StaffRepository
	jwtSecret []byte
}

func NewAuthService(staffRepo ports.StaffRepository, jwtSecret string) ports.AuthService {
	return &authService{
		staffRepo: staffRepo,
		jwtSecret: []byte(jwtSecret),
	}
}

func (s *authService) StaffLogin(ctx context.Context, req domain.StaffLoginRequest) (*domain.StaffLoginResponse, error) {
	staff, err := s.staffRepo.FindByEmailAndBranch(ctx, req.Email, req.BranchID)
	if err != nil || staff == nil {
		return nil, errors.New("email staf atau cabang tidak valid")
	}

	if !staff.IsActive {
		return nil, errors.New("akun staf kasir ini telah dinonaktifkan")
	}

	// Verifikasi PIN 6-digit dengan bcrypt
	err = bcrypt.CompareHashAndPassword([]byte(staff.PinHash), []byte(req.PIN))
	if err != nil {
		return nil, errors.New("kode PIN salah")
	}

	// Generate JWT token berlaku 24 jam untuk shift kasir
	expiresAt := time.Now().Add(24 * time.Hour).Unix()
	claims := jwt.MapClaims{
		"sub":         staff.ID,
		"email":       staff.Email,
		"role":        string(staff.Role),
		"merchant_id": staff.MerchantID,
		"branch_id":   staff.BranchID,
		"exp":         expiresAt,
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signedToken, err := token.SignedString(s.jwtSecret)
	if err != nil {
		return nil, errors.New("gagal menerbitkan token otentikasi")
	}

	return &domain.StaffLoginResponse{
		Token:     signedToken,
		StaffID:   staff.ID,
		Name:      staff.Name,
		Role:      string(staff.Role),
		BranchID:  staff.BranchID,
		ExpiresAt: expiresAt,
	}, nil
}

func (s *authService) RegisterStaff(ctx context.Context, staff *domain.Staff, rawPIN string) error {
	hash, err := bcrypt.GenerateFromPassword([]byte(rawPIN), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	staff.PinHash = string(hash)
	staff.CreatedAt = time.Now()
	staff.UpdatedAt = time.Now()
	staff.IsActive = true
	return s.staffRepo.Save(ctx, staff)
}
