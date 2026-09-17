package services

import (
	"context"
	"fmt"
	"time"

	"github.com/lampungdevtech/backend/internal/core/domain"
	"github.com/lampungdevtech/backend/internal/core/ports"
)

type orderService struct {
	orderRepo ports.OrderRepository
	lockRepo  ports.LockRepository
	publisher ports.EventPublisher
}

func NewOrderService(
	orderRepo ports.OrderRepository,
	lockRepo ports.LockRepository,
	publisher ports.EventPublisher,
) ports.OrderService {
	return &orderService{
		orderRepo: orderRepo,
		lockRepo:  lockRepo,
		publisher: publisher,
	}
}

func (s *orderService) CreateOrder(ctx context.Context, order *domain.Order) error {
	// 1. Redis Distributed Table Locking jika pesanan dine-in pada meja tertentu
	if order.TableNumber != "" {
		lockKey := fmt.Sprintf("order:lock:%s:%s", order.BranchID, order.TableNumber)
		acquired, err := s.lockRepo.AcquireLock(ctx, lockKey, 30*time.Second)
		if err == nil && acquired {
			defer s.lockRepo.ReleaseLock(ctx, lockKey)
		}
	}

	// 2. Simpan order ke Database PostgreSQL
	order.SyncedAt = time.Now()
	if order.CreatedAt.IsZero() {
		order.CreatedAt = time.Now()
	}

	err := s.orderRepo.Save(ctx, order)
	if err != nil {
		return err
	}

	// 3. Terbitkan event 'order.created' ke RabbitMQ (untuk notifikasi KDS dapur & pemotongan stok bahan baku)
	_ = s.publisher.Publish(ctx, "order.created", order)

	return nil
}

func (s *orderService) GetOrderByID(ctx context.Context, id string) (*domain.Order, error) {
	return s.orderRepo.FindByID(ctx, id)
}

func (s *orderService) GetOrdersByBranch(ctx context.Context, branchID string, limit int) ([]domain.Order, error) {
	return s.orderRepo.FindByBranch(ctx, branchID, limit)
}
