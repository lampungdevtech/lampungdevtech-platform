package http

import (
	"github.com/gofiber/fiber/v2"
	"github.com/lampungdevtech/backend/internal/core/domain"
	"github.com/lampungdevtech/backend/internal/core/ports"
	"github.com/lampungdevtech/backend/pkg/response"
)

type ShiftHandler struct {
	shiftService ports.ShiftService
}

func NewShiftHandler(shiftService ports.ShiftService) *ShiftHandler {
	return &ShiftHandler{shiftService: shiftService}
}

// OpenShift handles POST /api/v1/pos/shifts/open
func (h *ShiftHandler) OpenShift(c *fiber.Ctx) error {
	var req domain.OpenShiftRequest
	if err := c.BodyParser(&req); err != nil {
		return response.BadRequest(c, "Payload input shift tidak valid", err.Error())
	}

	staffID, _ := c.Locals("staff_id").(string)
	branchID, _ := c.Locals("branch_id").(string)
	merchantID, _ := c.Locals("merchant_id").(string)

	// Wajib timpa dari token JWT untuk mencegah pemalsuan identitas tenant
	req.StaffID = staffID
	req.BranchID = branchID
	req.MerchantID = merchantID

	shift, err := h.shiftService.OpenShift(c.Context(), req)
	if err != nil {
		return response.BadRequest(c, err.Error(), nil)
	}

	return response.Created(c, "Sesi shift kasir berhasil dibuka", shift)
}

// CloseShift handles POST /api/v1/pos/shifts/close
func (h *ShiftHandler) CloseShift(c *fiber.Ctx) error {
	var req domain.CloseShiftRequest
	if err := c.BodyParser(&req); err != nil {
		return response.BadRequest(c, "Payload penutupan shift tidak valid", err.Error())
	}

	if req.ShiftID == "" {
		return response.BadRequest(c, "Shift ID wajib disertakan", nil)
	}

	// Injeksi identitas pemanggil dari JWT
	staffID, _ := c.Locals("staff_id").(string)
	merchantID, _ := c.Locals("merchant_id").(string)
	req.StaffID = staffID
	req.MerchantID = merchantID

	shift, err := h.shiftService.CloseShift(c.Context(), req)
	if err != nil {
		if err.Error() == "akses ditolak: sesi shift ini milik merchant/toko lain" || err.Error() == "akses ditolak: sesi shift ini milik staf kasir lain" {
			return response.Forbidden(c, err.Error())
		}
		return response.BadRequest(c, err.Error(), nil)
	}

	return response.OK(c, "Sesi shift kasir berhasil ditutup", shift)
}

// GetActiveShift handles GET /api/v1/pos/shifts/active
func (h *ShiftHandler) GetActiveShift(c *fiber.Ctx) error {
	staffID, _ := c.Locals("staff_id").(string)
	if staffID == "" {
		return response.BadRequest(c, "Staff ID tidak ditemukan pada token sesi", nil)
	}

	shift, err := h.shiftService.GetActiveShift(c.Context(), staffID)
	if err != nil {
		return response.InternalError(c, "Gagal mengambil data shift", err.Error())
	}

	if shift == nil {
		return response.OK(c, "Tidak ada shift aktif", nil)
	}

	return response.OK(c, "Data shift aktif ditemukan", shift)
}
