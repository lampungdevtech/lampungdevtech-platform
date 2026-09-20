package services_test

import (
	"context"
	"fmt"
	"sync"
	"sync/atomic"
	"testing"
	"time"

	"github.com/lampungdevtech/backend/internal/core/domain"
	"github.com/lampungdevtech/backend/internal/core/services"
	"github.com/lampungdevtech/backend/internal/infrastructures/caching"
	"github.com/lampungdevtech/backend/internal/infrastructures/repositories"
)

func TestEnrollmentConcurrencySlotLocking(t *testing.T) {
	// Initialize in-memory repository (simulating DB and lock manager)
	repo := repositories.NewPostgresEdutechRepo(nil)
	lockRepo := caching.NewRedisLockRepo("") // In-memory fallback lock
	aiSvc := services.NewAISummarizerService("")
	service := services.NewEdutechService(repo, lockRepo, aiSvc)

	// Fetch existing class (e.g. EDC-02 with MaxSeats=8, Booked=6 -> 2 seats available)
	ctx := context.Background()
	classes, err := service.ListClasses(ctx, "tenant-lampung-01", "EDP-02")
	if err != nil || len(classes) == 0 {
		t.Fatalf("failed to retrieve test class: %v", err)
	}

	targetClassID := "EDC-02"
	initialAvailable := 2 // 8 max - 6 booked = 2 available

	// Launch 10 concurrent booking requests racing for 2 remaining seats
	concurrentUsers := 10
	var wg sync.WaitGroup
	var successfulBookings int32
	var rejectedBookings int32

	for i := 0; i < concurrentUsers; i++ {
		wg.Add(1)
		go func(idx int) {
			defer wg.Done()
			req := domain.EnrollRequest{
				TenantID:    "tenant-lampung-01",
				ClassID:     targetClassID,
				StudentName: fmt.Sprintf("Siswa Balap %d", idx),
				ParentName:  fmt.Sprintf("Wali Murid %d", idx),
				ParentPhone: "0812-3456-7890",
			}

			// Add jitter to mimic real-world network requests
			time.Sleep(time.Duration(idx*2) * time.Millisecond)

			_, err := service.EnrollStudentWithSlotLock(context.Background(), req)
			if err == nil {
				atomic.AddInt32(&successfulBookings, 1)
			} else {
				atomic.AddInt32(&rejectedBookings, 1)
			}
		}(i)
	}

	wg.Wait()

	t.Logf("Hasil Concurrency Test: Sukses=%d, Ditolak=%d", successfulBookings, rejectedBookings)

	// Assertions:
	// 1. Successful bookings cannot exceed available seats
	if int(successfulBookings) > initialAvailable {
		t.Fatalf("CRITICAL RACE CONDITION: Berhasil book %d kursi padahal hanya tersedia %d kursi!", successfulBookings, initialAvailable)
	}

	if int(successfulBookings) != initialAvailable {
		t.Logf("Info: Berhasil %d booking (sebagian terhenti pada lock contention)", successfulBookings)
	}

	// 2. Target class booked seats must not exceed MaxSeats (8)
	updatedClasses, _ := service.ListClasses(ctx, "tenant-lampung-01", "EDP-02")
	for _, c := range updatedClasses {
		if c.ID == targetClassID {
			if c.BookedSeats > c.MaxSeats {
				t.Fatalf("OVERBOOKED: Booked %d melebihi Max %d!", c.BookedSeats, c.MaxSeats)
			}
			t.Logf("Status Akhir Kelas %s: Booked=%d / Max=%d, Status=%s", c.ID, c.BookedSeats, c.MaxSeats, c.Status)
		}
	}
}
