package ports

import (
	"context"

	"github.com/lampungdevtech/backend/internal/core/domain"
)

// EdutechRepository handles persistence for EdTech programs, classes, enrollments, and progress logs
type EdutechRepository interface {
	GetPrograms(ctx context.Context, tenantID string) ([]domain.Program, error)
	GetClasses(ctx context.Context, tenantID, programID string) ([]domain.ClassSession, error)
	GetClassByID(ctx context.Context, classID string) (*domain.ClassSession, error)
	CreateEnrollmentWithAtomicSeat(ctx context.Context, enrollment *domain.Enrollment) error
	GetEnrollmentsByParent(ctx context.Context, parentID string) ([]domain.Enrollment, error)
	GetEnrollmentsByClass(ctx context.Context, classID string) ([]domain.Enrollment, error)
	GetHomeworkLogs(ctx context.Context, enrollmentID string) ([]domain.HomeworkLog, error)
	CreateHomeworkLog(ctx context.Context, log *domain.HomeworkLog) error
	GetWeeklySummaries(ctx context.Context, studentID string) ([]domain.WeeklySummary, error)
	CreateWeeklySummary(ctx context.Context, summary *domain.WeeklySummary) error
	GetAdminCapacity(ctx context.Context, tenantID string) (*domain.AdminCapacityReport, error)
}

// EdutechService defines business logic for enrollments, parent dashboard, and teacher workflows
type EdutechService interface {
	ListPrograms(ctx context.Context, tenantID string) ([]domain.Program, error)
	ListClasses(ctx context.Context, tenantID, programID string) ([]domain.ClassSession, error)
	EnrollStudentWithSlotLock(ctx context.Context, req domain.EnrollRequest) (*domain.Enrollment, error)
	GetParentDashboard(ctx context.Context, parentID string) (map[string]interface{}, error)
	RecordAttendance(ctx context.Context, req domain.TeacherAttendanceRequest) error
	SubmitHomework(ctx context.Context, req domain.TeacherHomeworkRequest) error
	GetAdminCapacity(ctx context.Context, tenantID string) (*domain.AdminCapacityReport, error)
}

// AISummarizerService transforms teacher notes & homework scores into encouraging weekly narrative summaries
type AISummarizerService interface {
	GenerateWeeklySummary(ctx context.Context, req domain.AIProgressRequest) (*domain.AIProgressResponse, error)
}
