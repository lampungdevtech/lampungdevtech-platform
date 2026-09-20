package http

import (
	"fmt"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/lampungdevtech/backend/internal/core/domain"
	"github.com/lampungdevtech/backend/internal/core/ports"
	"github.com/lampungdevtech/backend/pkg/response"
	"github.com/lampungdevtech/backend/pkg/turnstile"
)

type AuthHandler struct {
	authService ports.AuthService
	verifier    turnstile.Verifier
}

func NewAuthHandler(authService ports.AuthService, verifier turnstile.Verifier) *AuthHandler {
	return &AuthHandler{
		authService: authService,
		verifier:    verifier,
	}
}

// CashierLogin handles POST /api/v1/pos/auth/login
// Kasir masuk dengan email dan PIN 6-digit unik yang divalidasi Cloudflare Turnstile anti-bot
func (h *AuthHandler) CashierLogin(c *fiber.Ctx) error {
	var req domain.StaffLoginRequest
	if err := c.BodyParser(&req); err != nil {
		return response.BadRequest(c, "Payload permintaan tidak valid", err.Error())
	}

	if req.Email == "" || req.PIN == "" || req.BranchID == "" {
		return response.BadRequest(c, "Email, Branch ID, dan PIN 6-digit wajib diisi", nil)
	}

	// 1. Verifikasi Cloudflare Turnstile token untuk mencegah bot brute-force & payload tampering
	if h.verifier != nil {
		clientIP := c.IP()
		if xff := c.Get("X-Forwarded-For"); xff != "" {
			clientIP = strings.TrimSpace(strings.Split(xff, ",")[0])
		}

		valid, err := h.verifier.Verify(c.Context(), req.TurnstileToken, clientIP)
		if !valid || err != nil {
			errMsg := "Verifikasi Cloudflare Turnstile gagal"
			if err != nil {
				errMsg = fmt.Sprintf("Verifikasi Cloudflare Turnstile gagal: %v", err)
			}
			return response.Forbidden(c, errMsg)
		}
	}

	res, err := h.authService.StaffLogin(c.Context(), req)
	if err != nil {
		return response.Unauthorized(c, err.Error())
	}

	return response.OK(c, "Autentikasi kasir berhasil", res)
}

