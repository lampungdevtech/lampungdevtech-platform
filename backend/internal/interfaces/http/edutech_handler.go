package http

import (
	"errors"

	"github.com/gofiber/fiber/v2"
	"github.com/lampungdevtech/backend/internal/core/domain"
	"github.com/lampungdevtech/backend/internal/core/ports"
	"github.com/lampungdevtech/backend/internal/infrastructures/repositories"
)

type EdutechHandler struct {
	service ports.EdutechService
	aiSvc   ports.AISummarizerService
}

func NewEdutechHandler(service ports.EdutechService, aiSvc ports.AISummarizerService) *EdutechHandler {
	return &EdutechHandler{
		service: service,
		aiSvc:   aiSvc,
	}
}

// GetPrograms returns active educational curriculums
func (h *EdutechHandler) GetPrograms(c *fiber.Ctx) error {
	tenantID := c.Query("tenantId", "tenant-lampung-01")
	programs, err := h.service.ListPrograms(c.Context(), tenantID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}
	return c.JSON(fiber.Map{
		"status":   "success",
		"programs": programs,
	})
}

// GetClasses returns scheduled batches and seat capacities
func (h *EdutechHandler) GetClasses(c *fiber.Ctx) error {
	tenantID := c.Query("tenantId", "tenant-lampung-01")
	programID := c.Query("programId", "")
	classes, err := h.service.ListClasses(c.Context(), tenantID, programID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}
	return c.JSON(fiber.Map{
		"status":  "success",
		"classes": classes,
	})
}

// Enroll handles self-serve booking with distributed slot locking
func (h *EdutechHandler) Enroll(c *fiber.Ctx) error {
	var req domain.EnrollRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Format request tidak valid: " + err.Error(),
		})
	}

	enrollment, err := h.service.EnrollStudentWithSlotLock(c.Context(), req)
	if err != nil {
		if errors.Is(err, repositories.ErrClassFull) {
			return c.Status(fiber.StatusConflict).JSON(fiber.Map{
				"error":   "Kuota kursi kelas ini sudah penuh! Silakan pilih jadwal batch lain.",
				"code":    "CLASS_FULL",
			})
		}
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"status":     "success",
		"message":    "Pendaftaran kelas berhasil dikonfirmasi!",
		"enrollment": enrollment,
	})
}

// GetParentDashboard returns enrolled children, homework quests, and AI weekly summaries
func (h *EdutechHandler) GetParentDashboard(c *fiber.Ctx) error {
	parentID := c.Params("parentId")
	data, err := h.service.GetParentDashboard(c.Context(), parentID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}
	return c.JSON(fiber.Map{
		"status": "success",
		"data":   data,
	})
}

// RecordAttendance handles teacher attendance submission
func (h *EdutechHandler) RecordAttendance(c *fiber.Ctx) error {
	var req domain.TeacherAttendanceRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid attendance request payload",
		})
	}

	if err := h.service.RecordAttendance(c.Context(), req); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"status":  "success",
		"message": "Presensi murid berhasil dicatat!",
	})
}

// SubmitHomework handles assignment evaluation
func (h *EdutechHandler) SubmitHomework(c *fiber.Ctx) error {
	var req domain.TeacherHomeworkRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid homework request payload",
		})
	}

	if err := h.service.SubmitHomework(c.Context(), req); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"status":  "success",
		"message": "Evaluasi tugas murid berhasil disimpan!",
	})
}

// GenerateAISummary triggers Gemini / intelligent child-friendly progress summarizer
func (h *EdutechHandler) GenerateAISummary(c *fiber.Ctx) error {
	var req domain.AIProgressRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid AI summary request payload",
		})
	}

	res, err := h.aiSvc.GenerateWeeklySummary(c.Context(), req)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"status": "success",
		"data":   res,
	})
}

// GetAdminCapacity returns batch capacity quotas and occupancy rates
func (h *EdutechHandler) GetAdminCapacity(c *fiber.Ctx) error {
	tenantID := c.Query("tenantId", "tenant-lampung-01")
	report, err := h.service.GetAdminCapacity(c.Context(), tenantID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"status": "success",
		"report": report,
	})
}
