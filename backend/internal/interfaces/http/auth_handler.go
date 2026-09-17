package http

import (
	"github.com/gofiber/fiber/v2"
	"github.com/lampungdevtech/backend/internal/core/domain"
	"github.com/lampungdevtech/backend/internal/core/ports"
	"github.com/lampungdevtech/backend/pkg/response"
)

type AuthHandler struct {
	authService ports.AuthService
}

func NewAuthHandler(authService ports.AuthService) *AuthHandler {
	return &AuthHandler{authService: authService}
}

// CashierLogin handles POST /api/v1/pos/auth/login
// Kasir masuk dengan email dan PIN 6-digit unik
func (h *AuthHandler) CashierLogin(c *fiber.Ctx) error {
	var req domain.StaffLoginRequest
	if err := c.BodyParser(&req); err != nil {
		return response.BadRequest(c, "Payload permintaan tidak valid", err.Error())
	}

	if req.Email == "" || req.PIN == "" || req.BranchID == "" {
		return response.BadRequest(c, "Email, Branch ID, dan PIN 6-digit wajib diisi", nil)
	}

	res, err := h.authService.StaffLogin(c.Context(), req)
	if err != nil {
		return response.Unauthorized(c, err.Error())
	}

	return response.OK(c, "Autentikasi kasir berhasil", res)
}
