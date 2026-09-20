package repositories

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"sync"
	"time"

	"github.com/lampungdevtech/backend/internal/core/domain"
	"github.com/lampungdevtech/backend/internal/core/ports"
	"github.com/lib/pq"
)

var (
	ErrClassFull     = errors.New("class capacity is full (kuota kursi telah habis)")
	ErrClassNotFound = errors.New("class not found")
)

type postgresEdutechRepo struct {
	db *sql.DB
	mu sync.RWMutex

	// In-memory fallback store
	memPrograms     []domain.Program
	memClasses      map[string]domain.ClassSession
	memEnrollments  map[string]domain.Enrollment
	memHomeworkLogs []domain.HomeworkLog
	memSummaries    []domain.WeeklySummary
}

// NewPostgresEdutechRepo creates a new EdTech repository
func NewPostgresEdutechRepo(db *sql.DB) ports.EdutechRepository {
	repo := &postgresEdutechRepo{
		db:              db,
		memClasses:      make(map[string]domain.ClassSession),
		memEnrollments:  make(map[string]domain.Enrollment),
		memHomeworkLogs: make([]domain.HomeworkLog, 0),
		memSummaries:    make([]domain.WeeklySummary, 0),
	}

	repo.seedInMemoryData()
	return repo
}

func (r *postgresEdutechRepo) seedInMemoryData() {
	now := time.Now()
	r.memPrograms = []domain.Program{
		{
			ID:           "EDP-01",
			TenantID:     "tenant-lampung-01",
			Title:        "Logika & Koding Anak (Roblox & Scratch)",
			Description:  "Membangun logika berpikir komputasional, algoritma loop, dan game development interaktif.",
			AgeGroup:     "7-12 Tahun (SD)",
			Category:     "CODING",
			ThumbnailURL: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80",
			IsActive:     true,
			CreatedAt:    now,
		},
		{
			ID:           "EDP-02",
			TenantID:     "tenant-lampung-01",
			Title:        "Matematika Interaktif & Problem Solving",
			Description:  "Mengubah konsep pecahan, geometri, dan aljabar menjadi teka-teki visual yang menyenangkan.",
			AgeGroup:     "8-14 Tahun (SD/SMP)",
			Category:     "MATH",
			ThumbnailURL: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80",
			IsActive:     true,
			CreatedAt:    now,
		},
		{
			ID:           "EDP-03",
			TenantID:     "tenant-lampung-01",
			Title:        "Calistung Kreatif & Literasi Visual",
			Description:  "Membaca, menulis, dan berhitung dengan dongeng petualangan untuk usia dini.",
			AgeGroup:     "4-6 Tahun (TK/PAUD)",
			Category:     "CREATIVE",
			ThumbnailURL: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=600&q=80",
			IsActive:     true,
			CreatedAt:    now,
		},
		{
			ID:           "EDP-04",
			TenantID:     "tenant-lampung-01",
			Title:        "Ottodot Roblox Science & Galaxy Quests",
			Description:  "Eksplorasi gravitasi, tata surya, dan sirkuit listrik dalam 200+ game sains 3D Roblox.",
			AgeGroup:     "7-13 Tahun (SD/SMP)",
			Category:     "SCIENCE_ROBLOX",
			ThumbnailURL: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
			IsActive:     true,
			CreatedAt:    now,
		},
	}

	r.memClasses["EDC-01"] = domain.ClassSession{
		ID:             "EDC-01",
		TenantID:       "tenant-lampung-01",
		ProgramID:      "EDP-01",
		ProgramTitle:   "Logika & Koding Anak (Roblox & Scratch)",
		TeacherID:      "TCH-01",
		TeacherName:    "Kak Fikri Ramadhan (Lead Instructor)",
		ScheduleTime:   "Sabtu & Minggu, 09:00 - 10:30 WIB",
		MaxSeats:       10,
		BookedSeats:    7,
		AvailableSeats: 3,
		Price:          350000,
		SessionLink:    "https://meet.google.com/abc-edtech-01",
		Status:         "ACTIVE",
		CreatedAt:      now,
	}

	r.memClasses["EDC-02"] = domain.ClassSession{
		ID:             "EDC-02",
		TenantID:       "tenant-lampung-01",
		ProgramID:      "EDP-02",
		ProgramTitle:   "Matematika Interaktif & Problem Solving",
		TeacherID:      "TCH-02",
		TeacherName:    "Kak Sarah Azhari (Math Specialist)",
		ScheduleTime:   "Selasa & Kamis, 16:00 - 17:30 WIB",
		MaxSeats:       8,
		BookedSeats:    6,
		AvailableSeats: 2,
		Price:          300000,
		SessionLink:    "https://meet.google.com/def-edtech-02",
		Status:         "ACTIVE",
		CreatedAt:      now,
	}

	r.memClasses["EDC-03"] = domain.ClassSession{
		ID:             "EDC-03",
		TenantID:       "tenant-lampung-01",
		ProgramID:      "EDP-04",
		ProgramTitle:   "Ottodot Roblox Science & Galaxy Quests",
		TeacherID:      "TCH-03",
		TeacherName:    "Coach Randy Pratama (Roblox Mentor)",
		ScheduleTime:   "Jumat, 15:30 - 17:00 WIB",
		MaxSeats:       12,
		BookedSeats:    4,
		AvailableSeats: 8,
		Price:          450000,
		SessionLink:    "https://meet.google.com/ghi-edtech-03",
		Status:         "ACTIVE",
		CreatedAt:      now,
	}

	r.memClasses["EDC-04"] = domain.ClassSession{
		ID:             "EDC-04",
		TenantID:       "tenant-lampung-01",
		ProgramID:      "EDP-03",
		ProgramTitle:   "Calistung Kreatif & Literasi Visual",
		TeacherID:      "TCH-02",
		TeacherName:    "Kak Sarah Azhari (Early Childhood)",
		ScheduleTime:   "Rabu, 10:00 - 11:30 WIB",
		MaxSeats:       6,
		BookedSeats:    6,
		AvailableSeats: 0,
		Price:          250000,
		SessionLink:    "https://meet.google.com/jkl-edtech-04",
		Status:         "FULL",
		CreatedAt:      now,
	}

	r.memEnrollments["EDE-01"] = domain.Enrollment{
		ID:               "EDE-01",
		TenantID:         "tenant-lampung-01",
		ClassID:          "EDC-01",
		ProgramTitle:     "Logika & Koding Anak (Roblox & Scratch)",
		ScheduleTime:     "Sabtu & Minggu, 09:00 - 10:30 WIB",
		StudentID:        "STU-01",
		StudentName:      "Kenzo Al-Ghifari (9 thn)",
		ParentID:         "PAR-01",
		ParentName:       "Budi Santoso",
		ParentPhone:      "0812-7890-1234",
		Status:           "CONFIRMED",
		PaymentReference: "INV/2026/09/EDT-001",
		EnrolledAt:       now.Add(-48 * time.Hour),
	}

	r.memHomeworkLogs = append(r.memHomeworkLogs, domain.HomeworkLog{
		ID:              "EDH-01",
		EnrollmentID:    "EDE-01",
		Title:           "Misi Loop & Algoritma Labirin Roblox",
		Score:           95,
		TeacherFeedback: "Kenzo sangat cepat memahami konsep perulangan bertingkat. Logika berpikirnya sangat rapi!",
		CreatedAt:       now.Add(-24 * time.Hour),
	})

	r.memSummaries = append(r.memSummaries, domain.WeeklySummary{
		ID:                 "EDS-01",
		StudentID:          "STU-01",
		StudentName:        "Kenzo Al-Ghifari",
		WeekNumber:         38,
		AIGeneratedSummary: "🌟 Evaluasi Mingguan Kenzo: Minggu ini Kenzo menunjukkan kemajuan luar biasa dalam sesi Koding & Sains Roblox! Ia berhasil memecahkan 3 tantangan algoritma perulangan.",
		RawTeacherNotes:    "Kenzo sangat fokus, nilai kuis 95, aktif bertanya saat simulasi loop Roblox.",
		ConceptsMastered:   []string{"Looping Algorithms", "Planetary Gravity", "Sequential Logic"},
		CreatedAt:          now.Add(-12 * time.Hour),
	})
}

