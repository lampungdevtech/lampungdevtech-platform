package ports

import (
	"context"
	"time"

	"github.com/lampungdevtech/backend/internal/core/domain"
)

// Inbound Ports (Driving Ports / Use Cases)

type AuthService interface {
	StaffLogin(ctx context.Context, req domain.StaffLoginRequest) (*domain.StaffLoginResponse, error)
	RegisterStaff(ctx context.Context, staff *domain.Staff, rawPIN string) error
}

type OrderService interface {
	CreateOrder(ctx context.Context, order *domain.Order) error
	GetOrderByID(ctx context.Context, id string) (*domain.Order, error)
	GetOrdersByBranch(ctx context.Context, branchID string, limit int) ([]domain.Order, error)
}

type ShiftService interface {
	OpenShift(ctx context.Context, req domain.OpenShiftRequest) (*domain.CashierShift, error)
	CloseShift(ctx context.Context, req domain.CloseShiftRequest) (*domain.CashierShift, error)
	GetActiveShift(ctx context.Context, staffID string) (*domain.CashierShift, error)
}

// Outbound Ports (Driven Ports / Repositories & Infrastructures)

type StaffRepository interface {
	FindByEmailAndBranch(ctx context.Context, email, branchID string) (*domain.Staff, error)
	Save(ctx context.Context, staff *domain.Staff) error
	FindByID(ctx context.Context, id string) (*domain.Staff, error)
}

type OrderRepository interface {
	Save(ctx context.Context, order *domain.Order) error
	FindByID(ctx context.Context, id string) (*domain.Order, error)
	FindByBranch(ctx context.Context, branchID string, limit int) ([]domain.Order, error)
}

type ShiftRepository interface {
	Save(ctx context.Context, shift *domain.CashierShift) error
	FindByID(ctx context.Context, id string) (*domain.CashierShift, error)
	FindActiveByStaff(ctx context.Context, staffID string) (*domain.CashierShift, error)
	Update(ctx context.Context, shift *domain.CashierShift) error
}

type EventPublisher interface {
	Publish(ctx context.Context, routingKey string, payload interface{}) error
}

type LockRepository interface {
	AcquireLock(ctx context.Context, key string, ttl time.Duration) (bool, error)
	ReleaseLock(ctx context.Context, key string) error
}
