package http

import (
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
)

type RouterConfig struct {
	AuthHandler  *AuthHandler
	ShiftHandler *ShiftHandler
	OrderHandler *OrderHandler
	JWTSecret    string
}

func SetupRouter(app *fiber.App, cfg RouterConfig) {
	// Global Middlewares
	app.Use(recover.New())
	app.Use(logger.New(logger.Config{
		Format: "[${time}] ${status} - ${latency} ${method} ${path}\n",
	}))
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
		AllowMethods: "GET, POST, PUT, PATCH, DELETE, OPTIONS",
	}))

	// Health check endpoint (for K8s liveness & readiness probe)
	app.Get("/healthz", func(c *fiber.Ctx) error {
		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"status":  "healthy",
			"service": "lampungdevtech-pos-backend",
		})
	})

	api := app.Group("/api/v1/pos")

	// Public Routes
	api.Post("/auth/login", cfg.AuthHandler.CashierLogin)

	// Protected Routes (Kasir & Staff)
	protected := api.Group("", JWTMiddleware(cfg.JWTSecret))

	// Shift Management
	protected.Post("/shifts/open", cfg.ShiftHandler.OpenShift)
	protected.Post("/shifts/close", cfg.ShiftHandler.CloseShift)
	protected.Get("/shifts/active", cfg.ShiftHandler.GetActiveShift)

	// Order & Transactions
	protected.Post("/orders", cfg.OrderHandler.CreateOrder)
	protected.Post("/orders/sync", cfg.OrderHandler.SyncBatchOrders)
	protected.Get("/orders/:id", cfg.OrderHandler.GetOrderByID)
	protected.Get("/orders", cfg.OrderHandler.GetBranchOrders)
}