func (r *postgresEdutechRepo) GetPrograms(ctx context.Context, tenantID string) ([]domain.Program, error) {
	if r.db != nil {
		query := `SELECT id, tenant_id, title, description, age_group, category, COALESCE(thumbnail_url, ''), is_active, created_at 
		          FROM edutech_programs WHERE is_active = TRUE ORDER BY created_at ASC`
		rows, err := r.db.QueryContext(ctx, query)
		if err == nil {
			defer rows.Close()
			var list []domain.Program
			for rows.Next() {
				var p domain.Program
				if err := rows.Scan(&p.ID, &p.TenantID, &p.Title, &p.Description, &p.AgeGroup, &p.Category, &p.ThumbnailURL, &p.IsActive, &p.CreatedAt); err == nil {
					list = append(list, p)
				}
			}
			if len(list) > 0 {
				return list, nil
			}
		}
	}

	r.mu.RLock()
	defer r.mu.RUnlock()
	return r.memPrograms, nil
}

func (r *postgresEdutechRepo) GetClasses(ctx context.Context, tenantID, programID string) ([]domain.ClassSession, error) {
	if r.db != nil {
		query := `SELECT c.id, c.tenant_id, c.program_id, p.title, c.teacher_id, c.teacher_name, c.schedule_time, 
		                 c.max_seats, c.booked_seats, c.price, COALESCE(c.session_link, ''), c.status, c.created_at
		          FROM edutech_classes c
		          LEFT JOIN edutech_programs p ON c.program_id = p.id
		          WHERE ($1 = '' OR c.program_id = $1)
		          ORDER BY c.schedule_time ASC`
		rows, err := r.db.QueryContext(ctx, query, programID)
		if err == nil {
			defer rows.Close()
			var list []domain.ClassSession
			for rows.Next() {
				var c domain.ClassSession
				if err := rows.Scan(&c.ID, &c.TenantID, &c.ProgramID, &c.ProgramTitle, &c.TeacherID, &c.TeacherName, 
					&c.ScheduleTime, &c.MaxSeats, &c.BookedSeats, &c.Price, &c.SessionLink, &c.Status, &c.CreatedAt); err == nil {
					c.AvailableSeats = c.MaxSeats - c.BookedSeats
					if c.AvailableSeats < 0 {
						c.AvailableSeats = 0
					}
					list = append(list, c)
				}
			}
			if len(list) > 0 {
				return list, nil
			}
		}
	}

	r.mu.RLock()
	defer r.mu.RUnlock()
	var result []domain.ClassSession
	for _, c := range r.memClasses {
		if programID == "" || c.ProgramID == programID {
			c.AvailableSeats = c.MaxSeats - c.BookedSeats
			result = append(result, c)
		}
	}
	return result, nil
}

