package http

import (
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/lampungdevtech/backend/pkg/response"
)

func JWTMiddleware(jwtSecret string) fiber.Handler {
	secretBytes := []byte(jwtSecret)

	return func(c *fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return response.Unauthorized(c, "Header Authorization diperlukan")
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			return response.Unauthorized(c, "Format token invalid (gunakan: Bearer <token>)")
		}

		tokenStr := parts[1]
		token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fiber.ErrUnauthorized
			}
			return secretBytes, nil
		})

		if err != nil || !token.Valid {
			return response.Unauthorized(c, "Token kedaluwarsa atau tidak sah")
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			return response.Unauthorized(c, "Token claims tidak dapat diproses")
		}

		// Inject claims into context
		c.Locals("staff_id", claims["sub"])
		c.Locals("email", claims["email"])
		c.Locals("role", claims["role"])
		c.Locals("merchant_id", claims["merchant_id"])
		c.Locals("branch_id", claims["branch_id"])

		return c.Next()
	}
}

// RequireRoles membatasi akses endpoint hanya untuk role tertentu
func RequireRoles(allowedRoles ...string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		userRole, _ := c.Locals("role").(string)
		if userRole == "" {
			return response.Unauthorized(c, "Otentikasi diperlukan")
		}

		for _, role := range allowedRoles {
			if userRole == role {
				return c.Next()
			}
		}

		return response.Forbidden(c, "Anda tidak memiliki wewenang (role) untuk mengakses resource ini")
	}
}

// OwnerOrServiceAuthMiddleware memverifikasi Bearer JWT atau X-Internal-Secret untuk proteksi data Owner & BI
func OwnerOrServiceAuthMiddleware(jwtSecret string, internalSecret ...string) fiber.Handler {
	secretBytes := []byte(jwtSecret)
	serviceSecret := ""
	if len(internalSecret) > 0 {
		serviceSecret = internalSecret[0]
	}

	return func(c *fiber.Ctx) error {
		// 1. Cek jika request berasal dari internal service/BFF terpercaya (Next.js proxy)
		if serviceSecret != "" {
			providedServiceKey := c.Get("X-Internal-Secret")
			if providedServiceKey != "" && providedServiceKey == serviceSecret {
				c.Locals("role", "INTERNAL_SERVICE")
				return c.Next()
			}
		}

		// 2. Cek Bearer JWT Authorization
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return response.Unauthorized(c, "Otentikasi diperlukan: Header Authorization atau X-Internal-Secret wajib disertakan")
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			return response.Unauthorized(c, "Format token invalid (gunakan: Bearer <token>)")
		}

		tokenStr := parts[1]
		token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fiber.ErrUnauthorized
			}
			return secretBytes, nil
		})

		if err != nil || !token.Valid {
			return response.Unauthorized(c, "Token kedaluwarsa atau tidak sah")
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			return response.Unauthorized(c, "Token claims tidak dapat diproses")
		}

		// Inject claims into context
		c.Locals("staff_id", claims["sub"])
		c.Locals("email", claims["email"])
		c.Locals("role", claims["role"])
		c.Locals("merchant_id", claims["merchant_id"])
		c.Locals("branch_id", claims["branch_id"])

		return c.Next()
	}
}


