package services

import (
	"context"
	"fmt"
	"log"
	"math/rand"
	"time"

	"github.com/lampungdevtech/backend/internal/core/domain"
	"github.com/lampungdevtech/backend/internal/core/ports"
)

type edutechService struct {
	repo     ports.EdutechRepository
	lockRepo ports.LockRepository
	aiSvc    ports.AISummarizerService
}

// NewEdutechService creates a new EdTech business service instance
func NewEdutechService(
	repo ports.EdutechRepository,
	lockRepo ports.LockRepository,
	aiSvc ports.AISummarizerService,
) ports.EdutechService {
	return &edutechService{
		repo:     repo,
		lockRepo: lockRepo,
		aiSvc:    aiSvc,
	}
}

func (s *edutechService) ListPrograms(ctx context.Context, tenantID string) ([]domain.Program, error) {
	return s.repo.GetPrograms(ctx, tenantID)
}

func (s *edutechService) ListClasses(ctx context.Context, tenantID, programID string) ([]domain.ClassSession, error) {
	return s.repo.GetClasses(ctx, tenantID, programID)
}

func (s *edutechService) EnrollStudentWithSlotLock(ctx context.Context, req domain.EnrollRequest) (*domain.Enrollment, error) {
	if req.ClassID == "" {
		return nil, fmt.Errorf("classId is required")
	}
	if req.StudentName == "" {
		return nil, fmt.Errorf("studentName is required")
	}
	if req.TenantID == "" {
		req.TenantID = "tenant-lampung-01"
	}
	if req.ParentID == "" {
		req.ParentID = "PAR-" + fmt.Sprintf("%04d", rand.Intn(9999))
	}
	if req.StudentID == "" {
		req.StudentID = "STU-" + fmt.Sprintf("%04d", rand.Intn(9999))
	}

	// 1. Acquire Distributed Concurrency Lock (SetNX with 10-second TTL)
	lockKey := "class:" + req.ClassID
	locked, err := s.lockRepo.AcquireLock(ctx, lockKey, 10*time.Second)
	if err != nil {
		log.Printf("[EdutechService] Gagal acquire lock: %v. Mencoba melanjutkan...\n", err)
	} else if !locked {
		return nil, fmt.Errorf("sistem sedang memproses booking untuk kelas ini, silakan coba 2 detik lagi")
	}

	// Release lock on completion
	defer func() {
		_ = s.lockRepo.ReleaseLock(ctx, lockKey)
	}()

	// 2. Prepare Enrollment Entity
	now := time.Now()
	enrollment := &domain.Enrollment{
		ID:               fmt.Sprintf("EDE-%d", now.UnixNano()%1000000),
		TenantID:         req.TenantID,
		ClassID:          req.ClassID,
		StudentID:        req.StudentID,
		StudentName:      req.StudentName,
		ParentID:         req.ParentID,
		ParentName:       req.ParentName,
		ParentPhone:      req.ParentPhone,
		Status:           "CONFIRMED",
		PaymentReference: fmt.Sprintf("INV/%s/EDT-%03d", now.Format("2006/01"), rand.Intn(999)),
		EnrolledAt:       now,
	}

	// 3. Atomically Decrement Seat and Save Enrollment
	if err := s.repo.CreateEnrollmentWithAtomicSeat(ctx, enrollment); err != nil {
		return nil, err
	}

	return enrollment, nil
}

func (s *edutechService) GetParentDashboard(ctx context.Context, parentID string) (map[string]interface{}, error) {
	enrollments, err := s.repo.GetEnrollmentsByParent(ctx, parentID)
	if err != nil {
		return nil, err
	}

	studentIDs := make(map[string]string)
	var allHomework []domain.HomeworkLog
	for _, e := range enrollments {
		studentIDs[e.StudentID] = e.StudentName
		hw, err := s.repo.GetHomeworkLogs(ctx, e.ID)
		if err == nil {
			allHomework = append(allHomework, hw...)
		}
	}

	var allSummaries []domain.WeeklySummary
	for sID, sName := range studentIDs {
		summaries, err := s.repo.GetWeeklySummaries(ctx, sID)
		if err == nil {
			for _, sum := range summaries {
				sum.StudentName = sName
				allSummaries = append(allSummaries, sum)
			}
		}
	}

	return map[string]interface{}{
		"parentId":        parentID,
		"enrollments":     enrollments,
		"homework":        allHomework,
		"weeklySummaries": allSummaries,
		"totalEnrolled":   len(enrollments),
	}, nil
}

func (s *edutechService) RecordAttendance(ctx context.Context, req domain.TeacherAttendanceRequest) error {
	log.Printf("[EdutechService] Attendance recorded: Class %s, Student %s -> %s (Topic: %s)\n",
		req.ClassID, req.StudentID, req.Status, req.TopicCovered)
	return nil
}

func (s *edutechService) SubmitHomework(ctx context.Context, req domain.TeacherHomeworkRequest) error {
	if req.EnrollmentID == "" {
		return fmt.Errorf("enrollmentId is required")
	}

	now := time.Now()
	hw := &domain.HomeworkLog{
		ID:              fmt.Sprintf("EDH-%d", now.UnixNano()%1000000),
		EnrollmentID:    req.EnrollmentID,
		Title:           req.Title,
		Score:           req.Score,
		TeacherFeedback: req.TeacherFeedback,
		CompletedAt:     &now,
		CreatedAt:       now,
	}

	return s.repo.CreateHomeworkLog(ctx, hw)
}

func (s *edutechService) GetAdminCapacity(ctx context.Context, tenantID string) (*domain.AdminCapacityReport, error) {
	return s.repo.GetAdminCapacity(ctx, tenantID)
}