func (r *postgresEdutechRepo) GetClassByID(ctx context.Context, classID string) (*domain.ClassSession, error) {
	if r.db != nil {
		query := `SELECT c.id, c.tenant_id, c.program_id, p.title, c.teacher_id, c.teacher_name, c.schedule_time, 
		                 c.max_seats, c.booked_seats, c.price, COALESCE(c.session_link, ''), c.status, c.created_at
		          FROM edutech_classes c
		          LEFT JOIN edutech_programs p ON c.program_id = p.id
		          WHERE c.id = $1`
		var c domain.ClassSession
		err := r.db.QueryRowContext(ctx, query, classID).Scan(
			&c.ID, &c.TenantID, &c.ProgramID, &c.ProgramTitle, &c.TeacherID, &c.TeacherName, 
			&c.ScheduleTime, &c.MaxSeats, &c.BookedSeats, &c.Price, &c.SessionLink, &c.Status, &c.CreatedAt,
		)
		if err == nil {
			c.AvailableSeats = c.MaxSeats - c.BookedSeats
			return &c, nil
		}
	}

	r.mu.RLock()
	defer r.mu.RUnlock()
	c, ok := r.memClasses[classID]
	if !ok {
		return nil, ErrClassNotFound
	}
	c.AvailableSeats = c.MaxSeats - c.BookedSeats
	return &c, nil
}

