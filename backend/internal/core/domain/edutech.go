package domain

import "time"

// Program represents an EdTech / Bimbel learning track or curriculum
type Program struct {
	ID           string    `json:"id"`
	TenantID     string    `json:"tenantId"`
	Title        string    `json:"title"`
	Description  string    `json:"description"`
	AgeGroup     string    `json:"ageGroup"`
	Category     string    `json:"category"` // CODING, MATH, SCIENCE_ROBLOX, CREATIVE
	ThumbnailURL string    `json:"thumbnailUrl"`
	IsActive     bool      `json:"isActive"`
	CreatedAt    time.Time `json:"createdAt"`
}

// ClassSession represents a scheduled learning batch with capacity constraints
type ClassSession struct {
	ID             string    `json:"id"`
	TenantID       string    `json:"tenantId"`
	ProgramID      string    `json:"programId"`
	ProgramTitle   string    `json:"programTitle,omitempty"`
	TeacherID      string    `json:"teacherId"`
	TeacherName    string    `json:"teacherName"`
	ScheduleTime   string    `json:"scheduleTime"`
	MaxSeats       int       `json:"maxSeats"`
	BookedSeats    int       `json:"bookedSeats"`
	AvailableSeats int       `json:"availableSeats"`
	Price          float64   `json:"price"`
	SessionLink    string    `json:"sessionLink,omitempty"`
	Status         string    `json:"status"` // ACTIVE, FULL, COMPLETED
	CreatedAt      time.Time `json:"createdAt"`
}

// Enrollment represents a student's registration in a class session
type Enrollment struct {
	ID               string    `json:"id"`
	TenantID         string    `json:"tenantId"`
	ClassID          string    `json:"classId"`
	ProgramTitle     string    `json:"programTitle,omitempty"`
	ScheduleTime     string    `json:"scheduleTime,omitempty"`
	StudentID        string    `json:"studentId"`
	StudentName      string    `json:"studentName"`
	ParentID         string    `json:"parentId"`
	ParentName       string    `json:"parentName"`
	ParentPhone      string    `json:"parentPhone"`
	Status           string    `json:"status"` // PENDING, CONFIRMED, CANCELLED
	PaymentReference string    `json:"paymentReference"`
	EnrolledAt       time.Time `json:"enrolledAt"`
}

// HomeworkLog represents a student's quest/assignment completion and score
type HomeworkLog struct {
	ID              string     `json:"id"`
	EnrollmentID    string     `json:"enrollmentId"`
	Title           string     `json:"title"`
	Score           int        `json:"score"`
	TeacherFeedback string     `json:"teacherFeedback"`
	CompletedAt     *time.Time `json:"completedAt,omitempty"`
	CreatedAt       time.Time  `json:"createdAt"`
}

// WeeklySummary represents AI synthesized progress report for parents
type WeeklySummary struct {
	ID                 string    `json:"id"`
	StudentID          string    `json:"studentId"`
	StudentName        string    `json:"studentName,omitempty"`
	WeekNumber         int       `json:"weekNumber"`
	AIGeneratedSummary string    `json:"aiGeneratedSummary"`
	RawTeacherNotes    string    `json:"rawTeacherNotes"`
	ConceptsMastered   []string  `json:"conceptsMastered"`
	CreatedAt          time.Time `json:"createdAt"`
}

// DTO Requests & Responses
type EnrollRequest struct {
	TenantID    string `json:"tenantId"`
	ClassID     string `json:"classId"`
	StudentID   string `json:"studentId,omitempty"`
	StudentName string `json:"studentName"`
	ParentID    string `json:"parentId"`
	ParentName  string `json:"parentName"`
	ParentPhone string `json:"parentPhone"`
}

type TeacherAttendanceRequest struct {
	ClassID      string `json:"classId"`
	StudentID    string `json:"studentId"`
	Status       string `json:"status"` // PRESENT, PERMIT, ABSENT
	TopicCovered string `json:"topicCovered"`
	Notes        string `json:"notes,omitempty"`
}

type TeacherHomeworkRequest struct {
	EnrollmentID    string `json:"enrollmentId"`
	Title           string `json:"title"`
	Score           int    `json:"score"`
	TeacherFeedback string `json:"teacherFeedback"`
}

type AIProgressRequest struct {
	StudentID     string   `json:"studentId"`
	StudentName   string   `json:"studentName"`
	WeekNumber    int      `json:"weekNumber"`
	TeacherNotes  string   `json:"teacherNotes"`
	HomeworkScore int      `json:"homeworkScore"`
	Concepts      []string `json:"concepts"`
}

type AIProgressResponse struct {
	StudentID          string   `json:"studentId"`
	Summary            string   `json:"summary"`
	ConceptsMastered   []string `json:"conceptsMastered"`
	EncouragementTip   string   `json:"encouragementTip"`
}

type AdminCapacityReport struct {
	TotalPrograms int            `json:"totalPrograms"`
	TotalClasses  int            `json:"totalClasses"`
	TotalSeats    int            `json:"totalSeats"`
	BookedSeats   int            `json:"bookedSeats"`
	OccupancyRate float64        `json:"occupancyRate"`
	ActiveBatches int            `json:"activeBatches"`
	Classes       []ClassSession `json:"classes"`
}
