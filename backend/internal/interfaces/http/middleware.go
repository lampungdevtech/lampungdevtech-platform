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