// CreateEnrollmentWithAtomicSeat performs conditional atomic seat increment
func (r *postgresEdutechRepo) CreateEnrollmentWithAtomicSeat(ctx context.Context, enrollment *domain.Enrollment) error {
	if r.db != nil {
		tx, err := r.db.BeginTx(ctx, nil)
		if err != nil {
			return err
		}
		defer tx.Rollback()

		// 1. Concurrency-Safe Conditional Seat Update
		updateQuery := `UPDATE edutech_classes 
		                SET booked_seats = booked_seats + 1 
		                WHERE id = $1 AND booked_seats < max_seats 
		                RETURNING id, booked_seats, max_seats`
		var classID string
		var booked, max int
		err = tx.QueryRowContext(ctx, updateQuery, enrollment.ClassID).Scan(&classID, &booked, &max)
		if err != nil {
			if errors.Is(err, sql.ErrNoRows) {
				return ErrClassFull
			}
			return fmt.Errorf("failed to increment class seat: %w", err)
		}

		// Update status to FULL if booked reaches max
		if booked >= max {
			_, _ = tx.ExecContext(ctx, `UPDATE edutech_classes SET status = 'FULL' WHERE id = $1`, enrollment.ClassID)
		}

		// 2. Insert Enrollment Record
		insertQuery := `INSERT INTO edutech_enrollments (id, tenant_id, class_id, student_id, student_name, parent_id, parent_name, parent_phone, status, payment_reference, enrolled_at)
		                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`
		_, err = tx.ExecContext(ctx, insertQuery, 
			enrollment.ID, enrollment.TenantID, enrollment.ClassID, enrollment.StudentID, enrollment.StudentName,
			enrollment.ParentID, enrollment.ParentName, enrollment.ParentPhone, enrollment.Status, enrollment.PaymentReference, enrollment.EnrolledAt,
		)
		if err != nil {
			return fmt.Errorf("failed to insert enrollment: %w", err)
		}

		return tx.Commit()
	}

	// In-memory fallback
	r.mu.Lock()
	defer r.mu.Unlock()

	class, ok := r.memClasses[enrollment.ClassID]
	if !ok {
		return ErrClassNotFound
	}
	if class.BookedSeats >= class.MaxSeats {
		return ErrClassFull
	}

	class.BookedSeats++
	if class.BookedSeats >= class.MaxSeats {
		class.Status = "FULL"
	}
	class.AvailableSeats = class.MaxSeats - class.BookedSeats
	r.memClasses[enrollment.ClassID] = class

	enrollment.ProgramTitle = class.ProgramTitle
	enrollment.ScheduleTime = class.ScheduleTime
	r.memEnrollments[enrollment.ID] = *enrollment
	return nil
}

