package domain

import "time"

type StaffRole string

const (
	RoleCashier       StaffRole = "CASHIER"
	RoleBarista       StaffRole = "BARISTA"
	RoleKitchen       StaffRole = "KITCHEN"
	RoleBranchManager StaffRole = "BRANCH_MANAGER"
)

type Staff struct {
	ID         string    `json:"id"`
	MerchantID string    `json:"merchant_id"`
	BranchID   string    `json:"branch_id"`
	Name       string    `json:"name"`
	Email      string    `json:"email"`
	PinHash    string    `json:"-"`
	Role       StaffRole `json:"role"`
	IsActive   bool      `json:"is_active"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

type StaffLoginRequest struct {
	Email          string `json:"email"`
	PIN            string `json:"pin"`
	BranchID       string `json:"branch_id"`
	TurnstileToken string `json:"turnstile_token"`
}

type StaffLoginResponse struct {
	Token     string `json:"token"`
	StaffID   string `json:"staff_id"`
	Name      string `json:"name"`
	Role      string `json:"role"`
	BranchID  string `json:"branch_id"`
	ExpiresAt int64  `json:"expires_at"`
}