func (r *postgresEdutechRepo) GetEnrollmentsByParent(ctx context.Context, parentID string) ([]domain.Enrollment, error) {
	if r.db != nil {
		query := `SELECT e.id, e.tenant_id, e.class_id, p.title, c.schedule_time, e.student_id, e.student_name, 
		                 e.parent_id, e.parent_name, e.parent_phone, e.status, e.payment_reference, e.enrolled_at
		          FROM edutech_enrollments e
		          JOIN edutech_classes c ON e.class_id = c.id
		          JOIN edutech_programs p ON c.program_id = p.id
		          WHERE ($1 = '' OR e.parent_id = $1)
		          ORDER BY e.enrolled_at DESC`
		rows, err := r.db.QueryContext(ctx, query, parentID)
		if err == nil {
			defer rows.Close()
			var list []domain.Enrollment
			for rows.Next() {
				var e domain.Enrollment
				if err := rows.Scan(&e.ID, &e.TenantID, &e.ClassID, &e.ProgramTitle, &e.ScheduleTime, &e.StudentID, 
					&e.StudentName, &e.ParentID, &e.ParentName, &e.ParentPhone, &e.Status, &e.PaymentReference, &e.EnrolledAt); err == nil {
					list = append(list, e)
				}
			}
			if len(list) > 0 {
				return list, nil
			}
		}
	}

	r.mu.RLock()
	defer r.mu.RUnlock()
	var list []domain.Enrollment
	for _, e := range r.memEnrollments {
		if parentID == "" || e.ParentID == parentID {
			list = append(list, e)
		}
	}
	return list, nil
}

func (r *postgresEdutechRepo) GetEnrollmentsByClass(ctx context.Context, classID string) ([]domain.Enrollment, error) {
	if r.db != nil {
		query := `SELECT e.id, e.tenant_id, e.class_id, p.title, c.schedule_time, e.student_id, e.student_name, 
		                 e.parent_id, e.parent_name, e.parent_phone, e.status, e.payment_reference, e.enrolled_at
		          FROM edutech_enrollments e
		          JOIN edutech_classes c ON e.class_id = c.id
		          JOIN edutech_programs p ON c.program_id = p.id
		          WHERE e.class_id = $1`
		rows, err := r.db.QueryContext(ctx, query, classID)
		if err == nil {
			defer rows.Close()
			var list []domain.Enrollment
			for rows.Next() {
				var e domain.Enrollment
				if err := rows.Scan(&e.ID, &e.TenantID, &e.ClassID, &e.ProgramTitle, &e.ScheduleTime, &e.StudentID, 
					&e.StudentName, &e.ParentID, &e.ParentName, &e.ParentPhone, &e.Status, &e.PaymentReference, &e.EnrolledAt); err == nil {
					list = append(list, e)
				}
			}
			return list, nil
		}
	}

	r.mu.RLock()
	defer r.mu.RUnlock()
	var list []domain.Enrollment
	for _, e := range r.memEnrollments {
		if e.ClassID == classID {
			list = append(list, e)
		}
	}
	return list, nil
}

func (r *postgresEdutechRepo) GetHomeworkLogs(ctx context.Context, enrollmentID string) ([]domain.HomeworkLog, error) {
	if r.db != nil {
		query := `SELECT id, enrollment_id, title, score, COALESCE(teacher_feedback, ''), completed_at, created_at 
		          FROM edutech_homework_logs 
		          WHERE ($1 = '' OR enrollment_id = $1)
		          ORDER BY created_at DESC`
		rows, err := r.db.QueryContext(ctx, query, enrollmentID)
		if err == nil {
			defer rows.Close()
			var list []domain.HomeworkLog
			for rows.Next() {
				var h domain.HomeworkLog
				if err := rows.Scan(&h.ID, &h.EnrollmentID, &h.Title, &h.Score, &h.TeacherFeedback, &h.CompletedAt, &h.CreatedAt); err == nil {
					list = append(list, h)
				}
			}
			if len(list) > 0 {
				return list, nil
			}
		}
	}

	r.mu.RLock()
	defer r.mu.RUnlock()
	var list []domain.HomeworkLog
	for _, h := range r.memHomeworkLogs {
		if enrollmentID == "" || h.EnrollmentID == enrollmentID {
			list = append(list, h)
		}
	}
	return list, nil
}

func (r *postgresEdutechRepo) CreateHomeworkLog(ctx context.Context, log *domain.HomeworkLog) error {
	if r.db != nil {
		query := `INSERT INTO edutech_homework_logs (id, enrollment_id, title, score, teacher_feedback, completed_at, created_at)
		          VALUES ($1, $2, $3, $4, $5, $6, $7)`
		_, err := r.db.ExecContext(ctx, query, log.ID, log.EnrollmentID, log.Title, log.Score, log.TeacherFeedback, log.CompletedAt, log.CreatedAt)
		if err == nil {
			return nil
		}
	}

	r.mu.Lock()
	defer r.mu.Unlock()
	r.memHomeworkLogs = append([]domain.HomeworkLog{*log}, r.memHomeworkLogs...)
	return nil
}

func (r *postgresEdutechRepo) GetWeeklySummaries(ctx context.Context, studentID string) ([]domain.WeeklySummary, error) {
	if r.db != nil {
		query := `SELECT id, student_id, week_number, ai_generated_summary, COALESCE(raw_teacher_notes, ''), concepts_mastered, created_at 
		          FROM edutech_weekly_summaries 
		          WHERE ($1 = '' OR student_id = $1)
		          ORDER BY week_number DESC, created_at DESC`
		rows, err := r.db.QueryContext(ctx, query, studentID)
		if err == nil {
			defer rows.Close()
			var list []domain.WeeklySummary
			for rows.Next() {
				var s domain.WeeklySummary
				var conceptsJSON []byte
				if err := rows.Scan(&s.ID, &s.StudentID, &s.WeekNumber, &s.AIGeneratedSummary, &s.RawTeacherNotes, &conceptsJSON, &s.CreatedAt); err == nil {
					_ = json.Unmarshal(conceptsJSON, &s.ConceptsMastered)
					list = append(list, s)
				}
			}
			if len(list) > 0 {
				return list, nil
			}
		}
	}

	r.mu.RLock()
	defer r.mu.RUnlock()
	var list []domain.WeeklySummary
	for _, s := range r.memSummaries {
		if studentID == "" || s.StudentID == studentID {
			list = append(list, s)
		}
	}
	return list, nil
}

func (r *postgresEdutechRepo) CreateWeeklySummary(ctx context.Context, summary *domain.WeeklySummary) error {
	conceptsJSON, _ := json.Marshal(summary.ConceptsMastered)
	if r.db != nil {
		query := `INSERT INTO edutech_weekly_summaries (id, student_id, week_number, ai_generated_summary, raw_teacher_notes, concepts_mastered, created_at)
		          VALUES ($1, $2, $3, $4, $5, $6, $7)`
		_, err := r.db.ExecContext(ctx, query, summary.ID, summary.StudentID, summary.WeekNumber, summary.AIGeneratedSummary, summary.RawTeacherNotes, conceptsJSON, summary.CreatedAt)
		if err == nil {
			return nil
		}
	}

	r.mu.Lock()
	defer r.mu.Unlock()
	r.memSummaries = append([]domain.WeeklySummary{*summary}, r.memSummaries...)
	return nil
}

func (r *postgresEdutechRepo) GetAdminCapacity(ctx context.Context, tenantID string) (*domain.AdminCapacityReport, error) {
	classes, err := r.GetClasses(ctx, tenantID, "")
	if err != nil {
		return nil, err
	}

	report := &domain.AdminCapacityReport{
		TotalClasses: len(classes),
		Classes:      classes,
	}

	progMap := make(map[string]bool)
	for _, c := range classes {
		progMap[c.ProgramID] = true
		report.TotalSeats += c.MaxSeats
		report.BookedSeats += c.BookedSeats
		if c.Status == "ACTIVE" {
			report.ActiveBatches++
		}
	}
	report.TotalPrograms = len(progMap)
	if report.TotalSeats > 0 {
		report.OccupancyRate = float64(report.BookedSeats) / float64(report.TotalSeats) * 100
	}

	return report, nil
}

// Suppress unused import warning
var _ = pq.Array
